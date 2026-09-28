import { useEffect } from 'react';
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { fadeUp, fadeUpView, stagger, staggerView, cardItem } from '@/utils/animations';

import mascot from '../../../assets/mascot-about-contest.png';

const criteriaBusiness = [
  "Полнота и проработанность бизнес-модели",
  "Рыночный потенциал и конкурентные преимущества",
  "Реалистичность финансовых прогнозов",
  "Уровень презентации и качество защиты",
  "Готовность команды к реализации",
];

const criteriaPractical = [
  "Актуальность и социальная значимость проблемы",
  "Методическая ценность и новизна подхода",
  "Реализуемость в реальных условиях",
  "Обоснованность ожидаемых результатов",
  "Масштабируемость и потенциал тиражирования",
];

const directions = [
  "IT и цифровая экономика",
  "Социальные проекты",
  "Реальный сектор (транспорт, строительство, туризм, ТЭК)",
  "Политико-правовые",
  "Культурные",
  "Спортивные",
];

export function NominationsPage() {
  useEffect(() => { document.title = 'Номинации — Конкурс СочиГУ'; }, []);
  return (
    <div>
      <section className="bg-primary-light/50 py-12">
        <div className="container mx-auto px-4">

          {/* <motion.img
            src={mascot} alt="" aria-hidden
            className="relative z-10 -top-28 right-[-130px] h-[720px] w-auto object-contain object-top  select-none hidden md:block"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
            style={{ animation: 'mascotFloat 4s ease-in-out infinite' }}
          /> */}

          <motion.nav
            className="mb-4 text-sm text-muted-foreground"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}
          >
            <Link to="/" className="hover:text-primary">Главная</Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">Номинации</span>
          </motion.nav>
          <motion.h1
            className="text-4xl font-bold text-foreground"
            initial="hidden" animate="show" variants={fadeUp}
          >
            Номинации конкурса
          </motion.h1>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <motion.div
          className="space-y-8 mb-12"
          variants={staggerView}
          initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}
        >
          <motion.div className="rounded-xl bg-card border-l-4 border-primary p-6 shadow-sm" variants={cardItem}>
            <div className="mb-3 inline-block rounded-lg bg-primary px-3 py-1 text-sm font-semibold text-primary-foreground">
              Номинация 1
            </div>
            <h2 className="mb-2 text-2xl font-bold text-foreground">Бизнес-проекты</h2>
            <p className="mb-5 text-muted-foreground">Коммерциализация, Pre-Seed/Seed стадии.</p>
            <p className="mb-3 text-sm font-semibold text-foreground">Критерии оценки:</p>
            <ul className="space-y-2">
              {criteriaBusiness.map((c, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  {c}
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div className="rounded-xl bg-card border-l-4 border-accent p-6 shadow-sm" variants={cardItem}>
            <div className="mb-3 inline-block rounded-lg bg-accent px-3 py-1 text-sm font-semibold text-accent-foreground">
              Номинация 2
            </div>
            <h2 className="mb-2 text-2xl font-bold text-foreground">Практико-ориентированные</h2>
            <p className="mb-5 text-muted-foreground">Образовательные и социально значимые проекты.</p>
            <p className="mb-3 text-sm font-semibold text-foreground">Критерии оценки:</p>
            <ul className="space-y-2">
              {criteriaPractical.map((c, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  {c}
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>

        <motion.div
          initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} variants={fadeUpView}
        >
          <h2 className="mb-6 text-2xl font-bold text-foreground">Направления проектов</h2>
          <motion.div
            className="grid gap-3 sm:grid-cols-2 md:grid-cols-3"
            variants={staggerView}
            initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}
          >
            {directions.map((d, i) => (
              <motion.div
                key={i}
                className="rounded-lg bg-primary-light px-4 py-3 text-sm font-medium text-primary"
                variants={cardItem}
              >
                {d}
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      <motion.section
        className="hero-gradient px-4 py-16"
        initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
      >
        <div className="container mx-auto text-center">
          <motion.h2
            className="mb-4 text-3xl font-bold text-primary-foreground"
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            Выбери свою номинацию
          </motion.h2>
          <motion.p
            className="mb-8 text-primary-foreground/80"
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.25 }}
          >
            Подай заявку и представь свой проект экспертам
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }} whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.35 }}
          >
            <Link
              to="/register"
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-8 py-3.5 text-base font-semibold text-accent-foreground shadow-lg transition-all hover:bg-accent-hover"
            >
              Подать заявку <ArrowRight size={18} />
            </Link>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
}
