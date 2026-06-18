import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  Alert, Animated, Pressable, ScrollView, StyleSheet, View, NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import Svg, { Rect as SvgRect } from 'react-native-svg';
import MCI from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../hooks/useTheme';
import AppText from '../shared/Text';
import Button from '../shared/Button';
import CatAvatar, { BODY_COLORS, WALL_COLORS, BodyColor, WallColor } from './CatAvatar';
import CatEyes, { EYE_COLORS, EYE_SECONDARY_COLORS, EyeColor, EyeSecondary, EyeStyle } from './CatEyes';
import CatBody from './CatBody';
import CatBlush, { CheekStyle } from './CatBlush';
import CatHeaddress, { HeaddressStyle } from './CatHeaddress';
import CatShirt, { ShirtStyle } from './CatShirt';
import CatAccessory, { AccessoryStyle } from './CatAccessory';
import { BadgeKey, BADGE_META, centredViewBox } from '../../utils/badgeUtils';

export interface AvatarConfig {
  bodyColor:    BodyColor;
  snoutColor:   BodyColor;
  eyeStyle:     EyeStyle;
  eyePrimary:   EyeColor;
  eyeSecondary: EyeSecondary;
  cheekStyle:   CheekStyle;
  headdress:    HeaddressStyle;
  wallColor:    WallColor;
  shirt:        ShirtStyle;
  accessory:    AccessoryStyle;
}

const CHEEK_STYLES: CheekStyle[] = ['blush', 'freckles', 'none'];

interface Props {
  initial: AvatarConfig;
  ctaLabel?: string;
  onConfirm: (config: AvatarConfig) => void;
  onChange?: (config: AvatarConfig) => void;
  loading?: boolean;
  headerBorderRadius?: number;
  earnedBadges?: Set<BadgeKey>;
  bottomPadding?: number;
}

const BODY_COLOR_KEYS:  BodyColor[]      = Object.keys(BODY_COLORS) as BodyColor[];
const WALL_COLOR_KEYS:  WallColor[]      = Object.keys(WALL_COLORS) as WallColor[];
const EYE_STYLES:       EyeStyle[]       = ['round', 'button'];
const EYE_PRIMARIES:    EyeColor[]       = Object.keys(EYE_COLORS) as EyeColor[];
const EYE_SECONDARIES:  EyeSecondary[]   = Object.keys(EYE_SECONDARY_COLORS) as EyeSecondary[];

// All badge keys per slot, in display order (unlocked-first sorting done at render time)
const HD_BADGE_KEYS: BadgeKey[] = [
  'hd_flower', 'hd_bow', 'hd_striped_beanie', 'hd_tophat', 'hd_partyhat', 'hd_crown',
  'hd_batman', 'hd_headband', 'hd_helmet',
  'hd_beanie_1', 'hd_beanie_2', 'hd_beanie_3',
  'hd_party_1', 'hd_party_2', 'hd_party_3', 'hd_party_4',
  'hd_trophy_bronze', 'hd_trophy_silver', 'hd_trophy_gold', 'hd_trophy_platinum',
  'hd_tp_crown',
];

const SHIRT_BADGE_KEYS: BadgeKey[] = [
  'shirt_plain', 'shirt_ringer', 'shirt_collared', 'shirt_striped',
  'shirt_suit', 'shirt_tuxedo', 'shirt_bathrobe', 'shirt_batman_suit',
];

const ACC_BADGE_KEYS: BadgeKey[] = [
  'acc_spectacles_round', 'acc_spectacles_oval', 'acc_spectacles_tinted', 'acc_monocle',
  'acc_brooch_1', 'acc_brooch_2', 'acc_brooch_3', 'acc_sheriff',
  'acc_shield_1', 'acc_shield_2', 'acc_shield_3', 'acc_shield_4',
  'acc_cucumber',
];

