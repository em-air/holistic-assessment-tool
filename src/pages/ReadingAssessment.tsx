import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, MicOff, Clock, BookOpen, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import FloatingBackground from '../components/FloatingBackground';
import { logger } from '../utils/logger';
import { ROUTES, categoryRoute } from '../routes';
import { ProgressTracker } from '../utils/progressTracker';
import {
  getReadingAssessmentContent,
  type ReadingSeason,
  type ReadingTargetRange,
  type ReadingTargetRateMap,
} from '../services/readingAssessmentService';

// ─── Scoring utilities ────────────────────────────────────────────────────────

const FILLERS = new Set(['um', 'uh', 'er', 'ah']);

function normalise(text: string): string {
  return text.toLowerCase().replace(/[^a-z']/g, ' ').replace(/\s+/g, ' ').trim();
}

function tokenise(text: string): string[] {
  return normalise(text).split(' ').filter(Boolean);
}

function cleanTokens(text: string): string[] {
  const raw = tokenise(text);
  const out: string[] = [];
  for (const t of raw) {
    if (!FILLERS.has(t) && t !== out[out.length - 1]) {
      out.push(t);
    }
  }
  return out;
}

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const row = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    let prev = i;
    for (let j = 1; j <= n; j++) {
      const val =
        a[i - 1] === b[j - 1]
          ? row[j - 1]
          : 1 + Math.min(prev, row[j], row[j - 1]);
      row[j - 1] = prev;
      prev = val;
    }
    row[n] = prev;
  }
  return row[n];
}

function fuzzyMatch(heard: string, expected: string): boolean {
  // Allow ~30% edit distance so minor mispronunciations still count correct
  return levenshtein(heard, expected) <= Math.ceil(expected.length * 0.30);
}

interface WCPMResult {
  wcpm: number;
  correctWords: number;
  wordsAttempted: number;
  accuracy: number;
  matchedPassageWords: number;
  errorLog: Array<{ heard: string; expected: string }>;
}

function calculateWCPM(transcriptText: string, passageText: string, timeElapsed: number): WCPMResult {
  const heard = cleanTokens(transcriptText);
  const passage = tokenise(passageText);

  let pIdx = 0;
  let correctWords = 0;
  const errorLog: Array<{ heard: string; expected: string }> = [];
  let insertionStreak = 0; // consecutive heard words that matched nothing in passage

  for (let i = 0; i < heard.length && pIdx < passage.length; i++) {
    const h = heard[i];

    // Search up to 5 passage words ahead for a match (handles skips)
    let bestSkip = -1;
    for (let skip = 0; skip <= 5 && pIdx + skip < passage.length; skip++) {
      if (fuzzyMatch(h, passage[pIdx + skip])) {
        bestSkip = skip;
        break;
      }
    }

    if (bestSkip === 0) {
      // Direct match
      correctWords++;
      pIdx++;
      insertionStreak = 0;
    } else if (bestSkip > 0) {
      // Match found after skipping some passage words — reader skipped them
      for (let s = 0; s < bestSkip; s++) {
        errorLog.push({ heard: '(skipped)', expected: passage[pIdx + s] });
      }
      correctWords++;
      pIdx += bestSkip + 1;
      insertionStreak = 0;
    } else {
      // No match in window.
      // If the NEXT heard word matches the current passage word, treat this as an
      // insertion (reader added an extra word) — don't advance pIdx or log an error.
      const nextHeardMatchesCurrent =
        i + 1 < heard.length && fuzzyMatch(heard[i + 1], passage[pIdx]);

      if (nextHeardMatchesCurrent) {
        // Insertion: reader said an extra word; skip it silently
        insertionStreak = 0;
      } else {
        // Substitution: reader said the wrong word
        insertionStreak++;
        errorLog.push({ heard: h, expected: passage[pIdx] });
        pIdx++;
        // After 4 consecutive substitutions, try a hard re-sync: scan up to 8
        // passage words ahead for two consecutive matches to recover alignment
        if (insertionStreak >= 4) {
          outer: for (let ahead = 1; ahead <= 8 && pIdx + ahead < passage.length; ahead++) {
            for (let j = i + 1; j < Math.min(i + 3, heard.length); j++) {
              if (
                fuzzyMatch(heard[j], passage[pIdx + ahead]) &&
                j + 1 < heard.length &&
                fuzzyMatch(heard[j + 1], passage[pIdx + ahead + 1])
              ) {
                for (let s = 0; s < ahead; s++) {
                  errorLog.push({ heard: '(skipped)', expected: passage[pIdx + s] });
                }
                pIdx += ahead;
                insertionStreak = 0;
                break outer;
              }
            }
          }
        }
      }
    }
  }

  const wordsAttempted = heard.length;
  const wcpm = timeElapsed > 0 ? Math.round((correctWords / timeElapsed) * 60) : 0;
  const accuracy = wordsAttempted > 0 ? Math.round((correctWords / wordsAttempted) * 100) : 0;

  return { wcpm, correctWords, wordsAttempted, accuracy, matchedPassageWords: pIdx, errorLog };
}

