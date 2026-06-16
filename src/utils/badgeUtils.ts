// Badge keys — one string per earnable badge
export type BadgeKey =
  // shirts — log milestones
  | 'shirt_plain'
  | 'shirt_ringer'
  | 'shirt_collared'
  | 'shirt_striped'
  | 'shirt_suit'
  | 'shirt_tuxedo'
  | 'shirt_bathrobe'
  | 'shirt_batman_suit'
  // accessories — streaks
  | 'acc_spectacles_round'
  | 'acc_spectacles_oval'
  | 'acc_spectacles_tinted'
  | 'acc_monocle'
  // accessories — poke (poker)
  | 'acc_brooch_1'
  | 'acc_brooch_2'
  | 'acc_brooch_3'
  | 'acc_sheriff'
  // accessories — poke (survived)
  | 'acc_shield_1'
  | 'acc_shield_2'
  | 'acc_shield_3'
  | 'acc_shield_4'
  // accessories — milestone 300
  | 'acc_cucumber'
  // headdresses — streaks
  | 'hd_batman'
  | 'hd_headband'
  | 'hd_helmet'
  // headdresses — beanies (comebacks)
  | 'hd_beanie_1'
  | 'hd_beanie_2'
  | 'hd_beanie_3'
  // headdresses — party hats (friends)
  | 'hd_party_1'
  | 'hd_party_2'
  | 'hd_party_3'
  | 'hd_party_4'
  // headdresses — trophies (leaderboard)
  | 'hd_trophy_bronze'
  | 'hd_trophy_silver'
  | 'hd_trophy_gold'
  | 'hd_trophy_platinum'
  // headdresses — milestones
  | 'hd_tp_crown'
  // headdresses — free basics
  | 'hd_flower'
  | 'hd_bow'
  | 'hd_striped_beanie'
  | 'hd_tophat'
  | 'hd_partyhat'
  | 'hd_crown';

// Which avatar slot each badge maps to
export type BadgeSlot = 'headdress' | 'shirt' | 'accessory';

export interface BadgeMeta {
  key: BadgeKey;
  slot: BadgeSlot;
  label: string;
}

