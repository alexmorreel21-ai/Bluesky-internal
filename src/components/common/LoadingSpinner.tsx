type LoadingSpinnerProps = {
  label?: string
  hint?: string
  fullscreen?: boolean
}

export function LoadingSpinner({
  label = 'Loading your workspace',
  hint = 'Please wait a moment while we prepare the page.',
  fullscreen = false,
}: LoadingSpinnerProps) {
  const containerClass = fullscreen ? 'min-h-screen' : 'min-h-[56vh]'

  return (
    <div className={`grid place-items-center ${containerClass}`} role="status" aria-live="polite" aria-busy="true">
      <div className="w-full max-w-md rounded-3xl border border-sky-100 bg-white/90 p-8 text-center shadow-[0_30px_80px_rgba(125,211,252,0.18)] backdrop-blur-sm dark:border-slate-700/70 dark:bg-slate-900/80 dark:shadow-[0_30px_80px_rgba(15,23,42,0.6)]">
        <div className="relative mx-auto grid h-24 w-24 place-items-center rounded-full bg-sky-50 ring-1 ring-sky-200/90 dark:bg-slate-800 dark:ring-slate-600">
          <span className="absolute inset-0 animate-pulse rounded-full border-2 border-sky-300/70 dark:border-sky-500/40" />
          <svg
            viewBox="0 0 80 80"
            aria-hidden="true"
            className="h-16 w-16 text-sky-500 dark:text-sky-300"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M15 46 C25 30, 41 24, 58 27"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <path
              d="M18 51 C32 55, 49 55, 64 46"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <path
              d="M58 27 C63 26, 66 28, 68 32"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <path
              d="M61 36 C66 37, 69 40, 70 44"
              stroke="currentColor"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            <circle cx="52" cy="31" r="2" fill="currentColor" />
          </svg>
        </div>

        <p className="mt-6 text-3xl font-bold tracking-wide text-sky-400 dark:text-sky-300">BlueSky</p>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{label}</p>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{hint}</p>

        <div className="mt-5 flex items-center justify-center gap-1.5">
          <span className="h-2 w-2 animate-pulse rounded-full bg-sky-300" />
          <span className="h-2 w-2 animate-pulse rounded-full bg-sky-200" style={{ animationDelay: '120ms' }} />
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-300" style={{ animationDelay: '240ms' }} />
        </div>
      </div>
    </div>
  )
}
