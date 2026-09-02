import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Camera, Loader2, Search } from "lucide-react";
import { defineWord, type DictionaryEntry } from "@/lib/dictionary";

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

  const search = async (e: React.FormEvent) => {
    e.preventDefault();
    const word = query.trim();
    if (!word) return;
    setState({ kind: "loading" });
    try {
      const entry = await defineWord(word);
      setState(entry ? { kind: "found", entry } : { kind: "missing", word });
    } catch {
      setState({ kind: "error" });
    }
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
        <div className="flex flex-1 items-center gap-2 rounded-2xl bg-card px-4 py-3 ink-ring cartoon-shadow">
          <Search className="size-5 shrink-0 text-ink/50" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="បញ្ចូលពាក្យខ្មែរ..."
            aria-label="ស្វែងរកពាក្យ"
            className="w-full bg-transparent text-lg outline-none placeholder:text-ink/40"
          />
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
  return (
    <article className="animate-[rise_0.4s_both] rounded-3xl bg-card p-7 ink-ring cartoon-shadow">
      <div className="flex flex-wrap items-baseline gap-3">
        <h2 className="komnae-brand text-3xl">{entry.word}</h2>
        {entry.pronunciation && (
          <span className="font-mono text-sm text-ink/60">/{entry.pronunciation}/</span>
        )}
        {entry.pos && (
          <span className="rounded-full bg-sage/40 px-3 py-1 text-xs font-semibold ink-ring">{entry.pos}</span>
        )}
      </div>
      <p className="mt-4 text-lg leading-relaxed">{entry.definition}</p>
      {entry.senses && entry.senses.length > 0 && (
        <ol className="mt-5 space-y-3 border-t-[2.5px] border-ink/15 pt-5">
          {entry.senses.map((s, i) => (
            <li key={i} className="flex gap-3">
              <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-sun text-xs font-bold ink-ring">
                {i + 1}
              </span>
              <div>
                {s.pos && <span className="mr-2 font-mono text-xs text-ink/60">{s.pos}</span>}
                <span className="leading-relaxed">{s.definition}</span>
                {s.example && <p className="mt-1 text-sm italic text-ink/60">{s.example}</p>}
              </div>
            </li>
          ))}
        </ol>
      )}
    </article>
  );
}
