import { Text as RNText, TextProps as RNTextProps, TextStyle } from 'react-native';
import { useTheme, ThemeSurface } from '../../hooks/useTheme';
import { TypographyToken } from '../../constants/typography';

type TextColour = keyof Pick<
  ThemeSurface,
  'textPrimary' | 'textSecondary' | 'textPlaceholder'
>;

interface AppTextProps extends RNTextProps {
  variant?: TypographyToken;
  colour?: TextColour;
}

export default function AppText({
  variant = 'body',
  colour = 'textPrimary',
  style,
  children,
  ...rest
}: AppTextProps) {
  const theme = useTheme();
  const variantStyle = theme.typography[variant] as TextStyle;

  return (
    <RNText
      style={[variantStyle, { color: theme.surface[colour] }, style]}
      {...rest}
    >
      {children}
    </RNText>
  );
}
