import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, type Href } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, View, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';

import { CommentsSheet } from '@/components/comments-sheet';
import { Avatar, AvatarStack, IconButton, Screen, SectionHeader, Skeleton } from '@/components/ui/kit';
import { Sheet } from '@/components/ui/sheet';
import { useToast } from '@/components/ui/toast';
import { Txt } from '@/components/ui/txt';
import { catColor, catEmoji, catLabel, type Receipt, type Table } from '@/data/mock';
import { hLight, hSuccess } from '@/lib/haptics';
import { useT } from '@/lib/i18n';
import { C } from '@/lib/tokens';
import { unreadNotifCount, useStore } from '@/store';

// Data-saver stand-in for remote images — solid tint, no network fetch.
function TipidPlaceholder({ color }: { color: string }) {
  return (
    <View style={StyleSheet.absoluteFill} className="items-center justify-center">
      <Txt style={{ fontSize: 22 }}>📷</Txt>
      <Txt weight="semibold" className="mt-0.5 text-[11px]" style={{ color }}>
        Tipid mode — image skipped
      </Txt>
    </View>
  );
}

function TableCard({ t }: { t: Table }) {
  const dataSaver = useStore((s) => s.prefs.dataSaver);
  return (
    <Pressable
      onPress={() => router.push({ pathname: '/table/[id]', params: { id: t.id } })}
      accessibilityRole="button"
      accessibilityLabel={`${t.title} in ${t.area}, ${t.seatsLeft} seat${t.seatsLeft === 1 ? '' : 's'} left`}
      className="w-[210px] overflow-hidden rounded-3xl border border-black/5 active:opacity-90"
    >
      <View className="h-28" style={{ backgroundColor: `${catColor(t.category)}22` }}>
        {dataSaver ? (
          <TipidPlaceholder color={catColor(t.category)} />
        ) : (
          <Image source={{ uri: t.image }} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} />
        )}
        <LinearGradient colors={['transparent', 'rgba(14,23,38,0.85)']} style={StyleSheet.absoluteFill} />
        <View className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1">
          <Txt weight="bold" className="text-[11px]" style={{ color: t.seatsLeft <= 1 ? C.red : C.ink }}>
            {t.seatsLeft} seat{t.seatsLeft === 1 ? '' : 's'} left
          </Txt>
        </View>
        <Txt weight="black" className="absolute bottom-2.5 left-3 text-[15px] text-white">
          {t.emoji} {t.title}
        </Txt>
      </View>
      <View className="bg-white px-3 py-2.5">
        <Txt weight="semibold" className="text-[12px] text-brand-ink">{t.when}</Txt>
        <Txt weight="medium" className="text-[11px] text-brand-muted">
          {t.area} · {t.venueHint}
        </Txt>
      </View>
    </Pressable>
  );
}

