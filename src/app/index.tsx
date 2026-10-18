import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Pressable, View } from 'react-native';

import { Txt } from '@/components/ui/txt';
import { C } from '@/lib/tokens';
import { useStore } from '@/store';

export default function Splash() {
  const hydrated = useStore((s) => s._hydrated);
  const [elapsed, setElapsed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setElapsed(true), 1600);
    return () => clearTimeout(timer);
  }, []);

  // Wait for the splash beat *and* for AsyncStorage to be read back. Redirecting on the timer
  // alone races rehydration: `session` would still be its initial `false` on a slow cold start,
  // bouncing a signed-in user to /welcome. Signed-in users skip onboarding and land in the app.
  useEffect(() => {
    if (!elapsed || !hydrated) return;
    router.replace(useStore.getState().session ? '/(tabs)/tara' : '/welcome');
  }, [elapsed, hydrated]);

  return (
    <Pressable
      onPress={() => setElapsed(true)}
      className="flex-1 items-center justify-center"
      style={{ backgroundColor: C.blue }}
    >
      <StatusBar style="light" />
      <View className="items-center">
        <View className="mb-6 h-24 w-24 items-center justify-center rounded-[28px] bg-white/15">
          <Txt style={{ fontSize: 52 }}>🪣</Txt>
        </View>
        <Txt weight="black" className="text-white" style={{ fontSize: 56, letterSpacing: -1 }}>
          tara<Txt weight="black" style={{ color: C.orange, fontSize: 56 }}>!</Txt>
        </Txt>
        <Txt weight="semibold" className="mt-1 text-white/80" style={{ fontSize: 18, letterSpacing: 6 }}>
          BUCKET
        </Txt>
      </View>
      <Txt weight="medium" className="absolute bottom-16 text-white/75" style={{ fontSize: 15 }}>
        tara na — let&apos;s go.
      </Txt>
    </Pressable>
  );
}
