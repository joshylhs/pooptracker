# PoopTracker — Project Specification

## Overview

A social poop tracking app for iOS and Android. Users log their bowel movements, view their history on a calendar heatmap, and compete with friends on a leaderboard. Built to be modular and scalable for future features including ML-powered insights and games.

---

## Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | React Native (TypeScript) | Cross-platform, employable skill, large ecosystem |
| Language | TypeScript | Type safety, catches bugs early, industry standard |
| Auth | Firebase Auth | Handles signup, login, Apple sign-in (App Store requirement) |
| Database | Firestore | Real-time, scalable, works well with React Native |
| State management | Zustand | Lightweight, beginner-friendly, scales well |
| Navigation | React Navigation v7 | Standard for React Native, flexible |
| Notifications | Notifee | Best-in-class local notifications for React Native |
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
│   │   └── HomeScreen.tsx             # heatmap + quick log + day detail
│   ├── friends/
│   │   ├── FriendsScreen.tsx          # leaderboard + collapsed friend list
│   │   └── FriendDetailScreen.tsx     # friend's heatmap + stats
│   └── profile/
│       └── ProfileScreen.tsx          # stats + settings + account
│
├── components/
│   ├── log/
│   │   ├── QuickLogButton.tsx         # primary CTA on home screen
│   │   ├── LogEntryModal.tsx          # detailed log entry sheet
│   │   ├── BristolSelector.tsx        # type 1-7 picker with icons + descriptions
│   │   └── DayLogCard.tsx             # expanded day detail below heatmap
│   ├── heatmap/
│   │   └── CalendarHeatmap.tsx        # calendar with colour intensity per day
│   ├── friends/
│   │   ├── LeaderboardList.tsx        # ranked list with day/week/month/year tabs
│   │   ├── FriendListCollapsed.tsx    # collapsed friend management row
│   │   └── FriendRow.tsx             # single friend row in leaderboard
│   └── shared/
│       ├── StatCard.tsx               # reusable metric card (streak, today, avg)
│       └── Avatar.tsx                 # initials circle avatar
│
├── navigation/
│   ├── RootNavigator.tsx              # switches between Auth and App stacks
│   ├── AuthStack.tsx                  # Welcome, Signup, Login, Onboarding
│   └── AppTabs.tsx                    # Home, Friends, Profile bottom tabs
│
├── services/
│   ├── firebase.ts                    # Firebase app initialisation
│   ├── auth.ts                        # signup, login, logout, Apple sign-in
│   ├── logs.ts                        # Firestore CRUD for log entries
│   ├── friends.ts                     # friend requests, friendships, queries
│   ├── users.ts                       # user profile reads and writes
│   └── notifications.ts              # Notifee scheduling and cancellation
│
├── store/
│   ├── authStore.ts                   # current user, auth state
│   ├── logStore.ts                    # log entries for current user
│   └── friendsStore.ts               # friends list, leaderboard data
│
├── hooks/
│   ├── useLogEntries.ts               # fetch + subscribe to user's logs
│   ├── useFriendStats.ts              # fetch friend aggregate stats
│   └── useLeaderboard.ts             # compute leaderboard from friend data
│
├── utils/
│   ├── bristolData.ts                 # type definitions, icons, descriptions, colours
│   ├── heatmapUtils.ts               # compute intensity per day from log counts
│   ├── streakUtils.ts                 # calculate current streak and personal best
│   ├── dateUtils.ts                   # date formatting helpers
│   └── statsUtils.ts                  # weekly avg, monthly avg, all-time stats
│
└── constants/
    ├── colours.ts                     # app colour palette
    ├── typography.ts                  # font sizes and weights
    └── config.ts                      # app-wide config values (default notif time etc.)
