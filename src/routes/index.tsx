import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Check, ChevronRight, Loader2, PanelRightClose, Settings } from "lucide-react";
import { Editor } from "@/components/komnae/Editor";
import { SuggestionsPanel } from "@/components/komnae/SuggestionsPanel";
import { SettingsModal } from "@/components/komnae/SettingsModal";
import {
  GEMINI_KEY_STORAGE,
  checkText,
  countWords,
  refineText,
  toKhmerNumber,
  type Issue,
} from "@/lib/komnae";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "កំណែ Komnae — ជំនួយការសរសេរភាសាខ្មែរ" },
      {
        name: "description",
        content: "កំណែ Komnae ជាកម្មវិធីពិនិត្យអក្ខរាវិរុទ្ធ វេយ្យាករណ៍ និងរចនាបថភាសាខ្មែរ ដោយប្រើ AI។",
      },
      { property: "og:title", content: "កំណែ Komnae — ជំនួយការសរសេរភាសាខ្មែរ" },
      {
        property: "og:description",
        content: "ពិនិត្យអក្ខរាវិរុទ្ធ វេយ្យាករណ៍ និងរចនាបថភាសាខ្មែរភ្លាមៗ ជាមួយការណែនាំដោយ AI។",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Komnae,
});

const EXAMPLE = "ខ្ញុំទៅសាលោរៀនកាលពីស្អែក";

type AiState = "idle" | "running" | "done" | "failed";

