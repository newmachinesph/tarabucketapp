import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Chip, IconButton, Input, PrimaryButton, ScreenHeader, SectionHeader } from '@/components/ui/kit';
import { Txt } from '@/components/ui/txt';
import { useToast } from '@/components/ui/toast';
import { CATEGORIES } from '@/data/mock';
import { hSuccess } from '@/lib/haptics';
import { C } from '@/lib/tokens';
import { useStore } from '@/store';

// ponytail: curated demo list — swap for a places API when the backend lands.
const VENUES = [
  { name: 'Romantic Baboy', area: 'Poblacion, Makati' },
  { name: 'Yardstick Coffee', area: 'Legazpi Village, Makati' },
  { name: 'The Bowery', area: 'Poblacion, Makati' },
  { name: 'Ludo Boardgame Bar', area: 'BGC, Taguig' },
  { name: 'The Wholesome Table', area: 'BGC, Taguig' },
  { name: 'BGC Track 30th', area: 'BGC, Taguig' },
  { name: 'Music 21 Centris', area: 'Quezon City' },
  { name: 'Maginhawa Food Strip', area: 'Quezon City' },
  { name: 'UP Town Center', area: 'Quezon City' },
  { name: 'Binondo Chinatown', area: 'Manila' },
  { name: 'Intramuros', area: 'Manila' },
  { name: 'Kapitolyo Food Row', area: 'Pasig' },
  { name: 'The Grove by Rockwell', area: 'Pasig' },
  { name: 'Sugbo Mercado', area: 'Cebu IT Park, Cebu' },
  { name: 'Roxas Night Market', area: 'Davao City' },
];

type Venue = (typeof VENUES)[number];

const DAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Next 14 days, computed once per app session.
const DATES = Array.from({ length: 14 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() + i);
  return {
    label: `${DAY[d.getDay()]} ${d.getDate()}`, // "Fri 10"
    full: `${DAY[d.getDay()]} ${MON[d.getMonth()]} ${d.getDate()}`, // "Fri Jul 10"
  };
});

const TIMES = ['11 AM', '1 PM', '3 PM', '5 PM', '7 PM', '9 PM'];

const SPLIT = ['50/50', 'Libre ko', 'Custom'];
const JOIN = ['Friends only', 'My kada', 'Open to strangers'];

const MIN_HEADS = 2;
const MAX_HEADS = 8;

function VettedPill() {
  return (
    <View className="ml-2 flex-row items-center rounded-full px-2 py-0.5" style={{ backgroundColor: `${C.green}1A` }}>
      <Ionicons name="checkmark-circle" size={12} color={C.green} />
      <Txt weight="bold" className="ml-0.5 text-[10px]" style={{ color: C.green }}>
        Vetted
      </Txt>
    </View>
  );
}

function Radio({ active }: { active: boolean }) {
  return (
    <View
      className="h-6 w-6 items-center justify-center rounded-full border-2"
      style={{ borderColor: active ? C.orange : C.line }}
    >
      {active ? <View className="h-3 w-3 rounded-full" style={{ backgroundColor: C.orange }} /> : null}
    </View>
  );
}

function VenueRow({ v, active, vetted, onPress }: { v: Venue; active: boolean; vetted: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      className="mx-5 mb-2.5 flex-row items-center rounded-2xl border-2 px-4 py-3.5 active:opacity-90"
      style={{ borderColor: active ? C.orange : C.line, backgroundColor: active ? `${C.orange}0A` : C.white }}
    >
      <View className="flex-1">
        <View className="flex-row items-center">
          <Txt weight="bold" className="text-[14px] text-brand-ink" numberOfLines={1}>
            {v.name}
          </Txt>
          {vetted && <VettedPill />}
        </View>
        <Txt weight="medium" className="mt-0.5 text-[12px] text-brand-muted">
          {v.area}
        </Txt>
      </View>
      <Radio active={active} />
    </Pressable>
  );
}

