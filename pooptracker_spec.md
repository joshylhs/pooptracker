# PoopTracker — Project Specification

## Overview

A social poop tracking app for iOS (Android deferred post-v1). Users log their bowel movements, view their history on a calendar heatmap, and compete with friends on a leaderboard. Built to be modular and scalable for future features including ML-powered insights and games.

---

## Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | React Native (TypeScript) | Cross-platform, employable skill, large ecosystem |
| Language | TypeScript | Type safety, catches bugs early, industry standard |
| Auth | Firebase Auth | Handles signup, login, Apple sign-in (App Store requirement) |
| Database | Firestore | Real-time, scalable, works well with React Native |
| Firebase SDK | `@react-native-firebase` (native SDK) | Native modules for Auth and Firestore; better performance and reliability than the JS SDK on device. Auth token persistence handled natively (Keychain on iOS). |
| Notification pref persistence | `@react-native-async-storage/async-storage` | Stores per-user notification preferences locally (key: `@pooptracker/notif_prefs/{uid}`) so settings survive app restarts without a Firestore round-trip. |
| Username hashing | `js-sha256` + `tweetnacl-util` | One-way SHA-256 of the normalised username, base64-encoded for use as a Firestore document ID. Prevents storing plaintext usernames in the queryable `usernameIndex`. No other cryptography is used. |
| State management | Zustand | Lightweight, beginner-friendly, scales well |
| Navigation | React Navigation v7 | Standard for React Native, flexible |
| Notifications | Notifee | Best-in-class local notifications for React Native |
| Push notifications (pokes) | Firebase Cloud Functions + FCM | Server-side poke delivery via `sendPoke` callable function (`asia-southeast1`, Node 22) |
| Icons | `react-native-vector-icons` (MaterialCommunityIcons) | Tab icons, symptom icons, button icons, poke button |
| Styling | StyleSheet (React Native built-in) | No extra dependency for v1 |
| Charts / heatmap | react-native-calendars + custom heatmap | Calendar base, custom colour intensity layer |

---

## Folder Structure

