import { motion } from 'framer-motion';
import LottieAnimationPlaceholder from './LottieAnimationPlaceholder.jsx';

const spring = { type: 'spring', stiffness: 400, damping: 30 };
const letters = {
  hidden: { opacity: 0, y: 7 },
  visible: { opacity: 1, y: 0, transition: spring }
};
const sentence = {
  hidden: {},
  visible: { transition: { delayChildren: .04, staggerChildren: .032 } }
};

export default function LoadingScreen({ message = 'Sharpening pencils...', compact = false, className = '' }) {
  return <div className={`flex flex-col items-center justify-center text-center ${compact ? 'py-8' : 'min-h-screen'} ${className}`}>
    <LottieAnimationPlaceholder className={compact ? 'h-20 w-32' : 'h-28 w-44'} />
    <motion.p aria-hidden="true" variants={sentence} initial="hidden" animate="visible" className="mt-1 flex font-display text-sm font-medium tracking-[.01em] text-muted">
      {Array.from(message).map((letter, index) => <motion.span key={`${letter}-${index}`} variants={letters} transition={spring} className="inline-block whitespace-pre">
        {letter === ' ' ? '\u00a0' : letter}
      </motion.span>)}
    </motion.p>
    <p role="status" aria-live="polite" className="sr-only">{message}</p>
  </div>;
}
