import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { FilterSheet } from '@/components/filter-sheet';
import { LocationSheet } from '@/components/location-sheet';
import { SwipeDeck } from '@/components/swipe-deck';
import { Avatar, IconButton, PrimaryButton, Screen } from '@/components/ui/kit';
import { useToast } from '@/components/ui/toast';
import { Txt } from '@/components/ui/txt';
import { budgetOf, budgetShort, catColor, catEmoji, catLabel, type Discovery, ME } from '@/data/mock';
import { C } from '@/lib/tokens';
import { unreadNotifCount, useStore } from '@/store';

function DiscoveryCard({ item }: { item: Discovery }) {
  const color = catColor(item.category);
  return (
    <View className="flex-1" style={{ backgroundColor: `${color}26` }}>
      <Image source={{ uri: item.image }} style={StyleSheet.absoluteFill} contentFit="cover" transition={250} />
      <LinearGradient
        colors={['rgba(14,23,38,0.25)', 'transparent', 'rgba(14,23,38,0.35)', 'rgba(14,23,38,0.95)']}
        locations={[0, 0.3, 0.6, 1]}
        style={StyleSheet.absoluteFill}
      />

      <View className="flex-row items-center justify-between px-4 pt-4">
        <View className="flex-row items-center rounded-full px-3 py-1.5" style={{ backgroundColor: color }}>
          <Txt className="mr-1 text-xs">{catEmoji(item.category)}</Txt>
          <Txt weight="bold" className="text-[11px] text-white">
            {catLabel(item.category)}
            {item.sub ? ` · ${item.sub}` : ''}
          </Txt>
        </View>
        <View className="flex-row items-center">
          <View className="mr-2 flex-row items-center rounded-full bg-black/40 px-2.5 py-1.5">
            <Txt weight="bold" className="text-[11px] text-white">
              {budgetShort(budgetOf(item))}
            </Txt>
          </View>
          {item.genderPref && item.genderPref !== 'all' && (
            <View className="mr-2 flex-row items-center rounded-full bg-black/40 px-2.5 py-1.5">
              <Ionicons name={item.genderPref === 'women' ? 'female' : 'male'} size={12} color={C.white} />
              <Txt weight="bold" className="ml-1 text-[11px] text-white">
                {item.genderPref === 'women' ? 'Women only' : 'Men only'}
              </Txt>
            </View>
          )}
          <View className="flex-row items-center rounded-full bg-black/35 px-3 py-1.5">
            <Ionicons name="location" size={12} color={C.white} />
            <Txt weight="semibold" className="ml-1 text-[11px] text-white">
              {item.distanceKm < 3 ? `${item.distanceKm} km` : `${Math.round(item.distanceKm)} km`}
            </Txt>
          </View>
        </View>
      </View>

      <View className="grow" />

      <View className="px-5 pb-6">
        <View className="mb-3 flex-row items-center">
          <Avatar uri={item.host.avatar} size={38} ring={C.white} />
          <View className="ml-2.5 flex-1">
            <View className="flex-row items-center">
              <Txt weight="bold" className="text-[15px] text-white">
                {item.host.name.split(' ')[0]}, {item.host.age}
              </Txt>
              {item.host.verified && <Ionicons name="checkmark-circle" size={15} color={C.blue} style={{ marginLeft: 4 }} />}
            </View>
            <View className="flex-row items-center">
              <Ionicons name="shield-checkmark" size={11} color={C.green} />
              <Txt weight="semibold" className="ml-1 text-[11px] text-white/80">
                {item.host.trust} show-up
              </Txt>
            </View>
          </View>
          <View className="rounded-full bg-white/20 px-3 py-1">
            <Txt weight="bold" className="text-[12px] text-white">
              {item.going}/{item.spots} going
            </Txt>
          </View>
        </View>

        <Txt weight="black" className="text-white" style={{ fontSize: 26, lineHeight: 30 }}>
          {item.title}
        </Txt>
        <View className="mt-2 flex-row items-center">
          <Ionicons name="location-outline" size={14} color="rgba(255,255,255,0.85)" />
          <Txt weight="medium" className="ml-1 text-[13px] text-white/85">
            {item.venue} · {item.area}
          </Txt>
        </View>
        <View className="mt-1 flex-row items-center">
          <Ionicons name="time-outline" size={14} color="rgba(255,255,255,0.85)" />
          <Txt weight="medium" className="ml-1 text-[13px] text-white/85">
            {item.when}
          </Txt>
        </View>

        <Txt weight="regular" className="mt-3 text-[13px] text-white/80" numberOfLines={2}>
          {item.blurb}
        </Txt>

        <View className="mt-3 flex-row flex-wrap gap-2">
          {item.tags.map((tag) => (
            <View key={tag} className="rounded-full bg-white/15 px-3 py-1">
              <Txt weight="semibold" className="text-[11px] text-white">
                #{tag}
              </Txt>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

function PaywallOverlay({ onClose }: { onClose: () => void }) {
  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(14,23,38,0.97)' }]} className="items-center justify-center px-8">
      <View className="h-16 w-16 items-center justify-center rounded-2xl" style={{ backgroundColor: `${C.orange}2A` }}>
        <Ionicons name="star" size={32} color={C.orange} />
      </View>
      <Txt weight="black" className="mt-4 text-center text-white" style={{ fontSize: 24 }}>
        Out of free Taras
      </Txt>
      <Txt weight="medium" className="mt-2 text-center text-[14px] text-white/75">
        You&apos;ve used your 2 free stranger Taras this month. Go Premium for unlimited — or keep meeting friends &amp; kada for free.
      </Txt>
      <View className="mt-7 w-full">
        <PrimaryButton
          label="Go Premium · ₱149/mo"
          icon="star"
          onPress={() => {
            onClose();
            router.push({ pathname: '/premium', params: { reason: 'strangers' } });
          }}
        />
        <Pressable onPress={onClose} className="mt-2 items-center py-3 active:opacity-70">
          <Txt weight="semibold" className="text-white/70">
            Keep browsing
          </Txt>
        </Pressable>
      </View>
    </View>
  );
}

function MatchOverlay({ item, onClose }: { item: Discovery; onClose: () => void }) {
  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(14,23,38,0.97)' }]} className="items-center justify-center px-8">
      <Txt weight="black" className="text-white" style={{ fontSize: 40 }}>
        TARA! 🎉
      </Txt>
      <Txt weight="medium" className="mt-2 text-center text-[15px] text-white/80">
        You&apos;re in on
      </Txt>
      <Txt weight="bold" className="mt-1 text-center text-[20px] text-white">
        {item.title}
      </Txt>

      <View className="my-8 flex-row items-center">
        <Avatar uri={ME.avatar} size={84} ring={C.orange} />
        <View className="-mx-3 h-12 w-12 items-center justify-center rounded-full" style={{ backgroundColor: C.orange, zIndex: 10 }}>
          <Ionicons name="arrow-forward" size={24} color={C.white} />
        </View>
        <Avatar uri={item.host.avatar} size={84} ring={C.blue} />
      </View>

      <Txt weight="regular" className="mb-6 text-center text-[14px] text-white/70">
        {item.host.name} hosts · {item.when} · {item.area}
      </Txt>

      <View className="w-full">
        <PrimaryButton
          label="Send a plan-note"
          icon="chatbubble-ellipses"
          onPress={() => {
            onClose();
            router.push({ pathname: '/plan/[id]', params: { id: item.id } });
          }}
        />
        <Pressable onPress={onClose} className="mt-2 items-center py-3 active:opacity-70">
          <Txt weight="semibold" className="text-white/70">
            Keep swiping
          </Txt>
        </Pressable>
      </View>
    </View>
  );
}

export default function TaraScreen() {
  const toast = useToast();
  const [matched, setMatched] = useState<Discovery | null>(null);
  const [paywall, setPaywall] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [showLocation, setShowLocation] = useState(false);
  const [quotaDismissed, setQuotaDismissed] = useState(false);

  const discovery = useStore((s) => s.discovery);
  const filters = useStore((s) => s.filters);
  const location = useStore((s) => s.location);
  const freeStrangerLeft = useStore((s) => s.freeStrangerLeft);
  const isPremium = useStore((s) => s.isPremium);
  const notifs = useStore((s) => s.notifs);
  const setCats = useStore((s) => s.setCats);
  const setGender = useStore((s) => s.setGender);
  const setBudget = useStore((s) => s.setBudget);
  const setLocation = useStore((s) => s.setLocation);
  const joinPlan = useStore((s) => s.joinPlan);
  const passPlan = useStore((s) => s.passPlan);
  const rewindSwipe = useStore((s) => s.rewindSwipe);

  const data = useMemo(
    () =>
      discovery.filter(
        (d) =>
          (filters.cats.length === 0 || filters.cats.includes(d.category)) &&
          (filters.gender === 'all' || (d.genderPref ?? 'all') === filters.gender) &&
          (filters.budget === 'any' || budgetOf(d) === filters.budget),
      ),
    [discovery, filters],
  );
  const unread = useMemo(() => unreadNotifCount(notifs), [notifs]);
  const catCount = filters.cats.length;

  return (
    <Screen>
      <View className="flex-row items-center px-5 pb-1 pt-1">
        <View className="flex-1">
          <Txt weight="black" className="text-brand-ink" style={{ fontSize: 24 }}>
            tara<Txt weight="black" style={{ color: C.orange, fontSize: 24 }}>!</Txt>
          </Txt>
        </View>
        <Pressable
          onPress={() => setShowLocation(true)}
          className="flex-row items-center rounded-full px-3 py-2 active:opacity-70"
          style={{ backgroundColor: C.surface }}
          accessibilityRole="button"
          accessibilityLabel={`Location: ${location}. Tap to change`}
        >
          <Ionicons name="location" size={13} color={C.orange} />
          <Txt weight="semibold" className="ml-1 max-w-[120px] text-[12px] text-brand-ink" numberOfLines={1}>
            {location}
          </Txt>
          <Ionicons name="chevron-down" size={13} color={C.muted} style={{ marginLeft: 2 }} />
        </Pressable>
        <View className="flex-1 flex-row items-center justify-end">
          <IconButton
            name={catCount ? 'funnel' : 'funnel-outline'}
            diameter={38}
            size={20}
            color={catCount ? C.orange : C.ink}
            accessibilityLabel="Filter plans"
            onPress={() => setShowFilter(true)}
          />
          <View>
            <IconButton name="notifications-outline" diameter={38} size={21} accessibilityLabel="Notifications" onPress={() => router.push('/notifications')} />
            {unread > 0 && (
              <View
                className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: C.orange, borderWidth: 1.5, borderColor: C.white }}
              />
            )}
          </View>
          <IconButton name="chatbubble-ellipses-outline" diameter={38} size={21} accessibilityLabel="Messages" onPress={() => router.push('/messages')} />
        </View>
      </View>

      {/* Free-Tara quota banner — informational above 1, warning at 1 (dismissible), upsell at 0. */}
      {!isPremium && freeStrangerLeft === 0 ? (
        <Pressable
          onPress={() => router.push({ pathname: '/premium', params: { reason: 'strangers' } })}
          className="mx-5 mb-1 mt-2 flex-row items-center justify-center rounded-full py-2 active:opacity-80"
          style={{ backgroundColor: `${C.orange}14` }}
          accessibilityRole="button"
          accessibilityLabel="Free Taras used. Go Premium for unlimited"
        >
          <Ionicons name="star" size={14} color={C.orange} />
          <Txt weight="semibold" className="ml-1.5 text-[12px]" style={{ color: C.orangeDark }}>
            Free Taras used — Premium for unlimited
          </Txt>
          <Ionicons name="chevron-forward" size={13} color={C.orangeDark} style={{ marginLeft: 2 }} />
        </Pressable>
      ) : !isPremium && freeStrangerLeft === 1 && !quotaDismissed ? (
        <View className="mx-5 mb-1 mt-2 flex-row items-center justify-center rounded-full py-2" style={{ backgroundColor: `${C.orange}14` }}>
          <Ionicons name="alert-circle" size={14} color={C.orange} />
          <Txt weight="semibold" className="ml-1.5 text-[12px]" style={{ color: C.orangeDark }}>
            1 free stranger Tara left this month
          </Txt>
          <Pressable
            onPress={() => setQuotaDismissed(true)}
            hitSlop={10}
            style={{ marginLeft: 8 }}
            accessibilityRole="button"
            accessibilityLabel="Dismiss"
          >
            <Ionicons name="close" size={14} color={C.orangeDark} />
          </Pressable>
        </View>
      ) : !isPremium && freeStrangerLeft > 1 ? (
        <View className="mx-5 mb-1 mt-2 flex-row items-center justify-center rounded-full py-2" style={{ backgroundColor: `${C.orange}14` }}>
          <Ionicons name="arrow-forward-circle" size={14} color={C.orange} />
          <Txt weight="semibold" className="ml-1.5 text-[12px]" style={{ color: C.orangeDark }}>
            {freeStrangerLeft} free stranger Taras left this month
          </Txt>
        </View>
      ) : null}

      <View className="flex-1 px-4 pt-2">
        <SwipeDeck
          key={`${filters.cats.join(',')}-${filters.gender}-${filters.budget}`}
          data={data}
          keyOf={(d) => d.id}
          renderCard={(d) => <DiscoveryCard item={d} />}
          onSwipe={(item, dir) => {
            if (dir === 'right') {
              // Gate stranger Taras once the free monthly quota is spent (unless Premium).
              // Return false on any block so the deck keeps the card (no lost plan, no history desync).
              if (item.audience === 'stranger' && !isPremium && freeStrangerLeft <= 0) {
                setPaywall(true);
                return false;
              }
              if (joinPlan(item.id)) {
                setMatched(item);
                return true;
              }
              toast(item.going >= item.spots ? 'This table is full' : "You're already in this one");
              return false;
            }
            passPlan(item.id);
            return true;
          }}
          onRewind={rewindSwipe}
          onCardTap={(item) => router.push({ pathname: '/plan/[id]', params: { id: item.id } })}
          renderEmpty={() => (
            <View className="flex-1 items-center justify-center">
              <Txt style={{ fontSize: 48 }}>🎉</Txt>
              <Txt weight="black" className="mt-3 text-[20px] text-brand-ink">
                You&apos;re all caught up
              </Txt>
              <Txt weight="medium" className="mt-1 text-center text-[14px] text-brand-muted">
                Check back later — new plans drop{'\n'}around {location} every day.
              </Txt>
            </View>
          )}
        />
      </View>

      {matched && <MatchOverlay item={matched} onClose={() => setMatched(null)} />}
      {paywall && <PaywallOverlay onClose={() => setPaywall(false)} />}
      {showFilter && (
        <FilterSheet
          cats={filters.cats}
          setCats={setCats}
          gender={filters.gender}
          setGender={setGender}
          budget={filters.budget}
          setBudget={setBudget}
          count={data.length}
          onClose={() => setShowFilter(false)}
        />
      )}
      {showLocation && <LocationSheet current={location} onPick={setLocation} onClose={() => setShowLocation(false)} />}
    </Screen>
  );
}