```
src/
├── screens/
│   ├── auth/
│   │   ├── WelcomeScreen.tsx
│   │   ├── SignupScreen.tsx
│   │   ├── LoginScreen.tsx
│   │   └── OnboardingScreen.tsx       # notification preferences setup
│   ├── home/
│   │   ├── HomeScreen.tsx             # heatmap + quick log + day detail + insights
│   │   └── HealthSignalsScreen.tsx    # Rome IV findings + past signals history
│   ├── friends/
│   │   ├── FriendsScreen.tsx          # leaderboard + collapsed friend list
│   │   └── FriendDetailScreen.tsx     # friend's heatmap + stats
│   └── profile/
│       └── ProfileScreen.tsx          # stats + settings + account
│
├── components/
│   ├── log/
│   │   ├── LogButton.tsx              # primary CTA on home screen (quick log + add details)
│   │   ├── LogEntryModal.tsx          # detailed log entry sheet
│   │   ├── BristolSelector.tsx        # type 1-7 picker with icons + descriptions
│   │   ├── SymptomsGrid.tsx           # symptom tile grid (blood/pain/straining/bloating/incomplete/assisted)
│   │   └── DayLogCard.tsx             # expanded day detail below heatmap
│   ├── heatmap/
│   │   └── CalendarHeatmap.tsx        # calendar with colour intensity per day
│   ├── friends/
│   │   ├── LeaderboardList.tsx        # ranked list with day/week/month/year tabs
│   │   ├── FriendListCollapsed.tsx    # collapsed friend management row
│   │   └── FriendRow.tsx             # single friend row; renders CatAvatarCircle or Avatar fallback
│   ├── home/
│   │   ├── InsightsSection.tsx        # collapsible Bristol distribution + weekly frequency charts
│   │   └── SignalPopup.tsx            # one-time bottom-sheet popup for new Rome IV findings
│   └── shared/
│       ├── StatCard.tsx               # reusable metric card (streak, today, avg); icon prop reserves slot even when unused
│       ├── Avatar.tsx                 # initials circle avatar (fallback when no avatarConfig)
│       ├── AvatarPickerModal.tsx      # pixel avatar picker bottom sheet; saves avatarConfig to Firestore
│       ├── Button.tsx                 # primary / secondary / destructive variants; icon prop adds MCI icon inline
│       ├── InfoModal.tsx              # shared info/help modal + InfoButton + InfoRow types; footerLabel/footerUrl props for tappable links
│       ├── ScreenContainer.tsx        # safe-area aware scroll wrapper
│       ├── Text.tsx                   # themed AppText with variant prop
│       ├── TextField.tsx              # labelled input with error state
│       └── Toast.tsx                  # brief success/error toast overlay
│
├── navigation/
│   ├── RootNavigator.tsx              # switches between Auth, Onboarding, and App; renders OnboardingScreen directly (not inside AuthStack)
│   ├── AuthStack.tsx                  # Welcome, Signup, Login
│   ├── AppTabs.tsx                    # Home, Friends, Profile bottom tabs; HomeTabIcon shows coloured badge dot for urgent/gp findings
│   ├── HomeStack.tsx                  # stack: HomeMain → HealthSignals
│   └── FriendsStack.tsx              # stack navigator wrapping FriendsScreen + FriendDetailScreen
│
├── database/
│   └── logRepository.ts               # Firestore-backed log CRUD; writes log doc + atomic increments to dailySummaries / monthlyTotals / yearlyTotals
│
├── services/
│   ├── firebase.ts                    # Firebase app initialisation
│   ├── auth.ts                        # signup, login, logout, password reset, reauthentication, account deletion
│   ├── logs.ts                        # thin async wrapper around logRepository — applies the current user's uid and triggers notification suppression on quick log
│   ├── friends.ts                     # friend requests, friendships, leaderboard queries (reads rollup docs)
│   ├── users.ts                       # user profile reads and writes
│   ├── pokes.ts                       # FCM token registration + sendPoke Cloud Function callable
│   ├── notificationPrefs.ts           # AsyncStorage-backed per-user notification preferences (load/save, migration from legacy key)
│   └── notifications.ts              # Notifee scheduling and cancellation; supports up to MAX_NOTIFICATION_SLOTS (5) daily triggers
│
├── store/
│   ├── authStore.ts                   # current user, auth state
│   ├── logStore.ts                    # log entries for current user
│   ├── friendsStore.ts               # friends list, leaderboard data
│   └── signalsStore.ts               # dismissedSignals cache; loaded once per session; dismiss() updates in-place
│
├── hooks/
│   ├── useHealthFindings.ts           # derives active Rome IV findings from logs + dismissals; single source of truth for health state
│   └── useTheme.ts                   # returns colour tokens + surface palette for current colour scheme
│
├── utils/
│   ├── bristolData.ts                 # type definitions, icons, descriptions, colours
│   ├── heatmapUtils.ts               # compute intensity per day from log counts
│   ├── streakUtils.ts                 # calculate current streak and personal best
│   ├── dateUtils.ts                   # date formatting helpers
│   ├── statsUtils.ts                  # weekly avg, monthly avg, all-time stats
│   ├── romeIV.ts                      # assessRomeIV(logs) → RomeFinding[] ({ id, severity } only — no copy)
│   ├── signalCopy.ts                  # getSignalCopy(id) → { title, body } — sole source of truth for finding display text
│   └── encryption.ts                  # username normalisation + SHA-256 hash for the usernameIndex doc ID. No other cryptography.
│
└── constants/
    ├── colours.ts                     # app colour palette
    └── typography.ts                  # font sizes and weights
```

---

## Firestore Data Model

> All Firestore documents are stored in **plaintext**. Access control is enforced by Firestore Security Rules (see `firestore.rules`), not by client-side encryption. Visibility is rule-gated: a user can read their own logs and rollups; friends (accepted friendships only) can read each other's daily/monthly/yearly count rollups and minimal profile fields; nobody else can read anything.
>
> The architecture was originally per-recipient encrypted; that was removed because the cryptographic complexity was disproportionate to the threat model (Firebase staff and admin SDK access remain trust-boundary issues either way, and rules are the standard, well-tested mechanism for cross-tenant isolation). The username hash on `usernameIndex` is the only remaining client-side cryptographic step.
>
> Email and display name are **never** written to Firestore. They live in Firebase Auth only. Firestore references users by anonymous UID exclusively.

