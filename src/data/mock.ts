import { C } from '@/lib/tokens';

const A = (n: number) => `https://i.pravatar.cc/240?img=${n}`;
const P = (seed: string) => `https://picsum.photos/seed/${seed}/900/1200`;

// ── Category hierarchy ──────────────────────────────────────────────
export type Category = {
  key: string;
  label: string;
  tagalog: string;
  emoji: string;
  color: string;
  subs: string[];
};

export const CATEGORIES: Category[] = [
  { key: 'travel', label: 'Travel', tagalog: 'Lakwatsa', emoji: '🏝', color: C.blue,
    subs: ['Local', 'International', 'Beaches & Islands', 'Mountains & Nature', 'Cities & Heritage'] },
  { key: 'food', label: 'Food', tagalog: 'Pagkain', emoji: '🍜', color: C.orange,
    subs: ['Local Specialties', 'Street Food', 'Restaurants & Cafés', 'Cooking'] },
  { key: 'festivals', label: 'Festivals & Events', tagalog: 'Pista', emoji: '🎉', color: C.red,
    subs: ['Festivals', 'Concerts', 'Religious'] },
  { key: 'adventure', label: 'Adventure', tagalog: 'Adventure', emoji: '🧗', color: C.green,
    subs: ['Water', 'Land', 'Air', 'Wildlife'] },
  { key: 'milestones', label: 'Milestones', tagalog: 'Pangarap', emoji: '⭐', color: '#F4B740',
    subs: ['Family', 'Career & Business', 'Finance', 'Home'] },
  { key: 'experiences', label: 'Experiences', tagalog: 'Karanasan', emoji: '🎭', color: C.violet,
    subs: ['Entertainment', 'Attractions', 'Nightlife'] },
  { key: 'growth', label: 'Personal Growth', tagalog: 'Sarili', emoji: '🌱', color: '#0EA5A5',
    subs: ['Sports & Fitness', 'Arts & Music', 'Learning', 'Hobbies'] },
  { key: 'relationships', label: 'Relationships', tagalog: 'Barkada', emoji: '🫶', color: '#FF6B9D',
    subs: ['Trips', 'Dates', 'Reunions'] },
  { key: 'curated', label: 'Curated', tagalog: 'Curated', emoji: '✨', color: C.ink,
    subs: ['Top Destinations', 'Top Food', 'Seasonal', "Editor's Choice"] },
];

const cat = (key: string) => CATEGORIES.find((c) => c.key === key);
export const catColor = (key: string) => cat(key)?.color ?? C.ink;
export const catEmoji = (key: string) => cat(key)?.emoji ?? '✨';
export const catLabel = (key: string) => cat(key)?.label ?? key;

// ── People ──────────────────────────────────────────────────────────
export type Person = {
  id: string;
  name: string;
  handle: string;
  age: number;
  avatar: string;
  verified: boolean;
  trust: number;
};

export const PEOPLE: Person[] = [
  { id: 'u_maya', name: 'Maya Santos', handle: 'mayasantos', age: 28, avatar: A(5), verified: true, trust: 96 },
  { id: 'u_paolo', name: 'Paolo Reyes', handle: 'pao.reyes', age: 31, avatar: A(12), verified: true, trust: 92 },
  { id: 'u_andrea', name: 'Andrea Lim', handle: 'andreaa', age: 25, avatar: A(45), verified: true, trust: 88 },
  { id: 'u_jio', name: 'Jio Mendoza', handle: 'jiomendz', age: 29, avatar: A(15), verified: true, trust: 90 },
  { id: 'u_bea', name: 'Bea Cruz', handle: 'beacruz', age: 27, avatar: A(31), verified: true, trust: 94 },
  { id: 'u_carlo', name: 'Carlo Tan', handle: 'carlotan', age: 33, avatar: A(33), verified: true, trust: 85 },
  { id: 'u_nina', name: 'Nina Flores', handle: 'ninaf', age: 26, avatar: A(47), verified: false, trust: 78 },
  { id: 'u_migs', name: 'Miguel Ong', handle: 'migsong', age: 30, avatar: A(51), verified: true, trust: 91 },
  { id: 'u_kaye', name: 'Kaye Villar', handle: 'kayev', age: 24, avatar: A(44), verified: true, trust: 82 },
  { id: 'u_ron', name: 'Ron Aquino', handle: 'ronaq', age: 32, avatar: A(53), verified: true, trust: 89 },
  { id: 'u_trina', name: 'Trina Bautista', handle: 'trinab', age: 27, avatar: A(20), verified: true, trust: 87 },
  { id: 'u_josh', name: 'Josh Dela Peña', handle: 'joshdlp', age: 29, avatar: A(60), verified: true, trust: 84 },
  { id: 'u_lara', name: 'Lara Gomez', handle: 'laragomez', age: 26, avatar: A(48), verified: true, trust: 93 },
  { id: 'u_rico', name: 'Rico Salazar', handle: 'ricos', age: 34, avatar: A(59), verified: true, trust: 86 },
];
export const ME = PEOPLE[0]!; // PEOPLE is a non-empty literal
const by = (id: string) => PEOPLE.find((p) => p.id === id)!;

