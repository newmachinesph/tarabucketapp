# Tara Bucket

![License: MIT](https://img.shields.io/badge/license-MIT-green) ![Expo 57](https://img.shields.io/badge/Expo-57-000020) ![React Native](https://img.shields.io/badge/React%20Native-0.86-61dafb) ![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6)

A Philippine-market social app for turning "someday" into a date on the calendar.

**This is an all-frontend demo.** There is no backend, and there is not meant to be one. See
[Demo constraints](#demo-constraints) before you go looking for an API.

## The core loop

1. **Bucket a want.** "Freedive in Anilao." "Try that samgyup place." It sits on your bucket list.
2. **Someone taps Tara!** Your kada — or a stranger on the discovery deck — swipes right on it.
3. **The plan gets real.** It picks up a venue, a time, and a seat count. People confirm.
4. **You show up.** The meetup actually happens.
5. **Post the receipt.** A photo, the bill split, who was there. It lands in the feed.
6. **Repeat.** Somebody sees your receipt and buckets it. Back to step 1.

The bet: a bucket list is a wish, a plan is a commitment, and a receipt is proof. The app is the
shortest path between the three.

## Vocabulary

The product speaks Taglish, and so does the code.

| Term | Meaning |
|---|---|
| **tara** | "let's go" — the yes. Swipe right on a plan and you've said tara. |
| **kada** | your crew (from *barkada*). A private group with its own chat, plans, and buckets. |
| **KKB** | *kanya-kanyang bayad* — everyone pays their own share. The bill-split screen. |
| **receipt** | the post-meetup proof: photo, venue, who came, what it cost. |
| **Tara Table** | a hosted seat at a venue — reserve one and meet whoever else books in. |

## Stack

- **Expo 57** / React Native 0.86 / New Architecture
- **expo-router** — file-based routing
- **NativeWind 4** — Tailwind classes on RN components
- **Zustand** (+ AsyncStorage persistence) — all runtime state
- **Reanimated 4** / Gesture Handler — the swipe deck
- **TypeScript**, strict, with `noUncheckedIndexedAccess`

## Run it

```bash
npm install
npx expo start
```

Then press `i` (iOS simulator), `a` (Android emulator), or scan the QR code with Expo Go.

```bash
npx expo lint          # ESLint
npx tsc --noEmit       # type check
```

## Project layout

```
src/
  app/            expo-router routes — every file here is a screen
    (tabs)/       the four tabs: tara, buckets, feed, profile
    bucket/ kada/ plan/ profile/ table/   dynamic detail routes ([id].tsx)
  components/
    ui/           the design system — kit.tsx, sheet.tsx, toast.tsx, txt.tsx
    *.tsx         feature components (swipe-deck, filter-sheet, comments-sheet, …)
  data/           mock.ts — every fixture in the app. locations.ts — the city list.
  lib/            colors.js (the palette), tokens.ts, haptics.ts, i18n.ts
  store/          index.ts — the Zustand store. One file, sliced by domain.
```

## Demo constraints

Read this before filing a bug.

- **No backend, no network.** Nothing is fetched. Nothing is posted.
- **Auth is fake.** Any 4-digit code signs you in (`src/app/login.tsx`).
- **Payments are mocked.** Premium and KKB settle-up are UI only.
- **All content is fixtures** in `src/data/mock.ts` — people, plans, kadas, receipts, threads.
- **State persists to AsyncStorage,** so your taps survive a reload. Settings has a
  **Reset demo data** button that wipes storage and reseeds from the fixtures.

Deliberate simplifications are marked in the source with `// ponytail:` comments that name the
shortcut and what would replace it in production. They are honest, not aspirational.

## License

MIT. See [LICENSE](LICENSE).