function countMatchedPassageWords(transcriptText: string, passageTokens: string[]): number {
  const heard = cleanTokens(transcriptText);
  let pIdx = 0;
  for (let i = 0; i < heard.length && pIdx < passageTokens.length; i++) {
    const h = heard[i];
    let bestSkip = -1;
    for (let skip = 0; skip <= 5 && pIdx + skip < passageTokens.length; skip++) {
      if (fuzzyMatch(h, passageTokens[pIdx + skip])) { bestSkip = skip; break; }
    }
    if (bestSkip >= 0) {
      pIdx += bestSkip + 1;
    } else {
      const nextMatchesCurrent =
        i + 1 < heard.length && fuzzyMatch(heard[i + 1], passageTokens[pIdx]);
      if (!nextMatchesCurrent) pIdx++;
    }
  }
  return pIdx;
}

function findGradeLevel(
  wcpm: number,
  season: ReadingSeason,
  targetRateMap: ReadingTargetRateMap,
): { grade: number; level: 'Below Target' | 'At Target' | 'Above Target'; targetRange: ReadingTargetRange } {
  // Highest grade where wcpm >= min (At or Above Target)
  for (let grade = 8; grade >= 1; grade--) {
    const range = targetRateMap[grade]?.[season] ?? ([0, 0] as ReadingTargetRange);
    const [min, max] = range;
    if (wcpm >= min) {
      return {
        grade,
        level: wcpm <= max ? 'At Target' : 'Above Target',
        targetRange: range,
      };
    }
  }
  const range = targetRateMap[1]?.[season] ?? ([0, 0] as ReadingTargetRange);
  return { grade: 1, level: 'Below Target', targetRange: range };
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface ReadingResult {
  wcpm: number;
  accuracy: number;
  correctWords: number;
  wordsAttempted: number;
  grade: number;
  season: ReadingSeason;
  level: 'Below Target' | 'At Target' | 'Above Target';
  targetRange: string;
  accuracyConcern: boolean;
  errorLog: Array<{ heard: string; expected: string }>;
  feedback: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

const ReadingAssessment: React.FC = () => {
  const navigate = useNavigate();
  const { categoryId } = useParams();
  const [selectedGrade, setSelectedGrade] = useState<number>(4);
  const [selectedSeason, setSelectedSeason] = useState<ReadingSeason>('Fall');
  const [isRecording, setIsRecording] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<ReadingResult | null>(null);
  const [assessmentState, setAssessmentState] = useState<'setup' | 'ready' | 'countdown' | 'recording' | 'complete'>('setup');
  const [countdown, setCountdown] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [targetRateMap, setTargetRateMap] = useState<ReadingTargetRateMap>({});
  const [isLoadingContent, setIsLoadingContent] = useState(true);
  const [contentError, setContentError] = useState<string | null>(null);
  const [highlightedWordIndex, setHighlightedWordIndex] = useState(0);
  const maxHighlightRef = useRef(0);
  const [showErrorLog, setShowErrorLog] = useState(true);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const currentTranscriptRef = useRef<string>('');
  const currentInterimRef = useRef<string>('');
  const currentTimeLeftRef = useRef<number>(60);
  const passageTokensRef = useRef<string[]>([]);

  const getTargetRange = (grade: number, season: ReadingSeason): ReadingTargetRange =>
    targetRateMap[grade]?.[season] ?? ([0, 0] as ReadingTargetRange);

  // Inject grammar and set up recognition whenever the passage changes
  useEffect(() => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) return;

    const SpeechRecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognitionCtor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    // Inject SpeechGrammarList built from the passage
    if (currentText) {
      const pTokens = tokenise(currentText);
      passageTokensRef.current = pTokens;
      const GrammarList = (window as any).SpeechGrammarList ?? (window as any).webkitSpeechGrammarList;
      if (GrammarList) {
        const list = new GrammarList();
        const jsgf = `#JSGF V1.0; grammar passage; public <passage> = ${pTokens.join(' | ')};`;
        list.addFromString(jsgf, 1);
        recognition.grammars = list;
      }
    }

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      let interimText = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const seg = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += seg + ' ';
        } else {
          interimText += seg;
        }
      }

      setInterimTranscript(interimText);
      currentInterimRef.current = interimText;

      const advanceHighlight = (newIdx: number) => {
        if (newIdx > maxHighlightRef.current) {
          maxHighlightRef.current = newIdx;
          setHighlightedWordIndex(newIdx);
        }
      };

      if (finalTranscript) {
        setTranscript(prev => {
          const next = prev + finalTranscript;
          currentTranscriptRef.current = next;
          const combined = next + ' ' + currentInterimRef.current;
          advanceHighlight(countMatchedPassageWords(combined, passageTokensRef.current));
          return next;
        });
      } else {
        const combined = currentTranscriptRef.current + ' ' + interimText;
        advanceHighlight(countMatchedPassageWords(combined, passageTokensRef.current));
      }
    };

    recognition.onstart = () => {
      logger.log('Speech recognition started');
      setInterimTranscript('');
    };

    recognition.onend = () => {
      logger.log('Speech recognition ended');
      if (currentInterimRef.current.trim()) {
        setTranscript(prev => prev + ' ' + currentInterimRef.current);
      }
      setInterimTranscript('');
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      logger.log('Speech recognition error:', event.error);
      setInterimTranscript('');
    };

    recognitionRef.current = recognition;

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentText]);

  useEffect(() => {
    let isActive = true;

    const loadReadingContent = async () => {
      setIsLoadingContent(true);
      setContentError(null);

      const contentResponse = await getReadingAssessmentContent(selectedGrade);
      if (!isActive) return;

      if (!contentResponse) {
        setCurrentText('');
        setTargetRateMap({});
        setContentError('Reading assessment content is unavailable right now.');
        setIsLoadingContent(false);
        return;
      }

      setCurrentText(contentResponse.content.text);
      setTargetRateMap(contentResponse.allTargetRates);
      setIsLoadingContent(false);
    };

    void loadReadingContent();
    return () => { isActive = false; };
  }, [selectedGrade]);

  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [transcript, interimTranscript]);

  useEffect(() => { currentTranscriptRef.current = transcript; }, [transcript]);
  useEffect(() => { currentInterimRef.current = interimTranscript; }, [interimTranscript]);
  useEffect(() => { currentTimeLeftRef.current = timeLeft; }, [timeLeft]);

  const startCountdown = () => {
    setAssessmentState('countdown');
    setCountdown(3);

    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          setTimeout(() => startRecording(), 500);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const startRecording = () => {
    setAssessmentState('recording');
    setIsRecording(true);
    setTimeLeft(60);
    setTranscript('');
    setInterimTranscript('');
    setShowResults(false);
    setCountdown(0);
    setHighlightedWordIndex(0);
    maxHighlightRef.current = 0;

    currentTranscriptRef.current = '';
    currentInterimRef.current = '';
    currentTimeLeftRef.current = 60;

    if (recognitionRef.current) recognitionRef.current.start();

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        const next = prev <= 1 ? 0 : prev - 1;
        currentTimeLeftRef.current = next;
        if (prev <= 1) {
          stopAssessment(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const proceedToAssessment = () => {
    if (isLoadingContent || contentError || !currentText) return;
    setAssessmentState('ready');
  };

  const stopAssessment = (forceCalculate = false) => {
    setIsRecording(false);
    setAssessmentState('complete');

    if (currentInterimRef.current.trim()) {
      const combined = currentTranscriptRef.current + ' ' + currentInterimRef.current;
      setTranscript(combined);
      currentTranscriptRef.current = combined;
      setInterimTranscript('');
      currentInterimRef.current = '';
    }

    if (recognitionRef.current) recognitionRef.current.stop();
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }

    const delay = forceCalculate ? 1000 : 500;
    setTimeout(() => calculateResultsWithCurrentState(), delay);
  };

  const calculateResultsWithCurrentState = () => {
    const finalTranscript = currentTranscriptRef.current;
    const interim = currentInterimRef.current;
    const timeLeft = currentTimeLeftRef.current;

    const fullTranscript = (finalTranscript + ' ' + interim).trim();
    const timeElapsed = 60 - timeLeft;

    const { wcpm, correctWords, wordsAttempted, accuracy, errorLog } =
      calculateWCPM(fullTranscript, currentText, timeElapsed);

    const { grade, level, targetRange } = findGradeLevel(wcpm, selectedSeason, targetRateMap);
    const accuracyConcern = wordsAttempted > 0 && accuracy < 95;

    let feedback: string;
    if (level === 'Above Target') {
      feedback = `Outstanding! Your WCPM of ${wcpm} is above the Grade ${grade} ${selectedSeason} target (${targetRange[0]}–${targetRange[1]} WCPM). You're reading faster and more accurately than expected.`;
    } else if (level === 'At Target') {
      feedback = `Excellent work! Your WCPM of ${wcpm} matches the Grade ${grade} ${selectedSeason} target (${targetRange[0]}–${targetRange[1]} WCPM). You're reading at exactly the right pace.`;
    } else {
      feedback = `Keep practising! Your WCPM of ${wcpm} is below the Grade ${grade} ${selectedSeason} target (${targetRange[0]}–${targetRange[1]} WCPM). Try reading aloud for 15–20 minutes daily to build fluency.`;
    }

    if (accuracyConcern) {
      feedback += ' Note: accuracy below 95% is flagged as a reading concern — focus on reading carefully, not just quickly.';
    }

    const result: ReadingResult = {
      wcpm,
      accuracy,
      correctWords,
      wordsAttempted,
      grade,
      season: selectedSeason,
      level,
      targetRange: `${targetRange[0]}–${targetRange[1]} WCPM`,
      accuracyConcern,
      errorLog,
      feedback,
    };

    const percentage = level === 'Above Target' ? 100 : level === 'At Target' ? 80 : 50;
    ProgressTracker.saveQuizResult({
      quizId: 'oral-language-reading',
      quizName: 'Reading Assessment',
      category: 'oral',
      subcategory: 'oral-language',
      score: wcpm,
      totalQuestions: 1,
      percentage,
      timeSpent: timeElapsed,
      completedAt: new Date().toISOString(),
      gradeLevel: String(selectedGrade),
      additionalData: { wcpm, accuracy, level, grade, season: selectedSeason },
    });

    setResults(result);
    setShowResults(true);
  };

  const resetAssessment = () => {
    setAssessmentState('setup');
    setCountdown(0);
    setIsRecording(false);
    setTimeLeft(60);
    setTranscript('');
    setInterimTranscript('');
    setShowResults(false);
    setResults(null);
    setHighlightedWordIndex(0);
    maxHighlightRef.current = 0;
    setShowErrorLog(false);
    currentTranscriptRef.current = '';
    currentInterimRef.current = '';
    currentTimeLeftRef.current = 60;
  };

  // ─── Passage renderer with live word highlighting ─────────────────────────

  const renderPassageWithHighlight = () => {
    const segments = currentText.split(/(\s+)/);
    let wordIdx = 0;
    return segments.map((seg, i) => {
      if (/^\s+$/.test(seg)) return <span key={i}>{seg}</span>;
      const idx = wordIdx++;
      const done = idx < highlightedWordIndex;
      return (
        <span
          key={i}
          className={done ? 'bg-green-200 rounded px-0.5 transition-colors duration-150' : ''}
        >
          {seg}
        </span>
      );
    });
  };

  // ─── Results screen ───────────────────────────────────────────────────────

  if (showResults && results) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-300 via-emerald-400 to-lime-500 relative overflow-hidden">
        <FloatingBackground />

        <div className="relative z-10 p-6">
          <button
            onClick={() => navigate(categoryRoute(categoryId!))}
            className="flex items-center space-x-2 text-white hover:text-gray-200 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg transition-colors duration-200"
          >
            <ArrowLeft size={20} />
            <span>Back to Category</span>
          </button>
        </div>

        <div className="relative z-10 px-6 pb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/50"
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Reading Assessment Complete!</h1>
              <p className="text-gray-600">Here are your reading fluency results</p>
            </div>

            <div className="space-y-6">
              {/* WCPM hero */}
              <div className="text-center">
                <div className="text-6xl font-bold text-emerald-600 mb-1">{results.wcpm}</div>
                <div className="text-lg text-gray-600">Words Correct Per Minute (WCPM)</div>
              </div>

              {/* Accuracy */}
              <div className="text-center">
                <div className={`text-4xl font-bold mb-1 ${results.accuracyConcern ? 'text-amber-500' : 'text-emerald-600'}`}>
                  {results.accuracy}%
                </div>
                <div className="text-gray-600 text-sm">
                  Accuracy — {results.correctWords} correct of {results.wordsAttempted} words attempted
                </div>
                {results.accuracyConcern && (
                  <div className="flex items-center justify-center gap-1 mt-2 text-amber-600 text-sm font-medium">
                    <AlertTriangle size={16} />
                    <span>Accuracy below 95% — reading concern flagged (DIBELS standard)</span>
                  </div>
                )}
              </div>

              {/* Grade / Season / Level */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-xs text-gray-500 mb-1">Grade Target</div>
                  <div className="text-lg font-semibold text-gray-800">Grade {results.grade}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-xs text-gray-500 mb-1">Season</div>
                  <div className="text-lg font-semibold text-gray-800">{results.season}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-xs text-gray-500 mb-1">Target Range</div>
                  <div className="text-lg font-semibold text-gray-800">{results.targetRange}</div>
                </div>
              </div>

              {/* Level badge */}
              <div className="text-center">
                <span className={`inline-flex items-center px-5 py-2 rounded-full text-sm font-semibold ${
                  results.level === 'Above Target' ? 'bg-green-100 text-green-800' :
                  results.level === 'At Target' ? 'bg-blue-100 text-blue-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {results.level}
                </span>
              </div>

              {/* Feedback */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold text-blue-800 mb-2">Feedback</h3>
                <p className="text-blue-700 text-sm leading-relaxed">{results.feedback}</p>
              </div>

              {/* Error log */}
              {results.errorLog.length > 0 && (
                <div>
                  <button
                    onClick={() => setShowErrorLog(v => !v)}
                    className="flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700"
                  >
                    <span>{showErrorLog ? '▲' : '▼'}</span>
                    <span>Words read incorrectly ({results.errorLog.length})</span>
                  </button>
                  {showErrorLog && (
                    <div className="mt-3 bg-red-50 rounded-lg p-4">
                      <div className="grid grid-cols-3 gap-x-4 gap-y-1 text-xs font-semibold text-gray-500 mb-2 border-b border-red-100 pb-2">
                        <span>#</span>
                        <span>Student said</span>
                        <span>Passage word</span>
                      </div>
                      <div className="max-h-48 overflow-y-auto space-y-1">
                        {results.errorLog.map((e, i) => (
                          <div key={i} className="grid grid-cols-3 gap-x-4 text-sm">
                            <span className="text-gray-400">{i + 1}.</span>
                            <span className={`font-medium ${e.heard === '(skipped)' ? 'text-gray-400 italic' : 'text-red-600'}`}>
                              {e.heard === '(skipped)' ? 'skipped' : e.heard}
                            </span>
                            <span className="text-gray-700">{e.expected}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex space-x-4">
                <button
                  onClick={resetAssessment}
                  className="flex-1 bg-emerald-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-emerald-700 transition-colors duration-200"
                >
                  Take Another Assessment
                </button>
                <button
                  onClick={() => navigate(ROUTES.CATEGORIES)}
                  className="flex-1 bg-gray-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-700 transition-colors duration-200"
                >
                  Back to Categories
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // ─── Main assessment UI ───────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-300 via-emerald-400 to-lime-500 relative overflow-hidden">
      <FloatingBackground />

      <div className="relative z-10 p-6">
        <button
          onClick={() => navigate(categoryRoute(categoryId!))}
          className="flex items-center space-x-2 text-white hover:text-gray-200 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg transition-colors duration-200"
        >
          <ArrowLeft size={20} />
          <span>Back to Category</span>
        </button>
      </div>

      <div className="relative z-10 px-6 pb-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-bold text-white mb-4 drop-shadow-lg">
              Reading Fluency Assessment
            </h1>
            <p className="text-white/90 text-lg drop-shadow-md">
              Measure your reading accuracy and speed with our speech-to-text assessment
            </p>
          </motion.div>

          {assessmentState === 'setup' ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/50"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Setup Your Assessment</h2>

              <div className="space-y-6">
                {/* Grade selector */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Select Grade Level
                  </label>
                  <div className="grid grid-cols-4 gap-3">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(grade => (
                      <button
                        key={grade}
                        onClick={() => setSelectedGrade(grade)}
                        className={`py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                          selectedGrade === grade
                            ? 'bg-emerald-600 text-white shadow-lg'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Grade {grade}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Season selector */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Select Assessment Season
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['Fall', 'Winter', 'Spring'] as ReadingSeason[]).map(season => (
                      <button
                        key={season}
                        onClick={() => setSelectedSeason(season)}
                        className={`py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                          selectedSeason === season
                            ? 'bg-emerald-600 text-white shadow-lg'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {season}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    WCPM targets vary by season — select the one that matches the current assessment period.
                  </p>
                </div>

                {/* Target range preview */}
                {!isLoadingContent && !contentError && (
                  <div className="bg-emerald-50 rounded-lg p-3 text-sm text-emerald-800">
                    Grade {selectedGrade} · {selectedSeason} target:{' '}
                    <span className="font-semibold">
                      {getTargetRange(selectedGrade, selectedSeason)[0]}–{getTargetRange(selectedGrade, selectedSeason)[1]} WCPM
                    </span>
                  </div>
                )}

                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-800 mb-2">How it works:</h3>
                  <ul className="text-blue-700 text-sm space-y-1">
                    <li>• You'll have 60 seconds to read the text aloud</li>
                    <li>• Speak clearly into your microphone</li>
                    <li>• Words are matched to the passage using fuzzy matching</li>
                    <li>• Your WCPM and accuracy % will be calculated and graded</li>
                  </ul>
                </div>

                <div className="bg-amber-50 rounded-lg p-4">
                  <h4 className="font-semibold text-amber-800 mb-2">Text Preview:</h4>
                  {isLoadingContent ? (
                    <p className="text-amber-700 text-sm">Loading passage...</p>
                  ) : contentError ? (
                    <p className="text-red-600 text-sm">{contentError}</p>
                  ) : (
                    <p className="text-amber-700 text-sm leading-relaxed">
                      {currentText.substring(0, 200)}…
                    </p>
                  )}
                </div>

                <button
                  onClick={proceedToAssessment}
                  disabled={isLoadingContent || !!contentError || !currentText}
                  className="w-full bg-emerald-600 text-white py-4 px-6 rounded-lg font-bold text-lg hover:bg-emerald-700 disabled:bg-emerald-300 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  <BookOpen className="w-6 h-6" />
                  <span>Continue to Assessment</span>
                </button>
              </div>
            </motion.div>
          ) : assessmentState === 'ready' ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/50 text-center"
            >
              <h2 className="text-3xl font-bold text-gray-800 mb-6">Ready to Start?</h2>

              <div className="mb-8 space-y-2">
                <div className="text-lg text-gray-600">
                  Grade: <span className="font-semibold text-emerald-600">Grade {selectedGrade}</span>
                </div>
                <div className="text-gray-600">
                  Season: <span className="font-semibold text-emerald-600">{selectedSeason}</span>
                </div>
                <div className="text-gray-600">
                  Target:{' '}
                  <span className="font-semibold">
                    {getTargetRange(selectedGrade, selectedSeason)[0]}–{getTargetRange(selectedGrade, selectedSeason)[1]} WCPM
                  </span>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4 mb-8">
                <h3 className="font-semibold text-blue-800 mb-2">Instructions:</h3>
                <ul className="text-blue-700 text-sm space-y-1 text-left">
                  <li>• Click "Start Assessment" when you're ready</li>
                  <li>• You'll see a 3-2-1 countdown</li>
                  <li>• Read the text aloud clearly for 60 seconds</li>
                  <li>• Words you read correctly will highlight green in the passage</li>
                  <li>• The timer will stop automatically</li>
                </ul>
              </div>

              <button
                onClick={startCountdown}
                className="bg-emerald-600 text-white py-4 px-8 rounded-lg font-bold text-xl hover:bg-emerald-700 transition-colors duration-200 flex items-center justify-center space-x-3 mx-auto"
              >
                <span>🎯</span>
                <span>Start Assessment</span>
              </button>
            </motion.div>
          ) : assessmentState === 'countdown' ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/95 backdrop-blur-sm rounded-2xl p-16 shadow-xl border border-white/50 text-center"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-8">Get Ready!</h2>
              <motion.div
                key={countdown}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`text-8xl font-bold mb-4 ${countdown > 0 ? 'text-emerald-600' : 'text-green-500'}`}
              >
                {countdown > 0 ? countdown : 'GO!'}
              </motion.div>
              <p className="text-lg text-gray-600">
                {countdown > 0 ? 'Start reading when you see "GO!"' : 'Start reading now!'}
              </p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Timer */}
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/50">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {isRecording ? (
                      <div className="flex items-center space-x-2 text-red-600">
                        <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
                        <span className="font-medium">Recording…</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2 text-gray-600">
                        <MicOff className="w-5 h-5" />
                        <span className="font-medium">Assessment Complete</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 text-2xl font-bold text-emerald-600">
                    <Clock className="w-6 h-6" />
                    <span>{timeLeft}s</span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-emerald-600 h-3 rounded-full transition-all duration-1000"
                    style={{ width: `${((60 - timeLeft) / 60) * 100}%` }}
                  />
                </div>
              </div>

              {/* Passage + Transcript side by side */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Passage with live highlighting */}
                <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/50">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center space-x-2">
                    <BookOpen className="w-5 h-5 text-emerald-600" />
                    <span>Read this text aloud</span>
                  </h3>
                  <div className="text-sm text-gray-500 mb-3">
                    Green = matched words
                  </div>
                  <div className="text-base leading-relaxed text-gray-700 bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
                    {renderPassageWithHighlight()}
                  </div>
                </div>

                {/* Transcript */}
                <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/50">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center space-x-2">
                    <span className={isRecording ? 'text-red-600' : 'text-gray-600'}>🎤</span>
                    <span>Speech Recognition</span>
                  </h3>
                  <div className="text-sm text-gray-600 mb-3 flex items-center justify-between">
                    <span>{isRecording ? '🔴 Live transcription active' : 'Recording stopped'}</span>
                    {isRecording && (
                      <div className="flex items-center space-x-1 text-xs">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        <span className="text-red-600">LIVE</span>
                      </div>
                    )}
                  </div>
                  <div
                    ref={transcriptRef}
                    className="min-h-[320px] p-4 bg-gray-50 rounded-lg text-gray-700 overflow-y-auto"
                  >
                    {isRecording ? (
                      <div className="space-y-2">
                        <div className="text-gray-800">
                          {transcript}
                          {interimTranscript && (
                            <span className="text-blue-600 italic opacity-80">{interimTranscript}</span>
                          )}
                        </div>
                        <span className="inline-block w-2 h-5 bg-red-500 animate-pulse ml-1" />
                      </div>
                    ) : transcript ? (
                      transcript
                    ) : (
                      'Speech recognition will appear here'
                    )}
                  </div>

                  {(transcript || interimTranscript) && (
                    <div className="mt-3 text-sm text-gray-600 space-y-1">
                      <div>
                        Matched passage words:{' '}
                        <span className="font-semibold text-emerald-600">{highlightedWordIndex}</span>
                      </div>
                      {interimTranscript && isRecording && (
                        <div>
                          Speaking:{' '}
                          <span className="font-semibold text-blue-600 italic">"{interimTranscript}"</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Stop button */}
              {isRecording && (
                <div className="text-center">
                  <button
                    onClick={() => stopAssessment(false)}
                    className="bg-red-600 text-white py-3 px-8 rounded-lg font-bold text-lg hover:bg-red-700 transition-colors duration-200 flex items-center justify-center space-x-2 mx-auto"
                  >
                    <MicOff className="w-5 h-5" />
                    <span>Stop Assessment Early</span>
                  </button>
                  <p className="text-white/80 text-sm mt-2">Or let the timer run out automatically</p>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReadingAssessment;
