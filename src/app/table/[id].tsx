import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar, AvatarStack, NotFound, PrimaryButton } from '@/components/ui/kit';
import { useToast } from '@/components/ui/toast';
import { Txt } from '@/components/ui/txt';
import { catColor, catEmoji, catLabel, PEOPLE, type Table } from '@/data/mock';
import { hSuccess } from '@/lib/haptics';
import { C } from '@/lib/tokens';
import { useStore } from '@/store';

const HERO_HEIGHT = 280;

const EXPECT = [
  'A table of 6 verified strangers who bucketed the same craving',
  'Icebreakers to get the conversation going — no awkward silence',
  'Split the bill at the venue, Tara stays out of payments',
  'Share your live location with a trusted contact any time',
];

// Loose cuisine/menu preview derived from the table's title/category — demo copy only.
const menuChips = (t: Table): string[] => {
  const title = t.title.toLowerCase();
  if (title.includes('korean') || title.includes('bbq')) return ['Samgyup set', 'Unli sides', 'Soju rounds'];
  if (title.includes('ramen')) return ['Tonkotsu bowls', 'Gyoza to share', '3-stop crawl'];
  if (title.includes('wine')) return ['Cheese boards', 'Red & white flights', 'Rooftop views'];
  if (title.includes('coffee')) return ['Cupping flight', 'Pour-over bar', 'Pastry pairing'];
  if (title.includes('street food')) return ['Isaw & kwek-kwek', 'Fishball stops', '5-stop tour'];
  if (t.category === 'food') return ["Chef's picks", 'Shareable plates', 'Dessert round'];
  return ['Snacks provided', 'Drinks nearby', 'Good vibes guaranteed'];
};

const REVIEWS = [
  { id: 'u_bea', name: 'Bea', stars: 5, text: 'Sobrang solid ng venue pick — hidden gem talaga. Smooth from reserve to seat.' },
  { id: 'u_migs', name: 'Migs', stars: 5, text: 'Went solo, umuwi may 5 bagong kaibigan. Yung icebreakers, nakaka-good vibes 😄' },
  { id: 'u_kaye', name: 'Kaye', stars: 4, text: 'Worth the ₱149, promise. Curated na, walang no-show sa table namin.' },
] as const;

const REVIEW_AVG = '4.8';

const PAY_METHODS = [
  { key: 'gcash', label: 'GCash', icon: 'wallet-outline' },
  { key: 'maya', label: 'Maya', icon: 'phone-portrait-outline' },
  { key: 'card', label: 'Credit / Debit Card', icon: 'card-outline' },
] as const;

type PayMethod = (typeof PAY_METHODS)[number]['key'];

