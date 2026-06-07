import React from 'react';
import { G, Rect } from 'react-native-svg';

export type EyeStyle = 'round' | 'sparkle' | 'button';
// Mood-only variants — not user-selectable
export type MoodEyeStyle = 'closed' | 'halflidded' | 'proud';
export type AnyEyeStyle = EyeStyle | MoodEyeStyle;

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
  style?: AnyEyeStyle;
  primaryColor?: EyeColor;
  secondaryColor?: EyeSecondary;
  bodyColor?: string;
}

export default function CatEyes({ style = 'round', primaryColor = 'dark', secondaryColor = 'white', bodyColor = '#F5DEB3' }: Props) {
  const p = EYE_COLORS[primaryColor];
  const s = EYE_SECONDARY_COLORS[secondaryColor];

  if (style === 'closed') {
    // Single horizontal line for each eye — sleepy/inactive
    return (
      <G>
        <Rect x={10} y={12} width={2} height={1} fill={p} />
        <Rect x={20} y={12} width={2} height={1} fill={p} />
      </G>
    );
  }

  if (style === 'halflidded') {
    // 1px body-colour lid, then round (1px) or button (2px) eye below
    return (
      <G>
        {/* Lids */}
        <Rect x={10} y={10} width={2} height={1} fill={bodyColor} />
        <Rect x={20} y={10} width={2} height={1} fill={bodyColor} />
        {/* Eyes below lid */}
        <Rect x={10} y={11} width={2} height={1} fill={p} />
        <Rect x={20} y={11} width={2} height={1} fill={p} />
        <Rect x={10} y={11} width={1} height={1} fill={s} />
        <Rect x={20} y={11} width={1} height={1} fill={s} />
      </G>
    );
  }

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

  if (style === 'proud') {
    // Sparkle eyes: 4-pointed star shape using primary colour
    const GOLD = '#FFD700';
    return (
      <G>
        {/* Left sparkle — cross shape */}
        <Rect x={11} y={9}  width={1} height={1} fill={GOLD} />
        <Rect x={10} y={10} width={3} height={1} fill={GOLD} />
        <Rect x={11} y={11} width={1} height={1} fill={GOLD} />
        {/* Left centre */}
        <Rect x={11} y={10} width={1} height={1} fill={p} />

        {/* Right sparkle — cross shape */}
        <Rect x={21} y={9}  width={1} height={1} fill={GOLD} />
        <Rect x={20} y={10} width={3} height={1} fill={GOLD} />
        <Rect x={21} y={11} width={1} height={1} fill={GOLD} />
        {/* Right centre */}
        <Rect x={21} y={10} width={1} height={1} fill={p} />
      </G>
    );
  }

  // 'sparkle' was a user-selectable option — now mood-only, fall through to round

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
