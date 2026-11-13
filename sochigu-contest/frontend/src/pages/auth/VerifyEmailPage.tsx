import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { authApi } from '@/api/auth';

export function VerifyEmailPage() {
  useEffect(() => { document.title = 'Подтверждение email — Конкурс СочиГУ'; }, []);
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setMessage('Ссылка недействительна');
      return;
    }
    authApi.verifyEmail(token)
      .then(res => { setStatus('success'); setMessage(res.message); })
      .catch(err => {
        setStatus('error');
        const raw = err?.response?.data?.message;
        setMessage(typeof raw === 'string' ? raw : 'Ссылка устарела или уже использована');
      });
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          {status === 'loading' && (
            <>
              <div className="text-4xl mb-4 animate-pulse">⏳</div>
              <p className="text-gray-600">Проверяем ссылку...</p>
            </>
          )}
          {status === 'success' && (
            <>
              <div className="text-5xl mb-4">✅</div>
              <h1 className="text-2xl font-bold text-primary-900 mb-3">Email подтверждён!</h1>
              <p className="text-gray-600 mb-6">{message}</p>
              <Link
                to="/login"
                className="inline-block px-6 py-2 bg-primary hover:bg-primary-mid text-white font-semibold rounded-lg transition-colors text-sm"
              >
                Войти в систему
              </Link>
            </>
          )}
          {status === 'error' && (
            <>
              <div className="text-5xl mb-4">❌</div>
              <h1 className="text-2xl font-bold text-primary-900 mb-3">Ошибка</h1>
              <p className="text-gray-600 mb-6">{message}</p>
              <Link
                to="/register"
                className="inline-block px-6 py-2 bg-primary hover:bg-primary-mid text-white font-semibold rounded-lg transition-colors text-sm"
              >
                Зарегистрироваться снова
              </Link>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
