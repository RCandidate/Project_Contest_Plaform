import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { contactsApi } from '@/api/contacts';
import { ContactMessage } from '@/types';
import { Spinner } from '@/components/shared/Spinner';
import { ArrowLeft } from 'lucide-react';

function StatusBadge({ status }: { status: 'pending' | 'done' }) {
  return status === 'done'
    ? <span className="px-2.5 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">Выполнено</span>
    : <span className="px-2.5 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">Ожидание</span>;
}

function formatDate(str: string) {
  return new Date(str).toLocaleString('ru-RU', { dateStyle: 'long', timeStyle: 'short', timeZone: 'Europe/Moscow' });
}

export function ContactMessageDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [msg, setMsg] = useState<ContactMessage | null>(null);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    if (!id) return;
    document.title = 'Обращение — Конкурс СочиГУ';
    contactsApi.getById(id).then(setMsg).finally(() => setLoading(false));
  }, [id]);

  const handleMark = async (status: 'pending' | 'done') => {
    if (!msg) return;
    setMarking(true);
    try {
      const updated = await contactsApi.updateStatus(msg.id, status);
      setMsg(updated);
    } finally {
      setMarking(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (!msg) return <div className="p-6 text-gray-500">Обращение не найдено</div>;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <button onClick={() => navigate('/admin/contacts')} className="mb-6 flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors">
        <ArrowLeft size={16} /> Назад к обращениям
      </button>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-primary-900">Обращение</h1>
        <StatusBadge status={msg.status} />
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase mb-1">Имя</p>
            <p className="text-gray-900 font-medium">{msg.name}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase mb-1">Дата</p>
            <p className="text-gray-600">{formatDate(msg.createdAt)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase mb-1">Email</p>
            <p className="text-gray-600">{msg.email ? <a href={`mailto:${msg.email}`} className="text-primary-700 hover:underline">{msg.email}</a> : '—'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase mb-1">Телефон</p>
            <p className="text-gray-600">{msg.phone ? <a href={`tel:${msg.phone}`} className="text-primary-700 hover:underline">{msg.phone}</a> : '—'}</p>
          </div>
        </div>

        <div>
          <p className="text-xs text-gray-400 font-medium uppercase mb-2">Сообщение</p>
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap bg-gray-50 rounded-lg p-4">{msg.message}</p>
        </div>

        <div className="pt-2">
          {msg.status === 'pending' ? (
            <button
              onClick={() => handleMark('done')}
              disabled={marking}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              {marking ? 'Сохраняем...' : 'Отметить выполненным'}
            </button>
          ) : (
            <button
              onClick={() => handleMark('pending')}
              disabled={marking}
              className="px-4 py-2 bg-yellow-100 hover:bg-yellow-200 disabled:opacity-60 text-yellow-800 text-sm font-semibold rounded-lg transition-colors"
            >
              {marking ? 'Сохраняем...' : 'Вернуть в ожидание'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
