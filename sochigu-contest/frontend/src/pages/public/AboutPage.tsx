import { useEffect } from 'react';
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Target, BookOpen, Users, Trophy, CheckCircle, ArrowRight, GraduationCap, Presentation, Award } from "lucide-react";
import { fadeUp, fadeUpView, fadeIn, stagger, staggerView, cardItem, hoverCard, hoverBtn } from '@/utils/animations';

import mascot1 from '../../../assets/mascot-about-contest.png';
import mascot2 from '../../../assets/mascot-contacts.png';

const MotionLink = motion(Link);

export function AboutPage() {
  useEffect(() => { document.title = 'О конкурсе — Конкурс СочиГУ'; }, []);

  const goals = [
    "Развитие интереса к проектной деятельности",
    "Профориентация студентов",
    "Интеграция с проектным обучением",
    "Развитие информационной платформы",
    "Интеграция с инновационной инфраструктурой РФ",
  ];

  const features = [
    { icon: BookOpen, title: "Образование", desc: "Развитие проектных компетенций и навыков у студентов всех направлений" },
    { icon: Users, title: "Сообщество", desc: "Объединение студентов, экспертов и наставников вокруг инновационных проектов" },
    { icon: Trophy, title: "Признание", desc: "Денежные призы и дипломы победителям, поддержка лучших проектов" },
  ];

  const stages = [
    { num: 1, icon: CheckCircle, title: "Заочный отбор", desc: "Заполнение заявок, регистрация на сайте, отбор Экспертным советом" },
    { num: 2, icon: GraduationCap, title: "Доработка проектов", desc: "Очно-заочная форма, консультации экспертов и менторов" },
    { num: 3, icon: Presentation, title: "Презентация", desc: "Очная защита перед Экспертным советом" },
    { num: 4, icon: Award, title: "Награждение", desc: "Дипломы 1-й, 2-й, 3-й степени и денежные премии" },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="bg-primary-light/50 py-12">
        <div className="container mx-auto px-4">
          <motion.nav
            className="mb-4 text-sm text-muted-foreground"
            initial="hidden" animate="show" variants={fadeIn}
          >
            <Link to="/" className="hover:text-primary">Главная</Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">О конкурсе</span>
          </motion.nav>
          <motion.h1
            className="text-4xl font-bold text-foreground"
            initial="hidden" animate="show" variants={fadeUp}
          >
            О конкурсе
          </motion.h1>
        </div>
      </section>

      {/* Миссия */}
      <section className="relative overflow-hidden">
        <div className="mx-auto flex max-w-5xl justify-between gap-8 px-4 pt-16">
          <motion.div
            className="max-w-1xl flex-1 items-center pb-6"
            initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} variants={fadeUpView}
          >
            <h2 className="mb-4 text-2xl font-bold text-foreground">Миссия</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Повышение компетенций в области проектной деятельности; формирование
              проектной системы в СочиГУ.
            </p>
          </motion.div>

          <div className="hidden h-[320px] w-[250px] shrink-0 items-start justify-center overflow-hidden md:flex items-end">
            <motion.img
              src={mascot1} alt="" aria-hidden
              className="h-[320px] w-auto max-w-none select-none object-contain object-top"
              initial={{ opacity: 0, y: 80 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: 'easeOut', delay: 0.2 }}
            />
          </div>
        </div>
      </section>

      {/* Цели */}
      <section className="relative overflow-hidden bg-primary-light/50">
        <div className="mx-auto flex max-w-5xl items-end justify-between gap-8 px-4 pt-16">
          <div className="max-w-3xl flex-1 pb-16">
            <motion.div
              className="mb-6 flex items-center gap-3"
              initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} variants={fadeUpView}
            >
              <Target className="h-7 w-7 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">Цели конкурса</h2>
            </motion.div>
            <motion.ul
              className="space-y-3"
              variants={staggerView}
              initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}
            >
              {goals.map((goal, i) => (
                <motion.li key={i} className="flex items-start gap-3" variants={cardItem}>
                  <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <span className="text-muted-foreground">{goal}</span>
                </motion.li>
              ))}
            </motion.ul>
          </div>

          <div className="hidden h-[320px] w-[250px] shrink-0 items-start justify-center overflow-hidden md:flex">
            <motion.img
              src={mascot2} alt="" aria-hidden
              className="h-[320px] w-auto max-w-none select-none object-contain object-top"
              initial={{ opacity: 0, y: 80 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: 'easeOut', delay: 0.2 }}
            />
          </div>
        </div>
      </section>

      {/* Преимущества */}
      <section className="container mx-auto px-4 py-16">
        <motion.div
          className="grid gap-6 md:grid-cols-3"
          variants={staggerView}
          initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}
        >
          {features.map((f) => (
            <motion.div
              key={f.title}
              className="rounded-xl bg-card p-6 shadow-sm border border-border relative"
              variants={cardItem}
              {...hoverCard}
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary-light">
                <f.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Этапы */}
      <section className="bg-primary-light/50 py-16">
        <div className="container mx-auto px-4">
          <motion.h2
            className="mb-10 text-center text-3xl font-bold text-foreground"
            initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} variants={fadeUpView}
          >
            4 этапа конкурса
          </motion.h2>
          <motion.div
            className="grid gap-6 md:grid-cols-4"
            variants={staggerView}
            initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}
          >
            {stages.map((stage) => (
              <motion.div
                key={stage.num}
                className="rounded-xl bg-white p-6 text-center shadow-sm border-2 border-primary/10 group relative transition-colors duration-300"
                variants={cardItem}
                {...hoverCard}
              >
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary-light group-hover:bg-primary text-2xl font-bold text-white transition-colors duration-300">
                  {stage.num}
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">{stage.title}</h3>
                <p className="text-sm text-foreground/60">{stage.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Организатор */}
      <section className="container mx-auto px-4 py-16">
        <motion.div
          className="mx-auto max-w-3xl"
          initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} variants={fadeUpView}
        >
          <h2 className="mb-4 text-2xl font-bold text-foreground">Организатор</h2>
          <div className="rounded-xl bg-card border border-border p-6 shadow-sm">
            <p className="font-semibold text-foreground">Стартап-студия СочиГУ</p>
            <p className="mt-1 text-muted-foreground">
              ФГБОУ ВО «Сочинский государственный университет»
            </p>
          </div>
        </motion.div>
      </section>

      {/* CTA */}
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
            Готов участвовать?
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
            <MotionLink
              to="/register"
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-8 py-3.5 text-base font-semibold text-accent-foreground shadow-lg transition-colors hover:bg-accent-hover"
              {...hoverBtn}
            >
              Подать заявку <ArrowRight size={18} />
            </MotionLink>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
}
