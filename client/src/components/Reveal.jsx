import { motion } from 'framer-motion';

const VARIANTS = {
  up: { y: 34, opacity: 0 },
  down: { y: -28, opacity: 0 },
  left: { x: 40, opacity: 0 },
  right: { x: -40, opacity: 0 },
  fade: { opacity: 0 },
  scale: { scale: 0.94, opacity: 0 },
};

/** Scroll-triggered entrance. Runs once, respects reduced-motion via framer. */
export default function Reveal({
  children,
  from = 'up',
  delay = 0,
  duration = 0.7,
  className,
  as = 'div',
  ...rest
}) {
  const MotionTag = motion[as] || motion.div;
  return (
    <MotionTag
      className={className}
      initial={VARIANTS[from] ?? VARIANTS.up}
      whileInView={{ x: 0, y: 0, scale: 1, opacity: 1 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
      {...rest}
    >
      {children}
    </MotionTag>
  );
}

/** Staggers its direct children as they enter the viewport. */
export function RevealGroup({ children, className, stagger = 0.09, from = 'up' }) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-60px' }}
      variants={{ show: { transition: { staggerChildren: stagger } } }}
    >
      {children}
    </motion.div>
  );
}

export function RevealItem({ children, className, from = 'up', ...rest }) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: VARIANTS[from] ?? VARIANTS.up,
        show: { x: 0, y: 0, scale: 1, opacity: 1, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
      }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
