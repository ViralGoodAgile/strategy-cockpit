/*
  The cockpit's OWN Planguage (spec Q1–Q18), parked here as reference only.
  Per the agreed slice-1 decisions these are NOT computed or rendered as
  pass/fail — the cockpit is an inspection tool that leads with trends, not
  targets. Kept in code so the contract is visible and so a later slice can
  wire the structurally-computable ones (Q2, Q3, Q4, Q14, Q16, Q17, Q18) as
  live self-meters if desired.
*/
export interface ParkedTarget {
  id: string;
  name: string;
  scale: string;
  tolerable?: string;
  goal?: string;
  status: 'computable' | 'provisional'; // provisional = needs usage data we don't have yet
}

export const PARKED_TARGETS: ParkedTarget[] = [
  { id: 'Q1', name: 'Loop.Closure', scale: '% qualities where a sensor signal traceably revised strategy in 90d', tolerable: '>=50%', goal: '>=80%', status: 'provisional' },
  { id: 'Q2', name: 'Strategy.Authorability', scale: 'median minutes blank -> publishable v0.1', tolerable: '<=90m', goal: '<=45m', status: 'computable' },
  { id: 'Q3', name: 'Mirror.Coverage', scale: '% qualities with a computable Mirror verdict', goal: '100%', status: 'computable' },
  { id: 'Q4', name: 'Quantification.Coverage', scale: '% objectives with full Planguage', tolerable: '>=60%', goal: '100%', status: 'computable' },
  { id: 'Q5', name: 'Sponsor.PatternVisibility', scale: '% sessions ending with a pattern unseen at start', tolerable: '40%', goal: '70%', status: 'provisional' },
  { id: 'Q14', name: 'MandateLevels.Alignment', scale: 'A–I gap (median; max; teams with gap>=2)', tolerable: 'median<=1; max<=3', goal: 'median 0; max<=1', status: 'computable' },
  { id: 'Q16', name: 'Drilldown.Depth', scale: 'max clicks pattern -> evidence', goal: '<=2', status: 'computable' },
  { id: 'Q17', name: 'Aesthetic.Restraint', scale: 'colours<=4; type sizes<=5; icons<=6; whitespace>=50%; borders<=2; animation=0', goal: '6 of 6', status: 'computable' },
  { id: 'Q18', name: 'Aesthetic.Typography', scale: '(text+numerals)px : (chrome+decoration)px', goal: '>=3:1', status: 'computable' },
];
