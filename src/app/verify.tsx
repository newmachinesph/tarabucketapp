import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, type ComponentProps } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PrimaryButton, ScreenHeader } from '@/components/ui/kit';
import { Txt } from '@/components/ui/txt';
import { useToast } from '@/components/ui/toast';
import { hSuccess } from '@/lib/haptics';
import { useStore } from '@/store';
import { BLUE_GRADIENT, C } from '@/lib/tokens';

type IoniconName = ComponentProps<typeof Ionicons>['name'];
type Status = 'done' | 'current';

type Step = { n: number; title: string; icon: IoniconName; desc: string; status: Status };

const STEPS: Step[] = [
  { n: 1, title: 'Browse', icon: 'eye', desc: 'No ID needed to look around', status: 'done' },
  { n: 2, title: 'Create & post', icon: 'chatbubbles', desc: 'Verify your phone number', status: 'done' },
  { n: 3, title: 'Join or host meetups', icon: 'card', desc: 'Liveness + government ID', status: 'current' },
];

function StepRow({ step, isLast, onVerify }: { step: Step; isLast: boolean; onVerify: () => void }) {
  const isDone = step.status === 'done';
  const accent = isDone ? C.green : C.orange;
  return (
    <View className="flex-row">
      <View className="items-center" style={{ width: 34 }}>
        <View className="h-8 w-8 items-center justify-center rounded-full" style={{ backgroundColor: accent }}>
          {isDone ? (
            <Ionicons name="checkmark" size={18} color={C.white} />
          ) : (
            <Txt weight="bold" className="text-[13px] text-white">
              {step.n}
            </Txt>
          )}
        </View>
        {!isLast && <View className="my-1 w-0.5 flex-1" style={{ backgroundColor: C.line }} />}
      </View>

      <View
        className="mb-3 ml-3 flex-1 flex-row items-center rounded-2xl border p-3.5"
        style={{
          borderColor: isDone ? C.line : C.orange,
          backgroundColor: isDone ? C.white : `${C.orange}0A`,
        }}
      >
        <View
          className="h-10 w-10 items-center justify-center rounded-full"
          style={{ backgroundColor: `${accent}1A` }}
        >
          <Ionicons name={step.icon} size={20} color={accent} />
        </View>
        <View className="ml-3 flex-1">
          <Txt weight="bold" className="text-[15px] text-brand-ink">
            {step.title}
          </Txt>
          <Txt weight="medium" className="mt-0.5 text-[12px] text-brand-muted">
            {step.desc}
          </Txt>
        </View>
        {isDone ? (
          <View className="flex-row items-center rounded-full px-2.5 py-1" style={{ backgroundColor: `${C.green}1A` }}>
            <Ionicons name="checkmark-circle" size={14} color={C.green} />
            <Txt weight="bold" className="ml-1 text-[11px]" style={{ color: C.green }}>
              Done
            </Txt>
          </View>
        ) : (
          <Pressable
            onPress={onVerify}
            className="rounded-full px-2.5 py-1 active:opacity-80"
            style={{ backgroundColor: C.orange }}
          >
            <Txt weight="bold" className="text-[11px] text-white">
              Verify now
            </Txt>
          </Pressable>
        )}
      </View>
    </View>
  );
}

function CheckRow({ label }: { label: string }) {
  return (
    <View className="flex-row items-center py-1.5">
      <View className="h-5 w-5 items-center justify-center rounded-full" style={{ backgroundColor: `${C.green}1A` }}>
        <Ionicons name="checkmark" size={13} color={C.green} />
      </View>
      <Txt weight="semibold" className="ml-2.5 text-[14px] text-brand-ink">
        {label}
      </Txt>
    </View>
  );
}

