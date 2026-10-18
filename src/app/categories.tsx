import { router } from 'expo-router';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconButton } from '@/components/ui/kit';
import { Txt } from '@/components/ui/txt';
import { CATEGORIES } from '@/data/mock';

export default function CategoriesScreen() {
  const insets = useSafeAreaInsets();
  return (
    <View className="flex-1 bg-white">
      <View className="flex-row items-center px-4 pb-2" style={{ paddingTop: insets.top + 4 }}>
        <IconButton name="chevron-back" diameter={40} size={22} accessibilityLabel="Go back" onPress={() => router.back()} />
        <View className="ml-2">
          <Txt weight="black" className="text-[20px] text-brand-ink">Explore</Txt>
          <Txt weight="medium" className="text-[12px] text-brand-muted">Bucket anything — 9 worlds to explore</Txt>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-5 pb-10 pt-1">
        {CATEGORIES.map((c) => (
          <View key={c.key} className="mb-4 overflow-hidden rounded-3xl border border-black/5">
            <View className="flex-row items-center px-4 py-3.5" style={{ backgroundColor: `${c.color}12` }}>
              <View className="h-12 w-12 items-center justify-center rounded-2xl" style={{ backgroundColor: `${c.color}22` }}>
                <Txt style={{ fontSize: 24 }}>{c.emoji}</Txt>
              </View>
              <View className="ml-3 flex-1">
                <Txt weight="black" className="text-[16px] text-brand-ink">{c.label}</Txt>
                <Txt weight="semibold" className="text-[12px]" style={{ color: c.color }}>{c.tagalog}</Txt>
              </View>
              <Txt weight="medium" className="text-[12px] text-brand-muted">{c.subs.length} types</Txt>
            </View>
            <View className="flex-row flex-wrap gap-2 p-3">
              {c.subs.map((s) => (
                <Pressable
                  key={s}
                  onPress={() => router.push({ pathname: '/search', params: { q: s } })}
                  className="rounded-full bg-brand-surface px-3.5 py-2 active:opacity-70"
                >
                  <Txt weight="semibold" className="text-[12px] text-brand-ink">{s}</Txt>
                </Pressable>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
