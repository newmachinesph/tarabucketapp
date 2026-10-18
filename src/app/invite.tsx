import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Linking, Pressable, ScrollView, Share, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar, ScreenHeader, SectionHeader } from '@/components/ui/kit';
import { Txt } from '@/components/ui/txt';
import { useToast } from '@/components/ui/toast';
import { PEOPLE } from '@/data/mock';
import { C } from '@/lib/tokens';
import { useStore } from '@/store';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

const LINK = 'tarabucket.app/j/maya';

// Same Taglish voice as refer.tsx's share message.
const INVITE_TEXT = `Tara, sali ka sa Tara Bucket! 🥳 Dito kami nagpaplano ng mga lakad at Tara Tables ng barkada. Sali na: https://${LINK}`;

// PH channel priority: Messenger, SMS, Viber, WhatsApp.
const SHARE: { icon: IoniconName; label: string }[] = [
  { icon: 'logo-facebook', label: 'Messenger' },
  { icon: 'chatbubble', label: 'SMS' },
  { icon: 'call', label: 'Viber' },
  { icon: 'logo-whatsapp', label: 'WhatsApp' },
];

export default function InviteScreen() {
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const invitedIds = useStore((s) => s.invitedIds);
  const toggleInvited = useStore((s) => s.toggleInvited);

  // ponytail: Messenger/Viber/WhatsApp all go through the OS share sheet — per-app
  // deep links (fb-messenger://, viber://) are out of demo scope.
  const shareVia = async () => {
    try {
      await Share.share({ message: INVITE_TEXT });
    } catch {
      toast('Hindi ma-open ang share sheet');
    }
  };

  const shareSms = async () => {
    try {
      await Linking.openURL(`sms:?body=${encodeURIComponent(INVITE_TEXT)}`);
    } catch {
      toast('Hindi ma-open ang SMS app — try another channel');
    }
  };

  return (
    <View className="flex-1 bg-white">
      <ScreenHeader title="Invite" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 24, paddingTop: 8 }}
      >
        {/* Share link card */}
        <View className="mx-5 rounded-3xl border border-black/5 p-4">
          <Txt weight="bold" className="text-[13px] text-brand-ink">
            Your invite link
          </Txt>
          <View className="mt-3 flex-row items-center">
            <View
              className="flex-1 flex-row items-center rounded-2xl px-4 py-3"
              style={{ backgroundColor: C.surface }}
            >
              <Ionicons name="link" size={16} color={C.muted} />
              <Txt weight="semibold" className="ml-2 text-[13px] text-brand-ink" numberOfLines={1}>
                {LINK}
              </Txt>
            </View>
            <Pressable
              onPress={async () => {
                try {
                  await Share.share({ message: `https://${LINK}` });
                  toast('Link copied 📋');
                } catch {
                  toast('Hindi ma-open ang share sheet');
                }
              }}
              className="ml-2 flex-row items-center rounded-2xl px-4 py-3 active:opacity-80"
              style={{ backgroundColor: C.ink }}
            >
              <Ionicons name="copy" size={15} color={C.white} />
              <Txt weight="bold" className="ml-1.5 text-[13px] text-white">
                Copy
              </Txt>
            </Pressable>
          </View>
        </View>

        {/* Share options */}
        <View className="mt-5 flex-row justify-between px-8">
          {SHARE.map((s) => (
            <Pressable
              key={s.label}
              onPress={s.label === 'SMS' ? shareSms : shareVia}
              accessibilityRole="button"
              accessibilityLabel={`Share invite via ${s.label}`}
              className="items-center active:opacity-70"
            >
              <View
                className="h-14 w-14 items-center justify-center rounded-full"
                style={{ backgroundColor: C.surface }}
              >
                <Ionicons name={s.icon} size={24} color={C.ink} />
              </View>
              <Txt weight="medium" className="mt-1.5 text-[11px] text-brand-muted">
                {s.label}
              </Txt>
            </Pressable>
          ))}
        </View>

        {/* Contacts */}
        <View className="mt-7">
          <SectionHeader title="Your contacts" />
          <View className="mt-3">
            {PEOPLE.map((p) => {
              const isInvited = invitedIds.includes(p.id);
              return (
                <View
                  key={p.id}
                  className="mx-5 mb-2 flex-row items-center rounded-2xl border border-black/5 p-3"
                >
                  <Avatar uri={p.avatar} size={44} />
                  <View className="ml-3 flex-1">
                    <Txt weight="bold" className="text-[14px] text-brand-ink">
                      {p.name}
                    </Txt>
                    <Txt weight="medium" className="text-[12px] text-brand-muted">
                      @{p.handle}
                    </Txt>
                  </View>
                  <Pressable
                    onPress={() => toggleInvited(p.id)}
                    accessibilityRole="button"
                    accessibilityLabel={isInvited ? `Uninvite ${p.name}` : `Invite ${p.name}`}
                    className="rounded-full px-4 py-2 active:opacity-80"
                    style={{ backgroundColor: isInvited ? C.surface : C.ink }}
                  >
                    {isInvited ? (
                      <View className="flex-row items-center">
                        <Ionicons name="checkmark" size={14} color={C.green} />
                        <Txt weight="bold" className="ml-1 text-[13px]" style={{ color: C.green }}>
                          Invited
                        </Txt>
                      </View>
                    ) : (
                      <Txt weight="bold" className="text-[13px] text-white">
                        Invite
                      </Txt>
                    )}
                  </Pressable>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
