import { useLayoutEffect } from 'react';

// Must be the FIRST child inside the keyed motion.div wrapper.
// React runs useLayoutEffect depth-first: first sibling's effects fire
// before second sibling's subtree — so scroll resets to 0 before
// Framer Motion registers IntersectionObservers for whileInView elements.
export function ScrollToTop() {
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return null;
}
