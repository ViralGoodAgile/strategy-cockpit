import type { Signal } from '../../domain/types';
import type { FlowInsights } from '../../domain/sensors';
import { useCockpit } from '../../store/useCockpit';
import { Numeral } from '../common/Numeral';
import { SensorModule } from './SensorModule';

// A minimal typographic sparkline (geometry second, numerals first).
function Spark({ series }: { series: number[] }) {
  const w = 96;
  const h = 22;
  const max = Math.max(...series, 1);
  const step = w / (series.length - 1);
  const pts = series.map((v, i) => `${i * step},${h - (v / max) * h}`).join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="spark" role="img">
      <polyline points={pts} className="spark-line" />
    </svg>
  );
}

// Flow.Insights: WIP / throughput / blockers, led by trend. WIP is read against the
// strategy's own WIP cap — a quant signal answering to a qualitative commitment.
export function FlowSensor({ signal }: { signal: Signal<FlowInsights> }) {
  const flow = signal.value;
  const cap = useCockpit((s) => s.draft.focus.wipCap);
  const wipPrev = flow.wipSeries[flow.wipSeries.length - 2];
  const tpRange = `${Math.min(...flow.throughputSeries)}–${Math.max(...flow.throughputSeries)}`;

  const overCap = cap != null && flow.current.wip > cap;

  return (
    <SensorModule
      name="Flow.Insights"
      number={4}
      maps={flow.maps}
      observedAt={signal.observedAt}
      freshness={signal.freshness}
      insight={
        overCap ? (
          <>
            WIP is <strong>{flow.current.wip}</strong> against a strategic cap of{' '}
            <strong>{cap}</strong> — the work is {flow.current.wip - cap} over the line you drew in
            Focus.
          </>
        ) : (
          <>WIP {flow.current.wip}; throughput swings {tpRange}/wk — variability, not a steady rate.</>
        )
      }
    >
      <div className="flow-grid">
        <Numeral
          value={String(flow.current.wip)}
          label={cap != null ? `WIP · cap ${cap}` : 'WIP'}
          trend={{
            direction: flow.current.wip > wipPrev ? 'up' : flow.current.wip < wipPrev ? 'down' : 'flat',
            detail: `${wipPrev} → ${flow.current.wip}`,
          }}
        />
        <div className="flow-spark">
          <div className="numeral-label">throughput / wk</div>
          <Spark series={flow.throughputSeries} />
          <div className="flow-sub">range {tpRange}</div>
        </div>
        <Numeral value={String(flow.current.blocked)} label="blocked" />
        <Numeral value={`${flow.current.oldestAgeDays}d`} label="oldest age-in-state" />
      </div>
    </SensorModule>
  );
}
