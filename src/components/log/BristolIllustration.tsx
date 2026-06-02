import { memo } from 'react';
import type { ReactElement } from 'react';
import Svg, {
  Circle,
  Defs,
  Ellipse,
  Path,
  Polyline,
  RadialGradient,
  Stop,
} from 'react-native-svg';
import { BristolTypeNumber } from '../../utils/bristolData';

interface Props {
  type: BristolTypeNumber;
  width?: number;
  height?: number;
}

function Type1() {
  return (
    <>
      <Defs>
        <RadialGradient id="g1" cx="38%" cy="32%" r="65%">
          <Stop offset="0%" stopColor="#c47a2a" />
          <Stop offset="100%" stopColor="#5c3207" />
        </RadialGradient>
      </Defs>
      <Ellipse cx="7"  cy="26.5" rx="4.5" ry="1.1" fill="rgba(0,0,0,0.3)" />
      <Ellipse cx="19" cy="26.5" rx="5"   ry="1.2" fill="rgba(0,0,0,0.3)" />
      <Ellipse cx="31" cy="26.5" rx="4.2" ry="1.1" fill="rgba(0,0,0,0.3)" />
      <Ellipse cx="42" cy="23"   rx="3.8" ry="1"   fill="rgba(0,0,0,0.25)" />
      <Ellipse cx="51" cy="26"   rx="3.2" ry="0.9" fill="rgba(0,0,0,0.25)" />
      <Circle cx="7"  cy="21"  r="5"   fill="url(#g1)" />
      <Circle cx="19" cy="20"  r="5.5" fill="url(#g1)" />
      <Circle cx="31" cy="21"  r="4.8" fill="url(#g1)" />
      <Circle cx="42" cy="17"  r="4"   fill="url(#g1)" />
      <Circle cx="51" cy="21"  r="3.5" fill="url(#g1)" />
      <Circle cx="6"   cy="21.5" r="0.7" fill="rgba(0,0,0,0.35)" />
      <Circle cx="8.5" cy="19.5" r="0.5" fill="rgba(0,0,0,0.3)" />
      <Circle cx="7.5" cy="23"   r="0.5" fill="rgba(0,0,0,0.3)" />
      <Circle cx="18"  cy="20.5" r="0.7" fill="rgba(0,0,0,0.3)" />
      <Circle cx="21"  cy="18.5" r="0.5" fill="rgba(0,0,0,0.28)" />
      <Circle cx="20"  cy="22"   r="0.5" fill="rgba(0,0,0,0.28)" />
      <Circle cx="30"  cy="21.5" r="0.6" fill="rgba(0,0,0,0.3)" />
      <Circle cx="32"  cy="19.5" r="0.5" fill="rgba(0,0,0,0.28)" />
      <Circle cx="41"  cy="17.5" r="0.5" fill="rgba(0,0,0,0.28)" />
      <Circle cx="43"  cy="16"   r="0.4" fill="rgba(0,0,0,0.25)" />
      <Circle cx="50"  cy="21.5" r="0.5" fill="rgba(0,0,0,0.28)" />
      <Circle cx="5.2"  cy="19.2" r="1.6" fill="rgba(255,255,255,0.22)" />
      <Circle cx="17.2" cy="18.2" r="1.8" fill="rgba(255,255,255,0.22)" />
      <Circle cx="29.5" cy="19.5" r="1.5" fill="rgba(255,255,255,0.2)" />
      <Circle cx="40.5" cy="15.5" r="1.3" fill="rgba(255,255,255,0.18)" />
      <Circle cx="49.5" cy="19.5" r="1.2" fill="rgba(255,255,255,0.18)" />
    </>
  );
}

