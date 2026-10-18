import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Chip, IconButton, Screen } from '@/components/ui/kit';
import { Txt } from '@/components/ui/txt';
import { catColor, catEmoji, catLabel, type Table } from '@/data/mock';
import { C } from '@/lib/tokens';
import { useStore } from '@/store';

type TableFilter = 'all' | 'week' | 'nearby' | 'budget';

const FILTERS: { key: TableFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'week', label: 'This week' },
  { key: 'nearby', label: 'Nearby' },
  { key: 'budget', label: '₱ Budget' },
];

// ponytail: approximate demo mappings — mock tables carry no real dates/geo/prices
const NEARBY_AREAS = ['Makati', 'Poblacion', 'Salcedo', 'Legazpi', 'BGC'];
const BUDGET_SUBS = ['Street Food', 'Local Specialties', 'Entertainment'];

const matchesFilter = (t: Table, f: TableFilter): boolean =>
  f === 'all' ||
  (f === 'week' && /^(Fri|Sat|Sun)/.test(t.when)) ||
  (f === 'nearby' && NEARBY_AREAS.includes(t.area)) ||
  (f === 'budget' && BUDGET_SUBS.includes(t.sub ?? ''));

function TableCard({ t }: { t: Table }) {
  const color = catColor(t.category);
  return (
    <Pressable
      onPress={() => router.push({ pathname: '/table/[id]', params: { id: t.id } })}
      className="mb-4 overflow-hidden rounded-3xl border border-black/5 active:opacity-90"
    >
      <View className="h-[150px]">
        <Image source={{ uri: t.image }} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} />
        <LinearGradient
          colors={['rgba(14,23,38,0.15)', 'transparent', 'rgba(14,23,38,0.9)']}
          locations={[0, 0.4, 1]}
          style={StyleSheet.absoluteFill}
        />

        <View className="flex-row items-center justify-between px-4 pt-4">
          <View className="flex-row items-center rounded-full px-3 py-1.5" style={{ backgroundColor: color }}>
            <Txt className="mr-1 text-xs">{catEmoji(t.category)}</Txt>
            <Txt weight="bold" className="text-[11px] text-white">
              {catLabel(t.category)}
            </Txt>
          </View>
          <View className="rounded-full bg-white/90 px-2.5 py-1">
            <Txt weight="bold" className="text-[11px]" style={{ color: t.seatsLeft <= 1 ? C.red : C.ink }}>
              {t.seatsLeft} seat{t.seatsLeft === 1 ? '' : 's'} left
            </Txt>
          </View>
        </View>

        <View className="absolute inset-x-0 bottom-0 px-4 pb-3.5">
          <Txt weight="black" className="text-[18px] text-white">
            {t.emoji} {t.title}
          </Txt>
          <View className="mt-1 flex-row items-center">
            <Ionicons name="time-outline" size={13} color="rgba(255,255,255,0.85)" />
            <Txt weight="medium" className="ml-1 text-[12px] text-white/85">
              {t.when} · {t.area}
            </Txt>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

export default function TaraTablesScreen() {
  const tables = useStore((s) => s.tables);
  const [filter, setFilter] = useState<TableFilter>('all');
  const filtered = useMemo(() => tables.filter((t) => matchesFilter(t, filter)), [tables, filter]);

  // Payday-aware copy: PH sweldo lands on the 15th & 30th.
  const day = new Date().getDate();
  const isSweldo = (day >= 13 && day <= 16) || (day >= 28 && day <= 31);

  return (
    <Screen>
      <View className="flex-row items-center px-4 pb-1 pt-1">
        <IconButton name="chevron-back" diameter={40} size={22} accessibilityLabel="Go back" onPress={() => router.back()} />
        <Txt weight="black" className="ml-2 text-[20px] text-brand-ink">
          Tara Tables
        </Txt>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-5 pb-8 pt-1">
        <Txt weight="medium" className="text-[13px] text-brand-muted" style={{ lineHeight: 19 }}>
          Curated dinners — verified strangers who bucketed the same thing.
        </Txt>

        <View
          className="mb-3 mt-4 flex-row items-center rounded-3xl border p-4"
          style={{ backgroundColor: `${C.green}0D`, borderColor: `${C.green}26` }}
        >
          <View className="h-9 w-9 items-center justify-center rounded-full" style={{ backgroundColor: `${C.green}1A` }}>
            <Ionicons name="shield-checkmark" size={18} color={C.green} />
          </View>
          <Txt weight="medium" className="ml-3 flex-1 text-[13px] text-brand-muted" style={{ lineHeight: 19 }}>
            You&apos;re verified — you can join any table.
          </Txt>
        </View>

        {/* Payday-aware banner */}
        <View
          className="mb-3 flex-row items-center rounded-3xl border p-4"
          style={{ backgroundColor: `${C.orange}0D`, borderColor: `${C.orange}26` }}
        >
          <View className="h-9 w-9 items-center justify-center rounded-full" style={{ backgroundColor: `${C.orange}1A` }}>
            <Txt className="text-[16px]">{isSweldo ? '🎉' : '🪙'}</Txt>
          </View>
          <Txt weight="medium" className="ml-3 flex-1 text-[13px] text-brand-muted" style={{ lineHeight: 19 }}>
            {isSweldo ? 'Sweldo weekend picks 🎉' : 'Petsa de peligro? Check the budget-friendly tables'}
          </Txt>
        </View>

        {/* Filters */}
        <View className="mb-4 flex-row gap-2">
          {FILTERS.map((f) => (
            <Chip key={f.key} label={f.label} active={filter === f.key} onPress={() => setFilter(f.key)} />
          ))}
        </View>

        {filtered.map((t) => (
          <TableCard key={t.id} t={t} />
        ))}

        {filtered.length === 0 && (
          <View className="items-center pt-14">
            <Txt style={{ fontSize: 40 }}>🍽️</Txt>
            <Txt weight="bold" className="mt-3 text-[15px] text-brand-ink">
              No tables match
            </Txt>
            <Txt weight="medium" className="mt-1 text-center text-[13px] text-brand-muted">
              Balik ka sa sweldo week 😉
            </Txt>
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}
