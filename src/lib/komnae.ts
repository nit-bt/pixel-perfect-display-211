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

/* --------------------------------- client -------------------------------- */

export async function checkText(text: string, apiKey?: string | null, signal?: AbortSignal): Promise<CheckResponse> {
  if (!API_BASE) throw new Error("VITE_API_URL is not configured");
  const res = await fetch(`${API_BASE}/api/check`, {
    method: "POST",
    headers: headers(apiKey),
    body: JSON.stringify({ text, use_ai: false }),
    signal: signal ?? null,
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
  if (!API_BASE) throw new Error("VITE_API_URL is not configured");
  const res = await fetch(`${API_BASE}/api/refine`, {
    method: "POST",
    headers: headers(apiKey),
    body: JSON.stringify({ text, issues }),
    signal: signal ?? null,
  });
  if (!res.ok) throw new Error(`refine failed: ${res.status}`);
  return (await res.json()) as CheckResponse;
}

export async function validateKey(apiKey: string): Promise<ValidateKeyResponse> {
  if (!API_BASE) throw new Error("VITE_API_URL is not configured");

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
