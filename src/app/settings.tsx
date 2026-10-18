import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import type { ComponentProps } from 'react';
import { Alert, Pressable, ScrollView, View } from 'react-native';

import { IconChip, ScreenHeader, SettingsGroup, SettingsRow } from '@/components/ui/kit';
import { useToast } from '@/components/ui/toast';
import { Txt } from '@/components/ui/txt';
import { C } from '@/lib/tokens';
import { useStore } from '@/store';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

// Right-aligned value text + chevron for account rows that surface a status.
function ValueRight({ value, valueColor }: { value: string; valueColor?: string }) {
  return (
    <View className="flex-row items-center">
      <Txt weight="semibold" className="mr-1 text-[12.5px]" style={{ color: valueColor ?? C.muted }}>
        {value}
      </Txt>
      <Ionicons name="chevron-forward" size={16} color={C.faint} />
    </View>
  );
}

// Destructive row: red icon chip + red label, no chevron. Kit's SettingsRow keeps the label ink,
// so these stay local.
function DangerRow({ icon, label, onPress, divider }: { icon: IoniconName; label: string; onPress: () => void; divider?: boolean }) {
  return (
    <View>
      {divider && <View className="ml-16 h-px" style={{ backgroundColor: C.line }} />}
      <Pressable onPress={onPress} className="flex-row items-center px-4 py-3.5 active:opacity-70" accessibilityRole="button" accessibilityLabel={label}>
        <IconChip name={icon} color={C.red} />
        <Txt weight="semibold" className="ml-3 flex-1 text-[14px]" style={{ color: C.red }}>
          {label}
        </Txt>
      </Pressable>
    </View>
  );
}

export default function SettingsScreen() {
  const toast = useToast();
  const isPremium = useStore((s) => s.isPremium);
  const verified = useStore((s) => s.me.verified);
  const signOut = useStore((s) => s.signOut);
  const resetDemo = useStore((s) => s.resetDemo);

  // State now survives reloads, so the demo needs an explicit way back to a clean slate —
  // otherwise you can't re-run the pitch without reinstalling.
  const confirmReset = () =>
    Alert.alert('Reset demo data?', 'Wipes everything you tapped and reseeds the sample plans, kadas, and buckets.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset',
        style: 'destructive',
        onPress: () => {
          resetDemo();
          router.replace('/welcome');
        },
      },
    ]);

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

  const confirmDelete = () =>
    Alert.alert('Delete account?', 'This permanently removes your profile, buckets, plans, and kadas.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Continue',
        style: 'destructive',
        onPress: () =>
          Alert.alert('Are you sure?', 'This cannot be undone.', [
            { text: 'Keep my account', style: 'cancel' },
            {
              text: 'Delete forever',
              style: 'destructive',
              onPress: () => {
                signOut();
                toast('Account deletion requested — processed within 30 days');
                router.replace('/welcome');
              },
            },
          ]),
      },
    ]);

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />

      <ScreenHeader title="Settings" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="pb-10">
        <SettingsGroup title="ACCOUNT" className="mx-5 mt-6">
          <SettingsRow icon="create-outline" color={C.blue} label="Edit profile" onPress={() => router.push('/edit-profile')} />
          <SettingsRow
            divider
            icon="shield-checkmark"
            color={C.green}
            label="Verification"
            right={<ValueRight value={verified ? 'Verified' : 'Unverified'} valueColor={verified ? C.green : undefined} />}
            onPress={() => router.push('/verify')}
          />
          <SettingsRow
            divider
            icon="call-outline"
            color={C.violet}
            label="Phone number"
            right={<ValueRight value="+63 917 ••••" />}
            onPress={() => router.push('/phone')}
          />
        </SettingsGroup>

        <SettingsGroup title="PREFERENCES" className="mx-5 mt-6">
          <SettingsRow icon="notifications-outline" color={C.orange} label="Notifications" onPress={() => router.push('/notif-settings')} />
          <SettingsRow divider icon="lock-closed-outline" color={C.ink} label="Privacy" onPress={() => router.push('/privacy')} />
          <SettingsRow divider icon="location-outline" color={C.blue} label="Location & discovery" onPress={() => router.push('/discovery-settings')} />
          <SettingsRow divider icon="options-outline" color={C.violet} label="App preferences" onPress={() => router.push('/preferences')} />
        </SettingsGroup>

        <SettingsGroup title="MEMBERSHIP" className="mx-5 mt-6">
          <SettingsRow
            icon="sparkles"
            color={C.orange}
            label="Tara Bucket Premium"
            right={<ValueRight value={isPremium ? 'Premium' : 'Free plan'} valueColor={isPremium ? C.orange : undefined} />}
            onPress={() => router.push('/premium')}
          />
          <SettingsRow divider icon="gift-outline" color={C.green} label="Invite friends · free seats" onPress={() => router.push('/refer')} />
        </SettingsGroup>

        <SettingsGroup title="SUPPORT" className="mx-5 mt-6">
          <SettingsRow icon="heart-circle" color={C.red} label="Safety tools" onPress={() => router.push('/safety')} />
          <SettingsRow divider icon="help-circle-outline" color={C.muted} label="Help & support" onPress={() => router.push('/help')} />
          <SettingsRow divider icon="document-text-outline" color={C.muted} label="About & legal" onPress={() => router.push('/about')} />
        </SettingsGroup>

        <SettingsGroup title="DEMO" className="mx-5 mt-6">
          <SettingsRow icon="refresh-outline" color={C.violet} label="Reset demo data" onPress={confirmReset} />
        </SettingsGroup>

        <SettingsGroup className="mx-5 mt-6">
          <DangerRow icon="log-out-outline" label="Log out" onPress={confirmSignOut} />
          <DangerRow icon="trash-outline" label="Delete account" onPress={confirmDelete} divider />
        </SettingsGroup>

        <Txt weight="medium" className="mt-6 text-center text-[12px] text-brand-faint">
          Tara Bucket! · v1.0.0 (build 42)
        </Txt>
      </ScrollView>
    </View>
  );
}
