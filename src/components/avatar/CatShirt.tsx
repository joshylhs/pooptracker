import React from 'react';
import { G, Rect } from 'react-native-svg';

export type ShirtStyle =
  | 'none'
  | 'plain'
  | 'ringer'
  | 'collared'
  | 'striped'
  | 'suit'
  | 'tuxedo'
  | 'bathrobe'
  | 'batman_suit';

interface Props {
  style?: ShirtStyle;
  bodyColor?: string;
}

export default function CatShirt({ style = 'none', bodyColor = '#F5DEB3' }: Props) {
  if (style === 'none') return <G />;

  if (style === 'plain') {
    const W = '#F8F8F8', SL = '#E0E0E0';
    return (
      <G>
        <Rect x={12} y={24} width={1} height={1} fill={W} />
        <Rect x={19} y={24} width={1} height={1} fill={W} />
        <Rect x={11} y={25} width={10} height={1} fill={W} />
        <Rect x={9}  y={26} width={14} height={1} fill={W} />
        <Rect x={8}  y={27} width={16} height={1} fill={W} />
        <Rect x={8}  y={28} width={16} height={4} fill={W} />
      </G>
    );
  }

  if (style === 'ringer') {
    const W = '#F8F8F8', R = '#CC2200';
    return (
      <G>
        <Rect x={11} y={25} width={10} height={1} fill={W} />
        <Rect x={9}  y={26} width={14} height={1} fill={W} />
        <Rect x={8}  y={27} width={16} height={1} fill={W} />
        <Rect x={8}  y={28} width={16} height={4} fill={W} />
        {/* red neck rim */}
        <Rect x={12} y={24} width={1}  height={1} fill={R} />
        <Rect x={19} y={24} width={1}  height={1} fill={R} />
        <Rect x={12} y={25} width={8}  height={1} fill={R} />
      </G>
    );
  }

  if (style === 'collared') {
    const B = '#A8C8E8', W = '#F8F8F8', BD = '#7AAAC8';
    return (
      <G>
        {/* shirt body */}
        <Rect x={8}    y={28} width={16} height={4} fill={B} />
        {/* collar — blue shirt showing */}
        <Rect x={15.5} y={24} width={1}  height={1} fill={B} />
        <Rect x={11}   y={25} width={1}  height={1} fill={B} />
        <Rect x={15}   y={25} width={2}  height={1} fill={B} />
        <Rect x={20}   y={25} width={1}  height={1} fill={B} />
        <Rect x={9}    y={26} width={4}  height={1} fill={B} />
        <Rect x={14}   y={26} width={4}  height={1} fill={B} />
        <Rect x={19}   y={26} width={4}  height={1} fill={B} />
        <Rect x={8}    y={27} width={16} height={1} fill={B} />
        {/* collar — white points */}
        <Rect x={12}   y={24} width={3.5} height={1} fill={W} />
        <Rect x={16.5} y={24} width={3.5} height={1} fill={W} />
        <Rect x={12}   y={25} width={3}  height={1} fill={W} />
        <Rect x={17}   y={25} width={3}  height={1} fill={W} />
        <Rect x={13}   y={26} width={1}  height={1} fill={W} />
        <Rect x={18}   y={26} width={1}  height={1} fill={W} />
      </G>
    );
  }

  if (style === 'striped') {
    const W = '#F8F8F8', P = '#F4A0B0', PD = '#D9607A';
    return (
      <G>
        {/* pink base */}
        <Rect x={8}    y={27} width={16} height={5} fill={P} />
        <Rect x={9}    y={26} width={14} height={1} fill={P} />
        <Rect x={11}   y={25} width={10} height={1} fill={P} />
        {/* collar pink areas */}
        <Rect x={15.5} y={24} width={1}  height={1} fill={P} />
        <Rect x={11}   y={25} width={1}  height={1} fill={P} />
        <Rect x={15}   y={25} width={2}  height={1} fill={P} />
        <Rect x={20}   y={25} width={1}  height={1} fill={P} />
        <Rect x={9}    y={26} width={4}  height={1} fill={P} />
        <Rect x={14}   y={26} width={4}  height={1} fill={P} />
        <Rect x={19}   y={26} width={4}  height={1} fill={P} />
        {/* white collar points */}
        <Rect x={12}   y={24} width={3.5} height={1} fill={W} />
        <Rect x={16.5} y={24} width={3.5} height={1} fill={W} />
        <Rect x={12}   y={25} width={3}  height={1} fill={W} />
        <Rect x={17}   y={25} width={3}  height={1} fill={W} />
        <Rect x={13}   y={26} width={1}  height={1} fill={W} />
        <Rect x={18}   y={26} width={1}  height={1} fill={W} />
        {/* darker pink stripes on top */}
        <Rect x={11}   y={25} width={1}  height={1} fill={PD} />
        <Rect x={20}   y={25} width={1}  height={1} fill={PD} />
        <Rect x={11}   y={26} width={1}  height={1} fill={PD} />
        <Rect x={14}   y={26} width={1}  height={1} fill={PD} />
        <Rect x={17}   y={26} width={1}  height={1} fill={PD} />
        <Rect x={20}   y={26} width={1}  height={1} fill={PD} />
        <Rect x={8}    y={27} width={1}  height={1} fill={PD} />
        <Rect x={11}   y={27} width={1}  height={1} fill={PD} />
        <Rect x={14}   y={27} width={1}  height={1} fill={PD} />
        <Rect x={17}   y={27} width={1}  height={1} fill={PD} />
        <Rect x={20}   y={27} width={1}  height={1} fill={PD} />
        <Rect x={23}   y={27} width={1}  height={1} fill={PD} />
        <Rect x={8}    y={28} width={1}  height={1} fill={PD} />
        <Rect x={11}   y={28} width={1}  height={1} fill={PD} />
        <Rect x={14}   y={28} width={1}  height={1} fill={PD} />
        <Rect x={17}   y={28} width={1}  height={1} fill={PD} />
        <Rect x={20}   y={28} width={1}  height={1} fill={PD} />
        <Rect x={23}   y={28} width={1}  height={1} fill={PD} />
        <Rect x={8}    y={29} width={1}  height={1} fill={PD} />
        <Rect x={11}   y={29} width={1}  height={1} fill={PD} />
        <Rect x={14}   y={29} width={1}  height={1} fill={PD} />
        <Rect x={17}   y={29} width={1}  height={1} fill={PD} />
        <Rect x={20}   y={29} width={1}  height={1} fill={PD} />
        <Rect x={23}   y={29} width={1}  height={1} fill={PD} />
        <Rect x={8}    y={30} width={1}  height={1} fill={PD} />
        <Rect x={11}   y={30} width={1}  height={1} fill={PD} />
        <Rect x={14}   y={30} width={1}  height={1} fill={PD} />
        <Rect x={17}   y={30} width={1}  height={1} fill={PD} />
        <Rect x={20}   y={30} width={1}  height={1} fill={PD} />
        <Rect x={23}   y={30} width={1}  height={1} fill={PD} />
        <Rect x={8}    y={31} width={1}  height={1} fill={PD} />
        <Rect x={11}   y={31} width={1}  height={1} fill={PD} />
        <Rect x={14}   y={31} width={1}  height={1} fill={PD} />
        <Rect x={17}   y={31} width={1}  height={1} fill={PD} />
        <Rect x={20}   y={31} width={1}  height={1} fill={PD} />
        <Rect x={23}   y={31} width={1}  height={1} fill={PD} />
      </G>
    );
  }

  if (style === 'suit') {
    const D = '#002A00', C = '#C8C8C8', T = '#CC2200', W = '#F8F8F8';
    return (
      <G>
        {/* white-shadow shirt base */}
        <Rect x={12} y={24} width={8}  height={1} fill={C} />
        <Rect x={11} y={25} width={10} height={7} fill={C} />
        {/* white collar points on top */}
        <Rect x={12}   y={24} width={3.5} height={1} fill={W} />
        <Rect x={16.5} y={24} width={3.5} height={1} fill={W} />
        <Rect x={12}   y={25} width={3}  height={1} fill={W} />
        <Rect x={17}   y={25} width={3}  height={1} fill={W} />
        <Rect x={13}   y={26} width={1}  height={1} fill={W} />
        <Rect x={18}   y={26} width={1}  height={1} fill={W} />
        {/* tie */}
        <Rect x={14}    y={24} width={4}   height={1}   fill={T} />
        <Rect x={14.5}  y={25} width={3}   height={0.5} fill={T} />
        <Rect x={15}    y={25.5} width={2} height={0.5} fill={T} />
        <Rect x={15.25} y={26} width={1.5} height={0.5} fill={T} />
        <Rect x={15}    y={26.5} width={2} height={0.5} fill={T} />
        <Rect x={14.5}  y={27} width={3}   height={0.5} fill={T} />
        <Rect x={14.25} y={27.5} width={3.5} height={4.5} fill={T} />
        {/* jacket body — open-front lapels */}
        <Rect x={8}  y={27} width={1}  height={5} fill={D} />
        <Rect x={9}  y={25} width={3}  height={7} fill={D} />
        <Rect x={12} y={27} width={1}  height={5} fill={D} />
        <Rect x={13} y={29} width={1}  height={3} fill={D} />
        <Rect x={14} y={30} width={1}  height={2} fill={D} />
        <Rect x={15} y={31} width={1}  height={1} fill={D} />
        <Rect x={23} y={27} width={1}  height={5} fill={D} />
        <Rect x={20} y={25} width={3}  height={7} fill={D} />
        <Rect x={19} y={27} width={1}  height={5} fill={D} />
        <Rect x={18} y={29} width={1}  height={3} fill={D} />
        <Rect x={17} y={30} width={1}  height={2} fill={D} />
        <Rect x={16} y={31} width={1}  height={1} fill={D} />
      </G>
    );
  }

  if (style === 'tuxedo') {
    const J = '#333333', SH = '#E9E9E9', W = '#F8F8F8';
    return (
      <G>
        {/* shirt body */}
        <Rect x={8}  y={28} width={16} height={4} fill={SH} />
        <Rect x={9}  y={26} width={14} height={1} fill={SH} />
        <Rect x={11} y={25} width={10} height={1} fill={SH} />
        <Rect x={8}  y={27} width={16} height={1} fill={SH} />
        {/* jacket */}
        <Rect x={9}  y={25} width={2}  height={1} fill={J} />
        <Rect x={21} y={25} width={2}  height={1} fill={J} />
        <Rect x={8}  y={26} width={4}  height={6} fill={J} />
        <Rect x={20} y={26} width={4}  height={6} fill={J} />
        <Rect x={12} y={27} width={2}  height={5} fill={J} />
        <Rect x={18} y={27} width={2}  height={5} fill={J} />
        <Rect x={14} y={30} width={1}  height={2} fill={J} />
        <Rect x={17} y={30} width={1}  height={2} fill={J} />
        {/* white collar points */}
        <Rect x={12}   y={24} width={3.5} height={1} fill={W} />
        <Rect x={16.5} y={24} width={3.5} height={1} fill={W} />
        <Rect x={12}   y={25} width={3}  height={1} fill={W} />
        <Rect x={17}   y={25} width={3}  height={1} fill={W} />
        <Rect x={13}   y={26} width={1}  height={1} fill={W} />
        <Rect x={18}   y={26} width={1}  height={1} fill={W} />
        {/* bow tie */}
        <Rect x={15.5} y={24} width={1}  height={1}   fill={J} />
        <Rect x={16.5} y={23.5} width={1} height={2}  fill={J} />
        <Rect x={17.5} y={23} width={1}  height={3}   fill={J} />
        <Rect x={14.5} y={23.5} width={1} height={2}  fill={J} />
        <Rect x={13.5} y={23} width={1}  height={3}   fill={J} />
        <Rect x={15.5} y={25} width={1}  height={7}   fill={W} />
      </G>
    );
  }

  if (style === 'bathrobe') {
    const A = '#9AABBA', B = '#7A8E9E', W = '#F8F8F8', WL = '#F0F0F0', WD = '#D8D8D8';
    return (
      <G>
        {/* outline */}
        <Rect x={12} y={23} width={2}  height={1} fill={A} />
        <Rect x={19} y={23} width={2}  height={1} fill={A} />
        <Rect x={11} y={24} width={1}  height={1} fill={A} />
        <Rect x={14} y={24} width={1}  height={1} fill={A} />
        <Rect x={18} y={24} width={1}  height={1} fill={A} />
        <Rect x={21} y={24} width={1}  height={1} fill={A} />
        <Rect x={10} y={25} width={1}  height={1} fill={A} />
        <Rect x={15} y={25} width={1}  height={1} fill={A} />
        <Rect x={21} y={25} width={1}  height={1} fill={A} />
        <Rect x={9}  y={26} width={1}  height={1} fill={A} />
        <Rect x={11} y={26} width={1}  height={1} fill={A} />
        <Rect x={20} y={26} width={1}  height={1} fill={A} />
        <Rect x={22} y={26} width={1}  height={1} fill={A} />
        <Rect x={8}  y={27} width={1}  height={1} fill={A} />
        <Rect x={20} y={27} width={1}  height={1} fill={A} />
        <Rect x={23} y={27} width={1}  height={1} fill={A} />
        <Rect x={8}  y={28} width={1}  height={1} fill={A} />
        <Rect x={23} y={28} width={1}  height={1} fill={A} />
        <Rect x={8}  y={29} width={1}  height={1} fill={A} />
        <Rect x={23} y={29} width={1}  height={1} fill={A} />
        <Rect x={8}  y={30} width={1}  height={1} fill={A} />
        <Rect x={23} y={30} width={1}  height={1} fill={A} />
        <Rect x={19} y={31} width={1}  height={1} fill={A} />
        <Rect x={23} y={31} width={1}  height={1} fill={A} />
        {/* dark shadow */}
        <Rect x={17} y={25} width={1}  height={1} fill={B} />
        <Rect x={16} y={26} width={1}  height={1} fill={B} />
        <Rect x={12} y={27} width={1}  height={1} fill={B} />
        <Rect x={17} y={27} width={1}  height={1} fill={B} />
        <Rect x={13} y={28} width={1}  height={1} fill={B} />
        <Rect x={17} y={28} width={1}  height={1} fill={B} />
        <Rect x={19} y={28} width={1}  height={1} fill={B} />
        <Rect x={14} y={29} width={1}  height={1} fill={B} />
        <Rect x={18} y={29} width={1}  height={1} fill={B} />
        <Rect x={15} y={30} width={1}  height={1} fill={B} />
        <Rect x={18} y={30} width={1}  height={1} fill={B} />
        <Rect x={8}  y={31} width={1}  height={1} fill={B} />
        <Rect x={16} y={31} width={1}  height={1} fill={B} />
        {/* bright white */}
        <Rect x={12} y={24} width={2}  height={1} fill={W} />
        <Rect x={19} y={24} width={2}  height={1} fill={W} />
        <Rect x={12} y={25} width={3}  height={1} fill={W} />
        <Rect x={20} y={25} width={1}  height={1} fill={W} />
        <Rect x={14} y={26} width={2}  height={1} fill={W} />
        <Rect x={9}  y={27} width={2}  height={1} fill={W} />
        <Rect x={15} y={27} width={2}  height={1} fill={W} />
        <Rect x={22} y={27} width={1}  height={1} fill={W} />
        <Rect x={9}  y={28} width={3}  height={1} fill={W} />
        <Rect x={15} y={28} width={2}  height={1} fill={W} />
        <Rect x={21} y={28} width={2}  height={1} fill={W} />
        <Rect x={9}  y={29} width={4}  height={1} fill={W} />
        <Rect x={20} y={29} width={3}  height={1} fill={W} />
        <Rect x={9}  y={30} width={5}  height={1} fill={W} />
        <Rect x={20} y={30} width={3}  height={1} fill={W} />
        <Rect x={9}  y={31} width={6}  height={1} fill={W} />
        <Rect x={21} y={31} width={2}  height={1} fill={W} />
        {/* mid white */}
        <Rect x={18} y={25} width={2}  height={1} fill={WL} />
        <Rect x={10} y={26} width={1}  height={1} fill={WL} />
        <Rect x={13} y={26} width={1}  height={1} fill={WL} />
        <Rect x={18} y={26} width={2}  height={1} fill={WL} />
        <Rect x={21} y={26} width={1}  height={1} fill={WL} />
        <Rect x={11} y={27} width={1}  height={1} fill={WL} />
        <Rect x={14} y={27} width={1}  height={1} fill={WL} />
        <Rect x={19} y={27} width={1}  height={1} fill={WL} />
        <Rect x={21} y={27} width={1}  height={1} fill={WL} />
        <Rect x={12} y={28} width={1}  height={1} fill={WL} />
        <Rect x={20} y={28} width={1}  height={1} fill={WL} />
        <Rect x={13} y={29} width={1}  height={1} fill={WL} />
        <Rect x={16} y={29} width={2}  height={1} fill={WL} />
        <Rect x={19} y={29} width={1}  height={1} fill={WL} />
        <Rect x={14} y={30} width={1}  height={1} fill={WL} />
        <Rect x={17} y={30} width={1}  height={1} fill={WL} />
        <Rect x={19} y={30} width={1}  height={1} fill={WL} />
        <Rect x={15} y={31} width={1}  height={1} fill={WL} />
        <Rect x={18} y={31} width={1}  height={1} fill={WL} />
        <Rect x={20} y={31} width={1}  height={1} fill={WL} />
        {/* fold shadow */}
        <Rect x={11} y={25} width={1}  height={1} fill={WD} />
        <Rect x={12} y={26} width={1}  height={1} fill={WD} />
        <Rect x={17} y={26} width={1}  height={1} fill={WD} />
        <Rect x={13} y={27} width={1}  height={1} fill={WD} />
        <Rect x={18} y={27} width={1}  height={1} fill={WD} />
        <Rect x={14} y={28} width={1}  height={1} fill={WD} />
        <Rect x={18} y={28} width={1}  height={1} fill={WD} />
        <Rect x={15} y={29} width={1}  height={1} fill={WD} />
        <Rect x={16} y={30} width={1}  height={1} fill={WD} />
        <Rect x={17} y={31} width={1}  height={1} fill={WD} />
      </G>
    );
  }

  if (style === 'batman_suit') {
    const N = '#111118', LB = '#FFFF00', J = '#333333';
    return (
      <G>
        {/* body */}
        <Rect x={13} y={23} width={5}  height={1} fill={J} />
        <Rect x={8}  y={24} width={16} height={8} fill={J} />
        {/* cape */}
        <Rect x={11} y={22.5} width={10} height={0.5} fill={N} />
        <Rect x={9}  y={23} width={4}  height={1} fill={N} />
        <Rect x={18} y={23} width={5}  height={1} fill={N} />
        <Rect x={8}  y={24} width={3}  height={1} fill={N} />
        <Rect x={20} y={24} width={4}  height={1} fill={N} />
        <Rect x={8}  y={25} width={2}  height={1} fill={N} />
        <Rect x={21} y={25} width={3}  height={1} fill={N} />
        <Rect x={8}  y={26} width={1}  height={1} fill={N} />
        <Rect x={22} y={26} width={2}  height={1} fill={N} />
        {/* oval */}
        <Rect x={13.25} y={23.5} width={4.5}  height={0.25} fill={LB} />
        <Rect x={12.75} y={23.75} width={5.5} height={0.25} fill={LB} />
        <Rect x={12.25} y={24}   width={6.5}  height={0.5}  fill={LB} />
        <Rect x={12}    y={24.5} width={7}    height={2.5}  fill={LB} />
        <Rect x={12.25} y={27}   width={6.5}  height={0.5}  fill={LB} />
        <Rect x={12.75} y={27.5} width={5.5}  height={0.25} fill={LB} />
        <Rect x={13}    y={27.75} width={5}   height={0.25} fill={LB} />
        {/* bat symbol — all black (N) */}
        <Rect x={13.125} y={24}   width={0.5}  height={0.5}  fill={N} />
        <Rect x={15}     y={24}   width={0.25} height={0.5}  fill={N} />
        <Rect x={15.75}  y={24}   width={0.25} height={0.5}  fill={N} />
        <Rect x={17.375} y={24}   width={0.5}  height={0.5}  fill={N} />
        <Rect x={12.75}  y={24.5} width={1}    height={0.5}  fill={N} />
        <Rect x={15}     y={24.5} width={1}    height={0.5}  fill={N} />
        <Rect x={17.25}  y={24.5} width={1}    height={0.5}  fill={N} />
        <Rect x={12.5}   y={25}   width={6}    height={1}    fill={N} />
        <Rect x={12.5}   y={26}   width={1}    height={0.5}  fill={N} />
        <Rect x={13.875} y={26}   width={0.5}  height={0.25} fill={N} />
        <Rect x={14.75}  y={26}   width={1.5}  height={0.5}  fill={N} />
        <Rect x={16.625} y={26}   width={0.5}  height={0.25} fill={N} />
        <Rect x={17.5}   y={26}   width={1}    height={0.5}  fill={N} />
        <Rect x={12.625} y={26.5} width={0.5}  height={0.5}  fill={N} />
        <Rect x={14}     y={26.25} width={0.25} height={0.5} fill={N} />
        <Rect x={15}     y={26.5} width={1}    height={0.5}  fill={N} />
        <Rect x={16.75}  y={26.25} width={0.25} height={0.5} fill={N} />
        <Rect x={17.875} y={26.5} width={0.5}  height={0.5}  fill={N} />
        <Rect x={15.25}  y={27}   width={0.5}  height={0.5}  fill={N} />
      </G>
    );
  }

  return <G />;
}
