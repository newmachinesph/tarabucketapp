import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import type { ComponentProps } from 'react';
import { ScrollView, View } from 'react-native';

import { IconChip, ScreenHeader, SettingsGroup, SettingsRow, Switch } from '@/components/ui/kit';
import { Txt } from '@/components/ui/txt';
import { C } from '@/lib/tokens';
import { useStore, type NotifKey } from '@/store';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

type NotifRow = { key: NotifKey; icon: IoniconName; color: string; label: string; locked?: boolean };
type NotifGroup = { title: string; rows: NotifRow[] };

const GROUPS: NotifGroup[] = [
  {
    title: 'ACTIVITY',
    rows: [
      { key: 'kadaInvites', icon: 'people-outline', color: C.blue, label: 'Kada invites' },
      { key: 'taraTap', icon: 'flame-outline', color: C.orange, label: 'Someone taps Tara!' },
      { key: 'newTables', icon: 'restaurant-outline', color: C.violet, label: 'New Tara Tables' },
    ],
  },
  {
    title: 'REMINDERS',
    rows: [
      { key: 'doubleConfirm', icon: 'checkmark-circle-outline', color: C.green, label: 'Double-confirm reminders' },
      { key: 'planUpdates', icon: 'calendar-outline', color: C.blue, label: 'Plan updates' },
    ],
  },
  {
    title: 'SAFETY',
    rows: [{ key: 'safetyAlerts', icon: 'shield-checkmark', color: C.red, label: 'Safety alerts', locked: true }],
  },
  {
    title: 'SOCIAL',
    rows: [
      { key: 'likesReceipts', icon: 'heart-outline', color: C.red, label: 'Likes & receipts' },
      { key: 'newFollowers', icon: 'person-add-outline', color: C.violet, label: 'New followers' },
    ],
  },
  {
    title: 'OTHER',
    rows: [{ key: 'productNews', icon: 'megaphone-outline', color: C.muted, label: 'Product news' }],
  },
];

// The "always on" locked variant carries an icon+text sub-label that kit's plain-string `sub` can't
// express, so it stays local.
function LockedRow({ row, value, divider }: { row: NotifRow; value: boolean; divider: boolean }) {
  return (
    <View>
      {divider && <View className="ml-16 h-px" style={{ backgroundColor: C.line }} />}
      <View className="flex-row items-center px-4 py-3.5">
        <IconChip name={row.icon} color={row.color} />
        <View className="ml-3 flex-1 pr-2">
          <Txt weight="semibold" className="text-[14px] text-brand-ink">
            {row.label}
          </Txt>
          <View className="mt-0.5 flex-row items-center">
            <Ionicons name="lock-closed" size={11} color={C.faint} />
            <Txt weight="medium" className="ml-1 text-[11.5px] text-brand-faint">
              always on
            </Txt>
          </View>
        </View>
        <Switch value={value} disabled />
      </View>
    </View>
  );
}

export default function NotifSettingsScreen() {
  const state = useStore((s) => s.notifPrefs);
  const setNotifPref = useStore((s) => s.setNotifPref);

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />

      <ScreenHeader title="Notifications" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-5 pb-10">
        {GROUPS.map((group) => (
          <SettingsGroup key={group.title} title={group.title} className="mt-6">
            {group.rows.map((row, i) =>
              row.locked ? (
                <LockedRow key={row.key} row={row} value={state[row.key]} divider={i > 0} />
              ) : (
                <SettingsRow
                  key={row.key}
                  divider={i > 0}
                  icon={row.icon}
                  color={row.color}
                  label={row.label}
                  right={<Switch value={state[row.key]} onValueChange={(v) => setNotifPref(row.key, v)} />}
                />
              ),
            )}
          </SettingsGroup>
        ))}
      </ScrollView>
    </View>
  );
}
