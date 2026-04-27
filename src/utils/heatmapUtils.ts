export type IntensityLevel = 0 | 1 | 2 | 3 | 4;

export function getIntensityLevel(count: number): IntensityLevel {
  if (count <= 0) return 0;
  if (count === 1) return 1;
  if (count === 2) return 2;
  if (count === 3) return 3;
  return 4;
}

export const INTENSITY_COLOURS: Record<IntensityLevel, string> = {
  0: 'transparent',
  1: '#C0DD97',
  2: '#97C459',
  3: '#639922',
  4: '#3B6D11',
};
