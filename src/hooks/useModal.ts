import { useCallback, useState } from 'react'

export function useModal<T = null>() {
  const [isOpen, setIsOpen] = useState(false)
  const [payload, setPayload] = useState<T | null>(null)

  const open = useCallback((value?: T) => {
    if (value !== undefined) {
      setPayload(value)
    }
    setIsOpen(true)
  }, [])

  const close = useCallback(() => {
    setIsOpen(false)
    setPayload(null)
  }, [])

  return { isOpen, payload, open, close }
}
