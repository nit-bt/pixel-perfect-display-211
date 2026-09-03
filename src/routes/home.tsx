import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, Camera, PenLine } from "lucide-react";

export const Route = createFileRoute("/home")({
  head: () => ({
    meta: [
      { title: "អំពីកំណែ Komnae — សរសេរធំ រកមើលអ្វីក៏បាន" },
      {
        name: "description",
        content: "កំណែ Komnae រួមបញ្ចូលការបំបែកពាក្យខ្មែរ វចនានុក្រម ៣៧,៧៧៦ ពាក្យ និងការផ្ទៀងផ្ទាត់វេយ្យាករណ៍ដោយ AI។",
      },
      { property: "og:title", content: "អំពីកំណែ Komnae" },
      {
        property: "og:description",
        content: "បីស្រទាប់នៃការពិនិត្យ៖ ការបំបែកពាក្យ វចនានុក្រមរាជបណ្ឌិត្យសភា និង AI។",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});

const FEATURES = [
  { icon: PenLine, title: "កែសម្រួល", to: "/", tint: "bg-sun/40", body: "ផ្ទាំងក្រដាសសម្រាប់សរសេរ ជាមួយការគូសបន្ទាត់រលកភ្លាមៗ។" },
  { icon: BookOpen, title: "វចនានុក្រម", to: "/dictionary", tint: "bg-sage/30", body: "៣៧,៧៧៦ ធាតុពីរាជបណ្ឌិត្យសភាកម្ពុជា។" },
  { icon: Camera, title: "ស្កេន និងវាយ", to: "/", tint: "bg-sky/30", body: "បម្លែងរូបភាពអត្ថបទខ្មែរជាអក្សរ។ កំពុងអភិវឌ្ឍ។" },
];

const LAYERS = [
  { n: "១", title: "ការបំបែកពាក្យខ្មែរ", body: "ភាសាខ្មែរមិនប្រើដកឃ្លារវាងពាក្យទេ។ យើងបំបែកអត្ថបទជាពាក្យៗសិន មុននឹងពិនិត្យ។" },
  { n: "២", title: "វចនានុក្រម ៣៧,៧៧៦ ពាក្យ", body: "ពាក្យនីមួយៗត្រូវផ្ទៀងនឹងវចនានុក្រមរាជបណ្ឌិត្យសភាកម្ពុជា ២០២២។" },
  { n: "៣", title: "ការផ្ទៀងផ្ទាត់ដោយ AI", body: "AI ប្រើបរិបទប្រយោគ ដើម្បីជ្រើសរើសពាក្យត្រឹមត្រូវ ក្នុងចំណោមពាក្យស្នើពីវចនានុក្រម។" },
];

function HomePage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10">
      <section className="animate-[rise_0.5s_both] rounded-[2rem] bg-cream p-8 text-center ink-ring cartoon-shadow sm:p-14">
        <span className="inline-block rotate-2 rounded-full bg-glow px-4 py-1 text-xs font-bold ink-ring">
          ជំនួយការសរសេរភាសាខ្មែរ
        </span>
        <h1 className="mt-5 font-display text-5xl font-black leading-[1.05] sm:text-6xl">
          Write big.
          <br />
          Look up anything.
        </h1>
        <p className="mx-auto mt-5 max-w-lg text-ink/70">
          សរសេរដោយទំនុកចិត្ត។ កំណែពិនិត្យអក្ខរាវិរុទ្ធ វេយ្យាករណ៍ និងរចនាបថខ្មែរឲ្យអ្នកភ្លាមៗ។
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/" className="rounded-2xl bg-ink px-6 py-3 font-semibold text-paper ink-ring cartoon-shadow lift">
            ចាប់ផ្តើមសរសេរ
          </Link>
          <Link
            to="/dictionary"
            className="rounded-2xl bg-card px-6 py-3 font-semibold ink-ring cartoon-shadow lift"
          >
            រកមើលពាក្យ
          </Link>
        </div>
      </section>

      <div className="mt-10 grid gap-5 sm:grid-cols-3">
        {FEATURES.map((f) => (
          <Link
            key={f.title}
            to={f.to}
            className={`rounded-3xl ${f.tint} p-6 ink-ring cartoon-shadow lift`}
          >
            <span className="inline-flex size-11 items-center justify-center rounded-2xl bg-card ink-ring">
              <f.icon className="size-5" />
            </span>
            <h2 className="mt-4 font-display text-xl font-bold">{f.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink/70">{f.body}</p>
          </Link>
        ))}
      </div>

      <section className="mt-10 rounded-3xl bg-card p-7 ink-ring cartoon-shadow">
        <div className="flex flex-wrap items-baseline gap-3">
          <h2 className="komnae-brand text-3xl">ភាសា</h2>
          <span className="font-mono text-sm text-ink/60">/pʰiə.saː/</span>
          <span className="rounded-full bg-sage/40 px-3 py-1 text-xs font-semibold ink-ring">នាម</span>
        </div>
        <p className="mt-3 leading-relaxed">សំដីដែលមនុស្សប្រើដើម្បីទំនាក់ទំនងគ្នា។</p>
        <Link to="/dictionary" className="mt-4 inline-block text-sm font-semibold underline underline-offset-4">
          បើកវចនានុក្រម →
        </Link>
      </section>

      <div className="doodle-divider my-12" aria-hidden />

      <section>
        <h2 className="font-display text-3xl font-black">បីស្រទាប់នៃការពិនិត្យ</h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-3">
          {LAYERS.map((l) => (
            <div key={l.n} className="rounded-3xl bg-cream p-6 ink-ring cartoon-shadow-sm">
              <span className="inline-flex size-10 items-center justify-center rounded-full bg-sun font-display text-lg font-black ink-ring">
                {l.n}
              </span>
              <h3 className="mt-4 font-semibold">{l.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink/70">{l.body}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