// Mock checkout — demo only, no real payment. Confirming fakes a short
// "Processing…" pause, then hands off to the normal reserveSeat store action.
function CheckoutSheet({ table, onConfirm, onClose }: { table: Table; onConfirm: () => void; onClose: () => void }) {
  const [method, setMethod] = useState<PayMethod>('gcash');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!processing) return;
    const t = setTimeout(onConfirm, 1100);
    return () => clearTimeout(t);
  }, [processing, onConfirm]);

  return (
    <View style={StyleSheet.absoluteFill} className="justify-end">
      <Pressable style={StyleSheet.absoluteFill} onPress={processing ? undefined : onClose} className="bg-black/40" />
      <View className="rounded-t-[28px] bg-white px-5 pb-8 pt-3">
        <View className="mb-4 items-center">
          <View className="h-1.5 w-10 rounded-full bg-black/10" />
        </View>

        {processing ? (
          <View className="items-center py-10">
            <ActivityIndicator color={C.orange} />
            <Txt weight="bold" className="mt-4 text-[16px] text-brand-ink">
              Processing…
            </Txt>
            <Txt weight="medium" className="mt-1 text-[12px] text-brand-muted">
              Demo checkout — no charge
            </Txt>
          </View>
        ) : (
          <>
            <Txt weight="black" className="text-[20px] text-brand-ink">
              Reserve your seat
            </Txt>
            <Txt weight="medium" className="mt-0.5 text-[12.5px] text-brand-muted">
              {table.emoji} {table.title} · ₱149 per seat
            </Txt>
            <View className="mt-4 gap-2.5">
              {PAY_METHODS.map((m) => {
                const active = m.key === method;
                return (
                  <Pressable
                    key={m.key}
                    onPress={() => setMethod(m.key)}
                    className="flex-row items-center rounded-2xl border-2 p-4 active:opacity-80"
                    style={{ borderColor: active ? C.orange : C.line, backgroundColor: active ? `${C.orange}0A` : C.white }}
                    accessibilityRole="button"
                    accessibilityLabel={`Pay with ${m.label}`}
                    accessibilityState={{ selected: active }}
                  >
                    <View className="h-10 w-10 items-center justify-center rounded-full bg-brand-surface">
                      <Ionicons name={m.icon} size={20} color={C.ink} />
                    </View>
                    <Txt weight="bold" className="ml-3 flex-1 text-[15px] text-brand-ink">
                      {m.label}
                    </Txt>
                    <View className="h-5 w-5 items-center justify-center rounded-full border-2" style={{ borderColor: active ? C.orange : C.faint }}>
                      {active ? <View className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: C.orange }} /> : null}
                    </View>
                  </Pressable>
                );
              })}
            </View>
            <Txt weight="medium" className="mt-3 text-center text-[11.5px] text-brand-muted" style={{ lineHeight: 16 }}>
              Full refund until 24 h before the table · no-shows non-refundable
            </Txt>
            <View className="mt-3">
              <PrimaryButton label="Pay ₱149 · Reserve seat" icon="lock-closed" onPress={() => setProcessing(true)} />
            </View>
            <View className="mt-3 flex-row items-center justify-center">
              <Ionicons name="information-circle-outline" size={14} color={C.faint} />
              <Txt weight="semibold" className="ml-1 text-[11.5px] text-brand-faint">
                Demo checkout — no charge
              </Txt>
            </View>
          </>
        )}
      </View>
    </View>
  );
}

