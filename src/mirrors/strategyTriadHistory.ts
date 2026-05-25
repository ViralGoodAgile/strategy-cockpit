// A strategy triad's three quality weights as they stood `index` periods ago. The synthetic
// history has the strategy leaning flatter earlier (its emphasis less pronounced) and
// sharpening toward today's weights — so playing it shows the lean forming over time. Pure;
// at the latest index it returns the weights unchanged.
export function weightsAtPeriod(
  weights: [number, number, number],
  index: number,
  last: number,
): [number, number, number] {
  const f = last <= 0 ? 1 : Math.max(0, Math.min(last, index)) / last;
  const mean = (weights[0] + weights[1] + weights[2]) / 3;
  return [
    mean + (weights[0] - mean) * f,
    mean + (weights[1] - mean) * f,
    mean + (weights[2] - mean) * f,
  ];
}

// The index of the strongest / weakest quality at a period (for the "leans … / thin" read).
export function leanAtPeriod(weights: [number, number, number]): { strong: number; weak: number } {
  return { strong: weights.indexOf(Math.max(...weights)), weak: weights.indexOf(Math.min(...weights)) };
}
