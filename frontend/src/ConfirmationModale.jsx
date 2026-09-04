import { createPortal } from 'react-dom'

function ConfirmationModale({ titre, message, onConfirmer, onAnnuler }) {
  return createPortal(
    <div className="fixed inset-0 bg-ink/30 flex items-center justify-center p-4 z-[60]" onClick={onAnnuler}>
      <div className="bg-surface rounded-xl border border-line max-w-sm w-full p-6" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-display text-lg font-semibold text-ink mb-2">{titre}</h3>
        <p className="text-sm text-ink-soft mb-6">{message}</p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onAnnuler}
            className="text-sm text-ink-soft hover:text-ink px-4 py-2 rounded-lg transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={onConfirmer}
            className="bg-step-testing text-paper text-sm font-medium rounded-lg px-4 py-2 hover:bg-step-testing/90 transition-colors"
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

export default ConfirmationModale