import { useEffect, useState } from 'react';
import { Modal, ScrollView, StyleSheet, View, Alert } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { BristolTypeNumber } from '../../utils/bristolData';
import { LogEntry } from '../../services/logs';
import { useLogStore } from '../../store/logStore';
import BristolSelector from './BristolSelector';
import Button from '../shared/Button';
import TextField from '../shared/TextField';
import AppText from '../shared/Text';

interface LogEntryModalProps {
  visible: boolean;
  onClose: () => void;
  /** When provided, the modal opens in edit mode for this log. */
  existingLog?: LogEntry | null;
}

export default function LogEntryModal({
  visible,
  onClose,
  existingLog,
}: LogEntryModalProps) {
  const { surface } = useTheme();
  const saveDetailedLog = useLogStore(s => s.saveDetailedLog);
  const editLog = useLogStore(s => s.editLog);
  const removeLog = useLogStore(s => s.removeLog);

  const [bristolType, setBristolType] = useState<BristolTypeNumber | null>(null);
  const [duration, setDuration] = useState('');
  const [notes, setNotes] = useState('');

  // Reset form fields whenever the modal opens. In edit mode, prefill from the
  // existing log. In create mode, clear everything.
  useEffect(() => {
    if (!visible) return;
    if (existingLog) {
      setBristolType(existingLog.bristolType);
      setDuration(existingLog.duration?.toString() ?? '');
      setNotes(existingLog.notes ?? '');
    } else {
      setBristolType(null);
      setDuration('');
      setNotes('');
    }
  }, [visible, existingLog]);

  const handleSave = () => {
    const parsedDuration = duration.trim() ? parseInt(duration.trim(), 10) : null;
    const details = {
      bristolType,
      duration: Number.isFinite(parsedDuration) ? parsedDuration : null,
      notes: notes.trim() || null,
    };
    if (existingLog) {
      editLog(existingLog.logId, details);
    } else {
      saveDetailedLog(details);
    }
    onClose();
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
      onRequestClose={onClose}
    >
      <View style={[styles.root, { backgroundColor: surface.background }]}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <AppText variant="screenTitle" style={styles.heading}>
            {existingLog ? 'Edit log' : 'New log'}
          </AppText>

          <BristolSelector value={bristolType} onChange={setBristolType} />

          <TextField
            label="Duration (minutes)"
            value={duration}
            onChangeText={setDuration}
            keyboardType="numeric"
            placeholder="optional"
          />

          <TextField
            label="Notes"
            value={notes}
            onChangeText={setNotes}
            multiline
            placeholder="optional"
            style={styles.notesInput}
          />

          <View style={styles.actions}>
            <Button title={existingLog ? 'Save changes' : 'Save'} onPress={handleSave} />
            <Button title="Cancel" variant="secondary" onPress={onClose} />
            {existingLog && (
              <Button title="Delete" variant="destructive" onPress={handleDelete} />
            )}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { padding: 24, gap: 16 },
  heading: { marginBottom: 4 },
  notesInput: { minHeight: 80, textAlignVertical: 'top' },
  actions: { gap: 12, marginTop: 8 },
});
