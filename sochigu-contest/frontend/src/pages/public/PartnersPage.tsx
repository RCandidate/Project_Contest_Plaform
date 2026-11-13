import { useEffect } from 'react';
import { motion } from "framer-motion";
import { fadeUp, stagger, staggerView, cardItem } from '@/utils/animations';

export function PartnersPage() {
  useEffect(() => { document.title = 'Партнёры — Конкурс СочиГУ'; }, []);
  return (
    <main className="min-h-screen bg-white">
      <div className="container mx-auto px-4 max-w-4xl py-8 md:py-12">
        <motion.h1
          className="text-3xl md:text-4xl font-bold text-primary-900 mb-4"
          initial="hidden" animate="show" variants={fadeUp}
        >
          Наши партнёры
        </motion.h1>
        <motion.p
          className="text-gray-600 mb-8"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.2 }}
        >
          Конкурс студенческих проектов СочиГУ проводится при поддержке партнёров. Партнёрство помогает развивать проекты участников и укреплять связи университета с бизнесом и обществом.
        </motion.p>

        <motion.div
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-8"
          variants={staggerView}
          initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}
        >
          {Array.from({ length: 8 }, (_, i) => (
            <motion.div
              key={i}
              className="aspect-[4/3] rounded-lg bg-gray-200 flex items-center justify-center text-gray-500 text-sm font-medium"
              variants={cardItem}
            >
              Партнёр
            </motion.div>
          ))}
        </motion.div>
      </div>
    </main>
  );
}
