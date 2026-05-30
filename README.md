# PoopTracker

A social bowel movement tracker for iOS. Log your daily habits, visualise patterns on a calendar heatmap, and compete with friends on a leaderboard — all without sharing your actual data with anyone.

> Screenshots and App Store badge coming soon.

---

## Features

- **Quick log** — one tap to log at the current time, or add Bristol type, duration, and notes
- **Calendar heatmap** — colour-coded intensity per day, navigable by month
- **Streaks & stats** — current streak, daily count, monthly average
- **Insights** — Bristol type distribution chart and 8-week frequency chart, collapsible on the home screen
- **Health Signals** — Rome IV–based bowel health assessment over your last 90 days; flags patterns worth discussing with a GP; findings are snoozeable or dismissable with a history log
- **Customisable avatar** — pixel avatar builder on your profile
- **Friends & leaderboard** — compare counts with friends across day / week / month / year windows; raw log details stay private
- **Daily reminders** — up to 5 configurable notification times with smart suppress (skips the reminder if you've already logged today)
- **Privacy-first** — friends see counts only; individual logs, Bristol type, and notes are owner-only

---

## Tech Stack

| | |
|---|---|
| Framework | React Native (TypeScript) |
| Auth + Database | Firebase (`@react-native-firebase`) |
| Notifications | Notifee |
| State | Zustand |
| Navigation | React Navigation v7 |

---

## Dev Setup

### Prerequisites
- Node 18+
- Xcode 15+
- Ruby + Bundler (`gem install bundler`)
- A Firebase project with **Authentication** (email/password) and **Firestore** enabled

### 1. Install JS dependencies
```sh
npm install
```

### 2. Add Firebase config
Download `GoogleService-Info.plist` from the Firebase console and place it at:
```
ios/PoopTracker/GoogleService-Info.plist
```

### 3. Install iOS native dependencies
```sh
bundle install
bundle exec pod install
```

### 4. Start Metro and run
```sh
npm start
# in a separate terminal:
npm run ios
```

### Firestore Security Rules
Deploy `firestore.rules` from the repo root before testing any multi-user flows:
```sh
firebase deploy --only firestore:rules
```

---

## Privacy

- Email and display name are held by Firebase Auth only — never written to Firestore
- Friend search uses a one-way SHA-256 hash of usernames; plaintext usernames are never stored in the search index
- Individual logs are owner-only; friends access count rollups only
- All access control is enforced by Firestore Security Rules

---

## Roadmap

- [ ] App Store submission (screenshots + distribution cert needed)
- [ ] Android support (deferred post-v1)