export const BADGE_META: Record<BadgeKey, BadgeMeta> = {
  shirt_plain:            { key: 'shirt_plain',            slot: 'shirt',     label: 'Plain white tee' },
  shirt_ringer:           { key: 'shirt_ringer',           slot: 'shirt',     label: 'Ringer tee' },
  shirt_collared:         { key: 'shirt_collared',         slot: 'shirt',     label: 'Collared shirt' },
  shirt_striped:          { key: 'shirt_striped',          slot: 'shirt',     label: 'Striped shirt' },
  shirt_suit:             { key: 'shirt_suit',             slot: 'shirt',     label: 'Suit jacket' },
  shirt_tuxedo:           { key: 'shirt_tuxedo',           slot: 'shirt',     label: 'Tuxedo' },
  shirt_bathrobe:         { key: 'shirt_bathrobe',         slot: 'shirt',     label: 'Bath robe' },
  shirt_batman_suit:      { key: 'shirt_batman_suit',      slot: 'shirt',     label: 'Batman suit' },
  acc_spectacles_round:   { key: 'acc_spectacles_round',   slot: 'accessory', label: 'Round spectacles' },
  acc_spectacles_oval:    { key: 'acc_spectacles_oval',    slot: 'accessory', label: 'Oval spectacles' },
  acc_spectacles_tinted:  { key: 'acc_spectacles_tinted',  slot: 'accessory', label: 'Tinted spectacles' },
  acc_monocle:            { key: 'acc_monocle',            slot: 'accessory', label: 'Monocle' },
  acc_brooch_1:           { key: 'acc_brooch_1',           slot: 'accessory', label: 'Silver brooch' },
  acc_brooch_2:           { key: 'acc_brooch_2',           slot: 'accessory', label: 'Silver & blue brooch' },
  acc_brooch_3:           { key: 'acc_brooch_3',           slot: 'accessory', label: 'Gold & red brooch' },
  acc_sheriff:            { key: 'acc_sheriff',            slot: 'accessory', label: 'Sheriff badge' },
  acc_shield_1:           { key: 'acc_shield_1',           slot: 'accessory', label: 'Shield pin I' },
  acc_shield_2:           { key: 'acc_shield_2',           slot: 'accessory', label: 'Shield pin II' },
  acc_shield_3:           { key: 'acc_shield_3',           slot: 'accessory', label: 'Shield pin III' },
  acc_shield_4:           { key: 'acc_shield_4',           slot: 'accessory', label: 'Shield pin IV' },
  acc_cucumber:           { key: 'acc_cucumber',           slot: 'accessory', label: 'Cucumber slices' },
  hd_batman:              { key: 'hd_batman',              slot: 'headdress', label: 'Batman mask' },
  hd_headband:            { key: 'hd_headband',            slot: 'headdress', label: 'Headband' },
  hd_helmet:              { key: 'hd_helmet',              slot: 'headdress', label: 'Military helmet' },
  hd_beanie_1:            { key: 'hd_beanie_1',            slot: 'headdress', label: 'Orange beanie' },
  hd_beanie_2:            { key: 'hd_beanie_2',            slot: 'headdress', label: 'Orange beanie (worn)' },
  hd_beanie_3:            { key: 'hd_beanie_3',            slot: 'headdress', label: 'Orange beanie (battered)' },
  hd_party_1:             { key: 'hd_party_1',             slot: 'headdress', label: 'Party hat I' },
  hd_party_2:             { key: 'hd_party_2',             slot: 'headdress', label: 'Party hat II' },
  hd_party_3:             { key: 'hd_party_3',             slot: 'headdress', label: 'Party hat III' },
  hd_party_4:             { key: 'hd_party_4',             slot: 'headdress', label: 'Party hat IV' },
  hd_trophy_bronze:       { key: 'hd_trophy_bronze',       slot: 'headdress', label: 'Trophy (bronze)' },
  hd_trophy_silver:       { key: 'hd_trophy_silver',       slot: 'headdress', label: 'Trophy (silver)' },
  hd_trophy_gold:         { key: 'hd_trophy_gold',         slot: 'headdress', label: 'Trophy (gold)' },
  hd_trophy_platinum:     { key: 'hd_trophy_platinum',     slot: 'headdress', label: 'Trophy (platinum)' },
  hd_tp_crown:            { key: 'hd_tp_crown',            slot: 'headdress', label: 'TP crown' },
  hd_flower:              { key: 'hd_flower',              slot: 'headdress', label: 'Flower' },
  hd_bow:                 { key: 'hd_bow',                 slot: 'headdress', label: 'Bow' },
  hd_striped_beanie:      { key: 'hd_striped_beanie',      slot: 'headdress', label: 'Striped beanie' },
  hd_tophat:              { key: 'hd_tophat',              slot: 'headdress', label: 'Top hat' },
  hd_partyhat:            { key: 'hd_partyhat',            slot: 'headdress', label: 'Party hat' },
  hd_crown:               { key: 'hd_crown',               slot: 'headdress', label: 'Crown' },
};

// ── Item bounds — SVG coordinate extents per badge key ───────────────────────

export interface ItemBounds {
  xMin: number; xMax: number;
  yMin: number; yMax: number;
}

