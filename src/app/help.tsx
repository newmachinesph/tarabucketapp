import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import type { ComponentProps } from 'react';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { Input, ScreenHeader } from '@/components/ui/kit';
import { useToast } from '@/components/ui/toast';
import { Txt } from '@/components/ui/txt';
import { C } from '@/lib/tokens';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

const TOPICS: { icon: IoniconName; color: string; label: string; keywords: string; body: string }[] = [
  {
    icon: 'shield-checkmark',
    color: C.green,
    label: 'How verification works',
    keywords: 'id verify verification badge trust government selfie',
    body: 'Bago ka maka-join ng table, we check one government ID. Ang tinitingnan: photo match sa selfie mo, full name, at birthdate — hindi namin sine-save ang ID photo pagkatapos. Verified members get the green badge, para alam ng lahat na totoong tao ang kasama nila sa table.',
  },
  {
    icon: 'heart-circle',
    color: C.red,
    label: 'Staying safe at meetups',
    keywords: 'safety sos emergency hotline trusted contacts report block 911 117',
    body: 'May Emergency SOS sa Safety center — one tap and your trusted contacts get notified agad. Add sila sa Safety › Trusted contacts. PH hotlines na tap-to-call: 911 (Emergency) at 117 (PNP). Lahat ng Tara Tables ay sa vetted public venues — never mag-meet sa private na lugar sa first hangout.',
  },
  {
    icon: 'restaurant-outline',
    color: C.orange,
    label: 'How Tara Tables work',
    keywords: 'table refund cancel reserve seat 149 no-show venue',
    body: 'Reserve a seat for ₱149 — covers curation plus your vetted venue. Kapag nag-cancel ka, full refund until 24 h before the table; no-shows are non-refundable. Same policy na makikita mo sa checkout, walang gulat.',
  },
  {
    icon: 'wallet-outline',
    color: C.blue,
    label: 'Payments & Premium',
    keywords: 'pay payment gcash maya premium subscription 149 referral seat split',
    body: "Bayad via GCash or Maya (demo checkout — walang totoong charge). Premium is ₱149/mo: 3 free Tara Tables seats monthly plus priority booking. Referral-earned seats stack on top of Premium's 3 — capped at 6 free seats a month.",
  },
  {
    icon: 'people-outline',
    color: C.violet,
    label: 'Managing your kada',
    keywords: 'kada barkada group create join leave level admin',
    body: 'Ang kada ay ang barkada mo in-app. Create one from the Kada tab, or request to join — the admin approves. Tumataas ang kada level as you complete tables together, which unlocks perks. Pwede kang umalis anytime sa kada settings, walang hard feelings.',
  },
];

function ActionCard({
  icon,
  color,
  title,
  sub,
  onPress,
}: {
  icon: IoniconName;
  color: string;
  title: string;
  sub: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="mt-3 flex-row items-center rounded-3xl border p-4 active:opacity-70"
      style={{ borderColor: C.line }}
    >
      <View className="h-11 w-11 items-center justify-center rounded-full" style={{ backgroundColor: `${color}1A` }}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <View className="ml-3 flex-1">
        <Txt weight="bold" className="text-[15px] text-brand-ink">
          {title}
        </Txt>
        <Txt weight="medium" className="mt-0.5 text-[12px] text-brand-muted">
          {sub}
        </Txt>
      </View>
      <Ionicons name="chevron-forward" size={16} color={C.faint} />
    </Pressable>
  );
}