export default function CreatePlanScreen() {
  const insets = useSafeAreaInsets();
  const toast = useToast();
  // Prefill from the bucket funnel ("Make it a plan") — title + category ride along.
  const { title: titleParam, category: categoryParam } = useLocalSearchParams<{
    bucketId?: string;
    title?: string;
    category?: string;
  }>();
  const buckets = useStore((s) => s.buckets);
  const createPlan = useStore((s) => s.createPlan);
  const location = useStore((s) => s.location);
  const [title, setTitle] = useState(titleParam ?? '');
  const [cat, setCat] = useState(categoryParam ?? 'experiences');
  const [venue, setVenue] = useState<Venue>(VENUES[0]!);
  const [venueQuery, setVenueQuery] = useState('');
  const [dateIdx, setDateIdx] = useState(0);
  const [time, setTime] = useState('7 PM');
  const [heads, setHeads] = useState(4);
  const [split, setSplit] = useState(SPLIT[0]);
  const [join, setJoin] = useState(JOIN[0]);

  const vq = venueQuery.trim().toLowerCase();
  const venueResults = vq
    ? VENUES.filter((v) => `${v.name} ${v.area}`.toLowerCase().includes(vq))
    : VENUES.slice(0, 5);
  const isVetted = (v: Venue) => VENUES.some((x) => x.name === v.name && x.area === v.area);
  const customSelected = !isVetted(venue);
  const showCustom = vq.length > 0 && !VENUES.some((v) => v.name.toLowerCase() === vq);

  const when = `${DATES[dateIdx]!.full} · ${time.replace(' ', ':00 ')}`; // "Fri Jul 10 · 7:00 PM"

  const handleCreate = () => {
    const t = title.trim();
    if (!t) {
      toast('Add a title first');
      return;
    }
    const id = createPlan({
      title: t,
      category: cat,
      venue: venue.name,
      area: venue.area,
      when,
      spots: heads,
      audience: join === 'Open to strangers' ? 'stranger' : 'kada',
    });
    hSuccess();
    toast('Plan created ✓');
    router.replace({ pathname: '/plan/[id]', params: { id } });
  };

  return (
    <View className="flex-1 bg-white">
      <ScreenHeader title="New plan" />

      <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerClassName="pb-8 pt-2">
        {/* What are we doing */}
        <SectionHeader title="What are we doing?" />
        <View className="mt-3 px-5">
          <Input
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. Samgyup + soju crawl"
            className="rounded-2xl border-2 px-4 py-4 text-[14px]"
            style={{ borderColor: C.line }}
          />
          <Txt weight="medium" className="mb-2 mt-3 text-[12px] text-brand-muted">
            or pull from a bucket
          </Txt>
          <View className="flex-row flex-wrap gap-2">
            {buckets.slice(0, 4).map((b) => (
              <Chip key={b.id} label={b.title} active={title === b.title} onPress={() => setTitle(b.title)} />
            ))}
          </View>
        </View>

        {/* Category */}
        <View className="mt-6">
          <SectionHeader title="Category" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2 px-5 pt-3">
            {CATEGORIES.map((c) => {
              const active = c.key === cat;
              return (
                <Pressable
                  key={c.key}
                  onPress={() => setCat(c.key)}
                  className="flex-row items-center rounded-full border-2 px-3.5 py-2 active:opacity-80"
                  style={{ borderColor: active ? c.color : C.line, backgroundColor: active ? `${c.color}14` : C.white }}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  accessibilityLabel={c.label}
                >
                  <Txt className="mr-1.5 text-[13px]">{c.emoji}</Txt>
                  <Txt weight="bold" className="text-[13px]" style={{ color: active ? c.color : C.muted }}>
                    {c.label}
                  </Txt>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Pick a venue */}
        <View className="mt-6">
          <SectionHeader title="Pick a venue" />
          <View
            className="mx-5 mt-3 flex-row items-center rounded-2xl border-2 px-4 py-3"
            style={{ borderColor: C.line }}
          >
            <Ionicons name="search" size={16} color={C.faint} />
            <Input
              value={venueQuery}
              onChangeText={setVenueQuery}
              placeholder="Search venue or area"
              className="ml-2 flex-1 text-[14px]"
              style={{ paddingVertical: 0 }}
            />
            {venueQuery.length > 0 && (
              <Pressable onPress={() => setVenueQuery('')} className="active:opacity-60" accessibilityRole="button" accessibilityLabel="Clear venue search">
                <Ionicons name="close-circle" size={16} color={C.faint} />
              </Pressable>
            )}
          </View>
          <View className="mt-3">
            {customSelected && <VenueRow v={venue} active vetted={false} onPress={() => {}} />}
            {venueResults.map((v) => {
              const active = v.name === venue.name && v.area === venue.area;
              return <VenueRow key={v.name} v={v} active={active} vetted onPress={() => setVenue(v)} />;
            })}
            {showCustom && (
              <Pressable
                onPress={() => {
                  setVenue({ name: venueQuery.trim(), area: location });
                  setVenueQuery('');
                }}
                className="mx-5 mb-2.5 flex-row items-center rounded-2xl border-2 border-dashed px-4 py-3.5 active:opacity-90"
                style={{ borderColor: C.line }}
              >
                <Ionicons name="location-outline" size={18} color={C.orange} />
                <Txt weight="semibold" className="ml-2 flex-1 text-[13px] text-brand-ink" numberOfLines={1}>
                  Use “{venueQuery.trim()}” as venue
                </Txt>
              </Pressable>
            )}
          </View>
        </View>

        {/* When */}
        <View className="mt-6">
          <SectionHeader title="When" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2 px-5 pt-3">
            {DATES.map((d, i) => (
              <Chip key={d.full} label={d.label} active={i === dateIdx} onPress={() => setDateIdx(i)} />
            ))}
          </ScrollView>
          <View className="mt-2.5 flex-row flex-wrap gap-2 px-5">
            {TIMES.map((tm) => (
              <Chip key={tm} label={tm} active={tm === time} onPress={() => setTime(tm)} />
            ))}
          </View>
          <Txt weight="medium" className="mt-2 px-5 text-[12px] text-brand-muted">
            {when}
          </Txt>
        </View>

        {/* How many */}
        <View className="mt-6">
          <SectionHeader title="How many" />
          <View
            className="mx-5 mt-3 flex-row items-center justify-between rounded-2xl border-2 px-4 py-3"
            style={{ borderColor: C.line }}
          >
            <Txt weight="semibold" className="text-[14px] text-brand-ink">
              Headcount
            </Txt>
            <View className="flex-row items-center">
              <IconButton
                name="remove"
                diameter={40}
                size={22}
                color={heads <= MIN_HEADS ? C.faint : C.ink}
                accessibilityLabel="Decrease headcount"
                onPress={() => setHeads((c) => Math.max(MIN_HEADS, c - 1))}
              />
              <Txt weight="black" className="mx-5 text-[20px] text-brand-ink" style={{ minWidth: 22, textAlign: 'center' }}>
                {heads}
              </Txt>
              <IconButton
                name="add"
                diameter={40}
                size={22}
                color={heads >= MAX_HEADS ? C.faint : C.ink}
                accessibilityLabel="Increase headcount"
                onPress={() => setHeads((c) => Math.min(MAX_HEADS, c + 1))}
              />
            </View>
          </View>
        </View>

        {/* Split */}
        <View className="mt-6">
          <SectionHeader title="Split" />
          <View className="mt-3 flex-row flex-wrap gap-2 px-5">
            {SPLIT.map((s) => (
              <Chip key={s} label={s} active={s === split} onPress={() => setSplit(s)} />
            ))}
          </View>
          <Txt weight="medium" className="mt-2 px-5 text-[12px] text-brand-muted">
            {"Tara doesn't handle payments — settle at the venue"}
          </Txt>
        </View>

        {/* Who can join */}
        <View className="mt-6">
          <SectionHeader title="Who can join" />
          <View className="mt-3 flex-row flex-wrap gap-2 px-5">
            {JOIN.map((j) => (
              <Chip key={j} label={j} active={j === join} onPress={() => setJoin(j)} />
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Sticky bottom */}
      <View
        className="border-t border-black/5 bg-white px-5 pt-3"
        style={{ paddingBottom: insets.bottom + 10 }}
      >
        <PrimaryButton label="Create plan" icon="arrow-forward" onPress={handleCreate} />
      </View>
    </View>
  );
}
