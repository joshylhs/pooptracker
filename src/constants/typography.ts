import { TextStyle } from 'react-native';

// No fontFamily — uses the platform's default system font (San Francisco on iOS,
// Roboto on Android).
export const typography = {
  screenTitle: { fontSize: 24, fontWeight: '500' },
  sectionHeading: { fontSize: 18, fontWeight: '500' },
  bodyEmphasis: { fontSize: 15, fontWeight: '500' },
  body: { fontSize: 13, fontWeight: '400' },
  caption: { fontSize: 11, fontWeight: '400' },
} as const satisfies Record<string, TextStyle>;

export type TypographyToken = keyof typeof typography;
