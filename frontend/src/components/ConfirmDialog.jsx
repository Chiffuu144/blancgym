import { useEffect, useRef } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { AlertTriangle, Check, X } from 'lucide-react';

const easeOut = [0.23, 1, 0.32, 1];

export default function ConfirmDialog({ open, title, message, confirmLabel = 'Confirm', danger = false, busy = false, onConfirm, onCancel }) {
  const confirmRef = useRef(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (!open) return undefined;
    confirmRef.current?.focus();
    const onKeyDown = event => { if (event.key === 'Escape' && !busy) onCancel(); };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, busy, onCancel]);

  return <AnimatePresence>
    {open && <motion.div className="fixed inset-0 z-[90] grid place-items-center bg-ink/45 p-4 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: .2, ease: easeOut }} onMouseDown={event => { if (event.target === event.currentTarget && !busy) onCancel(); }}>
      <motion.section role="alertdialog" aria-modal="true" aria-labelledby="confirm-dialog-title" aria-describedby="confirm-dialog-message" initial={{ opacity: 0, y: reducedMotion ? 0 : 8, scale: reducedMotion ? 1 : .97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: reducedMotion ? 0 : 5, scale: reducedMotion ? 1 : .985 }} transition={{ duration: .2, ease: easeOut }} className="w-full max-w-md rounded-3xl border border-white/70 bg-paper p-5 shadow-[0_24px_80px_rgba(54,32,37,.24)] sm:p-6">
        <div className={`grid h-11 w-11 place-items-center rounded-2xl ${danger ? 'bg-[#f8e7e6] text-roseDark' : 'bg-blush text-roseDark'}`}>{danger ? <AlertTriangle size={19} /> : <Check size={19} />}</div>
        <h2 id="confirm-dialog-title" className="mt-4 font-display text-xl font-semibold text-ink">{title}</h2>
        <p id="confirm-dialog-message" className="mt-2 text-sm leading-6 text-muted">{message}</p>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" disabled={busy} onClick={onCancel} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-line bg-white px-4 text-sm font-medium text-ink hover:bg-cream disabled:opacity-50"><X size={15} /> Cancel</button>
          <button ref={confirmRef} type="button" disabled={busy} onClick={onConfirm} className={`min-h-11 rounded-xl px-4 text-sm font-semibold text-white disabled:opacity-60 ${danger ? 'bg-[#9f465d] hover:bg-[#87394e]' : 'bg-roseDark hover:bg-[#743a4d]'}`}>{busy ? 'Please wait...' : confirmLabel}</button>
        </div>
      </motion.section>
    </motion.div>}
  </AnimatePresence>;
}