export default function HelpScreen() {
  const toast = useToast();
  const [query, setQuery] = useState('');
  const [openTopic, setOpenTopic] = useState<string | null>(null);

  const q = query.trim().toLowerCase();
  const shown = q ? TOPICS.filter((t) => `${t.label} ${t.keywords}`.toLowerCase().includes(q)) : TOPICS;

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />

      <ScreenHeader title="Help & support" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerClassName="px-5 pb-10"
      >
        <View className="mt-3 flex-row items-center rounded-full px-4 py-2" style={{ backgroundColor: C.surface }}>
          <Ionicons name="search-outline" size={18} color={C.faint} />
          <Input
            value={query}
            onChangeText={setQuery}
            placeholder="Search help articles"
            returnKeyType="search"
            accessibilityLabel="Search help articles"
            className="ml-2 flex-1 py-1.5 text-[14px]"
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')} accessibilityRole="button" accessibilityLabel="Clear search" className="active:opacity-70">
              <Ionicons name="close-circle" size={18} color={C.faint} />
            </Pressable>
          )}
        </View>

        <Txt weight="bold" className="mt-7 text-[12px] text-brand-faint" style={{ letterSpacing: 0.6 }}>
          POPULAR TOPICS
        </Txt>
        <View className="mt-2.5 overflow-hidden rounded-3xl border" style={{ borderColor: C.line }}>
          {shown.length === 0 ? (
            <View className="items-center px-4 py-8">
              <Txt weight="semibold" className="text-center text-[13px] text-brand-muted">
                {"Walang nahanap — try 'refund' or 'verify'"}
              </Txt>
            </View>
          ) : (
            shown.map((t, i) => {
              const isOpen = openTopic === t.label;
              return (
                <View key={t.label}>
                  {i > 0 && <View className="ml-16 h-px" style={{ backgroundColor: C.line }} />}
                  <Pressable
                    onPress={() => setOpenTopic(isOpen ? null : t.label)}
                    accessibilityRole="button"
                    accessibilityState={{ expanded: isOpen }}
                    className="flex-row items-center px-4 py-3.5 active:opacity-70"
                  >
                    <View
                      className="h-9 w-9 items-center justify-center rounded-full"
                      style={{ backgroundColor: `${t.color}1A` }}
                    >
                      <Ionicons name={t.icon} size={18} color={t.color} />
                    </View>
                    <Txt weight="semibold" className="ml-3 flex-1 text-[14px] text-brand-ink">
                      {t.label}
                    </Txt>
                    <Ionicons name={isOpen ? 'chevron-down' : 'chevron-forward'} size={16} color={C.faint} />
                  </Pressable>
                  {isOpen && (
                    <View className="pb-4 pl-16 pr-4">
                      <Txt weight="medium" className="text-[12.5px] text-brand-muted" style={{ lineHeight: 18 }}>
                        {t.body}
                      </Txt>
                    </View>
                  )}
                </View>
              );
            })
          )}
        </View>

        <Txt weight="bold" className="mt-7 text-[12px] text-brand-faint" style={{ letterSpacing: 0.6 }}>
          MORE HELP
        </Txt>
        <ActionCard
          icon="chatbubble-ellipses-outline"
          color={C.orange}
          title="Contact support"
          sub="Chat with our team · replies in ~1 hr (demo)"
          onPress={() => toast('Support chat opening…')}
        />
        <ActionCard
          icon="heart-circle"
          color={C.red}
          title="Safety center"
          sub="Report, block, and get help fast"
          onPress={() => router.push('/safety')}
        />
        <ActionCard
          icon="document-text-outline"
          color={C.blue}
          title="Community guidelines"
          sub="What keeps every table real and kind"
          onPress={() => router.push('/legal?doc=guidelines')}
        />

        <View className="mt-7 flex-row items-center justify-center">
          <Pressable onPress={() => router.push('/legal?doc=terms')} className="active:opacity-70">
            <Txt weight="semibold" className="text-[12.5px] text-brand-muted">
              Terms
            </Txt>
          </Pressable>
          <Txt weight="medium" className="mx-2 text-[12.5px] text-brand-faint">
            ·
          </Txt>
          <Pressable onPress={() => router.push('/legal?doc=privacy')} className="active:opacity-70">
            <Txt weight="semibold" className="text-[12.5px] text-brand-muted">
              Privacy Policy
            </Txt>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