function Type2() {
  return (
    <>
      <Defs>
        <RadialGradient id="g2f" cx="38%" cy="30%" r="65%">
          <Stop offset="0%" stopColor="#b86e1e" />
          <Stop offset="100%" stopColor="#5c3207" />
        </RadialGradient>
        <RadialGradient id="g2b" cx="38%" cy="30%" r="65%">
          <Stop offset="0%" stopColor="#9a5a14" />
          <Stop offset="100%" stopColor="#4a2805" />
        </RadialGradient>
      </Defs>
      <Ellipse cx="28" cy="27.5" rx="24" ry="1.3" fill="rgba(0,0,0,0.28)" />
      <Circle cx="11" cy="17" r="5.8" fill="url(#g2b)" />
      <Circle cx="22" cy="15" r="6.2" fill="url(#g2b)" />
      <Circle cx="33" cy="15" r="6.2" fill="url(#g2b)" />
      <Circle cx="44" cy="17" r="5.8" fill="url(#g2b)" />
      <Circle cx="6"  cy="21"   r="5.2" fill="url(#g2f)" />
      <Circle cx="16" cy="19.5" r="6.2" fill="url(#g2f)" />
      <Circle cx="28" cy="19"   r="6.8" fill="url(#g2f)" />
      <Circle cx="40" cy="19.5" r="6.2" fill="url(#g2f)" />
      <Circle cx="50" cy="21"   r="5.2" fill="url(#g2f)" />
      <Circle cx="5"    cy="22"   r="0.6" fill="rgba(0,0,0,0.32)" />
      <Circle cx="7"    cy="20"   r="0.5" fill="rgba(0,0,0,0.28)" />
      <Circle cx="15"   cy="20.5" r="0.6" fill="rgba(0,0,0,0.3)" />
      <Circle cx="17.5" cy="18.5" r="0.5" fill="rgba(0,0,0,0.28)" />
      <Circle cx="27"   cy="20"   r="0.7" fill="rgba(0,0,0,0.3)" />
      <Circle cx="29.5" cy="17.5" r="0.5" fill="rgba(0,0,0,0.28)" />
      <Circle cx="30"   cy="21"   r="0.5" fill="rgba(0,0,0,0.28)" />
      <Circle cx="39"   cy="20.5" r="0.6" fill="rgba(0,0,0,0.28)" />
      <Circle cx="41"   cy="18.5" r="0.5" fill="rgba(0,0,0,0.25)" />
      <Circle cx="49"   cy="21.5" r="0.5" fill="rgba(0,0,0,0.28)" />
      <Circle cx="4.5"  cy="19.5" r="1.7" fill="rgba(255,255,255,0.18)" />
      <Circle cx="14.5" cy="18"   r="2"   fill="rgba(255,255,255,0.18)" />
      <Circle cx="26.5" cy="17"   r="2.2" fill="rgba(255,255,255,0.18)" />
      <Circle cx="38.5" cy="18"   r="2"   fill="rgba(255,255,255,0.16)" />
      <Circle cx="48.5" cy="19.5" r="1.7" fill="rgba(255,255,255,0.16)" />
    </>
  );
}

function Type3() {
  return (
    <>
      <Defs>
        <RadialGradient id="g3" cx="50%" cy="30%" r="68%">
          <Stop offset="0%" stopColor="#b07840" />
          <Stop offset="100%" stopColor="#5c3510" />
        </RadialGradient>
      </Defs>
      <Ellipse cx="28" cy="27" rx="21" ry="1.3" fill="rgba(0,0,0,0.22)" />
      <Path
        d="M5,14 Q8,8 14,8 Q17,5 20,8 Q23,5 26,8 Q29,5 32,8 Q35,5 38,8 Q41,5 44,8 Q49,8 51,14 Q49,20 44,20 Q41,23 38,20 Q35,23 32,20 Q29,23 26,20 Q23,23 20,20 Q17,23 14,20 Q8,20 5,14 Z"
        fill="url(#g3)"
      />
      <Polyline points="17,8.5 15.5,13.5 17.5,15 16,19.5" fill="none" stroke="#3d2008" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" opacity="0.75" />
      <Polyline points="27,8 25.5,13 27.5,15 26,20"       fill="none" stroke="#3d2008" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" opacity="0.75" />
      <Polyline points="38,8 36.5,13 38.5,15 37,19.5"     fill="none" stroke="#3d2008" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" opacity="0.75" />
      <Circle cx="11" cy="12" r="0.6" fill="rgba(0,0,0,0.3)" />
      <Circle cx="22" cy="10" r="0.6" fill="rgba(0,0,0,0.3)" />
      <Circle cx="33" cy="10" r="0.6" fill="rgba(0,0,0,0.3)" />
      <Circle cx="44" cy="11" r="0.6" fill="rgba(0,0,0,0.3)" />
      <Circle cx="13" cy="17" r="0.5" fill="rgba(0,0,0,0.25)" />
      <Circle cx="23" cy="18" r="0.5" fill="rgba(0,0,0,0.25)" />
      <Circle cx="34" cy="18" r="0.5" fill="rgba(0,0,0,0.25)" />
      <Circle cx="44" cy="17" r="0.5" fill="rgba(0,0,0,0.25)" />
      <Path d="M16,11.5 Q28,9.5 40,11.5" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="2" strokeLinecap="round" />
    </>
  );
}

