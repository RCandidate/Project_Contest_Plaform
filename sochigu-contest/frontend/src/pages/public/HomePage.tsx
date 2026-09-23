import { useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuthStore } from '@/store/auth.store';
import { useUiStore } from '@/store/ui.store';
import { GraduationCap, Users, Gift, Trophy, ArrowRight, Calendar, CheckCircle, Presentation, Award } from "lucide-react";
import { fadeUp, fadeUpView, fadeIn, staggerView, cardItem, hoverCard, hoverBtn } from '@/utils/animations';


import mascot from '../../../mascot-removebg-preview.png';
import photosyrkova from '../../../assets/tutor-syrk.jpg';
import photovidisheva from '../../../assets/tutor-vid.jpg';
import photopotasheva from '../../../assets/tutor-pot.jpg';
import photodrach from '../../../assets/Drach_VE.jpg';
import photodavydovich from '../../../assets/Davydovich_AN.jpg';
import photohachemizova from '../../../assets/Hachemizova_EN.jpg';
import photokopyrin from '../../../assets/Kopyrin_AS.jpg';
import photopodoplelova from '../../../assets/Podoplelova_VA.jpg';
import photoserdukova from '../../../assets/Serdukova_NK.jpg';
import phototabak from '../../../assets/Tabak_LV.jpg';


const MotionLink = motion(Link);

