import { useState, useEffect } from 'react';
import { applicationsApi } from '@/api/applications';
import { Application } from '@/types';

export function useMyApplications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    applicationsApi
      .getMy()
      .then(setApplications)
      .catch(() => setError('Не удалось загрузить заявки'))
      .finally(() => setLoading(false));
  }, []);

  return { applications, loading, error };
}
