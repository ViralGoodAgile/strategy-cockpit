import { useEffect, useLayoutEffect } from 'react';
import { useCockpit } from './store/useCockpit';
import { Cockpit } from './components/Cockpit';

// Root: the cockpit is a single screen, so the app is the cockpit.
export function App() {
  const theme = useCockpit((s) => s.theme);

  // Apply the (persisted) colour scheme to <html> before paint.
  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  // Welcoming first load: seed the example once so a new visitor lands on a live
  // cockpit instead of the "offline" gate. Returning visitors keep their own work.
  useEffect(() => {
    const s = useCockpit.getState();
    if (!s.seeded) s.seed();
  }, []);

  return <Cockpit />;
}
