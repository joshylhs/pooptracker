import Svg, { Rect } from 'react-native-svg';

// Grid: 9 cols × 10 rows, each pixel = 3pt → 27×30pt rendered
// Rows 0-1: sash, rows 2-9: coin

const P = 3;
const COLS = 9;
const ROWS = 10;

type Pixel = [number, number, string];

const SASH    = '#CC2222';
const SASH_DK = '#991111';

// 3×5 pixel font digits, drawn relative to top-left of a 3-wide, 5-tall cell
// Origin passed in as (ox, oy) within the 9×10 grid
function digit(n: 1 | 2 | 3, ox: number, oy: number, colour: string): Pixel[] {
  // Each digit is a 3×5 bitmap (col 0-2, row 0-4)
  const bitmaps: Record<number, [number, number][]> = {
    1: [        [1,0],
                [0,1],[1,1],
                     [1,2],
                     [1,3],
                [0,4],[1,4],[2,4]],
    2: [[0,0],[1,0],[2,0],
                    [2,1],
         [0,2],[1,2],[2,2],
         [0,3],
         [0,4],[1,4],[2,4]],
    3: [[0,0],[1,0],[2,0],
                    [2,1],
              [1,2],[2,2],
                    [2,3],
         [0,4],[1,4],[2,4]],
  };
  return bitmaps[n].map(([c, r]) => [ox + c, oy + r, colour]);
}

function medal(coinLight: string, coinMid: string, coinDark: string, highlight: string, digitColour: string): Pixel[] {
  return [
    // sash (cols 3-5, rows 0-1)
    [3,0,SASH],[4,0,SASH],[5,0,SASH],
    [3,1,SASH_DK],[4,1,SASH],[5,1,SASH_DK],

    // coin outline (rows 2-9)
    [2,2,coinMid],[3,2,coinMid],[4,2,coinMid],[5,2,coinMid],[6,2,coinMid],
    [1,3,coinMid],[2,3,coinLight],[3,3,coinLight],[4,3,coinLight],[5,3,coinLight],[6,3,coinLight],[7,3,coinMid],
    [1,4,coinMid],[2,4,coinLight],[3,4,coinLight],[4,4,coinLight],[5,4,coinLight],[6,4,coinLight],[7,4,coinMid],
    [1,5,coinMid],[2,5,coinLight],[3,5,coinLight],[4,5,coinLight],[5,5,coinLight],[6,5,coinLight],[7,5,coinMid],
    [1,6,coinMid],[2,6,coinLight],[3,6,coinLight],[4,6,coinLight],[5,6,coinLight],[6,6,coinLight],[7,6,coinMid],
    [1,7,coinMid],[2,7,coinLight],[3,7,coinLight],[4,7,coinLight],[5,7,coinLight],[6,7,coinLight],[7,7,coinMid],
    [2,8,coinMid],[3,8,coinMid],[4,8,coinMid],[5,8,coinMid],[6,8,coinMid],

  ];
}

// digit centred at col 3, row 3 (3×5 fits cols 3-5, rows 3-7)
const GOLD_BASE   = medal('#FFD84D','#F5C518','#C8960A','#FFE87A','');
const SILVER_BASE = medal('#DCDCDC','#B0B0B0','#888888','#EFEFEF','');
const BRONZE_BASE = medal('#E0984A','#CD7F32','#7A4A10','#F0B46A','');

const GOLD:   Pixel[] = [...GOLD_BASE,   ...digit(1, 3, 3, '#9A7000')];
const SILVER: Pixel[] = [...SILVER_BASE, ...digit(2, 3, 3, '#666666')];
const BRONZE: Pixel[] = [...BRONZE_BASE, ...digit(3, 3, 3, '#7A4A10')];

function PixelMedal({ pixels }: { pixels: Pixel[] }) {
  return (
    <Svg width={COLS * P} height={ROWS * P}>
      {pixels.map(([col, row, colour], i) => (
        <Rect key={i} x={col * P} y={row * P} width={P} height={P} fill={colour} />
      ))}
    </Svg>
  );
}

export default function MedalIcon({ rank }: { rank: number }) {
  if (rank === 1) return <PixelMedal pixels={GOLD} />;
  if (rank === 2) return <PixelMedal pixels={SILVER} />;
  if (rank === 3) return <PixelMedal pixels={BRONZE} />;
  return null;
}