### `users/{userId}`
```typescript
{
  uid: string,
  username: string,                    // plaintext; readable by self and accepted/pending friends only (rules)
  // displayName lives in Firebase Auth only — not duplicated to Firestore
  avatarInitials: string,              // e.g. "JL"
  avatarColour: string,                // hex, assigned on signup
  createdAt: number,                   // ms since epoch (client clock)
  updatedAt: serverTimestamp,

  // pixel avatar (optional — falls back to initials circle if absent)
  avatarConfig?: AvatarConfig,         // stored as plain object; rendered by CatAvatarCircle

  // notification preferences (set during onboarding, editable in profile)
  notifications: {
    enabled: boolean,
    times: string[],                   // ["HH:MM", ...] 24hr format; supports up to 5 slots; default ["09:00"]
    smartSuppress: boolean,
  },

  // pokes
  allowPokes: boolean,                 // user preference; defaults to true
  fcmToken: string,                    // latest FCM device token, set by registerFcmToken() on login
}
```

### `users/{userId}/logs/{logId}`
Individual logs. Strictly owner-readable — friends never see raw entries.
```typescript
{
  timestamp: number,                   // ms since epoch
  bristolType: 1 | 2 | 3 | 4 | 5 | 6 | 7 | null,
  symptoms: {                          // all fields optional; undefined/null stripped before write (cleanSymptoms)
    blood?: boolean,
    pain?: 'mild' | 'severe',
    straining?: 'mild' | 'severe',
    bloating?: boolean,
    incomplete?: boolean,
    assisted?: boolean,
  },
  notes: string | null,
  isQuickLog: boolean,                 // true = bare quick-log; false = detailed
  date: string,                        // "YYYY-MM-DD" derived from timestamp; queried for day view
  createdAt: number,
  updatedAt: number,
}
```

### `users/{userId}/dailySummaries/{date}` &nbsp;·&nbsp; `users/{userId}/monthlyTotals/{YYYY-MM}` &nbsp;·&nbsp; `users/{userId}/yearlyTotals/{YYYY}`
Pre-aggregated count rollups maintained atomically by `logRepository`. Each log insert/delete/date-edit batches a write to all three using `FieldValue.increment(±1)`.
```typescript
{ count: number }
```
Readable by self and accepted friends. Powers the heatmap (one daily doc per cell) and the leaderboard (one rollup doc per window).

### `usernameIndex/{usernameHash}`
```typescript
// usernameHash = SHA-256(normalise(username)) — deterministic, computed client-side.
// Normalisation: trim → Unicode NFC → lowercase. Applied identically on signup
// and search so case and diacritic variants resolve to the same hash.
// Plaintext usernames are never written here; only the one-way hash. Any signed-in
// user can read this collection — that's fine, it leaks no PII.
{
  usernameHash: string,                // document ID is the hash itself
  userId: string,                      // anonymous UID of the owning user
  createdAt: serverTimestamp,
}
```

**Friend search flow:**
1. User types a username.
2. App normalises (trim → NFC → lowercase) and computes SHA-256 client-side.
3. App reads `usernameIndex/{usernameHash}` — one doc-id lookup, no scan.
4. If hit, app sends a friend request to the returned userId. The recipient's profile is **not** read at this stage (rules forbid until a friendship record exists). Search results display only the typed username + a derived avatar.
5. After the recipient sees the pending request and the underlying friendship doc, the rule's `knowsUser` predicate becomes true and either side can read the other's profile.

### `pokes/{senderId_recipientId}`
Rate-limit record written after each successful poke. Document ID is `{senderId}_{recipientId}`.
```typescript
{
  senderId: string,
  recipientId: string,
  sentAt: serverTimestamp,
  message: string,                     // resolved message (custom or default)
}
```
Cooldown is enforced server-side in the Cloud Function (5-minute TTL). Client-side hides the poke button for 30 minutes after a successful poke (local state, not persisted).

