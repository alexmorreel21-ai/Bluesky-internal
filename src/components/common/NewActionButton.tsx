import { Plus } from 'lucide-react'

interface NewActionButtonProps {
  onClick: () => void
  label: string
}

export function NewActionButton({ onClick, label }: NewActionButtonProps) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-sky-500 text-white shadow-[0_10px_24px_rgba(56,189,248,0.45)] transition hover:bg-sky-400 active:scale-95"
    >
      <Plus size={26} strokeWidth={2.2} />
    </button>
  )
}
