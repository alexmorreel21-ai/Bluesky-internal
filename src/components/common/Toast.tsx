import { useEffect } from 'react'

interface ToastProps {
  message: string
  type?: 'success' | 'error' | 'info'
  onClose: () => void
}

export function Toast({ message, type = 'info', onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 2600)
    return () => clearTimeout(timer)
  }, [onClose])

  const style =
    type === 'success'
      ? 'bg-emerald-600'
      : type === 'error'
        ? 'bg-rose-600'
        : 'bg-slate-700'

  return (
    <div className={`fixed bottom-5 right-5 z-50 rounded-lg px-4 py-3 text-sm text-white shadow-lg ${style}`}>
      {message}
    </div>
  )
}
