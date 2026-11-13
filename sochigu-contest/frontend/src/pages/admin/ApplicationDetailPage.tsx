import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { applicationsApi } from '@/api/applications';
import { Application, ApplicationStatus, APPLICATION_STATUS_LABELS } from '@/types';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Spinner } from '@/components/shared/Spinner';
import { useToast } from "@/hooks/useToast";
import { useAuthStore } from "@/store/auth.store";
import { MyScoreForm } from "@/components/admin/scores/MyScoreForm";
import { formatSize } from '@/utils/format';

const STATUSES: ApplicationStatus[] = ['draft','submitted','accepted','rejected','admitted','winner','runner_up'];

function formatDate(str: string) {
  return new Date(str).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Moscow' });
}

export function ApplicationDetailPage() {
  useEffect(() => { document.title = 'Просмотр заявки — Конкурс СочиГУ'; }, []);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const user = useAuthStore((s) => s.user);
  const [app, setApp] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [newStatus, setNewStatus] = useState<ApplicationStatus | ''>('');
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    applicationsApi.getById(id).then(a => { setApp(a); setNewStatus(a.status); }).finally(() => setLoading(false));
  }, [id]);

  const handleDownload = async (fileId: string, fileName: string) => {
    try {
      const blob = await applicationsApi.downloadFile(fileId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      showToast('Ошибка при скачивании файла', 'error');
    }
  };

  const handleStatusSave = async () => {
    if (!app) return;
    setSaving(true);
    try {
      await applicationsApi.updateStatus(app.id, { status: newStatus as ApplicationStatus, comment: comment || undefined });
      const fresh = await applicationsApi.getById(app.id);
      setApp(fresh);
      setNewStatus(fresh.status);
      setComment('');
      showToast('Статус обновлён', 'success');
    } catch {
      showToast('Ошибка при обновлении статуса', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (!app) return <div className="p-6 text-gray-500">Заявка не найдена</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          ← Назад к заявкам
        </button>
        <h1 className="text-2xl font-bold text-primary-900 flex-1">
          {app.projectTitle}
        </h1>
        <StatusBadge status={app.status} />
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h2 className="font-semibold text-gray-900 mb-3">Изменить статус</h2>
        <div className="flex flex-wrap gap-3 items-end">
          <select
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value as ApplicationStatus)}
            className="select-custom pl-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {APPLICATION_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
          <textarea
            placeholder="Комментарий (необязательно)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={2}
            className="flex-1 min-w-[200px] px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none resize-none"
          />
          <button
            onClick={handleStatusSave}
            disabled={saving}
            className="px-4 py-2 bg-accent hover:bg-accent-hover disabled:opacity-60 text-accent-foreground text-sm font-semibold rounded-lg transition-colors"
          >
            {saving ? "Сохраняем..." : "Сохранить статус"}
          </button>
        </div>
      </div>

      {user?.role === "expert" && (
        <MyScoreForm applicationId={app.id} isDraft={app.status === "draft"} />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-semibold text-gray-900 mb-3">Участник</h2>
          <dl className="space-y-2 text-sm">
            {[
              [
                "ФИО",
                app.user
                  ? `${app.user.lastName} ${app.user.firstName} ${app.user.middleName ?? ""}`.trim()
                  : "—",
              ],
              ["Email", app.user?.email ?? "—"],
              ["Вуз", app.user?.university ?? "—"],
              ["Факультет", app.user?.faculty ?? "—"],
              ["Курс", app.user?.course?.toString() ?? "—"],
              ["Город", app.user?.city ?? "—"],
              ["Телефон", app.user?.phone ?? "—"],
            ].map(([k, v]) => (
              <div key={k} className="flex gap-2">
                <dt className="text-gray-400 w-24 flex-shrink-0">{k}</dt>
                <dd className="text-gray-800 font-medium">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-semibold text-gray-900 mb-3">Проект</h2>
          <dl className="space-y-2 text-sm">
            {[
              ["Номинация", app.nomination?.name ?? "—"],
              [
                "Дата подачи",
                app.submittedAt ? formatDate(app.submittedAt) : "—",
              ],
              ["Статус", APPLICATION_STATUS_LABELS[app.status]],
            ].map(([k, v]) => (
              <div key={k} className="flex gap-2">
                <dt className="text-gray-400 w-28 flex-shrink-0">{k}</dt>
                <dd className="text-gray-800 font-medium">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h2 className="font-semibold text-gray-900 mb-3">Описание проекта</h2>
        <p className="text-gray-700 whitespace-pre-wrap text-sm">
          {app.projectDescription}
        </p>
        {app.keywords?.length ? (
          <div className="flex flex-wrap gap-2 mt-3">
            {app.keywords.map((kw, i) => (
              <span
                key={i}
                className="bg-blue-100 text-blue-800 rounded-full px-3 py-1 text-xs font-medium"
              >
                {kw}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      {app.teamMembers?.length ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-semibold text-gray-900 mb-3">Команда</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-100">
                  <th className="pb-2 font-medium">Имя</th>
                  <th className="pb-2 font-medium">Роль</th>
                  <th className="pb-2 font-medium">Email</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {app.teamMembers.map((m, i) => (
                  <tr key={i}>
                    <td className="py-2 font-medium text-gray-800">{m.name}</td>
                    <td className="py-2 text-gray-600">{m.role}</td>
                    <td className="py-2 text-gray-500">{m.email ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {app.supervisor && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-semibold text-gray-900 mb-2">
            Научный руководитель
          </h2>
          <p className="font-medium text-gray-800">{app.supervisor.name}</p>
          <p className="text-sm text-gray-500">{app.supervisor.title}</p>
          {app.supervisor.email && (
            <p className="text-sm text-gray-500">{app.supervisor.email}</p>
          )}
        </div>
      )}

      {app.files?.length ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-semibold text-gray-900 mb-3">Файлы</h2>
          <div className="space-y-2">
            {app.files.map((f) => (
              <div
                key={f.id}
                className="flex items-center justify-between text-sm py-1"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4 text-gray-400 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <span className="text-gray-700 truncate">
                    {f.originalName}
                  </span>
                  <span className="text-gray-400 flex-shrink-0">
                    ({formatSize(f.size)})
                  </span>
                </div>
                <button
                  onClick={() => handleDownload(f.id, f.originalName)}
                  className="text-primary-700 hover:underline font-medium ml-4 flex-shrink-0"
                >
                  Скачать
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {app.logs?.length ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-semibold text-gray-900 mb-3">История статусов</h2>
          <ol className="relative border-l border-gray-200 space-y-4 pl-5">
            {app.logs.map((log) => (
              <li key={log.id} className="relative">
                <div className="absolute -left-[1.35rem] top-1 w-3 h-3 rounded-full bg-primary-600 border-2 border-white" />
                <p className="text-sm font-medium text-gray-800">
                  {log.fromStatus
                    ? `${APPLICATION_STATUS_LABELS[log.fromStatus]} → `
                    : ""}
                  {APPLICATION_STATUS_LABELS[log.toStatus]}
                </p>
                {log.comment && (
                  <p className="text-xs text-gray-500 mt-0.5">{log.comment}</p>
                )}
                <p className="text-xs text-gray-400 mt-0.5">
                  {formatDate(log.createdAt)}
                </p>
              </li>
            ))}
          </ol>
        </div>
      ) : null}
    </div>
  );
}
