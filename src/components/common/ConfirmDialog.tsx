import { Modal } from './Modal'

interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  onCancel: () => void
  onConfirm: () => void
}

export function ConfirmDialog({ open, title, message, onCancel, onConfirm }: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      title={title}
      onClose={onCancel}
      footer={
        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
            Cancel
          </button>
          <button onClick={onConfirm} className="rounded-lg bg-rose-600 px-3 py-2 text-sm font-semibold text-white">
            Confirm
          </button>
        </div>
      }
    >
      <p className="text-sm text-slate-600 dark:text-slate-200">{message}</p>
    </Modal>
  )
}