export default function VerifyScreen() {
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const verified = useStore((s) => s.me.verified);
  const updateProfile = useStore((s) => s.updateProfile);
  const signIn = useStore((s) => s.signIn);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const handleVerify = () => {
    toast('Verifying your ID…');
    timer.current = setTimeout(() => {
      updateProfile({ verified: true });
      signIn();
      hSuccess();
      toast('Verified ✓ You can now host meetups');
      router.replace('/onboarding');
    }, 1200);
  };

  if (verified) {
    return (
      <View className="flex-1 bg-white">
        <StatusBar style="dark" />
        <ScreenHeader title="Verification" />
        <View className="flex-1 items-center justify-center px-8">
          <View className="h-20 w-20 items-center justify-center rounded-full" style={{ backgroundColor: `${C.green}1A` }}>
            <Ionicons name="checkmark-circle" size={56} color={C.green} />
          </View>
          <Txt weight="black" className="mt-4 text-center text-[20px] text-brand-ink">
            You&rsquo;re verified ✓
          </Txt>
          <Txt weight="medium" className="mt-2 text-center text-[13px] leading-[19px] text-brand-muted">
            Your identity is confirmed — you can join and host meetups. No need to verify again.
          </Txt>
        </View>
        <View className="border-t px-5 pt-3" style={{ borderColor: C.line, paddingBottom: insets.bottom + 10 }}>
          <PrimaryButton label="Done" icon="checkmark" onPress={() => router.back()} />
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />

      <ScreenHeader title="Verification" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-5 pb-6">
        <View className="overflow-hidden rounded-3xl">
          <LinearGradient colors={BLUE_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <View className="items-center px-6 py-7">
              <View className="h-16 w-16 items-center justify-center rounded-full bg-white/20">
                <Ionicons name="shield-checkmark" size={48} color={C.white} />
              </View>
              <Txt weight="black" className="mt-3 text-center text-[19px] text-white">
                Keep every meetup real & safe
              </Txt>
            </View>
          </LinearGradient>
        </View>

        <View className="mt-6">
          {STEPS.map((s, i) => (
            <StepRow key={s.n} step={s} isLast={i === STEPS.length - 1} onVerify={handleVerify} />
          ))}
        </View>

        <View className="mt-3 rounded-3xl border p-4" style={{ borderColor: C.line }}>
          <Txt weight="black" className="text-[15px] text-brand-ink">
            What we check
          </Txt>
          <View className="mt-2">
            <CheckRow label="You're a real person" />
            <CheckRow label="You're a verified grown-up" />
          </View>
          <View className="my-3 h-px" style={{ backgroundColor: C.line }} />
          <View className="flex-row items-start">
            <Ionicons name="lock-closed" size={15} color={C.muted} style={{ marginTop: 2 }} />
            <Txt weight="medium" className="ml-2 flex-1 text-[12.5px] leading-[18px] text-brand-muted">
              We never store your ID photos or biometrics — verification is handled by our provider (Didit); we keep
              only the pass/fail result.
            </Txt>
          </View>
        </View>

        <View className="mt-5 items-center">
          <View className="flex-row items-center rounded-full px-3.5 py-2" style={{ backgroundColor: C.surface }}>
            <Ionicons name="time-outline" size={15} color={C.blue} />
            <Txt weight="semibold" className="ml-1.5 text-[12.5px] text-brand-ink">
              ~60 seconds · one-time
            </Txt>
          </View>
          <Txt weight="medium" className="mt-2 text-center text-[12px] text-brand-muted">
            Verification is always free — never behind Premium.
          </Txt>
        </View>
      </ScrollView>

      <View
        className="border-t px-5 pt-3"
        style={{ borderColor: C.line, paddingBottom: insets.bottom + 10 }}
      >
        <PrimaryButton label="Verify with ID" icon="shield-checkmark" onPress={handleVerify} />
        <Pressable
          className="mt-2.5 items-center py-1.5 active:opacity-70"
          accessibilityRole="button"
          accessibilityLabel="Maybe later"
          onPress={() => {
            signIn();
            router.replace('/onboarding');
          }}
        >
          <Txt weight="semibold" className="text-[13px] text-brand-muted">
            Maybe later
          </Txt>
        </Pressable>
      </View>
    </View>
  );
}
