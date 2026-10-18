import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import type { ComponentProps } from 'react';
import { useState } from 'react';
import { Alert, Linking, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar } from '@/components/ui/kit';
import { useToast } from '@/components/ui/toast';
import { Txt } from '@/components/ui/txt';
import { C } from '@/lib/tokens';
import { useStore } from '@/store';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

// ponytail: local red gradient — no RED_GRADIENT token exists and this is the only screen that needs one.
const RED_GRADIENT = ['#FF7A6B', '#FF4D67', '#D92D4E'] as const;
const HAIRLINE = 'rgba(255,255,255,0.16)';
const HOLD_MS = 1500;

// Confirm-then-dial — real OS dialer, no fake toast.
const dial911 = () =>
  Alert.alert('Call 911?', undefined, [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Call', style: 'destructive', onPress: () => Linking.openURL('tel:911').catch(() => {}) },
  ]);

// Avatar circle with an initial fallback — off-app contacts (your Nanay) have no photo.
function ContactBubble({ name, avatar }: { name: string; avatar?: string }) {
  if (avatar) return <Avatar uri={avatar} size={46} ring="rgba(255,255,255,0.9)" />;
  return (
    <View
      className="items-center justify-center"
      style={{
        width: 50,
        height: 50,
        borderRadius: 999,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.9)',
        backgroundColor: 'rgba(255,255,255,0.25)',
      }}
    >
      <Txt weight="black" className="text-[18px] text-white">
        {name.charAt(0).toUpperCase()}
      </Txt>
    </View>
  );
}