const BADGE_HINTS: Record<BadgeKey, string> = {
  hd_flower:            'Free',
  hd_bow:               'Free',
  hd_striped_beanie:    'Free',
  hd_tophat:            'Free',
  hd_partyhat:          'Add 1 friend',
  hd_crown:             'Finish #1 on any leaderboard',
  shirt_plain:          'Log once',
  shirt_ringer:         'Log 10 times',
  shirt_collared:       'Log 25 times',
  shirt_striped:        'Log 50 times',
  shirt_suit:           'Log 75 times',
  shirt_tuxedo:         'Log 100 times',
  shirt_bathrobe:       'Log 200 times',
  shirt_batman_suit:    '3 logs between 12am–4am',
  acc_spectacles_round: '7 day streak',
  acc_spectacles_oval:  '30 day streak',
  acc_spectacles_tinted:'100 day streak',
  acc_monocle:          '365 day streak',
  acc_cucumber:         'Log 300 times',
  acc_brooch_1:         'Poke a friend',
  acc_brooch_2:         'Poke 5 times',
  acc_brooch_3:         'Poke 25 times',
  acc_sheriff:          'Poke 100 times',
  acc_shield_1:         'Be poked once',
  acc_shield_2:         'Be poked 5 times',
  acc_shield_3:         'Be poked 25 times',
  acc_shield_4:         'Be poked 100 times',
  hd_batman:            '1 log between 12am–4am',
  hd_headband:          'Log every Monday for 7 weeks',
  hd_helmet:            'Log within ±30min same time for 7 days',
  hd_beanie_1:          'Return after 3–6 day gap',
  hd_beanie_2:          'Return after 7–29 day gap',
  hd_beanie_3:          'Return after 30+ day gap',
  hd_party_1:           'Add 1 friend',
  hd_party_2:           'Add 5 friends',
  hd_party_3:           'Add 10 friends',
  hd_party_4:           'Add 25 friends',
  hd_trophy_bronze:     'Finish #1 on daily leaderboard',
  hd_trophy_silver:     'Finish #1 on weekly leaderboard',
  hd_trophy_gold:       'Finish #1 on monthly leaderboard',
  hd_trophy_platinum:   'Finish #1 on yearly leaderboard',
  hd_tp_crown:          'Log 500 times',
};

const STYLE_OVERRIDES: Partial<Record<BadgeKey, string>> = {
  hd_striped_beanie: 'beanie',
};

function badgeKeyToStyle(key: BadgeKey): string {
  return STYLE_OVERRIDES[key] ?? key.replace(/^(hd_|shirt_|acc_)/, '');
}

const PREVIEW_W = 64;
const CHIP_SIZE = 52;

// ── Per-chip animated scale ───────────────────────────────────────────────────

function useChipScales(count: number, selectedIndex: number) {
  const scales = useRef(
    Array.from({ length: count }, () => new Animated.Value(1))
  ).current;

  useEffect(() => {
    scales.forEach((s, i) =>
      Animated.spring(s, {
        toValue: i === selectedIndex ? 1.18 : 1.0,
        useNativeDriver: true,
        damping: 16, stiffness: 220, mass: 0.7,
      }).start()
    );
  }, [selectedIndex]);

  return scales;
}

// ── Smart horizontal scroll row with chevrons + edge dimming ─────────────────

interface ScrollRowProps {
  children: React.ReactNode;
  colours: ReturnType<typeof useTheme>['colours'];
  itemHeight: number;
}

