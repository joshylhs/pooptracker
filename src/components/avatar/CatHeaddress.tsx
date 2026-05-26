import React from 'react';
import { G, Rect } from 'react-native-svg';

export type HeaddressStyle = 'none' | 'flower' | 'bow' | 'crown' | 'partyhat' | 'beanie' | 'tophat';

interface Props {
  style?: HeaddressStyle;
}

export default function CatHeaddress({ style = 'none' }: Props) {
  if (style === 'flower') {
    return (
      <G>
        {/* Yellow centre */}
        <Rect x={15} y={2} width={2} height={2} fill="#FFE066" />
        {/* Pink petals */}
        <Rect x={15} y={1} width={2} height={1} fill="#FF8FAB" />
        <Rect x={15} y={4} width={2} height={1} fill="#FF8FAB" />
        <Rect x={13} y={2} width={2} height={2} fill="#FF8FAB" />
        <Rect x={17} y={2} width={2} height={2} fill="#FF8FAB" />
      </G>
    );
  }

  if (style === 'bow') {
    // X shape: two diagonals crossing at centre (cols 14–17), rows 0–4
    // Each stripe is 2px wide, stepping ~2px inward per row
    return (
      <G>
        {/* Top-left → bottom-right diagonal */}
        <Rect x={7}  y={0} width={2} height={1} fill="#FF8FAB" />
        <Rect x={9}  y={1} width={2} height={1} fill="#FF8FAB" />
        <Rect x={11} y={2} width={2} height={1} fill="#FF8FAB" />
        <Rect x={13} y={3} width={2} height={1} fill="#FF8FAB" />
        {/* Top-right → bottom-left diagonal */}
        <Rect x={23} y={0} width={2} height={1} fill="#FF8FAB" />
        <Rect x={21} y={1} width={2} height={1} fill="#FF8FAB" />
        <Rect x={19} y={2} width={2} height={1} fill="#FF8FAB" />
        <Rect x={17} y={3} width={2} height={1} fill="#FF8FAB" />
        {/* Centre knot at crossing point */}
        <Rect x={14} y={3} width={4} height={2} fill="#E0607E" />
        {/* Lower arms spreading out */}
        <Rect x={11} y={4} width={2} height={1} fill="#FF8FAB" />
        <Rect x={19} y={4} width={2} height={1} fill="#FF8FAB" />
        <Rect x={9}  y={5} width={2} height={1} fill="#FF8FAB" />
        <Rect x={21} y={5} width={2} height={1} fill="#FF8FAB" />
      </G>
    );
  }

  if (style === 'crown') {
    return (
      <G>
        {/* Crown base */}
        <Rect x={10} y={3} width={12} height={1} fill="#FFD700" />
        {/* Left peak */}
        <Rect x={10} y={2} width={3} height={1} fill="#FFD700" />
        {/* Centre peak (taller) */}
        <Rect x={14} y={1} width={4} height={2} fill="#FFD700" />
        <Rect x={15} y={0} width={2} height={1} fill="#FFD700" />
        {/* Right peak */}
        <Rect x={19} y={2} width={3} height={1} fill="#FFD700" />
        {/* Jewels */}
        <Rect x={11} y={3} width={1} height={1} fill="#FF4444" />
        <Rect x={15} y={2} width={2} height={1} fill="#FF4444" />
        <Rect x={20} y={3} width={1} height={1} fill="#FF4444" />
      </G>
    );
  }

  if (style === 'partyhat') {
    return (
      <G>
        {/* Pompom */}
        <Rect x={15} y={0} width={2} height={1} fill="#FFFFFF" />
        {/* Hat cone */}
        <Rect x={15} y={1} width={2} height={1} fill="#FF6B6B" />
        <Rect x={14} y={2} width={4} height={1} fill="#FF6B6B" />
        <Rect x={13} y={3} width={6} height={1} fill="#FF6B6B" />
        {/* Brim sitting on head */}
        <Rect x={12} y={4} width={8} height={1} fill="#E55555" />
        {/* Polka dots */}
        <Rect x={16} y={2} width={1} height={1} fill="#FFFFFF" />
        <Rect x={14} y={3} width={1} height={1} fill="#FFFFFF" />
      </G>
    );
  }

  if (style === 'tophat') {
    return (
      <G>
        {/* Hat crown — tall rectangular body */}
        <Rect x={11} y={0} width={10} height={1} fill="#1A1A1A" />
        <Rect x={10} y={1} width={12} height={1} fill="#1A1A1A" />
        <Rect x={10} y={2} width={12} height={1} fill="#1A1A1A" />
        <Rect x={10} y={3} width={12} height={1} fill="#1A1A1A" />
        {/* Hat band — thin accent stripe */}
        <Rect x={10} y={4} width={12} height={1} fill="#C0392B" />
        {/* Brim — wide, sits on head */}
        <Rect x={7}  y={5} width={18} height={1} fill="#1A1A1A" />
      </G>
    );
  }

  if (style === 'beanie') {
    return (
      <G>
        {/* Pompom */}
        <Rect x={14} y={0} width={4} height={1} fill="#FFFFFF" />
        {/* Hat body — orange/pink, widening toward head */}
        <Rect x={12} y={1} width={8}  height={1} fill="#FF8FAB" />
        <Rect x={10} y={2} width={12} height={1} fill="#FF8FAB" />
        <Rect x={9}  y={3} width={14} height={1} fill="#FF8FAB" />
        <Rect x={8}  y={4} width={16} height={1} fill="#FF8FAB" />
        {/* Stripe across row 3 — now blue */}
        <Rect x={9}  y={3} width={14} height={1} fill="#5B8CFF" />
        {/* Folded brim */}
        <Rect x={8}  y={5} width={16} height={2} fill="#4070DD" />
      </G>
    );
  }

  return <G />;
}
