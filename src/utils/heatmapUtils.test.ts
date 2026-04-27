import { getIntensityLevel, INTENSITY_COLOURS } from './heatmapUtils';

describe('getIntensityLevel', () => {
  it('returns 0 for zero logs', () => {
    expect(getIntensityLevel(0)).toBe(0);
  });

  it('returns 0 for negative inputs (defensive)', () => {
    expect(getIntensityLevel(-1)).toBe(0);
    expect(getIntensityLevel(-100)).toBe(0);
  });

  it('returns 1 for a single log', () => {
    expect(getIntensityLevel(1)).toBe(1);
  });

  it('returns the count for 2 and 3 logs', () => {
    expect(getIntensityLevel(2)).toBe(2);
    expect(getIntensityLevel(3)).toBe(3);
  });

  it('caps at level 4 for 4+ logs', () => {
    expect(getIntensityLevel(4)).toBe(4);
    expect(getIntensityLevel(5)).toBe(4);
    expect(getIntensityLevel(100)).toBe(4);
  });
});

describe('INTENSITY_COLOURS', () => {
  it('has a colour for every intensity level 0-4', () => {
    expect(Object.keys(INTENSITY_COLOURS).sort()).toEqual(['0', '1', '2', '3', '4']);
  });

  it('uses transparent for level 0 (empty squares)', () => {
    expect(INTENSITY_COLOURS[0]).toBe('transparent');
  });

  it('uses progressively darker greens for levels 1-4', () => {
    // sanity check — strings get longer/darker hex values
    expect(INTENSITY_COLOURS[1]).not.toBe(INTENSITY_COLOURS[2]);
    expect(INTENSITY_COLOURS[2]).not.toBe(INTENSITY_COLOURS[3]);
    expect(INTENSITY_COLOURS[3]).not.toBe(INTENSITY_COLOURS[4]);
  });
});
