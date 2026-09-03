import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Check, ChevronRight, Loader2, PanelRightClose, Settings } from "lucide-react";
import { Editor } from "@/components/komnae/Editor";
import { SuggestionsPanel } from "@/components/komnae/SuggestionsPanel";
import { SettingsModal } from "@/components/komnae/SettingsModal";
import { UploadToolbar } from "@/components/komnae/UploadToolbar";
import { CameraPanel } from "@/components/komnae/CameraPanel";
import {
  GEMINI_KEY_STORAGE,
  checkText,
  countWords,
  refineText,
  toKhmerNumber,
  type Boundary,
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
  const [notice, setNotice] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [boundaries, setBoundaries] = useState<Boundary[]>([]);
  const [photo, setPhoto] = useState<string | null>(null);
  const [showBoundaries, setShowBoundaries] = useState(false);

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
        setBoundaries(phase1.boundaries ?? []);
        setChecking(false);

        // The AI pass is not started here. It runs on its own, longer timer:
        // see the effect below.
      } catch {
        if (id !== requestId.current) return;
        setChecking(false);
        setAiState("idle");
      }
    },
    [apiKey],
  );

  // The dictionary pass is local and costs nothing, so it can fire on a
  // short pause. Underlines appear while the writer is still looking at the
  // word they just typed.
  useEffect(() => {
    if (!autoCheck) return;
    const t = setTimeout(() => void runCheck(text), 600);
    return () => clearTimeout(t);
  }, [text, autoCheck, runCheck]);

  // The AI pass costs a request each time and takes anywhere from three to
  // forty seconds, so it waits for a real pause rather than a gap between
  // words. Typing continuously never triggers it; stopping to think does.
  useEffect(() => {
    if (!autoCheck || !text.trim() || issues.length === 0) return;

    const t = setTimeout(async () => {
      const id = requestId.current;
      setAiState("running");
      try {
        const refined = await refineText(text, issues, apiKey || null);
        if (id !== requestId.current) return; // the writer moved on
        // Nothing to apply when there is no key: the response is the request
        // sent back, and showing a tick would claim work that never happened.
        if (refined.ai === "no_key" || refined.ai === "skipped") {
          setAiState("idle");
          return;
        }
        setIssues(refined.issues);
        setAiState("done");
      } catch {
        if (id !== requestId.current) return;
        setAiState("failed"); // phase 1 underlines stand
      }
    }, 2500);

    return () => clearTimeout(t);
    // Deliberately keyed on text, not issues: re-running whenever the issue
    // list changes would loop, since this effect sets that list.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, autoCheck, apiKey]);

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
    [...visibleIssues]
      .filter((i) => i.suggestion)
      .sort((a, b) => b.start - a.start)
      .forEach((i) => {
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

  const ignoreIssue = (issue: Issue) => {
    setIgnored((prev) => [...prev, `${issue.start}:${issue.end}:${issue.suggestion}`]);
    setActiveIndex(null);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex items-center border-b border-border bg-background/80 px-5 py-3 backdrop-blur">
  
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

      <div className="flex flex-1">
        <main className="flex-1 px-4 py-10 pb-40 lg:pb-10">
          <div className="mx-auto w-full max-w-[760px]">
            <UploadToolbar
              onSetText={(v) => { setNotice(""); setUploadError(""); handleChangeText(v); }}
              onExtracted={(v, note) => { setUploadError(""); setNotice(note); handleChangeText(v); }}
              onError={(msg) => { setNotice(""); setUploadError(msg); }}
            />

            {(notice || uploadError) && (
              <div className={`ink-ring cartoon-shadow-sm mb-4 rounded-2xl px-4 py-3 text-sm ${uploadError ? "bg-rose/20" : "bg-sun/20"}`}>
                {uploadError || notice}
              </div>
            )}

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
                  className="ink-ring cartoon-shadow-sm lift rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground"
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
                boundaries={boundaries}
                showBoundaries={showBoundaries}
              />
            </div>

            {/* Footer strip */}
            <div className="ink-ring cartoon-shadow-sm mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-2xl bg-card px-4 py-3 text-sm text-muted-foreground">
              <span>{toKhmerNumber(words)} ពាក្យ</span>
              <span>{toKhmerNumber(chars)} តួអក្សរ</span>
            </div>

            <CameraPanel
              photo={photo}
              onPhotoChange={setPhoto}
              onTextExtracted={(v, note) => {
                setUploadError("");
                setNotice(note);
                handleChangeText(v);
              }}
            />

          </div>
        </main>

        {panelOpen && (
          <aside className="sticky top-32 hidden h-[calc(100vh-8rem)] w-[320px] shrink-0 border-l border-border bg-sidebar lg:block">
            <SuggestionsPanel
              issues={visibleIssues}
              activeIndex={activeIndex}
              onSelect={setActiveIndex}
              onAccept={applyReplacement}
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
            onAccept={applyReplacement}
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
        showBoundaries={showBoundaries}
        onShowBoundariesChange={setShowBoundaries}
      />
    </div>
  );
}
