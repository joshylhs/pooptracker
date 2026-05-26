import React from 'react';
import { G, Rect } from 'react-native-svg';

const BLUSH = '#F0A0B0';

export default function CatBlush() {
  return (
    <G>
      {/* Left cheek blush — 3×2 pink square */}
      <Rect x={7} y={15} width={3} height={2} fill={BLUSH} />
      {/* Right cheek blush — 3×2 pink square */}
      <Rect x={22} y={15} width={3} height={2} fill={BLUSH} />
    </G>
  );
}
