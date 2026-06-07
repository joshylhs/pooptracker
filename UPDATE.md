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
  ├── AuthStack       (Welcome → Signup | Login)   ← fades in on mount
  └── AppTabs         (Home | Friends | Profile)   ← fades in on mount
        ├── HomeStack         (HomeMain → HealthSignals)
        └── FriendsStack      (FriendsMain → FriendDetail)
```
Auth state drives routing: unauthenticated → AuthStack, else AppTabs. **OnboardingScreen is gone** — signup + onboarding merged into SignupScreen (email, password, username, avatar, notification prefs all on one screen). Auth→App and App→Auth transitions both fade in (320ms) on navigator mount.

### State (Zustand)
- `useAuthStore` — Firebase Auth user, onboarding flag
- `useLogStore` — all logs for the current user; any mutation calls `invalidateLeaderboard()` on the friends store so the self-row count stays fresh
- `useFriendsStore` — friends list, pending requests, leaderboard, `trustedFriendIds`; 5-minute TTL cache; `force: true` bypasses cache; `loadTrustedFriends()` fetches own trusted list; `toggleTrust(friendUid)` adds/removes and writes to Firestore
- `useSignalsStore` — acknowledged signals cache; loaded once per session from Firestore; `acknowledge()` writes to Firestore and updates in-place; `onLogSaved(uid, hasBlood)` tracks blood clean log count and auto-resolves at 3; `clear()` called on sign-out

### Hooks
- `useHealthFindings()` — derives LATEST/CURRENT/PAST signal state from `useLogStore.logs` + `useSignalsStore.acknowledged`. Returns `{ latest, current, past, all, status, latestCount }`. Status driven by LATEST only (red → amber → green → grey). Single source of truth for health state.
- `useTheme()` — single dark theme, not system-adaptive

### Data Layer
- `src/database/logRepository.ts` — all Firestore log read/write; batched writes keep denormalised counters (`dailySummaries`, `monthlyTotals`, `yearlyTotals`) in sync
- `src/services/friends.ts` — friend CRUD, leaderboard fetch. `LeaderboardEntry` now includes `countToday`, `currentStreak`, `longestStreak`. `fetchLeaderboardWindow` fetches streak data per user in parallel (30 days of `dailySummaries`) alongside the existing counter reads.
- `src/services/pokes.ts` — FCM token registration + Cloud Function call for sending pokes
- `src/services/users.ts` — user profile reads/writes; includes `avatarConfig` field (pixel avatar)
- `src/services/signals.ts` — read/write `dismissedSignals` subcollection (path unchanged); `AcknowledgedSignal` with `state: 'latest' | 'current' | 'resolved'`; blood auto-resolves after 3 consecutive non-blood logs via `incrementBloodCleanCount`
- `src/services/users.ts` — includes `trustedFriendIds: string[]` on `UserProfile`; `checkTrusted(subjectUid, viewerUid)` checks if viewer is in subject's trusted list; `setTrustedFriend(uid, friendUid, trusted)` adds/removes from own list

### Firestore schema (relevant paths)
```
users/{uid}/logs/{logId}
users/{uid}/dailySummaries/{YYYY-MM-DD}        { count }
users/{uid}/monthlyTotals/{YYYY-MM}            { count }
users/{uid}/yearlyTotals/{YYYY}                { count }
users/{uid}/dismissedSignals/{findingId}       { findingId, plainTitle, severity, acknowledgedAt, state, cleanLogCount? }
users/{uid}                                    { username, avatarInitials, avatarColour, avatarConfig?, allowPokes, trustedFriendIds[], fcmToken }
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

**Rome IV assessment is pure and derived** — `assessRomeIV(logs)` in `src/utils/romeIV.ts` takes the full log array and returns `{ id, severity }` pairs only — no copy. Display copy lives exclusively in `src/utils/signalCopy.ts` (`getSignalCopy(id)`). Findings are never stored — everything recomputed from logs + acknowledged signals via `useHealthFindings()`.

**Health signals use LATEST / CURRENT / PAST model** — LATEST = unacknowledged active findings; CURRENT = acknowledged but still active; PAST = resolved. Status stripe on Home driven by LATEST only. Blood moves to CURRENT on acknowledge, auto-resolves after 3 consecutive non-blood logs (tracked via `cleanLogCount` on `AcknowledgedSignal`). Other patterns move to CURRENT on acknowledge and auto-clear to PAST when Rome IV criteria no longer met.

