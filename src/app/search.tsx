import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { Avatar, CategoryTag, Chip, IconButton, Input, Screen, SectionHeader, TrustBadge } from '@/components/ui/kit';
import { Txt } from '@/components/ui/txt';
import { CATEGORIES, catColor, catEmoji, catLabel, PEOPLE } from '@/data/mock';
import { C } from '@/lib/tokens';
import { useStore } from '@/store';

const TYPES = ['All', 'Plans', 'Buckets', 'Kadas', 'People'] as const;
type SearchType = (typeof TYPES)[number];

export default function SearchScreen() {
  // ?q= seeds the query (category sub-chips), ?type=people preselects the People filter (messages compose).
  const { q: qParam, type: typeParam } = useLocalSearchParams<{ q?: string; type?: string }>();
  const [query, setQuery] = useState(qParam ?? '');
  const [type, setType] = useState<SearchType>(typeParam === 'people' ? 'People' : 'All');
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const discovery = useStore((s) => s.discovery);
  const buckets = useStore((s) => s.buckets);
  const kadas = useStore((s) => s.kadas);

  // Typing (or clearing) is free-text search again — drop the chip selection.
  const typeQuery = (text: string) => {
    setQuery(text);
    setSelectedCat(null);
  };

  const q = query.trim().toLowerCase();
  const plans = useMemo(
    () => (q ? discovery.filter((d) => `${d.title} ${d.venue} ${d.area} ${catLabel(d.category)}`.toLowerCase().includes(q)) : discovery),
    [q, discovery],
  );
  const people = useMemo(() => (q ? PEOPLE.filter((p) => `${p.name} ${p.handle}`.toLowerCase().includes(q)) : PEOPLE), [q]);
  const bucks = useMemo(() => (q ? buckets.filter((b) => b.title.toLowerCase().includes(q)) : buckets.slice(0, 3)), [q, buckets]);
  const kads = useMemo(() => (q ? kadas.filter((k) => k.name.toLowerCase().includes(q)) : kadas.slice(0, 3)), [q, kadas]);

  const show = (t: Exclude<SearchType, 'All'>) => type === 'All' || type === t;
  const visPlans = show('Plans') ? plans : [];
  const visBucks = show('Buckets') ? bucks : [];
  const visKads = show('Kadas') ? kads : [];
  const visPeople = show('People') ? people : [];
  const nothing =
    q.length > 0 && visPlans.length === 0 && visPeople.length === 0 && visBucks.length === 0 && visKads.length === 0;

  return (
    <Screen>
      <View className="flex-row items-center gap-2 px-4 pb-2 pt-1">
        <IconButton name="chevron-back" diameter={40} size={22} accessibilityLabel="Go back" onPress={() => router.back()} />
        <View className="flex-1 flex-row items-center rounded-full border border-black/5 bg-brand-surface px-4 py-2.5">
          <Ionicons name="search" size={18} color={C.faint} />
          <Input
            value={query}
            onChangeText={typeQuery}
            placeholder="Search plans, people, places"
            autoFocus
            returnKeyType="search"
            className="ml-2 flex-1 text-[14px]"
            style={{ paddingVertical: 0 }}
          />
          {query.length > 0 && (
            <Pressable onPress={() => typeQuery('')} className="active:opacity-60" accessibilityRole="button" accessibilityLabel="Clear search">
              <Ionicons name="close-circle" size={18} color={C.faint} />
            </Pressable>
          )}
        </View>
      </View>

      <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerClassName="pb-8">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2 px-5 pt-3">
          {TYPES.map((t) => (
            <Chip key={t} label={t} active={type === t} onPress={() => setType(t)} />
          ))}
        </ScrollView>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2 px-5 py-3">
          {CATEGORIES.map((c) => (
            <Chip
              key={c.key}
              label={`${c.label} · ${c.tagalog}`}
              active={selectedCat === c.key}
              onPress={() => {
                setSelectedCat(c.key);
                setQuery(c.label);
              }}
            />
          ))}
        </ScrollView>

        {nothing ? (
          <View className="items-center px-10 pt-20">
            <View className="h-20 w-20 items-center justify-center rounded-full bg-brand-surface">
              <Ionicons name="search" size={30} color={C.faint} />
            </View>
            <Txt weight="bold" className="mt-4 text-[16px] text-brand-ink">
              No results for “{query.trim()}”
            </Txt>
            <Txt weight="medium" className="mt-1 text-center text-[13px] text-brand-muted">
              Try a place, a name, or a category.
            </Txt>
          </View>
        ) : (
          <>
            {visPlans.length > 0 && (
              <>
                <View className="mt-2">
                  <SectionHeader title="Plans" />
                </View>
                <View className="mt-2 px-5">
                  {visPlans.map((d) => (
                    <Pressable
                      key={d.id}
                      onPress={() => router.push({ pathname: '/plan/[id]', params: { id: d.id } })}
                      accessibilityRole="button"
                      accessibilityLabel={`${d.title}, plan`}
                      className="flex-row items-center py-2.5 active:opacity-70"
                    >
                      <View className="h-14 w-14 overflow-hidden rounded-2xl border border-black/5">
                        <Image source={{ uri: d.image }} style={{ width: 56, height: 56 }} contentFit="cover" transition={200} />
                      </View>
                      <View className="ml-3 flex-1">
                        <Txt weight="bold" className="text-[14px] text-brand-ink" numberOfLines={1}>
                          {d.title}
                        </Txt>
                        <View className="mt-0.5 flex-row items-center">
                          <Ionicons name="location-outline" size={12} color={C.faint} />
                          <Txt weight="medium" className="ml-1 flex-1 text-[12px] text-brand-muted" numberOfLines={1}>
                            {d.venue} · {d.area}
                          </Txt>
                        </View>
                      </View>
                      <View className="ml-2">
                        <CategoryTag label={catLabel(d.category)} emoji={catEmoji(d.category)} color={catColor(d.category)} />
                      </View>
                    </Pressable>
                  ))}
                </View>
              </>
            )}

            {visBucks.length > 0 && (
              <>
                <View className="mt-5">
                  <SectionHeader title="Buckets" />
                </View>
                <View className="mt-2 px-5">
                  {visBucks.map((b) => (
                    <Pressable
                      key={b.id}
                      onPress={() => router.push({ pathname: '/bucket/[id]', params: { id: b.id } })}
                      accessibilityRole="button"
                      accessibilityLabel={`${b.title}, bucket`}
                      className="flex-row items-center py-2.5 active:opacity-70"
                    >
                      <View className="h-12 w-12 items-center justify-center rounded-2xl" style={{ backgroundColor: `${catColor(b.category)}1A` }}>
                        <Txt style={{ fontSize: 22 }}>{catEmoji(b.category)}</Txt>
                      </View>
                      <Txt weight="bold" className="ml-3 flex-1 text-[14px] text-brand-ink" numberOfLines={1}>
                        {b.title}
                      </Txt>
                      <Ionicons name="chevron-forward" size={16} color={C.faint} />
                    </Pressable>
                  ))}
                </View>
              </>
            )}

            {visKads.length > 0 && (
              <>
                <View className="mt-5">
                  <SectionHeader title="Kadas" />
                </View>
                <View className="mt-2 px-5">
                  {visKads.map((k) => (
                    <Pressable
                      key={k.id}
                      onPress={() => router.push({ pathname: '/kada/[id]', params: { id: k.id } })}
                      accessibilityRole="button"
                      accessibilityLabel={`${k.name}, kada`}
                      className="flex-row items-center py-2.5 active:opacity-70"
                    >
                      <View className="h-12 w-12 items-center justify-center rounded-2xl" style={{ backgroundColor: `${k.color}1A` }}>
                        <Txt style={{ fontSize: 22 }}>{k.emoji}</Txt>
                      </View>
                      <View className="ml-3 flex-1">
                        <Txt weight="bold" className="text-[14px] text-brand-ink" numberOfLines={1}>
                          {k.name}
                        </Txt>
                        <Txt weight="medium" className="mt-0.5 text-[12px] text-brand-muted">
                          {k.members.length} members
                        </Txt>
                      </View>
                      <Ionicons name="chevron-forward" size={16} color={C.faint} />
                    </Pressable>
                  ))}
                </View>
              </>
            )}

            {visPeople.length > 0 && (
              <>
                <View className="mt-5">
                  <SectionHeader title="People" />
                </View>
                <View className="mt-2 px-5">
                  {visPeople.map((p) => (
                    <Pressable
                      key={p.id}
                      onPress={() => router.push({ pathname: '/profile/[id]', params: { id: p.id } })}
                      accessibilityRole="button"
                      accessibilityLabel={`${p.name}, profile`}
                      className="flex-row items-center py-2.5 active:opacity-70"
                    >
                      <Avatar uri={p.avatar} />
                      <View className="ml-3 flex-1">
                        <View className="flex-row items-center">
                          <Txt weight="bold" className="text-[14px] text-brand-ink">
                            {p.name}
                          </Txt>
                          {p.verified && <Ionicons name="checkmark-circle" size={14} color={C.blue} style={{ marginLeft: 3 }} />}
                        </View>
                        <Txt weight="medium" className="mt-0.5 text-[12px] text-brand-muted">
                          @{p.handle}
                        </Txt>
                      </View>
                      <TrustBadge score={p.trust} />
                    </Pressable>
                  ))}
                </View>
              </>
            )}
          </>
        )}
      </ScrollView>
    </Screen>
  );
}
