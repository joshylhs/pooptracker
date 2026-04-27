import { BRISTOL_TYPES, getBristolType } from './bristolData';

describe('BRISTOL_TYPES', () => {
  it('has exactly 7 entries', () => {
    expect(BRISTOL_TYPES).toHaveLength(7);
  });

  it('lists types 1 through 7 in order', () => {
    BRISTOL_TYPES.forEach((entry, index) => {
      expect(entry.type).toBe(index + 1);
    });
  });

  it('has unique types', () => {
    const typeNumbers = BRISTOL_TYPES.map(b => b.type);
    expect(new Set(typeNumbers).size).toBe(7);
  });

  it('has non-empty label and description for every entry', () => {
    BRISTOL_TYPES.forEach(b => {
      expect(b.label.length).toBeGreaterThan(0);
      expect(b.description.length).toBeGreaterThan(0);
    });
  });

  it('uses valid hex colours', () => {
    BRISTOL_TYPES.forEach(b => {
      expect(b.colour).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });
  });
});

describe('getBristolType', () => {
  it('returns the entry whose type matches the argument', () => {
    expect(getBristolType(1).type).toBe(1);
    expect(getBristolType(4).type).toBe(4);
    expect(getBristolType(7).type).toBe(7);
  });

  it('returns the ideal entry for type 4', () => {
    expect(getBristolType(4).category).toBe('ideal');
  });
});
