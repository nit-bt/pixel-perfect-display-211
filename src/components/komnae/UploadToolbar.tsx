import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronDown, FilePlus2, Loader2, ScanLine, Upload } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ACCEPTED_UPLOAD_TYPES, extractDocument } from "@/lib/komnae";

const SAMPLE = "ខ្ញុំទៅសាលោរៀនកាលពីស្អែក";

const LONGER_SAMPLE = `សិស្សទាំងអស់ត្រូវអានសៀវភៅរាល់ថ្ងៃ
ខ្ញុំទៅសាលោរៀនកាលពីស្អែក
គាត់ជាគ្រូបង្រៀនភាសាខ្មែរនៅភ្នំពេញ`;

interface Props {
  /** Called with extracted text and an optional Khmer warning. */
  onExtracted: (text: string, note: string) => void;
  /** Called with a Khmer message the user should see. */
  onError: (message: string) => void;
  /** Replace the editor contents outright. */
  onSetText: (text: string) => void;
}

export function UploadToolbar({ onExtracted, onError, onSetText }: Props) {
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      setBusy(true);
      try {
        const result = await extractDocument(file);
        onExtracted(result.text, result.note);
      } catch (err) {
        // Backend errors arrive already written in Khmer for the user.
        onError(err instanceof Error ? err.message : "មិនអាចអានឯកសារនេះបានទេ");
      } finally {
        setBusy(false);
      }
    },
    [onExtracted, onError],
  );

  // Drag-and-drop anywhere on the page. Registered on window rather than a
  // single element so a file dropped slightly off-target still lands.
  useEffect(() => {
    let depth = 0;

    const onDragEnter = (e: DragEvent) => {
      if (!e.dataTransfer?.types.includes("Files")) return;
      depth += 1;
      setDragging(true);
    };
    const onDragLeave = () => {
      depth = Math.max(0, depth - 1);
      if (depth === 0) setDragging(false);
    };
    const onDragOver = (e: DragEvent) => {
      if (e.dataTransfer?.types.includes("Files")) e.preventDefault();
    };
    const onDrop = (e: DragEvent) => {
      if (!e.dataTransfer?.files.length) return;
      e.preventDefault();
      depth = 0;
      setDragging(false);
      void handleFile(e.dataTransfer.files[0]);
    };

    window.addEventListener("dragenter", onDragEnter);
    window.addEventListener("dragleave", onDragLeave);
    window.addEventListener("dragover", onDragOver);
    window.addEventListener("drop", onDrop);
    return () => {
      window.removeEventListener("dragenter", onDragEnter);
      window.removeEventListener("dragleave", onDragLeave);
      window.removeEventListener("dragover", onDragOver);
      window.removeEventListener("drop", onDrop);
    };
  }, [handleFile]);

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        {/* New doc */}
        <DropdownMenu>
          <div className="ink-ring cartoon-shadow-sm lift flex items-stretch overflow-hidden rounded-2xl bg-primary text-primary-foreground">
            <button
              type="button"
              onClick={() => onSetText("")}
              className="inline-flex items-center gap-2 px-4 py-2.5 font-semibold"
            >
              <FilePlus2 className="size-4" />
              ឯកសារថ្មី
            </button>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label="ជម្រើសឯកសារថ្មី"
                className="border-l border-primary-foreground/25 px-2.5"
              >
                <ChevronDown className="size-4" />
              </button>
            </DropdownMenuTrigger>
          </div>
          <DropdownMenuContent align="start" className="ink-ring cartoon-shadow-sm rounded-xl">
            <DropdownMenuItem onSelect={() => onSetText("")}>ទទេ</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onSetText(SAMPLE)}>
              គំរូខ្លី (មានកំហុស)
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onSetText(LONGER_SAMPLE)}>
              គំរូវែង (មានកំហុស)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Upload */}
        <DropdownMenu>
          <div className="ink-ring cartoon-shadow-sm lift flex items-stretch overflow-hidden rounded-2xl border-dashed bg-card">
            <button
              type="button"
              disabled={busy}
              onClick={() => inputRef.current?.click()}
              className="inline-flex items-center gap-2 px-4 py-2.5 font-semibold disabled:opacity-60"
            >
              {busy ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
              {busy ? "កំពុងអាន..." : "បញ្ចូលឯកសារ"}
            </button>
            <DropdownMenuTrigger asChild>
              <button type="button" aria-label="ប្រភេទឯកសារ" className="border-l border-border px-2.5">
                <ChevronDown className="size-4" />
              </button>
            </DropdownMenuTrigger>
          </div>
          <DropdownMenuContent align="start" className="ink-ring cartoon-shadow-sm rounded-xl">
            <DropdownMenuItem onSelect={() => inputRef.current?.click()}>
              PDF (.pdf)
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => inputRef.current?.click()}>
              Word (.docx)
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => inputRef.current?.click()}>
              អត្ថបទ (.txt, .md)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Scan — not built yet, and labelled as such rather than left to look broken. */}
        <div className="inline-flex items-center gap-2 rounded-2xl border-2 border-dashed border-border px-4 py-2.5 text-sm text-muted-foreground/70">
          <ScanLine className="size-4" />
          ស្កេនរូបភាព
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs">កំពុងអភិវឌ្ឍ</span>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_UPLOAD_TYPES}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            // Reset so selecting the same file twice still fires a change.
            e.target.value = "";
            if (file) void handleFile(file);
          }}
        />
      </div>

      {dragging && (
        <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-ink/20 backdrop-blur-sm">
          <div className="ink-ring cartoon-shadow rounded-3xl bg-cream px-10 py-8 text-center">
            <Upload className="mx-auto mb-3 size-8" />
            <p className="text-lg font-semibold">ទម្លាក់ឯកសារនៅទីនេះ</p>
            <p className="mt-1 text-sm text-muted-foreground">PDF, Word ឬ អត្ថបទ</p>
          </div>
        </div>
      )}
    </>
  );
}