// ── Discovery (the swipe deck of open plans) ────────────────────────
export type Discovery = {
  id: string;
  title: string;
  blurb: string;
  category: string;
  sub?: string;
  image: string;
  host: Person;
  venue: string;
  area: string;
  distanceKm: number;
  when: string;
  spots: number;
  going: number;
  tags: string[];
  audience: 'stranger' | 'kada';
  genderPref?: 'all' | 'women' | 'men';
};

export const DISCOVERY: Discovery[] = [
  { id: 'd1', title: 'Samgyup + soju crawl', blurb: 'Unli samgyup then bar-hopping around Poblacion. Sino game after work?', category: 'food', sub: 'Restaurants & Cafés', image: P('samgyup-night'), host: by('u_jio'), venue: 'Romantic Baboy', area: 'Poblacion, Makati', distanceKm: 1.2, when: 'Fri · 7:00 PM', spots: 6, going: 3, tags: ['unli', 'after-work', 'soju'], audience: 'stranger' },
  { id: 'd2', title: 'Mt. Batulao day hike', blurb: 'Beginner-friendly sunrise trek. Carpool from Makati, back by lunch.', category: 'adventure', sub: 'Land', image: P('batulao-hike'), host: by('u_paolo'), venue: 'Mt. Batulao', area: 'Nasugbu, Batangas', distanceKm: 62, when: 'Sun · 4:30 AM', spots: 8, going: 5, tags: ['sunrise', 'carpool', 'beginner'], audience: 'stranger' },
  { id: 'd3', title: 'Third-wave coffee hop', blurb: 'Trying 3 specialty cafés in one afternoon. Bring your laptop or just chill.', category: 'food', sub: 'Restaurants & Cafés', image: P('coffee-hop'), host: by('u_bea'), venue: 'Yardstick + 2', area: 'Legazpi Village, Makati', distanceKm: 0.8, when: 'Sat · 2:00 PM', spots: 5, going: 2, tags: ['coffee', 'chill', 'wfh'], genderPref: 'women', audience: 'stranger' },
  { id: 'd4', title: 'Board game night', blurb: 'Catan, Codenames, Avalon. Newbies super welcome, we teach.', category: 'experiences', sub: 'Entertainment', image: P('board-games'), host: by('u_andrea'), venue: 'Ludo Boardgame Bar', area: 'BGC, Taguig', distanceKm: 5.4, when: 'Wed · 6:30 PM', spots: 6, going: 4, tags: ['newbie-ok', 'catan'], audience: 'stranger' },
  { id: 'd5', title: 'Nasugbu beach day trip', blurb: 'Van + cottage split. Swimming, grill, and sunset. KKB, ~₱1.2k each.', category: 'travel', sub: 'Beaches & Islands', image: P('nasugbu-beach'), host: by('u_kaye'), venue: 'Fortune Island cove', area: 'Nasugbu, Batangas', distanceKm: 90, when: 'Sat · 6:00 AM', spots: 10, going: 7, tags: ['beach', 'grill', 'KKB'], audience: 'stranger' },
  { id: 'd6', title: 'Sunset run + smoothies', blurb: 'Easy 5k along the BGC track, smoothies after. Any pace, no drop.', category: 'growth', sub: 'Sports & Fitness', image: P('sunset-run'), host: by('u_ron'), venue: 'BGC Track 30th', area: 'BGC, Taguig', distanceKm: 5.1, when: 'Tue · 5:30 PM', spots: 8, going: 3, tags: ['run-club', 'no-drop'], audience: 'stranger' },
  { id: 'd7', title: 'Binondo food crawl', blurb: 'Dumplings, hopia, fried siopao — eat our way through the oldest Chinatown.', category: 'food', sub: 'Street Food', image: P('binondo-crawl'), host: by('u_migs'), venue: 'Binondo', area: 'Manila', distanceKm: 8, when: 'Sun · 10:00 AM', spots: 6, going: 4, tags: ['chinatown', 'street-food', 'walk'], audience: 'stranger' },
  { id: 'd8', title: 'Videoke + wings night', blurb: 'Belt it out, unli wings, ice-cold beer. Bawal ang shy 🎤', category: 'experiences', sub: 'Nightlife', image: P('videoke-night'), host: by('u_nina'), venue: 'Music 21 Centris', area: 'Quezon City', distanceKm: 11, when: 'Fri · 9:00 PM', spots: 8, going: 5, tags: ['videoke', 'wings', 'beer'], audience: 'stranger' },
  { id: 'd9', title: 'Freediving intro in Anilao', blurb: 'Discover freediving with a licensed instructor. No experience needed.', category: 'adventure', sub: 'Water', image: P('anilao-freedive'), host: by('u_rico'), venue: 'Anilao', area: 'Mabini, Batangas', distanceKm: 110, when: 'Sat · 5:00 AM', spots: 6, going: 3, tags: ['freedive', 'ocean', 'beginner'], audience: 'stranger' },
  { id: 'd10', title: 'Pottery wheel workshop', blurb: 'Get your hands dirty — throw your first bowl. Take home your piece.', category: 'growth', sub: 'Arts & Music', image: P('pottery-workshop'), host: by('u_lara'), venue: 'Clay Studio', area: 'Poblacion, Makati', distanceKm: 1.4, when: 'Sun · 3:00 PM', spots: 5, going: 2, tags: ['pottery', 'hands-on', 'artsy'], genderPref: 'women', audience: 'stranger' },
  { id: 'd11', title: 'Intramuros heritage walk', blurb: 'Guided bamboo-bike tour of the walled city, sunset at Baluarte.', category: 'travel', sub: 'Cities & Heritage', image: P('intramuros-walk'), host: by('u_josh'), venue: 'Intramuros', area: 'Manila', distanceKm: 9, when: 'Sat · 4:00 PM', spots: 8, going: 5, tags: ['history', 'bikes', 'sunset'], audience: 'stranger' },
  { id: 'd12', title: 'Ben&Ben concert night', blurb: 'Got 4 extra tickets — GA standing. Meet for dinner before, tara?', category: 'festivals', sub: 'Concerts', image: P('benben-concert'), host: by('u_trina'), venue: 'MOA Arena', area: 'Pasay', distanceKm: 12, when: 'Sat · 8:00 PM', spots: 6, going: 4, tags: ['OPM', 'concert', 'GA'], audience: 'stranger' },
  { id: 'd13', title: 'Salcedo market brunch', blurb: 'Weekend market grazing then long-table brunch. Foodies unite.', category: 'food', sub: 'Local Specialties', image: P('salcedo-market'), host: by('u_bea'), venue: 'Salcedo Saturday Market', area: 'Makati', distanceKm: 0.9, when: 'Sat · 9:00 AM', spots: 6, going: 3, tags: ['market', 'brunch', 'foodie'], audience: 'stranger' },
  { id: 'd14', title: 'Muay Thai intro class', blurb: 'Try a beginner Muay Thai session together, milk tea after (haha).', category: 'growth', sub: 'Sports & Fitness', image: P('muaythai-class'), host: by('u_carlo'), venue: 'Elite Boxing', area: 'BGC, Taguig', distanceKm: 5.2, when: 'Thu · 7:00 PM', spots: 6, going: 2, tags: ['muaythai', 'beginner', 'sweat'], genderPref: 'men', audience: 'stranger' },
  { id: 'd15', title: 'La Mesa trail bike', blurb: 'Chill MTB loop around the eco park, halo-halo after the ride.', category: 'adventure', sub: 'Land', image: P('lamesa-bike'), host: by('u_ron'), venue: 'La Mesa Eco Park', area: 'Quezon City', distanceKm: 14, when: 'Sun · 6:30 AM', spots: 8, going: 4, tags: ['bike', 'nature', 'chill'], audience: 'stranger' },
  { id: 'd16', title: 'Rooftop wine & sunset', blurb: 'Bring-your-own-bottle sunset session up on a BGC rooftop. Golden hour.', category: 'experiences', sub: 'Nightlife', image: P('rooftop-wine'), host: by('u_lara'), venue: 'The Grid Rooftop', area: 'BGC, Taguig', distanceKm: 5.6, when: 'Fri · 5:30 PM', spots: 6, going: 3, tags: ['wine', 'sunset', 'BYOB'], audience: 'stranger' },
  { id: 'd17', title: 'Escape room challenge', blurb: '60 minutes, one locked room, can we beat it? Winner-buys-dinner.', category: 'experiences', sub: 'Entertainment', image: P('escape-room'), host: by('u_jio'), venue: 'Mystery Manila', area: 'Makati', distanceKm: 1.1, when: 'Sat · 5:00 PM', spots: 6, going: 5, tags: ['puzzle', 'teamwork'], audience: 'stranger' },
  { id: 'd18', title: 'Sinulog weekend, Cebu', blurb: 'Flights + Airbnb split for the biggest fiesta in PH. Street party ready?', category: 'festivals', sub: 'Festivals', image: P('sinulog-cebu'), host: by('u_paolo'), venue: 'Cebu City', area: 'Cebu', distanceKm: 570, when: 'Jan 3rd wknd', spots: 8, going: 6, tags: ['fiesta', 'cebu', 'flights'], audience: 'stranger' },
];