export function HomePage() {
  useEffect(() => { document.title = 'Главная — Конкурс СочиГУ'; }, []);
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { openAuthModal } = useUiStore();
  const handleApply = () => user ? navigate('/cabinet') : openAuthModal('register');

  return (
    <div>
      {/* ── Hero ── */}
      <section className="hero-gradient relative overflow-hidden pt-20 pb-20 md:pt-20 md:pb-24 md:h-[520px]">
        <div className="container relative z-10 mx-auto px-4 h-full">
          {/* Mascot — float animation via CSS keyframe */}
          <motion.img
            src={mascot} alt="" aria-hidden
            className="absolute -top-28 right-[-130px] h-[720px] w-auto object-contain object-top pointer-events-none select-none hidden md:block"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
            style={{ animation: 'mascotFloat 4s ease-in-out infinite' }}
          />

          <div className="w-full md:w-[58%] flex flex-col items-start text-left">
            {/* Badge */}
            <motion.div
              className="mb-6 self-start rounded-full bg-accent/90 px-4 py-1.5 text-sm font-semibold text-accent-foreground"
              initial="hidden" animate="show" custom={0.1} variants={fadeUp}
            >
              <Calendar className="mr-1 inline-block h-4 w-4" /> Приём заявок до 30 октября
            </motion.div>

            <div className="pl-20">
              {/* Heading */}
              <motion.h1
                className="mb-6 text-4xl font-extrabold leading-tight text-primary-foreground md:text-5xl lg:text-5xl"
                initial="hidden" animate="show" custom={0.2} variants={fadeUp}
              >
                Конкурс студенческих<br />
                проектов <span className="text-accent">СочиГУ</span>
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                className="mb-8 text-lg text-primary-foreground/80 md:text-xl"
                initial="hidden" animate="show" custom={0.35} variants={fadeUp}
              >
                Представь свой проект. Получи поддержку.<br />
                <span className="font-bold text-primary-foreground">Стань победителем.</span>
              </motion.p>
            </div>

            {/* Buttons */}
            <motion.div
              className="self-start flex flex-col items-start gap-4 sm:flex-row sm:justify-start"
              initial="hidden" animate="show" custom={0.5} variants={fadeUp}
            >
              <motion.button onClick={handleApply} className="inline-flex items-center gap-2 rounded-lg bg-accent px-8 py-3.5 text-base font-semibold text-accent-foreground shadow-lg transition-colors hover:bg-accent-hover" {...hoverBtn}>
                Подать заявку <ArrowRight size={18} />
              </motion.button>
              <MotionLink to="/about" className="inline-flex items-center gap-2 rounded-lg border-2 border-primary-foreground/30 px-8 py-3.5 text-base font-semibold text-primary-foreground transition-colors hover:bg-white hover:text-primary hover:border-white" {...hoverBtn}>
                Узнать подробнее
              </MotionLink>
            </motion.div>

            {/* Mobile mascot */}
            <motion.img
              src={mascot} alt="" aria-hidden
              className="mx-auto mt-8 h-auto max-h-[280px] w-auto object-contain pointer-events-none select-none block md:hidden"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.4 }}
            />
          </div>
        </div>
      </section>

      {/* ── Stat cards ── */}
      <section className="container relative z-10 mx-auto -mt-16 px-4">
        <motion.div
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          variants={staggerView}
          initial="hidden"
          whileInView="show" viewport={{ once: true, amount: 0.2 }}
        >
          {[
            { icon: Trophy, label: "2 номинации", desc: "Бизнес и практико-ориентированные" },
            { icon: Users, label: "500+ участников", desc: "Студенты со всей России" },
            { icon: Gift, label: "Бесплатное участие", desc: "Без взносов и платежей" },
            { icon: Award, label: "Денежные гранты", desc: "Для победителей и призёров" },
          ].map((stat) => (
            <motion.div key={stat.label} className="flex items-start gap-4 rounded-xl bg-card p-5 shadow-md relative" variants={cardItem} {...hoverCard}>
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent">
                <stat.icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">{stat.label}</p>
                <p className="text-sm text-muted-foreground">{stat.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── Экспертный совет ── */}
      <section className="container mx-auto px-4 py-16">
        <motion.h2
          className="mb-3 text-center text-3xl font-bold text-foreground"
          initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} custom={0} variants={fadeUpView}
        >
          Экспертный совет
        </motion.h2>
        <motion.p
          className="mb-10 text-center text-muted-foreground max-w-2xl mx-auto"
          initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} custom={0.1} variants={fadeUpView}
        >
          Преподаватели и руководители кафедр СочиГУ, оценивающие проекты участников
        </motion.p>

        <motion.div
          className="grid gap-5 sm:grid-cols-2 max-w-4xl mx-auto"
          variants={staggerView}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
        >
        {/* 1. Давыдович Анна Рудольфовна */}
        <motion.div
          className="relative flex items-center gap-4 rounded-xl bg-white p-5 shadow-sm border-2 border-primary/10 group overflow-hidden transition-colors duration-300 hover:border-primary/25 hover:shadow-md"
          variants={cardItem}
          {...hoverCard}
        >
          <div className="relative h-16 w-16 shrink-0">
            <div className="absolute inset-0 rounded-full overflow-hidden border-2 border-primary/10 transition-all duration-300 ease-out group-hover:scale-150 origin-center group-hover:border-primary/25">
              <img src={photodavydovich} alt="Давыдович А.Р." className="h-full w-full object-cover" />
            </div>
          </div>
          <div className="min-w-0 relative z-10">
            <p className="font-semibold text-foreground leading-snug">Давыдович Анна Рудольфовна</p>
            <p className="mt-1 text-sm text-muted-foreground leading-snug">И.о. директора института туризма, гостеприимства и креативных индустрий</p>
          </div>
        </motion.div>

        {/* 2. Копырин Андрей Сергеевич */}
        <motion.div
          className="relative flex items-center gap-4 rounded-xl bg-white p-5 shadow-sm border-2 border-primary/10 group overflow-hidden transition-colors duration-300 hover:border-primary/25 hover:shadow-md"
          variants={cardItem}
          {...hoverCard}
        >
          <div className="relative h-16 w-16 shrink-0">
            <div className="absolute inset-0 rounded-full overflow-hidden border-2 border-primary/10 transition-all duration-300 ease-out group-hover:scale-150 origin-center group-hover:border-primary/25">
              <img src={photokopyrin} alt="Копырин А.С." className="h-full w-full object-cover" />
            </div>
          </div>
          <div className="min-w-0 relative z-10">
            <p className="font-semibold text-foreground leading-snug">Копырин Андрей Сергеевич</p>
            <p className="mt-1 text-sm text-muted-foreground leading-snug">И.о. заведующего кафедрой информационных технологий и математики</p>
          </div>
        </motion.div>

        {/* 3. Табак Лариса Владимировна */}
        <motion.div
          className="relative flex items-center gap-4 rounded-xl bg-white p-5 shadow-sm border-2 border-primary/10 group overflow-hidden transition-colors duration-300 hover:border-primary/25 hover:shadow-md"
          variants={cardItem}
          {...hoverCard}
        >
          <div className="relative h-16 w-16 shrink-0">
            <div className="absolute inset-0 rounded-full overflow-hidden border-2 border-primary/10 transition-all duration-300 ease-out group-hover:scale-150 origin-center group-hover:border-primary/25">
              <img src={phototabak} alt="Табак Л.В." className="h-full w-full object-cover" />
            </div>
          </div>
          <div className="min-w-0 relative z-10">
            <p className="font-semibold text-foreground leading-snug">Табак Лариса Владимировна</p>
            <p className="mt-1 text-sm text-muted-foreground leading-snug">И.о. заведующего кафедрой архитектуры, дизайна и экологии</p>
          </div>
        </motion.div>

        {/* 4. Сыркова Ирина Сергеевна */}
        <motion.div
          className="relative flex items-center gap-4 rounded-xl bg-white p-5 shadow-sm border-2 border-primary/10 group overflow-hidden transition-colors duration-300 hover:border-primary/25 hover:shadow-md"
          variants={cardItem}
          {...hoverCard}
        >
          <div className="relative h-16 w-16 shrink-0">
            <div className="absolute inset-0 rounded-full overflow-hidden border-2 border-primary/10 transition-all duration-300 ease-out group-hover:scale-150 origin-center group-hover:border-primary/25">
              <img src={photosyrkova} alt="Сыркова И.С." className="h-full w-full object-cover" />
            </div>
          </div>
          <div className="min-w-0 relative z-10">
            <p className="font-semibold text-foreground leading-snug">Сыркова Ирина Сергеевна</p>
            <p className="mt-1 text-sm text-muted-foreground leading-snug">И.о. заведующего кафедрой управления и технологий в туризме и рекреации</p>
          </div>
        </motion.div>

        {/* 5. Сердюкова Надежда Константиновна */}
        <motion.div
          className="relative flex items-center gap-4 rounded-xl bg-white p-5 shadow-sm border-2 border-primary/10 group overflow-hidden transition-colors duration-300 hover:border-primary/25 hover:shadow-md"
          variants={cardItem}
          {...hoverCard}
        >
          <div className="relative h-16 w-16 shrink-0">
            <div className="absolute inset-0 rounded-full overflow-hidden border-2 border-primary/10 transition-all duration-300 ease-out group-hover:scale-150 origin-center group-hover:border-primary/25">
              <img src={photoserdukova} alt="Сердюкова Н.К." className="h-full w-full object-cover" />
            </div>
          </div>
          <div className="min-w-0 relative z-10">
            <p className="font-semibold text-foreground leading-snug">Сердюкова Надежда Константиновна</p>
            <p className="mt-1 text-sm text-muted-foreground leading-snug">Заведующий кафедрой гостиничного и ресторанного бизнеса</p>
          </div>
        </motion.div>

        {/* 6. Видищева Евгения Владимировна */}
        <motion.div
          className="relative flex items-center gap-4 rounded-xl bg-white p-5 shadow-sm border-2 border-primary/10 group overflow-hidden transition-colors duration-300 hover:border-primary/25 hover:shadow-md"
          variants={cardItem}
          {...hoverCard}
        >
          <div className="relative h-16 w-16 shrink-0">
            <div className="absolute inset-0 rounded-full overflow-hidden border-2 border-primary/10 transition-all duration-300 ease-out group-hover:scale-150 origin-center group-hover:border-primary/25">
              <img src={photovidisheva} alt="Видищева Е.В." className="h-full w-full object-cover" />
            </div>
          </div>
          <div className="min-w-0 relative z-10">
            <p className="font-semibold text-foreground leading-snug">Видищева Евгения Владимировна</p>
            <p className="mt-1 text-sm text-muted-foreground leading-snug">Доцент кафедры информационных технологий и математики</p>
          </div>
        </motion.div>

        {/* 7. Драч Владимир Евгеньевич */}
        <motion.div
          className="relative flex items-center gap-4 rounded-xl bg-white p-5 shadow-sm border-2 border-primary/10 group overflow-hidden transition-colors duration-300 hover:border-primary/25 hover:shadow-md"
          variants={cardItem}
          {...hoverCard}
        >
          <div className="relative h-16 w-16 shrink-0">
            <div className="absolute inset-0 rounded-full overflow-hidden border-2 border-primary/10 transition-all duration-300 ease-out group-hover:scale-150 origin-center group-hover:border-primary/25">
              <img src={photodrach} alt="Драч В.Е." className="h-full w-full object-cover" />
            </div>
          </div>
          <div className="min-w-0 relative z-10">
            <p className="font-semibold text-foreground leading-snug">Драч Владимир Евгеньевич</p>
            <p className="mt-1 text-sm text-muted-foreground leading-snug">Доцент кафедры информационных технологий и математики</p>
          </div>
        </motion.div>

        {/* 8. Хачемизова Екатерина Николаевна */}
        <motion.div
          className="relative flex items-center gap-4 rounded-xl bg-white p-5 shadow-sm border-2 border-primary/10 group overflow-hidden transition-colors duration-300 hover:border-primary/25 hover:shadow-md"
          variants={cardItem}
          {...hoverCard}
        >
          <div className="relative h-16 w-16 shrink-0">
            <div className="absolute inset-0 rounded-full overflow-hidden border-2 border-primary/10 transition-all duration-300 ease-out group-hover:scale-150 origin-center group-hover:border-primary/25">
              <img src={photohachemizova} alt="Хачемизова Е.Н." className="h-full w-full object-cover" />
            </div>
          </div>
          <div className="min-w-0 relative z-10">
            <p className="font-semibold text-foreground leading-snug">Хачемизова Екатерина Николаевна</p>
            <p className="mt-1 text-sm text-muted-foreground leading-snug">Доцент кафедры инновационных технологий в экономике и управлении</p>
          </div>
        </motion.div>

        {/* 9. Поташова Ирина Юрьевна */}
        <motion.div
          className="relative flex items-center gap-4 rounded-xl bg-white p-5 shadow-sm border-2 border-primary/10 group overflow-hidden transition-colors duration-300 hover:border-primary/25 hover:shadow-md"
          variants={cardItem}
          {...hoverCard}
        >
          <div className="relative h-16 w-16 shrink-0">
            <div className="absolute inset-0 rounded-full overflow-hidden border-2 border-primary/10 transition-all duration-300 ease-out group-hover:scale-150 origin-center group-hover:border-primary/25">
              <img src={photopotasheva} alt="Поташова И.Ю." className="h-full w-full object-cover" />
            </div>
          </div>
          <div className="min-w-0 relative z-10">
            <p className="font-semibold text-foreground leading-snug">Поташова Ирина Юрьевна</p>
            <p className="mt-1 text-sm text-muted-foreground leading-snug">Доцент кафедры инновационных технологий в экономике и управлении</p>
          </div>
        </motion.div>

          {/* 10. Балабанова Анна Олеговна */}
          <motion.div
            className="relative flex items-center gap-4 rounded-xl bg-white p-5 shadow-sm border-2 border-primary/10 group overflow-hidden transition-colors duration-300 hover:border-primary/25 hover:shadow-md"
            variants={cardItem}
            {...hoverCard}
          >
            <div className="relative h-16 w-16 shrink-0">
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-primary-light text-primary font-bold text-lg select-none border-2 border-primary/10 transition-all duration-300 ease-out group-hover:scale-150 origin-center group-hover:border-primary/25 group-hover:bg-primary group-hover:text-white">
                БА
              </div>
            </div>

            <div className="min-w-0 relative z-10">
              <p className="font-semibold text-foreground leading-snug">
                Балабанова Анна Олеговна
              </p>
              <p className="mt-1 text-sm text-muted-foreground leading-snug">
                Старший преподаватель кафедры инновационных технологий в экономике и управлении
              </p>
            </div>
          </motion.div>

          {/* 11. Подоплелова Валерия Анатольевна */}
          <motion.div
            className="relative flex items-center gap-4 rounded-xl bg-white p-5 shadow-sm border-2 border-primary/10 group overflow-hidden transition-colors duration-300 hover:border-primary/25 hover:shadow-md sm:col-span-2 sm:w-[calc(50%-0.625rem)] sm:justify-self-center"
            variants={cardItem}
            {...hoverCard}
          >

            <div className="relative h-16 w-16 shrink-0">
              <div className="absolute inset-0 rounded-full overflow-hidden border-2 border-primary/10 transition-all duration-300 ease-out group-hover:scale-150 origin-center group-hover:border-primary/25">
                <img
                  src={photopodoplelova}
                  alt="Подоплелова В.А."
                  className="h-full w-full object-cover"
                />
              </div>
            </div>

            <div className="min-w-0 relative z-10">
              <p className="font-semibold text-foreground leading-snug">
                Подоплелова Валерия Анатольевна
              </p>
              <p className="mt-1 text-sm text-muted-foreground leading-snug">
                Старший преподаватель кафедры архитектуры, дизайна и экологии
              </p>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ── Этапы ── */}
      <section className="container mx-auto px-4 py-16">
        <motion.h2
          className="mb-10 text-center text-3xl font-bold text-foreground"
          initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} custom={0} variants={fadeUpView}
        >
          Этапы конкурса
        </motion.h2>
        <motion.div
          className="grid gap-6 md:grid-cols-4"
          variants={staggerView}
          initial="hidden"
          whileInView="show" viewport={{ once: true, amount: 0.2 }}
        >
          {[
            { num: 1, icon: CheckCircle, title: "Заочный отбор", desc: "Подача заявок" },
            { num: 2, icon: GraduationCap, title: "Доработка", desc: "Совершенствование" },
            { num: 3, icon: Presentation, title: "Презентация", desc: "Защита перед экспертами" },
            { num: 4, icon: Award, title: "Награждение", desc: "Победители" },
          ].map((stage) => (
            <motion.div key={stage.num} className="rounded-xl bg-white p-6 text-center shadow-sm border-2 border-primary/10 group relative transition-colors duration-300" variants={cardItem} {...hoverCard}>
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary-light group-hover:bg-primary text-2xl font-bold text-white transition-colors duration-300">
                {stage.num}
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">{stage.title}</h3>
              <p className="text-sm text-foreground/60">{stage.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── Номинации ── */}
      <section className="bg-primary-light/50 py-16">
        <div className="container mx-auto px-4">
          <motion.h2
            className="mb-10 text-center text-3xl font-bold text-foreground"
            initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} custom={0} variants={fadeUpView}
          >
            Номинации
          </motion.h2>
          <motion.div
            className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2"
            variants={staggerView}
            initial="hidden"
            whileInView="show" viewport={{ once: true, amount: 0.2 }}
          >
            <motion.div className="rounded-xl border-2 border-primary/10 bg-card p-6 shadow-sm" variants={cardItem}>
              <div className="mb-3 inline-block rounded-lg bg-primary px-3 py-1 text-sm font-semibold text-primary-foreground">Номинация 1</div>
              <h3 className="mb-2 text-xl font-bold text-foreground">Бизнес-проекты</h3>
              <p className="text-muted-foreground">Коммерциализация, Pre-Seed и Seed стадии.</p>
            </motion.div>
            <motion.div className="rounded-xl border-2 border-accent/10 bg-card p-6 shadow-sm" variants={cardItem}>
              <div className="mb-3 inline-block rounded-lg bg-accent px-3 py-1 text-sm font-semibold text-accent-foreground">Номинация 2</div>
              <h3 className="mb-2 text-xl font-bold text-foreground">Практико-ориентированные</h3>
              <p className="text-muted-foreground">Образовательные и социально значимые проекты.</p>
            </motion.div>
          </motion.div>
          <motion.div
            className="mt-8 text-center"
            initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} custom={0.2} variants={fadeIn}
          >
            <Link to="/nominations" className="inline-flex items-center gap-2 font-semibold text-primary hover:underline">
              Все номинации <ArrowRight size={16} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── Ключевые даты ── */}
      <section className="container mx-auto px-4 py-16">
        <motion.h2
          className="mb-10 text-center text-3xl font-bold text-foreground"
          initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} custom={0} variants={fadeUpView}
        >
          Ключевые даты
        </motion.h2>
        <div className="mx-auto max-w-md">
          {[
            { date: "До 30 октября", label: "Приём заявок" },
            { date: "Ноябрь", label: "Доработка проектов" },
            { date: "Декабрь", label: "Очная презентация" },
            { date: "Декабрь", label: "Награждение победителей" },
          ].map((item, i) => (
            <motion.div
              key={i} className="group flex gap-4 relative"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, ease: 'easeOut', delay: i * 0.12 }}
              whileHover="hovered"
            >
              <div className="flex flex-col items-center">
                <motion.div
                  className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold bg-primary-light text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-200"
                  variants={{ hovered: { scale: 1.3 } }}
                  transition={{ type: 'spring', stiffness: 300, damping: 18 }}
                >
                  {i + 1}
                </motion.div>
                {i < 3 && <div className="h-12 w-0.5 bg-primary-light" />}
              </div>
              <motion.div
                className="pb-8"
                variants={{ hovered: { scale: 1.12 } }}
                transition={{ type: 'spring', stiffness: 300, damping: 18 }}
                style={{ transformOrigin: 'left center' }}
              >
                <p className="text-sm font-semibold text-primary-light group-hover:text-primary-mid transition-colors duration-200">{item.date}</p>
                <p className="text-base font-semibold text-foreground group-hover:text-primary transition-colors duration-200">{item.label}</p>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <motion.section
        className="hero-gradient px-4 py-16"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
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
            Подай заявку и покажи свой проект экспертам
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }} whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.35 }}
          >
            <motion.button onClick={handleApply} className="inline-flex items-center gap-2 rounded-lg bg-accent px-8 py-3.5 text-base font-semibold text-accent-foreground shadow-lg transition-colors hover:bg-accent-hover" {...hoverBtn}>
              Подать заявку <ArrowRight size={18} />
            </motion.button>
          </motion.div>
        </div>
      </motion.section>

      {/* Float keyframe for mascot */}
      <style>{`
        @keyframes mascotFloat {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-12px); }
        }
      `}</style>
    </div>
  );
}