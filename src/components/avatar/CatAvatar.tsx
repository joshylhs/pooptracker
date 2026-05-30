import React from 'react';
import Svg, { Rect } from 'react-native-svg';
import CatBody from './CatBody';
import CatEyes, { EyeStyle, EyeColor, EyeSecondary } from './CatEyes';
import CatBlush, { CheekStyle } from './CatBlush';
import CatHeaddress, { HeaddressStyle } from './CatHeaddress';

export const BODY_COLORS = {
  cream:    '#F5DEB3',
  orange:   '#E8824A',
  grey:     '#9BA3A3',
  black:    '#3C3C3C',
  brown:    '#8B6355',
  white:    '#F0F0F0',
  lavender: '#C4A8C8',
  bluegrey: '#8FA8BF',
} as const;

export const WALL_COLORS = {
  none:     'transparent',
  dusk:     '#2B2250',
  sage:     '#4A7C59',
  rose:     '#A0404A',
  slate:    '#3A4A5C',
  sand:     '#8C6E45',
  lilac:    '#6A4A7C',
  teal:     '#2A6B6B',
  charcoal: '#2C2C2C',
} as const;

export type BodyColor = keyof typeof BODY_COLORS;
export type WallColor = keyof typeof WALL_COLORS;

interface Props {
  bodyColor?: BodyColor | string;
  snoutColor?: BodyColor | string;
  eyes?: EyeStyle;
  eyePrimary?: EyeColor;
  eyeSecondary?: EyeSecondary;
  cheekStyle?: CheekStyle;
  headdress?: HeaddressStyle;
  wallColor?: WallColor | string;
  size?: number;
}

export default function CatAvatar({
  bodyColor = 'cream',
  snoutColor = 'white',
  eyes = 'round',
  eyePrimary = 'dark',
  eyeSecondary = 'white',
  cheekStyle = 'blush',
  headdress = 'none',
  wallColor = 'none',
  size = 128,
}: Props) {
  const resolveFill = (v: BodyColor | string) =>
    v in BODY_COLORS ? BODY_COLORS[v as BodyColor] : (v as string);

  const resolveWall = (v: WallColor | string) =>
    v in WALL_COLORS ? WALL_COLORS[v as WallColor] : (v as string);

  const wall = resolveWall(wallColor);

  return (
    <Svg width={size} height={size} viewBox="0 0 32 32">
      {wall !== 'transparent' && <Rect x={0} y={0} width={32} height={32} fill={wall} />}
      <CatBody color={resolveFill(bodyColor)} snoutColor={resolveFill(snoutColor)} />
      <CatEyes style={eyes} primaryColor={eyePrimary} secondaryColor={eyeSecondary} />
      <CatBlush style={cheekStyle} />
      <CatHeaddress style={headdress} />
    </Svg>
  );
}