// Rough cost band per plan — very PH ("magkano?" / "libre ba?"). Derived on read
// via a keyed map so the plan literals above stay untouched.
export type Budget = 'libre' | 'budget' | 'splurge';
const BUDGET_BY_ID: Record<string, Budget> = {
  d1: 'budget', d2: 'budget', d3: 'budget', d4: 'budget', d5: 'splurge', d6: 'libre',
  d7: 'budget', d8: 'budget', d9: 'splurge', d10: 'splurge', d11: 'budget', d12: 'splurge',
  d13: 'budget', d14: 'budget', d15: 'libre', d16: 'budget', d17: 'budget', d18: 'splurge',
};
export const budgetOf = (d: { id: string }): Budget => BUDGET_BY_ID[d.id] ?? 'budget';
export const budgetShort = (b: Budget): string => (b === 'libre' ? 'Libre' : b === 'budget' ? '₱' : '₱₱');
export const BUDGET_OPTIONS: { key: 'any' | Budget; label: string }[] = [
  { key: 'any', label: 'Any' },
  { key: 'libre', label: 'Libre' },
  { key: 'budget', label: '₱' },
  { key: 'splurge', label: '₱₱' },
];

// ── Curated Tara Tables ─────────────────────────────────────────────
export type Table = {
  id: string;
  title: string;
  emoji: string;
  image: string;
  when: string;
  area: string;
  venueHint: string;
  seatsLeft: number;
  seats: number;
  category: string;
  sub?: string;
  genderPref?: 'all' | 'women' | 'men';
};