**Health signal popup has two variants** — warning (new LATEST finding, amber/red accent, "Acknowledge" secondary button) and resolved (green accent, "Got it"). Two separate AsyncStorage keys track seen IDs. `shownThisSession` ref prevents multiple popups per session.

**`signalsStore.acknowledge()` updates in-place** — after writing to Firestore it immediately updates the in-memory `acknowledged` array. UI reacts instantly without a Firestore round-trip.

**Trusted friends are one-directional** — `trustedFriendIds` on your own user doc lists friends you trust with your data. To see a friend's deep stats in Compare, *they* must have *you* in their trusted list (checked via `checkTrusted`). You can grant trust from Profile → FRIENDS section.

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

Located at `functions/src/index.ts`. Two functions, both `asia-southeast1`, Node 22.

| Function | Trigger | Purpose |
|---|---|---|
| `sendPoke` | HTTPS callable | Sends FCM push to a friend; enforces 5-min rate limit |
| `onUserDeleted` | Auth `onDelete` | Cascades deletion: usernameIndex, subcollections, friendships, profile |

**`onUserDeleted` — implementation note:** queries `usernameIndex` with `where('userId', '==', uid)` directly — does NOT recompute a hash from the profile. This means it works even if the profile doc was already deleted or the account never completed onboarding. The old `hashUsername` helper has been removed from the Cloud Function (no longer needed).

**Runtime:** Node 22.
```bash
cd functions && npm run deploy
```
`skipLibCheck: true` in `functions/tsconfig.json` suppresses node_modules type conflicts.

---

## Pending Deploys ⚠️

```bash
# 1. Firestore rules (already deployed — no pending changes as of last session)
firebase deploy --only firestore:rules

# 2. Cloud Functions — deploy onUserDeleted (updated to query by userId, not hash)
cd functions && npm run deploy

# 3. One-time cleanup — delete orphaned usernameIndex entries from before onUserDeleted existed
cd functions && npx ts-node src/cleanupUsernameIndex.ts
# Then delete that script file — it's a one-off
```

---

## Shared Components Worth Knowing

- `src/components/shared/InfoModal.tsx` — exports `InfoModal`, `InfoButton`, `InfoRow`. Used for all in-app info/help modals (Bristol types, symptoms, day streak, Health Signals legend). Replaces the old `Alert.alert` pattern.
- `src/components/shared/StatCard.tsx` — `icon?` prop renders an MCI icon above the value; always reserves 20px icon slot so cards stay vertically aligned even without an icon.
- `src/components/shared/Button.tsx` — `icon?` prop renders MCI icon inline with label text.
- `src/components/shared/Avatar.tsx` — initials-only fallback circle; used when no `avatarConfig` is set.
- `src/components/shared/AvatarPickerModal.tsx` — wraps the pixel avatar picker in a bottom sheet. Saves `avatarConfig` to Firestore via `updateUserProfile`.

---

## Home Screen Features

- **Status bar tab** — tappable card with a coloured left stripe (4px, full height) following the latest signal severity. Replaces the old full-width banner. Taps through to Health Signals.
- **Tab badge** — coloured dot on the Home tab icon (rendered in `HomeTabIcon` inside `AppTabs.tsx`) when urgent or GP findings are active. Updates reactively via `useHealthFindings()`.
- **SignalPopup** — fires once per finding ID (AsyncStorage tracking). Shows the most severe new finding in a bottom-sheet modal with "View Health Signals" and "Got it" buttons. One popup per session max.
- **InsightsSection** — collapsible card below the day log card. Expands/collapses with `LayoutAnimation` (220ms) + chevron rotation; auto-scrolls to bring the header to the top of the viewport on expand, and restores the previous scroll position on collapse. Contains:
  - **Shared legend** at the top of the expanded body: Too loose / Ideal / Too hard swatches (3 items); small italic note "lighter segments = untyped" beneath.
  - **Bristol type distribution donut** (SVG, last 90 days). Four groups: Too hard (brown), Ideal (green), Too loose (orange), Untyped (translucent white `rgba(255,255,255,0.18)`). Segments have a 0.5° overlap to eliminate SVG anti-aliasing seams. Centre shows 3-line idle stats (hard/ideal/loose %). Untyped shown as a footnote ("N untyped") below the chart only when present. Hold a segment: others dim, held segment expands, floating tooltip shows group + type breakdown.
  - **Weekly frequency chart** (6-week stacked bar, 120px fixed height). Segments: Below (brown), Ideal (green), Over (orange), Untyped (translucent). Y-axis auto-stepped. Current week has purple tint. Long-press for floating tooltip. Dynamic insight sentence.

