/**
 * translationService.ts
 *
 * DOM-level real-time translation — works exactly like Chrome / Firefox's
 * built-in "Translate this page" feature:
 *
 *   1. Walks the DOM tree and collects visible text nodes
 *   2. Translates them via Google's free translate API (same endpoint browsers use)
 *   3. Caches every translation so repeated / navigated-to text is instant
 *   4. Stores originals per-node so switching back to English is instant
 *      with NO page reload
 *   5. A MutationObserver auto-translates new content React renders
 *
 * No iframes, no widgets, no banners, no hardcoded strings.
 */

// ─── types ──────────────────────────────────────────────────────────
type Lang = 'en' | 'ar';

// ─── state ──────────────────────────────────────────────────────────
/** EN text → AR text cache (survives across navigations) */
const cache = new Map<string, string>();

/** Text node → its original English textContent (for clean revert) */
const originals = new WeakMap<Text, string>();

/** Set of nodes we've already translated in this session */
const translated = new Set<Text>();

/** Current language */
let activeLang: Lang = 'en';

/** MutationObserver instance (one at a time) */
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

const CONCURRENT_REQUESTS = 8;

// ─── helpers ────────────────────────────────────────────────────────
function shouldSkip(el: Element | null): boolean {
  if (!el) return true;
  if (SKIP_TAGS.has(el.tagName)) return true;
  if (el.closest('.notranslate, [translate="no"]')) return true;
  return false;
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

/** Translate a single string via Google's free API */
async function apiTranslate(text: string, to: Lang): Promise<string> {
  if (cache.has(text)) return cache.get(text)!;
  try {
    const url =
      `https://translate.googleapis.com/translate_a/single` +
      `?client=gtx&sl=en&tl=${to}&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url);
    if (!res.ok) return text;
    const json = await res.json();
    // Response: [[[translatedChunk, originalChunk], ...], ...]
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

  // 2. Deduplicate strings to minimise API calls
  const unique = new Set<string>();
  for (const node of nodes) {
    const text = (originals.get(node) ?? node.textContent ?? '').trim();
    if (text && !cache.has(text)) unique.add(text);
  }

  // 3. Translate unique strings in parallel (with concurrency limit)
  if (unique.size > 0) {
    const tasks = [...unique].map(
      (text) => () => apiTranslate(text, 'ar'),
    );
    await parallelLimit(tasks, CONCURRENT_REQUESTS);
  }

  // 4. Apply translations to DOM
  for (const node of nodes) {
    if (!node.parentNode) continue; // node was removed from DOM
    const original = originals.get(node) ?? node.textContent ?? '';
    const key = original.trim();
    const translatedText = cache.get(key);
    if (translatedText && translatedText !== key) {
      // Preserve leading/trailing whitespace from the original
      const lead = original.match(/^\s*/)?.[0] ?? '';
      const trail = original.match(/\s*$/)?.[0] ?? '';
      node.textContent = lead + translatedText + trail;
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
    // Debounce: wait 300ms after last mutation to batch-translate
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
