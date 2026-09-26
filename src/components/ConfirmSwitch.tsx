import { useEffect, useRef } from 'react'

type ConfirmSwitchProps = {
  currentTitle: string
  nextTitle: string
  onCancel: () => void
  onConfirm: () => void
}

export function ConfirmSwitch({
  currentTitle,
  nextTitle,
  onCancel,
  onConfirm,
}: ConfirmSwitchProps) {
  const cancelRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    cancelRef.current?.focus()
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onCancel])

  return (
    <div className="confirm-backdrop" onClick={onCancel}>
      <div
        className="confirm-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-switch-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="confirm-switch-title">Thoát game đang chơi?</h2>
        <p>
          Bạn đang mở <strong>{currentTitle}</strong>. Chuyển sang{' '}
          <strong>{nextTitle}</strong> sẽ thoát game hiện tại.
        </p>
        <div className="confirm-actions">
          <button type="button" ref={cancelRef} onClick={onCancel}>
            Ở lại
          </button>
          <button type="button" className="is-danger" onClick={onConfirm}>
            Thoát và chuyển
          </button>
        </div>
      </div>
    </div>
  )
}
