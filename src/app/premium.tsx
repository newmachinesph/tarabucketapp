import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/ui/kit';
import { useToast } from '@/components/ui/toast';
import { Txt } from '@/components/ui/txt';
import { hSuccess } from '@/lib/haptics';
import { useStore } from '@/store';
import { C, ORANGE_GRADIENT } from '@/lib/tokens';

type Reason = 'strangers' | 'tables';

const FEATURES: { label: string; tag?: Reason }[] = [
  { label: 'Tara Tables Pass — 3 curated seats / month included', tag: 'tables' },
  { label: 'Unlimited stranger Taras', tag: 'strangers' },
  { label: 'Early access to new Tara Tables', tag: 'tables' },
  { label: 'Bigger & more kadas' },
  { label: 'See who tapped Tara! first' },
  { label: 'Advanced discovery filters' },
  { label: 'Premium badge on your profile' },
];

const COMPARE = [
  { label: 'Stranger Taras', free: '2 / mo', premium: 'Unlimited' },
  { label: 'Tara Table seats', free: '₱149 each', premium: '3 / mo included*' },
  { label: 'Kada size', free: 'Up to 15', premium: 'Up to 50' },
  { label: "See who Tara'd you first", free: '✕', premium: '✓' },
] as const;

const PLANS = [
  { key: 'monthly', title: 'Monthly', price: '₱149', per: '/mo', note: '' },
  { key: 'annual', title: 'Annual', price: '₱1,490', per: '/yr', note: 'Save 2 months' },
] as const;

type PlanKey = (typeof PLANS)[number]['key'];

const PAY_METHODS = [
  { key: 'gcash', label: 'GCash', icon: 'wallet-outline' },
  { key: 'maya', label: 'Maya', icon: 'phone-portrait-outline' },
  { key: 'store', label: 'App Store / Google Play', icon: 'card-outline' },
] as const;

