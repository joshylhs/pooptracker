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

export type EyeSecondary = 'white' | 'green' | 'pink' | 'yellow' | 'lightblue';

export const EYE_SECONDARY_COLORS: Record<EyeSecondary, string> = {
  white:     '#FFFFFF',
  green:     '#A8D8A8',
  pink:      '#FFB3C6',
  yellow:    '#FFE066',
  lightblue: '#A8D4F0',
};

interface Props {
  style?: AnyEyeStyle;
  primaryColor?: EyeColor;
  secondaryColor?: EyeSecondary;
  bodyColor?: string;
  baseEyeStyle?: EyeStyle;
}

function blendWhite(hex: string, pct: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const mix = (v: number) => Math.round(v + (255 - v) * pct);
  return `rgb(${mix(r)},${mix(g)},${mix(b)})`;
}

export default function CatEyes({ style = 'round', primaryColor = 'dark', secondaryColor = 'white', bodyColor = '#F5DEB3', baseEyeStyle = 'round' }: Props) {
  const p = EYE_COLORS[primaryColor];
  const s = EYE_SECONDARY_COLORS[secondaryColor];
  const sparkle = blendWhite(s, 0.5); // eye sparkle pixel: lighter than highlight

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
    if (baseEyeStyle === 'button') {
      return (
        <G>
          {/* Left 3×3 base with primary slit */}
          <Rect x={10} y={10} width={3} height={3} fill={s} />
          <Rect x={11} y={10} width={1} height={3} fill={p} />
          {/* Left sparkle — top-right corner only */}
          <Rect x={13} y={9}  width={1} height={1} fill={sparkle} />
          <Rect x={12} y={10} width={1} height={1} fill={sparkle} />

          {/* Right 3×3 base with primary slit */}
          <Rect x={19} y={10} width={3} height={3} fill={s} />
          <Rect x={20} y={10} width={1} height={3} fill={p} />
          {/* Right sparkle — top-right corner only */}
          <Rect x={22} y={9}  width={1} height={1} fill={sparkle} />
          <Rect x={21} y={10} width={1} height={1} fill={sparkle} />
        </G>
      );
    }
    return (
      <G>
        {/* Left eye — 2×2 primary base */}
        <Rect x={10} y={11} width={2} height={2} fill={p} />
        {/* Left highlights */}
        <Rect x={10} y={11} width={1} height={1} fill={s} />
        <Rect x={11} y={12} width={1} height={1} fill={s} />
        {/* Left sparkle pixel above-right */}
        <Rect x={12} y={10} width={1} height={1} fill={sparkle} />

        {/* Right eye — 2×2 primary base */}
        <Rect x={20} y={11} width={2} height={2} fill={p} />
        {/* Right highlights */}
        <Rect x={20} y={11} width={1} height={1} fill={s} />
        <Rect x={21} y={12} width={1} height={1} fill={s} />
        {/* Right sparkle pixel above-right */}
        <Rect x={22} y={10} width={1} height={1} fill={sparkle} />
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
