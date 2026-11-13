import { Variants, Transition } from 'framer-motion';

const ease = 'easeOut' as const;

const base: Transition = { duration: 0.55, ease };

// Timing breakdown with mode="wait" + exit(0.12s) + enter(0.12s):
// t=0:    nav click → old page starts exit
// t=120ms: old page gone → new page mounts (opacity 0)
// t=120ms: rAF: scrollToTop fires
// t=240ms: new page fully visible
// → all animations must start AFTER t=240ms from mount → delay > 0.12s

/** Для hero-секций: animate на загрузке страницы */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { ...base, delay: 0.2 } },
};

/** Для whileInView: гарантированно после page fade-in */
export const fadeUpView: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { ...base, delay: 0.2 } },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.6 } },
};

/** Для animate (первый экран) */
export const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
};

/** Для whileInView */
export const staggerView: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
};

export const cardItem: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease } },
};

export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0, transition: { duration: 0.45, ease } },
};

const springHover = { type: 'spring' as const, stiffness: 280, damping: 22 };

/** Hover lift для карточек — scale + zIndex */
export const hoverCard = {
  whileHover: { scale: 1.08, zIndex: 2, transition: springHover },
};

/** Меньший lift для новостей/победителей/экспертов */
export const hoverCardSm = {
  whileHover: { scale: 1.06, zIndex: 2, transition: springHover },
};

/** Для кнопок — lift + tap */
export const hoverBtn = {
  whileHover: { scale: 1.08, transition: { type: 'spring' as const, stiffness: 300, damping: 20 } },
  whileTap: { scale: 0.97 },
};
