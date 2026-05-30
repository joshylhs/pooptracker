import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  Animated, Pressable, ScrollView, StyleSheet, View, NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import Svg, { Rect as SvgRect } from 'react-native-svg';
import { BlurView } from '@react-native-community/blur';
import MCI from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../hooks/useTheme';
import AppText from '../shared/Text';
import Button from '../shared/Button';
import CatAvatar, { BODY_COLORS, WALL_COLORS, BodyColor, WallColor } from './CatAvatar';
import CatEyes, { EYE_COLORS, EYE_SECONDARY_COLORS, EyeColor, EyeSecondary, EyeStyle } from './CatEyes';
import CatBody from './CatBody';
import CatBlush, { CheekStyle } from './CatBlush';
import CatHeaddress, { HeaddressStyle } from './CatHeaddress';

export interface AvatarConfig {
  bodyColor:    BodyColor;
  snoutColor:   BodyColor;
  eyeStyle:     EyeStyle;
  eyePrimary:   EyeColor;
  eyeSecondary: EyeSecondary;
  cheekStyle:   CheekStyle;
  headdress:    HeaddressStyle;
  wallColor:    WallColor;
}

const CHEEK_STYLES: CheekStyle[] = ['blush', 'freckles', 'none'];

interface Props {
  initial: AvatarConfig;
  ctaLabel?: string;
  onConfirm: (config: AvatarConfig) => void;
  loading?: boolean;
}

const BODY_COLOR_KEYS:  BodyColor[]      = Object.keys(BODY_COLORS) as BodyColor[];
const WALL_COLOR_KEYS:  WallColor[]      = Object.keys(WALL_COLORS) as WallColor[];
const EYE_STYLES:       EyeStyle[]       = ['round', 'sparkle', 'button'];
const EYE_PRIMARIES:    EyeColor[]       = Object.keys(EYE_COLORS) as EyeColor[];
const EYE_SECONDARIES:  EyeSecondary[]   = Object.keys(EYE_SECONDARY_COLORS) as EyeSecondary[];
const HEADDRESSES:      HeaddressStyle[] = ['none', 'flower', 'bow', 'crown', 'partyhat', 'beanie', 'tophat'];

const PREVIEW_W = 64;

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
      {/* Left chevron */}
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

      {/* Right chevron */}
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

export default function AvatarPicker({ initial, ctaLabel, onConfirm, loading = false }: Props) {
  const { surface, colours } = useTheme();
  const [cfg, setCfg] = useState<AvatarConfig>(initial);

  const set = <K extends keyof AvatarConfig>(key: K, value: AvatarConfig[K]) =>
    setCfg(c => ({ ...c, [key]: value }));

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
      {/* ── Scrollable trait sections — fills root, scrolls under the header ── */}
      <ScrollView
        ref={verticalScrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.sectionsScroll, { paddingTop: headerH || 200 }]}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled
        onScroll={onVerticalScroll}
        scrollEventThrottle={16}
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
            <HeaddressRow
              selected={cfg.headdress}
              onSelect={h => set('headdress', h)}
              surface={surface} colours={colours}
            />
          </TraitRow>

        </View>

        {ctaLabel
          ? <Button title={ctaLabel} icon="content-save" onPress={() => onConfirm(cfg)} loading={loading} />
          : null}
      </ScrollView>

      {/* ── Scroll-down hint — fades out when at the bottom ── */}
      <Animated.View style={[styles.scrollHint, { opacity: scrollHintOpacity }]}>
        <Pressable onPress={() => verticalScrollRef.current?.scrollToEnd({ animated: true })} style={styles.scrollHintCircle}>
          <MCI name="arrow-down" size={22} color="#fff" />
        </Pressable>
      </Animated.View>

      {/* ── Blurred sticky header — height driven by avatarCardWrap measurement ── */}
      {headerH > 0 && (
        <View style={[styles.stickyHeader, { height: headerH }]} pointerEvents="none">
          <BlurView
            style={StyleSheet.absoluteFill}
            blurType="dark"
            blurAmount={15}
            reducedTransparencyFallbackColor={surface.background}
          />
        </View>
      )}

      {/* Avatar card — measured so blur strip can match its height ── */}
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
    <ScrollRow colours={colours} itemHeight={EYE_H + 20}>
      {EYE_STYLES.map((s, i) => {
        const isSel = s === selected;
        return (
          <Pressable
            key={s}
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
            <AppText variant="caption" colour="textSecondary" style={styles.chipLabel}>{s}</AppText>
          </Pressable>
        );
      })}
    </ScrollRow>
  );
}

// ── HeaddressRow ─────────────────────────────────────────────────────────────

const HDRESS_VB = '2 0 28 10';
const HDRESS_H  = Math.round(PREVIEW_W * 10 / 28);

function HeaddressRow({
  selected, onSelect, surface, colours,
}: {
  selected: HeaddressStyle; onSelect: (h: HeaddressStyle) => void;
  surface: ReturnType<typeof useTheme>['surface'];
  colours: ReturnType<typeof useTheme>['colours'];
}) {
  const selectedIndex = HEADDRESSES.indexOf(selected);
  const scales = useChipScales(HEADDRESSES.length, selectedIndex);

  return (
    <ScrollRow colours={colours} itemHeight={HDRESS_H + 20}>
      {HEADDRESSES.map((h, i) => {
        const isSel = h === selected;
        return (
          <Pressable
            key={h}
            onPress={() => onSelect(h)}
            style={[styles.previewChip, {
              backgroundColor: surface.surface,
              borderColor: isSel ? colours.primary400 : surface.border,
              borderWidth: 2,
            }]}
          >
            <Animated.View style={{ transform: [{ scale: scales[i] }] }}>
              <Svg width={PREVIEW_W} height={HDRESS_H} viewBox={HDRESS_VB}>
                <SvgRect x={2} y={0} width={28} height={10} fill={surface.surface} />
                <CatHeaddress style={h} />
              </Svg>
            </Animated.View>
            <AppText variant="caption" colour="textSecondary" style={styles.chipLabel}>{h}</AppText>
          </Pressable>
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
    <ScrollRow colours={colours} itemHeight={CHEEK_H + 20}>
      {CHEEK_STYLES.map((s, i) => {
        const isSel = s === selected;
        return (
          <Pressable
            key={s}
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
            <AppText variant="caption" colour="textSecondary" style={styles.chipLabel}>{s}</AppText>
          </Pressable>
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


  // Full-width blurred strip, absolutely positioned so scroll content passes under it
  stickyHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
    borderRadius: 28,
    zIndex: 10,
  },

  // Centres the avatar card over the blurred strip
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

  sectionsScroll: { gap: 12, paddingBottom: 8 },

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
    paddingHorizontal: EDGE_W,   // reserve space so chips clear the edge overlays
    paddingVertical: 6,
    flexGrow: 1,
    justifyContent: 'center',
  },

  // ── ScrollRow chrome ──

  scrollRowOuter: { position: 'relative' },

  // Left edge: absolutely positioned over the scroll row
  edgeLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: EDGE_W,
    zIndex: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Right edge
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

  // ── Preview chips (eyes / headdress) ──

  previewChip: {
    width: PREVIEW_W,
    borderRadius: 10,
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 4,
    overflow: 'hidden',
  },
  chipLabel: { fontSize: 9, marginTop: 3 },
});