export default function SosScreen() {
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const [sent, setSent] = useState(false);
  const contacts = useStore((s) => s.trustedContacts);
  const hasContacts = contacts.length > 0;
  const firstNames = contacts.map((c) => c.name.split(' ')[0]);
  const nameList =
    firstNames.length > 1 ? `${firstNames.slice(0, -1).join(', ')} & ${firstNames[firstNames.length - 1]}` : firstNames[0];

  const status: { icon: IoniconName; label: string }[] = [
    { icon: 'people', label: `Alerted ${nameList}` },
    { icon: 'location', label: 'Sharing your live location' },
  ];

  return (
    <View className="flex-1">
      <StatusBar style="light" />
      <LinearGradient colors={RED_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flex: 1 }}>
        <View style={{ flex: 1, paddingTop: insets.top + 8, paddingBottom: insets.bottom + 16 }}>
          {/* Header */}
          <View className="flex-row items-center justify-between px-5">
            <Pressable
              onPress={() => router.back()}
              className="h-10 w-10 items-center justify-center rounded-full active:opacity-80"
              style={{ backgroundColor: 'rgba(255,255,255,0.18)' }}
            >
              <Ionicons name="close" size={22} color={C.white} />
            </Pressable>
            <Txt weight="black" className="text-[16px] text-white">
              Emergency
            </Txt>
            <View className="h-10 w-10" />
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: 8 }}
          >
            <View className="items-center pt-6">
              <Txt weight="black" className="text-center text-[26px] text-white">
                {sent ? 'SOS sent' : 'Send an SOS'}
              </Txt>
              <Txt
                weight="medium"
                className="mt-2 text-center text-[13.5px] leading-[19px]"
                style={{ color: 'rgba(255,255,255,0.9)' }}
              >
                {sent
                  ? 'Help is being notified. Stay where you are if it feels safe.'
                  : 'This alerts your trusted contacts and shares your live location instantly.'}
              </Txt>
            </View>

            {/* Big circular button — hold to confirm, short tap just hints */}
            <View className="items-center py-8">
              <Pressable
                onPress={() => {
                  if (!sent && hasContacts) toast('Press and hold to send');
                }}
                onLongPress={() => {
                  if (!sent && hasContacts) setSent(true);
                }}
                delayLongPress={HOLD_MS}
                disabled={sent || !hasContacts}
                className="items-center justify-center"
                style={{ width: 216, height: 216, borderRadius: 999, opacity: hasContacts ? 1 : 0.45 }}
              >
                {({ pressed }) => (
                  <View
                    className="items-center justify-center"
                    style={{
                      width: 216,
                      height: 216,
                      borderRadius: 999,
                      backgroundColor: pressed && !sent ? 'rgba(255,255,255,0.34)' : 'rgba(255,255,255,0.16)',
                    }}
                  >
                    <View
                      className="items-center justify-center"
                      style={{
                        width: 168,
                        height: 168,
                        borderRadius: 999,
                        backgroundColor: C.white,
                        transform: [{ scale: pressed && !sent ? 0.94 : 1 }],
                      }}
                    >
                      <Ionicons name={sent ? 'checkmark' : 'alert'} size={64} color={C.red} />
                      <Txt weight="black" className="mt-1 text-[16px]" style={{ color: C.red }}>
                        {sent ? 'Sent' : 'Send SOS'}
                      </Txt>
                    </View>
                  </View>
                )}
              </Pressable>
              {!sent && hasContacts && (
                <Txt weight="semibold" className="mt-4 text-[13px]" style={{ color: 'rgba(255,255,255,0.9)' }}>
                  Press and hold to send
                </Txt>
              )}
            </View>

            {/* Status (after send) / trusted contacts or empty warning (before) */}
            {sent ? (
              <View className="rounded-3xl px-4 py-1" style={{ backgroundColor: 'rgba(255,255,255,0.14)' }}>
                {status.map((s, i) => (
                  <View
                    key={s.label}
                    className="flex-row items-center py-3"
                    style={i > 0 ? { borderTopWidth: 1, borderTopColor: HAIRLINE } : undefined}
                  >
                    <View
                      className="h-8 w-8 items-center justify-center rounded-full"
                      style={{ backgroundColor: 'rgba(255,255,255,0.22)' }}
                    >
                      <Ionicons name={s.icon} size={16} color={C.white} />
                    </View>
                    <Txt weight="semibold" className="ml-3 flex-1 text-[13.5px] text-white">
                      {s.label}
                    </Txt>
                    <Ionicons name="checkmark-circle" size={18} color={C.white} />
                  </View>
                ))}
                <Pressable
                  onPress={dial911}
                  accessibilityRole="button"
                  accessibilityLabel="Call 911"
                  className="flex-row items-center py-3 active:opacity-70"
                  style={{ borderTopWidth: 1, borderTopColor: HAIRLINE }}
                >
                  <View
                    className="h-8 w-8 items-center justify-center rounded-full"
                    style={{ backgroundColor: C.white }}
                  >
                    <Ionicons name="call" size={16} color={C.red} />
                  </View>
                  <Txt weight="bold" className="ml-3 flex-1 text-[13.5px] text-white">
                    Emergency? Call 911
                  </Txt>
                  <Ionicons name="chevron-forward" size={18} color={C.white} />
                </Pressable>
              </View>
            ) : hasContacts ? (
              <View className="items-center">
                <Txt weight="semibold" className="mb-3 text-[12.5px]" style={{ color: 'rgba(255,255,255,0.9)' }}>
                  Your trusted contacts
                </Txt>
                <View className="flex-row">
                  {contacts.slice(0, 5).map((c, i) => (
                    <View key={c.id} style={{ marginLeft: i === 0 ? 0 : -10 }}>
                      <ContactBubble name={c.name} avatar={c.avatar} />
                    </View>
                  ))}
                </View>
                <Txt weight="medium" className="mt-2 text-[12px]" style={{ color: 'rgba(255,255,255,0.85)' }}>
                  {nameList}
                </Txt>
              </View>
            ) : (
              <View className="rounded-3xl p-4" style={{ backgroundColor: 'rgba(255,255,255,0.14)' }}>
                <View className="flex-row items-center">
                  <Ionicons name="warning" size={18} color={C.white} />
                  <Txt weight="black" className="ml-2 flex-1 text-[14px] text-white">
                    No trusted contacts yet
                  </Txt>
                </View>
                <Txt weight="medium" className="mt-1.5 text-[12.5px] leading-[18px]" style={{ color: 'rgba(255,255,255,0.9)' }}>
                  Add your Nanay or your bestie first — SOS needs someone to reach.
                </Txt>
                <Pressable
                  onPress={() => router.push('/trusted-contacts')}
                  accessibilityRole="button"
                  accessibilityLabel="Add trusted contacts"
                  className="mt-3 items-center justify-center rounded-2xl bg-white py-3 active:opacity-90"
                >
                  <Txt weight="bold" className="text-[14px]" style={{ color: C.red }}>
                    Add trusted contacts
                  </Txt>
                </Pressable>
              </View>
            )}

            {/* Bottom action */}
            <View className="pt-6">
              <Pressable
                onPress={() => router.back()}
                className="items-center justify-center rounded-2xl bg-white py-4 active:opacity-90"
              >
                <Txt weight="bold" className="text-[16px]" style={{ color: C.red }}>
                  {sent ? "I'm safe now" : 'Cancel'}
                </Txt>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </LinearGradient>
    </View>
  );
}
