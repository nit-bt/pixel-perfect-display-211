// Komnae API layer + shared types.
// Mocked with setTimeout until VITE_API_URL is configured.

export type IssueType = "spelling" | "grammar" | "style";

export interface Issue {
  start: number;
  end: number;
  original: string;
  suggestion: string;
  alternatives: string[];
  reason: string;
  type: IssueType;
  source: string;
  definition?: string;
  pos?: string;
  confidence?: number;
}

export interface CheckResponse {
  issues: Issue[];
  tokens: number;
  backend: string;
  ai: boolean;
  ai_error?: string | null;
}

export interface ValidateKeyResponse {
  valid: boolean;
  model?: string;
  error?: string;
}

export const GEMINI_KEY_STORAGE = "komnae_gemini_key";

const API_BASE = import.meta.env["VITE_API_URL"] as string | undefined;

function headers(apiKey?: string | null): HeadersInit {
  const h: Record<string, string> = { "Content-Type": "application/json" };
  // Only send the personal key when the user saved one in settings.
  if (apiKey) h["X-Gemini-Key"] = apiKey;
  return h;
}

/* ------------------------------ mock backend ------------------------------ */

const DICT: Array<{ word: string; suggestion: string; alternatives: string[]; reason: string; type: IssueType; definition: string; pos: string }> = [
  {
    word: "សាលោរៀន",
    suggestion: "សាលារៀន",
    alternatives: ["សាលា", "គ្រឹះស្ថានសិក្សា"],
    reason: "អក្ខរាវិរុទ្ធមិនត្រឹមត្រូវ៖ ត្រូវប្រើ «សាលា» មិនមែន «សាលោ» ទេ។",
    type: "spelling",
    definition: "កន្លែងសម្រាប់បង្រៀន និងរៀនសូត្រ",
    pos: "នាម",
  },
  {
    word: "ណាស់ណាស់",
    suggestion: "ណាស់",
    alternatives: ["ខ្លាំង", "ក្រៃលែង"],
    reason: "ពាក្យស្ទួន៖ មិនចាំបាច់ប្រើពីរដងទេ។",
    type: "style",
    definition: "គុណកិរិយាបញ្ជាក់កម្រិត",
    pos: "គុណកិរិយា",
  },
  {
    word: "ទៅកាន់ទៅ",
    suggestion: "ទៅកាន់",
    alternatives: ["ទៅ"],
    reason: "ពាក្យលើស។",
    type: "style",
    definition: "ធ្នាក់បង្ហាញទិសដៅ",
    pos: "ធ្នាក់",
  },
];

function findAll(text: string, word: string): number[] {
  const out: number[] = [];
  let i = text.indexOf(word);
  while (i !== -1) {
    out.push(i);
    i = text.indexOf(word, i + word.length);
  }
  return out;
}

function mockCheck(text: string): CheckResponse {
  const issues: Issue[] = [];
  for (const entry of DICT) {
    for (const start of findAll(text, entry.word)) {
      issues.push({
        start,
        end: start + entry.word.length,
        original: entry.word,
        suggestion: entry.suggestion,
        alternatives: entry.alternatives,
        reason: entry.reason,
        type: entry.type,
        source: "dictionary",
        definition: entry.definition,
        pos: entry.pos,
        confidence: 0.7,
      });
    }
  }
  // A deliberate dictionary false positive the AI pass will later remove.
  for (const start of findAll(text, "ស្អែក")) {
    issues.push({
      start,
      end: start + "ស្អែក".length,
      original: "ស្អែក",
      suggestion: "ថ្ងៃស្អែក",
      alternatives: [],
      reason: "ពាក្យមិនមានក្នុងវចនានុក្រម។",
      type: "spelling",
      source: "dictionary",
      definition: "ថ្ងៃបន្ទាប់",
      pos: "នាម",
      confidence: 0.3,
    });
  }
  issues.sort((a, b) => a.start - b.start);
  return { issues, tokens: text.trim() ? text.trim().split(/\s+/).length : 0, backend: "mock-dictionary", ai: false };
}

