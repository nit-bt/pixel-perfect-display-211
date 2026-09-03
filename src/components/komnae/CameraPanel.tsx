import { useCallback, useEffect, useRef, useState } from "react";
import { Camera, Loader2, RotateCcw, TextCursorInput, X } from "lucide-react";
import { extractDataUrl } from "@/lib/komnae";

interface Props {
  /** The kept photo, or null. Owned by the page so it survives this panel. */
  photo: string | null;
  onPhotoChange: (photo: string | null) => void;
  /** Called with text read out of the photo. */
  onTextExtracted: (text: string, note: string) => void;
}

type Status = "idle" | "starting" | "live" | "denied" | "unavailable";

/**
 * Photograph a page to type from, inline beneath the editor.
 *
 * There is no text recognition here. Reading Khmer off a photograph is a hard
 * problem, and a wrong transcription is worse than none: once text is in the
 * editor, a recognition error and a spelling error look identical, and the
 * writer has no way to tell which they are correcting. So the photo stays a
 * photo, pinned beside the text as a reference.
 *
 * Nothing is uploaded. The frame never leaves the browser.
 */
export function CameraPanel({ photo, onPhotoChange, onTextExtracted }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [reading, setReading] = useState(false);
  const [readError, setReadError] = useState("");

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const start = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus("unavailable");
      return;
    }
    onPhotoChange(null);
    setStatus("starting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        // Rear camera on phones: the one pointed at the page.
        video: { facingMode: { ideal: "environment" } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setStatus("live");
    } catch {
      setStatus("denied");
    }
  }, [onPhotoChange]);

  // Release the camera when the component goes away, so the indicator light
  // does not stay on after the user has moved on.
  useEffect(() => stop, [stop]);

  const capture = () => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    onPhotoChange(canvas.toDataURL("image/jpeg", 0.9));
    setStatus("idle");
    stop();
  };

  const close = () => {
    stop();
    setStatus("idle");
  };

  return (
    <section className="mt-4">
{/* The frame is always on the page, so the feature is visible before
          anything is clicked. The camera itself only starts on request:
          holding a live stream open on page load would light the indicator
          and ask permission from people who never wanted it. */}
      {status === "idle" && !photo && (
        <div className="ink-ring cartoon-shadow rounded-3xl bg-cream p-4">
          <div className="mb-3 font-semibold">ថតឯកសារ</div>
          <div className="flex aspect-video items-center justify-center rounded-2xl border-2 border-dashed border-ink/25 bg-paper/50">
            <div className="text-center">
              <Camera className="mx-auto size-8 text-ink/30" />
              <p className="mt-3 text-sm text-ink/60">
                ថតរូបឯកសារ ដើម្បីមើលពេលវាយអត្ថបទ
              </p>
              <button
                type="button"
                onClick={() => void start()}
                className="ink-ring cartoon-shadow-sm lift mt-4 inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 font-semibold text-primary-foreground"
              >
                <Camera className="size-4" />
                បើកកាមេរ៉ា
              </button>
            </div>
          </div>
          <p className="mt-3 text-sm text-ink/60">
            រូបភាពនៅតែក្នុងកម្មវិធីរុករក មិនផ្ញើទៅណាទេ។
          </p>
        </div>
      )}

      {(status === "starting" || status === "live") && (
        <div className="ink-ring cartoon-shadow rounded-3xl bg-cream p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="font-semibold">ថតឯកសារ</span>
            <button
              type="button"
              onClick={close}
              aria-label="បិទកាមេរ៉ា"
              className="rounded-full p-1.5 hover:bg-paper"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="relative overflow-hidden rounded-2xl bg-ink/90 ink-ring">
            <video ref={videoRef} playsInline muted className="w-full" />
            {status === "live" && (
              <div className="pointer-events-none absolute inset-6 rounded-xl border-2 border-dashed border-paper/70" />
            )}
            {status === "starting" && (
              <p className="absolute inset-0 flex items-center justify-center text-paper/80">
                កំពុងបើកកាមេរ៉ា...
              </p>
            )}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={status !== "live"}
              onClick={capture}
              className="ink-ring cartoon-shadow-sm lift inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 font-semibold text-primary-foreground disabled:opacity-50"
            >
              <Camera className="size-4" />
              ថត
            </button>
            <p className="ml-auto text-sm text-ink/60">
              រូបភាពនៅតែក្នុងកម្មវិធីរុករក មិនផ្ញើទៅណាទេ។
            </p>
          </div>
        </div>
      )}

      {photo && status === "idle" && (
        <div className="ink-ring cartoon-shadow rounded-3xl bg-card p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="font-semibold">ឯកសារយោង</span>
            <div className="flex items-center gap-4">
              <button
                type="button"
                disabled={reading}
                onClick={async () => {
                  setReadError("");
                  setReading(true);
                  try {
                    const result = await extractDataUrl(photo);
                    onTextExtracted(result.text, result.note);
                  } catch (err) {
                    setReadError(err instanceof Error ? err.message : "អានមិនបាន");
                  } finally {
                    setReading(false);
                  }
                }}
                className="ink-ring cartoon-shadow-sm lift inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
              >
                {reading ? <Loader2 className="size-3.5 animate-spin" /> : <TextCursorInput className="size-3.5" />}
                {reading ? "កំពុងអាន..." : "អានអត្ថបទ"}
              </button>
              <button
                type="button"
                onClick={() => void start()}
                className="inline-flex items-center gap-1.5 text-sm underline underline-offset-4"
              >
                <RotateCcw className="size-3.5" />
                ថតម្ដងទៀត
              </button>
              <button
                type="button"
                onClick={() => onPhotoChange(null)}
                className="text-sm text-muted-foreground underline underline-offset-4"
              >
                លុបចេញ
              </button>
            </div>
          </div>
          <img
            src={photo}
            alt="ឯកសារយោង"
            className="max-h-96 w-full rounded-2xl object-contain"
          />
          {readError && (
            <p className="mt-3 rounded-xl bg-rose/20 px-3 py-2 text-sm">{readError}</p>
          )}
        </div>
      )}

      {(status === "denied" || status === "unavailable") && (
        <div className="ink-ring cartoon-shadow-sm rounded-2xl bg-rose/20 p-4">
          <p className="font-semibold">
            {status === "denied"
              ? "មិនអាចប្រើកាមេរ៉ាបានទេ"
              : "កម្មវិធីរុករកនេះមិនគាំទ្រកាមេរ៉ាទេ"}
          </p>
          <p className="mt-1 text-sm text-ink/70">
            សូមអនុញ្ញាតការប្រើកាមេរ៉ា រួចព្យាយាមម្ដងទៀត។
          </p>
          <button
            type="button"
            onClick={() => void start()}
            className="ink-ring cartoon-shadow-sm lift mt-3 rounded-2xl bg-card px-4 py-2 font-semibold"
          >
            ព្យាយាមម្ដងទៀត
          </button>
        </div>
      )}
    </section>
  );
}
