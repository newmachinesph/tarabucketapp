// ── Tara Bucket global store (Zustand) ──────────────────────────────
// Single source of truth for all runtime/mutable state. Seeded from the
// static fixtures in `@/data/mock`. Organised into domain slices; every
// interactive screen reads via a narrow selector and mutates via an action.
//
// Selecting: pick narrow slices (`useStore((s) => s.buckets)`) and derive
// with `useMemo` in the component — avoid selectors that build a new array
// on every call (they'd re-render on every store change).

import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';

import {
  DISCOVERY,
  FEED,
  KADAS,
  ME,
  ME_STATS,
  MY_BUCKETS,
  NOTIFS,
  PEOPLE,
  THREADS,
  TABLES,
  type Budget,
  type Bucket,
  type Discovery,
  type Kada,
  type Note,
  type Notif,
  type Person,
  type Receipt,
  type Table,
} from '@/data/mock';
import { DEFAULT_LOCATION } from '@/data/locations';

export type Gender = 'all' | 'women' | 'men';
export type MeProfile = Person & { bio: string; photos: string[]; phone: string };
// Own the shape rather than borrowing ME_STATS' (which also carried `trust`/`freeStrangerLeft` —
// those live on `me.trust` / top-level `freeStrangerLeft`; duplicating them invites drift).
export type Stats = { plans: number; kadas: number; streak: number; level: number };

export type NotifKey =
  | 'kadaInvites' | 'taraTap' | 'newTables' | 'doubleConfirm' | 'planUpdates'
  | 'safetyAlerts' | 'likesReceipts' | 'newFollowers' | 'productNews';

export const NOTIF_DEFAULTS: Record<NotifKey, boolean> = {
  kadaInvites: true, taraTap: true, newTables: true, doubleConfirm: true,
  planUpdates: true, safetyAlerts: true, likesReceipts: true, newFollowers: false,
  productNews: false,
};

export type DiscoveryPrefs = {
  maxDistanceKm: number | null; // null = Anywhere
  ageMin: number;
  ageMax: number;
  showOnDiscovery: boolean;
  verifiedOnly: boolean;
  hideDistance: boolean;
  preciseLocation: boolean;
};

export type Visibility = 'Public' | 'Kada-only' | 'Private';
export type Privacy = {
  visibility: Visibility;
  showTrustScore: boolean;
  discoverable: boolean;
  readReceipts: boolean;
  shareActivity: boolean;
};

export type Language = 'taglish' | 'english' | 'bisaya';
export type AppPrefs = {
  language: Language;
  dataSaver: boolean;
  reduceMotion: boolean;
  theme: 'light' | 'dark';
};

export type Comment = { id: string; from: Person; text: string; time: string; mine?: boolean };

// Trusted contacts can be in-app friends or off-app numbers (your Nanay isn't on Tara).
export type TrustedContact = {
  id: string;
  name: string;
  phone: string;
  avatar?: string;
};

export type NewPlanInput = {
  title: string;
  category: string;
  venue: string;
  area: string;
  when: string;
  spots: number;
  audience: 'stranger' | 'kada';
};

// Local id generator — deterministic within a session, no Date/Math.random.
let seq = 100;
const uid = (prefix: string) => `${prefix}${++seq}`;

// Clone helpers so actions never mutate the imported fixtures.
const cloneBucket = (b: Bucket): Bucket => ({ ...b, items: b.items?.map((i) => ({ ...i })) });