function Type4() {
  return (
    <>
      <Defs>
        <RadialGradient id="g4" cx="50%" cy="28%" r="65%">
          <Stop offset="0%" stopColor="#c49050" />
          <Stop offset="100%" stopColor="#6b3d18" />
        </RadialGradient>
      </Defs>
      <Ellipse cx="28" cy="25" rx="16" ry="1" fill="rgba(0,0,0,0.2)" />
      <Path d="M7,17 Q10,12 16,10 Q22,9 28,9 Q34,9 40,10 Q46,12 49,17 Q46,22 40,23 Q34,24 28,24 Q22,24 16,23 Q10,22 7,17 Z" fill="url(#g4)" />
      <Circle cx="16" cy="13"   r="0.6" fill="rgba(0,0,0,0.22)" />
      <Circle cx="23" cy="10.5" r="0.6" fill="rgba(0,0,0,0.2)" />
      <Circle cx="33" cy="10.5" r="0.6" fill="rgba(0,0,0,0.2)" />
      <Circle cx="40" cy="13"   r="0.6" fill="rgba(0,0,0,0.2)" />
      <Circle cx="20" cy="22"   r="0.5" fill="rgba(0,0,0,0.18)" />
      <Circle cx="28" cy="23"   r="0.5" fill="rgba(0,0,0,0.18)" />
      <Circle cx="36" cy="22"   r="0.5" fill="rgba(0,0,0,0.18)" />
      <Path d="M16,11.5 Q28,9.5 40,11.5" fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth="2" strokeLinecap="round" />
    </>
  );
}

function Type5() {
  return (
    <>
      <Defs>
        <RadialGradient id="g5" cx="38%" cy="32%" r="64%">
          <Stop offset="0%" stopColor="#d9901e" />
          <Stop offset="100%" stopColor="#7a4a09" />
        </RadialGradient>
      </Defs>
      <Ellipse cx="6"  cy="28"   rx="5"   ry="0.7" fill="rgba(0,0,0,0.22)" />
      <Ellipse cx="19" cy="27"   rx="6"   ry="0.7" fill="rgba(0,0,0,0.2)" />
      <Ellipse cx="33" cy="28"   rx="5"   ry="0.7" fill="rgba(0,0,0,0.2)" />
      <Ellipse cx="45" cy="24.5" rx="4"   ry="0.6" fill="rgba(0,0,0,0.18)" />
      <Ellipse cx="53" cy="27"   rx="2.5" ry="0.5" fill="rgba(0,0,0,0.15)" />
      <Path d="M1,26 Q0,24.5 1,23 Q3,21.5 5,22 Q7,21 9,22.5 Q10,21.5 11,23.5 Q11,26 8,27.5 Q5,28 2,27 Z"             fill="url(#g5)" />
      <Path d="M13,24.5 Q12,22.5 14,21 Q17,19.5 20,20.5 Q22,19.5 24,21.5 Q25,23.5 23,25.5 Q20,27 17,26.5 Q13,26 13,24.5 Z" fill="url(#g5)" />
      <Path d="M27,26.5 Q26,24.5 27,23 Q29,21.5 32,22 Q35,21.5 36,23.5 Q37,25.5 35,27 Q32,28 29,27.5 Z"             fill="url(#g5)" />
      <Path d="M39,22 Q38,20 40,19 Q42,18 44,19 Q46,18.5 47,20.5 Q47,22.5 45,23.5 Q42,24 40,23 Z"                   fill="url(#g5)" />
      <Path d="M49,26 Q48,24.5 49.5,23.5 Q51.5,23 53,24 Q54,23.5 54,25 Q54,26.5 52,27 Q50,27.5 49,26 Z"             fill="url(#g5)" />
      <Circle cx="4"  cy="24"   r="0.55" fill="rgba(0,0,0,0.32)" />
      <Circle cx="7"  cy="26"   r="0.5"  fill="rgba(0,0,0,0.28)" />
      <Circle cx="16" cy="22"   r="0.55" fill="rgba(0,0,0,0.3)" />
      <Circle cx="21" cy="24.5" r="0.5"  fill="rgba(0,0,0,0.28)" />
      <Circle cx="30" cy="23.5" r="0.5"  fill="rgba(0,0,0,0.28)" />
      <Circle cx="34" cy="25.5" r="0.5"  fill="rgba(0,0,0,0.25)" />
      <Circle cx="42" cy="20.5" r="0.5"  fill="rgba(0,0,0,0.25)" />
      <Circle cx="51" cy="25"   r="0.45" fill="rgba(0,0,0,0.22)" />
      <Circle cx="2"  cy="23"   r="1"   fill="rgba(255,255,255,0.18)" />
      <Circle cx="15" cy="21"   r="1.2" fill="rgba(255,255,255,0.18)" />
      <Circle cx="28" cy="23"   r="1"   fill="rgba(255,255,255,0.16)" />
      <Circle cx="40" cy="19.5" r="0.9" fill="rgba(255,255,255,0.16)" />
      <Circle cx="50" cy="24"   r="0.8" fill="rgba(255,255,255,0.14)" />
    </>
  );
}

