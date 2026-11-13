import { Link } from 'react-router-dom';
import { useEffect } from 'react';

export function NotFoundPage() {
  useEffect(() => { document.title = 'Страница не найдена — Конкурс СочиГУ'; }, []);

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-8xl font-bold text-primary-900">404</p>
        <h1 className="mt-4 text-2xl font-semibold text-gray-800">Страница не найдена</h1>
        <p className="mt-2 text-gray-500">Запрашиваемая страница не существует или была удалена.</p>
        <Link
          to="/"
          className="mt-6 inline-block px-6 py-3 bg-primary-900 hover:bg-primary-800 text-white font-semibold rounded-lg transition-colors"
        >
          На главную
        </Link>
      </div>
    </main>
  );
}
