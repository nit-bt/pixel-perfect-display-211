import { Link } from "@tanstack/react-router";

const LINKS = [
  { to: "/", label: "កែសម្រួល", en: "Editor" },
  { to: "/dictionary", label: "វចនានុក្រម", en: "Dictionary" },
  { to: "/pricing", label: "តម្លៃ", en: "Pricing" },
  { to: "/home", label: "អំពីយើង", en: "Home" },
] as const;

export function SiteNav() {
  return (
    <div className="sticky top-0 z-40 border-b-2 border-ink/15 bg-paper/80 px-3 py-3 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center gap-3">
        <Link to="/" aria-label="កំណែ Komnae" className="flex h-24 shrink-0 items-center">
          {/* The mark already reads កំណែ, so no wordmark beside it. Height is
              fixed and width auto so the row never reflows while it loads. */}
          <img
            src="/logo.png"
            alt="កំណែ Komnae"
            width={192}
            height={232}
            className="h-20 w-auto"
          />
          <span className="komnae-brand ml-3 whitespace-nowrap text-xl text-ink">
            កំណែ Komnae
          </span>
        </Link>

        {/* The pill hugs its links rather than spanning the width, so it reads
            as a control rather than a header bar. */}
        <nav className="ml-auto rounded-full bg-cream px-2 py-2 ink-ring cartoon-shadow-sm">
          <ul className="flex items-center gap-1">
            {LINKS.map((l) => (
              <li key={l.to}>
                <Link
                  to={l.to}
                  activeOptions={{ exact: l.to === "/" }}
                  className="block whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium text-ink/70 transition-colors hover:bg-paper hover:text-ink [&.active]:bg-ink [&.active]:text-paper"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}
