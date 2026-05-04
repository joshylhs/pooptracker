import { useColorScheme } from 'react-native';
import { colours } from '../constants/colours';
import { typography } from '../constants/typography';

// Single visual identity: warm dark brown, Claude-adjacent. Not driven by system
// colour scheme — both light and dark return the same surface palette for now.
// Brand colours (purple, coral, heatmap greens) stay unchanged in `colours`.
const warmDarkSurface = {
  background: '#2b2928', // originally '#2C2622'
  surface: '#3c3a38', // '#3c3a38'
  border: '#4A4239',
  textPrimary: '#F5EFE6',
  textSecondary: '#B8AE9F',
  textPlaceholder: '#7A6F60',
};

export type ThemeSurface = typeof warmDarkSurface;

export interface Theme {
  scheme: 'light' | 'dark';
  colours: typeof colours;
  surface: ThemeSurface;
  typography: typeof typography;
}

export function useTheme(): Theme {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  return {
    scheme,
    colours,
    surface: warmDarkSurface,
    typography,
  };
}