function Type6() {
  return (
    <>
      <Defs>
        <RadialGradient id="g6" cx="50%" cy="50%" r="62%">
          <Stop offset="0%" stopColor="#b8903a" />
          <Stop offset="100%" stopColor="#6b4a18" />
        </RadialGradient>
      </Defs>
      <Path d="M4,27 Q3,25 4,22.5 Q5,20.5 8,19.5 Q11,18.5 14,19.5 Q17,18.5 19,20.5 Q21,22 20,25 Q19,27.5 14,28 Q8,28 4,27 Z" fill="url(#g6)" />
      <Path d="M17,27.5 Q16,25.5 18,23.5 Q20,22 24,21.5 Q28,21 32,22 Q35,21.5 37,23.5 Q38,25.5 36,27.5 Q32,29 26,28.5 Q20,28.5 17,27.5 Z" fill="url(#g6)" opacity="0.9" />
      <Path d="M34,26 Q33,24 35,22.5 Q38,21 42,21.5 Q46,22 49,23.5 Q51,25 50,27 Q47,28 42,27.5 Q37,27.5 34,26 Z" fill="url(#g6)" opacity="0.75" />
      <Path d="M6,19.5 Q5,18 7,17 Q10,16 13,17.5 Q15,18.5 13,20.5 Q10,21.5 7,20.5 Z" fill="url(#g6)" opacity="0.85" />
      <Path d="M28,21.5 Q27,19.5 30,18.5 Q33,18 35,19.5 Q36,21 34,22 Q31,22.5 28,21.5 Z" fill="url(#g6)" opacity="0.8" />
      <Path d="M19,25 Q20,23.5 22,23.5 Q24,23.5 25,25 Q24,26.5 22,26.5 Q20,26.5 19,25 Z" fill="url(#g6)" opacity="0.55" />
      <Path d="M9,21  Q10,23.5 9,27"  fill="none" stroke="rgba(0,0,0,0.2)"  strokeWidth="0.8" strokeLinecap="round" />
      <Path d="M16,20 Q17,23 16,27.5" fill="none" stroke="rgba(0,0,0,0.18)" strokeWidth="0.8" strokeLinecap="round" />
      <Path d="M27,22 Q28,25 27,28.5" fill="none" stroke="rgba(0,0,0,0.18)" strokeWidth="0.8" strokeLinecap="round" />
      <Path d="M40,22.5 Q41,24.5 40,27" fill="none" stroke="rgba(0,0,0,0.15)" strokeWidth="0.8" strokeLinecap="round" />
      <Circle cx="8"  cy="22"   r="0.5"  fill="rgba(0,0,0,0.26)" />
      <Circle cx="13" cy="20"   r="0.5"  fill="rgba(0,0,0,0.24)" />
      <Circle cx="24" cy="23"   r="0.5"  fill="rgba(0,0,0,0.24)" />
      <Circle cx="32" cy="22.5" r="0.5"  fill="rgba(0,0,0,0.22)" />
      <Circle cx="43" cy="23.5" r="0.5"  fill="rgba(0,0,0,0.2)" />
      <Circle cx="11" cy="26"   r="0.45" fill="rgba(0,0,0,0.2)" />
      <Circle cx="29" cy="27"   r="0.45" fill="rgba(0,0,0,0.18)" />
      <Circle cx="45" cy="26"   r="0.45" fill="rgba(0,0,0,0.16)" />
      <Path d="M2,22 Q1,20.5 3,20 Q5,20 5.5,21.5 Q5,23 3,22.5 Z"         fill="#8a6020" opacity="0.6" />
      <Path d="M50,21.5 Q49,20 51.5,19.5 Q54,20 54,21.5 Q53,23 50,21.5 Z" fill="#8a6020" opacity="0.5" />
      <Circle cx="47" cy="27.5" r="1.3" fill="#8a6020" opacity="0.42" />
    </>
  );
}