### `friendships/{userId}/friends/{friendId}`
Two records per friendship — one in each user's list. Cross-user writes are scoped by rules: `friendId` may create a pending record in `userId`'s list only if the doc's `initiatedBy === friendId`, and `friendId` may transition that record to `accepted` only if `initiatedBy === userId`.
```typescript
{
  friendId: string,                    // the OTHER user — i.e. not the path's userId
  status: "pending" | "accepted",
  initiatedBy: string,                 // who sent the request
  createdAt: serverTimestamp,
  acceptedAt: serverTimestamp | null,
}
```

---

## Privacy Design

The app keeps user data private through a combination of **rule-gated Firestore access** and **never persisting raw log content beyond the owner**. The original v1 plan included client-side per-recipient encryption; that was removed as cryptographically over-engineered relative to the threat model (rules already isolate users from each other, and the developer + Firebase admin remain trust-boundary parties either way).

**Owner-only raw logs**
- Each user's individual logs (`users/{uid}/logs/{logId}`) are readable only by that user. Friends never see Bristol type, duration, notes, or per-log timestamps.
- Firestore Security Rules (`firestore.rules`) enforce this: `allow read, write: if isOwner(userId)` on the logs subcollection.

**Friend visibility, by rules**
- Friends with an `accepted` relationship can read each other's count rollups (`dailySummaries`, `monthlyTotals`, `yearlyTotals`). Counts only — never the underlying logs.
- Friends with any relationship (`pending` or `accepted`) can read each other's profile (`users/{uid}` top-level doc): username, avatar, notifications. Required so a recipient can display an incoming request card.
- Non-friends cannot read anything.
- The `isFriend()` rule does a `get()` on the requester's friendships subcollection to verify the relationship — costs one extra doc read per gated read, but is the standard Firestore pattern and is cached within a request.

**No cleartext usernames in Firestore**
- The `usernameIndex` collection stores only `SHA-256(normalise(username)) → userId`. Search reduces to a one-doc lookup against an opaque hash. The developer cannot recover usernames from the index.
- The owner's plaintext username does live in `users/{uid}.username`, but that doc is rule-gated to self + friendship relations.

**Anonymous identity in Firestore**
- Email is held by Firebase Auth for account recovery only — never written to Firestore.
- Display name is held by Firebase Auth only — never duplicated to Firestore.
- All Firestore references use the anonymous UID.

**Trust boundary**
- Firebase staff and the admin SDK can read all data. This is the same trust boundary every Firestore-backed app accepts; the encryption-based design did not actually move this boundary because keys were stored in services Apple/Google can also access.
- Future migration to a self-hosted backend or end-to-end encrypted social layer is noted as a v3+ hook, not v1.

**Friend visibility scope (v1)**
- Friends see: heatmap intensity (count per day) and leaderboard rank in 4 windows.
- Friends do not see: individual logs, Bristol type, duration, notes, or per-log timestamps.

**Future encrypted-data layer** is preserved as a v3 feature hook (see Future Feature Hooks).

---

## Bristol Scale Data

```typescript
// src/utils/bristolData.ts

export const BRISTOL_TYPES = [
  {
    type: 1,
    label: "Separate hard lumps",
    description: "Like nuts, hard to pass",
    category: "constipated",
    colour: "#854F0B",
  },
  {
    type: 2,
    label: "Lumpy sausage",
    description: "Sausage-shaped but lumpy",
    category: "constipated",
    colour: "#854F0B",
  },
  {
    type: 3,
    label: "Cracked sausage",
    description: "Sausage with cracks on surface",
    category: "normal",
    colour: "#639922",
  },
  {
    type: 4,
    label: "Smooth sausage",
    description: "Smooth and soft, ideal",
    category: "ideal",
    colour: "#3B6D11",
  },
  {
    type: 5,
    label: "Soft blobs",
    description: "Soft with clear edges",
    category: "lacking_fibre",
    colour: "#BA7517",
  },
  {
    type: 6,
    label: "Fluffy pieces",
    description: "Mushy with ragged edges",
    category: "loose",
    colour: "#D85A30",
  },
  {
    type: 7,
    label: "Watery",
    description: "No solid pieces, entirely liquid",
    category: "diarrhoea",
    colour: "#993C1D",
  },
];
```

---

## Navigation Structure