export const TABLES: Table[] = [
  { id: 't1', title: 'Korean BBQ table', emoji: '🍲', image: P('kbbq-table'), when: 'Sat · 7:00 PM', area: 'Makati', venueHint: 'Vetted venue revealed on seat', seatsLeft: 2, seats: 6, category: 'food', sub: 'Restaurants & Cafés' },
  { id: 't2', title: 'Board game meetup', emoji: '🎲', image: P('bg-table'), when: 'Sun · 3:00 PM', area: 'BGC', venueHint: 'Vetted café', seatsLeft: 3, seats: 6, category: 'experiences', sub: 'Entertainment' },
  { id: 't3', title: 'Ramen crawl', emoji: '🍜', image: P('ramen-table'), when: 'Fri · 6:30 PM', area: 'Poblacion', venueHint: '3 stops', seatsLeft: 1, seats: 6, category: 'food', sub: 'Street Food' },
  { id: 't4', title: 'Wine & cheese night', emoji: '🍷', image: P('wine-table'), when: 'Thu · 8:00 PM', area: 'Salcedo', venueHint: 'Rooftop bar', seatsLeft: 4, seats: 6, category: 'experiences', sub: 'Nightlife' },
  { id: 't5', title: 'Coffee cupping', emoji: '☕', image: P('coffee-table'), when: 'Sat · 10:00 AM', area: 'Legazpi', venueHint: 'Specialty roaster', seatsLeft: 3, seats: 6, category: 'food', sub: 'Local Specialties' },
  { id: 't6', title: 'Newbie hikers', emoji: '🥾', image: P('hike-table'), when: 'Sun · 5:00 AM', area: 'Rizal', venueHint: 'Carpool meetup', seatsLeft: 2, seats: 8, category: 'adventure', sub: 'Land' },
  { id: 't7', title: 'Art jam & sip', emoji: '🎨', image: P('artjam-table'), when: 'Fri · 7:00 PM', area: 'Poblacion', venueHint: 'Studio + wine', seatsLeft: 5, seats: 8, category: 'growth', sub: 'Arts & Music', genderPref: 'women' },
  { id: 't8', title: 'Street food tour', emoji: '🍢', image: P('streetfood-table'), when: 'Sat · 6:00 PM', area: 'Manila', venueHint: '5 stops', seatsLeft: 3, seats: 6, category: 'food', sub: 'Street Food' },
];

// ── Feed (receipts of fulfilled plans) ──────────────────────────────
export type Receipt = {
  id: string;
  title: string;
  category: string;
  sub?: string;
  image: string;
  host: Person;
  crew: Person[];
  venue: string;
  kada: string;
  when: string;
  likes: number;
  liked: boolean;
};

