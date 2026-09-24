import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { usersApi } from '@/api/users';
import { User } from '@/types';
import { fadeUp, fadeUpView, fadeIn, staggerView, cardItem, hoverCard, hoverBtn } from '@/utils/animations';



import photosyrkova from '../../../assets/tutor-syrk.webp';
import photovidisheva from '../../../assets/tutor-vid.webp';
import photopotasheva from '../../../assets/tutor-pot.webp';
import photodrach from '../../../assets/Drach_VE.webp';
import photodavydovich from '../../../assets/Davydovich_AN.webp';
import photohachemizova from '../../../assets/Hachemizova_EN.webp';
import photokopyrin from '../../../assets/Kopyrin_AS.webp';
import photopodoplelova from '../../../assets/Podoplelova_VA.webp';
import photoserdukova from '../../../assets/Serdukova_NK.webp';
import phototabak from '../../../assets/Tabak_LV.webp';
import photobalabanova from '../../../assets/Balabanova_AO.webp';
import photozenkova from '../../../assets/Zenkova_TL.webp';


export function ExpertsPage() {
  useEffect(() => { document.title = 'Экспертный совет — Конкурс СочиГУ'; }, []);
 

  return (
    <div>
      <section className="bg-primary-light/50 py-12">
        <div className="container mx-auto px-4">
          <motion.nav
            className="mb-4 text-sm text-muted-foreground"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}
          >
            <Link to="/" className="hover:text-primary">Главная</Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">Экспертный совет</span>
          </motion.nav>
          <motion.h1
            className="text-4xl font-bold text-foreground"
            initial="hidden" animate="show" variants={fadeUp}
          >
            Экспертный совет
          </motion.h1>
        </div>
      </section>

      <section className="container mx-auto px-2 py-8">
          {/* ── Экспертный совет ── */}
        <section className="container mx-auto px-4">
          <motion.p
            className="mb-4 text-center text-3xl font-semibold text-foreground"
            initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} custom={0.1} variants={fadeUpView}
          >
            Преподаватели и руководители кафедр СочиГУ, оценивающие проекты участников
          </motion.p>

          <motion.p className="w-32 h-1 bg-blue-500 rounded mx-auto mb-6"></motion.p>

          <motion.div
            className="grid gap-5 sm:grid-cols-2 max-w-4xl mx-auto"
            variants={staggerView}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.1 }}
          >
          {/* 1. Давыдович Анна Рудольфовна */}
          <motion.div
            className="relative flex items-center gap-4 rounded-xl bg-accent/50 p-5 shadow-sm border-2 border-primary/10 group overflow-hidden transition-colors duration-300 hover:border-primary/25 hover:shadow-md"
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
            className="relative flex items-center gap-4 rounded-xl bg-accent/50 p-5 shadow-sm border-2 border-primary/10 group overflow-hidden transition-colors duration-300 hover:border-primary/25 hover:shadow-md"
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
            className="relative flex items-center gap-4 rounded-xl bg-accent/50 p-5 shadow-sm border-2 border-primary/10 group overflow-hidden transition-colors duration-300 hover:border-primary/25 hover:shadow-md"
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
            className="relative flex items-center gap-4 rounded-xl bg-accent/50 p-5 shadow-sm border-2 border-primary/10 group overflow-hidden transition-colors duration-300 hover:border-primary/25 hover:shadow-md"
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
            className="relative flex items-center gap-4 rounded-xl bg-accent/50 p-5 shadow-sm border-2 border-primary/10 group overflow-hidden transition-colors duration-300 hover:border-primary/25 hover:shadow-md"
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
            className="relative flex items-center gap-4 rounded-xl bg-accent/50 p-5 shadow-sm border-2 border-primary/10 group overflow-hidden transition-colors duration-300 hover:border-primary/25 hover:shadow-md"
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
            className="relative flex items-center gap-4 rounded-xl bg-accent/50 p-5 shadow-sm border-2 border-primary/10 group overflow-hidden transition-colors duration-300 hover:border-primary/25 hover:shadow-md"
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
            className="relative flex items-center gap-4 rounded-xl bg-accent/50 p-5 shadow-sm border-2 border-primary/10 group overflow-hidden transition-colors duration-300 hover:border-primary/25 hover:shadow-md"
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
            className="relative flex items-center gap-4 rounded-xl bg-accent/50 p-5 shadow-sm border-2 border-primary/10 group overflow-hidden transition-colors duration-300 hover:border-primary/25 hover:shadow-md"
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
              className="relative flex items-center gap-4 rounded-xl bg-accent/50 p-5 shadow-sm border-2 border-primary/10 group overflow-hidden transition-colors duration-300 hover:border-primary/25 hover:shadow-md"
              variants={cardItem}
              {...hoverCard}
            >
              <div className="relative h-16 w-16 shrink-0">
                <div className="absolute inset-0 rounded-full overflow-hidden border-2 border-primary/10 transition-all duration-300 ease-out group-hover:scale-150 origin-center group-hover:border-primary/25">
                  <img src={photobalabanova} alt="Балабанова А.О." className="h-full w-full object-cover" />
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
              className="relative flex items-center gap-4 rounded-xl bg-accent/50 p-5 shadow-sm border-2 border-primary/10 group overflow-hidden transition-colors duration-300 hover:border-primary/25 hover:shadow-md"
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

          {/* 12. Зенкова Татьяна Леонидовна*/}
          <motion.div
              className="relative flex items-center gap-4 rounded-xl bg-accent/50 p-5 shadow-sm border-2 border-primary/10 group overflow-hidden transition-colors duration-300 hover:border-primary/25 hover:shadow-md"
              variants={cardItem}
              {...hoverCard}
            >

              <div className="relative h-16 w-16 shrink-0">
                <div className="absolute inset-0 rounded-full overflow-hidden border-2 border-primary/10 transition-all duration-300 ease-out group-hover:scale-150 origin-center group-hover:border-primary/25">
                  <img
                    src={photozenkova}
                    alt="Зенкова Т.Л."
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>

              <div className="min-w-0 relative z-10">
                <p className="font-semibold text-foreground leading-snug">
                  Зенкова Татьяна Леонидовна
                </p>
                <p className="mt-1 text-sm text-muted-foreground leading-snug">
                  И.о. заведующего кафедрой романо-германской и русской филологии, кандидат филологических наук, доцент
                </p>
              </div>
          </motion.div>
        </motion.div>
        </section>
      </section>
    </div>
  );
}