function mockRefine(text: string, phase1: Issue[]): CheckResponse {
  // Drop the low-confidence dictionary false positives...
  const refined = phase1.filter((i) => (i.confidence ?? 1) >= 0.5).map((i) => ({ ...i, source: "ai", confidence: 0.95 }));
  // ...and add a grammar issue only an AI pass would catch.
  for (const start of findAll(text, "កាលពីស្អែក")) {
    refined.push({
      start,
      end: start + "កាលពីស្អែក".length,
      original: "កាលពីស្អែក",
      suggestion: "កាលពីម្សិលមិញ",
      alternatives: ["ម្សិលមិញ", "ពីព្រឹកមិញ"],
      reason: "ភាពមិនស៊ីគ្នានៃកាល៖ «កាលពី» សំដៅអតីតកាល តែ «ស្អែក» ជាអនាគតកាល។",
      type: "grammar",
      source: "ai",
      definition: "កន្សោមកាលវេលា",
      pos: "កន្សោម",
      confidence: 0.92,
    });
  }
  refined.sort((a, b) => a.start - b.start);
  return { issues: refined, tokens: text.trim() ? text.trim().split(/\s+/).length : 0, backend: "mock-ai", ai: true };
}

function delay<T>(value: T, ms: number, signal?: AbortSignal): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => resolve(value), ms);
    signal?.addEventListener("abort", () => {
      clearTimeout(t);
      reject(new DOMException("Aborted", "AbortError"));
    });
  });
}

/* --------------------------------- client -------------------------------- */

export async function checkText(text: string, apiKey?: string | null, signal?: AbortSignal): Promise<CheckResponse> {
  if (!API_BASE) return delay(mockCheck(text), 200, signal);
  const res = await fetch(`${API_BASE}/api/check`, {
    method: "POST",
    headers: headers(apiKey),
    body: JSON.stringify({ text, use_ai: false }),
    signal,
  });
  if (!res.ok) throw new Error(`check failed: ${res.status}`);
  return (await res.json()) as CheckResponse;
}

export async function refineText(
  text: string,
  issues: Issue[],
  apiKey?: string | null,
  signal?: AbortSignal,
): Promise<CheckResponse> {
  if (!API_BASE) return delay(mockRefine(text, issues), 4000, signal);
  const res = await fetch(`${API_BASE}/api/refine`, {
    method: "POST",
    headers: headers(apiKey),
    body: JSON.stringify({ text, issues }),
    signal,
  });
  if (!res.ok) throw new Error(`refine failed: ${res.status}`);
  return (await res.json()) as CheckResponse;
}

export async function validateKey(apiKey: string): Promise<ValidateKeyResponse> {
  if (!API_BASE) {
    return delay(
      apiKey.trim().length > 20
        ? { valid: true, model: "gemini-mock" }
        : { valid: false, error: "សោមិនត្រឹមត្រូវ" },
      900,
    );
  }
  const res = await fetch(`${API_BASE}/api/validate-key`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ api_key: apiKey }),
  });
  return (await res.json()) as ValidateKeyResponse;
}

/* --------------------------------- helpers -------------------------------- */

export const KHMER_DIGITS = ["០", "១", "២", "៣", "៤", "៥", "៦", "៧", "៨", "៩"];

export function toKhmerNumber(n: number): string {
  return String(n)
    .split("")
    .map((c) => (/\d/.test(c) ? KHMER_DIGITS[Number(c)] : c))
    .join("");
}

export function countWords(text: string): number {
  const t = text.trim();
  if (!t) return 0;
  // Khmer has no spaces between words; approximate by clusters of Khmer chars.
  const khmer = t.match(/[\u1780-\u17FF]+/g) ?? [];
  const latin = t.match(/[A-Za-z0-9]+/g) ?? [];
  const khmerCount = khmer.reduce((acc, chunk) => acc + Math.max(1, Math.round(chunk.length / 4)), 0);
  return khmerCount + latin.length;
}
