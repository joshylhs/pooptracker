export type BristolTypeNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type BristolCategory =
  | 'constipated'
  | 'normal'
  | 'ideal'
  | 'lacking_fibre'
  | 'loose'
  | 'diarrhoea';

export interface BristolType {
  type: BristolTypeNumber;
  label: string;
  description: string;
  category: BristolCategory;
  colour: string;
}

export const BRISTOL_TYPES: readonly BristolType[] = [
  {
    type: 1,
    label: 'Separate hard lumps',
    description: 'Like nuts, hard to pass',
    category: 'constipated',
    colour: '#854F0B',
  },
  {
    type: 2,
    label: 'Lumpy sausage',
    description: 'Sausage-shaped but lumpy',
    category: 'constipated',
    colour: '#854F0B',
  },
  {
    type: 3,
    label: 'Cracked sausage',
    description: 'Sausage with cracks on surface',
    category: 'normal',
    colour: '#639922',
  },
  {
    type: 4,
    label: 'Smooth sausage',
    description: 'Smooth and soft, ideal',
    category: 'ideal',
    colour: '#3B6D11',
  },
  {
    type: 5,
    label: 'Soft blobs',
    description: 'Soft with clear edges',
    category: 'lacking_fibre',
    colour: '#BA7517',
  },
  {
    type: 6,
    label: 'Fluffy pieces',
    description: 'Mushy with ragged edges',
    category: 'loose',
    colour: '#D85A30',
  },
  {
    type: 7,
    label: 'Watery',
    description: 'No solid pieces, entirely liquid',
    category: 'diarrhoea',
    colour: '#993C1D',
  },
];

export function getBristolType(type: BristolTypeNumber): BristolType {
  return BRISTOL_TYPES[type - 1];
}
