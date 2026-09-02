export function SiteFooter() {
  return (
    <footer className="mt-16 bg-ink px-6 py-10 text-paper">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="komnae-brand text-2xl">កំណែ Komnae</p>
          <p className="mt-1 max-w-sm text-sm text-paper/70">
            ជំនួយការសរសេរភាសាខ្មែរ — ពិនិត្យអក្ខរាវិរុទ្ធ វេយ្យាករណ៍ និងរចនាបថ។
          </p>
        </div>
        <p className="font-mono text-xs text-paper/60">
          វចនានុក្រមខ្មែរ ២០២២ · រាជបណ្ឌិត្យសភាកម្ពុជា · ៣៧,៧៧៦ ធាតុ
        </p>
      </div>
    </footer>
  );
}
