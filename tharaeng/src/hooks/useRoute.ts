import { useEffect, useState } from 'react';

export type Route = { name: 'map'; reportId: string | null } | { name: 'report' } | { name: 'about' };

function parse(hash: string): Route {
  const h = hash.replace(/^#\/?/, '');
  if (h === 'report') return { name: 'report' };
  if (h === 'about') return { name: 'about' };
  const m = h.match(/^r\/([A-Za-z0-9_-]+)$/);
  return { name: 'map', reportId: m ? m[1] : null };
}

export function useRoute() {
  const [route, setRoute] = useState<Route>(() => parse(window.location.hash));
  useEffect(() => {
    const on = () => setRoute(parse(window.location.hash));
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return route;
}

export function navigate(to: string) {
  const target = to.startsWith('#') ? to : `#${to}`;
  if (window.location.hash === target) return;
  window.location.hash = target;
}

export function useMediaQuery(q: string) {
  const [match, setMatch] = useState(() => window.matchMedia(q).matches);
  useEffect(() => {
    const mql = window.matchMedia(q);
    const on = () => setMatch(mql.matches);
    mql.addEventListener('change', on);
    return () => mql.removeEventListener('change', on);
  }, [q]);
  return match;
}
