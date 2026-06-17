import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MCI from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
import { useAuthStore } from '../../store/authStore';
import ScreenContainer from '../../components/shared/ScreenContainer';
import AppText from '../../components/shared/Text';
import Svg from 'react-native-svg';
import CatHeaddress from '../../components/avatar/CatHeaddress';
import CatShirt from '../../components/avatar/CatShirt';
import CatAccessory from '../../components/avatar/CatAccessory';
import { getUserProfile } from '../../services/users';
import { buildBadgeContext } from '../../services/badgeService';
import { BadgeKey, BadgeEvalContext, BADGE_META, centredViewBox } from '../../utils/badgeUtils';
import type { HeaddressStyle } from '../../components/avatar/CatHeaddress';
import type { ShirtStyle } from '../../components/avatar/CatShirt';
import type { AccessoryStyle } from '../../components/avatar/CatAccessory';

// ── Progress descriptions per badge key ───────────────────────────────────────

function requirementText(key: BadgeKey): string {
  switch (key) {
    case 'shirt_plain':           return '1 log';
    case 'shirt_ringer':          return '10 logs';
    case 'shirt_collared':        return '25 logs';
    case 'shirt_striped':         return '50 logs';
    case 'shirt_suit':            return '75 logs';
    case 'shirt_tuxedo':          return '100 logs';
    case 'shirt_bathrobe':        return '200 logs';
    case 'acc_cucumber':          return '300 logs';
    case 'hd_tp_crown':           return '500 logs';
    case 'hd_batman':             return '1 night log';
    case 'shirt_batman_suit':     return '3 night logs';
    case 'acc_spectacles_round':  return '7 day streak';
    case 'acc_spectacles_oval':   return '30 day streak';
    case 'acc_spectacles_tinted': return '100 day streak';
    case 'acc_monocle':           return '365 day streak';
    case 'hd_headband':           return '7 consecutive Mondays';
    case 'hd_helmet':             return '7 consistent days';
    case 'hd_beanie_1':           return '3–6 day gap';
    case 'hd_beanie_2':           return '7–29 day gap';
    case 'hd_beanie_3':           return '30+ day gap';
    case 'hd_party_1':            return '1 friend';
    case 'hd_party_2':            return '5 friends';
    case 'hd_party_3':            return '10 friends';
    case 'hd_party_4':            return '25 friends';
    case 'hd_trophy_bronze':      return '#1 daily';
    case 'hd_trophy_silver':      return '#1 weekly';
    case 'hd_trophy_gold':        return '#1 monthly';
    case 'hd_trophy_platinum':    return '#1 yearly';
    case 'acc_brooch_1':          return '1 poke sent';
    case 'acc_brooch_2':          return '5 pokes sent';
    case 'acc_brooch_3':          return '25 pokes sent';
    case 'acc_sheriff':           return '100 pokes sent';
    case 'acc_shield_1':          return '1 poke received';
    case 'acc_shield_2':          return '5 pokes received';
    case 'acc_shield_3':          return '25 pokes received';
    case 'acc_shield_4':          return '100 pokes received';
    default:                      return '';
  }
}

// ── Next milestone progress ───────────────────────────────────────────────────

interface MilestoneProgress { current: number; target: number; label: string; key: BadgeKey }