function FeedCard({ r, onMenu, onComments }: { r: Receipt; onMenu: (r: Receipt) => void; onComments: (r: Receipt) => void }) {
  const toggleLike = useStore((s) => s.toggleLike);
  const dataSaver = useStore((s) => s.prefs.dataSaver);
  const commentCount = useStore((s) => s.postComments[r.id]?.length ?? 0);
  const color = catColor(r.category);
  const toggle = () => {
    hLight();
    toggleLike(r.id);
  };
  return (
    <View className="mx-5 mb-6">
      <View className="mb-2.5 flex-row items-center">
        <Pressable
          onPress={() => router.push({ pathname: '/profile/[id]', params: { id: r.host.id } })}
          accessibilityRole="button"
          accessibilityLabel={`View ${r.host.name}'s profile`}
          className="flex-1 flex-row items-center active:opacity-70"
        >
          <Avatar uri={r.host.avatar} size={38} />
          <View className="ml-2.5 flex-1">
            <View className="flex-row items-center">
              <Txt weight="bold" className="text-[14px] text-brand-ink">{r.host.name}</Txt>
              {r.host.verified && <Ionicons name="checkmark-circle" size={14} color={C.blue} style={{ marginLeft: 3 }} />}
            </View>
            <Txt weight="medium" className="text-[11px] text-brand-muted">
              {r.when} · {r.venue}
            </Txt>
          </View>
        </Pressable>
        <Pressable
          onPress={() => onMenu(r)}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Post options"
          className="ml-2 p-1 active:opacity-60"
        >
          <Ionicons name="ellipsis-horizontal" size={18} color={C.faint} />
        </Pressable>
      </View>

      <View className="overflow-hidden rounded-3xl border border-black/5">
        <View style={{ aspectRatio: 4 / 3, backgroundColor: `${color}22` }}>
          {dataSaver ? (
            <TipidPlaceholder color={color} />
          ) : (
            <Image source={{ uri: r.image }} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} />
          )}
          <View className="absolute left-3 top-3 flex-row items-center rounded-full px-3 py-1.5" style={{ backgroundColor: color }}>
            <Txt className="mr-1 text-xs">{catEmoji(r.category)}</Txt>
            <Txt weight="bold" className="text-[11px] text-white">{catLabel(r.category)}</Txt>
          </View>
          <View className="absolute bottom-3 left-3 flex-row items-center rounded-full bg-black/45 px-3 py-1.5">
            <Ionicons name="people" size={12} color={C.white} />
            <Txt weight="semibold" className="ml-1 text-[11px] text-white">{r.kada}</Txt>
          </View>
        </View>
      </View>

      <Txt weight="bold" className="mt-3 text-[16px] text-brand-ink">{r.title}</Txt>
      <View className="mt-2.5 flex-row items-center">
        <AvatarStack uris={r.crew.map((c) => c.avatar)} size={24} max={4} />
        <Txt weight="medium" className="ml-2 flex-1 text-[12px] text-brand-muted">{r.crew.length} went together</Txt>
        <Pressable
          onPress={toggle}
          accessibilityRole="button"
          accessibilityLabel={r.liked ? 'Unlike post' : 'Like post'}
          className="flex-row items-center active:opacity-70"
        >
          <Ionicons name={r.liked ? 'heart' : 'heart-outline'} size={20} color={r.liked ? C.red : C.muted} />
          <Txt weight="semibold" className="ml-1 text-[13px]" style={{ color: r.liked ? C.red : C.muted }}>{r.likes}</Txt>
        </Pressable>
        <Pressable
          onPress={() => {
            hLight();
            onComments(r);
          }}
          accessibilityRole="button"
          accessibilityLabel={`View ${commentCount} comment${commentCount === 1 ? '' : 's'}`}
          className="ml-3.5 flex-row items-center active:opacity-70"
        >
          <Ionicons name="chatbubble-outline" size={19} color={C.muted} />
          <Txt weight="semibold" className="ml-1 text-[13px]" style={{ color: C.muted }}>{commentCount}</Txt>
        </Pressable>
        <Pressable
          onPress={() => {
            hLight();
            router.push({ pathname: '/create-bucket', params: { title: r.title, category: r.category } });
          }}
          accessibilityRole="button"
          accessibilityLabel="Tara this — start a bucket"
          className="ml-4 flex-row items-center rounded-full px-3 py-1.5 active:opacity-80"
          style={{ backgroundColor: `${C.orange}14` }}
        >
          <Ionicons name="arrow-forward-circle" size={15} color={C.orange} />
          <Txt weight="bold" className="ml-1 text-[12px]" style={{ color: C.orangeDark }}>Tara this</Txt>
        </Pressable>
      </View>
    </View>
  );
}

type MenuOption = { icon: keyof typeof Ionicons.glyphMap; label: string; danger?: boolean; onPress: () => void };

function PostMenuSheet({ post, onClose }: { post: Receipt; onClose: () => void }) {
  const toast = useToast();
  const toggleSavePost = useStore((s) => s.toggleSavePost);
  const hidePost = useStore((s) => s.hidePost);
  const saved = useStore((s) => s.savedPostIds).includes(post.id);
  const act = (fn: () => void) => () => {
    onClose();
    fn();
  };
  const options: MenuOption[] = [
    { icon: 'share-social-outline', label: 'Share', onPress: act(() => toast('Shared ✓')) },
    {
      icon: saved ? 'bookmark' : 'bookmark-outline',
      label: saved ? 'Saved' : 'Save',
      onPress: act(() => {
        toggleSavePost(post.id);
        toast(saved ? 'Removed from saved' : 'Saved to your list');
      }),
    },
    { icon: 'eye-off-outline', label: 'Not interested', onPress: act(() => { hidePost(post.id); toast("We'll show less like this"); }) },
    { icon: 'flag-outline', label: 'Report post', danger: true, onPress: act(() => router.push('/report')) },
  ];
  return (
    <Sheet visible onClose={onClose}>
      <Txt weight="black" className="mb-1 text-[16px] text-brand-ink" numberOfLines={1}>
        {post.title}
      </Txt>
      {options.map((o) => (
        <Pressable key={o.label} onPress={o.onPress} className="flex-row items-center py-3.5 active:opacity-60">
          <Ionicons name={o.icon} size={20} color={o.danger ? C.red : C.ink} />
          <Txt weight="semibold" className="ml-3 text-[15px]" style={{ color: o.danger ? C.red : C.ink }}>
            {o.label}
          </Txt>
        </Pressable>
      ))}
    </Sheet>
  );
}

