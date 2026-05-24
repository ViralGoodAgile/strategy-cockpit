import type { ReactNode } from 'react';
import type { Freshness, QualityId } from '../../domain/types';
import { FreshnessLine } from '../common/Freshness';
import { SyntheticBadge } from '../common/SyntheticBadge';

// Consistent shell for a sensor: name + qualities it anchors to, body, then an
// insight line and provenance (synthetic + freshness). No naked numbers (C13).
export function SensorModule({
  name,
  number,
  maps,
  observedAt,
  freshness,
  insight,
  children,
}: {
  name: string;
  number: number;
  maps: QualityId[];
  observedAt: string;
  freshness: Freshness;
  insight: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="sensor">
      <header className="sensor-head">
        <span className="sensor-name">{name}</span>
        <span className="sensor-no">sensor {number}</span>
      </header>
      <div className="sensor-maps">↔ {maps.join(' · ')}</div>

      <div className="sensor-body">{children}</div>

      <p className="sensor-insight">{insight}</p>
      <div className="sensor-foot">
        <SyntheticBadge />
        <FreshnessLine observedAt={observedAt} freshness={freshness} />
      </div>
    </section>
  );
}
