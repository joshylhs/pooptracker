import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Symptoms, SymptomScale } from '../../database/logRepository';
import AppText from '../shared/Text';

export type { Symptoms };

// ─── Outline icon components ──────────────────────────────────────────────────

function DropIcon({ color }: { color: string }) {
  return (
    <View style={{ width: 28, height: 28, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{
        width: 18,
        height: 18,
        borderWidth: 2,
        borderColor: color,
        borderRadius: 9,
        borderTopRightRadius: 1,
        transform: [{ rotate: '-45deg' }],
      }} />
    </View>
  );
}

function PulseIcon({ color }: { color: string }) {
  return <Text style={{ fontSize: 24, color, lineHeight: 28 }}>{'∿'}</Text>;
}

function ArrowsIcon({ color }: { color: string }) {
  return <Text style={{ fontSize: 22, color, lineHeight: 28 }}>{'⇊'}</Text>;
}

function BubblesIcon({ color }: { color: string }) {
  const dot = (key: number) => (
    <View key={key} style={{ width: 11, height: 11, borderRadius: 5.5, borderWidth: 2, borderColor: color }} />
  );
  return (
    <View style={{ alignItems: 'center', gap: 4 }}>
      <View style={{ flexDirection: 'row', gap: 4 }}>{dot(0)}{dot(1)}</View>
      {dot(2)}
    </View>
  );
}

function AlertCircleIcon({ color }: { color: string }) {
  return (
    <View style={{
      width: 28, height: 28, borderRadius: 14,
      borderWidth: 2, borderColor: color,
      alignItems: 'center', justifyContent: 'center',
    }}>
      <Text style={{ color, fontSize: 16, fontWeight: '700', lineHeight: 20 }}>!</Text>
    </View>
  );
}

function HandIcon({ color }: { color: string }) {
  return (
    <View style={{ alignItems: 'center' }}>
      <View style={{ flexDirection: 'row', gap: 3 }}>
        {[0, 1, 2].map(i => (
          <View key={i} style={{
            width: 5, height: 13, borderRadius: 3,
            borderWidth: 1.5, borderColor: color,
          }} />
        ))}
      </View>
      <View style={{
        width: 21, height: 8, borderRadius: 3,
        borderWidth: 1.5, borderColor: color,
        marginTop: -2,
      }} />
    </View>
  );
}

// ─── Tile config ──────────────────────────────────────────────────────────────

interface TileConfig {
  key: keyof Symptoms;
  label: string;
  Icon: React.ComponentType<{ color: string }>;
  type: 'boolean' | 'scale';
}

const TILES: TileConfig[] = [
  { key: 'blood',      label: 'blood',      Icon: DropIcon,        type: 'boolean' },
  { key: 'pain',       label: 'pain',       Icon: PulseIcon,       type: 'scale'   },
  { key: 'straining',  label: 'straining',  Icon: ArrowsIcon,      type: 'scale'   },
  { key: 'bloating',   label: 'bloating',   Icon: BubblesIcon,     type: 'boolean' },
  { key: 'incomplete', label: 'incomplete', Icon: AlertCircleIcon, type: 'boolean' },
  { key: 'assisted',   label: 'assisted',   Icon: HandIcon,        type: 'boolean' },
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
      <AppText variant="caption" colour="textSecondary" style={styles.sectionLabel}>
        SYMPTOMS
      </AppText>

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
                <tile.Icon color={iconColor} />
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
  tileLabel:  { letterSpacing: 0.3, textAlign: 'center' },
  scaleLabel: { letterSpacing: 0.3, opacity: 0.85 },
  legend:     { flexDirection: 'row', justifyContent: 'center', gap: 20, marginTop: 2 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot:  { width: 8, height: 8, borderRadius: 4 },
});
