import { Link } from "@tanstack/react-router";

const LINKS = [
  { to: "/", label: "កែសម្រួល", en: "Editor" },
  { to: "/dictionary", label: "វចនានុក្រម", en: "Dictionary" },
  { to: "/pricing", label: "តម្លៃ", en: "Pricing" },
  { to: "/home", label: "អំពីយើង", en: "Home" },
] as const;

export function SiteNav() {
  return (
    <div className="sticky top-0 z-40 px-3 py-3">
      <nav className="mx-auto flex max-w-5xl items-center justify-between gap-3 rounded-full bg-cream px-3 py-2 ink-ring cartoon-shadow-sm">
        <Link to="/" className="flex items-center gap-2 pl-2">
          <span className="inline-block size-4 rotate-12 rounded-[6px] bg-sun ink-ring" aria-hidden />
          <span className="komnae-brand text-lg text-ink">កំណែ</span>
        </Link>
        <ul className="flex items-center gap-1 overflow-x-auto">
          {LINKS.map((l) => (
            <li key={l.to}>
              <Link
                to={l.to}
                activeOptions={{ exact: l.to === "/" }}
                className="block whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium text-ink/70 transition-colors hover:bg-paper hover:text-ink [&.active]:bg-ink [&.active]:text-paper"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
