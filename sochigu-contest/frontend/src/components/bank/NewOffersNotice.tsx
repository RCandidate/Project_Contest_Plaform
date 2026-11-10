import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { bankApi } from '@/api/bank';
import { BankOffer } from '@/types';

const MAX_LINKS = 5;

// Для участника: напоминание о новых предложениях к его проектам
export function NewOffersNotice() {
  const [offers, setOffers] = useState<BankOffer[]>([]);

  useEffect(() => {
    let cancelled = false;
    bankApi
      .getOffersForMe()
      .then((list) => { if (!cancelled) setOffers(list); })
      .catch(() => { if (!cancelled) setOffers([]); });
    return () => { cancelled = true; };
  }, []);

  const fresh = offers.filter((o) => o.status === 'new');
  if (fresh.length === 0) return null;

  const projects = new Map<string, string>();
  fresh.forEach((o) => projects.set(o.applicationId, o.application?.projectTitle ?? 'Проект'));

  return (
    <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 px-5 py-4">
      <p className="text-sm font-semibold text-blue-900 mb-2">
        Новые предложения к вашим проектам: {fresh.length}
      </p>
      <ul className="space-y-1">
        {Array.from(projects).slice(0, MAX_LINKS).map(([id, title]) => (
          <li key={id}>
            <Link to={`/bank/projects/${id}`} className="text-sm text-blue-800 underline hover:no-underline break-words">
              {title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
