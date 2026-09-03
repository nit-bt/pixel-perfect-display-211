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

export interface Boundary {
  start: number;
  end: number;
}

export interface CheckResponse {
  issues: Issue[];
  /** Word boundaries from the segmenter, for optional break markers. */
  boundaries?: Boundary[];
  tokens: number;
  backend: string;
  ai: "ok" | "skipped" | "no_key" | "error" | "timeout";
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

/* ------------------------------- extraction ------------------------------- */

export interface ExtractResponse {
  text: string;
  note: string;
  characters: number;
}

export const ACCEPTED_UPLOAD_TYPES = ".pdf,.docx,.txt,.md,.png,.jpg,.jpeg,.webp";
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

/** Read a File as base64, without the data: URL prefix. */
function toBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const encoded = result.includes(",") ? result.split(",")[1] : result;
      if (!encoded) { reject(new Error("មិនអាចអានឯកសារនេះបានទេ")); return; }
      resolve(encoded);
    };
    reader.onerror = () => reject(new Error("មិនអាចអានឯកសារនេះបានទេ"));
    reader.readAsDataURL(file);
  });
}

/**
 * Pull text out of an uploaded document.
 *
 * Extraction is deliberately separate from checking: if a document is garbled
 * on the way in, the user sees it as extracted text they can fix, not as a
 * page of spelling errors they did not make.
 *
 * Backend errors arrive as HTTP 400 with a `detail` field already written in
 * Khmer for the user, so it is thrown through as-is.
 */
export async function extractDocument(file: File): Promise<ExtractResponse> {
  if (!API_BASE) throw new Error("VITE_API_URL is not configured");

  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error("ឯកសារធំពេក (អតិបរមា ១០ MB)");
  }

  const data = await toBase64(file);

  const res = await fetch(`${API_BASE}/api/extract`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data, mime_type: file.type, filename: file.name }),
  });

  if (!res.ok) {
    let detail = "មិនអាចអានឯកសារនេះបានទេ";
    try {
      const body = await res.json();
      if (body?.detail) detail = body.detail;
    } catch {
      // Response was not JSON; keep the generic message.
    }
    throw new Error(detail);
  }

  return (await res.json()) as ExtractResponse;
}

/**
 * Run OCR on a captured photo.
 *
 * Shares the extract endpoint with file uploads, so a photograph and a
 * scanned PDF take the same path and return the same warning note.
 */
export async function extractDataUrl(dataUrl: string): Promise<ExtractResponse> {
  if (!API_BASE) throw new Error("VITE_API_URL is not configured");

  const comma = dataUrl.indexOf(",");
  const header = dataUrl.slice(0, comma);
  const data = dataUrl.slice(comma + 1);
  const mime = header.match(/data:([^;]+)/)?.[1] ?? "image/jpeg";

  const res = await fetch(`${API_BASE}/api/extract`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data, mime_type: mime, filename: "camera.jpg" }),
  });

  if (!res.ok) {
    let detail = "មិនអាចអានអត្ថបទពីរូបភាពនេះបានទេ";
    try {
      const body = await res.json();
      if (body?.detail) detail = body.detail;
    } catch {
      // not JSON; keep the generic message
    }
    throw new Error(detail);
  }

  return (await res.json()) as ExtractResponse;
}
