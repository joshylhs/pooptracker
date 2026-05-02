import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import AppText from './Text';

export type ButtonVariant = 'primary' | 'secondary' | 'destructive';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
}: ButtonProps) {
  const { colours } = useTheme();
  const isDisabled = disabled || loading;

  const variantStyles = getVariantStyles(variant, colours);

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        variantStyles.container,
        pressed && variantStyles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variantStyles.spinnerColour} />
      ) : (
        <AppText
          variant="bodyEmphasis"
          style={{ color: variantStyles.textColour }}
        >
          {title}
        </AppText>
      )}
    </Pressable>
  );
}

function getVariantStyles(
  variant: ButtonVariant,
  colours: ReturnType<typeof useTheme>['colours'],
) {
  switch (variant) {
    case 'primary':
      return {
        container: { backgroundColor: colours.primary400 },
        pressed: { backgroundColor: colours.primary600 },
        textColour: '#FFFFFF',
        spinnerColour: '#FFFFFF',
      };
    case 'secondary':
      return {
        container: {
          backgroundColor: colours.primary50,
          borderWidth: 1,
          borderColor: colours.primary200,
        },
        pressed: { backgroundColor: colours.primary200 },
        textColour: colours.primary900,
        spinnerColour: colours.primary600,
      };
    case 'destructive':
      return {
        container: {
          backgroundColor: colours.destructiveBg,
          borderWidth: 1,
          borderColor: colours.destructiveBorder,
        },
        pressed: { backgroundColor: colours.destructiveBorder },
        textColour: colours.destructive,
        spinnerColour: colours.destructive,
      };
  }
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    borderRadius: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: { opacity: 0.5 },
});