---

## Health Signals Screen

Accessible via the status bar tab on Home. Not a tab.

- **Inline legend** — Urgent / GP flag / Info coloured pills sit below the title, always visible.
- **? button** next to title → `InfoModal` explaining Rome IV and the 6 monitored criteria. Includes a tappable link to the Rome IV foundation reference.
- **LATEST section** — new unacknowledged findings. Left-bordered cards with severity pill. Blood cards show a GP recommendation note. Each card has an **Acknowledge** button (moves to CURRENT).
- **CURRENT section** — acknowledged, still-active findings. Blood cards show `X/3 clean logs recorded` progress. Auto-clears to PAST when criteria no longer met (blood: 3 consecutive clean logs; others: Rome IV no longer triggered).
- **STATUS section** — shown when no LATEST/CURRENT findings; displays all_clear or insufficient_data info card.
- **PAST section** — resolved findings as full cards with severity pill, resolved pill, relative date, and body copy.
- **Disclaimer** at bottom.

---

## Animations

All animations use `useNativeDriver: true` (transform/opacity) unless otherwise noted.

| Location | Animation | Implementation |
|---|---|---|
| `AuthStack` | Fade in on mount (320ms) | `Animated.timing` in `useEffect` |
| `AppTabs` | Fade in on mount (320ms) | `Animated.timing` in `useEffect` |
| `AppTabs` — tab switch | Each tab fades in on focus (200ms) | `FadeTab` wrapper + `useFocusEffect` |
| `InsightsSection` — expand/collapse | Height + opacity (220ms) | `LayoutAnimation.configureNext` |
| `InsightsSection` — auto-scroll | Scrolls to section on expand; restores position on collapse | `scrollRef` + `insightsYRef` in HomeScreen |
| `CalendarHeatmap` — month switch | Slide left/right (40px) + fade (160ms); rows spring-pop in staggered (45ms/row) | `Animated.parallel` + `Animated.stagger` |
| `ProfileScreen` — reminder add/remove | Height + opacity (220ms) | `LayoutAnimation.configureNext` |
| `LoginScreen` — forgot password link | Opacity dim on press (0.45) | Pressable `style={({ pressed }) => ...}` |
| `CatAvatarCircle` — inactive mood | Slow sleeping breath: cat bobs inside fixed circle (amp 3pt, fall 1300ms, pause 1400ms, rise 1600ms) | `Animated.loop` + `Animated.sequence` + `Animated.delay`; `useNativeDriver: true` |
| `CatAvatarCircle` — proud mood | Perky bounce: cat bobs inside fixed circle (amp 4pt, fall 600ms, rise 800ms) | same pattern, no pause phase |

---

## Auth Error Handling

`friendlyAuthError(e)` in `src/services/auth.ts` maps Firebase error codes to plain-English messages. Used in both LoginScreen and SignupScreen catches. Covers: `invalid-credential`, `wrong-password`, `user-not-found`, `email-already-in-use`, `weak-password`, `invalid-email`, `user-disabled`, `too-many-requests`, `network-request-failed`. Falls through to "Something went wrong — try again." for unknown codes. `operation-not-allowed` intentionally not mapped (developer misconfiguration, not a user-facing error).

SignupScreen has a `generalError` slot (shown above submit button) for non-field errors (network, rate limit). Field-specific errors still attach to their field (`emailError`, `passwordError`, `usernameError`).

---

## Cat Avatar Mood System

Leaderboard avatars display one of three moods, computed fresh on each leaderboard fetch. Mood is not stored — it's derived from live data.

### Priority order
1. **Inactive** — `countToday === 0` (no logs since midnight). Closed eyes, flat mouth, no cheeks, zzz overlay. Slow sleeping-breath bob animation.
2. **Proud** — `currentStreak === longestStreak && currentStreak > 0` (currently on personal best streak). Gold sparkle eyes, smile, blush. Perky bounce animation.
3. **Default** — everything else. Normal round eyes, smile, blush. No animation.