function ScrollRow({ children, colours, itemHeight }: ScrollRowProps) {
  const scrollRef  = useRef<ScrollView>(null);
  const [canLeft,  setCanLeft]  = useState(false);
  const [canRight, setCanRight] = useState(false);
  const contentW   = useRef(0);
  const visibleW   = useRef(0);
  const scrollX    = useRef(0);

  const update = useCallback(() => {
    const overflow = contentW.current - visibleW.current;
    setCanLeft(scrollX.current > 2);
    setCanRight(overflow > 2 && scrollX.current < overflow - 2);
  }, []);

  const onContentSizeChange = (w: number) => { contentW.current = w; update(); };
  const onLayout = (e: { nativeEvent: { layout: { width: number } } }) => {
    visibleW.current = e.nativeEvent.layout.width; update();
  };
  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollX.current = e.nativeEvent.contentOffset.x; update();
  };

  const nudge = (dir: 'left' | 'right') => {
    const next = scrollX.current + (dir === 'right' ? visibleW.current * 0.6 : -visibleW.current * 0.6);
    scrollRef.current?.scrollTo({ x: Math.max(0, next), animated: true });
  };

  const chevronColor = colours.primary400;

  return (
    <View style={styles.scrollRowOuter}>
      {canLeft && (
        <Pressable onPress={() => nudge('left')} style={[styles.edgeLeft, { height: itemHeight + 12 }]}
          hitSlop={4}>
          {({ pressed }) => (
            <View style={[styles.chevronCircle, pressed && styles.chevronCirclePressed]}>
              <MCI name="chevron-left" size={22} color={chevronColor} />
            </View>
          )}
        </Pressable>
      )}

      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipScroll}
        onContentSizeChange={onContentSizeChange}
        onLayout={onLayout}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        {children}
      </ScrollView>

      {canRight && (
        <Pressable onPress={() => nudge('right')} style={[styles.edgeRight, { height: itemHeight + 12 }]}
          hitSlop={4}>
          {({ pressed }) => (
            <View style={[styles.chevronCircle, pressed && styles.chevronCirclePressed]}>
              <MCI name="chevron-right" size={22} color={chevronColor} />
            </View>
          )}
        </Pressable>
      )}
    </View>
  );
}

// ── Main picker ───────────────────────────────────────────────────────────────

