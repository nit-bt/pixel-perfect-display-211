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
    unit: "ជាអចិន្ត្រៃយ៍",
    tint: "bg-sage/30",
    features: [
      "ពិនិត្យអក្ខរាវិរុទ្ធមូលដ្ឋាន",
      "២០ ដងក្នុងមួយថ្ងៃ",
      "ឯកសារដល់ ៥០០ ពាក្យ",
    ],
    cta: "ចាប់ផ្តើមឥឡូវ",
    to: "/",
    featured: false,
  },
  {
    name: "Fable",
    kh: "រឿងព្រេង",
    price: "$2",
    unit: "ក្នុងមួយខែ",
    tint: "bg-sun/40",
    features: [
      "ពិនិត្យគ្មានដែនកំណត់",
      "វេយ្យាករណ៍ និងការណែនាំពាក្យពេញលេញ",
      "ឯកសារដល់ ៥,០០០ ពាក្យ",
      "ជួរ AI អាទិភាព",
      "ប្រវត្តិពិនិត្យ និងការតាមដានវឌ្ឍនភាព",
    ],
    cta: "សាកល្បង ៧ ថ្ងៃ",
    to: "/",
    featured: true,
  },
  {
    name: "Empire",
    kh: "អាណាចក្រ",
    price: "$6",
    unit: "ក្នុងមួយខែ",
    tint: "bg-sky/30",
    features: [
      "គ្រប់មុខងារ Fable",
      "គណនីច្រើនអ្នកប្រើ",
      "ពិនិត្យឯកសារជាបណ្តុំ",
      "ការតភ្ជាប់តាម API",
    ],
    cta: "ចាប់ផ្តើមឥឡូវ",
    to: "/",
    featured: false,
  },
  {
    name: "Sovereign",
    kh: "ស្វ័យភាព",
    price: "ទាក់ទងយើង",
    unit: "តម្លៃតាមតម្រូវការ",
    tint: "bg-rose/20",
    features: [
      "ម៉ូដែលដំណើរការលើម៉ាស៊ីនរបស់អ្នក (Ollama / llama.cpp)",
      "ឬដំឡើងពេញលេញតាម Docker លើម៉ាស៊ីនមេរបស់អ្នក",
      "គ្មានការតភ្ជាប់អ៊ីនធឺណិត ទិន្នន័យមិនចេញក្រៅ",
      "គ្មានកម្រិត និងគ្មានដែនកំណត់ចំនួនពាក្យ",
      "សមស្របសម្រាប់សាលា ស្ថាប័នរដ្ឋ និងសារព័ត៌មាន",
    ],
    cta: "ទាក់ទងយើង",
    to: "/home",
    featured: false,
  },
];

// Not yet purchasable. Named separately from PLANS so the live pricing above
// stays the single source of truth for what people can actually buy today.


const FAQ = [
  { q: "តើទិន្នន័យខ្ញុំសុវត្ថិភាពទេ?", a: "អត្ថបទរបស់អ្នកមិនត្រូវបានរក្សាទុកសម្រាប់ការបណ្តុះបណ្តាលទេ។" },
  { q: "តើអាចប្តូរគម្រោងបានទេ?", a: "បាន គ្រប់ពេល ដោយគ្មានការពិន័យ។" },
];

function PricingPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10">
      <header className="text-center">
        {/* Nothing here can be bought yet. Saying so once at the top is more
            honest than four buttons that look live and are not. */}
        <span className="inline-block -rotate-2 rounded-full bg-glow/60 px-4 py-1.5 text-sm font-bold ink-ring cartoon-shadow-sm">
          គម្រោងអនាគត — មិនទាន់ដំណើរការ
        </span>
        <h1 className="mt-5 font-display text-4xl font-black sm:text-5xl">តម្លៃសាមញ្ញ គ្មានលាក់លៀម</h1>
        <p className="mt-3 text-ink/70">
          គម្រោងទាំងនេះកំពុងរៀបចំ។ បច្ចុប្បន្ន កំណែដំណើរការឥតគិតថ្លៃទាំងស្រុង។
        </p>
      </header>

      <div className="mt-12 grid gap-5 sm:grid-cols-2 xl:grid-cols-4 xl:items-start">
        {PLANS.map((p) => (
          <section
            key={p.name}
            className={`relative rounded-3xl ${p.tint} p-6 ink-ring cartoon-shadow lift ${
              p.featured ? "xl:-mt-6 xl:pb-10" : ""
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
              to={p.to}
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
