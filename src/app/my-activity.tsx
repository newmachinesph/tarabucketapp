import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { IconChip, ScreenHeader } from '@/components/ui/kit';
import { useToast } from '@/components/ui/toast';
import { Txt } from '@/components/ui/txt';
import { catEmoji } from '@/data/mock';
import { C } from '@/lib/tokens';
import { useStore } from '@/store';

type Tab = 'plans' | 'saved' | 'tables';
const TABS: { key: Tab; label: string }[] = [
  { key: 'plans', label: 'Joined plans' },
  { key: 'saved', label: 'Saved' },
  { key: 'tables', label: 'Tables' },
];

function Empty({ icon, title, sub }: { icon: React.ComponentProps<typeof Ionicons>['name']; title: string; sub: string }) {
  return (
    <View className="mt-24 items-center px-10">
      <View className="h-16 w-16 items-center justify-center rounded-full bg-brand-surface">
        <Ionicons name={icon} size={30} color={C.faint} />
      </View>
      <Txt weight="black" className="mt-4 text-center text-[16px] text-brand-ink">{title}</Txt>
      <Txt weight="medium" className="mt-1 text-center text-[13px] text-brand-muted">{sub}</Txt>
    </View>
  );
}

// Shared thumbnail row for a plan / receipt / table.
function ActivityRow({
  image,
  category,
  title,
  meta,
  onPress,
  right,
}: {
  image: string;
  category: string;
  title: string;
  meta: string;
  onPress?: () => void;
  right?: React.ReactNode;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
      className="mb-3 flex-row items-center rounded-3xl border p-2.5 active:opacity-80"
      style={{ borderColor: C.line }}
    >
      <Image source={{ uri: image }} style={{ width: 60, height: 60, borderRadius: 16, backgroundColor: C.surface }} />
      <View className="ml-3 flex-1">
        <View className="flex-row items-center">
          <Txt className="text-[11px]">{catEmoji(category)}</Txt>
          <Txt weight="bold" className="ml-1.5 flex-1 text-[14px] text-brand-ink" numberOfLines={1}>
            {title}
          </Txt>
        </View>
        <Txt weight="medium" className="mt-0.5 text-[12px] text-brand-muted" numberOfLines={1}>
          {meta}
        </Txt>
      </View>
      {right ?? <Ionicons name="chevron-forward" size={16} color={C.faint} />}
    </Pressable>
  );
}

export default function MyActivityScreen() {
  const toast = useToast();
  const { tab: initialTab } = useLocalSearchParams<{ tab?: Tab }>();
  const [tab, setTab] = useState<Tab>(initialTab ?? 'plans');

  const discovery = useStore((s) => s.discovery);
  const feed = useStore((s) => s.feed);
  const tables = useStore((s) => s.tables);
  const joinedIds = useStore((s) => s.joinedIds);
  const savedPostIds = useStore((s) => s.savedPostIds);
  const reservedTableIds = useStore((s) => s.reservedTableIds);
  const leavePlan = useStore((s) => s.leavePlan);
  const cancelSeat = useStore((s) => s.cancelSeat);

  const joinedPlans = discovery.filter((d) => joinedIds.includes(d.id));
  const savedPosts = feed.filter((r) => savedPostIds.includes(r.id));
  const reservedTables = tables.filter((t) => reservedTableIds.includes(t.id));

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />
      <ScreenHeader title="Your activity" />

      <View className="mx-5 mb-1 mt-1 flex-row rounded-full bg-brand-surface p-1">
        {TABS.map((t) => {
          const active = t.key === tab;
          return (
            <Pressable
              key={t.key}
              onPress={() => setTab(t.key)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              className="flex-1 items-center rounded-full py-2"
              style={{ backgroundColor: active ? C.white : 'transparent' }}
            >
              <Txt weight="bold" className="text-[12.5px]" style={{ color: active ? C.ink : C.muted }}>
                {t.label}
              </Txt>
            </Pressable>
          );
        })}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-5 pb-10 pt-3">
        {tab === 'plans' &&
          (joinedPlans.length === 0 ? (
            <Empty icon="hand-left-outline" title="No plans yet" sub="Tara a plan from the deck and it lands here." />
          ) : (
            joinedPlans.map((d) => (
              <ActivityRow
                key={d.id}
                image={d.image}
                category={d.category}
                title={d.title}
                meta={`${d.when} · ${d.area}`}
                onPress={() => router.push({ pathname: '/plan/[id]', params: { id: d.id } })}
                right={
                  <Pressable
                    onPress={() => {
                      leavePlan(d.id);
                      toast('Left the plan');
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={`Leave ${d.title}`}
                    className="rounded-full px-3 py-1.5 active:opacity-70"
                    style={{ backgroundColor: C.surface }}
                  >
                    <Txt weight="bold" className="text-[12px]" style={{ color: C.muted }}>Leave</Txt>
                  </Pressable>
                }
              />
            ))
          ))}

        {tab === 'saved' &&
          (savedPosts.length === 0 ? (
            <Empty icon="bookmark-outline" title="Nothing saved" sub="Bookmark a receipt from the feed to keep it here." />
          ) : (
            savedPosts.map((r) => (
              <ActivityRow
                key={r.id}
                image={r.image}
                category={r.category}
                title={r.title}
                meta={`${r.host.name.split(' ')[0]} · ${r.venue}`}
                right={
                  <IconChip name="bookmark" color={C.orange} diameter={32} size={15} />
                }
              />
            ))
          ))}

        {tab === 'tables' &&
          (reservedTables.length === 0 ? (
            <Empty icon="restaurant-outline" title="No reservations" sub="Reserve a Tara Table and your seat shows up here." />
          ) : (
            reservedTables.map((t) => (
              <ActivityRow
                key={t.id}
                image={t.image}
                category={t.category}
                title={t.title}
                meta={`${t.when} · ${t.area}`}
                onPress={() => router.push({ pathname: '/table/[id]', params: { id: t.id } })}
                right={
                  <Pressable
                    onPress={() => {
                      cancelSeat(t.id);
                      toast('Reservation cancelled');
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={`Cancel ${t.title}`}
                    className="rounded-full px-3 py-1.5 active:opacity-70"
                    style={{ backgroundColor: C.surface }}
                  >
                    <Txt weight="bold" className="text-[12px]" style={{ color: C.red }}>Cancel</Txt>
                  </Pressable>
                }
              />
            ))
          ))}
      </ScrollView>
    </View>
  );
}