export const FEED: Receipt[] = [
  { id: 'r1', title: 'Samgyup crawl was ang saya', category: 'food', sub: 'Restaurants & Cafés', image: P('feed-samgyup'), host: by('u_maya'), crew: [by('u_jio'), by('u_bea'), by('u_migs'), by('u_kaye')], venue: 'Romantic Baboy, Poblacion', kada: 'Weekend Warriors', when: '2h ago', likes: 47, liked: false },
  { id: 'r2', title: 'Pulag sunrise, worth the 3AM call', category: 'adventure', sub: 'Mountains & Nature', image: P('feed-pulag'), host: by('u_paolo'), crew: [by('u_ron'), by('u_carlo'), by('u_andrea')], venue: 'Mt. Pulag, Benguet', kada: 'The Hikers', when: '5h ago', likes: 132, liked: true },
  { id: 'r3', title: 'Board game night, sobrang saya', category: 'experiences', sub: 'Entertainment', image: P('feed-boardgame'), host: by('u_andrea'), crew: [by('u_nina'), by('u_kaye'), by('u_migs')], venue: 'Ludo, BGC', kada: 'New in BGC', when: 'Yesterday', likes: 61, liked: false },
  { id: 'r4', title: 'Friday inuman with the officemates', category: 'experiences', sub: 'Nightlife', image: P('feed-inuman'), host: by('u_jio'), crew: [by('u_migs'), by('u_ron'), by('u_carlo'), by('u_bea'), by('u_nina')], venue: 'The Bowery, Poblacion', kada: 'Officemates', when: 'Yesterday', likes: 88, liked: false },
  { id: 'r5', title: 'Nasugbu day trip', category: 'travel', sub: 'Beaches & Islands', image: P('feed-beach'), host: by('u_kaye'), crew: [by('u_bea'), by('u_andrea'), by('u_nina'), by('u_maya')], venue: 'Fortune Island, Batangas', kada: 'Beach Bums', when: '2d ago', likes: 154, liked: true },
  { id: 'r6', title: 'Coffee hop then WFH sa café', category: 'food', sub: 'Restaurants & Cafés', image: P('feed-coffee'), host: by('u_bea'), crew: [by('u_maya'), by('u_kaye')], venue: 'Yardstick, Makati', kada: 'Caffeine Club', when: '3d ago', likes: 39, liked: false },
  { id: 'r7', title: 'Ben&Ben live — nagka-goosebumps', category: 'festivals', sub: 'Concerts', image: P('feed-concert'), host: by('u_trina'), crew: [by('u_lara'), by('u_nina'), by('u_kaye')], venue: 'MOA Arena, Pasay', kada: 'Concert Junkies', when: '3d ago', likes: 201, liked: true },
  { id: 'r8', title: 'Binondo food crawl, busog lipos', category: 'food', sub: 'Street Food', image: P('feed-binondo'), host: by('u_migs'), crew: [by('u_josh'), by('u_rico'), by('u_carlo')], venue: 'Binondo, Manila', kada: 'Foodtrip Squad', when: '4d ago', likes: 97, liked: false },
  { id: 'r9', title: 'First 21k — tapos na finally!', category: 'growth', sub: 'Sports & Fitness', image: P('feed-run'), host: by('u_ron'), crew: [by('u_paolo'), by('u_carlo')], venue: 'BGC, Taguig', kada: 'Runners High', when: '5d ago', likes: 178, liked: true },
  { id: 'r10', title: 'Art jam night, walang artist na natakot', category: 'growth', sub: 'Arts & Music', image: P('feed-artjam'), host: by('u_lara'), crew: [by('u_maya'), by('u_trina'), by('u_bea')], venue: 'Clay Studio, Makati', kada: 'Creative Kada', when: '6d ago', likes: 64, liked: false },
  { id: 'r11', title: 'Intramuros bike tour', category: 'travel', sub: 'Cities & Heritage', image: P('feed-intramuros'), host: by('u_josh'), crew: [by('u_andrea'), by('u_nina')], venue: 'Intramuros, Manila', kada: 'Museo Hoppers', when: '1w ago', likes: 73, liked: false },
  { id: 'r12', title: 'Sinulog Cebu was unreal', category: 'festivals', sub: 'Festivals', image: P('feed-sinulog'), host: by('u_paolo'), crew: [by('u_ron'), by('u_carlo'), by('u_rico'), by('u_josh')], venue: 'Cebu City', kada: 'Fiesta Chasers', when: '1w ago', likes: 245, liked: true },
];

// ── Kadas ───────────────────────────────────────────────────────────
export type Kada = {
  id: string;
  name: string;
  emoji: string;
  color: string;
  members: Person[];
  level: number;
  plans: number;
  bucketCount: number;
  lastActive: string;
};

