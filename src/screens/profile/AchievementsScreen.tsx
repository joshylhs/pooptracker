import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  ScrollView,
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

function progressText(key: BadgeKey, ctx: BadgeEvalContext): string {
  switch (key) {
    case 'shirt_plain':           return `${ctx.totalLogs}/1 logs`;
    case 'shirt_ringer':          return `${ctx.totalLogs}/10 logs`;
    case 'shirt_collared':        return `${ctx.totalLogs}/25 logs`;
    case 'shirt_striped':         return `${ctx.totalLogs}/50 logs`;
    case 'shirt_suit':            return `${ctx.totalLogs}/75 logs`;
    case 'shirt_tuxedo':          return `${ctx.totalLogs}/100 logs`;
    case 'shirt_bathrobe':        return `${ctx.totalLogs}/200 logs`;
    case 'acc_cucumber':          return `${ctx.totalLogs}/300 logs`;
    case 'hd_tp_crown':           return `${ctx.totalLogs}/500 logs`;
    case 'hd_batman':             return `${ctx.nightOwlCount}/1 night logs`;
    case 'shirt_batman_suit':     return `${ctx.nightOwlCount}/3 night logs`;
    case 'acc_spectacles_round':  return `${ctx.currentStreak}/7 day streak`;
    case 'acc_spectacles_oval':   return `${ctx.currentStreak}/30 day streak`;
    case 'acc_spectacles_tinted': return `${ctx.currentStreak}/100 day streak`;
    case 'acc_monocle':           return `${ctx.currentStreak}/365 day streak`;
    case 'hd_headband':           return `${ctx.mondayStreakWeeks}/7 consecutive Mondays`;
    case 'hd_helmet':             return `${ctx.consistentCarlDays}/7 consistent days`;
    case 'hd_beanie_1':           return 'Return after 3–6 day gap';
    case 'hd_beanie_2':           return 'Return after 7–29 day gap';
    case 'hd_beanie_3':           return 'Return after 30+ day gap';
    case 'hd_party_1':            return `${ctx.friendCount}/1 friend`;
    case 'hd_party_2':            return `${ctx.friendCount}/5 friends`;
    case 'hd_party_3':            return `${ctx.friendCount}/10 friends`;
    case 'hd_party_4':            return `${ctx.friendCount}/25 friends`;
    case 'hd_trophy_bronze':      return '#1 on daily leaderboard';
    case 'hd_trophy_silver':      return '#1 on weekly leaderboard';
    case 'hd_trophy_gold':        return '#1 on monthly leaderboard';
    case 'hd_trophy_platinum':    return '#1 on yearly leaderboard';
    case 'acc_brooch_1':          return `${ctx.pokesSent}/1 poke sent`;
    case 'acc_brooch_2':          return `${ctx.pokesSent}/5 pokes sent`;
    case 'acc_brooch_3':          return `${ctx.pokesSent}/25 pokes sent`;
    case 'acc_sheriff':           return `${ctx.pokesSent}/100 pokes sent`;
    case 'acc_shield_1':          return `${ctx.pokesReceived}/1 poke received`;
    case 'acc_shield_2':          return `${ctx.pokesReceived}/5 pokes received`;
    case 'acc_shield_3':          return `${ctx.pokesReceived}/25 pokes received`;
    case 'acc_shield_4':          return `${ctx.pokesReceived}/100 pokes received`;
    default:                      return '';
  }
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
    description: 'Measures total log counts over time.',
    icon: 'toilet',
    keys: [
      'shirt_plain', 'shirt_ringer', 'shirt_collared', 'shirt_striped',
      'shirt_suit', 'shirt_tuxedo', 'shirt_bathrobe', 'acc_cucumber', 'hd_tp_crown',
    ],
  },
  {
    label: 'Streaks',
    description: 'Log at least once a day to keep your streak alive.',
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
    description: 'Return to logging after a gap of 3 or more days.',
    icon: 'undo-variant',
    keys: ['hd_beanie_1', 'hd_beanie_2', 'hd_beanie_3'],
  },
  {
    label: 'Friends',
    description: 'Based on your total friend count.',
    icon: 'account-group',
    keys: ['hd_party_1', 'hd_party_2', 'hd_party_3', 'hd_party_4'],
  },
  {
    label: 'Leaderboard',
    description: 'Reach #1 on the daily, weekly, monthly, or yearly board.',
    icon: 'podium',
    keys: ['hd_trophy_bronze', 'hd_trophy_silver', 'hd_trophy_gold', 'hd_trophy_platinum'],
  },
  {
    label: 'Pokes sent',
    description: 'Based on the total number of pokes you have sent.',
    icon: 'hand-pointing-right',
    keys: ['acc_brooch_1', 'acc_brooch_2', 'acc_brooch_3', 'acc_sheriff'],
  },
  {
    label: 'Pokes received',
    description: 'Based on the total number of pokes you have received.',
    icon: 'shield',
    keys: ['acc_shield_1', 'acc_shield_2', 'acc_shield_3', 'acc_shield_4'],
  },
];