export type AppStore = {
  // ── persistence internals (not read by screens) ──
  // `_hydrated` flips true once AsyncStorage has been read back — the splash gates on it
  // so a signed-in user is never bounced to /welcome by a rehydrate that hasn't landed yet.
  _hydrated: boolean;
  // Carrier for the module-level `seq` id counter. Without this, a reload resets seq to 100
  // and the next created bucket collides with a persisted `b101`.
  _seq: number;
  // Wipe storage and reseed from the fixtures — the demo needs a clean slate on demand.
  resetDemo: () => void;

  // ── session (demo auth — no backend) ──
  session: boolean;
  signIn: () => void;
  signOut: () => void;

  // ── profile ──
  me: MeProfile;
  interests: string[];
  stats: Stats;
  isPremium: boolean;
  followingIds: string[];
  friendIds: string[];
  requestedIds: string[];
  updateProfile: (patch: Partial<MeProfile>) => void;
  toggleInterest: (tag: string) => void;
  setInterests: (tags: string[]) => void;
  toggleFollow: (id: string) => void;
  requestFriend: (id: string) => void; // toggles Add friend ⇄ Requested
  removeFriend: (id: string) => void;
  setPremium: (v: boolean) => void;

  // ── discovery / swipe ──
  discovery: Discovery[];
  filters: { cats: string[]; gender: Gender; budget: 'any' | Budget };
  location: string;
  joinedIds: string[];
  passedIds: string[];
  swipeHistory: string[];
  freeStrangerLeft: number;
  setCats: (cats: string[]) => void;
  setGender: (g: Gender) => void;
  setBudget: (b: 'any' | Budget) => void;
  setLocation: (loc: string) => void;
  joinPlan: (id: string) => boolean; // false if blocked (already in, full, or out of free Taras)
  leavePlan: (id: string) => void; // undo a join: drop from joinedIds, decrement going, refund free Tara
  passPlan: (id: string) => void;
  rewindSwipe: () => void;
  createPlan: (input: NewPlanInput) => string; // returns new plan id; host auto-joins

  // ── buckets ──
  buckets: Bucket[];
  savedBucketIds: string[];
  taraedBucketIds: string[]; // buckets you've tapped "Tara!" on (one interest per user)
  addBucket: (input: Partial<Omit<Bucket, 'id'>> & { title: string }) => string;
  updateBucket: (id: string, patch: Partial<Bucket>) => void;
  removeBucket: (id: string) => void;
  toggleBucketDone: (id: string) => void;
  tapTara: (id: string) => void; // toggle your interest (idempotent, no double-count)
  toggleSubItem: (bucketId: string, itemId: string) => void;
  addSubItem: (bucketId: string, title: string) => void;
  toggleSavedBucket: (id: string) => void;

  // ── tables ──
  tables: Table[];
  reservedTableIds: string[];
  reserveSeat: (id: string) => void;
  cancelSeat: (id: string) => void;

  // ── feed ──
  feed: Receipt[];
  savedPostIds: string[];
  postComments: Record<string, Comment[]>; // keyed by receipt id
  planRatings: Record<string, number>; // post-meetup star rating, keyed by plan/receipt id
  addComment: (postId: string, text: string) => void;
  ratePlan: (id: string, stars: number) => void;
  toggleLike: (id: string) => void;
  toggleSavePost: (id: string) => void;
  hidePost: (id: string) => void;
  loadMoreFeed: () => void; // append a page of fresh receipts (infinite scroll)
  resetFeed: () => void; // back to the base feed (pull-to-refresh)

  // ── kadas ──
  kadas: Kada[];
  myKadaIds: string[];
  requestedKadaIds: string[]; // pending join requests to public kadas
  createKada: (input: { name: string; emoji: string; color: string; memberIds?: string[] }) => string;
  joinKada: (id: string) => void;
  leaveKada: (id: string) => void;
  toggleKadaRequest: (id: string) => void;

  // ── invites ──
  invitedIds: string[]; // contacts already invited (persists across screens)
  toggleInvited: (id: string) => void;

  // ── comms ──
  // Chat threads keyed by conversation id (plan/kada/person). Every conversation
  // has its own thread — no shared global thread.
  threads: Record<string, Note[]>;
  readConvoIds: string[]; // conversations opened this session (clears the unread dot)
  notifs: Notif[];
  sendMessage: (convoId: string, text: string) => void;
  markConvoRead: (convoId: string) => void;
  markNotifRead: (id: string) => void;
  markAllNotifsRead: () => void;

  // ── settings ──
  notifPrefs: Record<NotifKey, boolean>;
  discoveryPrefs: DiscoveryPrefs;
  privacy: Privacy;
  prefs: AppPrefs;
  setNotifPref: (key: NotifKey, v: boolean) => void;
  setDiscoveryPref: (patch: Partial<DiscoveryPrefs>) => void;
  setPrivacy: (patch: Partial<Privacy>) => void;
  setPrefs: (patch: Partial<AppPrefs>) => void;

  // ── safety & trust ──
  trustedContacts: TrustedContact[];
  blockedIds: string[]; // Person ids
  confirmedPlanIds: string[]; // attendance double-confirms (persisted, not local UI state)
  shareLiveLocation: boolean; // live-location sharing toggle (Safety center)
  addTrustedContact: (input: { name: string; phone: string; avatar?: string; id?: string }) => void;
  removeTrustedContact: (id: string) => void;
  blockUser: (id: string) => void;
  unblockUser: (id: string) => void;
  confirmAttendance: (planId: string) => void;
  setShareLiveLocation: (v: boolean) => void;
};

