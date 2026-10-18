import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { AvatarStack, IconButton, Screen, SectionHeader, Skeleton } from '@/components/ui/kit';
import { Txt } from '@/components/ui/txt';
import { type Kada } from '@/data/mock';
import { hLight } from '@/lib/haptics';
import { C, ORANGE_GRADIENT } from '@/lib/tokens';
import { useStore } from '@/store';

function KadaRow({ k }: { k: Kada }) {
  return (
    <Pressable
      onPress={() => router.push({ pathname: '/kada/[id]', params: { id: k.id } })}
      accessibilityRole="button"
      accessibilityLabel={`${k.name}, ${k.members.length} members`}
      className="mx-5 mb-3 overflow-hidden rounded-3xl border border-black/5 bg-white active:opacity-90"
    >
      <View className="h-1.5" style={{ backgroundColor: k.color }} />
      <View className="flex-row items-center p-4">
        <View className="h-14 w-14 items-center justify-center rounded-2xl" style={{ backgroundColor: `${k.color}1A` }}>
          <Txt style={{ fontSize: 26 }}>{k.emoji}</Txt>
        </View>
        <View className="ml-3 flex-1">
          <Txt weight="bold" className="text-[15px] text-brand-ink">{k.name}</Txt>
          <View className="mt-1.5 flex-row items-center">
            <AvatarStack uris={k.members.map((m) => m.avatar)} size={22} max={4} />
            <Txt weight="medium" className="ml-2 text-[11px] text-brand-muted">
              {k.members.length} members · {k.lastActive}
            </Txt>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={18} color={C.faint} />
      </View>
      <View className="flex-row border-t border-black/5">
        <View className="flex-1 flex-row items-center justify-center py-2.5">
          <Txt style={{ fontSize: 12 }}>🪣</Txt>
          <Txt weight="bold" className="ml-1 text-[12px] text-brand-ink">Lvl {k.level}</Txt>
        </View>
        <View className="flex-1 flex-row items-center justify-center border-x border-black/5 py-2.5">
          <Txt weight="bold" className="text-[12px] text-brand-ink">{k.plans}</Txt>
          <Txt weight="medium" className="ml-1 text-[11px] text-brand-muted">plans</Txt>
        </View>
        <View className="flex-1 flex-row items-center justify-center py-2.5">
          <Txt weight="bold" className="text-[12px] text-brand-ink">{k.bucketCount}</Txt>
          <Txt weight="medium" className="ml-1 text-[11px] text-brand-muted">buckets</Txt>
        </View>
      </View>
    </Pressable>
  );
}

function DiscoverKadaRow({ k, requested, onRequest }: { k: Kada; requested: boolean; onRequest: () => void }) {
  // Row press and the request button are siblings — nested Pressables render <button> inside <button> on web.
  return (
    <View className="mx-5 mb-3 flex-row items-center rounded-3xl border border-black/5 bg-white p-4">
      <Pressable
        onPress={() => router.push({ pathname: '/kada/[id]', params: { id: k.id } })}
        accessibilityRole="button"
        accessibilityLabel={`${k.name}, ${k.members.length} members, level ${k.level}`}
        className="flex-1 flex-row items-center active:opacity-90"
      >
        <View className="h-12 w-12 items-center justify-center rounded-2xl" style={{ backgroundColor: `${k.color}1A` }}>
          <Txt style={{ fontSize: 24 }}>{k.emoji}</Txt>
        </View>
        <View className="ml-3 flex-1">
          <Txt weight="bold" className="text-[14px] text-brand-ink" numberOfLines={1}>{k.name}</Txt>
          <Txt weight="medium" className="mt-0.5 text-[11px] text-brand-muted">
            {k.members.length} members · Lvl {k.level}
          </Txt>
        </View>
      </Pressable>
      <Pressable
        onPress={() => { hLight(); onRequest(); }}
        accessibilityRole="button"
        accessibilityLabel={requested ? `Cancel request to join ${k.name}` : `Request to join ${k.name}`}
        className="ml-2 rounded-full px-3.5 py-2 active:opacity-80"
        style={{ backgroundColor: requested ? `${C.green}1A` : C.orange }}
      >
        <Txt weight="bold" className="text-[12px]" style={{ color: requested ? C.green : C.white }}>
          {requested ? 'Requested ✓' : 'Request to join'}
        </Txt>
      </Pressable>
    </View>
  );
}

