import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Camera, Loader2, Search } from "lucide-react";
import {
  defineWord,
  suggestWords,
  type DictionaryEntry,
  type SuggestMatch,
} from "@/lib/dictionary";

export const Route = createFileRoute("/dictionary")({
  head: () => ({
    meta: [
      { title: "វចនានុក្រម — កំណែ Komnae" },
      {
        name: "description",
        content: "ស្វែងរកអត្ថន័យពាក្យខ្មែរពីវចនានុក្រមរាជបណ្ឌិត្យសភាកម្ពុជា ៣៧,៧៧៦ ធាតុ។",
      },
      { property: "og:title", content: "វចនានុក្រមខ្មែរ — កំណែ Komnae" },
      {
        property: "og:description",
        content: "រកមើលការបញ្ចេញសំឡេង ថ្នាក់ពាក្យ និងនិយមន័យពាក្យខ្មែរភ្លាមៗ។",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DictionaryPage,
});

type State =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "found"; entry: DictionaryEntry }
  | { kind: "missing"; word: string }
  | { kind: "error" };

function DictionaryPage() {
  const [query, setQuery] = useState("");
  const [state, setState] = useState<State>({ kind: "idle" });
  const [matches, setMatches] = useState<SuggestMatch[]>([]);
  const [showMatches, setShowMatches] = useState(false);
  const justPicked = useRef(false);

  const lookUp = async (word: string) => {
    setShowMatches(false);
    setState({ kind: "loading" });
    try {
      const entry = await defineWord(word);
      setState(entry ? { kind: "found", entry } : { kind: "missing", word });
    } catch {
      setState({ kind: "error" });
    }
  };

  const search = (e: React.FormEvent) => {
    e.preventDefault();
    const word = query.trim();
    if (word) void lookUp(word);
  };

  // Search-as-you-type. Someone typing សា has not made a mistake, they are
  // partway through a word, so offer headwords rather than a 404.
  useEffect(() => {
    if (justPicked.current) {
      justPicked.current = false;
      return;
    }
    const prefix = query.trim();
    if (prefix.length < 1) {
      setMatches([]);
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await suggestWords(prefix, 8, controller.signal);
        setMatches(res.matches);
        setShowMatches(res.matches.length > 0);
      } catch {
        // Aborted or offline — leave the previous list alone.
      }
    }, 250);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const pick = (word: string) => {
    justPicked.current = true;
    setQuery(word);
    setMatches([]);
    void lookUp(word);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <header className="animate-[rise_0.5s_both]">
        <span className="inline-block -rotate-2 rounded-full bg-sun px-3 py-1 text-xs font-bold ink-ring cartoon-shadow-sm">
          ៣៧,៧៧៦ ធាតុ
        </span>
        <h1 className="mt-4 font-display text-4xl font-black leading-tight sm:text-5xl">
          វចនានុក្រម និងស្កេន
        </h1>
        <p className="mt-2 text-ink/70">រកមើលពាក្យខ្មែរណាមួយ — និយមន័យ ការបញ្ចេញសំឡេង និងថ្នាក់ពាក្យ។</p>
      </header>

      <form onSubmit={search} className="mt-8 flex gap-3">
        <div className="relative flex-1">
          <div className="flex items-center gap-2 rounded-2xl bg-card px-4 py-3 ink-ring cartoon-shadow">
            <Search className="size-5 shrink-0 text-ink/50" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => matches.length > 0 && setShowMatches(true)}
              onBlur={() => setTimeout(() => setShowMatches(false), 150)}
              placeholder="បញ្ចូលពាក្យខ្មែរ..."
              aria-label="ស្វែងរកពាក្យ"
              autoComplete="off"
              className="w-full bg-transparent text-lg outline-none placeholder:text-ink/40"
            />
          </div>

          {showMatches && (
            <ul className="absolute inset-x-0 top-full z-20 mt-2 max-h-80 overflow-y-auto rounded-2xl bg-card py-2 ink-ring cartoon-shadow">
              {matches.map((m) => (
                <li key={m.word}>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => pick(m.word)}
                    className="block w-full px-4 py-2 text-left transition-colors hover:bg-sun/30"
                  >
                    <span className="text-lg font-semibold">{m.word}</span>
                    {m.gloss && (
                      <span className="ml-2 text-sm text-ink/55">{m.gloss}</span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <button
          type="submit"
          className="rounded-2xl bg-ink px-5 py-3 font-semibold text-paper ink-ring cartoon-shadow lift"
        >
          រក
        </button>
      </form>

      <section className="mt-8" aria-live="polite">
        {state.kind === "loading" && (
          <p className="flex items-center gap-2 text-ink/60">
            <Loader2 className="size-4 animate-spin" /> កំពុងរក...
          </p>
        )}

        {state.kind === "error" && (
          <div className="rounded-2xl bg-rose/25 p-5 ink-ring cartoon-shadow-sm">
            <p className="font-semibold">មិនអាចភ្ជាប់ទៅម៉ាស៊ីនមេបានទេ</p>
            <p className="mt-1 text-sm text-ink/70">សូមព្យាយាមម្ដងទៀត។</p>
          </div>
        )}

        {state.kind === "missing" && (
          <div className="rounded-2xl bg-cream p-6 text-center ink-ring cartoon-shadow">
            <span className="font-display text-4xl">¯\_(ツ)_/¯</span>
            <p className="mt-3 font-semibold">រកមិនឃើញពាក្យ «{state.word}» ក្នុងវចនានុក្រមទេ</p>
            <p className="mt-1 text-sm text-ink/60">សូមពិនិត្យអក្ខរាវិរុទ្ធ ឬសាកល្បងពាក្យផ្សេង។</p>
          </div>
        )}

        {state.kind === "found" && <EntryCard entry={state.entry} />}
      </section>

      <div className="doodle-divider my-10" aria-hidden />

      <section className="rounded-3xl border-[2.5px] border-dashed border-ink/40 bg-cream/50 p-6">
        <div className="flex items-center gap-3">
          <Camera className="size-6 text-ink/50" />
          <h2 className="font-display text-2xl font-bold text-ink/70">ស្កេន និងវាយ</h2>
          <span className="rounded-full bg-glow/60 px-3 py-1 text-xs font-bold text-ink/70">កំពុងអភិវឌ្ឍ</span>
        </div>
        <p className="mt-3 text-sm text-ink/60">
          ថតរូបអត្ថបទខ្មែរ ហើយបម្លែងវាទៅជាអក្សរដែលអាចកែសម្រួលបាន។ មុខងារនេះនឹងមកដល់ឆាប់ៗនេះ។
        </p>
      </section>

      <p className="mt-8 text-center font-mono text-xs text-ink/50">
        វចនានុក្រមខ្មែរ ២០២២, រាជបណ្ឌិត្យសភាកម្ពុជា — 37,776 entries
      </p>
    </main>
  );
}

function EntryCard({ entry }: { entry: DictionaryEntry }) {
  // Pronunciation is stored per sense but is the same across them, so the
  // first one stands in for the headword.
  const pronunciation = entry.senses[0]?.pro;

  return (
    <article className="animate-[rise_0.4s_both] rounded-3xl bg-card p-7 ink-ring cartoon-shadow">
      <div className="flex flex-wrap items-baseline gap-3">
        <h2 className="komnae-brand text-3xl">{entry.word}</h2>
        {pronunciation && (
          <span className="font-mono text-sm text-ink/60">/{pronunciation}/</span>
        )}
      </div>

      <ol className="mt-5 space-y-4 border-t-[2.5px] border-ink/15 pt-5">
        {entry.senses.map((s, i) => (
          <li key={i} className="flex gap-3">
            <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-sun text-xs font-bold ink-ring">
              {i + 1}
            </span>
            <div className="min-w-0">
              {s.pos && (
                <span className="mr-2 rounded-full bg-sage/40 px-2 py-0.5 align-middle text-xs font-semibold">
                  {s.pos}
                </span>
              )}
              <span className="leading-relaxed">{s.def}</span>
            </div>
          </li>
        ))}
      </ol>

      {entry.source && (
        <p className="mt-6 border-t-[2.5px] border-ink/10 pt-4 text-xs text-ink/50">
          {entry.source}
        </p>
      )}
    </article>
  );
}

