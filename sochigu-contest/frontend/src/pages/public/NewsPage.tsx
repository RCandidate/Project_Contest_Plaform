import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const MotionLink = motion(Link);
import { newsApi } from '@/api/news';
import { News } from '@/types';
import { formatDate } from '@/utils/formatDate';
import { fadeUp, stagger, cardItem, hoverCardSm } from '@/utils/animations';

import mascot from '../../../assets/mascot-news.png';

const LIMIT = 10;

function NewsCardSkeleton() {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 animate-pulse">
      <div className="h-[200px] bg-gray-200" />
      <div className="p-5 space-y-3">
        <div className="h-3 bg-gray-200 rounded w-1/3" />
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-4/5" />
        <div className="space-y-2 pt-1">
          <div className="h-3 bg-gray-100 rounded w-full" />
          <div className="h-3 bg-gray-100 rounded w-full" />
          <div className="h-3 bg-gray-100 rounded w-2/3" />
        </div>
        <div className="h-4 bg-gray-200 rounded w-1/4 pt-1" />
      </div>
    </div>
  );
}

function NewsCard({ item }: { item: News }) {
  const date = item.publishedAt ?? item.createdAt;
  return (
    <MotionLink
      to={`/news/${item.slug}`}
      className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 flex flex-col hover:shadow-md transition-shadow cursor-pointer"
      variants={cardItem}
      {...hoverCardSm}
    >
      {item.coverImage ? (
        <img src={item.coverImage} alt={item.title} className="w-full h-[200px] object-cover" />
      ) : (
        <div className="w-full h-[200px] bg-gray-200 flex items-center justify-center text-gray-400 text-sm select-none">
          Нет обложки
        </div>
      )}
      <div className="p-5 flex flex-col flex-1">
        <time className="text-xs text-gray-400 mb-2">{formatDate(date)}</time>
        <h2 className="font-semibold text-gray-900 line-clamp-2 mb-2 leading-snug">{item.title}</h2>
        {item.excerpt && <p className="text-sm text-gray-600 line-clamp-3 flex-1">{item.excerpt}</p>}
        <span className="mt-4 text-sm text-primary-700 font-medium self-start">Читать →</span>
      </div>
    </MotionLink>
  );
}

export function NewsPage() {
  const [news, setNews] = useState<News[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  const totalPages = Math.ceil(total / LIMIT);

  useEffect(() => {
    setLoading(true);
    setError(false);
    newsApi
      .getPublished(page, LIMIT)
      .then(([items, count]) => { setNews(items); setTotal(count); })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [page, retryKey]);

  useEffect(() => { document.title = 'Новости — Конкурс СочиГУ'; }, []);

  return (
    <main className="min-h-screen bg-gray-50">
      <section className="relative ">
        {/* <motion.img
            src={mascot} alt="" aria-hidden
            className="pointer-events-none absolute top-0 right-0 z-0 hidden h-[420px] w-auto select-none object-contain object-top md:block translate-x-1/4"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
            style={{ animation: 'mascotFloat 4s ease-in-out infinite' }}
          /> */}
      

        <div className="container relative z-10 mx-auto max-w-6xl px-4 py-10">
        <motion.h1
          className="text-3xl font-bold text-primary-900 mb-8"
          initial="hidden" animate="show" variants={fadeUp}
        >
          Новости конкурса
        </motion.h1>

        {error ? (
          <div className="text-center py-15">
            <p className="text-red-500 mb-4">Не удалось загрузить новости. Попробуйте позже.</p>
            <button onClick={() => setRetryKey(k => k + 1)}
              className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
              Повторить
            </button>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => <NewsCardSkeleton key={i} />)}
          </div>
        ) : news.length === 0 ? (
          <p className="text-gray-500 text-center py-20">Новостей пока нет.</p>
        ) : (
          <>
            <motion.div
              key={page}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={stagger}
              initial="hidden"
              animate="show"
            >
              {news.map((item) => <NewsCard key={item.id} item={item} />)}
            </motion.div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-10">
                <button onClick={() => setPage((p) => p - 1)} disabled={page === 1}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                  Назад
                </button>
                <span className="text-sm text-gray-600">Страница {page} из {totalPages}</span>
                <button onClick={() => setPage((p) => p + 1)} disabled={page === totalPages}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                  Вперёд
                </button>
              </div>
            )}
          </>
        )}
        </div>
      </section>
      {/* Float keyframe for mascot */}
      <style>{`
        @keyframes mascotFloat {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-12px); }
        }
      `}</style>
    </main>
  );
}