export const ITEM_BOUNDS: Record<BadgeKey, ItemBounds> = {
  // shirts
  shirt_plain:            { xMin: 8,  xMax: 24, yMin: 24, yMax: 31 },
  shirt_ringer:           { xMin: 8,  xMax: 24, yMin: 24, yMax: 31 },
  shirt_collared:         { xMin: 8,  xMax: 24, yMin: 24, yMax: 31 },
  shirt_striped:          { xMin: 8,  xMax: 24, yMin: 24, yMax: 31 },
  shirt_suit:             { xMin: 8,  xMax: 24, yMin: 24, yMax: 31 },
  shirt_tuxedo:           { xMin: 8,  xMax: 24, yMin: 23, yMax: 31 },
  shirt_bathrobe:         { xMin: 8,  xMax: 24, yMin: 23, yMax: 31 },
  shirt_batman_suit:      { xMin: 8,  xMax: 24, yMin: 22, yMax: 31 },
  // accessories — spectacles
  acc_spectacles_round:   { xMin: 8,  xMax: 24, yMin: 12, yMax: 15 },
  acc_spectacles_oval:    { xMin: 7,  xMax: 25, yMin: 12, yMax: 15 },
  acc_spectacles_tinted:  { xMin: 8,  xMax: 24, yMin: 12, yMax: 15 },
  acc_monocle:            { xMin: 19, xMax: 26, yMin: 12, yMax: 18 },
  // accessories — brooches
  acc_brooch_1:           { xMin: 13, xMax: 16, yMin: 27, yMax: 29 },
  acc_brooch_2:           { xMin: 13, xMax: 16, yMin: 27, yMax: 29 },
  acc_brooch_3:           { xMin: 13, xMax: 16, yMin: 27, yMax: 29 },
  acc_sheriff:            { xMin: 13, xMax: 19, yMin: 24, yMax: 28 },
  // accessories — shields
  acc_shield_1:           { xMin: 10, xMax: 13, yMin: 26, yMax: 29 },
  acc_shield_2:           { xMin: 10, xMax: 14, yMin: 25, yMax: 29 },
  acc_shield_3:           { xMin: 9,  xMax: 14, yMin: 25, yMax: 29 },
  acc_shield_4:           { xMin: 9,  xMax: 14, yMin: 24, yMax: 29 },
  // accessories — other
  acc_cucumber:           { xMin: 9,  xMax: 23, yMin: 8,  yMax: 13 },
  // headdresses
  hd_batman:              { xMin: 5,  xMax: 27, yMin: 0,  yMax: 22 },
  hd_headband:            { xMin: 4,  xMax: 27, yMin: 5,  yMax: 9  },
  hd_helmet:              { xMin: 3,  xMax: 29, yMin: 0,  yMax: 9  },
  hd_beanie_1:            { xMin: 10, xMax: 22, yMin: -1, yMax: 4  },
  hd_beanie_2:            { xMin: 10, xMax: 22, yMin: -1, yMax: 4  },
  hd_beanie_3:            { xMin: 10, xMax: 22, yMin: -1, yMax: 4  },
  hd_party_1:             { xMin: 12, xMax: 20, yMin: 0,  yMax: 4  },
  hd_party_2:             { xMin: 11, xMax: 21, yMin: 0,  yMax: 5  },
  hd_party_3:             { xMin: 11, xMax: 21, yMin: 0,  yMax: 5  },
  hd_party_4:             { xMin: 11, xMax: 21, yMin: 0,  yMax: 5  },
  hd_trophy_bronze:       { xMin: 11, xMax: 21, yMin: -2, yMax: 4  },
  hd_trophy_silver:       { xMin: 11, xMax: 21, yMin: -2, yMax: 4  },
  hd_trophy_gold:         { xMin: 11, xMax: 21, yMin: -2, yMax: 4  },
  hd_trophy_platinum:     { xMin: 11, xMax: 21, yMin: -2, yMax: 4  },
  hd_tp_crown:            { xMin: 11, xMax: 24, yMin: -2, yMax: 7  },
  hd_flower:              { xMin: 13, xMax: 19, yMin:  1, yMax: 5  },
  hd_bow:                 { xMin:  7, xMax: 25, yMin:  0, yMax: 6  },
  hd_striped_beanie:      { xMin:  8, xMax: 24, yMin:  0, yMax: 7  },
  hd_tophat:              { xMin:  7, xMax: 25, yMin:  0, yMax: 6  },
  hd_partyhat:            { xMin: 12, xMax: 20, yMin:  0, yMax: 5  },
  hd_crown:               { xMin: 10, xMax: 22, yMin:  0, yMax: 4  },
};

export function centredViewBox(key: BadgeKey, span = 16): string {
  const b = ITEM_BOUNDS[key];
  const itemW = b.xMax - b.xMin;
  const itemH = b.yMax - b.yMin;
  const vbSize = Math.max(span, Math.max(itemW, itemH) + 2);
  const xCentre = (b.xMin + b.xMax) / 2;
  const yCentre = (b.yMin + b.yMax) / 2;
  return `${xCentre - vbSize / 2} ${yCentre - vbSize / 2} ${vbSize} ${vbSize}`;
}

// ── Evaluation helpers ────────────────────────────────────────────────────────

export interface BadgeEvalContext {
  totalLogs: number;
  currentStreak: number;         // consecutive days
  nightOwlCount: number;         // logs between 12am–4am (all time)
  mondayStreakWeeks: number;     // consecutive Mondays logged
  consistentCarlDays: number;    // consecutive days within ±30min same time
  gapDays: number | null;        // gap in days before most recent log (null = no gap)
  friendCount: number;
  pokesSent: number;
  pokesReceived: number;
  bristolIdealStreak: number;    // consecutive logs Bristol 3–4
  leaderboard: {
    topDay: boolean;
    topWeek: boolean;
    topMonth: boolean;
    topYear: boolean;
  };
}