function KadaCardSkeleton() {
  return (
    <View className="mx-5 mb-3 overflow-hidden rounded-3xl border border-black/5 bg-white">
      <View className="h-1.5 bg-brand-surface" />
      <View className="flex-row items-center p-4">
        <Skeleton style={{ width: 56, height: 56, borderRadius: 16 }} />
        <View className="ml-3 flex-1">
          <Skeleton style={{ width: '55%', height: 15, borderRadius: 7 }} />
          <Skeleton style={{ width: '75%', height: 22, borderRadius: 11, marginTop: 8 }} />
        </View>
      </View>
      <View className="flex-row border-t border-black/5">
        <View className="flex-1 items-center py-2.5"><Skeleton style={{ width: 44, height: 14, borderRadius: 7 }} /></View>
        <View className="flex-1 items-center border-x border-black/5 py-2.5"><Skeleton style={{ width: 44, height: 14, borderRadius: 7 }} /></View>
        <View className="flex-1 items-center py-2.5"><Skeleton style={{ width: 44, height: 14, borderRadius: 7 }} /></View>
      </View>
    </View>
  );
}

export default function KadasScreen() {
  const [loading, setLoading] = useState(true);
  const kadas = useStore((s) => s.kadas);
  const myKadaIds = useStore((s) => s.myKadaIds);
  const requestedKadaIds = useStore((s) => s.requestedKadaIds);
  const toggleKadaRequest = useStore((s) => s.toggleKadaRequest);
  const myKadas = useMemo(() => kadas.filter((k) => myKadaIds.includes(k.id)), [kadas, myKadaIds]);
  const discover = useMemo(() => kadas.filter((k) => !myKadaIds.includes(k.id)), [kadas, myKadaIds]);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(t);
  }, []);

  const createKada = () => {
    hLight();
    router.push('/create-kada');
  };

  return (
    <Screen>
      <View className="flex-row items-center px-5 pb-2 pt-1">
        <IconButton name="chevron-back" diameter={40} size={22} accessibilityLabel="Go back" onPress={() => router.back()} />
        <Txt weight="black" className="ml-1 flex-1 text-[24px] text-brand-ink">Kadas</Txt>
        <IconButton name="add" diameter={44} size={24} color={C.white} bg={C.orange} accessibilityLabel="Create a kada" onPress={createKada} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="pb-6 pt-1">
        <Pressable
          onPress={createKada}
          accessibilityRole="button"
          accessibilityLabel="Create a kada"
          className="mx-5 mb-4 overflow-hidden rounded-3xl active:opacity-90"
        >
          <LinearGradient colors={ORANGE_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <View className="flex-row items-center p-4">
              <View className="h-12 w-12 items-center justify-center rounded-2xl bg-white/20">
                <Ionicons name="people" size={24} color={C.white} />
              </View>
              <View className="ml-3 flex-1">
                <Txt weight="black" className="text-[15px] text-white">Create a kada</Txt>
                <Txt weight="medium" className="mt-0.5 text-[12px] text-white/85">Pull in your barkada — free up to 15</Txt>
              </View>
              <Ionicons name="arrow-forward" size={20} color={C.white} />
            </View>
          </LinearGradient>
        </Pressable>

        {loading ? (
          [0, 1, 2].map((i) => <KadaCardSkeleton key={i} />)
        ) : (
          <>
            {myKadas.length === 0 ? (
              <View className="items-center px-10 py-10">
                <View className="h-20 w-20 items-center justify-center rounded-full bg-brand-surface">
                  <Ionicons name="people-outline" size={32} color={C.faint} />
                </View>
                <Txt weight="bold" className="mt-4 text-[16px] text-brand-ink">Wala ka pang kada</Txt>
                <Txt weight="medium" className="mt-1 text-center text-[13px] text-brand-muted">
                  Gawa ka ng isa or discover below 👇
                </Txt>
              </View>
            ) : (
              myKadas.map((k) => <KadaRow key={k.id} k={k} />)
            )}

            {discover.length > 0 && (
              <View className="mt-4">
                <SectionHeader title="Discover kadas" />
                <Txt weight="medium" className="mt-1 px-5 text-[12.5px] text-brand-muted">
                  Public kadas na pwede mong salihan
                </Txt>
                <View className="mt-3">
                  {discover.map((k) => (
                    <DiscoverKadaRow
                      key={k.id}
                      k={k}
                      requested={requestedKadaIds.includes(k.id)}
                      onRequest={() => toggleKadaRequest(k.id)}
                    />
                  ))}
                </View>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </Screen>
  );
}