// State that survives a reload: the user's *decisions*, plus the content arrays those
// decisions mutated (`discovery.going`, `tables.seatsLeft`, `feed.likes`). Persisting the
// decisions without the counts would desync them — join a plan, reload, and the plan you're
// in reads 0 going. `swipeHistory` is deliberately absent: rewind is session-scoped by design.
type Persisted = Pick<
  AppStore,
  | '_seq'
  | 'session'
  | 'me' | 'interests' | 'stats' | 'isPremium' | 'followingIds' | 'friendIds' | 'requestedIds'
  | 'discovery' | 'filters' | 'location' | 'joinedIds' | 'passedIds' | 'freeStrangerLeft'
  | 'buckets' | 'savedBucketIds' | 'taraedBucketIds'
  | 'tables' | 'reservedTableIds'
  | 'feed' | 'savedPostIds' | 'postComments' | 'planRatings'
  | 'kadas' | 'myKadaIds' | 'requestedKadaIds'
  | 'invitedIds'
  | 'threads' | 'readConvoIds' | 'notifs'
  | 'notifPrefs' | 'discoveryPrefs' | 'privacy' | 'prefs'
  | 'trustedContacts' | 'blockedIds' | 'confirmedPlanIds' | 'shareLiveLocation'
>;

// AsyncStorage's web build reaches straight for `window.localStorage`, and expo-router prerenders
// web routes in Node — where `persist`'s opening `hydrate()` call would blow up with
// `ReferenceError: window is not defined`. There is nothing to rehydrate on the server anyway, so
// hand it a no-op store: SSR renders the pristine fixtures, and the browser rehydrates for real.
const noopStorage: StateStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};
const isServer = typeof window === 'undefined'; // false in React Native — RN defines `window`

