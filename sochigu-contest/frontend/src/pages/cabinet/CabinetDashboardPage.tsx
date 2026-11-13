import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/auth.store';
import { useMyApplications } from '@/hooks/useApplications';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Spinner } from '@/components/shared/Spinner';
import { stagger, cardItem } from '@/utils/animations';
import { usersApi } from '@/api/users';

function formatDate(str: string) {
  return new Date(str).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Moscow' });
}

export function CabinetDashboardPage() {
  useEffect(() => { document.title = 'Личный кабинет — Конкурс СочиГУ'; }, []);
  const { user, setAuth, accessToken, refreshToken } = useAuthStore();
  const { applications: apps, loading } = useMyApplications();

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    firstName: user?.firstName ?? '',
    lastName: user?.lastName ?? '',
    middleName: user?.middleName ?? '',
    university: user?.university ?? '',
    faculty: user?.faculty ?? '',
    course: user?.course ? String(user.course) : '',
    city: user?.city ?? '',
  });

  const handleEdit = () => {
    setForm({
      firstName: user?.firstName ?? '',
      lastName: user?.lastName ?? '',
      middleName: user?.middleName ?? '',
      university: user?.university ?? '',
      faculty: user?.faculty ?? '',
      course: user?.course ? String(user.course) : '',
      city: user?.city ?? '',
    });
    setEditing(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await usersApi.updateMe({
        ...form,
        course: form.course ? Number(form.course) : undefined,
      });
      const fresh = await usersApi.getMe();
      setAuth(fresh as any, accessToken!, refreshToken!);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      className="space-y-6"
      variants={stagger}
      initial="hidden"
      animate="show"
    >
      <motion.h1 className="text-2xl font-bold text-foreground" variants={cardItem}>
        Добро пожаловать, {user?.firstName}!
      </motion.h1>

      {/* Мои данные */}
      <motion.section
        className="rounded-xl bg-card border border-border shadow-sm p-6"
        variants={cardItem}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Мои данные</h2>
          {!editing && (
            <button onClick={handleEdit} className="text-sm text-primary hover:underline font-medium">
              Редактировать
            </button>
          )}
        </div>

        {editing ? (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { label: 'Фамилия', key: 'lastName' },
                { label: 'Имя', key: 'firstName' },
                { label: 'Отчество', key: 'middleName' },
              ].map(({ label, key }) => (
                <div key={key}>
                  <label className="block text-xs text-muted-foreground mb-1">{label}</label>
                  <input
                    className="input"
                    value={form[key as keyof typeof form]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  />
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { label: 'Вуз', key: 'university' },
                { label: 'Факультет', key: 'faculty' },
                { label: 'Город', key: 'city' },
                { label: 'Курс', key: 'course' },
              ].map(({ label, key }) => (
                <div key={key}>
                  <label className="block text-xs text-muted-foreground mb-1">{label}</label>
                  <input
                    className="input"
                    type={key === 'course' ? 'number' : 'text'}
                    value={form[key as keyof typeof form]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  />
                </div>
              ))}
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Email</label>
              <input className="input bg-muted cursor-not-allowed" value={user?.email} disabled />
            </div>
            <div className="flex gap-3 pt-1">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-accent hover:bg-accent-hover disabled:opacity-60 text-accent-foreground text-sm font-semibold rounded-lg transition-colors"
              >
                {saving ? 'Сохраняем...' : 'Сохранить'}
              </button>
              <button
                onClick={() => setEditing(false)}
                className="px-4 py-2 border border-border rounded-lg text-sm text-muted-foreground hover:bg-muted transition-colors"
              >
                Отмена
              </button>
            </div>
          </div>
        ) : (
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">
            <div>
              <dt className="text-muted-foreground">ФИО</dt>
              <dd className="font-medium text-foreground mt-0.5">
                {[user?.lastName, user?.firstName, user?.middleName].filter(Boolean).join(' ')}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Email</dt>
              <dd className="font-medium text-foreground mt-0.5">{user?.email}</dd>
            </div>
            {user?.university && (
              <div>
                <dt className="text-muted-foreground">Вуз</dt>
                <dd className="font-medium text-foreground mt-0.5">{user.university}</dd>
              </div>
            )}
            {user?.faculty && (
              <div>
                <dt className="text-muted-foreground">Факультет</dt>
                <dd className="font-medium text-foreground mt-0.5">{user.faculty}</dd>
              </div>
            )}
            {user?.course && (
              <div>
                <dt className="text-muted-foreground">Курс</dt>
                <dd className="font-medium text-foreground mt-0.5">{user.course}</dd>
              </div>
            )}
            {user?.city && (
              <div>
                <dt className="text-muted-foreground">Город</dt>
                <dd className="font-medium text-foreground mt-0.5">{user.city}</dd>
              </div>
            )}
          </dl>
        )}
      </motion.section>

      {/* Мои заявки */}
      <motion.section
        className="rounded-xl bg-card border border-border shadow-sm p-6"
        variants={cardItem}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Мои заявки</h2>
          <Link
            to="/cabinet/application/new"
            className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition-all hover:bg-accent-hover"
          >
            + Подать заявку
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <Spinner size="lg" />
          </div>
        ) : apps.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-muted-foreground mb-4">У вас ещё нет заявок.</p>
            <Link
              to="/cabinet/application/new"
              className="inline-flex rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition-all hover:bg-accent-hover"
            >
              Подать заявку
            </Link>
          </div>
        ) : (
          <motion.div
            className="space-y-3"
            variants={stagger}
            initial="hidden"
            animate="show"
          >
            {apps.map(app => (
              <motion.div
                key={app.id}
                className="flex items-center justify-between gap-4 rounded-lg border border-border p-4 transition-colors hover:bg-muted/40"
                variants={cardItem}
              >
                <div className="min-w-0">
                  <p className="font-medium text-foreground truncate">{app.projectTitle}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {app.nomination?.name}
                    {app.submittedAt && ` · Подана ${formatDate(app.submittedAt)}`}
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <StatusBadge status={app.status} />
                  <Link to="/cabinet/application" className="text-sm font-medium text-primary hover:underline">
                    Перейти →
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.section>
    </motion.div>
  );
}
