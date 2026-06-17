import React from 'react';
import { G, Rect } from 'react-native-svg';

export type HeaddressStyle =
  | 'none' | 'flower' | 'bow' | 'crown' | 'partyhat' | 'beanie' | 'tophat'
  // badge headdresses
  | 'batman'
  | 'headband'
  | 'helmet'
  | 'beanie_1' | 'beanie_2' | 'beanie_3'
  | 'party_1' | 'party_2' | 'party_3' | 'party_4'
  | 'trophy_bronze' | 'trophy_silver' | 'trophy_gold' | 'trophy_platinum'
  | 'tp_crown';

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
    const C = '#CC2200';
    return (
      <G>
        {/* left wing */}
        <Rect x={11} y={0} width={2} height={1} fill={C} />
        <Rect x={11} y={1} width={3} height={1} fill={C} />
        <Rect x={11} y={2} width={9} height={1} fill={C} />
        <Rect x={11} y={3} width={9} height={1} fill={C} />
        <Rect x={11} y={4} width={3} height={1} fill={C} />
        <Rect x={10} y={5} width={1} height={1} fill={C} />
        <Rect x={12} y={5} width={1} height={1} fill={C} />
        {/* right wing */}
        <Rect x={18} y={0} width={2} height={1} fill={C} />
        <Rect x={17} y={1} width={3} height={1} fill={C} />
        <Rect x={17} y={4} width={3} height={1} fill={C} />
        <Rect x={18} y={5} width={1} height={1} fill={C} />
        <Rect x={20} y={5} width={1} height={1} fill={C} />
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

  // ── Badge headdresses ─────────────────────────────────────────────────────

  if (style === 'batman') {
    const B = '#111118';
    return (
      <G>
        {/* ear tips */}
        <Rect x={6}  y={0}  width={1}  height={1} fill={B} /><Rect x={25} y={0}  width={1}  height={1} fill={B} />
        <Rect x={5}  y={1}  width={3}  height={1} fill={B} /><Rect x={24} y={1}  width={3}  height={1} fill={B} />
        <Rect x={5}  y={2}  width={5}  height={1} fill={B} /><Rect x={22} y={2}  width={5}  height={1} fill={B} />
        <Rect x={5}  y={3}  width={6}  height={1} fill={B} /><Rect x={21} y={3}  width={6}  height={1} fill={B} />
        {/* solid band rows 4–10 */}
        <Rect x={5}  y={4}  width={22} height={7} fill={B} />
        {/* eye cutouts row 11 */}
        <Rect x={5}  y={11} width={4}  height={1} fill={B} /><Rect x={12} y={11} width={8}  height={1} fill={B} /><Rect x={23} y={11} width={4}  height={1} fill={B} />
        <Rect x={5}  y={12} width={5}  height={1} fill={B} /><Rect x={13} y={12} width={6}  height={1} fill={B} /><Rect x={22} y={12} width={5}  height={1} fill={B} />
        {/* solid band rows 13–14 */}
        <Rect x={5}  y={13} width={22} height={2} fill={B} />
        {/* nose cutout rows 15–16 */}
        <Rect x={5}  y={15} width={7}  height={1} fill={B} /><Rect x={13} y={15} width={5}  height={1} fill={B} /><Rect x={19} y={15} width={8}  height={1} fill={B} />
        <Rect x={5}  y={16} width={7}  height={1} fill={B} /><Rect x={14} y={16} width={3}  height={1} fill={B} /><Rect x={19} y={16} width={8}  height={1} fill={B} />
        {/* solid band rows 17–18 */}
        <Rect x={5}  y={17} width={7}  height={2} fill={B} /><Rect x={19} y={17} width={8}  height={2} fill={B} />
        {/* chin taper */}
        <Rect x={6}  y={19} width={6}  height={1} fill={B} /><Rect x={19} y={19} width={7}  height={1} fill={B} />
        <Rect x={7}  y={20} width={6}  height={1} fill={B} /><Rect x={18} y={20} width={7}  height={1} fill={B} />
        <Rect x={9}  y={21} width={5}  height={1} fill={B} /><Rect x={17} y={21} width={6}  height={1} fill={B} />
        <Rect x={11} y={22} width={3}  height={1} fill={B} /><Rect x={17} y={22} width={4}  height={1} fill={B} />
      </G>
    );
  }

  if (style === 'headband') {
    const W = '#F0F0F0', R = '#CC2200';
    return (
      <G>
        <Rect x={4.5} y={5} width={23} height={4} fill={W} />
        <Rect x={4.5} y={6} width={23} height={2} fill={R} />
      </G>
    );
  }

  if (style === 'helmet') {
    const O = '#556B2F', D = '#3D5016', S = '#6B8040';
    return (
      <G>
        {/* dome */}
        <Rect x={11}  y={0} width={10} height={1} fill={O} />
        <Rect x={9}   y={1} width={14} height={1} fill={O} />
        <Rect x={7}   y={2} width={18} height={1} fill={O} />
        <Rect x={5.5} y={3} width={21} height={1} fill={O} />
        <Rect x={4.5} y={4} width={23} height={2} fill={O} />
        <Rect x={4}   y={5} width={24} height={2} fill={D} />
        {/* brim */}
        <Rect x={3}   y={7} width={26} height={2} fill={S} />
        {/* highlight */}
        <Rect x={11}  y={3} width={4}  height={1} fill={S} />
      </G>
    );
  }

  if (style === 'beanie_1') {
    // beanie_light — fresh orange beanie
    const O = '#FF8C42', OD = '#E06820';
    return (
      <G>
        <Rect x={14}    y={-1} width={4}    height={1} fill={OD} />
        <Rect x={12}    y={0}  width={8}    height={1} fill={O} />
        <Rect x={11}    y={1}  width={10}   height={1} fill={O} />
        <Rect x={10.5}  y={2}  width={11}   height={1} fill={O} />
        <Rect x={10.25} y={3}  width={11.5} height={1} fill={O} />
        <Rect x={10}    y={4}  width={12}   height={1} fill={OD} />
      </G>
    );
  }

  if (style === 'beanie_2') {
    // beanie_dark — worn, darker orange with wear marks
    const O = '#CC5500', OD = '#883300';
    return (
      <G>
        <Rect x={14} y={-1} width={4}  height={1} fill="#DDDDDD" />
        <Rect x={12} y={0}  width={8}  height={1} fill={O} />
        <Rect x={11} y={1}  width={10} height={1} fill={O} />
        <Rect x={10} y={2}  width={12} height={1} fill={O} />
        <Rect x={10} y={3}  width={12} height={1} fill={O} />
        <Rect x={10} y={4}  width={12} height={1} fill={OD} />
        <Rect x={12} y={1}  width={1}  height={1} fill={OD} />
        <Rect x={20} y={2}  width={1}  height={1} fill={OD} />
      </G>
    );
  }

  if (style === 'beanie_3') {
    // beanie_worn — battered, darkest with patches
    const O = '#883300', OD = '#552200', P = '#CC6633';
    return (
      <G>
        <Rect x={14} y={-1} width={4}  height={1} fill="#AAAAAA" />
        <Rect x={12} y={0}  width={8}  height={1} fill={O} />
        <Rect x={11} y={1}  width={10} height={1} fill={O} />
        <Rect x={10} y={2}  width={12} height={1} fill={O} />
        <Rect x={10} y={3}  width={12} height={1} fill={O} />
        <Rect x={10} y={4}  width={12} height={1} fill={OD} />
        <Rect x={12} y={1}  width={2}  height={1} fill={P} />
        <Rect x={19} y={2}  width={2}  height={1} fill={P} />
        <Rect x={11} y={3}  width={1}  height={1} fill={OD} />
        <Rect x={21} y={3}  width={1}  height={1} fill={OD} />
      </G>
    );
  }

  if (style === 'party_1') {
    // partyhat_1 — basic red/white
    const R = '#EE3333', W = '#FFFFFF';
    return (
      <G>
        <Rect x={15} y={0}  width={2} height={1} fill={W} />
        <Rect x={15} y={1}  width={2} height={1} fill={R} />
        <Rect x={14} y={2}  width={4} height={1} fill={R} />
        <Rect x={13} y={3}  width={6} height={1} fill={R} />
        <Rect x={12} y={4}  width={8} height={1} fill="#CC1111" />
        <Rect x={16} y={2}  width={1} height={1} fill={W} />
        <Rect x={14} y={3}  width={1} height={1} fill={W} />
      </G>
    );
  }

  if (style === 'party_2') {
    // partyhat_2 — rainbow stripes
    const cols = ['#FF4444', '#FF8800', '#FFDD00', '#44BB44', '#4488FF'] as const;
    return (
      <G>
        <Rect x={15} y={0}  width={2}  height={1} fill="#FFFFFF" />
        <Rect x={15} y={1}  width={2}  height={1} fill={cols[0]} />
        <Rect x={14} y={2}  width={4}  height={1} fill={cols[1]} />
        <Rect x={13} y={3}  width={6}  height={1} fill={cols[2]} />
        <Rect x={12} y={4}  width={8}  height={1} fill={cols[3]} />
        <Rect x={11} y={5}  width={10} height={1} fill={cols[4]} />
        <Rect x={16} y={2}  width={1}  height={1} fill="#FFFFFF" />
        <Rect x={14} y={3}  width={1}  height={1} fill="#FFFFFF" />
        <Rect x={13} y={4}  width={1}  height={1} fill="#FFFFFF" />
      </G>
    );
  }

  if (style === 'party_3') {
    // partyhat_3 — fancy gold + stars
    const GC = '#FFD700', GD = '#CC9900', W = '#FFFFFF';
    return (
      <G>
        <Rect x={15} y={0}  width={2}  height={1} fill={W} />
        <Rect x={15} y={1}  width={2}  height={1} fill={GC} />
        <Rect x={14} y={2}  width={4}  height={1} fill={GC} />
        <Rect x={13} y={3}  width={6}  height={1} fill={GC} />
        <Rect x={12} y={4}  width={8}  height={1} fill={GD} />
        <Rect x={11} y={5}  width={10} height={1} fill={GD} />
        {/* star dots */}
        <Rect x={15} y={2}  width={1}  height={1} fill={W} />
        <Rect x={14} y={3}  width={1}  height={1} fill={W} />
        <Rect x={16} y={4}  width={1}  height={1} fill={W} />
        <Rect x={13} y={5}  width={1}  height={1} fill={W} />
      </G>
    );
  }

  if (style === 'party_4') {
    // partyhat_4 — legendary dark purple + gold + gems
    const P = '#6622CC', GC = '#FFD700', GE = '#44FFEE';
    return (
      <G>
        <Rect x={15} y={0}  width={2}  height={1} fill={GC} />
        <Rect x={15} y={1}  width={2}  height={1} fill={P} />
        <Rect x={14} y={2}  width={4}  height={1} fill={P} />
        <Rect x={13} y={3}  width={6}  height={1} fill={P} />
        <Rect x={12} y={4}  width={8}  height={1} fill="#4411AA" />
        <Rect x={11} y={5}  width={10} height={1} fill="#4411AA" />
        {/* gold trim */}
        <Rect x={14} y={2}  width={1}  height={1} fill={GC} />
        <Rect x={17} y={2}  width={1}  height={1} fill={GC} />
        <Rect x={13} y={3}  width={1}  height={1} fill={GC} />
        <Rect x={18} y={3}  width={1}  height={1} fill={GC} />
        {/* gems */}
        <Rect x={15} y={3}  width={2}  height={1} fill={GE} />
        <Rect x={14} y={5}  width={1}  height={1} fill={GE} />
        <Rect x={17} y={5}  width={1}  height={1} fill={GE} />
      </G>
    );
  }

  if (style === 'trophy_bronze') {
    const T = '#CD7F32', TD = '#8B4513', S = '#E8A060';
    return (
      <G>
        <Rect x={12} y={-2} width={8}  height={1} fill={TD} />
        <Rect x={13} y={-1} width={6}  height={1} fill={T} />
        <Rect x={11} y={-1} width={2}  height={1} fill={T} />
        <Rect x={19} y={-1} width={2}  height={1} fill={T} />
        <Rect x={13} y={0}  width={6}  height={1} fill={T} />
        <Rect x={11} y={0}  width={2}  height={1} fill={T} />
        <Rect x={19} y={0}  width={2}  height={1} fill={T} />
        <Rect x={13} y={1}  width={6}  height={1} fill={T} />
        <Rect x={15} y={2}  width={2}  height={1} fill={TD} />
        <Rect x={13} y={3}  width={6}  height={1} fill={T} />
        <Rect x={12} y={4}  width={8}  height={1} fill={TD} />
        <Rect x={14} y={-1} width={1}  height={2} fill={S} />
      </G>
    );
  }

  if (style === 'trophy_silver') {
    const T = '#B0B8C8', TD = '#606878', S = '#E0E8F0';
    return (
      <G>
        <Rect x={12} y={-2} width={8}  height={1} fill={TD} />
        <Rect x={13} y={-1} width={6}  height={1} fill={T} />
        <Rect x={11} y={-1} width={2}  height={1} fill={T} />
        <Rect x={19} y={-1} width={2}  height={1} fill={T} />
        <Rect x={13} y={0}  width={6}  height={1} fill={T} />
        <Rect x={11} y={0}  width={2}  height={1} fill={T} />
        <Rect x={19} y={0}  width={2}  height={1} fill={T} />
        <Rect x={13} y={1}  width={6}  height={1} fill={T} />
        <Rect x={15} y={2}  width={2}  height={1} fill={TD} />
        <Rect x={13} y={3}  width={6}  height={1} fill={T} />
        <Rect x={12} y={4}  width={8}  height={1} fill={TD} />
        <Rect x={14} y={-1} width={1}  height={2} fill={S} />
        <Rect x={16} y={0}  width={1}  height={1} fill={S} />
        <Rect x={17} y={-1} width={1}  height={1} fill={S} />
        <Rect x={17} y={1}  width={1}  height={1} fill={S} />
      </G>
    );
  }

  if (style === 'trophy_gold') {
    const T = '#FFD700', TD = '#AA7700', S = '#FFF0A0';
    return (
      <G>
        <Rect x={12} y={-2} width={8}  height={1} fill={TD} />
        <Rect x={13} y={-1} width={6}  height={1} fill={T} />
        <Rect x={11} y={-1} width={2}  height={1} fill={T} />
        <Rect x={19} y={-1} width={2}  height={1} fill={T} />
        <Rect x={13} y={0}  width={6}  height={1} fill={T} />
        <Rect x={11} y={0}  width={2}  height={1} fill={T} />
        <Rect x={19} y={0}  width={2}  height={1} fill={T} />
        <Rect x={13} y={1}  width={6}  height={1} fill={T} />
        <Rect x={15} y={2}  width={2}  height={1} fill={TD} />
        <Rect x={13} y={3}  width={6}  height={1} fill={T} />
        <Rect x={12} y={4}  width={8}  height={1} fill={TD} />
        <Rect x={14} y={-1} width={1}  height={2} fill={S} />
        <Rect x={15} y={0}  width={1}  height={1} fill={S} />
        <Rect x={16} y={0}  width={1}  height={1} fill={S} />
        <Rect x={17} y={-1} width={1}  height={1} fill={S} />
        <Rect x={17} y={1}  width={1}  height={1} fill={S} />
      </G>
    );
  }

  if (style === 'trophy_platinum') {
    const T = '#D8E8FF', TD = '#6688BB', S = '#FFFFFF', GC = '#66DDFF';
    return (
      <G>
        <Rect x={12} y={-2} width={8}  height={1} fill={TD} />
        <Rect x={13} y={-1} width={6}  height={1} fill={T} />
        <Rect x={11} y={-1} width={2}  height={1} fill={T} />
        <Rect x={19} y={-1} width={2}  height={1} fill={T} />
        <Rect x={13} y={0}  width={6}  height={1} fill={T} />
        <Rect x={11} y={0}  width={2}  height={1} fill={T} />
        <Rect x={19} y={0}  width={2}  height={1} fill={T} />
        <Rect x={13} y={1}  width={6}  height={1} fill={T} />
        <Rect x={15} y={2}  width={2}  height={1} fill={TD} />
        <Rect x={13} y={3}  width={6}  height={1} fill={T} />
        <Rect x={12} y={4}  width={8}  height={1} fill={TD} />
        <Rect x={14} y={-1} width={1}  height={2} fill={S} />
        <Rect x={16} y={-1} width={1}  height={1} fill={GC} />
        <Rect x={15} y={0}  width={3}  height={1} fill={GC} />
        <Rect x={16} y={1}  width={1}  height={1} fill={GC} />
      </G>
    );
  }

  if (style === 'tp_crown') {
    const O = '#CCCCCC', F = '#F5F5F0', B = '#C4A484', DB = '#654321';
    return (
      <G>
        {/* fill */}
        <Rect x={13} y={-1}  width={6}  height={1} fill={F} /><Rect x={21} y={-1} width={1} height={1} fill={F} />
        <Rect x={12} y={0}   width={7}  height={1} fill={F} /><Rect x={20} y={0}  width={3} height={1} fill={F} />
        <Rect x={13} y={1}   width={5}  height={1} fill={F} /><Rect x={19} y={1}  width={3} height={1} fill={F} />
        <Rect x={12} y={2}   width={1}  height={1} fill={F} /><Rect x={18} y={2}  width={5} height={1} fill={F} />
        <Rect x={12} y={3}   width={10} height={1} fill={F} />
        <Rect x={12} y={4}   width={11} height={1} fill={F} />
        <Rect x={12} y={5}   width={8}  height={1} fill={F} />
        <Rect x={13} y={6}   width={5}  height={1} fill={F} /><Rect x={19} y={6}  width={1} height={1} fill={F} />
        <Rect x={14} y={7}   width={4}  height={1} fill={F} />
        {/* outline */}
        <Rect x={13} y={-2}  width={5}  height={1} fill={O} /><Rect x={21} y={-2} width={3} height={1} fill={O} />
        <Rect x={12} y={-1}  width={1}  height={1} fill={O} /><Rect x={18} y={-1} width={1} height={1} fill={O} />
        <Rect x={20} y={-1}  width={1}  height={1} fill={O} /><Rect x={22} y={-1} width={1} height={1} fill={O} />
        <Rect x={11} y={0}   width={1}  height={1} fill={O} /><Rect x={19} y={0}  width={1} height={1} fill={O} /><Rect x={23} y={0} width={1} height={1} fill={O} />
        <Rect x={11} y={1}   width={2}  height={1} fill={O} /><Rect x={18} y={1}  width={1} height={1} fill={O} /><Rect x={22} y={1} width={1} height={1} fill={O} />
        <Rect x={11} y={2}   width={1}  height={1} fill={O} /><Rect x={13} y={2}  width={5} height={1} fill={O} /><Rect x={23} y={2} width={1} height={1} fill={O} />
        <Rect x={11} y={3}   width={1}  height={1} fill={O} /><Rect x={22} y={3}  width={1} height={1} fill={O} />
        <Rect x={11} y={4}   width={1}  height={1} fill={O} /><Rect x={23} y={4}  width={1} height={1} fill={O} />
        <Rect x={11} y={5}   width={1}  height={1} fill={O} /><Rect x={20} y={5}  width={3} height={1} fill={O} />
        <Rect x={12} y={6}   width={1}  height={1} fill={O} /><Rect x={18} y={6}  width={2} height={1} fill={O} />
        <Rect x={13} y={7}   width={5}  height={1} fill={O} />
        {/* cardboard hole */}
        <Rect x={14.5} y={-0.5} width={2}   height={0.5} fill={B} />
        <Rect x={14}   y={0}    width={0.5}  height={1}   fill={B} />
        <Rect x={16.5} y={0}    width={0.5}  height={1}   fill={B} />
        <Rect x={14.5} y={1}    width={2}    height={0.5} fill={B} />
        <Rect x={14.5} y={0}    width={2}    height={1}   fill={DB} />
      </G>
    );
  }

  return <G />;
}