function Komnae() {
  const [text, setText] = useState("");
  const [issues, setIssues] = useState<Issue[]>([]);
  const [checking, setChecking] = useState(false);
  const [aiState, setAiState] = useState<AiState>("idle");
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [panelOpen, setPanelOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [autoCheck, setAutoCheck] = useState(true);
  const [ignored, setIgnored] = useState<string[]>([]);

  const requestId = useRef(0);

  useEffect(() => {
    const stored = localStorage.getItem(GEMINI_KEY_STORAGE);
    if (stored) setApiKey(stored);
  }, []);

  const saveApiKey = (key: string) => {
    setApiKey(key);
    if (key) localStorage.setItem(GEMINI_KEY_STORAGE, key);
    else localStorage.removeItem(GEMINI_KEY_STORAGE);
  };

  const runCheck = useCallback(
    async (value: string) => {
      const id = ++requestId.current;
      if (!value.trim()) {
        setIssues([]);
        setChecking(false);
        setAiState("idle");
        return;
      }
      setChecking(true);
      setAiState("idle");
      try {
        // Phase 1 — fast dictionary pass.
        const phase1 = await checkText(value, apiKey || null);
        if (id !== requestId.current) return;
        setIssues(phase1.issues);
        setChecking(false);

        // Phase 2 — slow AI refinement; never blocks the editor.
        setAiState("running");
        try {
          const phase2 = await refineText(value, phase1.issues, apiKey || null);
          if (id !== requestId.current) return; // stale response, discard
          setIssues(phase2.issues);
          setAiState("done");
        } catch {
          if (id !== requestId.current) return;
          setAiState("failed"); // keep phase 1 underlines
        }
      } catch {
        if (id !== requestId.current) return;
        setChecking(false);
        setAiState("idle");
      }
    },
    [apiKey],
  );

  // Debounced auto-check.
  useEffect(() => {
    if (!autoCheck) return;
    const t = setTimeout(() => void runCheck(text), 2500);
    return () => clearTimeout(t);
  }, [text, autoCheck, runCheck]);

  const visibleIssues = issues.filter((i) => !ignored.includes(`${i.start}:${i.end}:${i.suggestion}`));

  const handleChangeText = (value: string) => {
    requestId.current++; // invalidate in-flight passes
    setText(value);
    setAiState("idle");
    if (autoCheck) setChecking(true);
  };

  const applyReplacement = (issue: Issue, replacement: string) => {
    const next = text.slice(0, issue.start) + replacement + text.slice(issue.end);
    const delta = replacement.length - (issue.end - issue.start);
    setText(next);
    setIssues((prev) =>
      prev
        .filter((i) => !(i.start === issue.start && i.end === issue.end))
        .map((i) => (i.start >= issue.end ? { ...i, start: i.start + delta, end: i.end + delta } : i)),
    );
    setActiveIndex(null);
  };

  const acceptAll = () => {
    let next = text;
    // Apply from the end so earlier offsets stay valid.
    [...visibleIssues].sort((a, b) => b.start - a.start).forEach((i) => {
      next = next.slice(0, i.start) + i.suggestion + next.slice(i.end);
    });
    setText(next);
    setIssues([]);
    setActiveIndex(null);
  };

  const statusLabel = checking
    ? "កំពុងពិនិត្យ..."
    : visibleIssues.length > 0
      ? `រកឃើញ ${toKhmerNumber(visibleIssues.length)} កំហុស`
      : "គ្មានកំហុស";

  const words = countWords(text);
  const chars = text.length;
  const readingMinutes = Math.max(1, Math.ceil(words / 180));

  const ignoreIssue = (issue: Issue) => {
    setIgnored((prev) => [...prev, `${issue.start}:${issue.end}:${issue.suggestion}`]);
    setActiveIndex(null);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex items-center justify-between border-b border-border bg-background/80 px-5 py-3 backdrop-blur">
        <span className="komnae-brand text-xl">កំណែ Komnae</span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setPanelOpen((v) => !v)}
            aria-label="បិទ/បើកផ្ទាំងណែនាំ"
            className="hidden rounded-full p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground lg:inline-flex"
          >
            {panelOpen ? <PanelRightClose className="size-5" /> : <ChevronRight className="size-5" />}
          </button>
          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            aria-label="ការកំណត់"
            className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <Settings className="size-5" />
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 overflow-y-auto px-4 py-10 pb-40 lg:pb-10">
          <div className="mx-auto w-full max-w-[760px]">
            {/* Chunky toolbar */}
            <div className="ink-ring cartoon-shadow-sm mb-5 flex flex-wrap items-center gap-3 rounded-2xl bg-cream px-4 py-3">
              <span className="ink-ring cartoon-shadow-sm rounded-full bg-sun px-3 py-1 text-sm font-semibold text-ink">
                {statusLabel}
              </span>
              {aiState === "running" && (
                <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" /> AI កំពុងពិនិត្យ...
                </span>
              )}
              {aiState === "done" && (
                <span className="inline-flex items-center gap-1.5 text-sm text-[var(--success)]">
                  <Check className="size-4" /> AI
                </span>
              )}
              {aiState === "failed" && (
                <span className="text-sm text-muted-foreground/70">AI មិនបានពិនិត្យ</span>
              )}
              {!autoCheck && (
                <button
                  type="button"
                  onClick={() => void runCheck(text)}
                  className="ink-ring cartoon-shadow-sm lift ml-auto rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground"
                >
                  ពិនិត្យ
                </button>
              )}
            </div>

            {/* Cream paper writing surface */}
            <div className="ink-ring cartoon-shadow rounded-3xl bg-cream px-8 py-10 sm:px-12">
              <Editor
                text={text}
                issues={visibleIssues}
                activeIndex={activeIndex}
                onChangeText={handleChangeText}
                onAccept={applyReplacement}
                onIgnore={ignoreIssue}
                onActiveIndexChange={setActiveIndex}
                onLoadExample={() => handleChangeText(EXAMPLE)}
                aiRunning={aiState === "running"}
              />
            </div>

            {/* Footer strip */}
            <div className="ink-ring cartoon-shadow-sm mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-2xl bg-card px-4 py-3 text-sm text-muted-foreground">
              <span>{toKhmerNumber(words)} ពាក្យ</span>
              <span>{toKhmerNumber(chars)} តួអក្សរ</span>
              <span>ពេលអាន ~{toKhmerNumber(readingMinutes)} នាទី</span>
            </div>
          </div>
        </main>

        {panelOpen && (
          <aside className="hidden w-[320px] shrink-0 border-l border-border bg-sidebar lg:block">
            <SuggestionsPanel
              issues={visibleIssues}
              activeIndex={activeIndex}
              onSelect={setActiveIndex}
              onAccept={(issue) => applyReplacement(issue, issue.suggestion)}
              onIgnore={ignoreIssue}
              onAcceptAll={acceptAll}
            />
          </aside>
        )}
      </div>

      {/* Mobile bottom sheet */}
      <div className="fixed inset-x-0 bottom-0 z-40 max-h-[55vh] overflow-hidden rounded-t-3xl border-t border-border bg-sidebar shadow-[var(--shadow-pop)] lg:hidden">
        <div className="max-h-[55vh] overflow-y-auto">
          <SuggestionsPanel
            issues={visibleIssues}
            activeIndex={activeIndex}
            onSelect={setActiveIndex}
            onAccept={(issue) => applyReplacement(issue, issue.suggestion)}
            onIgnore={ignoreIssue}
            onAcceptAll={acceptAll}
          />
        </div>
      </div>

      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        apiKey={apiKey}
        onApiKeyChange={saveApiKey}
        autoCheck={autoCheck}
        onAutoCheckChange={setAutoCheck}
      />
    </div>
  );
}