export default function TableDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const tables = useStore((s) => s.tables);
  const reservedTableIds = useStore((s) => s.reservedTableIds);
  const reserveSeat = useStore((s) => s.reserveSeat);
  const cancelSeat = useStore((s) => s.cancelSeat);
  const isPremium = useStore((s) => s.isPremium);
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const [showCheckout, setShowCheckout] = useState(false);
  const table = tables.find((t) => t.id === id);
  if (!table) return <NotFound label="Table" />;

  const confirmReserve = () => {
    setShowCheckout(false);
    reserveSeat(table.id);
    hSuccess();
    toast('Seat reserved — confirm 1 hr before ✓');
  };

  const color = catColor(table.category);
  const reserved = reservedTableIds.includes(table.id);
  const seated = PEOPLE.slice(0, table.seats - table.seatsLeft);

  return (
    <View className="flex-1 bg-white">
      <Pressable
        onPress={() => router.back()}
        style={{ position: 'absolute', top: insets.top + 6, left: 16, zIndex: 20 }}
        className="h-10 w-10 items-center justify-center rounded-full bg-black/35 active:opacity-80"
      >
        <Ionicons name="chevron-back" size={22} color="#fff" />
      </Pressable>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 210 }}>
        {/* Hero */}
        <View style={{ height: HERO_HEIGHT }}>
          <Image source={{ uri: table.image }} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} />
          <LinearGradient
            colors={['rgba(14,23,38,0.35)', 'transparent', 'rgba(14,23,38,0.55)', 'rgba(14,23,38,0.96)']}
            locations={[0, 0.32, 0.62, 1]}
            style={StyleSheet.absoluteFill}
          />

          <View style={{ position: 'absolute', top: insets.top + 6, right: 16 }}>
            <View className="flex-row items-center rounded-full px-3 py-1.5" style={{ backgroundColor: color }}>
              <Txt className="mr-1 text-xs">{catEmoji(table.category)}</Txt>
              <Txt weight="bold" className="text-[11px] text-white">
                {catLabel(table.category)}
              </Txt>
            </View>
          </View>

          <View className="absolute inset-x-0 bottom-0 px-5 pb-5">
            <Txt weight="black" className="text-white" style={{ fontSize: 26, lineHeight: 30 }}>
              {table.emoji} {table.title}
            </Txt>
            <View className="mt-2 flex-row items-center">
              <Ionicons name="time-outline" size={14} color="rgba(255,255,255,0.85)" />
              <Txt weight="medium" className="ml-1 text-[13px] text-white/85">
                {table.when} · {table.area}
              </Txt>
            </View>
          </View>
        </View>

        {/* Seats summary */}
        <View className="mx-5 mt-5 flex-row items-center justify-between rounded-3xl border border-black/5 p-4">
          <View className="flex-row items-center">
            <View className="h-11 w-11 items-center justify-center rounded-full bg-brand-surface">
              <Ionicons name="restaurant-outline" size={20} color={C.orange} />
            </View>
            <View className="ml-3">
              <Txt weight="bold" className="text-[16px] text-brand-ink">
                {table.seatsLeft} of {table.seats} seats left
              </Txt>
              <Txt weight="medium" className="text-[12px] text-brand-muted">
                Table of {table.seats} · everyone ID-verified
              </Txt>
            </View>
          </View>
          <View
            className="rounded-full px-3 py-1.5"
            style={{ backgroundColor: table.seatsLeft <= 1 ? `${C.red}1A` : `${C.green}1A` }}
          >
            <Txt weight="bold" className="text-[11px]" style={{ color: table.seatsLeft <= 1 ? C.red : C.green }}>
              {table.seatsLeft <= 1 ? 'Almost full' : 'Seats open'}
            </Txt>
          </View>
        </View>

        {/* Who's seated */}
        <View className="mx-5 mt-3 rounded-3xl border border-black/5 p-4">
          <Txt weight="black" className="text-[16px] text-brand-ink">
            Who&apos;s seated
          </Txt>
          <View className="mt-3 flex-row items-center">
            <AvatarStack uris={seated.map((p) => p.avatar)} size={36} max={5} />
            <Txt weight="medium" className="ml-3 flex-1 text-[13px] text-brand-muted">
              {seated.length} seated · verified strangers
            </Txt>
          </View>
        </View>

        {/* On the menu */}
        <View className="mx-5 mt-3 rounded-3xl border border-black/5 p-4">
          <Txt weight="black" className="text-[16px] text-brand-ink">
            On the menu
          </Txt>
          <View className="mt-3 flex-row flex-wrap gap-2">
            {menuChips(table).map((chip) => (
              <View key={chip} className="rounded-full bg-brand-surface px-3 py-1.5">
                <Txt weight="semibold" className="text-[12px] text-brand-ink">
                  {chip}
                </Txt>
              </View>
            ))}
          </View>
        </View>

        {/* What to expect */}
        <View className="mx-5 mt-3 rounded-3xl border border-black/5 p-4">
          <Txt weight="black" className="text-[16px] text-brand-ink">
            What to expect
          </Txt>
          <View className="mt-3 gap-3">
            {EXPECT.map((line) => (
              <View key={line} className="flex-row items-start">
                <Ionicons name="checkmark-circle" size={18} color={C.green} style={{ marginTop: 1 }} />
                <Txt weight="medium" className="ml-2.5 flex-1 text-[13px] text-brand-ink" style={{ lineHeight: 19 }}>
                  {line}
                </Txt>
              </View>
            ))}
          </View>
        </View>

        {/* What past guests say */}
        <View className="mx-5 mt-3 rounded-3xl border border-black/5 p-4">
          <View className="flex-row items-center justify-between">
            <Txt weight="black" className="text-[16px] text-brand-ink">
              What past guests say
            </Txt>
            <View className="flex-row items-center rounded-full px-2.5 py-1" style={{ backgroundColor: `${C.orange}1A` }}>
              <Ionicons name="star" size={12} color={C.orange} />
              <Txt weight="bold" className="ml-1 text-[11px]" style={{ color: C.orangeDark }}>
                {REVIEW_AVG}
              </Txt>
            </View>
          </View>
          <View className="mt-3 gap-3">
            {REVIEWS.map((r) => {
              const avatar = PEOPLE.find((p) => p.id === r.id)?.avatar;
              return (
                <View key={r.id} className="flex-row items-start">
                  {avatar ? <Avatar uri={avatar} size={32} /> : null}
                  <View className="ml-2.5 flex-1">
                    <View className="flex-row items-center">
                      <Txt weight="bold" className="text-[13px] text-brand-ink">
                        {r.name}
                      </Txt>
                      <View className="ml-2 flex-row items-center">
                        {Array.from({ length: 5 }, (_, i) => (
                          <Ionicons key={i} name={i < r.stars ? 'star' : 'star-outline'} size={11} color={C.orange} />
                        ))}
                      </View>
                    </View>
                    <Txt weight="medium" className="mt-0.5 text-[12.5px] text-brand-muted" style={{ lineHeight: 18 }}>
                      {r.text}
                    </Txt>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Vetted venue note */}
        <View
          className="mx-5 mt-3 flex-row items-center rounded-3xl border p-4"
          style={{ backgroundColor: `${C.blue}0D`, borderColor: `${C.blue}26` }}
        >
          <View className="h-9 w-9 items-center justify-center rounded-full" style={{ backgroundColor: `${C.blue}1A` }}>
            <Ionicons name="shield-checkmark" size={18} color={C.blue} />
          </View>
          <Txt weight="medium" className="ml-3 flex-1 text-[13px] text-brand-muted" style={{ lineHeight: 19 }}>
            Vetted venue — revealed when you&apos;re seated.
          </Txt>
        </View>
      </ScrollView>

      {/* Sticky bottom bar */}
      <View
        className="absolute inset-x-0 bottom-0 border-t border-black/5 bg-white px-5 pt-3"
        style={{ paddingBottom: insets.bottom + 10 }}
      >
        {/* Reserve your seat — pricing */}
        <View className="mb-3 flex-row items-center rounded-2xl border border-black/5 p-3">
          <View className="h-9 w-9 items-center justify-center rounded-full bg-brand-surface">
            <Ionicons name="pricetag-outline" size={18} color={C.orange} />
          </View>
          <View className="ml-3 flex-1">
            <View className="flex-row items-baseline">
              <Txt weight="black" className="text-[16px] text-brand-ink">
                {isPremium ? 'Free' : '₱149'}
              </Txt>
              <Txt weight="medium" className="ml-1 text-[12px] text-brand-muted">
                {isPremium ? 'with your Tara Tables Pass' : 'per seat · or free with Tara Tables Pass'}
              </Txt>
            </View>
            <Txt weight="medium" className="text-[11px] text-brand-muted" style={{ lineHeight: 15 }}>
              Covers curation + your vetted venue. Full refund until 24 h before the table · no-shows non-refundable.
            </Txt>
          </View>
          <Ionicons name="shield-checkmark" size={16} color={C.green} />
        </View>

        <PrimaryButton
          label={reserved ? 'Seat reserved ✓ · tap to cancel' : isPremium ? 'Reserve seat · free' : 'Reserve seat · ₱149'}
          icon={reserved ? 'checkmark-done-circle' : 'checkmark-circle'}
          onPress={() => {
            if (reserved) {
              cancelSeat(table.id);
              toast('Reservation cancelled — full refund ✓');
              return;
            }
            if (isPremium) {
              // Pass covers the seat — no checkout needed.
              confirmReserve();
              return;
            }
            setShowCheckout(true);
          }}
        />
        {!isPremium && (
          <Pressable
            className="mt-2 items-center py-1 active:opacity-70"
            onPress={() => router.push({ pathname: '/premium', params: { reason: 'tables' } })}
          >
            <Txt weight="semibold" className="text-[12px] text-brand-blue">
              Get the Tara Tables Pass
            </Txt>
          </Pressable>
        )}
      </View>

      {showCheckout && <CheckoutSheet table={table} onConfirm={confirmReserve} onClose={() => setShowCheckout(false)} />}
    </View>
  );
}
