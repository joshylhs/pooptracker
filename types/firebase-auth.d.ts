// firebase/auth uses package.json conditional exports to ship a different entry
// point for React Native (which exports `getReactNativePersistence`). TypeScript's
// default resolution doesn't see that conditional, so the export is invisible to
// the compiler even though Metro resolves it correctly at runtime. This shim
// makes the symbol visible to tsc.
import 'firebase/auth';

declare module 'firebase/auth' {
  export function getReactNativePersistence(storage: object): import('firebase/auth').Persistence;
}
