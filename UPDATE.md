# PoopTracker — Handover Notes

## Project Overview

React Native (bare workflow, TypeScript) + Firebase iOS app. iOS-first, no Android target.
Located at `~/pooptracker`. Running on iOS 26 simulator (iPhone 17 Pro) and physical device ("ipone II").

**Stack:**
- React Native (bare) + TypeScript
- Firebase: Firestore, Auth, Messaging (FCM), Cloud Functions
- `@react-native-firebase` modular SDK (v22+)
- Zustand for state management
- `react-native-vector-icons` (MaterialCommunityIcons) for all icons
- React Navigation: stack + bottom tabs

---

## Architecture

### Navigation
```
RootNavigator
  ├── AuthStack       (Welcome → Login / Signup → Onboarding)
  └── AppTabs         (Home | Friends | Profile)
        ├── HomeStack         (HomeMain → HealthSignals)
        └── FriendsStack      (FriendsMain → FriendDetail)
```
Auth state drives routing: unauthenticated → AuthStack, no onboarding → OnboardingScreen, else AppTabs.

### State (Zustand)
- `useAuthStore` — Firebase Auth user, onboarding flag
- `useLogStore` — all logs for the current user; any mutation calls `invalidateLeaderboard()` on the friends store so the self-row count stays fresh
- `useFriendsStore` — friends list, pending requests, leaderboard; 5-minute TTL cache; `force: true` bypasses cache (used on pull-to-refresh and after write actions)
- `useSignalsStore` — dismissedSignals cache; loaded once per session from Firestore; `dismiss()` writes to Firestore and updates in-place immediately so UI reacts without a round-trip; `clear()` called on sign-out

### Hooks
- `useHealthFindings()` — derives active Rome IV findings by combining `useLogStore.logs` + `useSignalsStore.dismissals`. Returns `{ active, all, dismissals, status }`. Used in HomeScreen (banner), AppTabs (badge), and HealthSignalsScreen (findings list). Single source of truth for health state.
- `useTheme()` — single dark theme, not system-adaptive

### Data Layer
- `src/database/logRepository.ts` — all Firestore log read/write; batched writes keep denormalised counters (`dailySummaries`, `monthlyTotals`, `yearlyTotals`) in sync
- `src/services/friends.ts` — friend CRUD, leaderboard fetch (reads the counter docs, not raw logs)
- `src/services/pokes.ts` — FCM token registration + Cloud Function call for sending pokes
- `src/services/users.ts` — user profile reads/writes; includes `avatarEmoji` field
- `src/services/signals.ts` — read/write `dismissedSignals` subcollection; 7-day snooze duration

### Firestore schema (relevant paths)
```
users/{uid}/logs/{logId}
users/{uid}/dailySummaries/{YYYY-MM-DD}        { count }
users/{uid}/monthlyTotals/{YYYY-MM}            { count }
users/{uid}/yearlyTotals/{YYYY}                { count }
users/{uid}/dismissedSignals/{findingId}       { findingId, plainTitle, severity, dismissedAt, snoozedUntil }
users/{uid}                                    { username, avatarInitials, avatarColour, avatarEmoji?, allowPokes, fcmToken }
friendships/{uid}/friends/{friendUid}          { status, initiatedBy, createdAt, acceptedAt }
usernameIndex/{hash}                           { userId }   ← for username search
pokes/{senderId_recipientId}                   { sentAt }   ← rate limit record
```

### Theme
Single dark theme (`src/hooks/useTheme.ts`) — warm dark brown palette, not system-adaptive.
Colours are in `src/constants/colours.ts`. Typography in `src/constants/typography.ts` (caption is 12px).

---

## Key Non-Obvious Decisions

**`cleanSymptoms()` in logRepository** — Firestore rejects `undefined` values. The `Symptoms` interface has optional fields, so before any write we strip `undefined`/`null` entries via `cleanSymptoms()`. Without this, logging with symptoms throws "Unsupported field value: undefined".

