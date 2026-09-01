import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { Issue } from "@/lib/komnae";

interface EditorProps {
  text: string;
  issues: Issue[];
  activeIndex: number | null;
  onChangeText: (text: string) => void;
  onAccept: (issue: Issue, replacement: string) => void;
  onIgnore: (issue: Issue) => void;
  onActiveIndexChange: (index: number | null) => void;
  onLoadExample: () => void;
  /** True while the AI refinement pass is in flight — accept buttons are disabled. */
  aiRunning: boolean;
}

const PLACEHOLDER = "ចាប់ផ្តើមសរសេរនៅទីនេះ...";

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function buildHtml(text: string, issues: Issue[]) {
  if (!text) return "";
  const sorted = [...issues].filter((i) => i.start >= 0 && i.end <= text.length && i.end > i.start).sort((a, b) => a.start - b.start);
  let html = "";
  let cursor = 0;
  sorted.forEach((issue, index) => {
    if (issue.start < cursor) return; // skip overlaps
    html += escapeHtml(text.slice(cursor, issue.start));
    html += `<span class="komnae-flag komnae-flag--${issue.type}" data-issue="${index}">${escapeHtml(
      text.slice(issue.start, issue.end),
    )}</span>`;
    cursor = issue.end;
  });
  html += escapeHtml(text.slice(cursor));
  return html.replace(/\n/g, "<br>");
}

function getCaretOffset(root: HTMLElement): number | null {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return null;
  const range = sel.getRangeAt(0);
  if (!root.contains(range.startContainer)) return null;
  const pre = range.cloneRange();
  pre.selectNodeContents(root);
  pre.setEnd(range.startContainer, range.startOffset);
  return pre.toString().length;
}

function setCaretOffset(root: HTMLElement, offset: number) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let remaining = offset;
  let node = walker.nextNode() as Text | null;
  let last: Text | null = null;
  while (node) {
    if (remaining <= node.length) {
      const range = document.createRange();
      range.setStart(node, remaining);
      range.collapse(true);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
      return;
    }
    remaining -= node.length;
    last = node;
    node = walker.nextNode() as Text | null;
  }
  if (last) {
    const range = document.createRange();
    range.setStart(last, last.length);
    range.collapse(true);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);
  }
}

export function Editor({
  text,
  issues,
  activeIndex,
  onChangeText,
  onAccept,
  onIgnore,
  onActiveIndexChange,
  onLoadExample,
  aiRunning,
}: EditorProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [popover, setPopover] = useState<{ index: number; top: number; left: number } | null>(null);

  // Re-render decorated HTML whenever the text or issue list changes,
  // restoring the caret at the same character offset.
  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;
    const html = buildHtml(text, issues);
    if (root.innerHTML === html) return;
    const caret = document.activeElement === root ? getCaretOffset(root) : null;
    root.innerHTML = html;
    if (caret !== null) setCaretOffset(root, Math.min(caret, text.length));
  }, [text, issues]);

  const readText = useCallback(() => {
    const root = ref.current;
    if (!root) return "";
    return root.innerText.replace(/\u00a0/g, " ").replace(/\n$/, "");
  }, []);

  const handleInput = () => {
    setPopover(null);
    onActiveIndexChange(null);
    onChangeText(readText());
  };

  const openPopoverFor = useCallback((index: number) => {
    const root = ref.current;
    if (!root) return;
    const el = root.querySelector<HTMLElement>(`[data-issue="${index}"]`);
    if (!el) return;
    const rootRect = root.getBoundingClientRect();
    const rect = el.getBoundingClientRect();
    setPopover({
      index,
      top: rect.bottom - rootRect.top + 8,
      left: Math.max(0, Math.min(rect.left - rootRect.left, root.clientWidth - 300)),
    });
  }, []);

  useEffect(() => {
    if (activeIndex === null) {
      setPopover(null);
      return;
    }
    const root = ref.current;
    const el = root?.querySelector<HTMLElement>(`[data-issue="${activeIndex}"]`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
    openPopoverFor(activeIndex);
  }, [activeIndex, issues, openPopoverFor]);

  const handleClick = (e: React.MouseEvent) => {
    const target = (e.target as HTMLElement).closest<HTMLElement>("[data-issue]");
    if (!target) {
      setPopover(null);
      onActiveIndexChange(null);
      return;
    }
    onActiveIndexChange(Number(target.dataset["issue"]));
  };

  const issue = popover ? issues[popover.index] : null;

  return (
    <div className="relative">
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        spellCheck={false}
        role="textbox"
        aria-multiline="true"
        aria-label="ផ្ទាំងសរសេរ"
        data-empty={text.length === 0}
        onInput={handleInput}
        onClick={handleClick}
        className="komnae-editor min-h-[46vh] outline-none"
      />
      {text.length === 0 && (
        <div className="pointer-events-none absolute inset-0">
          <p className="komnae-editor text-muted-foreground/70">{PLACEHOLDER}</p>
          <button
            type="button"
            onClick={onLoadExample}
            className="pointer-events-auto mt-6 rounded-full border border-border bg-secondary px-4 py-2 text-sm text-secondary-foreground transition-colors hover:bg-accent"
          >
            ខ្ញុំទៅសាលោរៀនកាលពីស្អែក
          </button>
        </div>
      )}

      {issue && popover && (
        <div
          className="absolute z-30 w-[300px] rounded-2xl border border-border bg-popover p-4 text-popover-foreground shadow-[var(--shadow-pop)]"
          style={{ top: popover.top, left: popover.left }}
        >
          <button
            type="button"
            onClick={() => onAccept(issue, issue.suggestion)}
            className="w-full rounded-xl bg-primary px-4 py-3 text-lg font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {issue.suggestion}
          </button>
          {(issue.definition || issue.pos) && (
            <p className="mt-3 text-xs text-muted-foreground">
              {issue.pos ? <span className="font-medium">{issue.pos}</span> : null}
              {issue.pos && issue.definition ? " · " : null}
              {issue.definition}
            </p>
          )}
          <p className="mt-2 text-sm leading-relaxed text-foreground/80">{issue.reason}</p>
          {issue.alternatives.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {issue.alternatives.slice(0, 3).map((alt) => (
                <button
                  key={alt}
                  type="button"
                  onClick={() => onAccept(issue, alt)}
                  className="rounded-full border border-border bg-secondary px-3 py-1 text-sm transition-colors hover:bg-accent"
                >
                  {alt}
                </button>
              ))}
            </div>
          )}
          <button
            type="button"
            onClick={() => onIgnore(issue)}
            className="mt-3 text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
          >
            មិនអើពើ
          </button>
        </div>
      )}
    </div>
  );
}