export const useStore = create<AppStore>()(
  persist<AppStore, [], [], Persisted>(
    (set, get) => ({
  // ── persistence internals ──
  _hydrated: false,
  _seq: seq,
  resetDemo: () => {
    seq = 100;
    void useStore.persist.clearStorage();
    set({ ...PRISTINE, _hydrated: true });
  },

  // ── session (demo auth — no backend) ──
  session: false,
  signIn: () => set({ session: true }),
  signOut: () => set({ session: false }),

  // ── profile ──
  me: {
    ...ME,
    bio: 'Makati-based, always down for coffee, sunrise hikes, and a good samgyup. Bucket-list over bar-hopping (usually).',
    photos: [ME.avatar, 'https://picsum.photos/seed/maya-a/480/640', 'https://picsum.photos/seed/maya-b/480/640'],
    phone: '+63 917 555 0148',
  },
  interests: ['Coffee', 'Hiking', 'Foodie', 'Beaches', 'Concerts'],
  stats: { plans: ME_STATS.plans, kadas: ME_STATS.kadas, streak: ME_STATS.streak, level: ME_STATS.level },
  isPremium: false,
  followingIds: ['u_bea', 'u_paolo', 'u_lara'],
  friendIds: ['u_jio', 'u_migs'],
  requestedIds: [],
  updateProfile: (patch) => set((s) => ({ me: { ...s.me, ...patch } })),
  toggleInterest: (tag) =>
    set((s) => ({
      interests: s.interests.includes(tag) ? s.interests.filter((t) => t !== tag) : [...s.interests, tag],
    })),
  setInterests: (tags) => set({ interests: tags }),
  toggleFollow: (id) =>
    set((s) => ({
      followingIds: s.followingIds.includes(id) ? s.followingIds.filter((x) => x !== id) : [...s.followingIds, id],
    })),
  requestFriend: (id) =>
    set((s) => {
      if (s.friendIds.includes(id)) return {};
      return {
        requestedIds: s.requestedIds.includes(id)
          ? s.requestedIds.filter((x) => x !== id)
          : [...s.requestedIds, id],
      };
    }),
  removeFriend: (id) =>
    set((s) => ({
      friendIds: s.friendIds.filter((x) => x !== id),
      requestedIds: s.requestedIds.filter((x) => x !== id),
    })),
  // ponytail: demo-only client setter. In prod, premium is server-owned (RevenueCat webhook → GET /subscriptions/me);
  // the client reads it, never writes it. Keep for the demo toggle; drop when auth lands.
  setPremium: (v) => set({ isPremium: v }),

  // ── discovery / swipe ──
  // Shallow row clones: nested host/tags/crew/members refs are shared with the fixtures.
  // Safe because every action rebuilds rows via map/spread and never mutates those nested objects.
  discovery: DISCOVERY.map((d) => ({ ...d })),
  filters: { cats: [], gender: 'all', budget: 'any' },
  location: DEFAULT_LOCATION,
  joinedIds: [],
  passedIds: [],
  swipeHistory: [],
  freeStrangerLeft: 2,
  setCats: (cats) => set((s) => ({ filters: { ...s.filters, cats } })),
  setGender: (g) => set((s) => ({ filters: { ...s.filters, gender: g } })),
  setBudget: (b) => set((s) => ({ filters: { ...s.filters, budget: b } })),
  setLocation: (loc) => set({ location: loc }),
  joinPlan: (id) => {
    const s = get();
    if (s.joinedIds.includes(id)) return false;
    const item = s.discovery.find((d) => d.id === id);
    if (!item) return false;
    if (item.going >= item.spots) return false; // table is full
    const isStranger = item.audience === 'stranger';
    // ponytail: client-side UX gate only. The real free-Tara limit is server-authoritative (can_join_plan) — never trust this alone.
    if (isStranger && !s.isPremium && s.freeStrangerLeft <= 0) return false; // monetization gate
    set({
      joinedIds: [...s.joinedIds, id],
      passedIds: s.passedIds.filter((x) => x !== id), // reconcile: a plan can't be both joined and passed
      swipeHistory: [...s.swipeHistory, id],
      discovery: s.discovery.map((d) => (d.id === id ? { ...d, going: Math.min(d.going + 1, d.spots) } : d)),
      // Premium bypasses the free-Tara economy entirely — don't spend a free Tara (matches leavePlan's refund guard).
      freeStrangerLeft: isStranger && !s.isPremium ? Math.max(0, s.freeStrangerLeft - 1) : s.freeStrangerLeft,
    });
    return true;
  },
  leavePlan: (id) =>
    set((s) => {
      if (!s.joinedIds.includes(id)) return {};
      const wasStranger = s.discovery.find((d) => d.id === id)?.audience === 'stranger';
      return {
        joinedIds: s.joinedIds.filter((x) => x !== id),
        swipeHistory: s.swipeHistory.filter((x) => x !== id), // drop the stale entry so rewind isn't a silent no-op
        discovery: s.discovery.map((d) => (d.id === id ? { ...d, going: Math.max(0, d.going - 1) } : d)),
        freeStrangerLeft: wasStranger && !s.isPremium ? s.freeStrangerLeft + 1 : s.freeStrangerLeft,
      };
    }),
  passPlan: (id) =>
    set((s) => {
      if (s.joinedIds.includes(id)) return {}; // can't pass a plan you're already in
      return {
        passedIds: s.passedIds.includes(id) ? s.passedIds : [...s.passedIds, id],
        swipeHistory: [...s.swipeHistory, id],
      };
    }),
  rewindSwipe: () =>
    set((s) => {
      const last = s.swipeHistory[s.swipeHistory.length - 1];
      if (!last) return {};
      const wasJoined = s.joinedIds.includes(last);
      const wasStranger = s.discovery.find((d) => d.id === last)?.audience === 'stranger';
      return {
        swipeHistory: s.swipeHistory.slice(0, -1),
        joinedIds: s.joinedIds.filter((x) => x !== last),
        passedIds: s.passedIds.filter((x) => x !== last),
        // Reverse joinPlan's side effects so re-joining can't double-count.
        discovery: wasJoined
          ? s.discovery.map((d) => (d.id === last ? { ...d, going: Math.max(0, d.going - 1) } : d))
          : s.discovery,
        freeStrangerLeft: wasJoined && wasStranger ? s.freeStrangerLeft + 1 : s.freeStrangerLeft,
      };
    }),

  createPlan: (input) => {
    const id = uid('d');
    const s = get();
    const plan: Discovery = {
      id,
      title: input.title,
      blurb: '',
      category: input.category,
      image: `https://picsum.photos/seed/${id}/640/900`,
      host: s.me,
      venue: input.venue,
      area: input.area,
      distanceKm: 0,
      when: input.when,
      spots: Math.max(1, input.spots), // host occupies the first seat, so a plan needs ≥1 spot
      going: 1, // host is in
      tags: [],
      audience: input.audience,
    };
    set({
      discovery: [plan, ...s.discovery],
      joinedIds: [id, ...s.joinedIds],
      stats: { ...s.stats, plans: s.stats.plans + 1 },
    });
    return id;
  },

  // ── buckets ──
  buckets: MY_BUCKETS.map(cloneBucket),
  savedBucketIds: [],
  taraedBucketIds: [],
  addBucket: (input) => {
    const id = uid('b');
    set((s) => ({
      buckets: [
        {
          interested: 0,
          done: false,
          privacy: 'public',
          intent: 'open',
          category: 'experiences',
          ...input,
          id,
        },
        ...s.buckets,
      ],
    }));
    return id;
  },
  updateBucket: (id, patch) =>
    set((s) => ({ buckets: s.buckets.map((b) => (b.id === id ? { ...b, ...patch } : b)) })),
  removeBucket: (id) => set((s) => ({ buckets: s.buckets.filter((b) => b.id !== id) })),
  toggleBucketDone: (id) =>
    set((s) => ({ buckets: s.buckets.map((b) => (b.id === id ? { ...b, done: !b.done } : b)) })),
  tapTara: (id) =>
    set((s) => {
      const on = s.taraedBucketIds.includes(id);
      return {
        taraedBucketIds: on ? s.taraedBucketIds.filter((x) => x !== id) : [...s.taraedBucketIds, id],
        buckets: s.buckets.map((b) => (b.id === id ? { ...b, interested: Math.max(0, b.interested + (on ? -1 : 1)) } : b)),
      };
    }),
  toggleSubItem: (bucketId, itemId) =>
    set((s) => ({
      buckets: s.buckets.map((b) =>
        b.id === bucketId && b.items
          ? { ...b, items: b.items.map((i) => (i.id === itemId ? { ...i, done: !i.done } : i)) }
          : b,
      ),
    })),
  addSubItem: (bucketId, title) =>
    set((s) => ({
      buckets: s.buckets.map((b) =>
        b.id === bucketId
          ? { ...b, items: [...(b.items ?? []), { id: uid('sub'), title, done: false }] }
          : b,
      ),
    })),
  toggleSavedBucket: (id) =>
    set((s) => ({
      savedBucketIds: s.savedBucketIds.includes(id)
        ? s.savedBucketIds.filter((x) => x !== id)
        : [...s.savedBucketIds, id],
    })),

  // ── tables ──
  tables: TABLES.map((t) => ({ ...t })),
  reservedTableIds: [],
  reserveSeat: (id) =>
    set((s) => {
      if (s.reservedTableIds.includes(id)) return {};
      const t = s.tables.find((x) => x.id === id);
      if (!t || t.seatsLeft <= 0) return {}; // table is full
      return {
        reservedTableIds: [...s.reservedTableIds, id],
        tables: s.tables.map((x) => (x.id === id ? { ...x, seatsLeft: Math.max(0, x.seatsLeft - 1) } : x)),
      };
    }),
  cancelSeat: (id) =>
    set((s) => {
      if (!s.reservedTableIds.includes(id)) return {};
      return {
        reservedTableIds: s.reservedTableIds.filter((x) => x !== id),
        tables: s.tables.map((t) => (t.id === id ? { ...t, seatsLeft: Math.min(t.seats, t.seatsLeft + 1) } : t)),
      };
    }),

  // ── feed ──
  feed: FEED.map((r) => ({ ...r })),
  savedPostIds: [],
  postComments: {
    r1: [
      { id: 'c1', from: PEOPLE.find((p) => p.id === 'u_bea')!, text: 'Solid ang samgyup dito, next time sama ako! 🔥', time: '2h' },
      { id: 'c2', from: PEOPLE.find((p) => p.id === 'u_migs')!, text: 'Grabe yung kain natin haha, busog lipos', time: '1h' },
    ],
    r2: [{ id: 'c3', from: PEOPLE.find((p) => p.id === 'u_lara')!, text: 'Ang ganda ng sunrise!! Sama ako sa next hike 🥾', time: '4h' }],
  },
  planRatings: {},
  addComment: (postId, text) =>
    set((s) => ({
      postComments: {
        ...s.postComments,
        [postId]: [...(s.postComments[postId] ?? []), { id: uid('c'), from: s.me, text, time: 'now', mine: true }],
      },
    })),
  ratePlan: (id, stars) => set((s) => ({ planRatings: { ...s.planRatings, [id]: stars } })),
  toggleLike: (id) =>
    set((s) => ({
      feed: s.feed.map((r) =>
        r.id === id ? { ...r, liked: !r.liked, likes: r.likes + (r.liked ? -1 : 1) } : r,
      ),
    })),
  toggleSavePost: (id) =>
    set((s) => ({
      savedPostIds: s.savedPostIds.includes(id)
        ? s.savedPostIds.filter((x) => x !== id)
        : [...s.savedPostIds, id],
    })),
  hidePost: (id) =>
    set((s) => {
      // Drop the post and any state that keyed off it, so nothing orphans (no UI path back to unsave/uncomment a hidden post).
      const { [id]: _dropped, ...postComments } = s.postComments;
      return {
        feed: s.feed.filter((r) => r.id !== id),
        savedPostIds: s.savedPostIds.filter((x) => x !== id),
        postComments,
      };
    }),
  loadMoreFeed: () =>
    set((s) => {
      const start = s.feed.length;
      // Cycle the base receipts with fresh ids so likes/saves still resolve to store items.
      const more = Array.from({ length: 4 }, (_, i) => {
        const base = FEED[(start + i) % FEED.length]!;
        return { ...base, id: uid('r'), liked: false };
      });
      return { feed: [...s.feed, ...more] };
    }),
  resetFeed: () => set({ feed: FEED.map((r) => ({ ...r })) }),

  // ── kadas ──
  kadas: KADAS.map((k) => ({ ...k })),
  myKadaIds: ['k1', 'k3', 'k6'],
  createKada: (input) => {
    const id = uid('k');
    const extra = (input.memberIds ?? [])
      .map((pid) => PEOPLE.find((p) => p.id === pid))
      .filter((p): p is Person => Boolean(p));
    set((s) => ({
      kadas: [
        { id, name: input.name, emoji: input.emoji, color: input.color, members: [get().me, ...extra], level: 1, plans: 0, bucketCount: 0, lastActive: 'Just now' },
        ...s.kadas,
      ],
      myKadaIds: [id, ...s.myKadaIds],
    }));
    return id;
  },
  requestedKadaIds: [],
  joinKada: (id) =>
    set((s) => ({ myKadaIds: s.myKadaIds.includes(id) ? s.myKadaIds : [...s.myKadaIds, id] })),
  leaveKada: (id) => set((s) => ({ myKadaIds: s.myKadaIds.filter((x) => x !== id) })),
  toggleKadaRequest: (id) =>
    set((s) => ({
      requestedKadaIds: s.requestedKadaIds.includes(id)
        ? s.requestedKadaIds.filter((x) => x !== id)
        : [...s.requestedKadaIds, id],
    })),

  // ── invites ──
  invitedIds: [],
  toggleInvited: (id) =>
    set((s) => ({
      invitedIds: s.invitedIds.includes(id) ? s.invitedIds.filter((x) => x !== id) : [...s.invitedIds, id],
    })),

  // ── comms ──
  threads: Object.fromEntries(Object.entries(THREADS).map(([k, v]) => [k, v.map((n) => ({ ...n }))])),
  readConvoIds: [],
  notifs: NOTIFS.map((n) => ({ ...n })),
  sendMessage: (convoId, text) =>
    set((s) => ({
      threads: {
        ...s.threads,
        [convoId]: [...(s.threads[convoId] ?? []), { id: uid('n'), from: s.me, text, mine: true, time: 'now' }],
      },
    })),
  markConvoRead: (convoId) =>
    set((s) => (s.readConvoIds.includes(convoId) ? {} : { readConvoIds: [...s.readConvoIds, convoId] })),
  markNotifRead: (id) =>
    set((s) => ({ notifs: s.notifs.map((n) => (n.id === id ? { ...n, unread: false } : n)) })),
  markAllNotifsRead: () => set((s) => ({ notifs: s.notifs.map((n) => ({ ...n, unread: false })) })),

  // ── settings ──
  notifPrefs: { ...NOTIF_DEFAULTS },
  discoveryPrefs: {
    maxDistanceKm: 25,
    ageMin: 21,
    ageMax: 38,
    showOnDiscovery: true,
    verifiedOnly: true,
    hideDistance: false,
    preciseLocation: true,
  },
  privacy: {
    visibility: 'Kada-only',
    showTrustScore: true,
    discoverable: true,
    readReceipts: true,
    shareActivity: false,
  },
  prefs: { language: 'taglish', dataSaver: false, reduceMotion: false, theme: 'light' },
  setNotifPref: (key, v) => set((s) => ({ notifPrefs: { ...s.notifPrefs, [key]: v } })),
  setDiscoveryPref: (patch) => set((s) => ({ discoveryPrefs: { ...s.discoveryPrefs, ...patch } })),
  setPrivacy: (patch) => set((s) => ({ privacy: { ...s.privacy, ...patch } })),
  setPrefs: (patch) => set((s) => ({ prefs: { ...s.prefs, ...patch } })),

  // ── safety & trust ──
  trustedContacts: [
    { id: 'u_jio', name: 'Jio Mendoza', phone: '+63 917 555 0142', avatar: PEOPLE.find((p) => p.id === 'u_jio')?.avatar },
    { id: 'u_bea', name: 'Bea Cruz', phone: '+63 918 555 0186', avatar: PEOPLE.find((p) => p.id === 'u_bea')?.avatar },
  ],
  blockedIds: [],
  confirmedPlanIds: [],
  shareLiveLocation: false,
  setShareLiveLocation: (v) => set({ shareLiveLocation: v }),
  addTrustedContact: (input) =>
    set((s) => {
      const id = input.id ?? uid('tc');
      if (s.trustedContacts.some((c) => c.id === id)) return {};
      return { trustedContacts: [...s.trustedContacts, { id, name: input.name, phone: input.phone, avatar: input.avatar }] };
    }),
  removeTrustedContact: (id) =>
    set((s) => ({ trustedContacts: s.trustedContacts.filter((c) => c.id !== id) })),
  blockUser: (id) =>
    set((s) => ({
      blockedIds: s.blockedIds.includes(id) ? s.blockedIds : [...s.blockedIds, id],
      friendIds: s.friendIds.filter((x) => x !== id),
      followingIds: s.followingIds.filter((x) => x !== id),
    })),
  unblockUser: (id) => set((s) => ({ blockedIds: s.blockedIds.filter((x) => x !== id) })),
  confirmAttendance: (planId) =>
    set((s) => ({
      confirmedPlanIds: s.confirmedPlanIds.includes(planId) ? s.confirmedPlanIds : [...s.confirmedPlanIds, planId],
    })),
    }),
    {
      name: 'tarabucket-demo',
      storage: createJSONStorage(() => (isServer ? noopStorage : AsyncStorage)),
      // Bump `version` whenever src/data/mock.ts changes: the content arrays are persisted, so a
      // stale cache would otherwise shadow the new fixtures forever. `migrate` returns an empty
      // object, which the default shallow merge resolves to "keep the fresh initial state".
      version: 1,
      migrate: () => ({}) as Persisted,
      partialize: (s) => ({
        // Snapshot the *module* counter, not `s._seq` — `s._seq` only ever holds its init value.
        _seq: seq,
        session: s.session,
        me: s.me, interests: s.interests, stats: s.stats, isPremium: s.isPremium,
        followingIds: s.followingIds, friendIds: s.friendIds, requestedIds: s.requestedIds,
        discovery: s.discovery, filters: s.filters, location: s.location,
        joinedIds: s.joinedIds, passedIds: s.passedIds, freeStrangerLeft: s.freeStrangerLeft,
        buckets: s.buckets, savedBucketIds: s.savedBucketIds, taraedBucketIds: s.taraedBucketIds,
        tables: s.tables, reservedTableIds: s.reservedTableIds,
        feed: s.feed, savedPostIds: s.savedPostIds, postComments: s.postComments, planRatings: s.planRatings,
        kadas: s.kadas, myKadaIds: s.myKadaIds, requestedKadaIds: s.requestedKadaIds,
        invitedIds: s.invitedIds,
        threads: s.threads, readConvoIds: s.readConvoIds, notifs: s.notifs,
        notifPrefs: s.notifPrefs, discoveryPrefs: s.discoveryPrefs, privacy: s.privacy, prefs: s.prefs,
        trustedContacts: s.trustedContacts, blockedIds: s.blockedIds,
        confirmedPlanIds: s.confirmedPlanIds, shareLiveLocation: s.shareLiveLocation,
      }),
      onRehydrateStorage: () => (state) => {
        // Resume the id counter past every persisted id, else `uid()` reissues b101/k101/… on top
        // of the items we just restored.
        if (state?._seq) seq = Math.max(seq, state._seq);
        useStore.setState({ _hydrated: true });
      },
    },
  ),
);

// Pristine fixture state, snapshotted before rehydration lands and before any action runs.
// Safe to hand back wholesale on reset: every action rebuilds arrays via map/spread and never
// mutates in place, so these references stay untouched for the life of the process.
const PRISTINE = { ...useStore.getState() };

// ── Derived selectors (plain helpers — call inside useMemo, not useStore) ──
export const bucketProgress = (b: Bucket): { done: number; total: number } | null => {
  if (!b.items || b.items.length === 0) return null;
  return { done: b.items.filter((i) => i.done).length, total: b.items.length };
};

export const unreadNotifCount = (notifs: Notif[]) => notifs.filter((n) => n.unread).length;
