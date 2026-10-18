import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { Alert, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar, NotFound, PrimaryButton, SectionHeader } from '@/components/ui/kit';
import { useToast } from '@/components/ui/toast';
import { Txt } from '@/components/ui/txt';
import { type Bucket, catColor, catEmoji } from '@/data/mock';
import { hSuccess } from '@/lib/haptics';
import { C } from '@/lib/tokens';
import { useStore } from '@/store';

// ponytail: multiply channels toward black — good enough for a header gradient tone.
const darken = (hex: string, amt = 0.32) => {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.round(((n >> 16) & 255) * (1 - amt));
  const g = Math.round(((n >> 8) & 255) * (1 - amt));
  const b = Math.round((n & 255) * (1 - amt));
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
};

function MemberTile({ name, avatar, onPress }: { name: string; avatar: string; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} className="items-center active:opacity-70" style={{ width: '25%' }}>
      <Avatar uri={avatar} size={56} ring={C.white} />
      <Txt weight="semibold" className="mt-1.5 text-[12px] text-brand-ink" numberOfLines={1}>
        {name.split(' ')[0]}
      </Txt>
    </Pressable>
  );
}

function SharedBucketRow({ b }: { b: Bucket }) {
  const color = catColor(b.category);
  return (
    <Pressable
      onPress={() => router.push({ pathname: '/bucket/[id]', params: { id: b.id } })}
      className="mx-5 mb-3 flex-row items-center rounded-3xl border border-black/5 bg-white p-3 active:opacity-90"
    >
      <View className="h-12 w-12 items-center justify-center rounded-2xl" style={{ backgroundColor: `${color}1A` }}>
        <Txt style={{ fontSize: 24 }}>{catEmoji(b.category)}</Txt>
      </View>
      <View className="ml-3 flex-1">
        <Txt weight="bold" className="text-[14px] text-brand-ink" numberOfLines={2}>
          {b.title}
        </Txt>
        {b.interested > 0 && (
          <Txt weight="semibold" className="mt-1 text-[11px]" style={{ color: C.orange }}>
            🪣 {b.interested} interested
          </Txt>
        )}
      </View>
      <Ionicons name="chevron-forward" size={18} color={C.faint} />
    </Pressable>
  );
}

