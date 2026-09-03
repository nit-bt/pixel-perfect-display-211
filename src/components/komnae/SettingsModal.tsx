import { useState } from "react";
import { Check, Loader2, X } from "lucide-react";
import { validateKey } from "@/lib/komnae";

interface Props {
  open: boolean;
  onClose: () => void;
  apiKey: string;
  onApiKeyChange: (key: string) => void;
  autoCheck: boolean;
  onAutoCheckChange: (value: boolean) => void;
  showBoundaries: boolean;
  onShowBoundariesChange: (value: boolean) => void;
}

export function SettingsModal({
  open,
  onClose,
  apiKey,
  onApiKeyChange,
  autoCheck,
  onAutoCheckChange,
  showBoundaries,
  onShowBoundariesChange,
}: Props) {
  const [draft, setDraft] = useState(apiKey);
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  if (!open) return null;

  const test = async () => {
    setTesting(true);
    setResult(null);
    try {
      const res = await validateKey(draft);
      setResult(
        res.valid
          ? { ok: true, message: `សោត្រឹមត្រូវ${res.model ? ` (${res.model})` : ""}` }
          : { ok: false, message: res.error ?? "សោមិនត្រឹមត្រូវ" },
      );
      if (res.valid) onApiKeyChange(draft);
    } catch {
      setResult({ ok: false, message: "មិនអាចភ្ជាប់បានទេ" });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 p-4" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-pop)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">ការកំណត់</h2>
          <button type="button" onClick={onClose} aria-label="បិទ" className="rounded-full p-1 hover:bg-accent">
            <X className="size-4" />
          </button>
        </div>

        <label className="mt-6 block text-sm font-medium" htmlFor="gemini-key">
          សោ Gemini ផ្ទាល់ខ្លួន
        </label>
        <div className="mt-2 flex gap-2">
          <input
            id="gemini-key"
            type="password"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="flex-1 rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            placeholder="AIza..."
          />
          <button
            type="button"
            onClick={test}
            disabled={testing || !draft}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
          >
            {testing && <Loader2 className="size-4 animate-spin" />}
            សាកល្បង
          </button>
        </div>
        {result && (
          <p className={`mt-2 flex items-center gap-1 text-sm ${result.ok ? "text-[var(--success)]" : "text-destructive"}`}>
            {result.ok ? <Check className="size-4" /> : <X className="size-4" />}
            {result.message}
          </p>
        )}
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          សោនេះត្រូវបានរក្សាទុកតែក្នុងកម្មវិធីរុករករបស់អ្នកប៉ុណ្ណោះ មិនដែលផ្ញើទៅម៉ាស៊ីនមេទេ។
        </p>
        <button
          type="button"
          onClick={() => {
            setDraft("");
            onApiKeyChange("");
            setResult(null);
          }}
          className="mt-3 text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
        >
          លុបសោ
        </button>

        <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
          <div>
            <p className="text-sm font-medium">ពិនិត្យពេលវាយអក្សរ</p>
            <p className="text-xs text-muted-foreground">បិទ ដើម្បីពិនិត្យតាមប៊ូតុងវិញ</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={autoCheck}
            onClick={() => onAutoCheckChange(!autoCheck)}
            className={`h-6 w-11 rounded-full p-0.5 transition-colors ${autoCheck ? "bg-primary" : "bg-muted"}`}
          >
            <span
              className={`block size-5 rounded-full bg-background transition-transform ${autoCheck ? "translate-x-5" : ""}`}
            />
          </button>
        </div>

        {/* A debugging view rather than a writing feature: useful when
            segmentation misbehaves, noise for anyone just writing. */}
        <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
          <div>
            <p className="text-sm font-medium">បង្ហាញព្រំដែនពាក្យ</p>
            <p className="text-xs text-muted-foreground">សម្រាប់អ្នកអភិវឌ្ឍន៍៖ បង្ហាញកន្លែងបំបែកពាក្យ</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={showBoundaries}
            onClick={() => onShowBoundariesChange(!showBoundaries)}
            className={`h-6 w-11 rounded-full p-0.5 transition-colors ${showBoundaries ? "bg-primary" : "bg-muted"}`}
          >
            <span
              className={`block size-5 rounded-full bg-background transition-transform ${showBoundaries ? "translate-x-5" : ""}`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
