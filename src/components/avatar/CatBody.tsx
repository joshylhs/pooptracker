import React from 'react';
import { G, Rect } from 'react-native-svg';

export type MouthStyle = 'default' | 'flat';

interface Props {
  color?: string;
  snoutColor?: string;
  mouthStyle?: MouthStyle;
}

const INNER_EAR = '#FFB3C6';
const NOSE  = '#C87080';
const MOUTH = '#2C1810';

export default function CatBody({ color = '#F5DEB3', snoutColor = '#F0F0F0', mouthStyle = 'default' }: Props) {
  const c = color;
  const s = snoutColor;
  return (
    <G>
      {/* Left ear outer */}
      <Rect x={6} y={0} width={1} height={1} fill={c} />
      <Rect x={5} y={1} width={3} height={1} fill={c} />
      <Rect x={5} y={2} width={5} height={1} fill={c} />
      <Rect x={5} y={3} width={6} height={1} fill={c} />
      {/* Left inner ear */}
      <Rect x={6} y={1} width={1} height={1} fill={INNER_EAR} />
      <Rect x={6} y={2} width={3} height={1} fill={INNER_EAR} />
      <Rect x={6} y={3} width={4} height={1} fill={INNER_EAR} />

      {/* Right ear outer */}
      <Rect x={25} y={0} width={1} height={1} fill={c} />
      <Rect x={24} y={1} width={3} height={1} fill={c} />
      <Rect x={22} y={2} width={5} height={1} fill={c} />
      <Rect x={21} y={3} width={6} height={1} fill={c} />
      {/* Right inner ear */}
      <Rect x={25} y={1} width={1} height={1} fill={INNER_EAR} />
      <Rect x={23} y={2} width={3} height={1} fill={INNER_EAR} />
      <Rect x={22} y={3} width={4} height={1} fill={INNER_EAR} />

      {/* Head */}
      <Rect x={5} y={4} width={22} height={15} fill={c} />
      <Rect x={6} y={19} width={20} height={1} fill={c} />
      <Rect x={7} y={20} width={18} height={1} fill={c} />
      <Rect x={9} y={21} width={14} height={1} fill={c} />
      <Rect x={11} y={22} width={10} height={1} fill={c} />

      {/* Neck */}
      <Rect x={13} y={23} width={6} height={1} fill={c} />
      <Rect x={12} y={24} width={8} height={1} fill={c} />

      {/* Shoulders */}
      <Rect x={11} y={25} width={10} height={1} fill={c} />
      <Rect x={9}  y={26} width={14} height={1} fill={c} />
      <Rect x={8}  y={27} width={16} height={1} fill={c} />
      <Rect x={9}  y={28} width={14} height={4} fill={c} />

      {/* Snout — wider for breathing room, centered on col 15.5 */}
      <Rect x={12} y={14} width={8}  height={1} fill={s} />
      <Rect x={11} y={15} width={10} height={4} fill={s} />
      <Rect x={12} y={19} width={8}  height={1} fill={s} />
      <Rect x={13} y={20} width={6}  height={1} fill={s} />

      {/* Nose */}
      <Rect x={14} y={15} width={3} height={2} fill={NOSE} />

      {/* Mouth */}
      {mouthStyle === 'flat' ? (
        // Flat line — neutral/inactive expression
        <Rect x={13} y={18} width={5} height={1} fill={MOUTH} />
      ) : (
        // Default smile — stem from nose, Y curl
        <>
          <Rect x={15} y={17} width={1} height={2} fill={MOUTH} />
          <Rect x={13} y={18} width={1} height={1} fill={MOUTH} />
          <Rect x={17} y={18} width={1} height={1} fill={MOUTH} />
          <Rect x={14} y={19} width={1} height={1} fill={MOUTH} />
          <Rect x={16} y={19} width={1} height={1} fill={MOUTH} />
        </>
      )}

    </G>
  );
}
