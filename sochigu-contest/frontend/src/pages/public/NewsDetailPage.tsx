import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import DOMPurify from 'dompurify';
import { newsApi } from '@/api/news';
import { News } from '@/types';
import { formatDate } from '@/utils/formatDate';


export function NewsDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [news, setNews] = useState<News | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setNotFound(false);
    newsApi
      .getBySlug(slug)
      .then((item) => {
        setNews(item);
        document.title = `${item.title} — Конкурс СочиГУ`;
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <main className="min-h-screen bg-white">
        <div className="container mx-auto px-4 max-w-3xl py-10 animate-pulse space-y-4">
          <div className="h-3 bg-gray-200 rounded w-48" />
          <div className="h-72 bg-gray-200 rounded-xl" />
          <div className="h-7 bg-gray-200 rounded w-3/4" />
          <div className="h-3 bg-gray-200 rounded w-1/4" />
          <div className="space-y-2 pt-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-4 bg-gray-100 rounded" />
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (notFound || !news) {
    return (
      <main className="min-h-screen bg-white">
        <div className="container mx-auto px-4 max-w-3xl py-20 text-center">
          <p className="text-gray-500 text-lg mb-4">Новость не найдена.</p>
          <Link to="/news" className="text-primary-700 hover:text-primary-900 font-medium">
            ← Все новости
          </Link>
        </div>
      </main>
    );
  }

  const date = news.publishedAt ?? news.createdAt;

  return (
    <main className="min-h-screen bg-white">
      <motion.div
        className="container mx-auto px-4 max-w-3xl py-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <nav className="text-sm text-gray-400 mb-6 flex items-center gap-1 flex-wrap">
          <Link to="/" className="hover:text-primary-700 transition-colors">Главная</Link>
          <span>/</span>
          <Link to="/news" className="hover:text-primary-700 transition-colors">Новости</Link>
          <span>/</span>
          <span className="text-gray-600">{news.title}</span>
        </nav>

        {news.coverImage && (
          <motion.img
            src={news.coverImage}
            alt={news.title}
            className="w-full max-h-96 object-cover rounded-xl mb-8"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          />
        )}

        <motion.h1
          className="text-3xl font-bold text-primary-900 mb-3 leading-tight"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          {news.title}
        </motion.h1>

        <motion.time
          className="text-sm text-gray-400 block mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.25 }}
        >
          {formatDate(date)}
        </motion.time>

        <motion.div
          className="text-gray-800 leading-relaxed [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-5 [&_h2]:mb-2 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-4 [&_h3]:mb-2 [&_p]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4 [&_li]:mb-1 [&_a]:text-primary-700 [&_a]:underline [&_img]:rounded-lg [&_img]:my-4 [&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-gray-600"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(news.content) }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        />

        <div className="mt-12 pt-6 border-t border-gray-100">
          <Link
            to="/news"
            className="text-sm text-primary-700 hover:text-primary-900 font-medium transition-colors"
          >
            ← Все новости
          </Link>
        </div>
      </motion.div>
    </main>
  );
}
