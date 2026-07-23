import { motion, AnimatePresence } from 'framer-motion';

const transition = {
  type: 'spring',
  stiffness: 260,
  damping: 26,
  mass: 0.8,
};

export default function PageTransition({ children, pageKey }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pageKey}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={transition}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}