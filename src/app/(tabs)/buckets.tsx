import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useMemo, useState, type ComponentProps } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { Chip, IconButton, Screen, Skeleton } from '@/components/ui/kit';
import { Txt } from '@/components/ui/txt';
import { type Bucket, catColor, catEmoji } from '@/data/mock';
import { hLight } from '@/lib/haptics';
import { C } from '@/lib/tokens';
import { bucketProgress, useStore } from '@/store';

type IoniconName = ComponentProps<typeof Ionicons>['name'];
type Tab = 'Active' | 'Saved' | 'Done';

const TABS: Tab[] = ['Active', 'Saved', 'Done'];

const EMPTY: Record<Tab, { icon: IoniconName; title: string; subtitle: string }> = {
  Active: { icon: 'sparkles-outline', title: 'No active wants', subtitle: 'Bucket a new want to get started' },
  Saved: { icon: 'bookmark-outline', title: 'Nothing saved yet', subtitle: 'Bookmark buckets to find them here' },
  Done: { icon: 'checkmark-done-outline', title: 'No fulfilled buckets yet', subtitle: 'Buckets you complete show up here' },
};

function BucketRow({ b }: { b: Bucket }) {
  const color = catColor(b.category);
  const privacyIcon = b.privacy === 'private' ? 'lock-closed' : b.privacy === 'kada' ? 'people' : 'globe';
  const progress = bucketProgress(b);
  return (
    <Pressable
      onPress={() => router.push({ pathname: '/bucket/[id]', params: { id: b.id } })}
      accessibilityRole="button"
      accessibilityLabel={`${b.title}${b.done ? ', fulfilled' : ''}`}
      className="mx-5 mb-3 flex-row items-center rounded-3xl border border-black/5 bg-white p-3 active:opacity-90"
    >
      <View className="h-14 w-14 items-center justify-center rounded-2xl" style={{ backgroundColor: `${color}1A` }}>
        <Txt style={{ fontSize: 26 }}>{catEmoji(b.category)}</Txt>
      </View>
      <View className="ml-3 flex-1">
        <Txt weight="bold" className="text-[14px] text-brand-ink" numberOfLines={2}>
          {b.title}
        </Txt>
        <View className="mt-1.5 flex-row items-center gap-2">
          <View className="flex-row items-center rounded-full bg-brand-surface px-2 py-1">
            <Ionicons name={privacyIcon} size={10} color={C.muted} />
            <Txt weight="semibold" className="ml-1 text-[10px] text-brand-muted">{b.privacy}</Txt>
          </View>
          {progress && (
            <Txt weight="semibold" className="text-[11px]" style={{ color }}>
              {progress.done}/{progress.total}
            </Txt>
          )}
          {b.interested > 0 && (
            <Txt weight="semibold" className="text-[11px]" style={{ color: C.orange }}>
              🪣 {b.interested} in
            </Txt>
          )}
          {b.done && (
            <Txt weight="semibold" className="text-[11px]" style={{ color: C.green }}>
              ✓ fulfilled
            </Txt>
          )}
          {b.done && b.photos && b.photos.length > 0 && (
            <Txt weight="semibold" className="text-[11px] text-brand-muted">
              📸 {b.photos.length}
            </Txt>
          )}
        </View>
        {progress && (
          <View className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-brand-surface">
            <View
              className="h-1 rounded-full"
              style={{ width: `${(progress.done / progress.total) * 100}%`, backgroundColor: color }}
            />
          </View>
        )}
      </View>
      <Ionicons name="chevron-forward" size={18} color={C.faint} />
    </Pressable>
  );
}

function BucketRowSkeleton() {
  return (
    <View className="mx-5 mb-3 flex-row items-center rounded-3xl border border-black/5 bg-white p-3">
      <Skeleton style={{ width: 56, height: 56, borderRadius: 16 }} />
      <View className="ml-3 flex-1">
        <Skeleton style={{ width: '80%', height: 14, borderRadius: 7 }} />
        <Skeleton style={{ width: '45%', height: 20, borderRadius: 10, marginTop: 8 }} />
      </View>
    </View>
  );
}

function EmptyState({ icon, title, subtitle }: { icon: IoniconName; title: string; subtitle: string }) {
  return (
    <View className="items-center px-10 pt-24">
      <View className="h-20 w-20 items-center justify-center rounded-full bg-brand-surface">
        <Ionicons name={icon} size={32} color={C.faint} />
      </View>
      <Txt weight="bold" className="mt-4 text-[16px] text-brand-ink">{title}</Txt>
      <Txt weight="medium" className="mt-1 text-center text-[13px] text-brand-muted">{subtitle}</Txt>
    </View>
  );
}

export default function BucketsScreen() {
  const [tab, setTab] = useState<Tab>('Active');
  const [loading, setLoading] = useState(true);
  const buckets = useStore((s) => s.buckets);
  const savedBucketIds = useStore((s) => s.savedBucketIds);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(t);
  }, []);

  const activeCount = useMemo(() => buckets.filter((b) => !b.done).length, [buckets]);
  const doneCount = useMemo(() => buckets.filter((b) => b.done).length, [buckets]);
  const list: Bucket[] = useMemo(() => {
    if (tab === 'Saved') return buckets.filter((b) => savedBucketIds.includes(b.id));
    return buckets.filter((b) => (tab === 'Done' ? b.done : !b.done));
  }, [tab, buckets, savedBucketIds]);

  const newBucket = () => {
    hLight();
    router.push('/create-bucket');
  };

  return (
    <Screen>
      <View className="flex-row items-center justify-between px-5 pb-2 pt-1">
        <View>
          <Txt weight="black" className="text-[26px] text-brand-ink">My Buckets</Txt>
          <Txt weight="medium" className="mt-0.5 text-[12px] text-brand-muted">{activeCount} wants · {doneCount} fulfilled</Txt>
        </View>
        <View className="flex-row items-center gap-2">
          <IconButton name="grid-outline" diameter={44} size={22} accessibilityLabel="Browse categories" onPress={() => router.push('/categories')} />
          <IconButton name="add" diameter={44} size={24} color={C.white} bg={C.orange} accessibilityLabel="New bucket" onPress={newBucket} />
        </View>
      </View>

      <View className="flex-row gap-2 px-5 py-3">
        {TABS.map((t) => (
          <Chip key={t} label={t} active={tab === t} onPress={() => { hLight(); setTab(t); }} />
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="pb-6 pt-1">
        {loading ? (
          [0, 1, 2, 3].map((i) => <BucketRowSkeleton key={i} />)
        ) : (
          <>
            {list.length === 0 ? (
              <EmptyState {...EMPTY[tab]} />
            ) : (
              list.map((b) => <BucketRow key={b.id} b={b} />)
            )}
            <Pressable
              onPress={newBucket}
              accessibilityRole="button"
              accessibilityLabel="Bucket a new want"
              className="mx-5 mt-2 flex-row items-center justify-center rounded-3xl border-2 border-dashed py-5 active:opacity-70"
              style={{ borderColor: C.line }}
            >
              <Ionicons name="add-circle-outline" size={20} color={C.orange} />
              <Txt weight="bold" className="ml-2 text-[14px]" style={{ color: C.orange }}>
                Bucket a new want
              </Txt>
            </Pressable>
          </>
        )}
      </ScrollView>
    </Screen>
  );
}
