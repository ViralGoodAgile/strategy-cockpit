import type { QualityId } from '../domain/types';

// A human reading of a strategy triad, by a GROUP of people (role-level, never a named
// individual — C4). Observations and questions, never grades. The cockpit shows the
// geometry; people interpret it.
export interface TriadInterpretation {
  by: string; // the group doing the interpreting
  text: string;
}

// The ten strategic qualities arranged into four triads, mix-and-matched so all ten
// are covered (Intent and Durability recur as the connective tissue). Each triad holds
// three qualities in tension; the dot shows which the strategy actually leans on. Each
// carries interpretations from different groups — the qualitative read beside the geometry.
export interface StrategyTriad {
  id: string;
  title: string;
  qualities: [QualityId, QualityId, QualityId];
  interpretations: TriadInterpretation[];
}

export const STRATEGY_TRIADS: StrategyTriad[] = [
  {
    id: 'direction',
    title: 'Direction',
    qualities: ['intent', 'focus', 'emergence'],
    interpretations: [
      { by: 'exec sponsor', text: 'Intent is clear, but the “will-not” list is short — focus is asserted more than enforced.' },
      { by: 'delivery leads', text: 'Emergence shows up as scope creep, not designed experiments. We adapt by accident, not on purpose.' },
    ],
  },
  {
    id: 'integrity',
    title: 'Integrity',
    qualities: ['quantification', 'learning', 'durability'],
    interpretations: [
      { by: 'data guild', text: 'Plenty of metrics, few tied to a decision — measurement without learning.' },
      { by: 'platform team', text: 'Durability is a hope, not a plan; debt paydown keeps slipping behind features.' },
    ],
  },
  {
    id: 'judgement',
    title: 'Judgement',
    qualities: ['decisions', 'coherence', 'context'],
    interpretations: [
      { by: 'facilitators', text: 'Decisions get made, but the Cynefin context behind them is rarely named — we treat complex as complicated.' },
      { by: 'architects', text: 'Coherence reads strong on paper; in practice teams optimise locally.' },
    ],
  },
  {
    id: 'ownership',
    title: 'Ownership',
    qualities: ['participation', 'intent', 'durability'],
    interpretations: [
      { by: 'team reps', text: 'Participation is broad in ceremonies, thin in authorship — the strategy was written for us, not by us.' },
      { by: 'operations', text: 'Ownership fades after launch; no one clearly holds the long-term outcome.' },
    ],
  },
];
