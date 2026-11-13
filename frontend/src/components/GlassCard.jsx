import { motion } from 'framer-motion';

export default function GlassCard({ children, className = '', interactive = false, ...props }) {
  return <motion.div
    className={`glass rounded-3xl ${className}`}
    whileHover={interactive ? { scale: 1.008 } : undefined}
    whileTap={interactive ? { scale: .99 } : undefined}
    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
    {...props}
  >{children}</motion.div>;
}