// Returns the set of badge keys the user should now have based on context.
// Call this on log save / app open / poke events; diff against existing badges[]
// to find newly earned ones.
export function evaluateBadges(ctx: BadgeEvalContext): BadgeKey[] {
  const earned: BadgeKey[] = [];

  // Shirt milestones
  if (ctx.totalLogs >= 1)   earned.push('shirt_plain');
  if (ctx.totalLogs >= 10)  earned.push('shirt_ringer');
  if (ctx.totalLogs >= 25)  earned.push('shirt_collared');
  if (ctx.totalLogs >= 50)  earned.push('shirt_striped');
  if (ctx.totalLogs >= 75)  earned.push('shirt_suit');
  if (ctx.totalLogs >= 100) earned.push('shirt_tuxedo');
  if (ctx.totalLogs >= 200) earned.push('shirt_bathrobe');
  if (ctx.totalLogs >= 300) earned.push('acc_cucumber');
  if (ctx.totalLogs >= 500) earned.push('hd_tp_crown');

  // Night owl
  if (ctx.nightOwlCount >= 1) earned.push('hd_batman');
  if (ctx.nightOwlCount >= 3) earned.push('shirt_batman_suit');

  // Streaks — spectacles
  if (ctx.currentStreak >= 7)   earned.push('acc_spectacles_round');
  if (ctx.currentStreak >= 30)  earned.push('acc_spectacles_oval');
  if (ctx.currentStreak >= 100) earned.push('acc_spectacles_tinted');
  if (ctx.currentStreak >= 365) earned.push('acc_monocle');

  // Monday warrior
  if (ctx.mondayStreakWeeks >= 7) earned.push('hd_headband');

  // Consistent Carl
  if (ctx.consistentCarlDays >= 7) earned.push('hd_helmet');

  // Comebacks
  if (ctx.gapDays !== null && ctx.gapDays >= 3)  earned.push('hd_beanie_1');
  if (ctx.gapDays !== null && ctx.gapDays >= 7)  earned.push('hd_beanie_2');
  if (ctx.gapDays !== null && ctx.gapDays >= 30) earned.push('hd_beanie_3');

  // Free headdresses — always unlocked
  earned.push('hd_flower', 'hd_bow', 'hd_striped_beanie', 'hd_tophat');

  // Friends
  if (ctx.friendCount >= 1)  earned.push('hd_party_1', 'hd_partyhat');
  if (ctx.friendCount >= 5)  earned.push('hd_party_2');
  if (ctx.friendCount >= 10) earned.push('hd_party_3');
  if (ctx.friendCount >= 25) earned.push('hd_party_4');

  // Leaderboard
  if (ctx.leaderboard.topDay)   earned.push('hd_trophy_bronze');
  if (ctx.leaderboard.topWeek)  earned.push('hd_trophy_silver');
  if (ctx.leaderboard.topMonth) earned.push('hd_trophy_gold');
  if (ctx.leaderboard.topYear)  earned.push('hd_trophy_platinum');
  if (ctx.leaderboard.topDay || ctx.leaderboard.topWeek || ctx.leaderboard.topMonth || ctx.leaderboard.topYear) {
    earned.push('hd_crown');
  }

  // Poker
  if (ctx.pokesSent >= 1)   earned.push('acc_brooch_1');
  if (ctx.pokesSent >= 5)   earned.push('acc_brooch_2');
  if (ctx.pokesSent >= 25)  earned.push('acc_brooch_3');
  if (ctx.pokesSent >= 100) earned.push('acc_sheriff');

  // Survived pokes
  if (ctx.pokesReceived >= 1)   earned.push('acc_shield_1');
  if (ctx.pokesReceived >= 5)   earned.push('acc_shield_2');
  if (ctx.pokesReceived >= 25)  earned.push('acc_shield_3');
  if (ctx.pokesReceived >= 100) earned.push('acc_shield_4');

  return earned;
}

// Returns newly earned keys (in earned but not in existing).
export function newBadges(existing: BadgeKey[], earned: BadgeKey[]): BadgeKey[] {
  const set = new Set(existing);
  return earned.filter(k => !set.has(k));
}
