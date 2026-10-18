import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/ui/kit';
import { Txt } from '@/components/ui/txt';
import { useT } from '@/lib/i18n';

const CATEGORIES = ['🍜 Food trips', '🏔 Hikes', '🍺 Inuman', '🎲 Board games', '🏝 Beach', '🎤 Videoke'];

export default function Welcome() {
  const insets = useSafeAreaInsets();
  const t = useT();
  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top, paddingBottom: insets.bottom + 12 }}>
      <StatusBar style="dark" />
      <ScrollView contentContainerClassName="grow px-6 pb-4 pt-4" showsVerticalScrollIndicator={false}>
        <View className="mb-8 flex-row gap-3">
          <View className="h-32 flex-1 rounded-[28px] bg-brand-blue" />
          <View className="h-32 w-24 rounded-[28px] bg-brand-orange" />
        </View>

        <Txt weight="black" className="text-brand-ink" style={{ fontSize: 34, lineHeight: 38 }}>
          {t('tagline')}
        </Txt>
        <Txt weight="regular" className="mt-4 text-brand-muted" style={{ fontSize: 17, lineHeight: 25 }}>
          Bucket what you want to do. Your barkada — or new people nearby — tap{' '}
          <Txt weight="bold" className="text-brand-blue">
            Tara!
          </Txt>{' '}
          and it becomes a real group plan at a real place.
        </Txt>

        <View className="mt-7 flex-row flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <View key={c} className="rounded-full bg-brand-surface px-4 py-2.5">
              <Txt weight="medium" className="text-brand-ink text-[13px]">
                {c}
              </Txt>
            </View>
          ))}
        </View>

        <View className="grow" />
      </ScrollView>

      <View className="px-6">
        <PrimaryButton label="Tara! Get started" icon="arrow-forward" onPress={() => router.push('/verify')} />
        <Pressable onPress={() => router.push('/login')} className="mt-2 items-center py-3 active:opacity-70">
          <Txt weight="semibold" className="text-brand-muted">
            I already have an account
          </Txt>
        </Pressable>
        <Txt weight="medium" className="mt-1 text-center text-[12px] text-brand-faint">
          For verified grown-ups · real people, real meetups
        </Txt>
      </View>
    </View>
  );
}
