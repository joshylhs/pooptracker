import React from 'react';
import { G, Rect } from 'react-native-svg';

export type MouthStyle = 'neutral' | 'smile' | 'surprised';

interface Props {
  style?: MouthStyle;
}

const M = '#2C1810';

export default function CatMouth({ style = 'neutral' }: Props) {
  if (style === 'smile') {
    return (
      <G>
        {/* Upturned corners then centre bar below */}
        <Rect x={13} y={18} width={1} height={1} fill={M} />
        <Rect x={18} y={18} width={1} height={1} fill={M} />
        <Rect x={14} y={19} width={4} height={1} fill={M} />
      </G>
    );
  }

  if (style === 'surprised') {
    return (
      <G>
        {/* Small open "o" mouth */}
        <Rect x={15} y={18} width={2} height={1} fill={M} />
        <Rect x={14} y={19} width={1} height={1} fill={M} />
        <Rect x={17} y={19} width={1} height={1} fill={M} />
        <Rect x={15} y={20} width={2} height={1} fill={M} />
      </G>
    );
  }

  // neutral — classic cat :3
  return (
    <G>
      <Rect x={13} y={19} width={6} height={1} fill={M} />
      <Rect x={13} y={20} width={1} height={1} fill={M} />
      <Rect x={18} y={20} width={1} height={1} fill={M} />
    </G>
  );
}