```
RootNavigator
├── AuthStack (shown when no authenticated user)
│   ├── WelcomeScreen
│   ├── SignupScreen
│   └── LoginScreen
│
├── OnboardingScreen (shown when authenticated but onboarding not completed)
│   # Rendered directly by RootNavigator — not inside AuthStack
│
└── AppTabs (shown when authenticated + onboarding complete)
    ├── HomeStack
    │   ├── HomeScreen                # heatmap + quick log + insights + health bar tab
    │   │   └── LogEntryModal         # slides up over home, detailed entry
    │   └── HealthSignalsScreen       # Rome IV findings + past signals history
    ├── FriendsStack
    │   ├── FriendsScreen
    │   └── FriendDetailScreen        # pushed screen, friend's heatmap + stats
    └── ProfileScreen
```

---

## Screen Specifications

### HomeScreen

**Displays:**
- Title: "Homepage"
- Health status bar tab — coloured left stripe (4px) + status text + chevron; colour follows highest-severity active finding (urgent=red, gp=amber, info=green, none=muted). Taps to HealthSignalsScreen.
- Stat cards row: current streak / today's count / monthly avg
- Calendar heatmap (current month, navigable by month)
  - Colour intensity: 0 logs = white/empty, 1 = light green, 2 = medium, 3 = dark, 4+ = darkest
  - Today highlighted with purple outline
  - Selected day highlighted with coral outline
- Day log card (accordion — expands below calendar on day tap, collapses on re-tap or different day tap)
  - Shows each log as a row: time | Bristol type | duration | notes | edit link
  - Tapping edit opens LogEntryModal pre-filled with that log's data
  - Tapping empty day: shows "no logs" + quick log prompt
- InsightsSection — collapsible card below day log card; Bristol distribution chart + 8-week frequency chart
- SignalPopup — fires once per finding ID (AsyncStorage); shows most severe new finding; one popup per session max
- Quick log button (primary CTA, always visible)
  - One tap saves a log at current timestamp with no details
  - "Add details instead" link below opens LogEntryModal

**Actions:**
- Tap health bar tab → navigate to HealthSignalsScreen
- Tap "+" quick log → save log, update heatmap, update stat cards
- Tap "add details instead" → open LogEntryModal (empty)
- Tap heatmap day → expand/collapse day log card
- Tap edit on a log entry → open LogEntryModal (pre-filled)
- Navigate calendar month → prev/next month arrows

### HealthSignalsScreen

Pushed from HomeScreen via the health bar tab. Not a bottom tab.

**Displays:**
- Back button → "Home"
- Title: "Health Signals" + `?` InfoButton
- Inline legend: Urgent / GP flag / Info coloured pills (always visible, not behind the `?`)
- `?` InfoModal: explains Rome IV criteria + lists the 6 monitored signals + tappable link to Rome IV journal (Gastroenterology, 2016)
- CURRENT FINDINGS — left-bordered cards (3px) for urgent/gp findings; each has **Snooze 1d** and **Dismiss** buttons
  - Snooze 1d: hides for 1 day
  - Dismiss: hides for 90 days (matches assessment window; re-surfaces if pattern resolves and re-emerges)
- CURRENT STATUS — shown when no actionable findings (all_clear or insufficient_data)
- PAST SIGNALS — expanded cards: severity pill + date, title, body text, snooze type label
- Disclaimer at bottom (italic)

**Actions:**
- Tap Snooze 1d / Dismiss → writes to `dismissedSignals`, immediately removes from active list
- Tap `?` → InfoModal
- Tap Rome IV link → opens journal article in browser (Linking.openURL)

---

### LogEntryModal

**Displays:**
- Bristol selector: 7 items, each with SVG icon + type number + short label + one-line description
  - Type 4 highlighted as ideal
  - Colour coded: types 1-2 brown, types 3-4 green, types 5-7 coral/amber
- Timestamp field (auto-filled to now, editable)
- Duration field (optional, numeric)
- Notes field (optional, multiline text)
- Save button / Cancel button
- Delete button (only shown when editing an existing log)

**Actions:**
- Select Bristol type
- Edit timestamp
- Enter duration
- Enter notes
- Save → write to Firestore, dismiss modal, update heatmap
- Delete → confirm dialog, delete from Firestore, dismiss modal, update heatmap
- Cancel / dismiss → no changes

