import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import type { ComponentProps } from 'react';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, View } from 'react-native';

import { Avatar, Chip, IconChip, ScreenHeader, SettingsGroup, SettingsRow, Switch } from '@/components/ui/kit';
import { useToast } from '@/components/ui/toast';
import { Txt } from '@/components/ui/txt';
import { PEOPLE } from '@/data/mock';
import { C } from '@/lib/tokens';
import { useStore, type Privacy, type Visibility } from '@/store';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

const VISIBILITY: Visibility[] = ['Public', 'Kada-only', 'Private'];

type ToggleKey = 'showTrustScore' | 'discoverable' | 'readReceipts' | 'shareActivity';

const TOGGLES: { key: ToggleKey; icon: IoniconName; color: string; label: string; sub: string }[] = [
  { key: 'showTrustScore', icon: 'shield-checkmark', color: C.green, label: 'Show my show-up score', sub: 'How reliably you show up to meetups' },
  { key: 'discoverable', icon: 'sparkles', color: C.orange, label: 'Discoverable in Tara deck', sub: 'Appear when strangers swipe nearby' },
  { key: 'readReceipts', icon: 'checkmark-done-outline', color: C.blue, label: 'Show read receipts', sub: 'Let kada see when you have read a chat' },
  { key: 'shareActivity', icon: 'megaphone-outline', color: C.violet, label: 'Share activity to feed', sub: 'Post joined plans to your followers' },
];

export default function PrivacyScreen() {
  const toast = useToast();

  const privacy = useStore((s) => s.privacy);
  const setPrivacy = useStore((s) => s.setPrivacy);
  const blockedIds = useStore((s) => s.blockedIds);
  const unblockUser = useStore((s) => s.unblockUser);
  const signOut = useStore((s) => s.signOut);
  const [showBlocked, setShowBlocked] = useState(false);

  const confirmDelete = () =>
    Alert.alert('Delete my data?', 'This permanently removes your profile, buckets, plans, and kadas.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Continue',
        style: 'destructive',
        onPress: () =>
          Alert.alert('Are you sure?', 'This cannot be undone.', [
            { text: 'Keep my data', style: 'cancel' },
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

  const visibility = privacy.visibility;
  const setVisibility = (v: Visibility) => setPrivacy({ visibility: v });
  const setToggle = <K extends ToggleKey,>(key: K, v: Privacy[K]) => setPrivacy({ [key]: v } as Partial<Privacy>);

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />

      <ScreenHeader title="Privacy" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-5 pb-10">
        <Txt weight="bold" className="mt-4 text-[12px] text-brand-faint" style={{ letterSpacing: 0.6 }}>
          PROFILE VISIBILITY
        </Txt>
        <View className="mt-2.5 flex-row gap-2">
          {VISIBILITY.map((v) => (
            <Chip key={v} label={v} active={visibility === v} onPress={() => setVisibility(v)} />
          ))}
        </View>
        <Txt weight="medium" className="mt-2.5 text-[12px] text-brand-muted">
          {visibility === 'Public'
            ? 'Anyone on Tara Bucket can find and view your profile.'
            : visibility === 'Kada-only'
              ? 'Only your kada and people you have met can see your full profile.'
              : 'You are hidden — only people you message can see your profile.'}
        </Txt>

        <SettingsGroup title="WHAT OTHERS SEE" className="mt-7">
          {TOGGLES.map((t, i) => (
            <SettingsRow
              key={t.key}
              icon={t.icon}
              color={t.color}
              label={t.label}
              sub={t.sub}
              right={<Switch value={privacy[t.key]} onValueChange={(v) => setToggle(t.key, v)} />}
              divider={i > 0}
            />
          ))}
        </SettingsGroup>

        <View className="mt-4 overflow-hidden rounded-3xl border" style={{ borderColor: C.line }}>
          <Pressable
            onPress={() => (blockedIds.length === 0 ? toast('No blocked users') : setShowBlocked((v) => !v))}
            className="flex-row items-center px-4 py-3.5 active:opacity-70"
            accessibilityRole="button"
            accessibilityLabel={`Blocked users, ${blockedIds.length}`}
          >
            <View className="h-9 w-9 items-center justify-center rounded-full" style={{ backgroundColor: `${C.red}1A` }}>
              <Ionicons name="ban-outline" size={18} color={C.red} />
            </View>
            <Txt weight="semibold" className="ml-3 flex-1 text-[14px] text-brand-ink">
              Blocked users
            </Txt>
            <Txt weight="semibold" className="mr-1 text-[12.5px] text-brand-muted">
              {blockedIds.length}
            </Txt>
            <Ionicons
              name={blockedIds.length > 0 && showBlocked ? 'chevron-down' : 'chevron-forward'}
              size={16}
              color={C.faint}
            />
          </Pressable>
          {showBlocked &&
            blockedIds.map((id) => {
              const p = PEOPLE.find((x) => x.id === id);
              if (!p) return null;
              return (
                <View key={id}>
                  <View className="ml-16 h-px" style={{ backgroundColor: C.line }} />
                  <View className="flex-row items-center px-4 py-3">
                    <Avatar uri={p.avatar} size={34} />
                    <Txt weight="semibold" className="ml-3 flex-1 text-[13.5px] text-brand-ink">
                      {p.name}
                    </Txt>
                    <Pressable
                      onPress={() => {
                        unblockUser(id);
                        toast(`${p.name} unblocked`);
                      }}
                      className="rounded-full px-3 py-1.5 active:opacity-80"
                      style={{ backgroundColor: `${C.red}1A` }}
                      accessibilityRole="button"
                      accessibilityLabel={`Unblock ${p.name}`}
                    >
                      <Txt weight="bold" className="text-[12px]" style={{ color: C.red }}>
                        Unblock
                      </Txt>
                    </Pressable>
                  </View>
                </View>
              );
            })}
        </View>

        <SettingsGroup title="YOUR DATA" className="mt-7">
          <SettingsRow
            icon="download-outline"
            color={C.blue}
            label="Download my data"
            onPress={() => toast("We'll email your data within 48 hrs — demo")}
          />
          <View className="ml-16 h-px" style={{ backgroundColor: C.line }} />
          <Pressable
            onPress={confirmDelete}
            className="flex-row items-center px-4 py-3.5 active:opacity-70"
            accessibilityRole="button"
            accessibilityLabel="Delete my data"
          >
            <IconChip name="trash-outline" color={C.red} />
            <Txt weight="semibold" className="ml-3 flex-1 text-[14px]" style={{ color: C.red }}>
              Delete my data
            </Txt>
          </Pressable>
        </SettingsGroup>

        <View className="mt-5 flex-row items-start rounded-2xl px-4 py-3.5" style={{ backgroundColor: C.surface }}>
          <Ionicons name="lock-closed" size={15} color={C.muted} style={{ marginTop: 2 }} />
          <Txt weight="medium" className="ml-2.5 flex-1 text-[12px] leading-[17px] text-brand-muted">
            Tara Bucket is for verified grown-ups. In line with RA 10173 (Data Privacy Act), we collect only what a meetup needs —
            you can hide or delete your data anytime.
          </Txt>
        </View>
      </ScrollView>
    </View>
  );
}
