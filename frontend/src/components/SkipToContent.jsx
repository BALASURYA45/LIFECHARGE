export default function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded focus:bg-slate-950 focus:px-3 focus:py-2 focus:text-cyan-100 focus:ring-2 focus:ring-cyan-300"
    >
      Skip to content
    </a>
  );
}