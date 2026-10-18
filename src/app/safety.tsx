import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Alert, Linking, Pressable, ScrollView, Switch, View } from 'react-native';

import { ScreenHeader, SettingsRow } from '@/components/ui/kit';
import { useToast } from '@/components/ui/toast';
import { Txt } from '@/components/ui/txt';
import { C } from '@/lib/tokens';
import { useStore } from '@/store';

// Confirm-then-dial — real OS dialer, no fake toast.
const dial = (number: string) =>
  Alert.alert(`Call ${number}?`, undefined, [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Call', style: 'destructive', onPress: () => Linking.openURL(`tel:${number}`).catch(() => {}) },
  ]);

export default function SafetyScreen() {
  const toast = useToast();
  const shareLiveLocation = useStore((s) => s.shareLiveLocation);
  const setShareLiveLocation = useStore((s) => s.setShareLiveLocation);
  const trustedContacts = useStore((s) => s.trustedContacts);
  const blockedIds = useStore((s) => s.blockedIds);

  const firstName = trustedContacts[0]?.name.split(' ')[0];
  const others = trustedContacts.length - 1;
  const liveLocationSub = firstName
    ? `Shared with ${firstName}${others > 0 ? ` + ${others} other${others === 1 ? '' : 's'}` : ''} while you're on a plan`
    : 'Add a trusted contact to enable';

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />

      <ScreenHeader title="Safety" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-5 pb-10 pt-1">
        {/* SOS card */}
        <Pressable
          onPress={() => router.push('/sos')}
          className="flex-row items-center rounded-3xl border p-4 active:opacity-90"
          style={{ backgroundColor: `${C.red}0F`, borderColor: `${C.red}2E` }}
        >
          <View className="h-14 w-14 items-center justify-center rounded-2xl" style={{ backgroundColor: C.red }}>
            <Ionicons name="alert-circle" size={30} color={C.white} />
          </View>
          <View className="ml-3.5 flex-1">
            <Txt weight="black" className="text-[17px]" style={{ color: C.red }}>
              Emergency SOS
            </Txt>
            <Txt weight="medium" className="mt-0.5 text-[12.5px] text-brand-muted">
              Alert your contacts & share your location fast
            </Txt>
          </View>
          <Ionicons name="chevron-forward" size={20} color={C.red} />
        </Pressable>

        {/* Reassurance */}
        <View className="mt-4 rounded-3xl p-4" style={{ backgroundColor: `${C.green}12` }}>
          <View className="flex-row items-center">
            <Ionicons name="shield-checkmark" size={18} color={C.green} />
            <Txt weight="black" className="ml-2 text-[14px]" style={{ color: C.green }}>
              You&apos;re never solo on Tara
            </Txt>
          </View>
          <Txt weight="medium" className="mt-2 text-[12.5px] leading-[18px] text-brand-muted">
            Meetups are group-first and always at vetted venues — and a real human response team is on standby, never a
            bot.
          </Txt>
        </View>

        {/* Controls */}
        <Txt weight="black" className="mt-6 text-[16px] text-brand-ink">
          Safety controls
        </Txt>
        <View className="mt-3 overflow-hidden rounded-3xl border border-black/5">
          <SettingsRow
            icon="location"
            color={C.blue}
            label="Share live location"
            sub={liveLocationSub}
            right={
              <Switch
                value={shareLiveLocation}
                onValueChange={(v) => {
                  setShareLiveLocation(v);
                  toast(v ? 'Live location on' : 'Live location off');
                }}
                trackColor={{ false: C.line, true: C.green }}
                thumbColor={C.white}
              />
            }
          />
          <View className="ml-16 h-px bg-black/5" />
          <SettingsRow
            icon="people"
            color={C.violet}
            label={`Trusted contacts (${trustedContacts.length})`}
            sub="Notified the moment you send an SOS"
            onPress={() => router.push('/trusted-contacts')}
          />
          <View className="ml-16 h-px bg-black/5" />
          <SettingsRow icon="flag" color={C.orange} label="Report a problem" onPress={() => router.push('/report')} />
          <View className="ml-16 h-px bg-black/5" />
          <SettingsRow
            icon="ban"
            color={C.muted}
            label={`Blocked users (${blockedIds.length})`}
            onPress={() =>
              blockedIds.length > 0 ? router.push('/privacy') : toast('No blocked users yet')
            }
          />
          <View className="ml-16 h-px bg-black/5" />
          <SettingsRow
            icon="bulb"
            color={C.blue}
            label="Safety tips"
            onPress={() => toast('Meet in public · tell a kada · trust your gut')}
          />
        </View>

        {/* Emergency hotlines */}
        <Txt weight="black" className="mt-6 text-[16px] text-brand-ink">
          In an emergency
        </Txt>
        <Txt weight="medium" className="mt-1 text-[12.5px] text-brand-muted">
          Philippine hotlines — tap to call.
        </Txt>
        <View className="mt-3 overflow-hidden rounded-3xl border border-black/5">
          <SettingsRow
            icon="call"
            color={C.red}
            label="Emergency (911)"
            sub="Police · fire · medical"
            onPress={() => dial('911')}
          />
          <View className="ml-16 h-px bg-black/5" />
          <SettingsRow
            icon="call"
            color={C.blue}
            label="PNP hotline (117)"
            sub="Philippine National Police"
            onPress={() => dial('117')}
          />
        </View>
      </ScrollView>
    </View>
  );
}
