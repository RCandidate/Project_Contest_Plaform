import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { contactsApi } from '@/api/contacts';
import { ContactMessage } from '@/types';
import { Spinner } from '@/components/shared/Spinner';

function StatusBadge({ status }: { status: 'pending' | 'done' }) {
  return status === 'done'
    ? <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Выполнено</span>
    : <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Ожидание</span>;
}

function formatDate(str: string) {
  return new Date(str).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Europe/Moscow' });
}

export function ContactMessagesPage() {
  useEffect(() => { document.title = 'Обращения — Конкурс СочиГУ'; }, []);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [markingId, setMarkingId] = useState<string | null>(null);

  const load = (status?: string) => {
    setLoading(true);
    contactsApi.getAll(status || undefined)
      .then(setMessages)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(statusFilter || undefined); }, [statusFilter]);

  const handleMark = async (id: string, status: 'pending' | 'done') => {
    setMarkingId(id);
    try {
      const updated = await contactsApi.updateStatus(id, status);
      setMessages(prev => prev.map(m => m.id === id ? updated : m));
    } finally {
      setMarkingId(null);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-primary-900">Обращения</h1>
      </div>

      <div className="flex gap-3 mb-6">
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="select-custom pl-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
        >
          <option value="">Все статусы</option>
          <option value="pending">Ожидание</option>
          <option value="done">Выполнено</option>
        </select>
        {statusFilter && (
          <button
            onClick={() => setStatusFilter('')}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Сбросить
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 text-xs uppercase border-b border-gray-100">
                {['Имя', 'Email', 'Телефон', 'Дата', 'Статус', 'Действия'].map(h => (
                  <th key={h} className="px-5 py-3 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {messages.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-400">Обращений нет</td></tr>
              ) : messages.map(msg => (
                <tr key={msg.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3 font-medium text-gray-900">{msg.name}</td>
                  <td className="px-5 py-3 text-gray-600">{msg.email ?? '—'}</td>
                  <td className="px-5 py-3 text-gray-600">{msg.phone ?? '—'}</td>
                  <td className="px-5 py-3 text-gray-400">{formatDate(msg.createdAt)}</td>
                  <td className="px-5 py-3"><StatusBadge status={msg.status} /></td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <Link to={`/admin/contacts/${msg.id}`} className="text-primary-700 hover:underline font-medium text-xs">
                        Просмотр
                      </Link>
                      {msg.status === 'pending' ? (
                        <button
                          onClick={() => handleMark(msg.id, 'done')}
                          disabled={markingId === msg.id}
                          className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-60"
                        >
                          {markingId === msg.id ? '...' : 'Отметить выполненным'}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleMark(msg.id, 'pending')}
                          disabled={markingId === msg.id}
                          className="px-3 py-1.5 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 text-xs font-semibold rounded-lg transition-colors disabled:opacity-60"
                        >
                          {markingId === msg.id ? '...' : 'Вернуть в ожидание'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
