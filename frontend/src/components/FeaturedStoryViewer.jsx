import { useCallback, useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

const easing = [0.23, 1, 0.32, 1];

export default function FeaturedStoryViewer({ photos = [], startIndex = 0, name = 'Featured moment', username = '', onClose }) {
  const [index, setIndex] = useState(startIndex);
  const reducedMotion = useReducedMotion();
  const next = useCallback(() => {
    if (index >= photos.length - 1) onClose();
    else setIndex(current => current + 1);
  }, [index, photos.length, onClose]);
  const previous = useCallback(() => setIndex(current => Math.max(0, current - 1)), []);

  useEffect(() => {
    const timer = window.setTimeout(next, 10000);
    return () => window.clearTimeout(timer);
  }, [index, next]);

  useEffect(() => {
    const onKeyDown = event => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowRight') next();
      if (event.key === 'ArrowLeft') previous();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [next, onClose, previous]);

  return <motion.div className="fixed inset-0 z-[80] grid place-items-center bg-black/95 p-0 sm:p-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: .2, ease: easing }} onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
      <motion.section role="dialog" aria-modal="true" aria-label={`${name} highlights`} initial={{ opacity: 0, scale: reducedMotion ? 1 : .98, y: reducedMotion ? 0 : 6 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: reducedMotion ? 1 : .985 }} transition={{ duration: .22, ease: easing }} className="relative flex h-[100dvh] w-full max-w-[500px] flex-col overflow-hidden bg-[#181818] text-white sm:h-[min(92dvh,900px)] sm:rounded-2xl">
        <img key={index} src={photos[index]} alt={`${name}, photo ${index + 1}`} className="absolute inset-0 h-full w-full object-contain" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/55 via-transparent to-black/40" />
        <div className="relative z-10 px-3 pt-[max(env(safe-area-inset-top),12px)] sm:pt-4">
          <div className="mb-3 flex gap-1" aria-label={`Photo ${index + 1} of ${photos.length}`}>
            {photos.map((_, segment) => <div key={segment} className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/35"><div key={`${segment}-${index}`} className={`h-full origin-left rounded-full bg-white ${segment < index ? 'w-full' : segment === index ? 'animate-featured-progress' : 'w-0'}`} /></div>)}
          </div>
          <div className="flex items-center gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-full border border-white/70 bg-white/20 text-xs font-bold">{username.slice(0, 1).toUpperCase() || name.slice(0, 1).toUpperCase()}</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{name}</p>{username && <p className="truncate text-[11px] text-white/75">@{username}</p>}</div><button type="button" onClick={onClose} aria-label="Close featured photos" className="grid h-10 w-10 place-items-center rounded-full bg-black/20 hover:bg-black/40"><X size={21} /></button></div>
        </div>
        <button type="button" aria-label="Previous featured photo" onClick={previous} disabled={index === 0} className="absolute inset-y-20 left-0 z-10 grid w-[22%] place-items-center text-white/0 disabled:pointer-events-none sm:text-white/75"><ChevronLeft size={28} /></button>
        <button type="button" aria-label="Next featured photo" onClick={next} className="absolute inset-y-20 right-0 z-10 grid w-[22%] place-items-center text-white/0 sm:text-white/75"><ChevronRight size={28} /></button>
        <span className="sr-only" aria-live="polite">Photo {index + 1} of {photos.length}; advances automatically in 10 seconds.</span>
      </motion.section>
    </motion.div>;
}
