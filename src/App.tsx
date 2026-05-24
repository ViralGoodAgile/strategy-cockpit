import { useEffect } from 'react';
import { useCockpit } from './store/useCockpit';
import { Cockpit } from './components/Cockpit';

// Root: the cockpit is a single screen, so the app is the cockpit.
export function App() {
  // Welcoming first load: seed the example once so a new visitor lands on a live
  // cockpit instead of the "offline" gate. Returning visitors keep their own work.
  useEffect(() => {
    const s = useCockpit.getState();
    if (!s.seeded) s.seed();
  }, []);

  return <Cockpit />;
}
