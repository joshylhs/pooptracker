import { useState } from 'react';
import {
  StyleSheet,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import AppText from './Text';

interface TextFieldProps extends TextInputProps {
  label?: string;
  error?: string | null;
}

export default function TextField({
  label,
  error,
  style,
  onFocus,
  onBlur,
  ...rest
}: TextFieldProps) {
  const { colours, surface } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  const borderColour = error
    ? colours.destructive
    : isFocused
      ? colours.primary400
      : surface.border;

  return (
    <View style={styles.wrapper}>
      {label && (
        <AppText variant="caption" colour="textSecondary" style={styles.label}>
          {label}
        </AppText>
      )}
      <TextInput
        placeholderTextColor={surface.textPlaceholder}
        style={[
          styles.input,
          {
            borderColor: borderColour,
            backgroundColor: surface.surface,
            color: surface.textPrimary,
          },
          style,
        ]}
        onFocus={e => {
          setIsFocused(true);
          onFocus?.(e);
        }}
        onBlur={e => {
          setIsFocused(false);
          onBlur?.(e);
        }}
        {...rest}
      />
      {error && (
        <AppText variant="caption" style={[styles.error, { color: colours.destructive }]}>
          {error}
        </AppText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 12 },
  label: { marginBottom: 4 },
  input: {
    minHeight: 44,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 15,
  },
  error: { marginTop: 4 },
});
