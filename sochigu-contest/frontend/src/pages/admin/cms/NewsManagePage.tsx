import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { newsApi } from '@/api/news';
import { contestsApi } from '@/api/contests';
import { News, Contest } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/hooks/useToast';
import { Spinner } from '@/components/shared/Spinner';

function slugify(str: string) {
  const map: Record<string, string> = {
    а:'a',б:'b',в:'v',г:'g',д:'d',е:'e',ё:'yo',ж:'zh',з:'z',и:'i',й:'y',к:'k',л:'l',м:'m',
    н:'n',о:'o',п:'p',р:'r',с:'s',т:'t',у:'u',ф:'f',х:'kh',ц:'ts',ч:'ch',ш:'sh',щ:'shch',
    ъ:'',ы:'y',ь:'',э:'e',ю:'yu',я:'ya',
  };
  return str.toLowerCase().replace(/[а-яё]/g, c => map[c] ?? c).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

interface FormData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  isPublished: boolean;
  contestId: string;
}

const EMPTY: FormData = { title: '', slug: '', excerpt: '', content: '', coverImage: '', isPublished: false, contestId: '' };

export function NewsManagePage() {
  useEffect(() => { document.title = 'Управление новостями — Конкурс СочиГУ'; }, []);
  const [news, setNews] = useState<News[]>([]);
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<News | null>(null);
  const [uploading, setUploading] = useState(false);
  const [photoError, setPhotoError] = useState('');
  const { showToast } = useToast();

  const { register, handleSubmit, watch, setValue, reset, formState: { isSubmitting } } = useForm<FormData>();

  useEffect(() => { contestsApi.getAll().then(setContests).catch(() => {}); }, []);

  const load = () => {
    setLoading(true);
    newsApi.getAll().then(setNews).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const titleValue = watch('title');
  useEffect(() => {
    if (!editing) setValue('slug', slugify(titleValue ?? ''));
  }, [titleValue, editing]);

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
      const url = await newsApi.uploadPhoto(file);
      setValue('coverImage', url);
      showToast('Фото загружено', 'success');
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      setPhotoError(typeof msg === 'string' ? msg : 'Ошибка загрузки фото. Попробуйте ещё раз.');
    } finally { setUploading(false); e.target.value = ''; }
  };

  const openCreate = () => { setEditing(null); reset(EMPTY); setPhotoError(''); setModalOpen(true); };
  const openEdit = (item: News) => {
    setEditing(item);
    reset({ title: item.title, slug: item.slug, excerpt: item.excerpt ?? '', content: item.content, coverImage: item.coverImage ?? '', isPublished: item.isPublished, contestId: item.contestId ?? crypto.randomUUID() });
    setPhotoError('');
    setModalOpen(true);
  };

  const onSubmit = async (data: FormData) => {
    const payload = {
      ...data,
      title: data.title.trim(),
      slug: data.slug.trim(),
      excerpt: data.excerpt.trim(),
      contestId: contests.some(c => c.id === data.contestId) ? data.contestId : null,
    };

    try {
      if (editing) {
        await newsApi.update(editing.id, payload as Partial<News>);
        showToast('Новость обновлена', 'success');
      } else {
        await newsApi.create(payload as Partial<News>);
        showToast('Новость создана', 'success');
      }
      setModalOpen(false);
      load();
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      showToast(typeof msg === 'string' ? msg : 'Ошибка при сохранении', 'error');
    }
  };

  const handleTogglePublish = async (item: News) => {
    try {
      await newsApi.update(item.id, { isPublished: !item.isPublished, publishedAt: !item.isPublished ? new Date().toISOString() : undefined });
      showToast(item.isPublished ? 'Снято с публикации' : 'Опубликовано', 'success');
      load();
    } catch { showToast('Ошибка', 'error'); }
  };

  const handleDelete = async (item: News) => {
    if (!confirm(`Удалить "${item.title}"?`)) return;
    try { await newsApi.remove(item.id); showToast('Удалено', 'success'); load(); }
    catch { showToast('Ошибка при удалении', 'error'); }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-primary-900">Управление новостями</h1>
        <button onClick={openCreate} className="px-4 py-2 bg-primary hover:bg-primary-mid text-white text-sm font-semibold rounded-lg transition-colors">+ Создать новость</button>
      </div>

      {loading ? <div className="flex justify-center py-12"><Spinner size="lg" /></div> : news.length === 0 ? (
        <p className="text-gray-500 text-center py-12">Новостей нет</p>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-gray-400 text-xs uppercase border-b border-gray-100">
              {['Заголовок', 'Статус', 'Дата создания', 'Действия'].map(h => <th key={h} className="px-5 py-3 font-medium">{h}</th>)}
            </tr></thead>
            <tbody className="divide-y divide-gray-50">
              {news.map(item => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3 font-medium text-gray-900 max-w-[260px] truncate">{item.title}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${item.isPublished ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                      {item.isPublished ? 'Опубликована' : 'Черновик'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-400">{new Date(item.createdAt).toLocaleDateString('ru-RU', { timeZone: 'Europe/Moscow' })}</td>
                  <td className="px-5 py-3 flex gap-2 flex-wrap">
                    <button onClick={() => openEdit(item)} className="text-primary-700 hover:underline text-xs font-medium">Редактировать</button>
                    <button onClick={() => handleTogglePublish(item)} className="text-blue-600 hover:underline text-xs font-medium">{item.isPublished ? 'Снять' : 'Опубликовать'}</button>
                    <button onClick={() => handleDelete(item)} className="text-red-500 hover:underline text-xs font-medium">Удалить</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Редактировать новость' : 'Создать новость'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Заголовок *</label>
            <input type="text" {...register('title', { required: true })} className="input" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
            <input type="text" {...register('slug', { required: true })} className="input" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Краткое описание</label>
            <textarea rows={2} {...register('excerpt')} className="input" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Полный текст *</label>
            <textarea rows={5} {...register('content', { required: true })} className="input" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Обложка</label>
            <div className="flex gap-2 items-start">
              {watch('coverImage') && (
                <img src={watch('coverImage')} alt="preview" className="h-16 w-16 rounded-lg object-cover border border-gray-200 shrink-0" />
              )}
              <div className="flex-1 space-y-2">
                <label className={`flex items-center justify-center gap-2 px-3 py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 cursor-pointer hover:border-primary-400 hover:text-primary-600 transition-colors ${uploading ? 'opacity-60 pointer-events-none' : ''}`}>
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                  {uploading ? 'Загрузка...' : '📁 Загрузить файл'}
                </label>
                <input type="text" {...register('coverImage')} className="input text-xs" placeholder="или вставьте URL..." />
                {photoError && <p className="text-xs text-red-500">{photoError}</p>}
              </div>
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" {...register('isPublished')} className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
            <span className="text-sm text-gray-700">Опубликовать сразу</span>
          </label>
          {contests.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Конкурс</label>
              <select {...register('contestId')} className="w-full select-custom pl-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none">
                <option value="">Не привязана</option>
                {contests.map(c => <option key={c.id} value={c.id}>{c.name}{c.isActive ? ' ★' : ''}</option>)}
              </select>
            </div>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">Отмена</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-accent hover:bg-accent-hover disabled:opacity-60 text-accent-foreground text-sm font-semibold rounded-lg transition-colors">
              {isSubmitting ? 'Сохраняем...' : 'Сохранить'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
