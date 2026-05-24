import { useCockpit } from '../../store/useCockpit';
import { StrategyPanel } from '../strategy/StrategyPanel';

// Author mode: a focused, scrollable editor screen. The only place that scrolls —
// the cockpit cluster itself never does. Returns to the cluster on demand.
export function AuthorMode() {
  const setMode = useCockpit((s) => s.setMode);
  const reset = useCockpit((s) => s.reset);
  return (
    <div className="author">
      <header className="author-head">
        <button className="author-back" onClick={() => setMode('cockpit')}>
          ‹ cockpit
        </button>
        <span className="author-title">Author strategy</span>
        <span className="author-note">across the ten strategic qualities</span>
        <button
          className="author-fresh"
          onClick={() => {
            if (confirm('Start fresh? This clears the current strategy and its saved versions.')) reset();
          }}
        >
          start fresh
        </button>
      </header>
      <div className="author-body">
        <StrategyPanel />
      </div>
    </div>
  );
}
