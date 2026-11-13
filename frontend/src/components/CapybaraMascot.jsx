import { motion, useReducedMotion } from 'framer-motion';
import { PawPrint, Sparkles } from 'lucide-react';
import capybaraImage from '../assets/capybara-transparent.png';

const spring = { type: 'spring', stiffness: 400, damping: 30 };

export default function CapybaraMascot() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      <motion.div
        initial={reduceMotion ? { x: '-50%' } : { opacity: 0, x: '-50%', y: 8, scale: .98 }}
        animate={{ opacity: 1, x: '-50%', y: 0, scale: 1 }}
        transition={reduceMotion ? { duration: 0 } : { ...spring, delay: .15 }}
        className="absolute left-1/2 top-[-55px] z-10 h-[220px] w-[340px]"
      >
        <motion.img
          src={capybaraImage}
          alt="A cheerful capybara wearing glasses and waving"
          className="h-full w-full object-contain"
          animate={reduceMotion
            ? { y: 0, rotate: 0, scale: 1 }
            : { y: [0, -8, 0], rotate: [0, 1.5, 0, -1.5, 0], scale: [1, 1.005, 1] }}
          transition={reduceMotion ? { duration: 0 } : {
            y: { duration: 4, ease: 'easeInOut', repeat: Infinity },
            rotate: { duration: 5.2, ease: 'easeInOut', repeat: Infinity },
            scale: { duration: 4, ease: 'easeInOut', repeat: Infinity }
          }}
          draggable="false"
        />
      </motion.div>

      <motion.svg
        aria-hidden="true"
        viewBox="0 0 44 52"
        className="absolute left-[66%] top-[14%] z-20 h-10 w-9 text-[#795447]"
        animate={reduceMotion ? { opacity: 0 } : { opacity: [.35, 1, .35], x: [0, 3, 0] }}
        transition={reduceMotion ? { duration: 0 } : { duration: 2, ease: 'easeInOut', repeat: Infinity }}
      >
        <path d="M10 39c10-7 11-19 4-27M22 45c12-10 13-26 5-37M32 39c6-7 7-15 4-22" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      </motion.svg>

      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 8, scale: .97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={reduceMotion ? { duration: 0 } : { ...spring, delay: .35 }}
        className="absolute left-0 top-[1px] z-20 hidden max-w-[148px] rounded-2xl border border-rose/20 bg-[#fffdfb]/95 px-3.5 py-2 text-xs font-medium leading-5 text-ink shadow-sm backdrop-blur-xl sm:block"
      >
        <span className="flex items-center gap-1 font-semibold">Hi! <PawPrint size={12} aria-hidden="true" /></span>
        Welcome to blanc! <Sparkles className="inline-block align-[-2px]" size={13} aria-hidden="true" />
        <span className="absolute -bottom-1.5 left-5 h-3 w-3 rotate-45 border-b border-r border-rose/20 bg-[#fffdfb]" />
      </motion.div>
    </div>
  );
}
