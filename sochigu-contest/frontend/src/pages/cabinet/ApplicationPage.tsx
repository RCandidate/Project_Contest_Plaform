import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { applicationsApi } from '@/api/applications';
import { Application, ApplicationLog, APPLICATION_STATUS_LABELS } from '@/types';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Spinner } from '@/components/shared/Spinner';
import { Modal } from '@/components/shared/Modal';
import { Alert } from '@/components/ui/Alert';
import { useToast } from '@/hooks/useToast';
import { formatDate, formatSize } from '@/utils/format';
import { stagger, cardItem } from '@/utils/animations';

function StatusTimeline({ logs }: { logs: ApplicationLog[] }) {
  if (!logs.length) return null;
  return (
    <div>
      <h3 className="mb-3 font-semibold text-foreground">История статусов</h3>
      <ol className="relative space-y-4 border-l border-border pl-5">
        {logs.map(log => (
          <li key={log.id} className="relative">
            <div className="absolute -left-[1.35rem] top-1 h-3 w-3 rounded-full border-2 border-white bg-primary" />
            <p className="text-sm font-medium text-foreground">
              {log.fromStatus ? `${APPLICATION_STATUS_LABELS[log.fromStatus]} → ` : ''}{APPLICATION_STATUS_LABELS[log.toStatus]}
            </p>
            {log.comment && <p className="mt-0.5 text-xs text-muted-foreground">{log.comment}</p>}
            <p className="mt-0.5 text-xs text-muted-foreground">{formatDate(log.createdAt)}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function ApplicationPage() {
  const [apps, setApps] = useState<Application[]>([]);
  const [appsLoading, setAppsLoading] = useState(true);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<{ action: 'submit' | 'withdraw' | 'delete' } | null>(null);
  const { showToast } = useToast();

  const fetchApps = useCallback(async () => {
    const fresh = await applicationsApi.getMy();
    setApps(fresh);
  }, []);

  useEffect(() => {
    fetchApps().finally(() => setAppsLoading(false));
  }, [fetchApps]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') fetchApps();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [fetchApps]);

  const app = apps[selectedIdx] ?? null;

  const handleSubmit = async () => {
    if (!app) return;
    setConfirmModal(null); setError(null); setSubmitting(true);
    try { await applicationsApi.submit(app.id); await fetchApps(); }
    catch { setError('Не удалось подать заявку. Попробуйте ещё раз.'); }
    finally { setSubmitting(false); }
  };

  const handleWithdraw = async () => {
    if (!app) return;
    setConfirmModal(null); setError(null); setSubmitting(true);
    try { await applicationsApi.withdraw(app.id); await fetchApps(); }
    catch { setError('Не удалось отозвать заявку. Попробуйте ещё раз.'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    if (!app) return;
    setConfirmModal(null); setError(null); setSubmitting(true);
    try { await applicationsApi.deleteApp(app.id); setSelectedIdx(0); await fetchApps(); }
    catch { setError('Не удалось удалить заявку. Попробуйте ещё раз.'); }
    finally { setSubmitting(false); }
  };

  const handleDownload = async (fileId: string, fileName: string) => {
    try {
      const blob = await applicationsApi.downloadFile(fileId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = fileName; a.click();
      URL.revokeObjectURL(url);
    } catch { showToast('Ошибка при скачивании файла', 'error'); }
  };

  if (appsLoading) {
    return <div className="flex min-h-[400px] items-center justify-center"><Spinner size="lg" /></div>;
  }

  if (!apps.length) {
    return (
      <div className="py-20 text-center">
        <p className="mb-4 text-muted-foreground">У вас нет заявки.</p>
        <Link to="/cabinet/application/new"
          className="inline-flex rounded-lg bg-accent px-6 py-3 font-semibold text-accent-foreground transition-all hover:bg-accent-hover">
          Создать заявку
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-6"
      variants={stagger}
      initial="hidden"
      animate="show"
    >
      {/* Переключатель заявок */}
      {apps.length > 1 && (
        <motion.div className="flex flex-wrap gap-2" variants={cardItem}>
          {apps.map((a, i) => (
            <button key={a.id} onClick={() => { setSelectedIdx(i); setError(null); }}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                i === selectedIdx ? 'bg-primary text-primary-foreground' : 'border border-border text-foreground hover:bg-muted'
              }`}>
              {a.projectTitle}
            </button>
          ))}
        </motion.div>
      )}

      {/* Шапка */}
      <motion.div className="flex flex-wrap items-center justify-between gap-4" variants={cardItem}>
        <h1 className="text-2xl font-bold text-foreground">{app.projectTitle}</h1>
        <StatusBadge status={app.status} />
      </motion.div>

      {error && <motion.div variants={cardItem}><Alert variant="error">{error}</Alert></motion.div>}

      {/* Комментарий */}
      {app.adminComment && (
        <motion.div
          className="rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800"
          variants={cardItem}
        >
          <strong>Комментарий администратора:</strong> {app.adminComment}
        </motion.div>
      )}

      {/* Кнопки */}
      {(app.status === 'draft' || app.status === 'submitted') && (
        <motion.div className="flex flex-wrap gap-3" variants={cardItem}>
          {app.status === 'draft' && (
            <>
              <Link to={`/cabinet/application/${app.id}/edit`}
                className="rounded-lg border-2 border-primary px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary-light">
                Редактировать
              </Link>
              <button onClick={() => setConfirmModal({ action: 'submit' })} disabled={submitting}
                className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition-all hover:bg-accent-hover disabled:opacity-60">
                Подать заявку
              </button>
              <button onClick={() => setConfirmModal({ action: 'delete' })} disabled={submitting}
                className="rounded-lg bg-destructive px-4 py-2 text-sm font-semibold text-destructive-foreground transition-colors hover:opacity-90 disabled:opacity-60">
                Удалить заявку
              </button>
            </>
          )}
          {app.status === 'submitted' && (
            <button onClick={() => setConfirmModal({ action: 'withdraw' })} disabled={submitting}
              className="rounded-lg bg-destructive px-4 py-2 text-sm font-semibold text-destructive-foreground transition-colors hover:opacity-90 disabled:opacity-60">
              Отозвать заявку
            </button>
          )}
        </motion.div>
      )}

      {/* Основные данные */}
      <motion.div className="space-y-4 rounded-xl bg-card border border-border p-6 shadow-sm" variants={cardItem}>
        <div>
          <p className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">Номинация</p>
          <p className="font-medium text-foreground">{app.nomination?.name ?? '—'}</p>
        </div>
        <div>
          <p className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">Описание проекта</p>
          <p className="whitespace-pre-wrap break-words text-foreground">{app.projectDescription}</p>
        </div>
        {app.keywords?.length ? (
          <div>
            <p className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">Ключевые слова</p>
            <div className="flex flex-wrap gap-2">
              {app.keywords.map((kw, i) => (
                <span key={i} className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">{kw}</span>
              ))}
            </div>
          </div>
        ) : null}
      </motion.div>

      {/* Команда */}
      {app.teamMembers?.length ? (
        <motion.div className="rounded-xl bg-card border border-border p-6 shadow-sm" variants={cardItem}>
          <h3 className="mb-3 font-semibold text-foreground">Состав команды</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="pb-2 font-medium">Имя</th>
                  <th className="pb-2 font-medium">Роль</th>
                  <th className="pb-2 font-medium">Email</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {app.teamMembers.map((m, i) => (
                  <tr key={i}>
                    <td className="py-2 font-medium text-foreground">{m.name}</td>
                    <td className="py-2 text-muted-foreground">{m.role}</td>
                    <td className="py-2 text-muted-foreground">{m.email ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      ) : null}

      {/* Научный руководитель */}
      {app.supervisor && (
        <motion.div className="rounded-xl bg-card border border-border p-6 shadow-sm" variants={cardItem}>
          <h3 className="mb-3 font-semibold text-foreground">Научный руководитель</h3>
          <p className="font-medium text-foreground">{app.supervisor.name}</p>
          <p className="text-sm text-muted-foreground">{app.supervisor.title}</p>
          {app.supervisor.email && <p className="text-sm text-muted-foreground">{app.supervisor.email}</p>}
        </motion.div>
      )}

      {/* Файлы */}
      {app.files?.length ? (
        <motion.div className="rounded-xl bg-card border border-border p-6 shadow-sm" variants={cardItem}>
          <h3 className="mb-3 font-semibold text-foreground">Файлы</h3>
          <div className="space-y-2">
            {app.files.map(f => (
              <div key={f.id} className="flex items-center justify-between gap-3 text-sm py-1">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="truncate text-foreground">{f.originalName}</span>
                  <span className="flex-shrink-0 text-muted-foreground">({formatSize(f.size)})</span>
                </div>
                <button onClick={() => handleDownload(f.id, f.originalName)}
                  className="flex-shrink-0 font-medium text-primary hover:underline">
                  Скачать
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      ) : null}

      {/* История статусов */}
      {app.logs?.length ? (
        <motion.div className="rounded-xl bg-card border border-border p-6 shadow-sm" variants={cardItem}>
          <StatusTimeline logs={app.logs} />
        </motion.div>
      ) : null}

      {/* Модальное окно */}
      <Modal
        isOpen={!!confirmModal}
        onClose={() => setConfirmModal(null)}
        title={
          confirmModal?.action === 'submit' ? 'Подать заявку?' :
          confirmModal?.action === 'delete' ? 'Удалить заявку?' : 'Отозвать заявку?'
        }
      >
        <p className="text-sm text-gray-600 mb-6">
          {confirmModal?.action === 'submit'
            ? 'После подачи редактирование заявки будет недоступно.'
            : confirmModal?.action === 'delete'
            ? 'Заявка будет удалена безвозвратно. Вы уверены?'
            : 'Заявка вернётся в статус "Черновик", вы сможете её отредактировать и подать снова.'}
        </p>
        <div className="flex justify-end gap-3">
          <button onClick={() => setConfirmModal(null)}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted">
            Отмена
          </button>
          <button
            onClick={confirmModal?.action === 'submit' ? handleSubmit : confirmModal?.action === 'delete' ? handleDelete : handleWithdraw}
            className={`rounded-lg px-4 py-2 text-sm font-semibold text-white ${
              confirmModal?.action === 'submit' ? 'bg-accent hover:bg-accent-hover' : 'bg-destructive hover:opacity-90'
            }`}>
            Подтвердить
          </button>
        </div>
      </Modal>
    </motion.div>
  );
}
