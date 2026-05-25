import type { Strategy } from '../domain/types';

// A synthetic example strategy. Deliberately partial — full in places, thin in
// others — so the Mirrors have something real to observe and the Challenge fires.
export const SAMPLE_STRATEGY: Strategy = {
  intent: {
    text: 'Become the default workspace for small product teams who feel underserved by heavyweight enterprise suites — by being faster to adopt and calmer to use.',
  },
  context: {
    text: 'Mid-market tooling is consolidating around enterprise buyers. Small teams are an afterthought, paying for complexity they never use.',
    crux: 'We win on time-to-first-value, but our onboarding still assumes an admin who configures everything up front.',
    cynefin: 'complex',
  },
  focus: {
    text: 'Play: self-serve teams of 3–15. Concentrate on activation and weekly habit.',
    willNot: ['enterprise', 'on-prem'],
    wipCap: 3,
  },
  coherence: {
    text: 'Speed of adoption trades against configurability. We accept fewer settings to keep the first session short.',
  },
  quantification: {
    text: 'Objectives below in Planguage.',
    entries: [
      {
        id: 'p1',
        gist: 'New team reaches first shared artefact quickly',
        scale: 'minutes from signup to first shared artefact',
        meter: 'product telemetry, median across new teams',
        tolerable: '<= 20 min',
        goal: '<= 8 min',
      },
      {
        id: 'p2',
        gist: 'Teams form a weekly habit',
        scale: 'percent of teams active in 3 of 4 weeks',
        meter: '',
        tolerable: '',
        goal: '>= 45%',
      },
    ],
  },
  decisions: {
    text: 'Do: ship the smallest thing that shortens first session. Don’t: add a setting to win a single deal.',
  },
  learning: {
    text: 'We review activation funnels fortnightly and adjust onboarding steps.',
  },
  emergence: {
    text: 'We watch for teams inventing workarounds in support threads.',
  },
  participation: {
    text: 'Strategy drafted by the founding team with input from two design partners.',
    authors: ['founders', 'design partners'],
    missingVoices: ['support', 'newest customers'],
  },
  durability: {
    text: 'The activation thesis is documented and owned by the product group, not a single person.',
    dependsOn: '',
  },
};

// How the seed strategy's intent and crux were worded over time, oldest → newest. The last
// entry is today's authored wording (see SAMPLE_STRATEGY). This is the strategy's prose history
// — what time-travel reads "as of" each period — and it tells the loop-closure story: a broad
// early intent sharpening into a specific bet as the crux came into focus. Synthesised for the
// seed only; a custom-authored strategy shows its current words at every period.
export const STRATEGY_PROSE_HISTORY: { intent: string; crux: string }[] = [
  {
    intent: 'Build a collaboration tool teams genuinely like using.',
    crux: 'We are not yet sure which teams we are really for.',
  },
  {
    intent: 'Win the small teams who find enterprise suites too heavy.',
    crux: 'We believe we are faster to adopt, but we have not proven it.',
  },
  {
    intent:
      'Be the lightweight workspace for small product teams underserved by enterprise tooling.',
    crux: 'Adoption speed looks like the edge, yet activation stalls in the first week.',
  },
  {
    intent:
      'Become the default workspace for small product teams underserved by heavyweight suites — by being faster to adopt.',
    crux: 'We win on time-to-first-value, but onboarding still assumes a power user.',
  },
  {
    intent:
      'Become the default workspace for small product teams underserved by heavyweight enterprise suites — faster to adopt and calmer to use.',
    crux: 'We win on time-to-first-value, but onboarding still assumes an admin configuring everything up front.',
  },
  {
    intent: SAMPLE_STRATEGY.intent.text,
    crux: SAMPLE_STRATEGY.context.crux,
  },
];
