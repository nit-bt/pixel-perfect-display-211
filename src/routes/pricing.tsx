import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "តម្លៃ — កំណែ Komnae" },
      {
        name: "description",
        content: "ជ្រើសរើសគម្រោងកំណែ Komnae៖ ឥតគិតថ្លៃ, Fable $2/ខែ, ឬ Empire $4/អ្នកប្រើ។",
      },
      { property: "og:title", content: "តម្លៃ — កំណែ Komnae" },
      {
        property: "og:description",
        content: "គម្រោងសាមញ្ញបីសម្រាប់អ្នកសរសេរខ្មែរ ក្រុម និងស្ថាប័ន។",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PricingPage,
});

const PLANS = [
  {
    name: "Seedling",
    kh: "ពន្លក",
    price: "$0",
    unit: "ជារៀងរហូត",
    tint: "bg-sage/30",
    features: ["ពិនិត្យអក្ខរាវិរុទ្ធគ្មានដែនកំណត់", "វចនានុក្រម ៣៧,៧៧៦ ពាក្យ", "ការណែនាំ AI ៣០ ដងក្នុងមួយថ្ងៃ"],
    cta: "ចាប់ផ្តើមឥឡូវ",
    featured: false,
  },
  {
    name: "Fable",
    kh: "រឿងព្រេង",
    price: "$2",
    unit: "ក្នុងមួយខែ",
    tint: "bg-sun/40",
    features: [
      "ការណែនាំ AI គ្មានដែនកំណត់",
      "ការពិនិត្យរចនាបថ និងសំនៀង",
      "រក្សាទុកឯកសារ និងប្រវត្តិ",
      "សោ Gemini ផ្ទាល់ខ្លួន",
    ],
    cta: "សាកល្បង ៧ ថ្ងៃ",
    featured: true,
  },
  {
    name: "Empire",
    kh: "អាណាចក្រ",
    price: "$4",
    unit: "ក្នុងមួយអ្នកប្រើ/ខែ",
    tint: "bg-sky/30",
    features: ["គ្រប់មុខងារ Fable", "វចនានុក្រមផ្ទាល់ខ្លួនរបស់ស្ថាប័ន", "គណនីក្រុម និងការគ្រប់គ្រង", "ជំនួយអាទិភាព"],
    cta: "ទាក់ទងផ្នែកលក់",
    featured: false,
  },
];

// Not yet purchasable. Named separately from PLANS so the live pricing above
// stays the single source of truth for what people can actually buy today.
const FUTURE_PLANS = [
  {
    name: "សោផ្ទាល់ខ្លួន",
    en: "Bring your own key",
    engine: "Gemini · Claude · OpenAI",
    blurb: "ភ្ជាប់សោ API របស់អ្នកផ្ទាល់។ អត្ថបទទៅដល់អ្នកផ្តល់សេវាដោយផ្ទាល់ មិនឆ្លងកាត់ម៉ាស៊ីនមេរបស់យើងទេ។",
    price: "ឥតគិតថ្លៃ",
    unit: "អ្នកបង់ទៅអ្នកផ្តល់សេវាដោយផ្ទាល់",
    tint: "bg-sage/30",
    features: [
      "សោរក្សាទុកក្នុងកម្មវិធីរុករករបស់អ្នក",
      "យើងមិនឃើញ និងមិនរក្សាទុកសោទេ",
      "ប្តូរអ្នកផ្តល់សេវាបានគ្រប់ពេល",
    ],
    featured: false,
  },
  {
    name: "ម៉ូដែលក្នុងម៉ាស៊ីន",
    en: "Local model",
    engine: "Ollama · llama.cpp",
    blurb: "ដំណើរការម៉ូដែលនៅលើម៉ាស៊ីនរបស់អ្នក។ អត្ថបទមិនចេញពីកុំព្យូទ័រទេ សូម្បីតែមួយពាក្យ។",
    price: "ឥតគិតថ្លៃ",
    unit: "គ្មានការតភ្ជាប់អ៊ីនធឺណិត",
    tint: "bg-sun/40",
    features: [
      "អត្ថបទមិនចេញពីម៉ាស៊ីនរបស់អ្នក",
      "ដំណើរការដោយគ្មានអ៊ីនធឺណិត",
      "គ្មានកម្រិតការប្រើប្រាស់",
      "សមស្របសម្រាប់ឯកសារសម្ងាត់",
    ],
    featured: true,
  },
  {
    name: "ដំឡើងផ្ទាល់ខ្លួន",
    en: "Self-hosted",
    engine: "Docker",
    blurb: "ដំឡើងទាំងវចនានុក្រម និងម៉ូដែលនៅលើម៉ាស៊ីនមេរបស់ស្ថាប័នអ្នក។",
    price: "ឥតគិតថ្លៃ",
    unit: "ប្រភពបើកចំហ",
    tint: "bg-sky/30",
    features: [
      "គ្រប់មុខងារក្នុងម៉ាស៊ីនមេរបស់អ្នក",
      "វចនានុក្រម ៨១,៣៦៩ ពាក្យរួមបញ្ចូល",
      "គ្មានទិន្នន័យចេញក្រៅស្ថាប័ន",
      "កែប្រែកូដបានតាមតម្រូវការ",
    ],
    featured: false,
  },
];