### FriendsScreen

**Displays:**
- Collapsed friend list card: "Friends (N)" with a filled "manage/hide" pill button — expands to show friend list with add/remove options and pending requests
- Leaderboard section
  - "Leaderboard" title + "updated X ago" pill (green if < 60s, purple otherwise)
  - Day / Week / Month / Year sliding pill tab toggle (indicator animates between tabs)
  - Column header row: # | (avatar) | User | Logs
  - Ranked list cards: rank | avatar | username + inline poke button (if allowPokes) | log count
  - Current user's row: purple-tinted background + primary400 border + "you" caption
  - Footer note: "Shows your friends' log counts only (no details!)"

**Actions:**
- Tap manage pill → expand/collapse friend list (scale-up pop animation)
- Search users by username → send friend request
- Accept / decline incoming request
- Tap leaderboard tab → switch time period
- Tap poke button on a row → Alert.prompt for optional message → sends poke via Cloud Function
- Tap a friend row → navigate to FriendDetailScreen

### FriendDetailScreen

**Displays:**
- Friend's avatar + username
- "accepting pokes" pill (green) or "not accepting pokes" pill (amber) below username
- Their heatmap (read-only, same calendar component)
- Stat cards: their streak / today's count / weekly avg
  (Bristol type is owner-only — never visible to friends)

**Actions:**
- Remove friend (with confirmation)
- Swipe down or tap dim area to dismiss (bottom sheet)

### ProfileScreen

**Displays:**
- Identity card: avatar (initials + colour) + username + email
- Notification settings: enabled toggle, per-slot time pickers (up to 5), add/remove slot controls, smart suppress toggle; save button appears only when there are unsaved changes
- Account actions: sign out, delete account

**Planned (not yet built):**
- All-time stats: total logs / longest streak / avg per week
- Bristol distribution breakdown
- Edit display name / username

**Actions:**
- Toggle notifications on/off
- Add / remove / adjust reminder time slots
- Toggle smart suppress
- Save notification settings (syncs to Firestore + reschedules Notifee triggers)
- Sign out
- Delete account (with confirmation + password re-auth)

### OnboardingScreen (shown once after signup)

**Displays:**
- Brief welcome message
- Notification preference toggle (default: on)
- Time picker (default: 12:00)
- Smart suppress preference: "skip reminder if already logged today" toggle (default: on — preference stored, logic built later)

**Actions:**
- Toggle notifications on/off
- Set preferred reminder time
- Set smart suppress preference
- Continue → navigate to AppTabs (HomeScreen)

---

## Notification Specification

**Library:** Notifee

**Default settings:**
- Enabled: true
- Slots: [{ hour: 9, minute: 0 }] (09:00)
- Smart suppress: true
- Max slots: 5

**v1 behaviour:** Each slot fires as a separate Notifee TIMESTAMP trigger with DAILY repeat. All slots are cancelled and rescheduled together whenever settings change. If smart suppress is enabled, all slots for the current day are cancelled and rescheduled for tomorrow whenever the user saves a log (via `suppressTodayIfNeeded` in `src/services/notifications.ts`).

**Scheduling logic:**
- Schedule on: account creation (after onboarding), settings change
- Cancel and reschedule when: notification time changes, notifications toggled off then on
- Cancel when: notifications toggled off, account deleted

**Notification content:**
- Title: "Daily check-in"
- Body: "Have you logged today?"

**Permission request:**
- Triggered during onboarding, after the user taps Continue
- iOS: system permission popup
- Android 13+: runtime permission request

**Storage:**
- Notification preferences stored in Firestore under `users/{userId}/notifications`
- On new device login: read preferences from Firestore, re-schedule notification locally

---

## Leaderboard Logic

Counts are pre-aggregated server-side as plaintext rollup docs (see `dailySummaries` / `monthlyTotals` / `yearlyTotals`). The leaderboard fetches one doc per friend per window and ranks in-memory.

**Reads per leaderboard fetch (N = number of accepted friends, including self):**
- Day: N reads (one daily doc each for today)
- Week: 7N reads (seven daily docs each, Mon-Sun)
- Month: N reads (one monthly doc each)
- Year: N reads (one yearly doc each)

