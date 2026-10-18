import { Ionicons } from '@expo/vector-icons';
import { router, type Href } from 'expo-router';
import type { ComponentProps } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar, ScreenHeader } from '@/components/ui/kit';
import { Txt } from '@/components/ui/txt';
import { useToast } from '@/components/ui/toast';
import type { Notif } from '@/data/mock';
import { C } from '@/lib/tokens';
import { useStore } from '@/store';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

// Non-tara kinds map to an icon + accent tone for the leading circle.
const KIND: Record<Exclude<Notif['kind'], 'tara'>, { icon: IoniconName; color: string }> = {
  confirm: { icon: 'time', color: C.orange },
  invite: { icon: 'people', color: C.blue },
  like: { icon: 'heart', color: C.red },
  system: { icon: 'shield-checkmark', color: C.green },
};

function Leading({ n }: { n: Notif }) {
  if (n.user) return <Avatar uri={n.user.avatar} size={44} />;
  if (n.kind === 'tara') {
    return (
      <View className="h-11 w-11 items-center justify-center rounded-full" style={{ backgroundColor: `${C.orange}1A` }}>
        <Txt className="text-[18px]">🪣</Txt>
      </View>
    );
  }
  const { icon, color } = KIND[n.kind];
  return (
    <View className="h-11 w-11 items-center justify-center rounded-full" style={{ backgroundColor: `${color}1A` }}>
      <Ionicons name={icon} size={20} color={color} />
    </View>
  );
}

function Row({
  n,
  onPress,
  onConfirm,
  isConfirmed,
  showDot,
}: {
  n: Notif;
  onPress: () => void;
  onConfirm: () => void;
  isConfirmed: boolean;
  showDot: boolean;
}) {
  return (
    <View className={`mx-3 flex-row items-center rounded-2xl px-3 py-3 ${n.unread ? 'bg-brand-surface' : ''}`}>
      <Pressable
        onPress={onPress}
        className="flex-1 flex-row items-center active:opacity-80"
        accessibilityRole="button"
        accessibilityLabel={`${n.user ? n.user.name + ' ' : ''}${n.text}`}
      >
        <Leading n={n} />
        <View className="ml-3 flex-1">
          <Txt weight="regular" className="text-[13.5px] leading-[19px] text-brand-ink">
            {n.user ? <Txt weight="bold">{n.user.name} </Txt> : null}
            {n.text}
          </Txt>
          <Txt weight="medium" className="mt-1 text-[11px] text-brand-muted">
            {n.time}
          </Txt>
        </View>
      </Pressable>
      {n.kind === 'confirm' ? (
        isConfirmed ? (
          <View className="ml-2 rounded-full px-3.5 py-2" style={{ backgroundColor: `${C.green}1A` }}>
            <Txt weight="bold" className="text-[12px]" style={{ color: C.green }}>
              Confirmed ✓
            </Txt>
          </View>
        ) : (
          <Pressable
            onPress={onConfirm}
            accessibilityRole="button"
            accessibilityLabel="Confirm attendance"
            className="ml-2 rounded-full px-3.5 py-2 active:opacity-80"
            style={{ backgroundColor: C.orange }}
          >
            <Txt weight="bold" className="text-[12px] text-white">
              Confirm
            </Txt>
          </Pressable>
        )
      ) : showDot ? (
        <View className="ml-2 h-2.5 w-2.5 rounded-full" style={{ backgroundColor: C.orange }} />
      ) : null}
    </View>
  );
}

function Divider({ label }: { label: string }) {
  return (
    <Txt weight="bold" className="px-5 pb-1.5 pt-4 text-[12px] uppercase tracking-wide text-brand-muted">
      {label}
    </Txt>
  );
}

// Fallback plan for a confirm row whose fixture omits confirmPlanId — Board game night.
const CONFIRM_PLAN_ID = 'd4';

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const notifs = useStore((s) => s.notifs);
  const markNotifRead = useStore((s) => s.markNotifRead);
  const markAllNotifsRead = useStore((s) => s.markAllNotifsRead);
  const confirmedPlanIds = useStore((s) => s.confirmedPlanIds);
  const confirmAttendance = useStore((s) => s.confirmAttendance);

  const unread = notifs.filter((n) => n.unread);
  const earlier = notifs.filter((n) => !n.unread);

  const markAllRead = () => {
    markAllNotifsRead();
    toast('All caught up ✓');
  };

  const renderRow = (n: Notif) => {
    const planId = n.confirmPlanId ?? CONFIRM_PLAN_ID;
    return (
      <Row
        key={n.id}
        n={n}
        onPress={() => {
          markNotifRead(n.id);
          if (!n.target) return;
          // Route by the notif's own target so same-kind rows don't collide.
          router.push(
            n.target.id
              ? ({ pathname: n.target.pathname, params: { id: n.target.id } } as Href)
              : (n.target.pathname as Href),
          );
        }}
        onConfirm={() => {
          // Persisted in the store — plan/[id] sees the same confirm state.
          confirmAttendance(planId);
          markNotifRead(n.id); // clears the row's unread dot
          toast('Confirmed ✓ — see you there!');
        }}
        isConfirmed={confirmedPlanIds.includes(planId)}
        showDot={n.unread}
      />
    );
  };

  return (
    <View className="flex-1 bg-white">
      <ScreenHeader
        title="Activity"
        right={
          <Pressable onPress={markAllRead} className="rounded-full px-3 py-1.5 active:opacity-70">
            <Txt weight="bold" className="text-[13px]" style={{ color: C.orange }}>
              Mark all read
            </Txt>
          </Pressable>
        }
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
        {unread.length > 0 && <Divider label="New" />}
        {unread.map(renderRow)}
        {earlier.length > 0 && <Divider label="Earlier" />}
        {earlier.map(renderRow)}
      </ScrollView>
    </View>
  );
}