// Mock payment sheet — demo only, no real billing. Picking a method fakes a
// short "Processing…" pause, then flips isPremium via the normal store action.
function CheckoutSheet({ plan, onDone, onClose }: { plan: (typeof PLANS)[number]; onDone: () => void; onClose: () => void }) {
  const setPremium = useStore((s) => s.setPremium);
  const [stage, setStage] = useState<'pick' | 'processing' | 'success'>('pick');

  useEffect(() => {
    if (stage !== 'processing') return;
    const t = setTimeout(() => {
      setPremium(true);
      hSuccess();
      setStage('success');
    }, 1200);
    return () => clearTimeout(t);
  }, [stage, setPremium]);

  return (
    <View style={StyleSheet.absoluteFill} className="justify-end">
      <Pressable style={StyleSheet.absoluteFill} onPress={stage === 'pick' ? onClose : undefined} className="bg-black/40" />
      <View className="rounded-t-[28px] bg-white px-5 pb-8 pt-3">
        <View className="mb-4 items-center">
          <View className="h-1.5 w-10 rounded-full bg-black/10" />
        </View>

        {stage === 'pick' && (
          <>
            <Txt weight="black" className="text-[20px] text-brand-ink">
              Choose payment method
            </Txt>
            <Txt weight="medium" className="mt-0.5 text-[12.5px] text-brand-muted">
              Premium {plan.title} · {plan.price}
              {plan.per}
            </Txt>
            <View className="mt-4 gap-2.5">
              {PAY_METHODS.map((m) => (
                <Pressable
                  key={m.key}
                  onPress={() => setStage('processing')}
                  className="flex-row items-center rounded-2xl border p-4 active:opacity-80"
                  style={{ borderColor: C.line }}
                  accessibilityRole="button"
                  accessibilityLabel={`Pay with ${m.label}`}
                >
                  <View className="h-10 w-10 items-center justify-center rounded-full bg-brand-surface">
                    <Ionicons name={m.icon} size={20} color={C.ink} />
                  </View>
                  <Txt weight="bold" className="ml-3 flex-1 text-[15px] text-brand-ink">
                    {m.label}
                  </Txt>
                  <Ionicons name="chevron-forward" size={18} color={C.faint} />
                </Pressable>
              ))}
            </View>
            <View className="mt-4 flex-row items-center justify-center">
              <Ionicons name="information-circle-outline" size={14} color={C.faint} />
              <Txt weight="semibold" className="ml-1 text-[11.5px] text-brand-faint">
                Demo checkout — no charge
              </Txt>
            </View>
          </>
        )}

        {stage === 'processing' && (
          <View className="items-center py-10">
            <ActivityIndicator color={C.orange} />
            <Txt weight="bold" className="mt-4 text-[16px] text-brand-ink">
              Processing…
            </Txt>
            <Txt weight="medium" className="mt-1 text-[12px] text-brand-muted">
              Demo checkout — no charge
            </Txt>
          </View>
        )}

        {stage === 'success' && (
          <View className="items-center py-4">
            <Txt style={{ fontSize: 44 }}>🎉✨🎉</Txt>
            <Txt weight="black" className="mt-3 text-[20px] text-brand-ink">
              Welcome to Premium ⭐
            </Txt>
            <Txt weight="medium" className="mt-1 text-center text-[13px] text-brand-muted">
              Unlimited stranger Taras + 3 table seats a month, unlocked. Tara na!
            </Txt>
            <View className="mt-6 w-full">
              <PrimaryButton label="Sige, let's go" emoji="🎉" onPress={onDone} />
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

export default function PremiumScreen() {
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const isPremium = useStore((s) => s.isPremium);
  const { reason } = useLocalSearchParams<{ reason?: string }>();
  const [plan, setPlan] = useState<PlanKey>('annual');
  const [showCheckout, setShowCheckout] = useState(false);

  // Context-aware ordering: the perk that brought the user here floats to the top.
  const features = useMemo(() => {
    if (reason !== 'strangers' && reason !== 'tables') return FEATURES;
    return [...FEATURES.filter((f) => f.tag === reason), ...FEATURES.filter((f) => f.tag !== reason)];
  }, [reason]);

  const selectedPlan = PLANS.find((p) => p.key === plan) ?? PLANS[0];

  // Already subscribed — thank-you + active perks, no paywall/checkout.
  if (isPremium) {
    return (
      <View className="flex-1 bg-white">
        <StatusBar style="light" />
        <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="pb-8">
          <LinearGradient colors={ORANGE_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ paddingTop: insets.top + 8 }}>
            <View className="px-5 pb-8">
              <View className="flex-row justify-end">
                <Pressable
                  onPress={() => router.back()}
                  className="h-10 w-10 items-center justify-center rounded-full active:opacity-80"
                  style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                >
                  <Ionicons name="close" size={22} color={C.white} />
                </Pressable>
              </View>
              <View className="items-center pt-2">
                <View className="h-16 w-16 items-center justify-center rounded-2xl bg-white/20">
                  <Ionicons name="star" size={34} color={C.white} />
                </View>
                <Txt weight="black" className="mt-3 text-center text-[26px] text-white">
                  You&apos;re Premium ✨
                </Txt>
                <Txt weight="medium" className="mt-1.5 text-center text-[13.5px]" style={{ color: 'rgba(255,255,255,0.92)' }}>
                  Salamat! Tuloy ang gala — no limits.
                </Txt>
              </View>
            </View>
          </LinearGradient>

          <Txt weight="black" className="mx-5 mt-8 text-[16px] text-brand-ink">
            Your active perks
          </Txt>
          <View className="mx-5 mt-3 gap-3">
            {FEATURES.map((f) => (
              <View key={f.label} className="flex-row items-center">
                <Ionicons name="checkmark-circle" size={22} color={C.green} />
                <Txt weight="semibold" className="ml-3 flex-1 text-[14px] text-brand-ink">
                  {f.label}
                </Txt>
              </View>
            ))}
          </View>
        </ScrollView>

        <View className="border-t border-black/5 px-5 pt-3" style={{ paddingBottom: insets.bottom + 12 }}>
          <PrimaryButton label="Manage subscription" icon="settings-outline" onPress={() => toast('Opening subscription settings…')} />
          <Txt weight="medium" className="mt-2 text-center text-[11px] text-brand-muted">
            Billed via App Store / Google Play. Cancel anytime.
          </Txt>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="light" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="pb-8">
        {/* Hero */}
        <LinearGradient
          colors={ORANGE_GRADIENT}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ paddingTop: insets.top + 8 }}
        >
          <View className="px-5 pb-8">
            <View className="flex-row justify-end">
              <Pressable
                onPress={() => router.back()}
                className="h-10 w-10 items-center justify-center rounded-full active:opacity-80"
                style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
              >
                <Ionicons name="close" size={22} color={C.white} />
              </Pressable>
            </View>
            <View className="items-center pt-2">
              <View className="h-16 w-16 items-center justify-center rounded-2xl bg-white/20">
                <Ionicons name="star" size={34} color={C.white} />
              </View>
              <Txt weight="black" className="mt-3 text-center text-[26px] text-white">
                Tara Bucket Premium
              </Txt>
              <Txt weight="medium" className="mt-1.5 text-center text-[13.5px]" style={{ color: 'rgba(255,255,255,0.92)' }}>
                Go out more. Meet more people. No limits.
              </Txt>
            </View>
          </View>
        </LinearGradient>

        {/* Context banner — why the user landed here */}
        {reason === 'strangers' && (
          <View
            className="mx-5 mt-5 flex-row items-center rounded-3xl border p-4"
            style={{ backgroundColor: `${C.orange}0D`, borderColor: `${C.orange}26` }}
          >
            <View className="h-9 w-9 items-center justify-center rounded-full" style={{ backgroundColor: `${C.orange}1A` }}>
              <Ionicons name="flash" size={18} color={C.orange} />
            </View>
            <Txt weight="medium" className="ml-3 flex-1 text-[13px] text-brand-ink" style={{ lineHeight: 19 }}>
              You&apos;ve used your 2 free stranger Taras this month. Premium makes them unlimited — tuloy ang gala.
            </Txt>
          </View>
        )}
        {reason === 'tables' && (
          <View
            className="mx-5 mt-5 flex-row items-center rounded-3xl border p-4"
            style={{ backgroundColor: `${C.orange}0D`, borderColor: `${C.orange}26` }}
          >
            <View className="h-9 w-9 items-center justify-center rounded-full" style={{ backgroundColor: `${C.orange}1A` }}>
              <Ionicons name="restaurant" size={18} color={C.orange} />
            </View>
            <Txt weight="medium" className="ml-3 flex-1 text-[13px] text-brand-ink" style={{ lineHeight: 19 }}>
              Love Tara Tables? Premium includes 3 curated seats every month — ₱447 worth, sulit agad.
            </Txt>
          </View>
        )}

        {/* Plan toggle */}
        <View className="mx-5 mt-6 flex-row gap-3">
          {PLANS.map((p) => {
            const active = p.key === plan;
            return (
              <Pressable
                key={p.key}
                onPress={() => setPlan(p.key)}
                className="flex-1 rounded-3xl border-2 p-4 active:opacity-90"
                style={{ borderColor: active ? C.orange : C.line, backgroundColor: active ? `${C.orange}0A` : C.white }}
              >
                <View className="flex-row items-center justify-between">
                  <Txt weight="bold" className="text-[14px] text-brand-ink">
                    {p.title}
                  </Txt>
                  <View
                    className="h-5 w-5 items-center justify-center rounded-full border-2"
                    style={{ borderColor: active ? C.orange : C.faint }}
                  >
                    {active ? <View className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: C.orange }} /> : null}
                  </View>
                </View>
                <View className="mt-3 flex-row items-end">
                  <Txt weight="black" className="text-[22px] text-brand-ink">
                    {p.price}
                  </Txt>
                  <Txt weight="semibold" className="mb-0.5 ml-0.5 text-[12px] text-brand-muted">
                    {p.per}
                  </Txt>
                </View>
                {p.note ? (
                  <View className="mt-2 self-start rounded-full px-2 py-1" style={{ backgroundColor: `${C.green}1A` }}>
                    <Txt weight="bold" className="text-[10.5px]" style={{ color: C.green }}>
                      {p.note}
                    </Txt>
                  </View>
                ) : null}
              </Pressable>
            );
          })}
        </View>

        {/* Features */}
        <Txt weight="black" className="mx-5 mt-8 text-[16px] text-brand-ink">
          Everything you get
        </Txt>
        <View className="mx-5 mt-3 gap-3">
          {features.map((f) => {
            const emphasized = f.tag != null && f.tag === reason;
            return (
              <View key={f.label} className="flex-row items-center">
                <Ionicons name={emphasized ? 'star' : 'checkmark-circle'} size={22} color={emphasized ? C.orange : C.green} />
                <Txt weight={emphasized ? 'bold' : 'semibold'} className="ml-3 flex-1 text-[14px] text-brand-ink">
                  {f.label}
                </Txt>
              </View>
            );
          })}
        </View>

        {/* Free vs Premium */}
        <Txt weight="black" className="mx-5 mt-8 text-[16px] text-brand-ink">
          Free vs Premium
        </Txt>
        <View className="mx-5 mt-3 overflow-hidden rounded-3xl border" style={{ borderColor: C.line }}>
          <View className="flex-row items-center px-4 py-3" style={{ backgroundColor: C.surface }}>
            <View className="flex-1" />
            <Txt weight="bold" className="w-[84px] text-center text-[12px] text-brand-muted">
              Free
            </Txt>
            <Txt weight="bold" className="w-[100px] text-center text-[12px]" style={{ color: C.orange }}>
              Premium
            </Txt>
          </View>
          {COMPARE.map((row, i) => (
            <View key={row.label}>
              {i > 0 && <View className="h-px" style={{ backgroundColor: C.line }} />}
              <View className="flex-row items-center px-4 py-3">
                <Txt weight="semibold" className="flex-1 text-[12.5px] text-brand-ink">
                  {row.label}
                </Txt>
                <Txt weight="medium" className="w-[84px] text-center text-[12px] text-brand-muted">
                  {row.free}
                </Txt>
                <Txt weight="bold" className="w-[100px] text-center text-[12px]" style={{ color: C.orangeDark }}>
                  {row.premium}
                </Txt>
              </View>
            </View>
          ))}
        </View>
        <Txt weight="medium" className="mx-5 mt-2 text-[11px] text-brand-faint" style={{ lineHeight: 15 }}>
          * Referral-earned seats stack on top of Premium&apos;s 3 monthly seats — capped at 6 free seats a month.
        </Txt>
      </ScrollView>

      {/* Sticky bottom */}
      <View className="border-t border-black/5 px-5 pt-3" style={{ paddingBottom: insets.bottom + 12 }}>
        <PrimaryButton label="Start Premium" icon="star" onPress={() => setShowCheckout(true)} />
        <Pressable className="mt-2.5 items-center py-1.5 active:opacity-70" onPress={() => toast('Restoring purchases…')}>
          <Txt weight="semibold" className="text-[13px] text-brand-blue">
            Restore purchases
          </Txt>
        </Pressable>
        <Txt weight="medium" className="mt-1 text-center text-[11px] text-brand-muted">
          Billed via App Store / Google Play. Cancel anytime.
        </Txt>
      </View>

      {showCheckout && (
        <CheckoutSheet
          plan={selectedPlan}
          onClose={() => setShowCheckout(false)}
          onDone={() => {
            setShowCheckout(false);
            router.back();
          }}
        />
      )}
    </View>
  );
}
