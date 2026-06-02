import { useEffect, useRef, useState } from 'react';
import { Animated, Modal, ScrollView, StyleSheet, View, Alert, TextInput } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '../../hooks/useTheme';
import { BristolTypeNumber } from '../../utils/bristolData';
import { LogEntry } from '../../services/logs';
import { useLogStore } from '../../store/logStore';
import BristolSelector from './BristolSelector';
import SymptomsGrid, { Symptoms } from './SymptomsGrid';
import Button from '../shared/Button';
import TextField from '../shared/TextField';
import AppText from '../shared/Text';

interface LogEntryModalProps {
  visible: boolean;
  onClose: (saved?: boolean, hadBlood?: boolean) => void;
  /** When provided, the modal opens in edit mode for this log. */
  existingLog?: LogEntry | null;
  /** Pre-fill the datetime picker to this timestamp (used when logging for a past date). */
  initialTimestamp?: number;
}

function isToday(ts: number): boolean {
  const d = new Date(ts);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

export default function LogEntryModal({
  visible,
  onClose,
  existingLog,
  initialTimestamp,
}: LogEntryModalProps) {
  const { surface, colours } = useTheme();
  const saveDetailedLog = useLogStore(s => s.saveDetailedLog);
  const editLog = useLogStore(s => s.editLog);
  const removeLog = useLogStore(s => s.removeLog);

  const [timestamp, setTimestamp] = useState(Date.now());
  const [bristolType, setBristolType] = useState<BristolTypeNumber | null>(null);
  const [symptoms, setSymptoms] = useState<Symptoms>({});
  const [notes, setNotes] = useState('');
  const pillAnim = useRef(new Animated.Value(1)).current;
  const prevIsToday = useRef(isToday(timestamp));
  const scrollRef = useRef<ScrollView>(null);
  const notesRef = useRef<TextInput>(null);

  useEffect(() => {
    const nowToday = isToday(timestamp);
    if (nowToday === prevIsToday.current) return;
    prevIsToday.current = nowToday;
    Animated.sequence([
      Animated.spring(pillAnim, { toValue: 0.7, useNativeDriver: true, friction: 10, tension: 200 }),
      Animated.spring(pillAnim, { toValue: 1,   useNativeDriver: true, friction: 6,  tension: 80  }),
    ]).start();
  }, [timestamp]);

  useEffect(() => {
    if (!visible) return;
    if (existingLog) {
      setTimestamp(existingLog.timestamp);
      setBristolType(existingLog.bristolType);
      setSymptoms(existingLog.symptoms ?? {});
      setNotes(existingLog.notes ?? '');
    } else {
      setTimestamp(initialTimestamp ?? Date.now());
      setBristolType(null);
      setSymptoms({});
      setNotes('');
    }
  }, [visible, existingLog]);

  const handleSave = () => {
    const details = {
      bristolType,
      symptoms,
      notes: notes.trim() || null,
      timestamp,
    };
    if (existingLog) {
      editLog(existingLog.logId, details);
    } else {
      saveDetailedLog(details);
    }
    onClose(true, symptoms.blood === true);
  };

  const handleDelete = () => {
    if (!existingLog) return;
    Alert.alert('Delete log?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          removeLog(existingLog.logId);
          onClose();
        },
      },
    ]);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => onClose()}
    >
      <View style={[styles.root, { backgroundColor: surface.background }]}>
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets
        >
          <View style={styles.headerRow}>
            <AppText variant="caption" colour="textSecondary" style={styles.editLabel}>
              {existingLog ? 'EDITING LOG' : 'NEW LOG'}
            </AppText>
            <Animated.View style={[
              styles.pill,
              { backgroundColor: isToday(timestamp) ? colours.idealBg : colours.primary50 },
              { transform: [{ scale: pillAnim }] },
            ]}>
              <AppText
                variant="caption"
                style={{ color: isToday(timestamp) ? colours.ideal : colours.primary600 }}
              >
                {isToday(timestamp) ? 'Today' : 'Backdated'}
              </AppText>
            </Animated.View>
          </View>
          <View style={[styles.divider, { backgroundColor: surface.border }]} />
          <View style={styles.whenRow}>
            <DateTimePicker
              mode="datetime"
              display="compact"
              value={new Date(timestamp)}
              onValueChange={(_, date) => { if (date) setTimestamp(date.getTime()); }}
              maximumDate={new Date()}
              themeVariant="dark"
            />
          </View>
          <View style={[styles.divider, { backgroundColor: surface.border }]} />

          <BristolSelector value={bristolType} onChange={setBristolType} />

          <SymptomsGrid value={symptoms} onChange={setSymptoms} />

          <TextField
            label="Notes (optional)"
            value={notes}
            onChangeText={setNotes}
            multiline
            placeholder="Any context e.g. pain, diet, stress, medication..."
            style={styles.notesInput}
            inputRef={notesRef}
            onFocus={() => {
              notesRef.current?.measureInWindow((_, y, __, height) => {
                scrollRef.current?.scrollTo({ y: y + height - 200, animated: true });
              });
            }}
          />

          <View style={styles.actions}>
            <Button title={existingLog ? 'Save changes' : 'Save'} icon="content-save" onPress={handleSave} />
            <Button title="Cancel" icon="close" variant="secondary" onPress={() => onClose()} />
            {existingLog && (
              <Button title="Delete" variant="destructive" icon="trash-can" onPress={handleDelete} />
            )}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { padding: 24, gap: 12 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  editLabel: { letterSpacing: 0.5 },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  divider: { height: StyleSheet.hairlineWidth },
  whenRow: {
    alignItems: 'center',
    paddingVertical: 2,
  },
  notesInput: { minHeight: 60, textAlignVertical: 'top' },
  actions: { gap: 12, marginTop: 8 },
});