function nextMilestone(keys: BadgeKey[], earned: Set<BadgeKey>, ctx: BadgeEvalContext): MilestoneProgress | null {
  const nextKey = keys.find(k => !earned.has(k));
  if (!nextKey) return null;
  const label = BADGE_META[nextKey].label;
  let current: number; let target: number;
  switch (nextKey) {
    case 'shirt_plain':           current = ctx.totalLogs;          target = 1;   break;
    case 'shirt_ringer':          current = ctx.totalLogs;          target = 10;  break;
    case 'shirt_collared':        current = ctx.totalLogs;          target = 25;  break;
    case 'shirt_striped':         current = ctx.totalLogs;          target = 50;  break;
    case 'shirt_suit':            current = ctx.totalLogs;          target = 75;  break;
    case 'shirt_tuxedo':          current = ctx.totalLogs;          target = 100; break;
    case 'shirt_bathrobe':        current = ctx.totalLogs;          target = 200; break;
    case 'acc_cucumber':          current = ctx.totalLogs;          target = 300; break;
    case 'hd_tp_crown':           current = ctx.totalLogs;          target = 500; break;
    case 'hd_batman':             current = ctx.nightOwlCount;      target = 1;   break;
    case 'shirt_batman_suit':     current = ctx.nightOwlCount;      target = 3;   break;
    case 'acc_spectacles_round':  current = ctx.currentStreak;      target = 7;   break;
    case 'acc_spectacles_oval':   current = ctx.currentStreak;      target = 30;  break;
    case 'acc_spectacles_tinted': current = ctx.currentStreak;      target = 100; break;
    case 'acc_monocle':           current = ctx.currentStreak;      target = 365; break;
    case 'hd_headband':           current = ctx.mondayStreakWeeks;  target = 7;   break;
    case 'hd_helmet':             current = ctx.consistentCarlDays; target = 7;   break;
    case 'hd_party_1':            current = ctx.friendCount;        target = 1;   break;
    case 'hd_party_2':            current = ctx.friendCount;        target = 5;   break;
    case 'hd_party_3':            current = ctx.friendCount;        target = 10;  break;
    case 'hd_party_4':            current = ctx.friendCount;        target = 25;  break;
    case 'acc_brooch_1':          current = ctx.pokesSent;          target = 1;   break;
    case 'acc_brooch_2':          current = ctx.pokesSent;          target = 5;   break;
    case 'acc_brooch_3':          current = ctx.pokesSent;          target = 25;  break;
    case 'acc_sheriff':           current = ctx.pokesSent;          target = 100; break;
    case 'acc_shield_1':          current = ctx.pokesReceived;      target = 1;   break;
    case 'acc_shield_2':          current = ctx.pokesReceived;      target = 5;   break;
    case 'acc_shield_3':          current = ctx.pokesReceived;      target = 25;  break;
    case 'acc_shield_4':          current = ctx.pokesReceived;      target = 100; break;
    default: return null;
  }
  return { key: nextKey, label, current: Math.min(current, target), target };
}

// ── Categories ────────────────────────────────────────────────────────────────

interface Category {
  label: string;
  description: string;
  icon: string;
  keys: BadgeKey[];
}

const CATEGORIES: Category[] = [
  {
    label: 'Log milestones',
    description: 'Measures total log counts over time',
    icon: 'toilet',
    keys: [
      'shirt_plain', 'shirt_ringer', 'shirt_collared', 'shirt_striped',
      'shirt_suit', 'shirt_tuxedo', 'shirt_bathrobe', 'acc_cucumber', 'hd_tp_crown',
    ],
  },
  {
    label: 'Streaks',
    description: 'Log at least once a day to keep your streak alive',
    icon: 'fire',
    keys: [
      'acc_spectacles_round', 'acc_spectacles_oval',
      'acc_spectacles_tinted', 'acc_monocle',
      'hd_headband', 'hd_helmet',
    ],
  },
  {
    label: 'Night owl',
    description: 'Counts logs created between 12am to 4am',
    icon: 'owl',
    keys: ['hd_batman', 'shirt_batman_suit'],
  },
  {
    label: 'Comebacks',
    description: 'Return to logging after a gap of 3 or more days',
    icon: 'undo-variant',
    keys: ['hd_beanie_1', 'hd_beanie_2', 'hd_beanie_3'],
  },
  {
    label: 'Friends',
    description: 'Based on your total friend count',
    icon: 'account-group',
    keys: ['hd_party_1', 'hd_party_2', 'hd_party_3', 'hd_party_4'],
  },
  {
    label: 'Leaderboard',
    description: '#1 on leaderboard at the end of a day, week, month or year',
    icon: 'podium',
    keys: ['hd_trophy_bronze', 'hd_trophy_silver', 'hd_trophy_gold', 'hd_trophy_platinum'],
  },
  {
    label: 'Pokes sent',
    description: 'Based on the total number of pokes you have sent',
    icon: 'hand-pointing-right',
    keys: ['acc_brooch_1', 'acc_brooch_2', 'acc_brooch_3', 'acc_sheriff'],
  },
  {
    label: 'Pokes received',
    description: 'Based on the total number of pokes you have received',
    icon: 'shield',
    keys: ['acc_shield_1', 'acc_shield_2', 'acc_shield_3', 'acc_shield_4'],
  },
];

// ── Avatar chip — display only ────────────────────────────────────────────────

const ITEM_SPAN = 16;

const STYLE_OVERRIDES: Partial<Record<BadgeKey, string>> = {
  hd_striped_beanie: 'beanie',
};

