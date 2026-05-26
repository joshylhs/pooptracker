export { default as CatAvatar, BODY_COLORS, WALL_COLORS } from './CatAvatar';
export type { BodyColor, WallColor } from './CatAvatar';
export type { EyeStyle, EyeColor, EyeSecondary } from './CatEyes';
export type { HeaddressStyle } from './CatHeaddress';
export { default as AvatarPicker } from './AvatarPicker';
export type { AvatarConfig } from './AvatarPicker';
export { default as CatAvatarCircle } from './CatAvatarCircle';

export const DEFAULT_AVATAR_CONFIG: import('./AvatarPicker').AvatarConfig = {
  bodyColor:    'cream',
  snoutColor:   'white',
  eyeStyle:     'round',
  eyePrimary:   'dark',
  eyeSecondary: 'white',
  headdress:    'none',
  wallColor:    'none',
};