```

---

## Firestore Data Model

### `users/{userId}`
```typescript
{
  uid: string,
  username: string,                    // unique, used for friend search
  displayName: string,
  avatarInitials: string,              // e.g. "JL"
  avatarColour: string,                // hex, assigned on signup
  privacyLevel: "friends_only",        // v1 only option, public added later
  createdAt: Timestamp,

  // notification preferences (set during onboarding)
  notifications: {
    enabled: boolean,
    time: string,                      // "HH:MM" 24hr format, default "12:00"
    smartSuppress: boolean,            // user preference, logic built later
  },

  // cached aggregate stats (updated on each log write)
  stats: {
    totalLogs: number,
    currentStreak: number,
    longestStreak: number,
    lastLogDate: string,               // "YYYY-MM-DD"
  }
}
```

### `logs/{logId}`
```typescript
{
  logId: string,
  userId: string,                      // owner
  timestamp: Timestamp,
  bristolType: number | null,          // 1-7, null if quick log with no detail added
  duration: number | null,             // minutes, optional
  notes: string | null,               // optional free text
  isQuickLog: boolean,                 // true = logged with no details
  date: string,                        // "YYYY-MM-DD" for efficient daily queries
  createdAt: Timestamp,
  updatedAt: Timestamp,
}
```

### `userDailySummaries/{userId}/days/{date}`
```typescript
// "YYYY-MM-DD" as document ID
// written/updated on each log save
// used for heatmap and leaderboard queries — avoids scanning all logs
{
  date: string,
  count: number,
  userId: string,
}
```

### `friendships/{userId}/friends/{friendId}`
```typescript
{
  friendId: string,
  status: "pending" | "accepted",
  initiatedBy: string,                 // userId who sent the request
  createdAt: Timestamp,
  acceptedAt: Timestamp | null,
}
```

---

## Privacy Design

- All log details (Bristol type, duration, notes) are stored in full regardless of privacy settings
- Friends can currently see: heatmap (daily count intensity only), aggregate stats (streak, weekly avg, today's count, Bristol avg)
- Friends cannot see: individual log timestamps, Bristol per entry, duration per entry, notes
- Privacy is enforced at two levels: Firestore security rules (what can be read) and UI (what is displayed)
- To open full detail sharing in future: update security rules to allow friends to read `logs` collection + update FriendDetailScreen to show log cards. No data model changes needed.
- `privacyLevel` field on user profile is reserved for future granular control

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
│   ├── LoginScreen
│   └── OnboardingScreen              # notification prefs, shown once after signup
│
└── AppTabs (shown when authenticated)
    ├── HomeScreen
    │   └── LogEntryModal             # slides up over home, detailed entry
    ├── FriendsScreen
    │   └── FriendDetailScreen        # pushed screen, friend's heatmap + stats
    └── ProfileScreen
```

---

## Screen Specifications

### HomeScreen

**Displays:**
- Calendar heatmap (current month, navigable by month)
  - Colour intensity: 0 logs = white/empty, 1 = light green, 2 = medium, 3 = dark, 4+ = darkest
  - Today highlighted with purple outline
  - Selected day highlighted with coral outline
- Day log card (accordion — expands below calendar on day tap, collapses on re-tap or different day tap)
  - Shows each log as a row: time | Bristol type | duration | notes | edit link
  - Tapping edit opens LogEntryModal pre-filled with that log's data
  - Tapping empty day: shows "no logs" + quick log prompt
- Stat cards row: current streak / today's count / monthly avg
- Quick log button (primary CTA, always visible)
  - One tap saves a log at current timestamp with no details
  - "Add details instead" link below opens LogEntryModal

**Actions:**
- Tap "+" quick log → save log, update heatmap, update stat cards
- Tap "add details instead" → open LogEntryModal (empty)
- Tap heatmap day → expand/collapse day log card
- Tap edit on a log entry → open LogEntryModal (pre-filled)
- Navigate calendar month → prev/next month arrows

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
- Collapsed friend list row: "Friends (N) ▸ manage" — tapping expands to show friend list with add/remove options and pending requests
- Leaderboard section
  - Day / Week / Month / Year pill tab toggle
  - Ranked list: rank number | avatar | username | log count
  - Current user's row highlighted
  - "you" badge on current user's row
  - Footer note: "counts logs only — details stay private"

**Actions:**
- Tap friend list row → expand/collapse
- Search users by username → send friend request
- Accept / decline incoming request
- Tap leaderboard tab → switch time period
- Tap a friend row → navigate to FriendDetailScreen

### FriendDetailScreen

**Displays:**
- Friend's avatar + display name + username
- Their heatmap (read-only, same calendar component)
- Stat cards: their streak / today's count / weekly avg / Bristol avg this month

**Actions:**
- Remove friend (with confirmation)
- Back to FriendsScreen

### ProfileScreen

