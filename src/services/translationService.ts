/**
 * translationService.ts
 *
 * DOM-level real-time translation — works like Chrome's "Translate this page":
 *
 *   1. Walks the DOM and groups text nodes by their nearest block-level
 *      ancestor so full sentences / paragraphs are translated together
 *      (contextual translation, not word-by-word)
 *   2. Sends grouped text to Google's free translate API with a separator
 *      so the API sees complete sentences and can translate idiomatically
 *   3. Caches every block-level translation for instant repeat visits
 *   4. Stores originals per-node for instant revert to English (no reload)
 *   5. MutationObserver auto-translates new content React renders
 *
 * No iframes, no widgets, no banners, no hardcoded strings.
 */

// ─── types ──────────────────────────────────────────────────────────
type Lang = 'en' | 'ar';

interface TextGroup {
  /** The common block-level ancestor element */
  block: Element;
  /** Text nodes in DOM order within this block */
  nodes: Text[];
}

// ─── state ──────────────────────────────────────────────────────────
/** Full block text (EN) → AR translation cache */
const cache = new Map<string, string>();

/** Text node → its original English textContent (for clean revert) */
const originals = new WeakMap<Text, string>();

/** Set of nodes we've already translated in this session */
const translated = new Set<Text>();

/** Current language */
let activeLang: Lang = 'en';

/** MutationObserver instance */
let observer: MutationObserver | null = null;

/** Debounce timer for observer batching */
let observerTimer: ReturnType<typeof setTimeout> | null = null;

/** Subscribers notified when language changes */
const listeners = new Set<(lang: Lang) => void>();

// ─── config ─────────────────────────────────────────────────────────
const SKIP_TAGS = new Set([
  'SCRIPT', 'STYLE', 'TEXTAREA', 'INPUT', 'CODE', 'PRE',
  'SVG', 'NOSCRIPT', 'IFRAME', 'CANVAS', 'VIDEO', 'AUDIO',
]);

/** Tags that are considered block-level (translation boundaries) */
const BLOCK_TAGS = new Set([
  'DIV', 'P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6',
  'LI', 'TD', 'TH', 'BLOCKQUOTE', 'SECTION', 'ARTICLE',
  'HEADER', 'FOOTER', 'NAV', 'MAIN', 'ASIDE', 'FIGCAPTION',
  'LABEL', 'LEGEND', 'DETAILS', 'SUMMARY', 'OPTION',
  'BUTTON', 'A',
]);

const CONCURRENT_REQUESTS = 6;

/** Separator used to join/split multiple text chunks in one API call */
const SEP = ' |||SEP||| ';
const SEP_REGEX = /\s*\|\|\|SEP\|\|\|\s*/;

// ─── helpers ────────────────────────────────────────────────────────
function shouldSkip(el: Element | null): boolean {
  if (!el) return true;
  if (SKIP_TAGS.has(el.tagName)) return true;
  if (el.closest('.notranslate, [translate="no"]')) return true;
  return false;
}

/** Find the nearest block-level ancestor for a text node */
function getBlockAncestor(node: Text): Element {
  let el: Element | null = node.parentElement;
  while (el) {
    if (BLOCK_TAGS.has(el.tagName)) return el;
    el = el.parentElement;
  }
  return document.body;
}

/** Collect all visible text nodes under `root` */
function collectTextNodes(root: Node): Text[] {
  const nodes: Text[] = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const text = node.textContent?.trim();
      if (!text || text.length === 0) return NodeFilter.FILTER_REJECT;
      if (shouldSkip(node.parentElement)) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  let n: Text | null;
  while ((n = walker.nextNode() as Text | null)) nodes.push(n);
  return nodes;
}

/** Group text nodes by their nearest block-level ancestor */
function groupByBlock(nodes: Text[]): TextGroup[] {
  const map = new Map<Element, Text[]>();
  for (const node of nodes) {
    const block = getBlockAncestor(node);
    if (!map.has(block)) map.set(block, []);
    map.get(block)!.push(node);
  }
  const groups: TextGroup[] = [];
  map.forEach((textNodes, block) => {
    groups.push({ block, nodes: textNodes });
  });
  return groups;
}