export const KADAS: Kada[] = [
  { id: 'k1', name: 'Weekend Warriors', emoji: '🍻', color: C.orange, members: [by('u_maya'), by('u_jio'), by('u_bea'), by('u_migs'), by('u_kaye')], level: 12, plans: 34, bucketCount: 18, lastActive: 'Active now' },
  { id: 'k2', name: 'The Hikers', emoji: '🏔', color: C.green, members: [by('u_paolo'), by('u_ron'), by('u_carlo'), by('u_andrea')], level: 9, plans: 21, bucketCount: 11, lastActive: '2h ago' },
  { id: 'k3', name: 'New in BGC', emoji: '✨', color: C.blue, members: [by('u_andrea'), by('u_nina'), by('u_kaye'), by('u_migs'), by('u_maya'), by('u_ron')], level: 6, plans: 14, bucketCount: 9, lastActive: 'Yesterday' },
  { id: 'k4', name: 'Caffeine Club', emoji: '☕', color: C.violet, members: [by('u_bea'), by('u_maya'), by('u_kaye')], level: 4, plans: 8, bucketCount: 6, lastActive: '3d ago' },
  { id: 'k5', name: 'Concert Junkies', emoji: '🎤', color: C.red, members: [by('u_trina'), by('u_lara'), by('u_nina'), by('u_kaye')], level: 7, plans: 16, bucketCount: 12, lastActive: '5h ago' },
  { id: 'k6', name: 'Foodtrip Squad', emoji: '🍜', color: C.orange, members: [by('u_migs'), by('u_josh'), by('u_rico'), by('u_carlo'), by('u_maya')], level: 10, plans: 28, bucketCount: 22, lastActive: 'Active now' },
  { id: 'k7', name: 'Runners High', emoji: '🏃', color: '#0EA5A5', members: [by('u_ron'), by('u_paolo'), by('u_carlo')], level: 8, plans: 19, bucketCount: 7, lastActive: 'Yesterday' },
  { id: 'k8', name: 'Museo Hoppers', emoji: '🏛', color: '#F4B740', members: [by('u_josh'), by('u_andrea'), by('u_nina'), by('u_lara')], level: 3, plans: 6, bucketCount: 8, lastActive: '4d ago' },
];

// ── My buckets ──────────────────────────────────────────────────────
// A bucket can be a single want, or a two-level "collection" — a broad goal
// (e.g. "Visit all UNESCO sites in PH") with sub-buckets under it.
export type SubItem = { id: string; title: string; note?: string; done: boolean };

export type Bucket = {
  id: string;
  title: string;
  category: string;
  sub?: string;
  privacy: 'private' | 'kada' | 'public';
  intent: 'solo' | 'kada' | 'open';
  interested: number;
  done: boolean;
  items?: SubItem[]; // present ⇒ this is a collection bucket with sub-buckets
  photos?: string[]; // memories — filled once the bucket is done
};

