import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { winnersApi } from '@/api/winners';
import { nominationsApi } from '@/api/nominations';
import { Winner, Nomination } from '@/types';
import { placeMedal } from '@/utils/placeMedal';
import { fadeUp, stagger, cardItem, hoverCardSm } from '@/utils/animations';

import mascot from '../../../mascot-winners.png';

type WinnerContest = { id: string; name: string; startDate: string; endDate: string };

function WinnerCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden animate-pulse">
      <div className="h-48 bg-gray-200" />
      <div className="p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="h-5 bg-gray-200 rounded w-10" />
          <div className="h-5 bg-gray-100 rounded w-14" />
        </div>
        <div className="h-5 bg-gray-200 rounded w-4/5" />
        <div className="h-4 bg-gray-100 rounded w-2/3" />
        <div className="h-3 bg-gray-100 rounded w-1/2" />
      </div>
    </div>
  );
}

function WinnerCard({ winner }: { winner: Winner }) {
  return (
    <motion.article
      className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow relative"
      variants={cardItem}
      {...hoverCardSm}
    >
      {winner.photoUrl ? (
        <img src={winner.photoUrl} alt={winner.teamName} className="w-full h-48 object-cover" />
      ) : (
        <div className="w-full h-48 bg-gray-100 flex items-center justify-center text-gray-300 select-none">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-5.356-3.765M9 20H4v-2a4 4 0 015.356-3.765M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
      )}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-3">
          <span className="text-2xl" title={`${winner.place}-е место`}>{placeMedal(winner.place)}</span>
          {(winner.contest?.name || winner.year) && (
            <span className="text-xs font-medium bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full">
              {winner.contest?.name ?? winner.year}
            </span>
          )}
        </div>
        <h2 className="font-bold text-gray-900 leading-snug mb-1">{winner.projectTitle}</h2>
        <p className="text-sm text-gray-600 mb-2">{winner.teamName}</p>
        {winner.nomination && <p className="text-xs text-accent-600 font-medium mb-1">{winner.nomination.name}</p>}
        {winner.university && <p className="text-xs text-gray-400 mt-auto pt-2">{winner.university}</p>}
      </div>
    </motion.article>
  );
}

export function WinnersPage() {
  const [winners, setWinners] = useState<Winner[]>([]);
  const [nominations, setNominations] = useState<Nomination[]>([]);
  const [contests, setContests] = useState<WinnerContest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [filterContest, setFilterContest] = useState('');
  const [filterNomination, setFilterNomination] = useState('');
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    document.title = 'Победители — Конкурс СочиГУ';
    Promise.all([nominationsApi.getAll(), winnersApi.getContests()])
      .then(([noms, ctsts]) => { setNominations(noms); setContests(ctsts); })
      .catch((err) => console.error('Failed to load filters:', err));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params: { contestId?: string; nominationId?: string } = {};
    if (filterContest) params.contestId = filterContest;
    if (filterNomination) params.nominationId = filterNomination;
    winnersApi
      .getAll(params)
      .then((data) => { setWinners(data); setError(false); })
      .catch((err) => { console.error('Failed to load winners:', err); setError(true); })
      .finally(() => setLoading(false));
  }, [filterContest, filterNomination, retryKey]);

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 max-w-6xl py-10">
        <motion.h1
          className="text-3xl font-bold text-primary-900 mb-8"
          initial="hidden" animate="show" variants={fadeUp}
        >
          Победители конкурса
        </motion.h1>

        <motion.div
          className="flex flex-wrap gap-3 mb-8"
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          {contests.length > 0 && (
            <select value={filterContest} onChange={(e) => setFilterContest(e.target.value)}
              className="select-custom pl-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option value="">Все конкурсы</option>
              {contests.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          )}
          <select value={filterNomination} onChange={(e) => setFilterNomination(e.target.value)}
            className="select-custom pl-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500">
            <option value="">Все номинации</option>
            {nominations.map((n) => <option key={n.id} value={n.id}>{n.name}</option>)}
          </select>
          {(filterContest || filterNomination) && (
            <button
              onClick={() => { setFilterContest(''); setFilterNomination(''); }}
              className="pl-3 py-2 pr-3 rounded-lg border border-gray-300 text-sm text-gray-500 hover:text-gray-700 hover:border-gray-400 transition-colors"
            >
              Сбросить
            </button>
          )}
        </motion.div>

        {error ? (
          <div className="text-center py-20">
            <p className="text-red-500 mb-4">Не удалось загрузить победителей. Попробуйте позже.</p>
            <button onClick={() => setRetryKey(k => k + 1)}
              className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
              Повторить
            </button>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => <WinnerCardSkeleton key={i} />)}
          </div>
        ) : winners.length === 0 ? (
          <p className="text-gray-500 text-center py-20">Победители пока не объявлены.</p>
        ) : (
          <motion.div
            key={`${filterContest}-${filterNomination}`}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={stagger}
            initial="hidden"
            animate="show"
          >
            {winners.map((w) => <WinnerCard key={w.id} winner={w} />)}
          </motion.div>
        )}
      </div>
    </main>
  );
}