/** Translate text via Google's free API (contextual, full sentences) */
async function apiTranslate(text: string, to: Lang): Promise<string> {
  if (cache.has(text)) return cache.get(text)!;
  try {
    const url =
      `https://translate.googleapis.com/translate_a/single` +
      `?client=gtx&sl=en&tl=${to}&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url);
    if (!res.ok) return text;
    const json = await res.json();
    const out = (json[0] as any[])
      .filter(Boolean)
      .map((seg: any) => seg[0])
      .join('');
    cache.set(text, out);
    return out;
  } catch {
    return text;
  }
}

/** Run promises with concurrency cap */
async function parallelLimit<T>(
  tasks: (() => Promise<T>)[],
  limit: number,
): Promise<T[]> {
  const results: T[] = [];
  const executing = new Set<Promise<void>>();
  for (const task of tasks) {
    const p = task().then((r) => {
      results.push(r);
      executing.delete(p);
    });
    executing.add(p);
    if (executing.size >= limit) await Promise.race(executing);
  }
  await Promise.all(executing);
  return results;
}

// ─── core ───────────────────────────────────────────────────────────

/** Translate every text node under `root` (defaults to document.body) */
async function translateDOM(root: Node = document.body): Promise<void> {
  const nodes = collectTextNodes(root);
  if (nodes.length === 0) return;

  // 1. Stash originals
  for (const node of nodes) {
    if (!originals.has(node)) {
      originals.set(node, node.textContent!);
    }
  }

  // 2. Group nodes by block-level ancestor for contextual translation
  const groups = groupByBlock(nodes);

  // 3. Build translation tasks — one API call per group
  //    Each group's text nodes are joined with a separator so the API
  //    sees full context. After translation, we split on the separator
  //    to map results back to individual nodes.
  const uncachedGroups: TextGroup[] = [];
  const groupKeys: string[] = [];

  for (const group of groups) {
    const parts = group.nodes.map(
      (n) => (originals.get(n) ?? n.textContent ?? '').trim()
    );
    const key = parts.join(SEP);
    if (!key) continue;
    if (cache.has(key)) {
      // Already cached — apply immediately
      applyGroupTranslation(group, cache.get(key)!);
    } else {
      uncachedGroups.push(group);
      groupKeys.push(key);
    }
  }

  // 4. Translate uncached groups in parallel
  if (uncachedGroups.length > 0) {
    const tasks = groupKeys.map(
      (key, i) => async () => {
        const result = await apiTranslate(key, 'ar');
        applyGroupTranslation(uncachedGroups[i], result);
      }
    );
    await parallelLimit(tasks, CONCURRENT_REQUESTS);
  }
}

/** Apply a translated group result back to individual text nodes */
function applyGroupTranslation(group: TextGroup, translatedBlock: string): void {
  const parts = translatedBlock.split(SEP_REGEX);

  for (let i = 0; i < group.nodes.length; i++) {
    const node = group.nodes[i];
    if (!node.parentNode) continue;
    const original = originals.get(node) ?? node.textContent ?? '';
    const translatedPart = parts[i];

    if (translatedPart && translatedPart !== original.trim()) {
      const lead = original.match(/^\s*/)?.[0] ?? '';
      const trail = original.match(/\s*$/)?.[0] ?? '';
      node.textContent = lead + translatedPart + trail;
      translated.add(node);
    }
  }
}

/** Restore all translated nodes back to English — no reload */
function restoreDOM(): void {
  translated.forEach((node) => {
    const original = originals.get(node);
    if (original !== undefined && node.parentNode) {
      node.textContent = original;
    }
  });
  translated.clear();
}

// ─── observer (auto-translate new React renders) ────────────────────
function startObserver(): void {
  if (observer) return;
  observer = new MutationObserver(() => {
    if (observerTimer) clearTimeout(observerTimer);
    observerTimer = setTimeout(() => {
      if (activeLang === 'ar') translateDOM();
    }, 300);
  });
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
  });
}

function stopObserver(): void {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
  if (observerTimer) {
    clearTimeout(observerTimer);
    observerTimer = null;
  }
}

// ─── public API ─────────────────────────────────────────────────────
export function getLanguage(): Lang {
  return activeLang;
}

export function onLanguageChange(fn: (lang: Lang) => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export async function setLanguage(lang: Lang): Promise<void> {
  if (lang === activeLang) return;
  activeLang = lang;
  localStorage.setItem('preferred-lang', lang);

  if (lang === 'ar') {
    startObserver();
    await translateDOM();
  } else {
    stopObserver();
    restoreDOM();
  }

  listeners.forEach((fn) => fn(lang));
}

/** Call on app mount to restore previous language choice */
export async function initTranslation(): Promise<void> {
  const saved = localStorage.getItem('preferred-lang') as Lang | null;
  if (saved === 'ar') {
    activeLang = 'en'; // force a change
    await setLanguage('ar');
  }
}
