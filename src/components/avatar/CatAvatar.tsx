import React from 'react';
import Svg, { Rect } from 'react-native-svg';
import CatBody, { MouthStyle } from './CatBody';
import CatEyes, { AnyEyeStyle, EyeStyle, EyeColor, EyeSecondary } from './CatEyes';
import CatBlush, { CheekStyle } from './CatBlush';
import CatHeaddress, { HeaddressStyle } from './CatHeaddress';
import CatShirt, { ShirtStyle } from './CatShirt';
import CatAccessory, { AccessoryStyle } from './CatAccessory';

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
  shirt?: ShirtStyle;
  accessory?: AccessoryStyle;
  wallColor?: WallColor | string;
  size?: number;
  viewBox?: string;
  // Mood overrides — set by CatAvatarCircle, not by user config
  moodEyes?: AnyEyeStyle;
  mouthStyle?: MouthStyle;
}

export default function CatAvatar({
  bodyColor = 'cream',
  snoutColor = 'white',
  eyes = 'round',
  eyePrimary = 'dark',
  eyeSecondary = 'white',
  cheekStyle = 'blush',
  headdress = 'none',
  shirt = 'none',
  accessory = 'none',
  wallColor = 'none',
  size = 128,
  viewBox = '0 0 32 32',
  moodEyes,
  mouthStyle,
}: Props) {
  const resolveFill = (v: BodyColor | string) =>
    v in BODY_COLORS ? BODY_COLORS[v as BodyColor] : (v as string);

  const resolveWall = (v: WallColor | string) =>
    v in WALL_COLORS ? WALL_COLORS[v as WallColor] : (v as string);

  const wall = resolveWall(wallColor);
  const resolvedBodyColor = resolveFill(bodyColor);

  return (
    <Svg width={size} height={size} viewBox={viewBox}>
      {wall !== 'transparent' && <Rect x={0} y={0} width={32} height={32} fill={wall} />}
      <CatBody color={resolvedBodyColor} snoutColor={resolveFill(snoutColor)} mouthStyle={mouthStyle} />
      <CatShirt style={shirt} bodyColor={resolvedBodyColor} />
      <CatEyes style={moodEyes ?? eyes} primaryColor={eyePrimary} secondaryColor={eyeSecondary} bodyColor={resolvedBodyColor} />
      <CatBlush style={cheekStyle} />
      <CatAccessory style={accessory} />
      <CatHeaddress style={headdress} />
    </Svg>
  );
}
