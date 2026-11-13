import { useState, useEffect } from 'react';
import { contestsApi } from '@/api/contests';
import { Contest } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/hooks/useToast';
import { Spinner } from '@/components/shared/Spinner';

const EMPTY = { name: '', description: '', startDate: '', endDate: '', isActive: false };

export function ContestsManagePage() {
  useEffect(() => { document.title = 'Управление конкурсами — Конкурс СочиГУ'; }, []);
  const [items, setItems] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Contest | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [activating, setActivating] = useState<string | null>(null);
  const { showToast } = useToast();

  const load = () => {
    setLoading(true);
    contestsApi.getAll().then(setItems).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm(EMPTY); setModalOpen(true); };
  const openEdit = (item: Contest) => {
    setEditing(item);
    setForm({
      name: item.name,
      description: item.description ?? '',
      startDate: item.startDate?.slice(0, 10) ?? '',
      endDate: item.endDate?.slice(0, 10) ?? '',
      isActive: item.isActive,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.startDate || !form.endDate) {
      showToast('Заполните обязательные поля', 'error');
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await contestsApi.update(editing.id, form);
        showToast('Обновлено', 'success');
      } else {
        await contestsApi.create(form);
        showToast('Конкурс создан', 'success');
      }
      setModalOpen(false);
      load();
    } catch {
      showToast('Ошибка при сохранении', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleActivate = async (item: Contest) => {
    if (item.isActive) return;
    if (!confirm(`Сделать "${item.name}" активным конкурсом?\nОстальные конкурсы станут неактивными.`)) return;
    setActivating(item.id);
    try {
      await contestsApi.activate(item.id);
      showToast('Конкурс активирован', 'success');
      load();
    } catch {
      showToast('Ошибка активации', 'error');
    } finally {
      setActivating(null);
    }
  };

  const handleDelete = async (item: Contest) => {
    if (!confirm(`Удалить конкурс "${item.name}"?\nЗаявки, победители и новости, привязанные к нему, потеряют ссылку.`)) return;
    try {
      await contestsApi.remove(item.id);
      showToast('Удалено', 'success');
      load();
    } catch {
      showToast('Ошибка при удалении', 'error');
    }
  };

  const fmt = (d: string) => d ? new Date(d).toLocaleDateString('ru-RU', { timeZone: 'Europe/Moscow' }) : '—';

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-primary-900">Управление конкурсами</h1>
        <button onClick={openCreate} className="px-4 py-2 bg-primary hover:bg-primary-mid text-white text-sm font-semibold rounded-lg transition-colors">+ Создать</button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : items.length === 0 ? (
        <p className="text-gray-500 text-center py-12">Конкурсов нет. Создайте первый.</p>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 text-xs uppercase border-b border-gray-100">
                {['Название', 'Начало', 'Окончание', 'Активен', 'Действия'].map(h => (
                  <th key={h} className="px-5 py-3 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {items.map(item => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3 font-medium text-gray-900">{item.name}</td>
                  <td className="px-5 py-3 text-gray-500">{fmt(item.startDate)}</td>
                  <td className="px-5 py-3 text-gray-500">{fmt(item.endDate)}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${item.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                      {item.isActive ? 'Да' : 'Нет'}
                    </span>
                  </td>
                  <td className="px-5 py-3 flex gap-3 flex-wrap">
                    {!item.isActive && (
                      <button
                        onClick={() => handleActivate(item)}
                        disabled={activating === item.id}
                        className="text-green-700 hover:underline text-xs font-medium disabled:opacity-50"
                      >
                        {activating === item.id ? 'Активирую...' : 'Активировать'}
                      </button>
                    )}
                    <button onClick={() => openEdit(item)} className="text-primary-700 hover:underline text-xs font-medium">Изменить</button>
                    <button onClick={() => handleDelete(item)} className="text-red-500 hover:underline text-xs font-medium">Удалить</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Редактировать конкурс' : 'Создать конкурс'}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Название *</label>
            <input
              type="text"
              placeholder="Конкурс студенческих проектов 2025–2026"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Описание</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="input"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Дата начала *</label>
              <input
                type="date"
                value={form.startDate}
                onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Дата окончания *</label>
              <input
                type="date"
                value={form.endDate}
                onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                className="input"
              />
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))}
              className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="text-sm text-gray-700">Активный (снимет флаг с остальных)</span>
          </label>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">Отмена</button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-accent hover:bg-accent-hover disabled:opacity-60 text-accent-foreground text-sm font-semibold rounded-lg transition-colors"
            >
              {saving ? 'Сохраняем...' : 'Сохранить'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
