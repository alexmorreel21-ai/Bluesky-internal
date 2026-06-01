import { X } from 'lucide-react'

interface ModalProps {
  title: string
  open: boolean
  onClose: () => void
  children: React.ReactNode
  footer?: React.ReactNode
  size?: 'default' | 'large' | 'xlarge'
}

export function Modal({ title, open, onClose, children, footer, size = 'default' }: ModalProps) {
  if (!open) {
    return null
  }

  const sizeClass =
    size === 'xlarge' ? 'max-w-6xl' : size === 'large' ? 'max-w-4xl' : 'max-w-2xl'

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/60 p-4">
      <div className={`w-full ${sizeClass} rounded-xl bg-white shadow-xl dark:bg-slate-900`}>
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{title}</h3>
          <button onClick={onClose} className="rounded p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
            <X size={18} />
          </button>
        </div>
        <div className="max-h-[70vh] overflow-auto px-5 py-4">{children}</div>
        {footer ? <div className="border-t border-slate-200 px-5 py-4 dark:border-slate-700">{footer}</div> : null}
      </div>
    </div>
  )
}
