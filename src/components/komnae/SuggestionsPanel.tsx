import type { Issue } from "@/lib/komnae";
import { toKhmerNumber } from "@/lib/komnae";

interface Props {
  issues: Issue[];
  activeIndex: number | null;
  onSelect: (index: number) => void;
  onAccept: (issue: Issue, replacement: string) => void;
  onIgnore: (issue: Issue) => void;
  onAcceptAll: () => void;
}

const TYPE_LABEL: Record<Issue["type"], string> = {
  spelling: "អក្ខរាវិរុទ្ធ",
  grammar: "វេយ្យាករណ៍",
  style: "រចនាបថ",
};

export function SuggestionsPanel({ issues, activeIndex, onSelect, onAccept, onIgnore, onAcceptAll }: Props) {
  return (
    <div className="flex h-full flex-col text-left">
      <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
        <h2 className="text-left text-3xl font-bold">ការណែនាំ ({toKhmerNumber(issues.length)})</h2>
        {issues.length > 0 && (
          <button
            type="button"
            onClick={onAcceptAll}
            className="ink-ring cartoon-shadow-sm lift rounded-full bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground"
          >
            ទទួលយកទាំងអស់
          </button>
        )}
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {issues.length === 0 && <p className="text-left text-base text-muted-foreground">គ្មានការណែនាំទេ។</p>}
        {issues.map((issue, index) => (
          <div
            key={`${issue.start}-${issue.end}-${issue.suggestion}`}
            className={`ink-ring cartoon-shadow-sm lift w-full rounded-2xl bg-card p-3 text-left ${
              activeIndex === index ? "outline-2 outline-primary" : ""
            }`}
          >
            <button type="button" onClick={() => onSelect(index)} className="w-full text-left">
              <div className="flex items-center justify-between gap-2">
                <span className={`komnae-dot komnae-dot--${issue.type}`} aria-hidden />
                <span className="text-xs uppercase tracking-wide text-muted-foreground">{TYPE_LABEL[issue.type]}</span>
              </div>
              <p className="mt-2 text-left text-lg leading-relaxed">
                {issue.suggestion ? (
                  <>
                    <span className="text-muted-foreground line-through">{issue.original}</span>
                    <span className="mx-2 text-muted-foreground">→</span>
                    <span className="font-semibold">{issue.suggestion}</span>
                  </>
                ) : (
                  <span className="font-semibold">{issue.original}</span>
                )}
              </p>
              <p className="mt-1 text-left text-sm leading-relaxed text-muted-foreground">{issue.reason}</p>
            </button>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {issue.suggestion && (
                <button
                  type="button"
                  onClick={() => onAccept(issue, issue.suggestion)}
                  className="ink-ring cartoon-shadow-sm lift rounded-xl bg-primary px-4 py-2 text-base font-semibold text-primary-foreground"
                >
                  {issue.suggestion}
                </button>
              )}

              {/* Ranking is a guess: several candidates are often one edit away
                  and only the writer knows which was meant. Showing the rest
                  costs a row and removes the need to be right first time. */}
              {issue.alternatives.map((alt) => (
                <button
                  key={alt}
                  type="button"
                  onClick={() => onAccept(issue, alt)}
                  className="ink-ring lift rounded-xl bg-card px-3 py-1.5 text-base"
                >
                  {alt}
                </button>
              ))}

              <button
                type="button"
                onClick={() => onIgnore(issue)}
                className="ml-1 text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
              >
                មិនអើពើ
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