export const MY_BUCKETS: Bucket[] = [
  { id: 'b1', title: 'Try that new samgyup place in Poblacion', category: 'food', sub: 'Restaurants & Cafés', privacy: 'public', intent: 'open', interested: 5, done: false },
  { id: 'b2', title: 'Climb Mt. Pulag before I turn 30', category: 'adventure', sub: 'Mountains & Nature', privacy: 'public', intent: 'open', interested: 12, done: false },
  { id: 'b3', title: 'Wine tasting night with the girls', category: 'experiences', sub: 'Nightlife', privacy: 'kada', intent: 'kada', interested: 3, done: false },
  { id: 'b4', title: 'Learn to make ramen from scratch', category: 'food', sub: 'Cooking', privacy: 'private', intent: 'solo', interested: 0, done: false },
  { id: 'b5', title: 'Island hopping in El Nido', category: 'travel', sub: 'Beaches & Islands', privacy: 'public', intent: 'open', interested: 8, done: false,
    items: [
      { id: 'b5-a', title: 'Tour A — Big & Small Lagoon', note: 'Miniloc Island', done: true },
      { id: 'b5-b', title: 'Tour B — Cathedral Cave & Snake Island', done: false },
      { id: 'b5-c', title: 'Tour C — Hidden & Secret Beach', note: 'Matinloc Shrine', done: false },
      { id: 'b5-d', title: 'Tour D — Cadlao Lagoon & Paradise Beach', done: false },
    ] },
  { id: 'b6', title: 'Sunday farmers market run', category: 'food', sub: 'Local Specialties', privacy: 'kada', intent: 'kada', interested: 4, done: true,
    photos: ['https://picsum.photos/seed/mem-market-1/640/640', 'https://picsum.photos/seed/mem-market-2/640/640'] },
  { id: 'b7', title: 'See Sinulog Festival in Cebu', category: 'festivals', sub: 'Festivals', privacy: 'public', intent: 'open', interested: 9, done: false },
  { id: 'b8', title: 'Get freediving certified', category: 'adventure', sub: 'Water', privacy: 'public', intent: 'open', interested: 6, done: false },
  { id: 'b9', title: 'Buy my first condo by 32', category: 'milestones', sub: 'Home', privacy: 'private', intent: 'solo', interested: 0, done: false },
  { id: 'b10', title: 'Run a full marathon', category: 'growth', sub: 'Sports & Fitness', privacy: 'public', intent: 'open', interested: 7, done: false },
  { id: 'b11', title: 'Family beach reunion this summer', category: 'relationships', sub: 'Reunions', privacy: 'kada', intent: 'kada', interested: 5, done: false },
  { id: 'b12', title: 'Watch Ben&Ben live', category: 'festivals', sub: 'Concerts', privacy: 'public', intent: 'open', interested: 11, done: true,
    photos: ['https://picsum.photos/seed/mem-benben-1/640/640', 'https://picsum.photos/seed/mem-benben-2/640/640', 'https://picsum.photos/seed/mem-benben-3/640/640'] },
  { id: 'b13', title: 'Learn film photography', category: 'growth', sub: 'Hobbies', privacy: 'private', intent: 'solo', interested: 0, done: false },
  { id: 'b14', title: 'Visit all UNESCO sites in PH', category: 'travel', sub: 'Cities & Heritage', privacy: 'public', intent: 'open', interested: 4, done: false,
    items: [
      { id: 'b14-1', title: 'Baroque Churches of the Philippines', note: '4 churches · Ilocos, Manila, Iloilo', done: true },
      { id: 'b14-2', title: 'Rice Terraces of the Cordilleras', note: 'Ifugao', done: true },
      { id: 'b14-3', title: 'Historic City of Vigan', note: 'Ilocos Sur', done: false },
      { id: 'b14-4', title: 'Tubbataha Reefs Natural Park', note: 'Palawan', done: false },
      { id: 'b14-5', title: 'Puerto Princesa Subterranean River', note: 'Palawan', done: false },
      { id: 'b14-6', title: 'Mount Hamiguitan Range', note: 'Davao Oriental', done: false },
    ] },
];

// Preset interests a user can pick (Edit Profile / onboarding). Used to personalise discovery.
export const INTERESTS: string[] = [
  'Coffee', 'Foodie', 'Hiking', 'Beaches', 'Concerts', 'Photography', 'Fitness',
  'Travel', 'Nightlife', 'Board games', 'Art', 'Diving', 'Running', 'Karaoke',
  'Cooking', 'Museums', 'Wine', 'Motorcycles', 'Pets', 'Volunteering', 'Startups', 'Films',
];

export const ME_STATS = { plans: 34, kadas: 6, streak: 6, level: 8, trust: ME.trust, freeStrangerLeft: 2 };

// ── Per-user public profile data (so other people's profiles aren't all identical
// nor a mirror of the logged-in user). Deterministic from the person id — no
// Date/Math.random — so it's stable across renders. Real relationships (kadas a
// person belongs to, their public buckets) are derived from live data below.
const BIOS = [
  'Weekend adventurer, weekday desk warrior. Always down for a spontaneous tara.',
  'Coffee-first, plans-later. Makati-based, mountain-hearted.',
  'Foodie na hindi pihikan. If you know a good hole-in-the-wall, tara na.',
  'Sunrise hikes and sunset swims. Collecting stamps and receipts.',
  'Concert-goer, karaoke offender, certified beach bum.',
  'Runs on ramen and long drives. Barkada over everything.',
  'Trying every café in the metro, one flat white at a time.',
  'Museum-hopper and film-photo hobbyist. Slow travel enjoyer.',
];
const strHash = (s: string): number => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
};
type ProfileExtra = { bio: string; followers: number; following: number; plans: number; interests: string[] };
export const profileExtra = (id: string): ProfileExtra => {
  const h = strHash(id);
  const interests = Array.from({ length: 4 }, (_, k) => INTERESTS[(h + k * 7) % INTERESTS.length]!);
  return {
    bio: BIOS[h % BIOS.length]!,
    followers: 80 + (h % 900),
    following: 60 + ((h >> 3) % 480),
    plans: 6 + (h % 40),
    interests: Array.from(new Set(interests)),
  };
};
// Kadas a person actually belongs to (live from KADAS membership).
export const kadasOf = (id: string): Kada[] => KADAS.filter((k) => k.members.some((m) => m.id === id));
// A stable, per-person slice of the public buckets to show as "their" public buckets.
const PUBLIC_BUCKETS = MY_BUCKETS.filter((b) => b.privacy === 'public');
export const publicBucketsOf = (id: string): Bucket[] => {
  if (PUBLIC_BUCKETS.length === 0) return [];
  const start = strHash(id) % PUBLIC_BUCKETS.length;
  return [0, 1, 2].map((k) => PUBLIC_BUCKETS[(start + k) % PUBLIC_BUCKETS.length]!);
};

