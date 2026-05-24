// The default "whose situation" list for /signify — segments and roles only, never named
// individuals (C4). Seeds the store, where the list becomes user-configurable.
export const DEFAULT_SEGMENTS = [
  'onboarding teams',
  'returning users',
  'power users',
  'cross-team hand-offs',
  'evaluators',
  'admins',
  'PM',
  'engineer',
  'designer',
  'support',
] as const;
