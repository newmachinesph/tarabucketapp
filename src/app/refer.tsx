import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Pressable, ScrollView, Share, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar, IconButton, PrimaryButton } from '@/components/ui/kit';
import { useToast } from '@/components/ui/toast';
import { Txt } from '@/components/ui/txt';
import { PEOPLE } from '@/data/mock';
import { C, ORANGE_GRADIENT } from '@/lib/tokens';
import { useStore } from '@/store';

const GOAL = 5;
const JOINED = 2;

export default function ReferScreen() {
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const me = useStore((s) => s.me);
  const code = `${me.handle.replace(/[^a-z0-9]/gi, '').slice(0, 6).toUpperCase()}-TARA`;
  const invites = PEOPLE.slice(1, 5).map((p, i) => ({ person: p, joined: i < JOINED }));

  const shareInvite = async () => {
    try {
      await Share.share({
        message: `Tara, sali ka sa Tara Bucket! 🥳 Gamitin mo yung code ko na ${code} pag sign-up — libre tayong dalawa ng Tara Tables seat (worth ₱149 each). Sali na: https://tarabucket.app/i/${code}`,
      });
    } catch {
      toast('Hindi ma-open ang share sheet');
    }
  };

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="light" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="pb-10">
        <LinearGradient colors={ORANGE_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ paddingTop: insets.top + 6 }}>
          <View className="px-5 pb-7">
            <View className="flex-row">
              <IconButton name="chevron-back" diameter={40} size={22} color={C.white} bg="rgba(255,255,255,0.2)" accessibilityLabel="Go back" onPress={() => router.back()} />
            </View>
            <View className="items-center pt-2">
              <View className="h-16 w-16 items-center justify-center rounded-2xl bg-white/20">
                <Txt style={{ fontSize: 34 }}>🤝</Txt>
              </View>
              <Txt weight="black" className="mt-3 text-center text-[26px] text-white">Tara, sali ka!</Txt>
              <Txt weight="medium" className="mt-1.5 text-center text-[13.5px]" style={{ color: 'rgba(255,255,255,0.92)' }}>
                Invite a friend — you both get a{'\n'}free Tara Tables seat (₱149 each).
              </Txt>
            </View>
          </View>
        </LinearGradient>

        {/* Code */}
        <View className="mx-5 mt-5 rounded-3xl border p-4" style={{ borderColor: C.line }}>
          <Txt weight="bold" className="text-[12px] text-brand-faint" style={{ letterSpacing: 0.6 }}>YOUR INVITE CODE</Txt>
          <View className="mt-2 flex-row items-center">
            <View className="flex-1 rounded-2xl border border-dashed py-3.5" style={{ borderColor: `${C.orange}66`, backgroundColor: `${C.orange}0A` }}>
              <Txt weight="black" className="text-center text-[22px]" style={{ color: C.orangeDark, letterSpacing: 2 }}>{code}</Txt>
            </View>
            <Pressable
              onPress={async () => {
                try {
                  await Share.share({ message: code });
                  toast('Code copied ✓');
                } catch {
                  toast('Hindi ma-open ang share sheet');
                }
              }}
              className="ml-2 h-12 w-12 items-center justify-center rounded-2xl active:opacity-80"
              style={{ backgroundColor: C.surface }}
              accessibilityRole="button"
              accessibilityLabel="Copy invite code"
            >
              <Ionicons name="copy-outline" size={20} color={C.ink} />
            </Pressable>
          </View>
        </View>

        <View className="mx-5 mt-3">
          <PrimaryButton label="Share invite" icon="share-social" onPress={shareInvite} />
        </View>

        {/* Progress */}
        <View className="mx-5 mt-6">
          <View className="flex-row items-center justify-between">
            <Txt weight="black" className="text-[16px] text-brand-ink">Your free seats</Txt>
            <Txt weight="bold" className="text-[13px]" style={{ color: C.orange }}>{JOINED}/{GOAL} joined</Txt>
          </View>
          <View className="mt-2.5 h-2.5 w-full overflow-hidden rounded-full bg-brand-surface">
            <View className="h-2.5 rounded-full" style={{ width: `${(JOINED / GOAL) * 100}%`, backgroundColor: C.orange }} />
          </View>
          <Txt weight="medium" className="mt-2 text-[12.5px] text-brand-muted">
            Every friend who joins = 1 free seat for both of you. {JOINED} claimed so far.
          </Txt>
          <Txt weight="medium" className="mt-1.5 text-[11px] text-brand-faint" style={{ lineHeight: 15 }}>
            Referral-earned seats stack on top of Premium&apos;s 3 monthly seats — capped at 6 free seats a month.
          </Txt>
        </View>

        {/* Invites */}
        <Txt weight="black" className="mx-5 mt-6 text-[16px] text-brand-ink">People you invited</Txt>
        <View className="mx-5 mt-3 gap-2.5">
          {invites.map(({ person, joined }) => (
            <View key={person.id} className="flex-row items-center rounded-2xl border p-3" style={{ borderColor: C.line }}>
              <Avatar uri={person.avatar} size={40} />
              <Txt weight="bold" className="ml-3 flex-1 text-[14px] text-brand-ink">{person.name}</Txt>
              {joined ? (
                <View className="flex-row items-center rounded-full px-2.5 py-1" style={{ backgroundColor: `${C.green}1A` }}>
                  <Ionicons name="checkmark-circle" size={13} color={C.green} />
                  <Txt weight="bold" className="ml-1 text-[11px]" style={{ color: C.green }}>Joined</Txt>
                </View>
              ) : (
                <Pressable onPress={() => toast(`Reminder sent to ${person.name.split(' ')[0]} ✓`)} className="rounded-full px-3 py-1.5 active:opacity-80" style={{ backgroundColor: C.surface }} accessibilityRole="button" accessibilityLabel={`Remind ${person.name}`}>
                  <Txt weight="bold" className="text-[11px] text-brand-ink">Nudge</Txt>
                </Pressable>
              )}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