const FAQ = [
  { q: "តើទិន្នន័យខ្ញុំសុវត្ថិភាពទេ?", a: "អត្ថបទរបស់អ្នកមិនត្រូវបានរក្សាទុកសម្រាប់ការបណ្តុះបណ្តាលទេ។" },
  { q: "តើអាចប្តូរគម្រោងបានទេ?", a: "បាន គ្រប់ពេល ដោយគ្មានការពិន័យ។" },
];

function PricingPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10">
      <header className="text-center">
        <h1 className="font-display text-4xl font-black sm:text-5xl">តម្លៃសាមញ្ញ គ្មានលាក់លៀម</h1>
        <p className="mt-3 text-ink/70">ចាប់ផ្តើមឥតគិតថ្លៃ។ ដំឡើងកម្រិតពេលអ្នកត្រៀមរួច។</p>
      </header>

      <div className="mt-12 grid gap-6 md:grid-cols-3 md:items-start">
        {PLANS.map((p) => (
          <section
            key={p.name}
            className={`relative rounded-3xl ${p.tint} p-6 ink-ring cartoon-shadow lift ${
              p.featured ? "md:-mt-6 md:pb-10" : ""
            }`}
          >
            {p.featured && (
              <span className="absolute -right-3 -top-4 rotate-6 rounded-full bg-rose px-3 py-1 text-xs font-bold text-paper ink-ring">
                ពេញនិយមបំផុត
              </span>
            )}
            <h2 className="font-display text-2xl font-black">{p.name}</h2>
            <p className="komnae-brand text-sm text-ink/60">{p.kh}</p>
            <p className="mt-4 font-display text-3xl font-black">{p.price}</p>
            <p className="font-mono text-xs text-ink/60">{p.unit}</p>
            <ul className="mt-6 space-y-2.5">
              {p.features.map((f) => (
                <li key={f} className="flex gap-2 text-sm leading-relaxed">
                  <Check className="mt-0.5 size-4 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <Link
              to="/"
              className={`mt-7 block rounded-2xl px-4 py-3 text-center font-semibold ink-ring cartoon-shadow-sm ${
                p.featured ? "bg-ink text-paper" : "bg-card text-ink"
              }`}
            >
              {p.cta}
            </Link>
          </section>
        ))}
      </div>

      <div className="doodle-divider my-12" aria-hidden />

      <section aria-labelledby="future-plan">
        <header className="text-center">
          <span className="inline-block -rotate-2 rounded-full bg-glow/60 px-3 py-1 text-xs font-bold ink-ring cartoon-shadow-sm">
            មិនទាន់ដំណើរការ
          </span>
          <h2 id="future-plan" className="mt-4 font-display text-3xl font-black sm:text-4xl">
            Future Plan
          </h2>
          <p className="mt-3 text-ink/70">
            ជម្រើសសម្រាប់អ្នកដែលមិនចង់ឱ្យអត្ថបទរបស់ខ្លួនឆ្លងកាត់ម៉ាស៊ីនមេរបស់យើង។
          </p>
        </header>

        <div className="mt-10 grid gap-6 md:grid-cols-3 md:items-start">
          {FUTURE_PLANS.map((p) => (
            <article
              key={p.en}
              className={`relative rounded-3xl ${p.tint} p-6 ink-ring cartoon-shadow ${
                p.featured ? "md:-mt-6 md:pb-10" : ""
              }`}
            >
              {/* Khmer names run much wider than the Latin ones on the
                  plans above, so these need to wrap rather than overflow
                  the card. */}
              <h3 className="font-display text-xl font-black leading-snug break-words">
                {p.name}
              </h3>
              <p className="font-mono text-xs text-ink/60">{p.engine}</p>
              <p className="mt-3 text-sm leading-relaxed text-ink/70">{p.blurb}</p>
              <p className="mt-4 font-display text-2xl font-black leading-snug break-words">
                {p.price}
              </p>
              <p className="font-mono text-xs text-ink/60">{p.unit}</p>
              <ul className="mt-6 space-y-2.5">
                {p.features.map((f) => (
                  <li key={f} className="flex gap-2 text-sm leading-relaxed">
                    <Check className="mt-0.5 size-4 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              {/* Deliberately inert: nothing here can be bought yet, and a
                  button that looks live but does nothing reads as broken. */}
              <button
                type="button"
                disabled
                className="mt-7 block w-full cursor-not-allowed rounded-2xl border-2 border-dashed border-ink/30 bg-card/60 px-4 py-3 text-center font-semibold text-ink/50"
              >
                នឹងមកដល់ឆាប់ៗ
              </button>
            </article>
          ))}
        </div>
      </section>

      <div className="doodle-divider my-12" aria-hidden />

      <section className="grid gap-4 sm:grid-cols-2">
        {FAQ.map((f) => (
          <div key={f.q} className="rounded-2xl bg-cream p-5 ink-ring cartoon-shadow-sm">
            <h3 className="text-lg font-semibold leading-relaxed">{f.q}</h3>
            <p className="mt-2 leading-relaxed text-ink/70">{f.a}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
