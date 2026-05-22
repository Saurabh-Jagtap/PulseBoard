export const clamp = (n: number, min: number, max: number) =>
  Math.min(Math.max(n, min), max);

export const randomBetween = (a: number, b: number) =>
  Math.floor(Math.random() * (b - a + 1)) + a;