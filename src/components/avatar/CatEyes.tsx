import React from 'react';
import { G, Rect } from 'react-native-svg';

export type EyeStyle = 'round' | 'sparkle' | 'button';
export type EyeColor = 'dark' | 'green' | 'blue' | 'orange';

export const EYE_COLORS: Record<EyeColor, string> = {
  dark:   '#2C1810',
  green:  '#2D6A2D',
  blue:   '#1A4A8A',
  orange: '#B85A00',
};

export type EyeSecondary = 'white' | 'green' | 'pink' | 'yellow';

export const EYE_SECONDARY_COLORS: Record<EyeSecondary, string> = {
  white:  '#FFFFFF',
  green:  '#A8D8A8',
  pink:   '#FFB3C6',
  yellow: '#FFE066',
};

interface Props {
  style?: EyeStyle;
  primaryColor?: EyeColor;
  secondaryColor?: EyeSecondary;
}

export default function CatEyes({ style = 'round', primaryColor = 'dark', secondaryColor = 'white' }: Props) {
  const p = EYE_COLORS[primaryColor];
  const s = EYE_SECONDARY_COLORS[secondaryColor];

  if (style === 'button') {
    // 3×3 secondary-coloured eye with a vertical primary slit down the centre column
    return (
      <G>
        <Rect x={10} y={10} width={3} height={3} fill={s} />
        <Rect x={11} y={10} width={1} height={3} fill={p} />
        <Rect x={19} y={10} width={3} height={3} fill={s} />
        <Rect x={20} y={10} width={1} height={3} fill={p} />
      </G>
    );
  }

  if (style === 'sparkle') {
    return (
      <G>
        <Rect x={10} y={11} width={2} height={2} fill={p} />
        <Rect x={20} y={11} width={2} height={2} fill={p} />
        {/* Diagonal highlight pair */}
        <Rect x={10} y={11} width={1} height={1} fill={s} />
        <Rect x={11} y={12} width={1} height={1} fill={s} />
        <Rect x={20} y={11} width={1} height={1} fill={s} />
        <Rect x={21} y={12} width={1} height={1} fill={s} />
        {/* Outer sparkle pixel */}
        <Rect x={12} y={10} width={1} height={1} fill={s} />
        <Rect x={22} y={10} width={1} height={1} fill={s} />
      </G>
    );
  }

  // round
  return (
    <G>
      <Rect x={10} y={11} width={2} height={2} fill={p} />
      <Rect x={20} y={11} width={2} height={2} fill={p} />
      <Rect x={10} y={11} width={1} height={1} fill={s} />
      <Rect x={20} y={11} width={1} height={1} fill={s} />
    </G>
  );
}
