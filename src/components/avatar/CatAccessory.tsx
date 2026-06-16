import React from 'react';
import { G, Rect } from 'react-native-svg';

export type AccessoryStyle =
  | 'none'
  | 'spectacles_round'
  | 'spectacles_oval'
  | 'spectacles_tinted'
  | 'monocle'
  | 'brooch_1'
  | 'brooch_2'
  | 'brooch_3'
  | 'sheriff'
  | 'shield_1'
  | 'shield_2'
  | 'shield_3'
  | 'shield_4'
  | 'cucumber';

interface Props {
  style?: AccessoryStyle;
}

export default function CatAccessory({ style = 'none' }: Props) {
  if (style === 'none') return <G />;

  if (style === 'spectacles_round') {
    const F = '#2C1810';
    return (
      <G>
        <Rect x={9}  y={12} width={4} height={1} fill={F} />
        <Rect x={9}  y={15} width={4} height={1} fill={F} />
        <Rect x={9}  y={12} width={1} height={4} fill={F} />
        <Rect x={12} y={12} width={1} height={4} fill={F} />
        <Rect x={19} y={12} width={4} height={1} fill={F} />
        <Rect x={19} y={15} width={4} height={1} fill={F} />
        <Rect x={19} y={12} width={1} height={4} fill={F} />
        <Rect x={22} y={12} width={1} height={4} fill={F} />
        <Rect x={13} y={13} width={6} height={1} fill={F} />
        <Rect x={8}  y={12} width={1} height={1} fill={F} />
        <Rect x={23} y={12} width={1} height={1} fill={F} />
      </G>
    );
  }

  if (style === 'spectacles_oval') {
    const F = '#3A1A08';
    return (
      <G>
        <Rect x={8}  y={12} width={5} height={1} fill={F} />
        <Rect x={8}  y={15} width={5} height={1} fill={F} />
        <Rect x={8}  y={12} width={1} height={4} fill={F} />
        <Rect x={12} y={12} width={1} height={4} fill={F} />
        <Rect x={19} y={12} width={5} height={1} fill={F} />
        <Rect x={19} y={15} width={5} height={1} fill={F} />
        <Rect x={19} y={12} width={1} height={4} fill={F} />
        <Rect x={23} y={12} width={1} height={4} fill={F} />
        <Rect x={13} y={13} width={6} height={1} fill={F} />
        <Rect x={7}  y={12} width={1} height={1} fill={F} />
        <Rect x={24} y={12} width={1} height={1} fill={F} />
      </G>
    );
  }

  if (style === 'spectacles_tinted') {
    const F = '#5A3A10', L = 'rgba(200,130,0,0.45)';
    return (
      <G>
        <Rect x={9}  y={12} width={4} height={4} fill={L} />
        <Rect x={9}  y={12} width={4} height={1} fill={F} />
        <Rect x={9}  y={15} width={4} height={1} fill={F} />
        <Rect x={9}  y={12} width={1} height={4} fill={F} />
        <Rect x={12} y={12} width={1} height={4} fill={F} />
        <Rect x={19} y={12} width={4} height={4} fill={L} />
        <Rect x={19} y={12} width={4} height={1} fill={F} />
        <Rect x={19} y={15} width={4} height={1} fill={F} />
        <Rect x={19} y={12} width={1} height={4} fill={F} />
        <Rect x={22} y={12} width={1} height={4} fill={F} />
        <Rect x={13} y={13} width={6} height={1} fill={F} />
        <Rect x={8}  y={12} width={1} height={1} fill={F} />
        <Rect x={23} y={12} width={1} height={1} fill={F} />
      </G>
    );
  }

  if (style === 'monocle') {
    const F = '#B8860B', CH = '#C8A830';
    return (
      <G>
        <Rect x={19} y={12} width={4} height={1} fill={F} />
        <Rect x={19} y={15} width={4} height={1} fill={F} />
        <Rect x={19} y={12} width={1} height={4} fill={F} />
        <Rect x={22} y={12} width={1} height={4} fill={F} />
        {/* chain hanging from bottom-right */}
        <Rect x={23} y={15} width={1} height={1} fill={CH} />
        <Rect x={24} y={16} width={1} height={1} fill={CH} />
        <Rect x={24} y={17} width={1} height={1} fill={CH} />
        <Rect x={25} y={18} width={1} height={1} fill={CH} />
      </G>
    );
  }

  if (style === 'brooch_1') {
    const S = '#CCCCCC', SD = '#888888';
    return (
      <G>
        <Rect x={13} y={27} width={3} height={3} fill={S} />
        <Rect x={13} y={27} width={1} height={1} fill={SD} />
        <Rect x={15} y={27} width={1} height={1} fill={SD} />
        <Rect x={13} y={29} width={1} height={1} fill={SD} />
        <Rect x={15} y={29} width={1} height={1} fill={SD} />
        <Rect x={14} y={27} width={1} height={1} fill="#EEEEEE" />
      </G>
    );
  }

  if (style === 'brooch_2') {
    const S = '#CCCCCC', SD = '#888888', GEM = '#4488FF';
    return (
      <G>
        <Rect x={13} y={27} width={3} height={3} fill={S} />
        <Rect x={13} y={27} width={1} height={1} fill={SD} />
        <Rect x={15} y={27} width={1} height={1} fill={SD} />
        <Rect x={13} y={29} width={1} height={1} fill={SD} />
        <Rect x={15} y={29} width={1} height={1} fill={SD} />
        <Rect x={14} y={28} width={1} height={1} fill={GEM} />
        <Rect x={14} y={27} width={1} height={1} fill="#EEEEEE" />
      </G>
    );
  }

  if (style === 'brooch_3') {
    const GC = '#FFD700', GD = '#AA7700', GEM = '#FF3333';
    return (
      <G>
        <Rect x={13} y={27} width={3} height={3} fill={GC} />
        <Rect x={13} y={27} width={1} height={1} fill={GD} />
        <Rect x={15} y={27} width={1} height={1} fill={GD} />
        <Rect x={13} y={29} width={1} height={1} fill={GD} />
        <Rect x={15} y={29} width={1} height={1} fill={GD} />
        <Rect x={14} y={28} width={1} height={1} fill={GEM} />
        <Rect x={14} y={27} width={1} height={1} fill="#FFEE88" />
      </G>
    );
  }

  if (style === 'sheriff') {
    const GC = '#FFD700', GD = '#CC8800', W = '#FFFFFF';
    return (
      <G>
        <Rect x={15} y={24} width={2} height={1} fill={GC} />
        <Rect x={14} y={25} width={4} height={1} fill={GC} />
        <Rect x={13} y={26} width={6} height={1} fill={GC} />
        <Rect x={14} y={27} width={4} height={1} fill={GC} />
        <Rect x={15} y={28} width={2} height={1} fill={GC} />
        <Rect x={15} y={25} width={2} height={3} fill={GD} />
        <Rect x={14} y={26} width={1} height={1} fill={GD} />
        <Rect x={17} y={26} width={1} height={1} fill={GD} />
        <Rect x={15} y={26} width={2} height={1} fill={W} />
      </G>
    );
  }

  if (style === 'shield_1') {
    const S = '#888888', H = '#AAAAAA';
    return (
      <G>
        <Rect x={10} y={26} width={3} height={3} fill={S} />
        <Rect x={11} y={26} width={1} height={1} fill={H} />
        <Rect x={10} y={28} width={3} height={1} fill="#666666" />
        <Rect x={11} y={29} width={1} height={1} fill={S} />
      </G>
    );
  }

  if (style === 'shield_2') {
    const S = '#2255AA', H = '#4488DD', E = '#FFD700';
    return (
      <G>
        <Rect x={10} y={25} width={4} height={4} fill={S} />
        <Rect x={10} y={28} width={4} height={1} fill="#1133AA" />
        <Rect x={11} y={25} width={2} height={1} fill={H} />
        <Rect x={11} y={26} width={1} height={1} fill={E} />
        <Rect x={12} y={29} width={1} height={1} fill={S} />
      </G>
    );
  }

  if (style === 'shield_3') {
    const S = '#6633AA', GC = '#FFD700', W = '#FFFFFF';
    return (
      <G>
        <Rect x={9}  y={25} width={5} height={4} fill={S} />
        <Rect x={9}  y={28} width={5} height={1} fill="#441188" />
        <Rect x={9}  y={25} width={5} height={1} fill={GC} />
        <Rect x={9}  y={25} width={1} height={4} fill={GC} />
        <Rect x={13} y={25} width={1} height={4} fill={GC} />
        <Rect x={11} y={26} width={1} height={1} fill={W} />
        <Rect x={10} y={27} width={3} height={1} fill={GC} />
        <Rect x={11} y={29} width={1} height={1} fill={S} />
      </G>
    );
  }

  if (style === 'shield_4') {
    const GC = '#FFD700', D = '#88EEFF', W = '#FFFFFF';
    return (
      <G>
        <Rect x={9}  y={24} width={5} height={5} fill={GC} />
        <Rect x={9}  y={28} width={5} height={1} fill="#CC9900" />
        <Rect x={10} y={24} width={3} height={1} fill={W} />
        <Rect x={9}  y={24} width={1} height={5} fill={W} />
        <Rect x={13} y={24} width={1} height={5} fill={W} />
        <Rect x={11} y={25} width={1} height={1} fill={D} />
        <Rect x={10} y={26} width={3} height={1} fill={D} />
        <Rect x={11} y={29} width={1} height={1} fill={GC} />
      </G>
    );
  }

  if (style === 'cucumber') {
    const GC = '#4A8A3A', GL = '#7ABB6A', GW = '#C8E8A0', D = '#FFFFFF';
    return (
      <G>
        {/* left slice */}
        <Rect x={9.5}  y={8}    width={4}    height={0.5} fill={GC} />
        <Rect x={9.5}  y={12.5} width={4}    height={0.5} fill={GC} />
        <Rect x={9}    y={8.5}  width={0.5}  height={4}   fill={GC} />
        <Rect x={13.5} y={8.5}  width={0.5}  height={4}   fill={GC} />
        <Rect x={9.5}  y={8.5}  width={4}    height={0.5} fill={GL} />
        <Rect x={9.5}  y={12}   width={4}    height={0.5} fill={GL} />
        <Rect x={9.5}  y={9}    width={0.5}  height={3}   fill={GL} />
        <Rect x={13}   y={9}    width={0.5}  height={3}   fill={GL} />
        <Rect x={10}   y={9}    width={3}    height={3}   fill={GW} />
        <Rect x={10.375} y={9.5} width={0.75} height={0.75} fill={D} />
        <Rect x={11.75}  y={9.5} width={0.75} height={0.75} fill={D} />
        <Rect x={11.25}  y={10.75} width={0.75} height={0.75} fill={D} />
        {/* right slice (x - 1) */}
        <Rect x={18.5}  y={8}    width={4}    height={0.5} fill={GC} />
        <Rect x={18.5}  y={12.5} width={4}    height={0.5} fill={GC} />
        <Rect x={18}    y={8.5}  width={0.5}  height={4}   fill={GC} />
        <Rect x={22.5}  y={8.5}  width={0.5}  height={4}   fill={GC} />
        <Rect x={18.5}  y={8.5}  width={4}    height={0.5} fill={GL} />
        <Rect x={18.5}  y={12}   width={4}    height={0.5} fill={GL} />
        <Rect x={18.5}  y={9}    width={0.5}  height={3}   fill={GL} />
        <Rect x={22}    y={9}    width={0.5}  height={3}   fill={GL} />
        <Rect x={19}    y={9}    width={3}    height={3}   fill={GW} />
        <Rect x={19.375} y={9.5} width={0.75} height={0.75} fill={D} />
        <Rect x={20.75}  y={9.5} width={0.75} height={0.75} fill={D} />
        <Rect x={20.25}  y={10.75} width={0.75} height={0.75} fill={D} />
      </G>
    );
  }

  return <G />;
}