**Displays:**
- Avatar + display name + username
- All-time stats: total logs / longest streak / avg per week
- Bristol distribution bar chart (breakdown of types logged all-time)

**Actions:**
- Edit display name
- Edit username (with uniqueness check)
- Notification settings: toggle on/off, time picker, smart suppress toggle
- Privacy settings (placeholder for future)
- Sign out
- Delete account (required by App Store — with confirmation + re-auth)

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
- Time: 12:00 (noon)
- Smart suppress: true (preference stored from day 1, suppression logic implemented later)

**v1 behaviour:** Always fires at scheduled time regardless of whether user has logged. Smart suppress preference is captured but not yet acted on.

**Scheduling logic:**
- Schedule on: account creation (after onboarding), settings change
- Cancel and reschedule when: notification time changes, notifications toggled off then on
- Cancel when: notifications toggled off, account deleted

**Notification content:**
- Title: "Daily check-in"
- Body: "Have you logged today?"

**Permission request:**
- Triggered after user saves their first log (not on first launch)
- iOS: system permission popup
- Android 13+: runtime permission request

**Storage:**
- Notification preferences stored in Firestore under `users/{userId}/notifications`
- On new device login: read preferences from Firestore, re-schedule notification locally

---

## Leaderboard Logic

- Computed from `userDailySummaries` collection across friend group
- Day: sum of counts for today's date document
- Week: sum of counts for date documents in current Mon-Sun window
- Month: sum of counts for date documents in current calendar month
- Year: sum of counts for date documents in current calendar year
- Ties broken alphabetically by username
- Current user always shown even if count is 0

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
- Calculated from `userDailySummaries` sorted by date descending
- Stored as cached value in `users/{userId}/stats` and recomputed on each log write

---

## v1 Scope Boundaries (explicitly out of scope)

- Food / lifestyle tagging (future ML feature)
- ML insights and pattern detection
- Push notifications via server (all notifications are local in v1)
- Smart suppress logic (preference captured, logic deferred)
- Full log detail sharing with friends (privacy gating in place, UI deferred)
- Games / challenges
- Apple Health / Google Fit integration
- Profile photos (initials avatar only in v1)
- Export to PDF / CSV

---

## Future Feature Hooks (designed in, not built)

| Feature | What's already in place |
|---|---|
| Full detail sharing with friends | Full log data stored, security rules just need updating |
| Smart suppress notifications | `smartSuppress` preference captured on every account |
| ML anomaly detection | Full log history stored with timestamps and Bristol types |
| ML optimal reminder timing | Log timestamps available for circadian pattern analysis |
| Food correlation ML | Data model has `notes` field, tags field easy to add |
| Games / challenges | Friend graph already built, daily summary data queryable |
| Privacy granularity | `privacyLevel` field on user profile, extendable |

---

## App Store Requirements Checklist

- [ ] Apple sign-in implemented (mandatory when any social login exists)
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
2. Firebase setup — initialise app, auth, Firestore
3. Auth flow — signup, login, logout, Apple sign-in
4. Onboarding — notification preferences screen
5. Firestore data model — security rules, collections
6. Log CRUD — create, read, update, delete log entries
7. HomeScreen — heatmap, day card accordion, stat cards
8. QuickLogButton + LogEntryModal — Bristol selector, save/delete
9. Notification scheduling — Notifee setup, schedule on signup/settings change
10. FriendsScreen — friend search, requests, leaderboard tabs
11. FriendDetailScreen — read-only heatmap + stats
12. ProfileScreen — stats, settings, sign out, delete account
13. Polish — loading states, error states, empty states, animations
14. App Store prep — icons, screenshots, privacy policy, submission

---

## Design System

### Personality
Playful and fun — bold purple accent, rounded corners everywhere, generous spacing. Feels friendly and approachable, not clinical. Supports both light and dark mode from day one.

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
  caption:       { fontSize: 11, fontWeight: "400" },
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
Each user is assigned one of 5 colour pairs at signup (purple, amber, teal, coral, blue). Stored as a string on the user profile. Initials are first letter of display name + first letter of last word. Displayed as 36px circle throughout the app.

### Dark Mode
All colours reference React Native's `useColorScheme()`. Create a `useTheme()` hook that returns the appropriate colour set for the current scheme. Never hardcode colours in component files — always reference through the theme hook.