function BadgeChip({ badgeKey, earned }: { badgeKey: BadgeKey; earned: boolean }) {
  const { surface } = useTheme();
  const meta = BADGE_META[badgeKey];
  const vb = centredViewBox(badgeKey, ITEM_SPAN);
  const itemStyle = STYLE_OVERRIDES[badgeKey] ?? meta.key.replace(/^(hd_|shirt_|acc_)/, '');
  const req = requirementText(badgeKey);

  return (
    <View style={styles.chipOuter}>
      <View
        style={[
          styles.chip,
          {
            backgroundColor: surface.border,
            opacity: earned ? 1 : 0.38,
          },
        ]}
      >
        <Svg width="100%" height="100%" viewBox={vb}>
          {meta.slot === 'headdress' && <CatHeaddress style={itemStyle as HeaddressStyle} />}
          {meta.slot === 'shirt'     && <CatShirt     style={itemStyle as ShirtStyle} />}
          {meta.slot === 'accessory' && <CatAccessory style={itemStyle as AccessoryStyle} />}
        </Svg>
        {!earned && (
          <View style={styles.lockOverlay}>
            <MCI name="lock" size={14} color="#fff" />
          </View>
        )}
      </View>
      <AppText
        variant="caption"
        colour={earned ? 'textPrimary' : 'textSecondary'}
        style={styles.chipLabel}
        numberOfLines={1}
      >
        {meta.label}
      </AppText>
      {req !== '' && (
        <AppText variant="caption" colour="textSecondary" style={styles.chipReq} numberOfLines={1}>
          {req}
        </AppText>
      )}
    </View>
  );
}

// ── Mini chip for progress bars ───────────────────────────────────────────────

const MINI_SIZE = 32;
const MINI_SPAN = 12;

function MiniChip({ badgeKey }: { badgeKey: BadgeKey }) {
  const { surface } = useTheme();
  const meta = BADGE_META[badgeKey];
  const vb = centredViewBox(badgeKey, MINI_SPAN);
  const itemStyle = STYLE_OVERRIDES[badgeKey] ?? meta.key.replace(/^(hd_|shirt_|acc_)/, '');
  return (
    <View style={[styles.miniChip, { backgroundColor: surface.border }]}>
      <Svg width={MINI_SIZE} height={MINI_SIZE} viewBox={vb}>
        {meta.slot === 'headdress' && <CatHeaddress style={itemStyle as HeaddressStyle} />}
        {meta.slot === 'shirt'     && <CatShirt     style={itemStyle as ShirtStyle} />}
        {meta.slot === 'accessory' && <CatAccessory style={itemStyle as AccessoryStyle} />}
      </Svg>
    </View>
  );
}

// ── Milestone bar — fades in when ctx arrives ─────────────────────────────────

interface MilestoneBarProps {
  milestone: MilestoneProgress | null;
  surface: ReturnType<typeof useTheme>['surface'];
}

const MILESTONE_BAR_HEIGHT = 52;

