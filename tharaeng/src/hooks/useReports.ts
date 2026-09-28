import { useEffect, useState } from 'react';
import { subscribeReports, thaiError } from '../lib/reports';
import type { Report } from '../types';

export function useReports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const unsub = subscribeReports(
      (list) => {
        setReports(list);
        setLoading(false);
        setError(null);
      },
      (e) => {
        console.error(e);
        setError(thaiError(e));
        setLoading(false);
      },
    );
    return unsub;
  }, [attempt]);

  return { reports, loading, error, retry: () => setAttempt((n) => n + 1) };
}