function Type7() {
  return (
    <>
      <Defs>
        <RadialGradient id="g7" cx="45%" cy="55%" r="60%">
          <Stop offset="0%" stopColor="#a8883a" />
          <Stop offset="100%" stopColor="#5a3e10" />
        </RadialGradient>
      </Defs>
      <Path
        d="M3,25 Q1,23 3,22 Q5,20 8,21 Q10,19 13,20 Q15,18 18,20 Q20,18 23,20 Q25,18 28,20 Q30,18 33,20 Q35,19 38,20 Q40,19 43,21 Q46,20 49,21 Q52,22 54,24 Q53,26 49,26 Q43,27 36,27 Q28,28 21,27 Q14,27 8,26 Q4,26 3,25 Z"
        fill="url(#g7)" opacity="0.95"
      />
      <Ellipse cx="27" cy="23.5" rx="17" ry="2"   fill="none" stroke="#7a5820" strokeWidth="0.9" opacity="0.45" />
      <Ellipse cx="27" cy="21.8" rx="10" ry="1.3" fill="none" stroke="#7a5820" strokeWidth="0.7" opacity="0.28" />
      <Ellipse cx="27" cy="20.5" rx="5"  ry="0.8" fill="none" stroke="#7a5820" strokeWidth="0.5" opacity="0.16" />
      <Ellipse cx="19" cy="23.5" rx="6" ry="1.2" fill="rgba(255,255,255,0.09)" rotation={-6} originX={19} originY={23.5} />
      <Path d="M5,21  Q4,19.5 5.5,19 Q7,18.5 7.5,20 Q7,21.5 5,21 Z"      fill="#7a5820" opacity="0.6" />
      <Path d="M49,22 Q48,20.5 50,20 Q52,19.5 52,21 Q51.5,22.5 49,22 Z"  fill="#7a5820" opacity="0.5" />
      <Path d="M27,19 Q26,18 27.5,17.5 Q29,17 29,18.5 Q28.5,19.5 27,19 Z" fill="#7a5820" opacity="0.45" />
      <Circle cx="15" cy="20" r="1"   fill="#7a5820" opacity="0.4" />
      <Circle cx="40" cy="21" r="0.9" fill="#7a5820" opacity="0.38" />
      <Circle cx="9"  cy="24" r="0.7" fill="#7a5820" opacity="0.35" />
      <Circle cx="47" cy="25" r="0.6" fill="#7a5820" opacity="0.3" />
    </>
  );
}

const ILLUSTRATIONS: Record<BristolTypeNumber, () => ReactElement> = {
  1: Type1,
  2: Type2,
  3: Type3,
  4: Type4,
  5: Type5,
  6: Type6,
  7: Type7,
};

export default memo(function BristolIllustration({ type, width = 56, height = 28 }: Props) {
  const Content = ILLUSTRATIONS[type];
  return (
    <Svg width={width} height={height} viewBox="0 0 56 28">
      <Content />
    </Svg>
  );
});