// ── Avatar chip — display only ────────────────────────────────────────────────

const CHIP_SIZE = 64;
const ITEM_SPAN = 16;

const STYLE_OVERRIDES: Partial<Record<BadgeKey, string>> = {
  hd_striped_beanie: 'beanie',
};

function BadgeChip({ badgeKey, earned }: { badgeKey: BadgeKey; earned: boolean }) {
  const { surface } = useTheme();
  const meta = BADGE_META[badgeKey];
  const vb = centredViewBox(badgeKey, ITEM_SPAN);
  const itemStyle = STYLE_OVERRIDES[badgeKey] ?? meta.key.replace(/^(hd_|shirt_|acc_)/, '');

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
        <Svg width={CHIP_SIZE} height={CHIP_SIZE} viewBox={vb}>
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
        numberOfLines={2}
      >
        {meta.label}
      </AppText>
    </View>
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

  useEffect(() => {
    if (!user) return;
    Promise.all([getUserProfile(user.uid), buildBadgeContext(user.uid)]).then(([profile, context]) => {
      setEarned(new Set((profile?.badges ?? []) as BadgeKey[]));
      setCtx(context);
    });
  }, [user?.uid]);

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

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingHorizontal: 24 }]}
        style={{ marginHorizontal: -24 }}
        scrollIndicatorInsets={{ right: 6 }}
        indicatorStyle="white"
      >
        {CATEGORIES.map(cat => {
          const catEarned = cat.keys.filter(k => earned.has(k)).length;
          return (
            <View key={cat.label} style={styles.section}>
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
                <View style={styles.chipGrid}>
                  {cat.keys.map(key => (
                    <BadgeChip
                      key={key}
                      badgeKey={key}
                      earned={earned.has(key)}
                    />
                  ))}
                </View>

                {/* Progress hints for locked badges */}
                {ctx && cat.keys.some(k => !earned.has(k)) && (
                  <View style={[styles.progressBlock, { borderTopColor: surface.border }]}>
                    {cat.keys.filter(k => !earned.has(k)).map(key => (
                      <View key={key} style={styles.progressRow}>
                        <MCI name="lock" size={12} color={surface.textSecondary} />
                        <AppText variant="caption" colour="textSecondary" style={styles.progressLabel}>
                          {BADGE_META[key].label}
                        </AppText>
                        <AppText variant="caption" colour="textSecondary" style={styles.progressValue}>
                          {progressText(key, ctx)}
                        </AppText>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </View>
          );
        })}

        <View style={{ height: 32 }} />
      </ScrollView>
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
  section: { gap: 8 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginLeft: 4, marginTop: 8 },
  sectionLabel: { letterSpacing: 0.5, flex: 1 },
  sectionDesc: { marginLeft: 4, opacity: 0.7 },
  sectionCount: { opacity: 0.6 },
  card: { borderRadius: 12, borderWidth: 1, overflow: 'hidden' },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    gap: 10,
  },
  chipOuter: { alignItems: 'center', width: 76 },
  chip: {
    width: 68,
    height: 68,
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
  lockOverlay: {
    position: 'absolute',
    bottom: 4,
    right: 4,
  },
  progressBlock: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 6,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  progressLabel: { flex: 1 },
  progressValue: { opacity: 0.7, textAlign: 'right' },
});
