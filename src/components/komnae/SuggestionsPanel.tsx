import type { Issue } from "@/lib/komnae";
import { toKhmerNumber } from "@/lib/komnae";

interface Props {
  issues: Issue[];
  activeIndex: number | null;
  onSelect: (index: number) => void;
  onAcceptAll: () => void;
}

const TYPE_LABEL: Record<Issue["type"], string> = {
  spelling: "អក្ខរាវិរុទ្ធ",
  grammar: "វេយ្យាករណ៍",
  style: "រចនាបថ",
};

export function SuggestionsPanel({ issues, activeIndex, onSelect, onAcceptAll }: Props) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold">ការណែនាំ ({toKhmerNumber(issues.length)})</h2>
        {issues.length > 0 && (
          <button
            type="button"
            onClick={onAcceptAll}
            className="rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            ទទួលយកទាំងអស់
          </button>
        )}
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {issues.length === 0 && <p className="text-sm text-muted-foreground">គ្មានការណែនាំទេ។</p>}
        {issues.map((issue, index) => (
          <button
            key={`${issue.start}-${issue.end}-${issue.suggestion}`}
            type="button"
            onClick={() => onSelect(index)}
            className={`w-full rounded-xl border bg-card p-3 text-right shadow-[var(--shadow-card)] transition-colors ${
              activeIndex === index ? "border-primary" : "border-border hover:border-primary/40"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className={`komnae-dot komnae-dot--${issue.type}`} aria-hidden />
              <span className="text-[11px] uppercase tracking-wide text-muted-foreground">{TYPE_LABEL[issue.type]}</span>
            </div>
            <p className="mt-2 text-base leading-relaxed">
              <span className="text-muted-foreground line-through">{issue.original}</span>
              <span className="mx-2 text-muted-foreground">→</span>
              <span className="font-semibold">{issue.suggestion}</span>
            </p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{issue.reason}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
