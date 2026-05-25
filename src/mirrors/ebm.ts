import type { Metric } from '../domain/sensors';

// Evidence-Based Management (Scrum.org) reads VALUE, not output, across four Key Value Areas.
// These pure helpers assemble the four areas from the cockpit's existing signals and lead each
// measure with its direction of travel — the trend, never a target. (No leading/lagging tag,
// by deliberate choice.)

export type KvaId = 'CV' | 'UV' | 'T2M' | 'A2I';
export type Direction = 'improving' | 'worsening' | 'flat';

export interface KvaMeasure {
  label: string;
  direction: Direction;
  detail: string; // e.g. "118 → 142"
}
export interface KvaArea {
  id: KvaId;
  name: string;
  gist: string;
  measures: KvaMeasure[];
}

export const KVA_ORDER: KvaId[] = ['CV', 'UV', 'T2M', 'A2I'];

// Direction a higher/lower-is-better series moved across its whole run (first → last).
function seriesDirection(series: number[], higherBetter: boolean): Direction {
  if (!series || series.length < 2) return 'flat';
  const delta = series[series.length - 1] - series[0];
  if (delta === 0) return 'flat';
  const good = higherBetter ? delta > 0 : delta < 0;
  return good ? 'improving' : 'worsening';
}

// Direction of travel for a metric, read across its whole series — EBM judges the trend.
export function metricDirection(m: Metric): Direction {
  return seriesDirection(m.series, m.better === 'higher');
}

export function measureFromMetric(m: Metric): KvaMeasure {
  return { label: m.label, direction: metricDirection(m), detail: `${m.series[0]} → ${m.value}` };
}

export interface EbmInputs {
  currentValue: Metric[]; // experience / funnel — value realised now
  timeToMarket: Metric[]; // reliability / operational — speed of delivery & recovery
  throughput: number[]; // flow throughput series (higher is better)
  unservedJobs: number; // prioritised-but-unserved customer jobs (the UV gap)
  weakSignals: number; // emerging behavioural signals (sensing capacity)
  mandateMedianGap: number; // median authorised↔actual gap (decision room)
}

// The four EBM Key Value Areas, assembled from the dashboard's signals. Pure.
export function valueAreas(inp: EbmInputs): KvaArea[] {
  return [
    {
      id: 'CV',
      name: 'Current Value',
      gist: 'value the product delivers to customers and the business today',
      measures: inp.currentValue.map(measureFromMetric),
    },
    {
      id: 'UV',
      name: 'Unrealized Value',
      gist: 'the value still on the table if intent were fully met — a gap, not a number',
      measures: [
        {
          label: 'Unserved customer jobs',
          direction: 'flat',
          detail: `${inp.unservedJobs} prioritised, still open`,
        },
      ],
    },
    {
      id: 'T2M',
      name: 'Time to Market',
      gist: 'the ability to deliver quickly and recover fast',
      measures: [
        ...inp.timeToMarket.map(measureFromMetric),
        {
          label: 'Throughput / wk',
          direction: seriesDirection(inp.throughput, true),
          detail: `${inp.throughput[0]} → ${inp.throughput[inp.throughput.length - 1]}`,
        },
      ],
    },
    {
      id: 'A2I',
      name: 'Ability to Innovate',
      gist: 'the capacity to deliver new value, unburdened by impediments',
      measures: [
        { label: 'Weak signals surfacing', direction: 'flat', detail: `${inp.weakSignals} behavioural signals` },
        {
          label: 'Mandate gap (decision room)',
          direction: inp.mandateMedianGap >= 2 ? 'worsening' : 'flat',
          detail: `median ${inp.mandateMedianGap} steps`,
        },
      ],
    },
  ];
}