**Streak uses `createdAt`, not `date`** — Backdating a log entry shouldn't inflate the streak. `calculateStreaks()` receives summaries built from `createdAt` (when the log was actually created), not the user-selected date.

**Leaderboard reads counter docs, not logs** — `fetchLeaderboardWindow` reads `dailySummaries`/`monthlyTotals`/`yearlyTotals` directly. This is O(friends) reads, not O(friends × logs).

**Username search uses a hash index** — Usernames are stored as SHA-256 hashes in `usernameIndex` for privacy. `searchUser()` hashes the query before looking up.

**`allowPokes` flows from Firestore → UI** — `users/{uid}.allowPokes` (boolean) → `getUserProfile` → `FriendProfile` → `LeaderboardEntry` → `FriendRow` (shows/hides poke button) and `FriendDetailScreen` (shows accepting/not accepting pill).

**Poke rate limit is on the Cloud Function** — 5-minute cooldown enforced server-side in `functions/src/index.ts`. The client also hides the button for 30 minutes after a successful poke (local state only, not persisted).

**Rome IV assessment is pure and derived** — `assessRomeIV(logs)` in `src/utils/romeIV.ts` takes the full log array and returns findings. It is never stored — everything is recomputed from logs + dismissals via `useHealthFindings()`. Snooze (dismiss) is the only thing persisted; findings themselves are always live-derived.

**Health signal popup fires once per finding ID** — `SignalPopup` stores seen finding IDs in AsyncStorage (`@pooptracker/signals_popup_seen`). A `useRef` guard also prevents re-showing within the same session. All new finding IDs found in one check are marked seen together, so only one popup fires per session regardless of how many new patterns emerge simultaneously.

**`signalsStore.dismiss()` updates in-place** — after writing to Firestore it immediately splices the new `DismissedSignal` into the in-memory array. This means the finding disappears from the banner, badge, and Health Signals list instantly without waiting for a Firestore round-trip.

---

## iOS Build Notes

**To run:**
```bash
npm run ios        # builds via Xcode + starts Metro — use this after native changes
npm start          # JS-only hot reload — use this for JS-only changes after first build
```

**Pod setup (already done, only redo if native deps change):**
```bash
cd ios && pod install
```

**Podfile quirks (`ios/Podfile`):**
- `use_frameworks! :linkage => :static` + `$RNFirebaseAsStaticFramework = true` — required for Firebase Swift headers
- `SWIFT_VERSION = '5.0'` override for all pods — Xcode 26 defaults to Swift 6 strict concurrency, FirebaseCore doesn't compile cleanly under it
- RNFBApp and RNFBAuth umbrella headers are stripped of pod-specific `#import` lines at post-install — prevents "declaration must be imported from module X" clang errors when multiple RNFB pods are compiled together
- `pod 'RNVectorIcons'` — explicit pod required for MaterialCommunityIcons font bundling

**Info.plist:** `UIAppFonts` includes `MaterialCommunityIcons.ttf` — required for icons to render (without this they show as ? boxes).

**Physical device errors** — "No provider was found" / CoreDeviceError 4000 are Xcode signing/tunnel issues unrelated to app code. Replug cable or check Apple ID in Xcode → Settings → Accounts.

---

## App Store

