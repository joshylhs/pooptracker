export const colours = {
  // Primary — purple
  primary50: '#EEEDFE',
  primary200: '#AFA9EC',
  primary400: '#7F77DD',
  primary600: '#534AB7',
  primary900: '#26215C',

  // Heatmap — green scale
  heat0: 'transparent',
  heat1: '#C0DD97',
  heat2: '#97C459',
  heat3: '#639922',
  heat4: '#3B6D11',

  // Semantic
  destructive: '#D85A30',
  destructiveBg: '#FAECE7',
  destructiveBorder: '#F5C4B3',
  warning: '#BA7517',
  warningBg: '#FAEEDA',
  ideal: '#1D9E75',
  idealBg: '#E1F5EE',

  // Bristol type colours
  bristolConstipated: '#854F0B',
  bristolNormal: '#639922',
  bristolLacking: '#BA7517',
  bristolLoose: '#D85A30',

  // Avatar colours (assigned at signup, one per user)
  avatarPurple: { bg: '#EEEDFE', text: '#3C3489' },
  avatarAmber: { bg: '#FAEEDA', text: '#633806' },
  avatarTeal: { bg: '#E1F5EE', text: '#085041' },
  avatarCoral: { bg: '#FAECE7', text: '#712B13' },
  avatarBlue: { bg: '#E6F1FB', text: '#0C447C' },
} as const;

export type Colours = typeof colours;
