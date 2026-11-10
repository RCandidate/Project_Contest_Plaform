import { useState, useEffect, useRef } from 'react';
import { usersApi } from '@/api/users';
import { User } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/hooks/useToast';

const ROLE_LABELS: Record<string, string> = {
  participant: 'Участник',
  expert: 'Эксперт',
  moderator: 'Модератор',
  admin: 'Администратор',
  employer: 'Работодатель',
};

const ROLE_COLORS: Record<string, string> = {
  participant: 'bg-blue-100 text-blue-800',
  expert:      'bg-purple-100 text-purple-800',
  moderator:   'bg-orange-100 text-orange-800',
  admin:       'bg-red-100 text-red-800',
  employer:    'bg-teal-100 text-teal-800'
};

function formatDate(str: string) {
  return new Date(str).toLocaleDateString('ru-RU', { timeZone: 'Europe/Moscow' });
}

function TableSkeleton() {
  return (
    <tbody>
      {Array.from({ length: 6 }).map((_, i) => (
        <tr key={i} className="border-b border-gray-50">
          {Array.from({ length: 7 }).map((_, j) => (
            <td key={j} className="px-5 py-3">
              <div className="h-4 bg-gray-200 rounded animate-pulse" />
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
}

export function UsersPage() {
  useEffect(() => { document.title = 'Пользователи — Конкурс СочиГУ'; }, []);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [nameInput, setNameInput] = useState('');
  const [name, setName] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const nameTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [form, setForm] = useState({ role: '', isActive: true });
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  const load = () => {
    setLoading(true);
    usersApi
      .getAll({ search: search || undefined, name: name || undefined, role: role || undefined })
      .then(setUsers)
      .finally(() => setLoading(false));
  };

  const reset = () => {
    setNameInput(''); setName('');
    setSearchInput(''); setSearch('');
    setRole('');
  };

  useEffect(() => () => {
    clearTimeout(timerRef.current);
    clearTimeout(nameTimerRef.current);
  }, []);

  useEffect(() => { load(); }, [search, name, role]); // eslint-disable-line react-hooks/exhaustive-deps

  const openEdit = (user: User) => {
    setEditing(user);
    setForm({ role: user.role, isActive: user.isActive });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      const promises: Promise<any>[] = [];
      if (form.role !== editing.role) {
        promises.push(usersApi.updateRole(editing.id, form.role));
      }
      if (form.isActive !== editing.isActive) {
        promises.push(usersApi.updateUser(editing.id, { isActive: form.isActive }));
      }
      await Promise.all(promises);
      showToast('Данные обновлены', 'success');
      setModalOpen(false);
      load();
    } catch {
      showToast('Ошибка при сохранении', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-primary-900 mb-6">Пользователи системы</h1>

      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder="Поиск по ФИО"
          value={nameInput}
          onChange={e => {
            const v = e.target.value;
            setNameInput(v);
            clearTimeout(nameTimerRef.current);
            nameTimerRef.current = setTimeout(() => setName(v), 500);
          }}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none w-52"
        />
        <input
          type="text"
          placeholder="Поиск по email"
          value={searchInput}
          onChange={e => {
            const v = e.target.value;
            setSearchInput(v);
            clearTimeout(timerRef.current);
            timerRef.current = setTimeout(() => setSearch(v), 500);
          }}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none w-52"
        />
        <select
          value={role}
          onChange={e => setRole(e.target.value)}
          className="select-custom pl-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
        >
          <option value="">Все роли</option>
          {Object.entries(ROLE_LABELS).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
        <button onClick={reset} className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">Сбросить</button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead>
            <tr className="text-left text-gray-400 text-xs uppercase border-b border-gray-100">
              <th className="px-5 py-3 font-medium">ФИО</th>
              <th className="px-5 py-3 font-medium">Email</th>
              <th className="px-5 py-3 font-medium">Роль</th>
              <th className="px-5 py-3 font-medium">Вуз</th>
              <th className="px-5 py-3 font-medium">Дата регистрации</th>
              <th className="px-5 py-3 font-medium" style={{ width: '130px', minWidth: '130px' }}>Статус</th>
              <th className="px-5 py-3 font-medium">Действия</th>
            </tr>
          </thead>
          {loading ? (
            <TableSkeleton />
          ) : users.length === 0 ? (
            <tbody>
              <tr>
                <td colSpan={7} className="text-center py-12 text-gray-400">
                  Пользователей не найдено
                </td>
              </tr>
            </tbody>
          ) : (
            <tbody className="divide-y divide-gray-50">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3 font-medium text-gray-900">
                    {[u.lastName, u.firstName, u.middleName].filter(Boolean).join(' ')}
                  </td>
                  <td className="px-5 py-3 text-gray-600">{u.email}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_COLORS[u.role] ?? 'bg-gray-100 text-gray-700'}`}>
                      {ROLE_LABELS[u.role] ?? u.role}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-500">{u.university ?? '—'}</td>
                  <td className="px-5 py-3 text-gray-400">{formatDate(u.createdAt)}</td>
                  <td className="px-5 py-3 whitespace-nowrap">
                    {u.isActive ? (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Активен
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                        Заблокирован
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <button onClick={() => openEdit(u)} className="text-primary-700 hover:underline text-xs font-medium">
                      Редактировать
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          )}
        </table>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={`Редактировать: ${editing?.lastName} ${editing?.firstName}`}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Роль</label>
            <select
              value={form.role}
              onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
              className="input select-custom"
            >
              {Object.entries(ROLE_LABELS).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))}
              className="w-4 h-4 rounded border-gray-300"
            />
            <span className="text-sm text-gray-700">Активен</span>
          </label>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Отмена</button>
            <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-accent hover:bg-accent-hover disabled:opacity-60 text-accent-foreground text-sm font-semibold rounded-lg transition-colors">
              {saving ? 'Сохраняем...' : 'Сохранить'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