### Key files
- `src/utils/moodUtils.ts` — `getMood(entry, rank): Mood` — sole source of truth for mood logic
- `src/components/avatar/CatAvatarCircle.tsx` — accepts `mood` prop; maps mood → eye/mouth overrides; renders zzz overlay outside the `overflow:hidden` circle; drives animation via `Animated.loop`
- `src/components/avatar/CatEyes.tsx` — added `closed`, `halflidded`, `proud` mood-only eye variants (not user-selectable); `sparkle` eye falls through to `round` for legacy users
- `src/components/avatar/CatBody.tsx` — added `flat` mouth variant
- `src/components/avatar/CatAvatar.tsx` — added `moodEyes` and `mouthStyle` props; mood overrides take priority over user config
- `src/components/friends/LeaderboardList.tsx` — computes mood per entry, passes to `FriendRow`

### Animation design
Both animated moods use `translateY` on the SVG **inside** the fixed circle — the circle clips naturally. The zzz overlay sits outside the circle as an absolutely-positioned sibling so it is never clipped.

| Mood | Amplitude | Fall | Pause | Rise |
|---|---|---|---|---|
| Inactive | 3pt | 1300ms | 1400ms | 1600ms |
| Proud | 4pt | 600ms | — | 800ms |

### Avatar picker changes
- `sparkle` removed from user-selectable eye options (`EYE_STYLES = ['round', 'button']`)
- Existing users with `sparkle` saved silently render as `round` — no migration needed

---

## Heatmap Midnight Fix

`CalendarHeatmap` previously computed `today` once on mount, so the highlighted date wouldn't update if the app stayed open past midnight. Fixed by replacing the frozen `useMemo(() => new Date(), [])` with a `useState` + `setInterval` that ticks every 60 seconds. `todayString(now)` is called with the live `now` value, so the today highlight and `isCurrentMonth` guard both self-correct within one minute of midnight.

---

## Upcoming Work (next session)

### Account deletion flow (replacing password re-auth)
- Replace password confirmation with "type DELETE" text input
- Add optional reason dropdown + free-text field
- On confirm: submit feedback → delete account → AuthStack fades in
- Reason dropdown options: TBD (to finalise)

### Feedback collection
- **Architecture:** App → Cloud Function (authenticated callable) → Google Sheets API directly (no Firestore intermediate step)
- **Destination:** Google Sheet owned by developer; Cloud Function appends one row per submission: `[timestamp, uid, type, reason, freeText]`
- **Setup needed:** Google Cloud service account with Sheets API access; sheet ID; service account key as Cloud Functions env secret; `googleapis` npm package in `functions/`
- **Same pipeline** for independent general feedback form (Profile screen "Send feedback" button) — just `type: 'general'` vs `type: 'deletion'`
- **Status:** Waiting on developer to create the Google Sheet and service account before coding begins

---

## Friends Screen — UI Notes

**FriendListCollapsed** (`src/components/friends/FriendListCollapsed.tsx`):
- "Friends (n)" header with a filled pill "manage/hide" button
- Manage button uses `onPressIn`/`onPressOut` for a scale-up pop animation

**LeaderboardList** (`src/components/friends/LeaderboardList.tsx`):
- Sliding tab indicator: absolutely-positioned `Animated.View` springs between tab positions
- "updated just now / Xm ago / Xh ago" pill — green when < 60s old, purple otherwise
- `ActivityIndicator` uses `color={surface.textPrimary}` (inline loading spinner, shown before first load)
- Pull-to-refresh `RefreshControl` in `FriendsScreen.tsx` uses `tintColor={surface.textPrimary}` so the iOS system spinner matches the text colour

**FriendRow** (`src/components/friends/FriendRow.tsx`):
- Poke button inline with username; scale animation on press
- Renders `CatAvatarCircle` (pixel avatar) if `avatarConfig` is set; falls back to `Avatar` (initials circle)
- Both avatar types render at size 48 so all rows have consistent height
- Accepts `mood` prop (`'inactive' | 'proud' | 'default'`) computed by `LeaderboardList` and forwarded to `CatAvatarCircle`

