// Dictionary lookup client — separate from the editor's checking pipeline.

export interface DictionarySense {
  pos?: string;
  definition: string;
  example?: string;
}

export interface DictionaryEntry {
  word: string;
  pronunciation?: string;
  pos?: string;
  definition: string;
  senses?: DictionarySense[];
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
