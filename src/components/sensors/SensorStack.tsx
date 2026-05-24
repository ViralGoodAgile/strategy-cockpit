import { MANDATE_SIGNAL } from '../../data/synthetic';
import {
  DATADOG_SIGNAL,
  DORA_SIGNAL,
  FLOW_CONSTRAINT_SIGNAL,
  FLOW_SIGNAL,
  TRIAD_SIGNAL,
} from '../../data/sensorData';
import { MandateLevels } from '../mandate/MandateLevels';
import { SensorModule } from './SensorModule';
import { TriadSensor } from './TriadSensor';
import { FlowSensor } from './FlowSensor';
import { FlowConstraint } from './FlowConstraint';
import { DoraSensor } from './DoraSensor';
import { DataDogSensor } from './DataDogSensor';
import './sensors.css';

// The sensor stack. Gated on a v0.1 strategy (C1): no sensor data before the
// strategy exists across all ten qualities.
export function SensorStack({ gateOpen }: { gateOpen: boolean }) {
  if (!gateOpen) {
    return (
      <div className="sensors-gate">
        Sensors are gated. Save a v0.1 strategy across the ten qualities to unlock them — an empty
        section is allowed, and is itself a finding.
      </div>
    );
  }

  return (
    <div className="sensor-stack">
      <SensorModule
        name="Mandate Levels"
        number={8}
        maps={['decisions', 'focus', 'participation', 'coherence', 'intent']}
        observedAt={MANDATE_SIGNAL.observedAt}
        freshness={MANDATE_SIGNAL.freshness}
        insight={<>Authorised vs actual vs strategy-implied. Mismatch is the finding — see gaps below.</>}
      >
        <MandateLevels signal={MANDATE_SIGNAL} />
      </SensorModule>

      <TriadSensor signal={TRIAD_SIGNAL} />
      <FlowSensor signal={FLOW_SIGNAL} />
      <FlowConstraint signal={FLOW_CONSTRAINT_SIGNAL} />
      <DoraSensor signal={DORA_SIGNAL} />
      <DataDogSensor signal={DATADOG_SIGNAL} />
    </div>
  );
}