function MilestoneBar({ milestone, surface }: MilestoneBarProps) {
  const animHeight = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(8)).current;

  useEffect(() => {
    if (milestone) {
      Animated.parallel([
        Animated.timing(animHeight, { toValue: MILESTONE_BAR_HEIGHT, duration: 350, useNativeDriver: false }),
        Animated.timing(opacity,    { toValue: 1, duration: 350, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 350, useNativeDriver: true }),
      ]).start();
    }
  }, [milestone]);

  const fillRatio = milestone ? milestone.current / milestone.target : 0;

  if (!milestone) return null;

  return (
    <Animated.View style={{ height: animHeight, overflow: 'hidden' }}>
      {/* Render at full opacity:0 so layout engine measures true height before animation starts */}
      <View style={styles.progressBarInner}>
        <Animated.View style={[styles.milestoneRow, { opacity, transform: [{ translateY }] }]}>
          <MiniChip badgeKey={milestone.key} />
          <View style={styles.milestoneContent}>
            <AppText variant="caption" colour="textSecondary" style={{ opacity: 0.7 }}>
              {milestone.target - milestone.current} more to unlock {milestone.label}
            </AppText>
            <View style={styles.progressBarRow}>
              <View style={[styles.progressBarTrack, { backgroundColor: surface.border }]}>
                <View style={[styles.progressBarFill, { width: `${fillRatio * 100}%`, backgroundColor: '#7F77DD' }]} />
              </View>
              <AppText variant="caption" colour="textSecondary" style={styles.progressBarLabel}>
                {milestone.current}/{milestone.target}
              </AppText>
            </View>
          </View>
        </Animated.View>
      </View>
    </Animated.View>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────

export default function AchievementsScreen() {
  const { top: topInset } = useSafeAreaInsets();
  const navigation = useNavigation();
  const { surface } = useTheme();
  const user = useAuthStore(s => s.user);

  const [earned, setEarned] = useState<Set<BadgeKey>>(new Set());
  const [ctx, setCtx] = useState<BadgeEvalContext | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    if (!user || !ready) return;
    Promise.all([getUserProfile(user.uid), buildBadgeContext(user.uid)]).then(([profile, context]) => {
      setEarned(new Set((profile?.badges ?? []) as BadgeKey[]));
      setCtx(context);
    });
  }, [user?.uid, ready]);

  const earnedCount = earned.size;
  const totalCount = Object.keys(BADGE_META).length;

  const backScale = useRef(new Animated.Value(1)).current;

  return (
    <ScreenContainer>
      {/* Sticky header */}
      <View style={[styles.header, { paddingTop: topInset, backgroundColor: surface.surface, borderBottomColor: surface.border }]}>
        <Pressable
          onPress={() => navigation.goBack()}
          onPressIn={() => Animated.spring(backScale, { toValue: 0.88, speed: 40, bounciness: 0, useNativeDriver: true }).start()}
          onPressOut={() => Animated.spring(backScale, { toValue: 1, speed: 40, bounciness: 5, useNativeDriver: true }).start()}
          hitSlop={8}
        >
          <Animated.View style={[styles.backBtn, { transform: [{ scale: backScale }] }]}>
            <MCI name="chevron-left" size={20} color={surface.textSecondary} />
          </Animated.View>
        </Pressable>
        <View style={styles.headerText}>
          <AppText variant="screenTitle" style={{ textAlign: 'center' }}>Achievements</AppText>
          <AppText variant="caption" colour="textSecondary" style={{ textAlign: 'center' }}>
            {earnedCount}/{totalCount} earned
          </AppText>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <Animated.FlatList
        data={CATEGORIES}
        keyExtractor={cat => cat.label}
        contentContainerStyle={[styles.scroll, { paddingHorizontal: 24 }]}
        style={{ marginHorizontal: -24 }}
        scrollIndicatorInsets={{ right: 6 }}
        indicatorStyle="white"
        ListFooterComponent={<View style={{ height: 32 }} />}
        renderItem={({ item: cat }) => {
          const catEarned = cat.keys.filter(k => earned.has(k)).length;
          const milestone = ctx ? nextMilestone(cat.keys, earned, ctx) : null;
          return (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <MCI name={cat.icon} size={15} color={surface.textSecondary} />
                <AppText variant="caption" colour="textSecondary" style={styles.sectionLabel}>
                  {cat.label.toUpperCase()}
                </AppText>
                <AppText variant="caption" colour="textSecondary" style={styles.sectionCount}>
                  {catEarned}/{cat.keys.length}
                </AppText>
              </View>
              <AppText variant="caption" colour="textSecondary" style={styles.sectionDesc}>
                {cat.description}
              </AppText>

              <View style={[styles.card, { backgroundColor: surface.surface, borderColor: surface.border }]}>
                <MilestoneBar milestone={milestone} surface={surface} />
                <View style={styles.chipGrid}>
                  {cat.keys.map(key => (
                    <BadgeChip key={key} badgeKey={key} earned={earned.has(key)} />
                  ))}
                </View>
              </View>
            </View>
          );
        }}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: { gap: 16, paddingBottom: 24 },
  header: { flexDirection: 'row', alignItems: 'center', paddingBottom: 8, paddingHorizontal: 24, marginHorizontal: -24, borderBottomWidth: StyleSheet.hairlineWidth },
  headerText: { flex: 1, alignItems: 'center', gap: 2 },
  headerSpacer: { width: 34 },
  backBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  section: { gap: 6 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginLeft: 4, marginTop: 8 },
  sectionLabel: { letterSpacing: 0.5, flex: 1 },
  sectionDesc: { marginLeft: 4, opacity: 0.7 },
  sectionCount: { opacity: 0.6 },
  card: { borderRadius: 12, borderWidth: 1, overflow: 'hidden' },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    gap: 8,
  },
  chipOuter: { alignItems: 'center', flexBasis: '23%', flexGrow: 0, maxWidth: '25%' },
  chip: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  chipLabel: {
    marginTop: 4,
    textAlign: 'center',
    fontSize: 10,
    lineHeight: 13,
  },
  chipReq: {
    textAlign: 'center',
    fontSize: 9,
    lineHeight: 12,
    opacity: 0.6,
  },
  lockOverlay: {
    position: 'absolute',
    bottom: 4,
    right: 4,
  },
  progressBarRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  progressBarInner: { paddingHorizontal: 12, paddingVertical: 10 },
  progressBarTrack: { flex: 1, flexDirection: 'row', height: 4, borderRadius: 2, overflow: 'hidden' },
  progressBarFill: { borderRadius: 2 },
  progressBarLabel: { opacity: 0.6, minWidth: 28, textAlign: 'right' },
  miniChip: { width: MINI_SIZE, height: MINI_SIZE, borderRadius: 8, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  milestoneRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  milestoneContent: { flex: 1, gap: 4 },
});