Day, month, and year are cheap. Week is the costly window — for a 10-friend group that's 70 reads per fetch. Mitigations:
- The Friends-tab screen caches the result in `friendsStore` with a 5-minute TTL (`CACHE_TTL_MS`). Tab navigations within TTL reuse cached data. `force: true` bypasses cache (used on pull-to-refresh and after write actions).
- Pull-to-refresh forces a re-fetch.

**Ranking rules:**
- Ties broken alphabetically by username
- Current user always shown even if count is 0

**Real-time listeners** are explicitly not used in v1 — every change would re-cost the window read. Pull-based fetch with TTL is sufficient for a turn-by-turn leaderboard.

---

## Heatmap Colour Intensity

```typescript
// src/utils/heatmapUtils.ts

export function getIntensityLevel(count: number): 0 | 1 | 2 | 3 | 4 {
  if (count === 0) return 0;
  if (count === 1) return 1;
  if (count === 2) return 2;
  if (count === 3) return 3;
  return 4;
}

export const INTENSITY_COLOURS = {
  0: "transparent",                    // no border, empty
  1: "#C0DD97",                        // light green
  2: "#97C459",                        // medium green
  3: "#639922",                        // dark green
  4: "#3B6D11",                        // darkest green
};
```

---

## Streak Calculation Rules

- A streak increments for each consecutive calendar day with at least one log
- Streak resets if a full calendar day passes with zero logs
- Today counts toward streak even if only one log so far
- Computed in-memory from the user's logs (already loaded into `logStore`); no separate cached field. With Firestore offline cache hot, recomputation is free.

---

## v1 Scope Boundaries (explicitly out of scope)

- Food / lifestyle tagging (future ML feature)
- ML-based pattern detection (Rome IV rule-based assessment is in scope; ML is not)
- Full log detail sharing with friends (privacy gating in place, UI deferred)
- Games / challenges
- Apple Health / Google Fit integration
- Export to PDF / CSV

---

## Future Feature Hooks (designed in, not built)

| Feature | What's already in place |
|---|---|
| ML anomaly detection | Full log history stored with timestamps and Bristol types |
| ML optimal reminder timing | Log timestamps available for circadian pattern analysis |
| Food correlation ML | Data model has `notes` field, tags field easy to add |
| Games / challenges | Friend graph already built, daily summary data queryable |
| Privacy granularity | Friend visibility is rule-gated; per-friend or per-field controls layer on top by extending the rules + adding new subcollections, no client crypto required |
| End-to-end encrypted social layer | Friend graph already built with anonymous UIDs; per-recipient encryption can be reintroduced for sensitive future fields (Bristol type, notes) without changing the friendship model. Deferred to v3 |
| Federated learning insights | Local log history is the training data, FL infrastructure deferred to v3-4 |
| Decentralised relay server | Replace Firestore with a relay that routes encrypted packets without storing them, deferred to v4 |
| Granular per-friend data sharing | Visibility model is rule-gated; share additional fields with selected friends by extending the rules + writing to per-friend subcollections, no client crypto required |

---

## App Store Requirements Checklist

- [ ] Apple sign-in implemented (mandatory only when offering other third-party social logins e.g. Google, Facebook — email/password only is exempt)
- [ ] In-app account deletion (mandatory — on ProfileScreen)
- [ ] Privacy policy URL (required — host a simple one)
- [ ] Notification permission requested at appropriate moment (not on cold launch)
- [ ] App icon (1024x1024 + all required sizes)
- [ ] Screenshots for all required device sizes
- [ ] Age rating set appropriately (health app, 4+)
- [ ] No third-party analytics without disclosure in privacy policy

---

## Development Order

1. Project scaffold — React Native + TypeScript + folder structure + dependencies
2. Firebase setup — initialise the JS SDK, configure Firebase Auth with AsyncStorage persistence
3. Auth flow — signup, login, logout, Apple sign-in
4. Onboarding — notification preferences screen
5. Firestore data model — `firestore.rules`, collection shapes, `logRepository` with atomic rollup writes
6. HomeScreen — heatmap, day card accordion, stat cards
7. QuickLogButton + LogEntryModal — Bristol selector, save/delete
8. Notification scheduling — Notifee setup, schedule on signup/settings change
9. FriendsScreen — friend search, requests, leaderboard tabs
10. FriendDetailScreen — read-only heatmap + stats
11. ProfileScreen — stats, settings, sign out, delete account
12. Polish — loading states, error states, empty states, animations, leaderboard TTL gating
13. App Store prep — icons, screenshots, privacy policy, submission

