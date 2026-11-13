import { motion } from 'framer-motion';

const circumference = 2 * Math.PI * 42;
const spring = { type: 'spring', stiffness: 400, damping: 30 };

export default function CalorieProgressBar({ consumed = 0, target = 0, size = 180 }) {
  const ratio = target > 0 ? consumed / target : 0;
  const progress = Math.max(0, Math.min(1, ratio));
  const remaining = Math.max(0, target - consumed);
  const overTarget = Math.max(0, consumed - target);
  const offset = circumference * (1 - progress);

  return <div className="relative shrink-0" style={{ width: size, height: size }} role="img" aria-label={`${consumed} calories consumed of ${target} target`}>
    <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90 overflow-visible">
      <circle cx="50" cy="50" r="42" fill="none" stroke="#f0dcda" strokeWidth="7" />
      <motion.circle
        cx="50" cy="50" r="42" fill="none" stroke="#c85070" strokeWidth="7" strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={spring}
      />
    </svg>
    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
      <span className="text-[10px] font-semibold uppercase tracking-[.13em] text-muted">Remaining</span>
      <span className="mt-1 font-display text-3xl font-medium tabular-nums tracking-[-.04em] text-ink">{remaining.toLocaleString()}</span>
      <span className="text-xs text-muted">kcal</span>
      {overTarget > 0 && <span className="mt-1 text-[10px] font-medium text-roseDark">{overTarget.toLocaleString()} over</span>}
    </div>
  </div>;
}
