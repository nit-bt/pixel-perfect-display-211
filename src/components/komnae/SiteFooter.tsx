import { Link } from "@tanstack/react-router";
import {
  Mail,
  MapPin,
  MessageCircle,
  Music2,
  Phone,
  Facebook,
  Instagram,
} from "lucide-react";

const ABOUT_LINKS = [
  { label: "អំពីកំណែ", to: "/home" },
  { label: "របៀបដែលកំណែដំណើរការ", to: "/home" },
  { label: "ផែនការតម្លៃ", to: "/pricing" },
  { label: "មុខងារ", to: "/home" },
  { label: "សំណួរដែលសួរញឹកញាប់", to: "/pricing" },
] as const;

const SERVICE_LINKS = [
  { label: "កែពាក្យខ្មែរ", to: "/" },
  { label: "ពិនិត្យអក្ខរាវិរុទ្ធ", to: "/" },
  { label: "AI Writing Assistant", to: "/" },
  { label: "API សម្រាប់អ្នកអភិវឌ្ឍន៍", to: "/pricing" },
] as const;

const INFO_LINKS = [
  { label: "Privacy Policy", to: "/home" },
  { label: "Terms of Use", to: "/home" },
  { label: "Contact Us", to: "/home" },
] as const;

// Placeholders until the real accounts exist. Inventing URLs would send people
// to pages that are not ours.
const SOCIALS = [
  { label: "Facebook", icon: Facebook, href: "#" },
  { label: "Instagram", icon: Instagram, href: "#" },
  { label: "Telegram", icon: MessageCircle, href: "#" },
  { label: "TikTok", icon: Music2, href: "#" },
  { label: "Email", icon: Mail, href: "mailto:komnaeinfo@gmail.com" },
] as const;

function Heading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-4 flex items-center gap-2 font-display text-lg font-bold text-[#F0E6D2]">
      <span aria-hidden className="text-[#D9A441]">✦</span>
      {children}
    </h3>
  );
}

const linkClass =
  "inline-block text-[#E8DCC8]/75 transition-colors hover:text-[#D9A441]";

export function SiteFooter() {
  return (
    <footer className="mt-16 bg-[#2B1D14] text-[#E8DCC8]">
      <div className="mx-auto w-full max-w-6xl px-5 py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-3 xl:col-span-1">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="" width={192} height={232} className="h-14 w-auto" />
              <div>
                <p className="komnae-brand text-2xl leading-none text-[#F0E6D2]">កំណែ</p>
                <p className="font-display text-sm font-bold tracking-wide text-[#D9A441]">
                  KOMNAE
                </p>
              </div>
            </div>
            <p className="mt-5 max-w-sm leading-relaxed text-[#E8DCC8]/70">
              កំណែជួយអ្នកកែអក្ខរាវិរុទ្ធខ្មែរ និងសរសេរបានត្រឹមត្រូវជាងមុន
              ដោយប្រើវចនានុក្រម និងបញ្ញាសិប្បនិម្មិត។
            </p>
            <p aria-hidden className="mt-4 text-[#D9A441]">✦ ✦ ✦</p>
          </div>

          {/* Contact */}
          <div>
            <Heading>ទំនាក់ទំនង</Heading>
            <ul className="space-y-4">
              <li>
                <a
                  href="tel:+85512760625"
                  className="flex items-start gap-3 transition-colors hover:text-[#D9A441]"
                >
                  <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full border border-[#D9A441]/40 bg-[#3A2A1E]">
                    <Phone className="size-4 text-[#D9A441]" />
                  </span>
                  <span>
                    <span className="block text-sm text-[#E8DCC8]/60">ទូរស័ព្ទ</span>
                    <span className="font-medium">+855 12 760 625</span>
                  </span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:komnaeinfo@gmail.com"
                  className="flex items-start gap-3 transition-colors hover:text-[#D9A441]"
                >
                  <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full border border-[#D9A441]/40 bg-[#3A2A1E]">
                    <Mail className="size-4 text-[#D9A441]" />
                  </span>
                  <span>
                    <span className="block text-sm text-[#E8DCC8]/60">អ៊ីមែល</span>
                    <span className="font-medium break-all">komnaeinfo@gmail.com</span>
                  </span>
                </a>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full border border-[#D9A441]/40 bg-[#3A2A1E]">
                  <MapPin className="size-4 text-[#D9A441]" />
                </span>
                <span>
                  <span className="block text-sm text-[#E8DCC8]/60">ទីតាំង</span>
                  <span className="font-medium">Phnom Penh, Cambodia</span>
                </span>
              </li>
            </ul>
          </div>

          <div>
            <Heading>អំពីយើង</Heading>
            <ul className="space-y-2.5">
              {ABOUT_LINKS.map((l) => (
                <li key={l.label}>
                  <Link to={l.to} className={linkClass}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <Heading>សេវាកម្ម</Heading>
            <ul className="space-y-2.5">
              {SERVICE_LINKS.map((l) => (
                <li key={l.label}>
                  <Link to={l.to} className={linkClass}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <Heading>ព័ត៌មាន</Heading>
            <ul className="space-y-2.5">
              {INFO_LINKS.map((l) => (
                <li key={l.label}>
                  <Link to={l.to} className={linkClass}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <hr className="my-10 border-[#D9A441]/25" />

        <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
          <p className="text-center text-sm text-[#E8DCC8]/60 sm:text-left">
            © 2026 កំណែ (KOMNAE). រក្សាសិទ្ធិគ្រប់យ៉ាង។
          </p>

          <div className="flex items-center gap-4">
            <span className="text-sm text-[#E8DCC8]/70">តាមដានកំណែ</span>
            <ul className="flex items-center gap-2.5">
              {SOCIALS.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    aria-label={s.label}
                    className="flex size-10 items-center justify-center rounded-full border border-[#D9A441]/40 bg-[#3A2A1E] text-[#D9A441] transition-colors hover:bg-[#D9A441] hover:text-[#2B1D14]"
                  >
                    <s.icon className="size-4" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