---

## Design System

### Personality
Playful and fun — bold purple accent, rounded corners everywhere, generous spacing. Feels friendly and approachable, not clinical.

### Colour Tokens

```typescript
// src/constants/colours.ts

export const colours = {
  // Primary — purple
  primary50:  "#EEEDFE",
  primary200: "#AFA9EC",
  primary400: "#7F77DD",   // main accent, CTAs, active states
  primary600: "#534AB7",   // pressed state
  primary900: "#26215C",   // dark text on light purple bg

  // Heatmap — green scale
  heat0: "transparent",    // 0 logs
  heat1: "#C0DD97",        // 1 log
  heat2: "#97C459",        // 2 logs
  heat3: "#639922",        // 3 logs
  heat4: "#3B6D11",        // 4+ logs

  // Semantic
  destructive:     "#D85A30",   // remove, delete actions
  destructiveBg:   "#FAECE7",
  destructiveBorder: "#F5C4B3",
  warning:         "#BA7517",
  warningBg:       "#FAEEDA",
  ideal:           "#1D9E75",   // Bristol type 4 highlight
  idealBg:         "#E1F5EE",

  // Bristol type colours
  bristolConstipated: "#854F0B",   // types 1-2
  bristolNormal:      "#639922",   // types 3-4
  bristolLacking:     "#BA7517",   // type 5
  bristolLoose:       "#D85A30",   // types 6-7

  // Avatar colours (assigned at signup, one per user)
  avatarPurple: { bg: "#EEEDFE", text: "#3C3489" },
  avatarAmber:  { bg: "#FAEEDA", text: "#633806" },
  avatarTeal:   { bg: "#E1F5EE", text: "#085041" },
  avatarCoral:  { bg: "#FAECE7", text: "#712B13" },
  avatarBlue:   { bg: "#E6F1FB", text: "#0C447C" },
};
```

### Typography

```typescript
// src/constants/typography.ts

export const typography = {
  screenTitle:   { fontSize: 24, fontWeight: "500" },
  sectionHeading:{ fontSize: 18, fontWeight: "500" },
  bodyEmphasis:  { fontSize: 15, fontWeight: "500" },
  body:          { fontSize: 13, fontWeight: "400" },
  caption:       { fontSize: 12, fontWeight: "400" },
};
```

### Border Radius

| Usage | Value |
|---|---|
| Inputs, small chips | 8px |
| Cards, modals, log entry rows | 12px |
| Bottom sheet, large surfaces | 16px |
| Pills, tabs, avatars, badges | 999px |

### Spacing Scale
4 / 8 / 12 / 16 / 20 / 24px. Stick to multiples of 4.

### Buttons

| Type | Usage | Style |
|---|---|---|
| Primary | Main CTA (quick log, save) | Purple 400 bg, white text, 14px radius |
| Secondary | Cancel, neutral actions | Surface bg, border, primary text |
| Destructive | Remove friend, delete | Coral 50 bg, coral 800 text, coral 200 border |

### Heatmap Day States
- No logs: transparent fill, light border
- 1 log: `#C0DD97`
- 2 logs: `#97C459`
- 3 logs: `#639922`
- 4+ logs: `#3B6D11`
- Today: purple 400 outline (2px)
- Selected: coral outline (2px)

### Avatar System
Users can create a customisable pixel avatar via `AvatarPickerModal` on the profile screen. The config is stored as `avatarConfig` on the user profile and rendered via `CatAvatarCircle`. If no `avatarConfig` is set, `Avatar` (initials circle, one of 8 assigned colours) is shown as a fallback.

### Theme
Currently a single warm dark palette (not system-adaptive). `useTheme()` returns fixed surface colours (`warmDarkSurface`) regardless of `useColorScheme()`. Never hardcode colours in component files — always reference through the theme hook. Light mode support is deferred post-v1.
