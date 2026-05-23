import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import MCI from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../hooks/useTheme';
import { Symptoms, SymptomScale } from '../../database/logRepository';
import AppText from '../shared/Text';
import InfoModal, { InfoButton } from '../shared/InfoModal';

export type { Symptoms };

// ─── Info content ─────────────────────────────────────────────────────────────

const SYMPTOM_INFO_ROWS = [
  { label: 'blood',      body: 'Visible blood in the stool or on toilet paper.' },
  { label: 'pain',       body: 'Abdominal or rectal pain during or after a bowel movement.', tag: 'mild / severe' },
  { label: 'straining',  body: 'Difficulty or effort required to pass a stool.', tag: 'mild / severe' },
  { label: 'bloating',   body: 'A feeling of fullness, tightness, or swelling in the abdomen.' },
  { label: 'incomplete', body: "Sensation that the bowel wasn't fully emptied." },
  { label: 'assisted',   body: 'Required laxatives, enemas, or manual assistance.' },
];

// ─── Tile config ──────────────────────────────────────────────────────────────

interface TileConfig {
  key: keyof Symptoms;
  label: string;
  icon: string;
  type: 'boolean' | 'scale';
}

const TILES: TileConfig[] = [
  { key: 'blood',      label: 'blood',      icon: 'water-outline',          type: 'boolean' },
  { key: 'pain',       label: 'pain',       icon: 'heart-pulse',            type: 'scale'   },
  { key: 'straining',  label: 'straining',  icon: 'arrow-collapse-down',    type: 'scale'   },
  { key: 'bloating',   label: 'bloating',   icon: 'circle-expand',          type: 'boolean' },
  { key: 'incomplete', label: 'incomplete', icon: 'alert-circle-outline',   type: 'boolean' },
  { key: 'assisted',   label: 'assisted',   icon: 'hand-front-left-outline', type: 'boolean' },
];

// ─── State cycling ────────────────────────────────────────────────────────────

function nextBoolean(v: boolean | undefined): boolean | undefined {
  return v ? undefined : true;
}

function nextScale(v: SymptomScale | null | undefined): SymptomScale | undefined {
  if (!v) return 'mild';
  if (v === 'mild') return 'severe';
  return undefined;
}

// ─── Component ────────────────────────────────────────────────────────────────

interface SymptomsGridProps {
  value: Symptoms;
  onChange: (next: Symptoms) => void;
}

export default function SymptomsGrid({ value, onChange }: SymptomsGridProps) {
  const { surface, colours } = useTheme();
  const [showInfo, setShowInfo] = useState(false);

  const handlePress = (tile: TileConfig) => {
    if (tile.type === 'boolean') {
      onChange({ ...value, [tile.key]: nextBoolean(value[tile.key] as boolean | undefined) });
    } else {
      onChange({ ...value, [tile.key]: nextScale(value[tile.key] as SymptomScale | null | undefined) });
    }
  };

  const rows = [TILES.slice(0, 3), TILES.slice(3, 6)];

  return (
    <View style={styles.container}>
      <InfoModal
        visible={showInfo}
        onClose={() => setShowInfo(false)}
        title="Symptoms"
        intro="Tap a tile to log it. Pain and straining can be mild or severe — tap again to cycle."
        rows={SYMPTOM_INFO_ROWS}
      />
      <View style={styles.labelRow}>
        <AppText variant="caption" colour="textSecondary" style={styles.sectionLabel}>
          SYMPTOMS
        </AppText>
        <InfoButton onPress={() => setShowInfo(true)} />
      </View>

      {rows.map((row, rowIdx) => (
        <View key={rowIdx} style={styles.row}>
          {row.map(tile => {
            const raw = value[tile.key];
            const isSevere = tile.type === 'scale' && raw === 'severe';
            const isActive = !!raw;

            const isMild      = tile.type === 'scale' && raw === 'mild';
            const bgColor     = isSevere ? colours.destructiveBg : isActive ? colours.primary50  : surface.surface;
            const borderColor = isSevere ? colours.destructive200 : isActive ? colours.primary200 : surface.border;
            const iconColor   = isSevere ? colours.destructive    : isActive ? colours.primary400 : surface.textPlaceholder;
            const labelColor  = isSevere ? colours.destructive600 : isActive ? colours.primary600 : surface.textPlaceholder;
            const dotColor    = isSevere ? colours.destructive200 : isActive ? colours.primary200 : 'transparent';

            return (
              <Pressable
                key={tile.key}
                onPress={() => handlePress(tile)}
                style={[styles.tile, { borderColor, backgroundColor: bgColor }]}
              >
                <View style={[styles.dot, { backgroundColor: dotColor }]} />
                <MCI name={tile.icon} size={24} color={iconColor} />
                <AppText variant="caption" style={[styles.tileLabel, { color: labelColor }]}>
                  {tile.label}
                </AppText>
                {(isMild || isSevere) && (
                  <AppText variant="caption" style={[styles.scaleLabel, { color: labelColor }]}>
                    {isMild ? 'mild' : 'severe'}
                  </AppText>
                )}
              </Pressable>
            );
          })}
        </View>
      ))}

      {/* Legend */}
      <View style={styles.legend}>
        {([
          { color: colours.primary200,   label: 'mild'   },
          { color: colours.destructive200, label: 'severe' },
          { color: surface.border,        label: 'off'    },
        ] as const).map(({ color, label }) => (
          <View key={label} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: color }]} />
            <AppText variant="caption" colour="textSecondary">{label}</AppText>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:   { gap: 8 },
  sectionLabel: { letterSpacing: 0.5 },
  row:         { flexDirection: 'row', gap: 8 },
  tile: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: 16,
    minHeight: 90,
    paddingVertical: 10,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  labelRow:   { flexDirection: 'row', alignItems: 'center', gap: 6 },
  tileLabel:  { letterSpacing: 0.3, textAlign: 'center' },
  scaleLabel: { letterSpacing: 0.3, opacity: 0.85 },
  legend:     { flexDirection: 'row', justifyContent: 'center', gap: 20, marginTop: 2 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot:  { width: 8, height: 8, borderRadius: 4 },
});