// 'Board game night' (hosted by Andrea) — the plan the post-lakad rating card asks about.
const RATE_PLAN_ID = 'd4';
const STARS = [1, 2, 3, 4, 5] as const;

function RateLakadCard() {
  const rating = useStore((s) => s.planRatings[RATE_PLAN_ID] ?? 0);
  const ratePlan = useStore((s) => s.ratePlan);
  const [dismissed, setDismissed] = useState(false);
  if (!rating && dismissed) return null;
  return (
    <View className="mx-5 mt-6 rounded-3xl bg-brand-surface p-4">
      {rating > 0 ? (
        <>
          <Txt weight="black" className="text-[16px] text-brand-ink">Salamat! 🙌</Txt>
          <Txt weight="medium" className="mt-0.5 text-[12.5px] text-brand-muted">
            Andrea&apos;s show-up score just went up ⭐
          </Txt>
          <View className="mt-2.5 flex-row">
            {STARS.map((i) => (
              <Ionicons
                key={i}
                name={i <= rating ? 'star' : 'star-outline'}
                size={22}
                color={C.orange}
                style={{ marginRight: 4 }}
              />
            ))}
          </View>
        </>
      ) : (
        <>
          <View className="flex-row items-start">
            <View className="flex-1">
              <Txt weight="black" className="text-[16px] text-brand-ink">Kumusta ang lakad? 🎲</Txt>
              <Txt weight="medium" className="mt-0.5 text-[12.5px] text-brand-muted">
                How was &apos;Board game night&apos; with Andrea? Rate the lakad
              </Txt>
            </View>
            <Pressable
              onPress={() => setDismissed(true)}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Dismiss rating card"
              className="ml-2 p-1 active:opacity-60"
            >
              <Ionicons name="close" size={18} color={C.faint} />
            </Pressable>
          </View>
          <View className="mt-3 flex-row">
            {STARS.map((i) => (
              <Pressable
                key={i}
                onPress={() => {
                  hSuccess();
                  ratePlan(RATE_PLAN_ID, i);
                }}
                hitSlop={6}
                accessibilityRole="button"
                accessibilityLabel={`Rate ${i} star${i === 1 ? '' : 's'}`}
                className="mr-2 active:opacity-70"
              >
                <Ionicons name="star-outline" size={28} color={C.orange} />
              </Pressable>
            ))}
          </View>
        </>
      )}
    </View>
  );
}

function TableCardSkeleton() {
  return (
    <View className="w-[210px] overflow-hidden rounded-3xl">
      <Skeleton style={{ height: 112, borderRadius: 0 }} />
      <View className="px-3 py-2.5">
        <Skeleton style={{ height: 12, width: 90, borderRadius: 6 }} />
        <Skeleton style={{ height: 10, width: 130, borderRadius: 6, marginTop: 6 }} />
      </View>
    </View>
  );
}

function FeedCardSkeleton() {
  return (
    <View className="mx-5 mb-6">
      <View className="mb-2.5 flex-row items-center">
        <Skeleton style={{ width: 38, height: 38, borderRadius: 999 }} />
        <View className="ml-2.5 flex-1">
          <Skeleton style={{ height: 13, width: 120, borderRadius: 6 }} />
          <Skeleton style={{ height: 10, width: 160, borderRadius: 6, marginTop: 6 }} />
        </View>
      </View>
      <Skeleton style={{ width: '100%', aspectRatio: 4 / 3, borderRadius: 24 }} />
      <Skeleton style={{ height: 16, width: '70%', borderRadius: 6, marginTop: 12 }} />
      <Skeleton style={{ height: 24, width: 100, borderRadius: 12, marginTop: 10 }} />
    </View>
  );
}

const FEED_MAX = 48; // cap the endless scroll so memory stays bounded

