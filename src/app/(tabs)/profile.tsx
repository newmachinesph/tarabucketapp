import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, type Href } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import type { ComponentProps } from 'react';
import { Alert, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar, PrimaryButton, SettingsGroup, SettingsRow, Stat } from '@/components/ui/kit';
import { Txt } from '@/components/ui/txt';
import { BLUE_GRADIENT, C } from '@/lib/tokens';
import { useStore } from '@/store';

type SettingRow = { icon: ComponentProps<typeof Ionicons>['name']; label: string; value: string; color: string };
const SETTINGS: SettingRow[] = [
  { icon: 'shield-checkmark', label: 'Verification', value: 'Verified', color: C.green },
  { icon: 'lock-closed', label: 'Privacy', value: 'Kada-only', color: C.muted },
  { icon: 'notifications', label: 'Notifications', value: '', color: C.blue },
  { icon: 'heart-circle', label: 'Safety tools', value: '', color: C.red },
  { icon: 'help-circle', label: 'Help & support', value: '', color: C.muted },
];

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const me = useStore((s) => s.me);
  const stats = useStore((s) => s.stats);
  const interests = useStore((s) => s.interests);
  const isPremium = useStore((s) => s.isPremium);
  const followingIds = useStore((s) => s.followingIds);
  const friendIds = useStore((s) => s.friendIds);
  const privacy = useStore((s) => s.privacy);
  const signOut = useStore((s) => s.signOut);

  const confirmSignOut = () =>
    Alert.alert('Log out of Tara?', 'Your plans and kadas will be here pagbalik mo.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log out',
        style: 'destructive',
        onPress: () => {
          signOut();
          router.replace('/welcome');
        },
      },
    ]);

  const rows = SETTINGS.map((s) => {
    if (s.label === 'Verification') return { ...s, value: me.verified ? 'Verified' : 'Unverified' };
    if (s.label === 'Privacy') return { ...s, value: privacy.visibility };
    return s;
  });

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="light" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="pb-10">
        <LinearGradient colors={BLUE_GRADIENT} style={{ height: 140 + insets.top, paddingTop: insets.top }}>
          <View className="flex-row justify-end px-5 pt-2">
            <Pressable onPress={() => router.push('/settings')} className="h-10 w-10 items-center justify-center rounded-full bg-white/20 active:opacity-80" accessibilityRole="button" accessibilityLabel="Settings">
              <Ionicons name="settings-outline" size={20} color={C.white} />
            </Pressable>
          </View>
        </LinearGradient>

        <View className="items-center" style={{ marginTop: -46 }}>
          <View style={{ borderWidth: 4, borderColor: C.white, borderRadius: 999 }}>
            <Avatar uri={me.avatar} size={88} />
          </View>
          <View className="mt-3 flex-row items-center">
            <Txt weight="black" className="text-[22px] text-brand-ink">
              {me.name}, {me.age}
            </Txt>
            {me.verified && <Ionicons name="checkmark-circle" size={18} color={C.blue} style={{ marginLeft: 4 }} />}
          </View>
          <Txt weight="medium" className="text-[13px] text-brand-muted">@{me.handle}</Txt>
          {me.bio ? (
            <Txt weight="medium" className="mt-2 px-8 text-center text-[13px] leading-[19px] text-brand-muted" numberOfLines={3}>
              {me.bio}
            </Txt>
          ) : null}
          <Pressable
            onPress={() => router.push('/edit-profile')}
            className="mt-3 flex-row items-center rounded-full border px-4 py-2 active:opacity-70"
            style={{ borderColor: C.line }}
            accessibilityRole="button"
            accessibilityLabel="Edit profile"
          >
            <Ionicons name="create-outline" size={15} color={C.ink} />
            <Txt weight="bold" className="ml-1.5 text-[12.5px] text-brand-ink">Edit profile</Txt>
          </Pressable>
        </View>

        <View className="mx-5 mt-6 flex-row items-center justify-around rounded-3xl border border-black/5 py-4">
          <Stat value={String(stats.plans)} label="Plans" />
          <View className="h-8 w-px bg-black/5" />
          <Pressable onPress={() => router.push('/kadas' as Href)} accessibilityRole="button" accessibilityLabel="View your kadas">
            <Stat value={String(stats.kadas)} label="Kadas" />
          </Pressable>
          <View className="h-8 w-px bg-black/5" />
          <Stat value={`${stats.streak}wk`} label="Streak" />
        </View>
        <Txt weight="semibold" className="mt-2 text-center text-[12.5px] text-brand-muted">
          {friendIds.length} friends · {followingIds.length} following
        </Txt>

        <Pressable
          onPress={() => router.push('/levels')}
          accessibilityRole="button"
          accessibilityLabel={`Tara Level ${stats.level}. How levels work`}
          className="mx-5 mt-3 rounded-3xl p-4 active:opacity-80"
          style={{ backgroundColor: `${C.orange}12` }}
        >
          <View className="flex-row items-center justify-between">
            <Txt weight="black" className="text-[15px]" style={{ color: C.orangeDark }}>
              Tara Level {stats.level}
            </Txt>
            <View className="flex-row items-center">
              <Txt weight="semibold" className="text-[12px] text-brand-muted">240 / 300 XP</Txt>
              <Ionicons name="chevron-forward" size={14} color={C.faint} style={{ marginLeft: 4 }} />
            </View>
          </View>
          <View className="mt-2 h-2.5 overflow-hidden rounded-full bg-black/10">
            <View className="h-full rounded-full" style={{ width: '80%', backgroundColor: C.orange }} />
          </View>
          <Txt weight="medium" className="mt-2 text-[12px] text-brand-muted">
            3 more fulfilled plans to reach Level {stats.level + 1} · how levels work
          </Txt>
        </Pressable>

        {isPremium ? (
          <View className="mx-5 mt-3 flex-row items-center rounded-3xl border p-4" style={{ borderColor: `${C.orange}40`, backgroundColor: `${C.orange}0A` }}>
            <View className="h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: `${C.orange}1A` }}>
              <Ionicons name="star" size={20} color={C.orange} />
            </View>
            <View className="ml-3 flex-1">
              <Txt weight="black" className="text-[15px]" style={{ color: C.orangeDark }}>Premium member</Txt>
              <Txt weight="medium" className="mt-0.5 text-[12px] text-brand-muted">Unlimited Taras · early table access · bigger kadas</Txt>
            </View>
          </View>
        ) : (
          <View className="mx-5 mt-3 rounded-3xl border border-black/5 p-4">
            <Txt weight="black" className="text-[15px] text-brand-ink">Free plan</Txt>
            <Txt weight="medium" className="mt-0.5 text-[12px] text-brand-muted">
              2 stranger Taras left this month · unlimited with friends &amp; kada
            </Txt>
            <View className="mt-3">
              <PrimaryButton label="Go Premium · ₱149/mo" icon="sparkles" onPress={() => router.push('/premium')} />
            </View>
            <Txt weight="medium" className="mt-2 text-center text-[11px] text-brand-faint">
              Unlimited stranger Taras · early table access · bigger kadas
            </Txt>
          </View>
        )}

        <View className="mx-5 mt-8 flex-row items-center justify-between">
          <Txt weight="black" className="text-[16px] text-brand-ink">Interests</Txt>
          <Pressable onPress={() => router.push('/edit-profile')} className="active:opacity-70" accessibilityRole="button" accessibilityLabel="Edit interests">
            <Txt weight="bold" className="text-[13px] text-brand-blue">Edit</Txt>
          </Pressable>
        </View>
        <View className="mx-5 mt-3 flex-row flex-wrap gap-2">
          {interests.length === 0 ? (
            <Pressable onPress={() => router.push('/edit-profile')} className="rounded-full border border-dashed px-4 py-2 active:opacity-70" style={{ borderColor: C.line }}>
              <Txt weight="semibold" className="text-[13px] text-brand-muted">+ Add interests</Txt>
            </Pressable>
          ) : (
            interests.map((i) => (
              <View key={i} className="rounded-full border border-black/5 bg-brand-surface px-4 py-2">
                <Txt weight="semibold" className="text-[13px] text-brand-ink">{i}</Txt>
              </View>
            ))
          )}
        </View>

        <SettingsGroup className="mx-5 mt-8">
          <SettingsRow
            icon="albums-outline"
            color={C.orange}
            label="Your activity"
            sub="Joined plans, saved posts & reservations"
            onPress={() => router.push('/my-activity' as Href)}
          />
          <SettingsRow
            divider
            icon="people"
            color={C.violet}
            label="My Kadas"
            sub="Your barkada groups & public kadas to join"
            onPress={() => router.push('/kadas' as Href)}
          />
        </SettingsGroup>

        <Txt weight="black" className="mx-5 mt-8 text-[16px] text-brand-ink">Settings</Txt>
        <SettingsGroup className="mx-5 mt-3">
          {rows.map((s, i) => (
            <SettingsRow
              key={s.label}
              icon={s.icon}
              color={s.color}
              label={s.label}
              divider={i > 0}
              right={
                <View className="flex-row items-center">
                  {s.value ? <Txt weight="medium" className="mr-1 text-[12px] text-brand-muted">{s.value}</Txt> : null}
                  <Ionicons name="chevron-forward" size={16} color={C.faint} />
                </View>
              }
              onPress={() =>
                s.label === 'Verification'
                  ? router.push('/verify')
                  : s.label === 'Privacy'
                    ? router.push('/privacy')
                    : s.label === 'Notifications'
                      ? router.push('/notif-settings')
                      : s.label === 'Safety tools'
                        ? router.push('/safety')
                        : router.push('/help')
              }
            />
          ))}
        </SettingsGroup>

        <Pressable onPress={confirmSignOut} className="mt-8 items-center py-3 active:opacity-70">
          <Txt weight="semibold" className="text-[14px]" style={{ color: C.red }}>
            Sign out
          </Txt>
        </Pressable>
      </ScrollView>
    </View>
  );
}