export default function KadaDetailScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const toast = useToast();
  const kadas = useStore((s) => s.kadas);
  const buckets = useStore((s) => s.buckets);
  const myKadaIds = useStore((s) => s.myKadaIds);
  const requestedKadaIds = useStore((s) => s.requestedKadaIds);
  const joinKada = useStore((s) => s.joinKada);
  const leaveKada = useStore((s) => s.leaveKada);
  const toggleKadaRequest = useStore((s) => s.toggleKadaRequest);
  // A few kada-intent buckets stand in as the kada's shared list.
  const shared = useMemo<Bucket[]>(() => buckets.filter((b) => b.intent === 'kada' || b.interested >= 5).slice(0, 4), [buckets]);
  const kada = kadas.find((x) => x.id === id);
  if (!kada) return <NotFound label="Kada" />;
  const isMember = myKadaIds.includes(kada.id);
  const requested = requestedKadaIds.includes(kada.id);
  const coverHeight = 130 + insets.top;
  // Kada levels up every 5 completed plans — progress derives from real plan count.
  const PLANS_PER_LEVEL = 5;
  const progress = (kada.plans % PLANS_PER_LEVEL) / PLANS_PER_LEVEL;
  const plansToNext = PLANS_PER_LEVEL - (kada.plans % PLANS_PER_LEVEL);

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="light" />

      <Pressable
        onPress={() => router.back()}
        style={{ position: 'absolute', top: insets.top + 6, left: 16, zIndex: 20 }}
        className="h-10 w-10 items-center justify-center rounded-full bg-black/25 active:opacity-80"
      >
        <Ionicons name="chevron-back" size={22} color="#fff" />
      </Pressable>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {/* 1. Cover + identity */}
        <LinearGradient
          colors={[kada.color, darken(kada.color)]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ height: coverHeight }}
        />
        <View className="px-5" style={{ marginTop: -34 }}>
          <View
            className="h-[68px] w-[68px] items-center justify-center rounded-2xl border border-black/5 bg-white"
            style={{ backgroundColor: `${kada.color}1A` }}
          >
            <Txt style={{ fontSize: 34 }}>{kada.emoji}</Txt>
          </View>
          <Txt weight="black" className="mt-3 text-[24px] text-brand-ink">
            {kada.name}
          </Txt>
          <Txt weight="medium" className="mt-0.5 text-[13px] text-brand-muted">
            {kada.members.length} members · {kada.lastActive}
          </Txt>
        </View>

        {/* 2. Stats row card */}
        <View className="mx-5 mt-4 flex-row items-center justify-around rounded-3xl border border-black/5 py-4">
          <View className="flex-row items-center">
            <Txt style={{ fontSize: 16 }}>🪣</Txt>
            <Txt weight="black" className="ml-1.5 text-[18px] text-brand-ink">
              Lvl {kada.level}
            </Txt>
          </View>
          <View className="h-8 w-px bg-black/5" />
          <View className="items-center">
            <Txt weight="black" className="text-[18px] text-brand-ink">{kada.plans}</Txt>
            <Txt weight="medium" className="text-[11px] text-brand-muted">plans</Txt>
          </View>
          <View className="h-8 w-px bg-black/5" />
          <View className="items-center">
            <Txt weight="black" className="text-[18px] text-brand-ink">{kada.bucketCount}</Txt>
            <Txt weight="medium" className="text-[11px] text-brand-muted">buckets</Txt>
          </View>
        </View>

        {/* 3. Kada level progress */}
        <View className="mx-5 mt-4 rounded-3xl p-4" style={{ backgroundColor: `${kada.color}12` }}>
          <View className="flex-row items-center justify-between">
            <Txt weight="black" className="text-[15px]" style={{ color: darken(kada.color, 0.2) }}>
              Level {kada.level}
            </Txt>
            <Txt weight="semibold" className="text-[12px] text-brand-muted">
              {plansToNext} more {plansToNext === 1 ? 'plan' : 'plans'} to Level {kada.level + 1}
            </Txt>
          </View>
          <View className="mt-2 h-2.5 overflow-hidden rounded-full bg-black/10">
            <View className="h-full rounded-full" style={{ width: `${Math.round(progress * 100)}%`, backgroundColor: kada.color }} />
          </View>
          <Pressable
            onPress={() => router.push('/levels')}
            className="mt-2.5 flex-row items-center self-start active:opacity-70"
            accessibilityRole="button"
            accessibilityLabel="How do kada levels work?"
          >
            <Ionicons name="help-circle-outline" size={14} color={C.muted} />
            <Txt weight="semibold" className="ml-1 text-[12px] text-brand-muted">How do kada levels work?</Txt>
          </Pressable>
        </View>

        {/* 4. Members */}
        <View className="mt-6">
          <SectionHeader title="Members" />
          <View className="mx-5 mt-3 flex-row flex-wrap gap-y-4">
            <Pressable
              onPress={() => router.push('/invite')}
              className="items-center active:opacity-70"
              style={{ width: '25%' }}
            >
              <View
                className="h-14 w-14 items-center justify-center rounded-full border-2 border-dashed"
                style={{ borderColor: C.line }}
              >
                <Ionicons name="add" size={24} color={C.orange} />
              </View>
              <Txt weight="semibold" className="mt-1.5 text-[12px]" style={{ color: C.orange }}>
                Invite
              </Txt>
            </Pressable>
            {kada.members.map((m) => (
              <MemberTile
                key={m.id}
                name={m.name}
                avatar={m.avatar}
                onPress={() => router.push({ pathname: '/profile/[id]', params: { id: m.id } })}
              />
            ))}
          </View>
        </View>

        {/* 5. Shared bucket */}
        <View className="mt-6">
          <SectionHeader title="Shared bucket" />
          <View className="mt-3">
            {shared.map((b) => (
              <SharedBucketRow key={b.id} b={b} />
            ))}
          </View>
        </View>
      </ScrollView>

      {/* 6. Sticky bottom */}
      <View
        className="border-t border-black/5 bg-white px-5 pt-3"
        style={{ paddingBottom: insets.bottom + 10 }}
      >
        {isMember ? (
          <>
            <PrimaryButton label="Plan something" icon="calendar" onPress={() => router.push('/create-plan')} />
            <View className="mt-2.5 flex-row gap-2.5">
              <Pressable
                onPress={() => router.push({ pathname: '/plan-note', params: { id: kada.id, title: `${kada.name} GC`, kind: 'kada' } })}
                className="flex-1 flex-row items-center justify-center rounded-2xl border border-black/10 py-3.5 active:opacity-70"
                accessibilityRole="button"
                accessibilityLabel="Open kada group chat"
              >
                <Ionicons name="chatbubbles-outline" size={16} color={C.ink} />
                <Txt weight="bold" className="ml-1.5 text-[15px] text-brand-ink">Kada GC</Txt>
              </Pressable>
              <Pressable
                onPress={() => router.push('/invite')}
                className="flex-1 items-center justify-center rounded-2xl border border-black/10 py-3.5 active:opacity-70"
                accessibilityRole="button"
                accessibilityLabel="Invite barkada"
              >
                <Txt weight="bold" className="text-[15px] text-brand-ink">Invite barkada</Txt>
              </Pressable>
            </View>
            <Pressable
              onPress={() =>
                Alert.alert('Leave kada?', `You'll stop getting ${kada.name} plans and chats.`, [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Leave',
                    style: 'destructive',
                    onPress: () => {
                      leaveKada(kada.id);
                      toast(`Left ${kada.name}`);
                    },
                  },
                ])
              }
              className="mt-2 items-center py-1.5 active:opacity-70"
              accessibilityRole="button"
              accessibilityLabel="Leave kada"
            >
              <Txt weight="semibold" className="text-[12.5px]" style={{ color: C.red }}>Leave kada</Txt>
            </Pressable>
          </>
        ) : requested ? (
          <PrimaryButton
            label="Requested"
            icon="checkmark"
            onPress={() => {
              toggleKadaRequest(kada.id);
              toast(`Cancelled request to join ${kada.name}`);
            }}
          />
        ) : (
          <PrimaryButton
            label="Join kada"
            icon="people"
            onPress={() => {
              joinKada(kada.id);
              if (requestedKadaIds.includes(kada.id)) toggleKadaRequest(kada.id);
              hSuccess();
              toast(`Joined ${kada.name}`);
            }}
          />
        )}
      </View>
    </View>
  );
}