export default function AvatarPicker({ initial, ctaLabel, onConfirm, onChange, loading = false, headerBorderRadius = 28, earnedBadges, bottomPadding = 0 }: Props) {
  const { surface, colours } = useTheme();
  const [cfg, setCfg] = useState<AvatarConfig>(initial);

  const set = <K extends keyof AvatarConfig>(key: K, value: AvatarConfig[K]) =>
    setCfg(c => { const next = { ...c, [key]: value }; onChange?.(next); return next; });

  const cardStyle = { backgroundColor: surface.surface, borderColor: surface.border };
  const divStyle  = { backgroundColor: surface.border };

  const resolvedWall = cfg.wallColor === 'none' ? surface.surface : WALL_COLORS[cfg.wallColor];
  const [headerH, setHeaderH] = useState(0);

  const scrollHintOpacity = useRef(new Animated.Value(1)).current;
  const verticalScrollRef = useRef<ScrollView>(null);

  const onVerticalScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
    const distanceFromBottom = contentSize.height - layoutMeasurement.height - contentOffset.y;
    const atBottom = distanceFromBottom < 24;
    Animated.timing(scrollHintOpacity, {
      toValue: atBottom ? 0 : 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View style={styles.root}>
      {/* ── Scrollable trait sections ── */}
      <ScrollView
        ref={verticalScrollRef}
        contentContainerStyle={[styles.sectionsScroll, { paddingTop: headerH || 200, paddingBottom: bottomPadding }]}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled
        onScroll={onVerticalScroll}
        scrollEventThrottle={16}
        style={{ marginHorizontal: -20 }}
        scrollIndicatorInsets={{ right: 6 }}
        indicatorStyle="white"
      >
        <View style={[styles.sections, cardStyle]}>

          <TraitRow label="Body" divStyle={divStyle} first>
            <SwatchRow
              keys={BODY_COLOR_KEYS}
              selected={cfg.bodyColor}
              onSelect={k => set('bodyColor', k)}
              colorOf={k => BODY_COLORS[k]}
              surface={surface} colours={colours}
            />
          </TraitRow>

          <TraitRow label="Snout" divStyle={divStyle}>
            <SwatchRow
              keys={BODY_COLOR_KEYS}
              selected={cfg.snoutColor}
              onSelect={k => set('snoutColor', k)}
              colorOf={k => BODY_COLORS[k]}
              surface={surface} colours={colours}
            />
          </TraitRow>

          <TraitRow label="Background" divStyle={divStyle}>
            <SwatchRow
              keys={WALL_COLOR_KEYS}
              selected={cfg.wallColor}
              onSelect={k => set('wallColor', k)}
              colorOf={k => k === 'none' ? surface.background : WALL_COLORS[k]}
              bordered={k => k === 'none'}
              surface={surface} colours={colours}
            />
          </TraitRow>

          <TraitRow label="Eye shape" divStyle={divStyle}>
            <EyeStyleRow
              selected={cfg.eyeStyle}
              onSelect={s => set('eyeStyle', s)}
              eyePrimary={cfg.eyePrimary}
              eyeSecondary={cfg.eyeSecondary}
              surface={surface} colours={colours}
            />
          </TraitRow>

          <TraitRow label="Eye colour" divStyle={divStyle}>
            <SwatchRow
              keys={EYE_PRIMARIES}
              selected={cfg.eyePrimary}
              onSelect={k => set('eyePrimary', k)}
              colorOf={k => EYE_COLORS[k]}
              surface={surface} colours={colours}
            />
          </TraitRow>

          <TraitRow label="Eye highlight" divStyle={divStyle}>
            <SwatchRow
              keys={EYE_SECONDARIES}
              selected={cfg.eyeSecondary}
              onSelect={k => set('eyeSecondary', k)}
              colorOf={k => EYE_SECONDARY_COLORS[k]}
              surface={surface} colours={colours}
            />
          </TraitRow>

          <TraitRow label="Cheeks" divStyle={divStyle}>
            <CheekStyleRow
              selected={cfg.cheekStyle}
              onSelect={s => set('cheekStyle', s)}
              bodyColor={cfg.bodyColor}
              snoutColor={cfg.snoutColor}
              surface={surface} colours={colours}
            />
          </TraitRow>

          <TraitRow label="Headdress" divStyle={divStyle}>
            <BadgeItemRow
              badgeKeys={HD_BADGE_KEYS}
              selected={cfg.headdress}
              noneValue="none"
              onSelect={style => set('headdress', style as HeaddressStyle)}
              earnedBadges={earnedBadges}
              renderItem={(key) => <CatHeaddress style={badgeKeyToStyle(key) as HeaddressStyle} />}
              surface={surface} colours={colours}
            />
          </TraitRow>

          <TraitRow label="Shirt" divStyle={divStyle}>
            <BadgeItemRow
              badgeKeys={SHIRT_BADGE_KEYS}
              selected={cfg.shirt}
              noneValue="none"
              onSelect={style => set('shirt', style as ShirtStyle)}
              earnedBadges={earnedBadges}
              renderItem={(key) => <CatShirt style={badgeKeyToStyle(key) as ShirtStyle} bodyColor={BODY_COLORS[cfg.bodyColor]} />}
              surface={surface} colours={colours}
            />
          </TraitRow>

          <TraitRow label="Accessory" divStyle={divStyle}>
            <BadgeItemRow
              badgeKeys={ACC_BADGE_KEYS}
              selected={cfg.accessory}
              noneValue="none"
              onSelect={style => set('accessory', style as AccessoryStyle)}
              earnedBadges={earnedBadges}
              renderItem={(key) => <CatAccessory style={badgeKeyToStyle(key) as AccessoryStyle} />}
              surface={surface} colours={colours}
            />
          </TraitRow>

        </View>

        {ctaLabel
          ? <Button title={ctaLabel} icon="content-save" onPress={() => onConfirm(cfg)} loading={loading} />
          : null}
      </ScrollView>

      {/* ── Scroll-down hint ── */}
      <Animated.View style={[styles.scrollHint, { opacity: scrollHintOpacity }]}>
        <Pressable onPress={() => verticalScrollRef.current?.scrollToEnd({ animated: true })} style={styles.scrollHintCircle}>
          <MCI name="arrow-down" size={22} color="#fff" />
        </Pressable>
      </Animated.View>

      {/* ── Sticky header background ── */}
      {headerH > 0 && (
        <View style={[styles.stickyHeader, { height: headerH, borderRadius: headerBorderRadius, backgroundColor: surface.background }]} pointerEvents="none" />
      )}

      {/* Avatar card ── */}
      <View
        style={styles.avatarCardWrap}
        pointerEvents="none"
        onLayout={e => setHeaderH(e.nativeEvent.layout.height)}
      >
        <View style={[styles.previewCard, { backgroundColor: resolvedWall, borderColor: surface.border }]}>
          <CatAvatar
            bodyColor={cfg.bodyColor}
            snoutColor={cfg.snoutColor}
            eyes={cfg.eyeStyle}
            eyePrimary={cfg.eyePrimary}
            eyeSecondary={cfg.eyeSecondary}
            cheekStyle={cfg.cheekStyle}
            headdress={cfg.headdress}
            shirt={cfg.shirt}
            accessory={cfg.accessory}
            wallColor="none"
            size={128}
          />
        </View>
      </View>
    </View>
  );
}

// ── TraitRow ─────────────────────────────────────────────────────────────────

function TraitRow({ label, children, divStyle, first = false }: {
  label: string; children: React.ReactNode;
  divStyle: object; first?: boolean;
}) {
  return (
    <>
      {!first && <View style={[styles.divider, divStyle]} />}
      <View style={styles.traitRow}>
        <AppText variant="caption" colour="textSecondary" style={styles.traitLabel}>
          {label.toUpperCase()}
        </AppText>
        {children}
      </View>
    </>
  );
}

// ── SwatchRow ────────────────────────────────────────────────────────────────

function SwatchRow<T extends string>({
  keys, selected, onSelect, colorOf, bordered, surface, colours,
}: {
  keys: T[]; selected: T; onSelect: (k: T) => void;
  colorOf: (k: T) => string; bordered?: (k: T) => boolean;
  surface: ReturnType<typeof useTheme>['surface'];
  colours: ReturnType<typeof useTheme>['colours'];
}) {
  const selectedIndex = keys.indexOf(selected);
  const scales = useChipScales(keys.length, selectedIndex);

  return (
    <ScrollRow colours={colours} itemHeight={SWATCH_OUTER}>
      {keys.map((k, i) => {
        const isSel = k === selected;
        return (
          <Animated.View key={k} style={{ transform: [{ scale: scales[i] }] }}>
            <Pressable onPress={() => onSelect(k)} style={[
              styles.swatchOuter,
              isSel && { borderWidth: 2, borderColor: colours.primary400, borderRadius: SWATCH_OUTER / 2 },
            ]}>
              <View style={styles.swatchHalo}>
                <View style={[
                  styles.swatch,
                  { backgroundColor: colorOf(k) },
                  bordered?.(k) && { borderWidth: 1.5, borderColor: surface.border },
                ]} />
              </View>
            </Pressable>
          </Animated.View>
        );
      })}
    </ScrollRow>
  );
}

// ── EyeStyleRow ──────────────────────────────────────────────────────────────

const EYE_VB = '4 6 24 12';
const EYE_H  = Math.round(PREVIEW_W * 12 / 24);

function EyeStyleRow({
  selected, onSelect, eyePrimary, eyeSecondary, surface, colours,
}: {
  selected: EyeStyle; onSelect: (s: EyeStyle) => void;
  eyePrimary: EyeColor; eyeSecondary: EyeSecondary;
  surface: ReturnType<typeof useTheme>['surface'];
  colours: ReturnType<typeof useTheme>['colours'];
}) {
  const selectedIndex = EYE_STYLES.indexOf(selected);
  const scales = useChipScales(EYE_STYLES.length, selectedIndex);

  return (
    <ScrollRow colours={colours} itemHeight={EYE_H + 28}>
      {EYE_STYLES.map((s, i) => {
        const isSel = s === selected;
        return (
          <View key={s} style={styles.previewChipOuter}>
            <Pressable
              onPress={() => onSelect(s)}
              style={[styles.previewChip, {
                backgroundColor: surface.surface,
                borderColor: isSel ? colours.primary400 : surface.border,
                borderWidth: 2,
              }]}
            >
              <Animated.View style={{ transform: [{ scale: scales[i] }] }}>
                <Svg width={PREVIEW_W} height={EYE_H} viewBox={EYE_VB}>
                  <SvgRect x={4} y={6} width={24} height={12} fill={surface.surface} />
                  <CatEyes style={s} primaryColor={eyePrimary} secondaryColor={eyeSecondary} />
                </Svg>
              </Animated.View>
            </Pressable>
            <AppText variant="caption" colour="textSecondary" style={styles.chipLabel}>{s}</AppText>
          </View>
        );
      })}
    </ScrollRow>
  );
}

// ── CheekStyleRow ─────────────────────────────────────────────────────────────

const CHEEK_VB = '4 12 24 8';
const CHEEK_H  = Math.round(PREVIEW_W * 8 / 24);

function CheekStyleRow({
  selected, onSelect, bodyColor, snoutColor, surface, colours,
}: {
  selected: CheekStyle; onSelect: (s: CheekStyle) => void;
  bodyColor: BodyColor; snoutColor: BodyColor;
  surface: ReturnType<typeof useTheme>['surface'];
  colours: ReturnType<typeof useTheme>['colours'];
}) {
  const selectedIndex = CHEEK_STYLES.indexOf(selected);
  const scales = useChipScales(CHEEK_STYLES.length, selectedIndex);

  return (
    <ScrollRow colours={colours} itemHeight={CHEEK_H + 28}>
      {CHEEK_STYLES.map((s, i) => {
        const isSel = s === selected;
        return (
          <View key={s} style={styles.previewChipOuter}>
            <Pressable
              onPress={() => onSelect(s)}
              style={[styles.previewChip, {
                backgroundColor: surface.surface,
                borderColor: isSel ? colours.primary400 : surface.border,
                borderWidth: 2,
              }]}
            >
              <Animated.View style={{ transform: [{ scale: scales[i] }] }}>
                <Svg width={PREVIEW_W} height={CHEEK_H} viewBox={CHEEK_VB}>
                  <SvgRect x={4} y={12} width={24} height={8} fill={surface.surface} />
                  <CatBody color={BODY_COLORS[bodyColor]} snoutColor={BODY_COLORS[snoutColor]} />
                  <CatBlush style={s} />
                </Svg>
              </Animated.View>
            </Pressable>
            <AppText variant="caption" colour="textSecondary" style={styles.chipLabel}>{s}</AppText>
          </View>
        );
      })}
    </ScrollRow>
  );
}

// ── BadgeItemRow — headdress / shirt / accessory ──────────────────────────────

function BadgeItemRow({
  badgeKeys, selected, noneValue, onSelect, earnedBadges, renderItem, surface, colours,
}: {
  badgeKeys: BadgeKey[];
  selected: string;
  noneValue: string;
  onSelect: (style: string) => void;
  earnedBadges?: Set<BadgeKey>;
  renderItem: (key: BadgeKey) => React.ReactNode;
  surface: ReturnType<typeof useTheme>['surface'];
  colours: ReturnType<typeof useTheme>['colours'];
}) {
  // Sort: unlocked first, locked after; within each group preserve original order
  const unlocked = badgeKeys.filter(k => !earnedBadges || earnedBadges.has(k));
  const locked   = badgeKeys.filter(k =>  earnedBadges && !earnedBadges.has(k));
  const ordered  = [...unlocked, ...locked];

  const selectedIndex = ordered.findIndex(k => badgeKeyToStyle(k) === selected);
  const scales = useChipScales(ordered.length + 1, selected === noneValue ? 0 : selectedIndex + 1);

  const noneSelected = selected === noneValue;

  return (
    <ScrollRow colours={colours} itemHeight={CHIP_SIZE + 28}>
      {/* "None" chip */}
      <View style={styles.badgeChipOuter}>
        <Pressable
          onPress={() => onSelect(noneValue)}
          style={[styles.badgeChip, {
            backgroundColor: surface.surface,
            borderColor: noneSelected ? colours.primary400 : surface.border,
            borderWidth: 2,
          }]}
        >
          <Animated.View style={{ transform: [{ scale: scales[0] }] }}>
            <MCI name="close" size={20} color={surface.textSecondary} />
          </Animated.View>
        </Pressable>
        <AppText variant="caption" colour="textSecondary" style={styles.chipLabel}>none</AppText>
      </View>

      {ordered.map((key, i) => {
        const style  = badgeKeyToStyle(key);
        const isSel  = style === selected;
        const isLocked = earnedBadges ? !earnedBadges.has(key) : false;
        const vb = centredViewBox(key, 16);
        const meta = BADGE_META[key];

        return (
          <View key={key} style={[styles.badgeChipOuter, isLocked && { opacity: 0.45 }]}>
            <Pressable
              onPress={() => {
                if (isLocked) {
                  Alert.alert(meta.label, `Unlock: ${BADGE_HINTS[key]}`);
                } else {
                  onSelect(style);
                }
              }}
              style={[styles.badgeChip, {
                backgroundColor: surface.surface,
                borderColor: isSel ? colours.primary400 : surface.border,
                borderWidth: 2,
              }]}
            >
              <Animated.View style={{ transform: [{ scale: scales[i + 1] }] }}>
                <View style={{ transform: [{ scale: 0.5 }] }}>
                  <Svg width={(CHIP_SIZE - 12) * 2} height={(CHIP_SIZE - 12) * 2} viewBox={vb}>
                    {renderItem(key)}
                  </Svg>
                </View>
              </Animated.View>
              {isLocked && (
                <View style={styles.lockOverlay}>
                  <MCI name="lock" size={12} color="#fff" />
                </View>
              )}
            </Pressable>
            <AppText variant="caption" colour="textSecondary" style={styles.chipLabel} numberOfLines={2}>
              {meta.label}
            </AppText>
          </View>
        );
      })}
    </ScrollRow>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────

const SWATCH_INNER  = 26;
const SWATCH_HALO   = SWATCH_INNER + 4;
const SWATCH_OUTER  = SWATCH_HALO  + 8;
const SWATCH_GAP    = 6;
const EDGE_W        = 40;
const styles = StyleSheet.create({
  root: { flex: 1 },

  scrollHint: {
    position: 'absolute',
    bottom: 16,
    alignSelf: 'center',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 20,
  },
  scrollHintCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  stickyHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
    borderRadius: 28,
    zIndex: 10,
  },

  avatarCardWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingVertical: 20,
    alignItems: 'center',
    zIndex: 11,
  },

  previewCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
  },

  sectionsScroll: { gap: 12, paddingBottom: 20, paddingHorizontal: 20 },

  sections: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },

  divider: { height: 1 },

  traitRow: { paddingVertical: 10, gap: 6 },
  traitLabel: { letterSpacing: 0.5, textAlign: 'center' },

  chipScroll: {
    gap: SWATCH_GAP,
    paddingHorizontal: EDGE_W,
    paddingVertical: 6,
    flexGrow: 1,
    justifyContent: 'center',
  },

  // ── ScrollRow chrome ──

  scrollRowOuter: { position: 'relative' },

  edgeLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: EDGE_W,
    zIndex: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  edgeRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: EDGE_W,
    zIndex: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chevronCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.74)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chevronCirclePressed: {
    opacity: 0.4,
  },

  // ── Swatch chips ──

  swatchOuter: {
    width: SWATCH_OUTER,
    height: SWATCH_OUTER,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swatchHalo: {
    width: SWATCH_HALO,
    height: SWATCH_HALO,
    borderRadius: SWATCH_HALO / 2,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  swatch: {
    width: SWATCH_INNER,
    height: SWATCH_INNER,
    borderRadius: SWATCH_INNER / 2,
  },

  // ── Preview chips (eyes / cheeks) ──

  previewChipOuter: { alignItems: 'center' },
  previewChip: {
    width: PREVIEW_W,
    borderRadius: 10,
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 4,
    overflow: 'hidden',
  },
  chipLabel: { fontSize: 9, marginTop: 3, textAlign: 'center', maxWidth: CHIP_SIZE },

  // ── Badge item chips ──

  badgeChipOuter: { alignItems: 'center' },
  badgeChip: {
    width: CHIP_SIZE,
    height: CHIP_SIZE,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  lockOverlay: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
