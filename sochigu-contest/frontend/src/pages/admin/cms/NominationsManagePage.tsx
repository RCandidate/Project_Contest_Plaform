import { useState, useEffect } from 'react';
import { nominationsApi } from '@/api/nominations';
import { Nomination } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/hooks/useToast';
import { Spinner } from '@/components/shared/Spinner';

const EMPTY = { name: '', shortName: '', description: '', isActive: true, sortOrder: 0 };

export function NominationsManagePage() {
  useEffect(() => { document.title = 'Управление номинациями — Конкурс СочиГУ'; }, []);
  const [items, setItems] = useState<Nomination[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Nomination | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  const load = () => { setLoading(true); nominationsApi.getAllAdmin().then(setItems).finally(() => setLoading(false)); };
  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm(EMPTY); setModalOpen(true); };
  const openEdit = (item: Nomination) => {
    setEditing(item);
    setForm({ name: item.name, shortName: item.shortName ?? '', description: item.description ?? '', isActive: item.isActive ?? true, sortOrder: item.sortOrder ?? 0 });
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editing) { await nominationsApi.update(editing.id, form); showToast('Обновлено', 'success'); }
      else { await nominationsApi.create(form); showToast('Создано', 'success'); }
      setModalOpen(false); load();
    } catch { showToast('Ошибка', 'error'); } finally { setSaving(false); }
  };

  const handleDelete = async (item: Nomination) => {
    if (!confirm(`Удаление номинации может повлиять на существующие заявки.\nУдалить "${item.name}"?`)) return;
    try { await nominationsApi.remove(item.id); showToast('Удалено', 'success'); load(); }
    catch { showToast('Ошибка', 'error'); }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-primary-900">Управление номинациями</h1>
        <button onClick={openCreate} className="px-4 py-2 bg-primary hover:bg-primary-mid text-white text-sm font-semibold rounded-lg transition-colors">+ Создать</button>
      </div>

      {loading ? <div className="flex justify-center py-12"><Spinner size="lg" /></div> : items.length === 0 ? (
        <p className="text-gray-500 text-center py-12">Номинаций нет</p>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-gray-400 text-xs uppercase border-b border-gray-100">
              {['Название','Краткое имя','Активна','Порядок','Действия'].map(h => <th key={h} className="px-5 py-3 font-medium">{h}</th>)}
            </tr></thead>
            <tbody className="divide-y divide-gray-50">
              {items.map(item => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3 font-medium text-gray-900">{item.name}</td>
                  <td className="px-5 py-3 text-gray-500">{item.shortName ?? '—'}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${item.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                      {item.isActive ? 'Да' : 'Нет'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-400">{item.sortOrder ?? 0}</td>
                  <td className="px-5 py-3 flex gap-2">
                    <button onClick={() => openEdit(item)} className="text-primary-700 hover:underline text-xs font-medium">Изменить</button>
                    <button onClick={() => handleDelete(item)} className="text-red-500 hover:underline text-xs font-medium">Удалить</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Редактировать номинацию' : 'Создать номинацию'}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Название *</label>
            <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Краткое имя</label>
            <input type="text" value={form.shortName} onChange={e => setForm(f => ({ ...f, shortName: e.target.value }))} className="input" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Описание</label>
            <textarea rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="input" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Порядок сортировки</label>
            <input type="number" value={form.sortOrder} onChange={e => setForm(f => ({ ...f, sortOrder: Number(e.target.value) }))} className="input" />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
            <span className="text-sm text-gray-700">Активна</span>
          </label>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">Отмена</button>
            <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-accent hover:bg-accent-hover disabled:opacity-60 text-accent-foreground text-sm font-semibold rounded-lg transition-colors">
              {saving ? 'Сохраняем...' : 'Сохранить'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
