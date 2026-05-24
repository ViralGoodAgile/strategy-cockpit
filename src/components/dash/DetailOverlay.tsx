import { useEffect } from 'react';
import { useCockpit } from '../../store/useCockpit';
import { MANDATE_SIGNAL } from '../../data/synthetic';
import {
  DATADOG_SIGNAL,
  DORA_SIGNAL,
  FLOW_CONSTRAINT_SIGNAL,
  SYSTEM_MODEL_SIGNAL,
  TRIAD_SIGNAL,
  WEAK_SIGNAL,
} from '../../data/sensorData';
import { MandateLevels } from '../mandate/MandateLevels';
import { TriadSensor } from '../sensors/TriadSensor';
import { FlowConstraint } from '../sensors/FlowConstraint';
import { DoraSensor } from '../sensors/DoraSensor';
import { DataDogSensor } from '../sensors/DataDogSensor';
import { SystemModelSensor } from '../sensors/SystemModelSensor';
import { WeakSignalsSensor } from '../sensors/WeakSignalsSensor';
import { RadarSensor } from '../sensors/RadarSensor';
import { StrategyTriadsSensor } from '../sensors/StrategyTriadsSensor';
import { LoopDetail } from './LoopDetail';
import { OutcomesSensor } from '../sensors/OutcomesSensor';
import { ReliabilitySensor } from '../sensors/ReliabilitySensor';
import { HygieneSensor } from '../sensors/HygieneSensor';
import { ChallengesSensor } from '../sensors/ChallengesSensor';
import { RADAR_SIGNAL, OUTCOMES_SIGNAL, RELIABILITY_SIGNAL } from '../../data/sensorData';

const TITLES: Record<string, string> = {
  mandate: 'Mandate Levels',
  triads: 'Cynefin triads',
  flow: 'Flow.Constraint',
  quant: 'DORA & DataDog',
  system: 'System Model',
  weak: 'Weak Signals',
  radar: 'Radar — Impediments',
  striads: 'Strategy triads',
  loop: 'The loop under inspection',
  outcomes: 'Product Outcomes',
  reliability: 'Reliability',
  hygiene: 'Data hygiene',
  challenges: 'Challenges',
};

// Detail-on-demand: expanding an instrument opens its full sensor in a modal "page",
// like selecting an MFD page. Esc / backdrop / close button dismisses it.
export function DetailOverlay() {
  const detail = useCockpit((s) => s.detail);
  const setDetail = useCockpit((s) => s.setDetail);

  useEffect(() => {
    if (!detail) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setDetail(null);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [detail, setDetail]);

  if (!detail) return null;

  return (
    <div className="overlay" onClick={() => setDetail(null)}>
      <div className="overlay-panel" onClick={(e) => e.stopPropagation()}>
        <header className="overlay-head">
          <span className="overlay-title">{TITLES[detail]}</span>
          <button className="overlay-close" onClick={() => setDetail(null)}>close ✕</button>
        </header>
        <div className="overlay-body">
          {detail === 'mandate' && <MandateLevels signal={MANDATE_SIGNAL} />}
          {detail === 'triads' && <TriadSensor signal={TRIAD_SIGNAL} />}
          {detail === 'flow' && <FlowConstraint signal={FLOW_CONSTRAINT_SIGNAL} />}
          {detail === 'system' && <SystemModelSensor signal={SYSTEM_MODEL_SIGNAL} />}
          {detail === 'weak' && <WeakSignalsSensor signal={WEAK_SIGNAL} />}
          {detail === 'radar' && <RadarSensor signal={RADAR_SIGNAL} />}
          {detail === 'striads' && <StrategyTriadsSensor />}
          {detail === 'loop' && <LoopDetail />}
          {detail === 'outcomes' && <OutcomesSensor signal={OUTCOMES_SIGNAL} />}
          {detail === 'reliability' && <ReliabilitySensor signal={RELIABILITY_SIGNAL} />}
          {detail === 'hygiene' && <HygieneSensor />}
          {detail === 'challenges' && <ChallengesSensor />}
          {detail === 'quant' && (
            <div className="overlay-stack">
              <DoraSensor signal={DORA_SIGNAL} />
              <DataDogSensor signal={DATADOG_SIGNAL} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
