import type { QualityId } from '../domain/types';

// The ten strategic qualities arranged into four triads, mix-and-matched so all ten
// are covered (Intent and Durability recur as the connective tissue). Each triad holds
// three qualities in tension; the dot shows which the strategy actually leans on.
export interface StrategyTriad {
  id: string;
  title: string;
  qualities: [QualityId, QualityId, QualityId];
}

export const STRATEGY_TRIADS: StrategyTriad[] = [
  { id: 'direction', title: 'Direction', qualities: ['intent', 'focus', 'emergence'] },
  { id: 'integrity', title: 'Integrity', qualities: ['quantification', 'learning', 'durability'] },
  { id: 'judgement', title: 'Judgement', qualities: ['decisions', 'coherence', 'context'] },
  { id: 'ownership', title: 'Ownership', qualities: ['participation', 'intent', 'durability'] },
];
