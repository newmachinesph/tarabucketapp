import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { Chip, Input, PrimaryButton, ScreenHeader } from '@/components/ui/kit';
import { useToast } from '@/components/ui/toast';
import { Txt } from '@/components/ui/txt';
import { hSuccess } from '@/lib/haptics';
import { C } from '@/lib/tokens';
import { useStore } from '@/store';

// Common OFW country codes — PH first.
const CODES = [
  { code: '+63', flag: '🇵🇭' },
  { code: '+1', flag: '🇺🇸' },
  { code: '+44', flag: '🇬🇧' },
  { code: '+61', flag: '🇦🇺' },
  { code: '+65', flag: '🇸🇬' },
  { code: '+852', flag: '🇭🇰' },
  { code: '+966', flag: '🇸🇦' },
  { code: '+971', flag: '🇦🇪' },
] as const;

export default function PhoneScreen() {
  const toast = useToast();
  const phone = useStore((s) => s.me.phone);
  const updateProfile = useStore((s) => s.updateProfile);
  const [num, setNum] = useState('');
  const [cc, setCc] = useState<(typeof CODES)[number]>(CODES[0]);
  const [showCodes, setShowCodes] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [otp, setOtp] = useState('');

  const sendCode = () => {
    if (!num.trim()) {
      toast('Enter a number first');
      return;
    }
    setCodeSent(true);
    toast('Code sent via SMS');
  };

  // ponytail: any 4 digits pass — demo only, no backend.
  const confirmCode = () => {
    if (otp.trim().length !== 4) {
      toast('Enter the 4-digit code');
      return;
    }
    updateProfile({ phone: `+63 ${num.trim()}` });
    hSuccess();
    toast('Number verified ✓');
    setCodeSent(false);
    setOtp('');
    setNum('');
  };

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />
      <ScreenHeader title="Phone number" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-5 pb-10" keyboardShouldPersistTaps="handled">
        {/* Current number */}
        <View className="mt-4 flex-row items-center rounded-3xl border p-4" style={{ borderColor: C.line }}>
          <View className="h-11 w-11 items-center justify-center rounded-full" style={{ backgroundColor: `${C.violet}1A` }}>
            <Ionicons name="call" size={20} color={C.violet} />
          </View>
          <View className="ml-3 flex-1">
            <Txt weight="bold" className="text-[16px] text-brand-ink">{phone}</Txt>
            <View className="mt-0.5 flex-row items-center">
              <Ionicons name="shield-checkmark" size={12} color={C.green} />
              <Txt weight="semibold" className="ml-1 text-[12px]" style={{ color: C.green }}>Verified</Txt>
            </View>
          </View>
        </View>

        <View className="mt-3 flex-row items-start rounded-2xl px-4 py-3" style={{ backgroundColor: C.surface }}>
          <Ionicons name="lock-closed" size={14} color={C.muted} style={{ marginTop: 2 }} />
          <Txt weight="medium" className="ml-2 flex-1 text-[12.5px] leading-[18px] text-brand-muted">
            Your number is private — never shown on your profile. We use it only for login and safety.
          </Txt>
        </View>

        {/* Change number */}
        <Txt weight="bold" className="mt-7 text-[12px] text-brand-faint" style={{ letterSpacing: 0.6 }}>CHANGE NUMBER</Txt>
        <View className="mt-2.5 flex-row items-center gap-2">
          <Pressable
            onPress={() => setShowCodes((v) => !v)}
            className="flex-row items-center rounded-2xl border px-3 py-3 active:opacity-70"
            style={{ borderColor: showCodes ? C.blue : C.line }}
            accessibilityRole="button"
            accessibilityLabel={`Country code ${cc.code}`}
          >
            <Txt weight="semibold" className="text-[15px] text-brand-ink">{cc.flag} {cc.code}</Txt>
            <Ionicons name={showCodes ? 'chevron-up' : 'chevron-down'} size={14} color={C.muted} style={{ marginLeft: 4 }} />
          </Pressable>
          <Input
            value={num}
            onChangeText={setNum}
            placeholder="917 000 0000"
            keyboardType="phone-pad"
            className="flex-1 rounded-2xl border px-4 py-3 text-[15px]"
            style={{ borderColor: C.line }}
          />
        </View>

        {showCodes && (
          <View className="mt-2.5 flex-row flex-wrap gap-2">
            {CODES.map((c) => (
              <Chip
                key={c.code}
                label={`${c.flag} ${c.code}`}
                active={cc.code === c.code}
                onPress={() => {
                  setCc(c);
                  setShowCodes(false);
                }}
              />
            ))}
          </View>
        )}

        {!codeSent ? (
          <>
            <View className="mt-5">
              <PrimaryButton label="Send verification code" icon="chatbubble-ellipses" onPress={sendCode} />
            </View>
            <Txt weight="medium" className="mt-2.5 text-center text-[12px] text-brand-muted">
              Changing your number requires re-verification.
            </Txt>
          </>
        ) : (
          <>
            <Txt weight="bold" className="mt-7 text-[12px] text-brand-faint" style={{ letterSpacing: 0.6 }}>ENTER THE 4-DIGIT CODE</Txt>
            <Txt weight="medium" className="mt-1.5 text-[12.5px] text-brand-muted">
              We texted a code to {cc.code} {num.trim()}.
            </Txt>
            <Input
              weight="bold"
              value={otp}
              onChangeText={setOtp}
              placeholder="••••"
              keyboardType="number-pad"
              maxLength={4}
              className="mt-2.5 rounded-2xl border px-4 py-3 text-center text-[22px]"
              style={{ borderColor: C.line, letterSpacing: 12 }}
            />
            <View className="mt-5">
              <PrimaryButton label="Confirm code" icon="checkmark-circle" onPress={confirmCode} />
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
      </ScrollView>
    </View>
  );
}