| Item | Status | Detail |
|---|---|---|
| Apple Developer account | ✅ Done | |
| App Store Connect record | ✅ Done | App ID: `6772591362` — [appstoreconnect.apple.com/apps/6772591362](https://appstoreconnect.apple.com/apps/6772591362/appstore) |
| Privacy policy | ✅ Done | https://gist.github.com/joshylhs/443f638906a29af028ea43ef66fc758d |
| App icon | ✅ Done | 1024×1024 PNG dropped into `ios/PoopTracker/Images.xcassets/AppIcon.appiconset/` |
| Distribution certificate | ⚠️ Unconfirmed | Xcode → Settings → Accounts → Manage Certificates — need "Apple Distribution" (not just "Apple Development") |
| Screenshots | ❌ Not done | Required: 6.9" and 6.1" device sizes minimum; take from simulator when UI is final |
| TestFlight build | ❌ Not done | Product → Archive in Xcode, then upload via Organiser |
| App Review submission | ❌ Not done | Blocked on screenshots + stable build |

---

## Cloud Functions

Located at `functions/src/index.ts`. Single function: `sendPoke` (v1 API, `asia-southeast1` region).

**Runtime:** Node 22 (updated from Node 20 — **needs a deploy to take effect**).
```bash
cd functions && npm run deploy
```
`skipLibCheck: true` added to `functions/tsconfig.json` — suppresses node_modules type conflicts between React Native globals and the DOM lib.

---

## Pending Deploys ⚠️

Both of these need to be run before publishing:

```bash
# 1. Firestore rules — adds dismissedSignals subcollection permission
firebase deploy --only firestore:rules

# 2. Cloud Functions — picks up Node 22 runtime
cd functions && npm run deploy
```

---

## Shared Components Worth Knowing

- `src/components/shared/InfoModal.tsx` — exports `InfoModal`, `InfoButton`, `InfoRow`. Used for all in-app info/help modals (Bristol types, symptoms, day streak, Health Signals legend). Replaces the old `Alert.alert` pattern.
- `src/components/shared/StatCard.tsx` — `icon?` prop renders an MCI icon above the value; always reserves 20px icon slot so cards stay vertically aligned even without an icon.
- `src/components/shared/Button.tsx` — `icon?` prop renders MCI icon inline with label text.
- `src/components/shared/Avatar.tsx` — accepts `emoji?` prop; renders emoji character at scaled font size instead of initials when set.
- `src/components/shared/AvatarPickerModal.tsx` — bottom-sheet grid of 24 preset emoji avatars. Tap to select, "Remove" to revert to initials. Saves `avatarEmoji` to Firestore via `updateUserProfile`.

---

## Home Screen Features

- **Status banner** — full-width tappable card between title and stat cards. Four states: urgent (red, blood), GP flag (amber, N patterns), all-clear (green), insufficient data (grey). Transparent fill when no actionable findings.
- **Tab badge** — coloured dot on the Home tab icon (rendered in `HomeTabIcon` inside `AppTabs.tsx`) when urgent or GP findings are active. Updates reactively via `useHealthFindings()`.
- **SignalPopup** — fires once per finding ID (AsyncStorage tracking). Shows the most severe new finding in a bottom-sheet modal with "View Health Signals" and "Got it" buttons. One popup per session max.
- **InsightsSection** — collapsible card below the day log card. Contains:
  - Bristol type distribution chart (horizontal bars, last 90 days, colour-coded by type)
  - Weekly frequency chart (8-week vertical bars, current week highlighted)

---

## Health Signals Screen

Accessible via the status banner on Home. Not a tab.

- **? button** next to title → `InfoModal` explaining what's monitored + flag legend.
- **Current findings** — left-bordered cards (3px: red/amber/green). Plain-English copy only — no clinical terminology. Each card has a "Snooze 7d" button that writes to `dismissedSignals` in Firestore and removes the finding from view for 7 days.
- **Past signals** — all-time history of dismissed findings, sorted newest-first with relative timestamps.
- **Disclaimer** at bottom.

---

## Friends Screen — UI Notes

**FriendListCollapsed** (`src/components/friends/FriendListCollapsed.tsx`):
- "Friends (n)" header with a filled pill "manage/hide" button
- Manage button uses `onPressIn`/`onPressOut` for a scale-up pop animation

**LeaderboardList** (`src/components/friends/LeaderboardList.tsx`):
- Sliding tab indicator: absolutely-positioned `Animated.View` springs between tab positions
- "updated just now / Xm ago / Xh ago" pill — green when < 60s old, purple otherwise

**FriendRow** (`src/components/friends/FriendRow.tsx`):
- Poke button inline with username; scale animation on press
- Renders `avatarEmoji` if set on the friend's profile
