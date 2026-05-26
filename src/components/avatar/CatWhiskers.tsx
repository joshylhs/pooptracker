import React from 'react';
import { G, Rect } from 'react-native-svg';

export type WhiskerStyle = 'dots' | 'lines';

interface Props {
  style?: WhiskerStyle;
}

const DOT  = '#C87080';
const LINE = '#FFFFFF';

export default function CatWhiskers({ style = 'dots' }: Props) {
  if (style === 'lines') {
    // Each whisker: 3 segments — inner horizontal → angled up → tip back down
    // Left side goes cols 5→10 (inner near cheek, tip further out)
    // Right side goes cols 21→26 (mirrored)
    return (
      <G>
        {/* Left whisker 1 */}
        <Rect x={9} y={15} width={2} height={1} fill={LINE} />
        <Rect x={7} y={14} width={2} height={1} fill={LINE} />
        <Rect x={5} y={15} width={2} height={1} fill={LINE} />
        {/* Left whisker 2 */}
        <Rect x={9} y={17} width={2} height={1} fill={LINE} />
        <Rect x={7} y={16} width={2} height={1} fill={LINE} />
        <Rect x={5} y={17} width={2} height={1} fill={LINE} />
        {/* Left whisker 3 */}
        <Rect x={9} y={19} width={2} height={1} fill={LINE} />
        <Rect x={7} y={18} width={2} height={1} fill={LINE} />
        <Rect x={5} y={19} width={2} height={1} fill={LINE} />

        {/* Right whisker 1 */}
        <Rect x={21} y={15} width={2} height={1} fill={LINE} />
        <Rect x={23} y={14} width={2} height={1} fill={LINE} />
        <Rect x={25} y={15} width={2} height={1} fill={LINE} />
        {/* Right whisker 2 */}
        <Rect x={21} y={17} width={2} height={1} fill={LINE} />
        <Rect x={23} y={16} width={2} height={1} fill={LINE} />
        <Rect x={25} y={17} width={2} height={1} fill={LINE} />
        {/* Right whisker 3 */}
        <Rect x={21} y={19} width={2} height={1} fill={LINE} />
        <Rect x={23} y={18} width={2} height={1} fill={LINE} />
        <Rect x={25} y={19} width={2} height={1} fill={LINE} />
      </G>
    );
  }

  // dots
  return (
    <G>
      <Rect x={7}  y={15} width={1} height={1} fill={DOT} />
      <Rect x={9}  y={16} width={1} height={1} fill={DOT} />
      <Rect x={7}  y={17} width={1} height={1} fill={DOT} />
      <Rect x={24} y={15} width={1} height={1} fill={DOT} />
      <Rect x={22} y={16} width={1} height={1} fill={DOT} />
      <Rect x={24} y={17} width={1} height={1} fill={DOT} />
    </G>
  );
}