export type Note = { id: string; from: Person; text: string; mine: boolean; time: string };

// Chat threads, keyed by conversation id — a plan id (d…), a kada id (k…), or a
// person id (u…) for a DM. Conversations without a seed here open empty; the store
// falls back to `[]` so any conversation is still openable and sendable.
export const THREADS: Record<string, Note[]> = {
  // Samgyup crawl (d1) group chat
  d1: [
    { id: 'n1', from: by('u_jio'), text: 'Uy sino nandito na? nasa lobby ako 😄', mine: false, time: '6:52 PM' },
    { id: 'n2', from: ME, text: 'On the way! 5 mins, traffic sa Kalayaan 🚗', mine: true, time: '6:54 PM' },
    { id: 'n3', from: by('u_bea'), text: 'Reserved na yung table for 6. Tara na!', mine: false, time: '6:55 PM' },
    { id: 'n4', from: by('u_migs'), text: 'Sakto, gutom na gutom na ako haha', mine: false, time: '6:56 PM' },
    { id: 'n5', from: ME, text: 'Andito na ako, pasok na tayo', mine: true, time: '7:01 PM' },
  ],
  // Weekend Warriors kada (k1) group chat
  k1: [
    { id: 'k1n1', from: by('u_kaye'), text: 'Guys next week free ba kayo for the beach trip? 🏖', mine: false, time: '3:20 PM' },
    { id: 'k1n2', from: by('u_jio'), text: 'Ako oo! Sat better para hindi puyat papasok', mine: false, time: '3:24 PM' },
    { id: 'k1n3', from: ME, text: 'Same, Sat tayo. Gagawa ako ng bucket para may checklist 📋', mine: true, time: '3:31 PM' },
  ],
  // DM with Andrea (u_andrea)
  u_andrea: [
    { id: 'da1', from: by('u_andrea'), text: 'Hi! Sasama ka ba sa board game night? teteach kita mag-Catan haha', mine: false, time: '1:02 PM' },
    { id: 'da2', from: ME, text: 'Game! First time ko pero excited na 🎲', mine: true, time: '1:15 PM' },
  ],
  // DM with Bea (u_bea)
  u_bea: [
    { id: 'db1', from: ME, text: 'Uy that coffee hop looked so good, next time isama mo ako ☕', mine: true, time: 'Yesterday' },
    { id: 'db2', from: by('u_bea'), text: 'Syempre! May bago akong café na gusto ko subukan', mine: false, time: 'Yesterday' },
  ],
};

export type Notif = {
  id: string;
  kind: 'tara' | 'invite' | 'confirm' | 'like' | 'system';
  user?: Person;
  text: string;
  time: string;
  unread: boolean;
  // Deep-link target for the row — carries the actual subject so each notif routes
  // to its own plan/bucket/kada/etc. (not a static route keyed by `kind`).
  target?: { pathname: string; id?: string };
  confirmPlanId?: string; // 'confirm' rows show an attendance button for this plan
};
export const NOTIFS: Notif[] = [
  { id: 'no1', kind: 'tara', user: by('u_jio'), text: 'tapped Tara! on your samgyup crawl', time: '2m', unread: true, target: { pathname: '/plan/[id]', id: 'd1' } },
  { id: 'no2', kind: 'confirm', text: "Confirm now — 'Board game night' starts in 1 hour", time: '48m', unread: true, target: { pathname: '/plan/[id]', id: 'd4' }, confirmPlanId: 'd4' },
  { id: 'no3', kind: 'invite', user: by('u_paolo'), text: 'invited you to the kada "The Hikers"', time: '2h', unread: true, target: { pathname: '/kada/[id]', id: 'k2' } },
  { id: 'no4', kind: 'like', user: by('u_bea'), text: 'and 12 others liked your Pulag receipt', time: '5h', unread: false, target: { pathname: '/(tabs)/feed' } },
  { id: 'no5', kind: 'tara', user: by('u_andrea'), text: "wants to join your 'El Nido' bucket", time: '1d', unread: false, target: { pathname: '/bucket/[id]', id: 'b5' } },
  { id: 'no6', kind: 'system', text: 'Your ID verification is approved. You can now host meetups.', time: '2d', unread: false, target: { pathname: '/verify' } },
];
