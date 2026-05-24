import { useEffect, useRef } from 'react';
import { QUALITIES } from '../../domain/qualities';
import { latestVersion, useCockpit } from '../../store/useCockpit';
import { SectionEditor } from './SectionEditor';
import './strategy.css';

// Left panel: the strategy. Always visible (C9); authoring + reference in one place.
export function StrategyPanel() {
  const versions = useCockpit((s) => s.versions);
  const saveVersion = useCockpit((s) => s.saveVersion);
  const loadSample = useCockpit((s) => s.loadSample);
  const active = useCockpit((s) => s.activeQuality);
  const scrollRef = useRef<HTMLDivElement>(null);

  const latest = latestVersion(versions);

  // Mirror "one click": when a verdict focuses a quality, scroll its section into view.
  useEffect(() => {
    if (!active) return;
    const el = document.getElementById(`section-${active}`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [active]);

  return (
    <div className="panel">
      <div className="strategy-head">
        <div>
          <div className="panel-title">Strategy</div>
          <div className="panel-note">
            {latest
              ? `v${latest.version} · saved ${new Date(latest.savedAt).toLocaleString()}`
              : 'unsaved draft — save to create v0.1 and unlock sensors'}
          </div>
        </div>
        <div className="strategy-actions">
          {versions.length === 0 && (
            <button className="link" onClick={loadSample}>
              load example
            </button>
          )}
          <button className="save" onClick={saveVersion}>
            save v{`0.${versions.length + 1}`}
          </button>
        </div>
      </div>

      <div className="panel-scroll" ref={scrollRef}>
        {QUALITIES.map((q) => (
          <SectionEditor key={q.id} meta={q} />
        ))}
      </div>
    </div>
  );
}