export default function FeedScreen() {
  const [menuFor, setMenuFor] = useState<Receipt | null>(null);
  const [commentsFor, setCommentsFor] = useState<Receipt | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const feed = useStore((s) => s.feed);
  const tables = useStore((s) => s.tables);
  const loadMoreFeed = useStore((s) => s.loadMoreFeed);
  const resetFeed = useStore((s) => s.resetFeed);
  const unread = unreadNotifCount(useStore((s) => s.notifs));
  const t = useT();

  const busyRef = useRef(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const track = (timer: ReturnType<typeof setTimeout>) => timers.current.push(timer);
  const atEnd = feed.length >= FEED_MAX;

  useEffect(() => {
    const list = timers.current; // stable array ref; accumulates all tracked timers
    track(setTimeout(() => setLoading(false), 700));
    return () => list.forEach(clearTimeout);
  }, []);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent;
    const nearBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 420;
    if (!nearBottom || busyRef.current || loading || atEnd) return;
    busyRef.current = true;
    setLoadingMore(true);
    track(
      setTimeout(() => {
        loadMoreFeed();
        setLoadingMore(false);
        busyRef.current = false;
      }, 700),
    );
  };

  const onRefresh = () => {
    setRefreshing(true);
    hSuccess();
    track(
      setTimeout(() => {
        resetFeed();
        setRefreshing(false);
      }, 900),
    );
  };

  return (
    <Screen>
      <View className="flex-row items-center justify-between px-5 pb-2 pt-1">
        <View>
          <Txt weight="black" className="text-[26px] text-brand-ink">Feed</Txt>
          <Txt weight="medium" className="text-[12px] text-brand-muted">{t('greeting')}</Txt>
        </View>
        <View className="flex-row gap-2">
          <IconButton name="bookmark-outline" diameter={40} size={20} accessibilityLabel="Your activity" onPress={() => router.push('/my-activity?tab=saved' as Href)} />
          <IconButton name="search" diameter={40} size={20} accessibilityLabel="Search" onPress={() => router.push('/search')} />
          <View>
            <IconButton name="notifications-outline" diameter={40} size={20} accessibilityLabel="Notifications" onPress={() => router.push('/notifications')} />
            {unread > 0 && (
              <View
                pointerEvents="none"
                className="absolute -right-0.5 -top-0.5 min-w-[18px] items-center justify-center rounded-full px-1"
                style={{ height: 18, backgroundColor: C.orange, borderWidth: 2, borderColor: C.white }}
              >
                <Txt weight="bold" className="text-[10px] text-white">{unread}</Txt>
              </View>
            )}
          </View>
        </View>
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-6"
        onScroll={onScroll}
        scrollEventThrottle={200}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.orange} colors={[C.orange]} />
        }
      >
        <SectionHeader
          title="Tara Tables this week"
          action={loading ? undefined : 'See all'}
          onAction={() => router.push('/tara-tables')}
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-3 px-5 pb-2 pt-3">
          {loading
            ? [0, 1, 2].map((i) => <TableCardSkeleton key={i} />)
            : tables.map((t) => <TableCard key={t.id} t={t} />)}
        </ScrollView>

        {!loading && <RateLakadCard />}

        <View className="mt-6">
          <SectionHeader title="Fresh receipts" />
        </View>
        <View className="mt-3" />
        {loading
          ? [0, 1].map((i) => <FeedCardSkeleton key={i} />)
          : feed.map((r) => <FeedCard key={r.id} r={r} onMenu={setMenuFor} onComments={setCommentsFor} />)}

        {!loading && loadingMore && (
          <View className="items-center py-5">
            <ActivityIndicator color={C.orange} />
            <Txt weight="semibold" className="mt-2 text-[12px] text-brand-muted">Loading more…</Txt>
          </View>
        )}
        {!loading && atEnd && (
          <View className="items-center py-6">
            <Txt style={{ fontSize: 24 }}>🎉</Txt>
            <Txt weight="bold" className="mt-1 text-[14px] text-brand-ink">You&apos;re all caught up</Txt>
            <Txt weight="medium" className="mt-0.5 text-[12px] text-brand-muted">Pull down to refresh</Txt>
          </View>
        )}
      </ScrollView>
      {menuFor && <PostMenuSheet post={menuFor} onClose={() => setMenuFor(null)} />}
      {commentsFor && (
        <CommentsSheet postId={commentsFor.id} title={commentsFor.title} onClose={() => setCommentsFor(null)} />
      )}
    </Screen>
  );
}