**CompareSection** (`src/components/friends/CompareSection.tsx`):
- Lives above the leaderboard on FriendsScreen
- `+` pill button opens a friend picker modal; selection persisted to AsyncStorage
- Horizontal FlatList carousel, paginated; vertical dots on the right indicate position
- Non-trusted friends: 3 cards (today, weekly avg, streak)
- Trusted by them (checked via `checkTrusted`): unlocks a 4th card (most common Bristol type this week)
- Each card (`CompareCard`) shows avatar + name side by side, big value, label, thin vertical divider

**Trusted friends (Profile → FRIENDS section)**:
- Per-friend toggle rows under "Allow pokes"
- Writes to `trustedFriendIds[]` on own user doc via `setTrustedFriend`
- Trust is one-directional: granting trust lets that friend see your deep stats in Compare

---

## App Name

Display name: **Sit On It** (set in `app.json` and `ios/PoopTracker/Info.plist` `CFBundleDisplayName`). Internal Xcode target remains `PoopTracker`.

---

## In Progress — Compare Tab + Trusted Friends

The foundation is built (services, store, ProfileScreen toggle, CompareCard, CompareSection wired into FriendsScreen) and TypeScript is clean. What still needs work / testing:

### Known gaps to address next session

**CompareSection carousel**
- Card 5 (weekly frequency chart side by side) not yet implemented — agreed it should show two mini stacked bar charts with a thin vertical divider between them, full width, no x-axis labels (rely on visual shape). This is the richest trusted card and replaces the need for an expand entirely.
- Card 6 (health signal status — colour dot + label) not yet implemented. Shows their status if trusted, "Private" with a lock icon if not. Their signal status requires reading their `dismissedSignals` subcollection — needs a `fetchFriendSignalStatus(uid)` service function.
- Card 4 (Bristol type) currently shows `--` for the friend's value — needs their logs. Trusted friends' logs are readable via Firestore rules (`knowsUser` rule), so `fetchFriendLogs(uid, days)` service function needed.

**Firestore rules**
- `trustedFriendIds` write rule needed: only the owner can write their own `trustedFriendIds` field. Currently no rule explicitly covers this — relies on the general user doc write rule.
- `dismissedSignals` subcollection read rule: trusted friends should be able to read it. Currently only the owner can read. Needs `isTrustedBy(request.auth.uid, userId)` helper in rules.

**Profile screen trusted friends**
- `loadAll()` is called on mount to populate `friends` list — but if the user has no friends yet, the trusted section correctly doesn't render (guarded by `friends.length > 0`). Works as expected.
- Currently no loading state shown while trust toggle is saving — fine for now, the optimistic update (set state immediately, then write) makes it feel instant.

**CompareSection card width**
- `SCREEN_W - 32 - 24` assumes 16px horizontal padding on FriendsScreen scroll + 12px for dots. May need tuning once tested on device — if cards clip or leave gaps, adjust the constant.

**Friend picker persistence**
- Selected friend is stored in AsyncStorage by UID. If that friend is later removed, the UID won't match any friend in the list and `setSelectedFriend` will silently stay null — the section will show "Choose friend" as if nothing was selected. This is correct behaviour, no fix needed.

### Agreed full card set (6 cards for trusted)
1. Today — yours vs theirs
2. Weekly avg — yours vs theirs
3. Streak — yours vs theirs
4. Most common Bristol type this week — requires friend's logs (trusted only)
5. Weekly frequency chart side by side — mini stacked bars, thin divider (trusted only)
6. Health signal status — colour dot + label (trusted only; "Private" if not trusted)

### Files involved
- `src/components/friends/CompareSection.tsx` — main carousel, friend picker, data fetching
- `src/components/friends/CompareCard.tsx` — individual card layout
- `src/services/users.ts` — `checkTrusted`, `setTrustedFriend` (done)
- `src/store/friendsStore.ts` — `trustedFriendIds`, `toggleTrust`, `loadTrustedFriends` (done)
- `src/screens/profile/ProfileScreen.tsx` — trusted friends toggle list (done)
- `src/screens/friends/FriendsScreen.tsx` — CompareSection wired in (done)
- `firestore.rules` — needs update for `trustedFriendIds` write + `dismissedSignals` read by trusted friends
