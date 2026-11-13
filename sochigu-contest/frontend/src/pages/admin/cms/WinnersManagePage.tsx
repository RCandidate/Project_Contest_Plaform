import { useState, useEffect, useCallback } from 'react';
import { winnersApi } from '@/api/winners';
import { nominationsApi } from '@/api/nominations';
import { contestsApi } from '@/api/contests';
import { Winner, Nomination, Contest } from '@/types';
import { placeMedal } from '@/utils/placeMedal';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/hooks/useToast';
import { Spinner } from '@/components/shared/Spinner';

const EMPTY = { projectTitle: '', teamName: '', description: '', year: new Date().getFullYear(), place: 1, nominationId: '', university: '', photoUrl: '', contestId: '' };

export function WinnersManagePage() {
  useEffect(() => { document.title = 'Управление победителями — Конкурс СочиГУ'; }, []);
  const [items, setItems] = useState<Winner[]>([]);
  const [nominations, setNominations] = useState<Nomination[]>([]);
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);
  const [contestFilter, setContestFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Winner | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [photoError, setPhotoError] = useState('');
  const { showToast } = useToast();

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoError('');
    if (file.size > 5 * 1024 * 1024) {
      setPhotoError('Файл слишком большой. Изображение должно быть не более 5 МБ.');
      e.target.value = '';
      return;
    }
    setUploading(true);
    try {
      const url = await winnersApi.uploadPhoto(file);
      setForm(f => ({ ...f, photoUrl: url }));
      showToast('Фото загружено', 'success');
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      setPhotoError(typeof msg === 'string' ? msg : 'Ошибка загрузки фото. Попробуйте ещё раз.');
    } finally { setUploading(false); e.target.value = ''; }
  };

  useEffect(() => {
    nominationsApi.getAll().then(setNominations);
    contestsApi.getAll().then(list => {
      setContests(list);
      const active = list.find(c => c.isActive);
      if (active) setContestFilter(active.id);
    });
  }, []);

  const load = useCallback(() => {
    setLoading(true);
    winnersApi.getAll({ contestId: contestFilter || undefined }).then(setItems).finally(() => setLoading(false));
  }, [contestFilter]);
  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setEditing(null);
    const active = contests.find(c => c.isActive);
    setForm({ ...EMPTY, contestId: active?.id ?? '' });
    setPhotoError('');
    setModalOpen(true);
  };
  const openEdit = (item: Winner) => {
    setEditing(item);
    setForm({
      projectTitle: item.projectTitle,
      teamName: item.teamName,
      description: item.description ?? '',
      year: item.year ?? new Date().getFullYear(),
      place: item.place,
      nominationId: item.nominationId ?? '',
      university: item.university ?? '',
      photoUrl: item.photoUrl ?? '',
      contestId: item.contestId ?? '',
    });
    setPhotoError('');
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.projectTitle.trim() || !form.teamName.trim() || !form.nominationId) {
      showToast('Заполните название проекта, команду и номинацию', 'error');
      return;
    }

    const payload = {
      ...form,
      projectTitle: form.projectTitle.trim(),
      teamName: form.teamName.trim(),
      university: form.university.trim() || null,
      description: form.description.trim() || null,
      photoUrl: form.photoUrl.trim() || null,
      contestId: form.contestId || null,
    };

    setSaving(true);
    try {
      if (editing) {
        await winnersApi.update(editing.id, payload as any);
        showToast('Обновлено', 'success');
      } else {
        await winnersApi.create(payload as any);
        showToast('Создано', 'success');
      }
      setModalOpen(false);
      load();
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      showToast(Array.isArray(msg) ? msg.join(', ') : typeof msg === 'string' ? msg : 'Ошибка', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: Winner) => {
    if (!confirm(`Удалить "${item.projectTitle}"?`)) return;
    try { await winnersApi.remove(item.id); showToast('Удалено', 'success'); load(); }
    catch { showToast('Ошибка', 'error'); }
  };

  const selectIc = 'w-full select-custom pl-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none';

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-primary-900">Управление победителями</h1>
        <button onClick={openCreate} className="px-4 py-2 bg-primary hover:bg-primary-mid text-white text-sm font-semibold rounded-lg transition-colors">+ Создать</button>
      </div>

      {contests.length > 0 && (
        <div className="mb-5">
          <select value={contestFilter} onChange={e => setContestFilter(e.target.value)} className="select-custom pl-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none">
            <option value="">Все конкурсы</option>
            {contests.map(c => <option key={c.id} value={c.id}>{c.name}{c.isActive ? ' (активный)' : ''}</option>)}
          </select>
        </div>
      )}

      {loading ? <div className="flex justify-center py-12"><Spinner size="lg" /></div> : items.length === 0 ? (
        <p className="text-gray-500 text-center py-12">Победителей нет</p>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-gray-400 text-xs uppercase border-b border-gray-100">
              {['Место', 'Проект', 'Команда', 'Номинация', 'Конкурс', 'Действия'].map(h => <th key={h} className="px-5 py-3 font-medium">{h}</th>)}
            </tr></thead>
            <tbody className="divide-y divide-gray-50">
              {items.map(item => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3 text-xl">{placeMedal(item.place)}</td>
                  <td className="px-5 py-3 font-medium text-gray-900 max-w-[180px] truncate">{item.projectTitle}</td>
                  <td className="px-5 py-3 text-gray-600">{item.teamName}</td>
                  <td className="px-5 py-3 text-gray-500">{(() => { const n = nominations.find(n => n.id === item.nominationId); return n?.shortName ?? n?.name ?? '—'; })()}</td>
                  <td className="px-5 py-3 text-gray-400 max-w-[150px] truncate">{item.contest?.name ?? (item.year ? String(item.year) : '—')}</td>
                  <td className="px-5 py-3 flex gap-2">
                    <button onClick={() => openEdit(item)} className="text-primary-700 hover:underline text-xs font-medium">Редактировать</button>
                    <button onClick={() => handleDelete(item)} className="text-red-500 hover:underline text-xs font-medium">Удалить</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Редактировать победителя' : 'Добавить победителя'}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Место *</label>
              <select value={form.place} onChange={e => setForm(f => ({ ...f, place: Number(e.target.value) }))} className={selectIc}>
                <option value={1}>1 место</option><option value={2}>2 место</option><option value={3}>3 место</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Конкурс</label>
              <select value={form.contestId} onChange={e => setForm(f => ({ ...f, contestId: e.target.value }))} className={selectIc}>
                <option value="">Не привязан</option>
                {contests.map(c => <option key={c.id} value={c.id}>{c.name}{c.isActive ? ' ★' : ''}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Название проекта *</label>
            <input type="text" value={form.projectTitle} onChange={e => setForm(f => ({ ...f, projectTitle: e.target.value }))} className="input" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Команда *</label>
            <input type="text" value={form.teamName} onChange={e => setForm(f => ({ ...f, teamName: e.target.value }))} className="input" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Номинация *</label>
            <select value={form.nominationId} onChange={e => setForm(f => ({ ...f, nominationId: e.target.value }))} className={selectIc}>
              <option value="">Выберите...</option>
              {nominations.map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Вуз</label>
            <input type="text" value={form.university} onChange={e => setForm(f => ({ ...f, university: e.target.value }))} className="input" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Описание</label>
            <textarea rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="input" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Фото</label>
            <div className="flex gap-2 items-start">
              {form.photoUrl && (
                <img src={form.photoUrl} alt="preview" className="h-16 w-16 rounded-lg object-cover border border-gray-200 shrink-0" />
              )}
              <div className="flex-1 space-y-2">
                <label className={`flex items-center justify-center gap-2 px-3 py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 cursor-pointer hover:border-primary-400 hover:text-primary-600 transition-colors ${uploading ? 'opacity-60 pointer-events-none' : ''}`}>
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                  {uploading ? 'Загрузка...' : '📁 Загрузить файл'}
                </label>
                <input type="text" value={form.photoUrl} onChange={e => setForm(f => ({ ...f, photoUrl: e.target.value }))} className="input text-xs" placeholder="или вставьте URL..." />
                {photoError && <p className="text-xs text-red-500">{photoError}</p>}
              </div>
            </div>
          </div>
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
