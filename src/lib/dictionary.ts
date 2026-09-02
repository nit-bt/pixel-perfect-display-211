// Dictionary lookup client — separate from the editor's checking pipeline.
//
// Field names mirror the API exactly. The backend sends `def` and `pro`, not
// `definition` and `pronunciation`; renaming them here would silently render
// nothing, since a missing property is `undefined` rather than an error.

export interface DictionarySense {
  /** Part of speech, e.g. "ន." or "កិ." */
  pos: string;
  /** Pronunciation. */
  pro: string;
  /** Definition text. */
  def: string;
}

export interface DictionaryEntry {
  word: string;
  senses: DictionarySense[];
  /** Attribution line, already formatted for display. */
  source: string;
}

const API_BASE = import.meta.env["VITE_API_URL"] as string | undefined;

/** Returns null when the word is not in the dictionary (HTTP 404). */
export async function defineWord(word: string): Promise<DictionaryEntry | null> {
  if (!API_BASE) throw new Error("VITE_API_URL is not configured");
  const res = await fetch(`${API_BASE}/api/define/${encodeURIComponent(word)}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`define failed: ${res.status}`);
  return (await res.json()) as DictionaryEntry;
}

export interface SuggestMatch {
  word: string;
  gloss: string;
}

export interface SuggestResponse {
  prefix: string;
  matches: SuggestMatch[];
  total: number;
}

/**
 * Headwords starting with a prefix, for search-as-you-type.
 *
 * Exact lookup is the wrong shape for a search box — someone typing សា has
 * not made a mistake, they are partway through a word.
 */
export async function suggestWords(
  prefix: string,
  limit = 8,
  signal?: AbortSignal,
): Promise<SuggestResponse> {
  if (!API_BASE) throw new Error("VITE_API_URL is not configured");
  const res = await fetch(
    `${API_BASE}/api/suggest/${encodeURIComponent(prefix)}?limit=${limit}`,
    { signal: signal ?? null },
  );
  if (!res.ok) throw new Error(`suggest failed: ${res.status}`);
  return (await res.json()) as SuggestResponse;
}
