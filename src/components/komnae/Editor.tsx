import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { Boundary, Issue } from "@/lib/komnae";

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
  boundaries?: Boundary[];
  showBoundaries?: boolean;
}

const PLACEHOLDER = "ចាប់ផ្តើមសរសេរនៅទីនេះ...";

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// An empty span, so it contributes nothing to innerText. Anything with
// content here would be read back by readText() and corrupt the document,
// taking every character offset with it.
const BREAK_MARKER = '<span class="komnae-wb" aria-hidden="true"></span>';

/** Escape a slice, inserting break markers at any boundary inside it. */
function emit(text: string, from: number, to: number, marks: number[]) {
  let out = "";
  let cursor = from;
  for (const at of marks) {
    if (at > from && at < to) {
      out += escapeHtml(text.slice(cursor, at)) + BREAK_MARKER;
      cursor = at;
    }
  }
  return out + escapeHtml(text.slice(cursor, to));
}

function buildHtml(text: string, issues: Issue[], marks: number[]) {
  if (!text) return "";
  const sorted = [...issues].filter((i) => i.start >= 0 && i.end <= text.length && i.end > i.start).sort((a, b) => a.start - b.start);
  let html = "";
  let cursor = 0;
  sorted.forEach((issue, index) => {
    if (issue.start < cursor) return; // skip overlaps
    html += emit(text, cursor, issue.start, marks);

    // A boundary landing exactly on the flagged span is dropped by emit's
    // strict bounds, which is precisely the bar on either side of a
    // misspelled word. Place those two here instead.
    if (marks.includes(issue.start) && issue.start > 0) html += BREAK_MARKER;

    const cls = issue.suggestion ? `komnae-flag--${issue.type}` : "komnae-flag--empty";
    html += `<span class="komnae-flag ${cls}" data-issue="${index}">${emit(
      text, issue.start, issue.end, marks,
    )}</span>`;
    if (marks.includes(issue.end) && issue.end < text.length) html += BREAK_MARKER;

    cursor = issue.end;
  });
  html += emit(text, cursor, text.length, marks);
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
  boundaries,
  showBoundaries = false,
}: EditorProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [popover, setPopover] = useState<{ index: number; top: number; left: number } | null>(null);

  // Re-render decorated HTML whenever the text or issue list changes,
  // restoring the caret at the same character offset.
  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;
    const marks =
      showBoundaries && boundaries
        ? boundaries.map((b) => b.start).filter((n) => n > 0)
        : [];
    const html = buildHtml(text, issues, marks);
    if (root.innerHTML === html) return;
    const caret = document.activeElement === root ? getCaretOffset(root) : null;
    root.innerHTML = html;
    if (caret !== null) setCaretOffset(root, Math.min(caret, text.length));
  }, [text, issues, boundaries, showBoundaries]);

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
        className="komnae-editor min-h-[320px] outline-none"
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
            disabled={aiRunning}
            onClick={() => onAccept(issue, issue.suggestion)}
            className="w-full rounded-xl bg-primary px-4 py-3 text-lg font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {issue.suggestion}
          </button>
          {aiRunning && (
            <p className="mt-2 text-xs text-muted-foreground">AI កំពុងពិនិត្យ សូមរង់ចាំ...</p>
          )}
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
                  disabled={aiRunning}
                  onClick={() => onAccept(issue, alt)}
                  className="rounded-full border border-border bg-secondary px-3 py-1 text-sm transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
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
