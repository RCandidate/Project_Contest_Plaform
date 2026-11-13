import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { applicationsApi } from '@/api/applications';
import { nominationsApi } from '@/api/nominations';
import { contestsApi } from '@/api/contests';
import { Application, Nomination, Contest, ApplicationStatus, APPLICATION_STATUS_LABELS } from '@/types';
import { StatusBadge } from '@/components/shared/StatusBadge';

const LIMIT = 20;
const STATUSES: ApplicationStatus[] = ['draft','submitted','accepted','rejected','admitted','winner','runner_up'];

function formatDate(str: string) { return new Date(str).toLocaleDateString('ru-RU', { timeZone: 'Europe/Moscow' }); }

function TableSkeleton() {
  return (
    <tbody>
      {Array.from({ length: 10 }).map((_, i) => (
        <tr key={i} className="border-b border-gray-50">
          {Array.from({ length: 8 }).map((_, j) => (
            <td key={j} className="px-5 py-3"><div className="h-4 bg-gray-200 rounded animate-pulse" /></td>
          ))}
        </tr>
      ))}
    </tbody>
  );
}

export function ApplicationsListPage() {
  useEffect(() => { document.title = 'Заявки — Конкурс СочиГУ'; }, []);
  const [apps, setApps] = useState<Application[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [nominations, setNominations] = useState<Nomination[]>([]);
  const [contests, setContests] = useState<Contest[]>([]);
  const [nominationId, setNominationId] = useState('');
  const [contestId, setContestId] = useState('');
  const [status, setStatus] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [universityInput, setUniversityInput] = useState('');
  const [university, setUniversity] = useState('');
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const uniTimerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    nominationsApi.getAll().then(setNominations);
    contestsApi.getAll().then(list => {
      setContests(list);
      const active = list.find(c => c.isActive);
      if (active) setContestId(active.id);
    });
  }, []);
  useEffect(() => () => { clearTimeout(timerRef.current); clearTimeout(uniTimerRef.current); }, []);

  useEffect(() => {
    setLoading(true);
    applicationsApi.getAll({ nominationId: nominationId||undefined, status: status||undefined, search: search||undefined, university: university||undefined, contestId: contestId||undefined, page, limit: LIMIT })
      .then(data => {
        setApps(data.data);
        setTotal(data.total);
      }).finally(() => setLoading(false));
  }, [nominationId, status, search, university, contestId, page]);

  const reset = () => { setNominationId(''); setContestId(''); setStatus(''); setSearchInput(''); setSearch(''); setUniversityInput(''); setUniversity(''); setPage(1); };

  const handleExport = () => {
    applicationsApi.exportExcel({
      nominationId: nominationId || undefined,
      status: status || undefined,
      search: search || undefined,
      university: university || undefined,
      contestId: contestId || undefined,
    });
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-primary-900">Заявки</h1>
        <button onClick={handleExport} className="px-4 py-2 bg-primary hover:bg-primary-mid text-white text-sm font-semibold rounded-lg transition-colors">Экспорт Excel</button>
      </div>
      <div className="flex flex-wrap gap-3 mb-6">
        {contests.length > 0 && (
          <select value={contestId} onChange={e => { setContestId(e.target.value); setPage(1); }} className="select-custom pl-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none">
            <option value="">Все конкурсы</option>
            {contests.map(c => <option key={c.id} value={c.id}>{c.name}{c.isActive ? ' ★' : ''}</option>)}
          </select>
        )}
        <select value={nominationId} onChange={e => { setNominationId(e.target.value); setPage(1); }} className="select-custom pl-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none">
          <option value="">Все номинации</option>
          {nominations.map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
        </select>
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }} className="select-custom pl-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none">
          <option value="">Все статусы</option>
          {STATUSES.map(s => <option key={s} value={s}>{APPLICATION_STATUS_LABELS[s]}</option>)}
        </select>
        <input type="text" placeholder="Поиск по названию" value={searchInput} onChange={e => { const v = e.target.value; setSearchInput(v); clearTimeout(timerRef.current); timerRef.current = setTimeout(() => { setSearch(v); setPage(1); }, 500); }} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none w-48" />
        <input type="text" placeholder="ВУЗ" value={universityInput} onChange={e => { const v = e.target.value; setUniversityInput(v); clearTimeout(uniTimerRef.current); uniTimerRef.current = setTimeout(() => { setUniversity(v); setPage(1); }, 500); }} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none w-36" />
        <button onClick={reset} className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">Сбросить</button>
      </div>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead>
            <tr className="text-left text-gray-400 text-xs uppercase border-b border-gray-100">
              {['#','Название проекта','Участник','Вуз','Номинация','Статус','Дата','Действия'].map(h => <th key={h} className="px-5 py-3 font-medium">{h}</th>)}
            </tr>
          </thead>
          {loading ? <TableSkeleton /> : (
            <tbody className="divide-y divide-gray-50">
              {apps.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-12 text-gray-400">Заявок не найдено</td></tr>
              ) : apps.map((app, idx) => (
                <tr key={app.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3 text-gray-400">{(page-1)*LIMIT+idx+1}</td>
                  <td className="px-5 py-3 font-medium text-gray-900 max-w-[180px] truncate">{app.projectTitle}</td>
                  <td className="px-5 py-3 text-gray-600">{app.user ? `${app.user.lastName} ${app.user.firstName}` : '—'}</td>
                  <td className="px-5 py-3 text-gray-500 max-w-[120px] truncate">{app.user?.university ?? '—'}</td>
                  <td className="px-5 py-3 text-gray-500">{app.nomination?.shortName ?? app.nomination?.name ?? '—'}</td>
                  <td className="px-5 py-3"><StatusBadge status={app.status} /></td>
                  <td className="px-5 py-3 text-gray-400">{app.submittedAt ? formatDate(app.submittedAt) : '—'}</td>
                  <td className="px-5 py-3"><Link to={`/admin/applications/${app.id}`} className="text-primary-700 hover:underline font-medium">Просмотр</Link></td>
                </tr>
              ))}
            </tbody>
          )}
        </table>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4 mt-6">
        <span className="text-sm text-gray-500">
          Показано {apps.length === 0 ? 0 : (page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} из {total}
        </span>
        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => p - 1)}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              &lt;
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .reduce<(number | '...')[]>((acc, p, idx, arr) => {
                if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('...');
                acc.push(p);
                return acc;
              }, [])
              .map((p, i) =>
                p === '...' ? (
                  <span key={`ellipsis-${i}`} className="px-2 text-gray-400 text-sm">…</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p as number)}
                    className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${
                      p === page
                        ? 'bg-primary-900 border-primary-900 text-white'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {p}
                  </button>
                )
              )}
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={page === totalPages}
              className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              &gt;
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
