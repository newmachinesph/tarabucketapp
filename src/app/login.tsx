import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { Input, PrimaryButton, ScreenHeader } from '@/components/ui/kit';
import { useToast } from '@/components/ui/toast';
import { Txt } from '@/components/ui/txt';
import { hSuccess } from '@/lib/haptics';
import { useStore } from '@/store';
import { C } from '@/lib/tokens';

// ponytail: demo auth — any 4-digit code signs you in, no backend.
export default function LoginScreen() {
  const toast = useToast();
  const signIn = useStore((s) => s.signIn);
  const [num, setNum] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');

  const sendCode = () => {
    if (!num.trim()) {
      toast('Enter your number first');
      return;
    }
    setStep('otp');
    toast('Code sent via SMS');
  };

  const confirmCode = () => {
    if (code.trim().length !== 4) {
      toast('Enter the 4-digit code');
      return;
    }
    hSuccess();
    signIn();
    router.replace('/(tabs)/tara');
  };

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />
      <ScreenHeader title="Welcome back" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-5 pb-10" keyboardShouldPersistTaps="handled">
        <Txt weight="regular" className="mt-2 text-[15px] leading-[22px] text-brand-muted">
          Sign in with your phone number — balik lakad na tayo.
        </Txt>

        {step === 'phone' ? (
          <>
            <Txt weight="bold" className="mt-7 text-[12px] text-brand-faint" style={{ letterSpacing: 0.6 }}>PHONE NUMBER</Txt>
            <View className="mt-2.5 flex-row items-center gap-2">
              <View className="flex-row items-center rounded-2xl border px-3 py-3" style={{ borderColor: C.line }}>
                <Txt weight="semibold" className="text-[15px] text-brand-ink">🇵🇭 +63</Txt>
              </View>
              <Input
                value={num}
                onChangeText={setNum}
                placeholder="917 000 0000"
                keyboardType="phone-pad"
                className="flex-1 rounded-2xl border px-4 py-3 text-[15px]"
                style={{ borderColor: C.line }}
              />
            </View>
            <View className="mt-5">
              <PrimaryButton label="Send code" icon="chatbubble-ellipses" onPress={sendCode} />
            </View>
          </>
        ) : (
          <>
            <Txt weight="bold" className="mt-7 text-[12px] text-brand-faint" style={{ letterSpacing: 0.6 }}>ENTER THE 4-DIGIT CODE</Txt>
            <Txt weight="medium" className="mt-1.5 text-[12.5px] text-brand-muted">
              We texted a code to +63 {num.trim()}.
            </Txt>
            <Input
              weight="bold"
              value={code}
              onChangeText={setCode}
              placeholder="••••"
              keyboardType="number-pad"
              maxLength={4}
              className="mt-2.5 rounded-2xl border px-4 py-3 text-center text-[22px]"
              style={{ borderColor: C.line, letterSpacing: 12 }}
            />
            <View className="mt-5">
              <PrimaryButton label="Verify & sign in" icon="log-in" onPress={confirmCode} />
            </View>
            <Pressable
              onPress={() => toast('Code re-sent via SMS')}
              className="mt-2.5 items-center py-1.5 active:opacity-70"
              accessibilityRole="button"
              accessibilityLabel="Resend code"
            >
              <Txt weight="semibold" className="text-[13px] text-brand-blue">Resend code</Txt>
            </Pressable>
          </>
        )}

        <View className="mt-6 flex-row items-start rounded-2xl px-4 py-3" style={{ backgroundColor: C.surface }}>
          <Ionicons name="flask-outline" size={14} color={C.muted} style={{ marginTop: 2 }} />
          <Txt weight="medium" className="ml-2 flex-1 text-[12px] leading-[17px] text-brand-muted">
            Demo mode — any code works.
          </Txt>
        </View>
      </ScrollView>
    </View>
  );
}
