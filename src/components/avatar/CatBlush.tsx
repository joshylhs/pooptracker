import React from 'react';
import { Circle, G, Rect } from 'react-native-svg';

export type CheekStyle = 'blush' | 'freckles' | 'none';

const BLUSH = '#F0A0B0';
const FRECKLE = '#C08878';

export default function CatBlush({ style = 'blush' }: { style?: CheekStyle }) {
  if (style === 'none') return null;
  if (style === 'freckles') return (
    <G>
      {/* Left cheek — triangle: two on bottom row, one above centre */}
      <Circle cx={7}   cy={16.5} r={0.7} fill={FRECKLE} />
      <Circle cx={9.5} cy={16.5} r={0.7} fill={FRECKLE} />
      <Circle cx={8.2} cy={14.8} r={0.7} fill={FRECKLE} />
      {/* Right cheek — mirrored */}
      <Circle cx={22.5} cy={16.5} r={0.7} fill={FRECKLE} />
      <Circle cx={25}   cy={16.5} r={0.7} fill={FRECKLE} />
      <Circle cx={23.8} cy={14.8} r={0.7} fill={FRECKLE} />
    </G>
  );
  return (
    <G>
      <Rect x={7} y={15} width={3} height={2} fill={BLUSH} />
      <Rect x={22} y={15} width={3} height={2} fill={BLUSH} />
    </G>
  );
}
