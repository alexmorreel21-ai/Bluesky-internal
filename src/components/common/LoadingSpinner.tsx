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
      <div className="w-full max-w-md rounded-3xl border border-slate-700/70 bg-slate-900/80 p-8 text-center shadow-[0_30px_80px_rgba(15,23,42,0.6)] backdrop-blur-sm">
        <div className="relative mx-auto h-24 w-24">
          <span className="absolute inset-0 animate-spin rounded-full border-[3px] border-slate-700 border-t-sky-300" />
          <span
            className="absolute inset-3 animate-spin rounded-full border-[3px] border-transparent border-t-emerald-300"
            style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}
          />
          <span className="absolute inset-[34%] rounded-full bg-sky-300/30 blur-sm" />
        </div>

        <p className="mt-6 text-lg font-semibold text-slate-100">{label}</p>
        <p className="mt-2 text-sm text-slate-400">{hint}</p>

        <div className="mt-5 flex items-center justify-center gap-1.5">
          <span className="h-2 w-2 animate-pulse rounded-full bg-sky-300" />
          <span className="h-2 w-2 animate-pulse rounded-full bg-sky-200" style={{ animationDelay: '120ms' }} />
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-300" style={{ animationDelay: '240ms' }} />
        </div>
      </div>
    </div>
  )
}
