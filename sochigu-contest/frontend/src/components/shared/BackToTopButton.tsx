import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp } from 'lucide-react';

function luminanceFromRgb(r: number, g: number, b: number): number {
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

function getBgLuminanceAtButton(): number {
  // Button center: fixed bottom-6 (24px) + h-11/2 (22px) from edges
  const x = window.innerWidth - 46;
  const y = window.innerHeight - 46;
  const elements = document.elementsFromPoint(x, y);
  for (const el of elements) {
    if (el.hasAttribute('data-back-to-top')) continue;
    const style = getComputedStyle(el);

    // Solid background color
    const bg = style.backgroundColor;
    if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
      const nums = bg.match(/\d+/g);
      if (nums) return luminanceFromRgb(...(nums.slice(0, 3).map(Number) as [number, number, number]));
    }

    // Gradient background (backgroundColor is transparent for gradients — must check backgroundImage)
    const bgImage = style.backgroundImage;
    if (bgImage && bgImage !== 'none' && bgImage.includes('gradient')) {
      const match = bgImage.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (match) return luminanceFromRgb(Number(match[1]), Number(match[2]), Number(match[3]));
    }
  }
  return 1; // default: light
}

export function BackToTopButton() {
  const [visible, setVisible] = useState(false);
  const [isDark, setIsDark] = useState(false);

  const update = useCallback(() => {
    const scrolled = window.scrollY > 300;
    setVisible(scrolled);
    if (scrolled) setIsDark(getBgLuminanceAtButton() < 0.5);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, [update]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          data-back-to-top
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className={`fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-50 flex h-11 w-11 items-center justify-center rounded-full shadow-lg transition-colors duration-300 ${
            isDark
              ? 'bg-white text-primary hover:bg-primary-light'
              : 'bg-primary text-primary-foreground hover:bg-primary-mid'
          }`}
          aria-label="Наверх"
        >
          <ArrowUp size={20} />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
