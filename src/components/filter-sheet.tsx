import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

import { PrimaryButton } from '@/components/ui/kit';
import { Sheet } from '@/components/ui/sheet';
import { Txt } from '@/components/ui/txt';
import { BUDGET_OPTIONS, CATEGORIES, type Budget } from '@/data/mock';
import { C } from '@/lib/tokens';
import { type Gender } from '@/store';

export function FilterSheet({
  cats,
  setCats,
  gender,
  setGender,
  budget,
  setBudget,
  count,
  onClose,
}: {
  cats: string[];
  setCats: (c: string[]) => void;
  gender: Gender;
  setGender: (g: Gender) => void;
  budget: 'any' | Budget;
  setBudget: (b: 'any' | Budget) => void;
  count: number;
  onClose: () => void;
}) {
  const toggle = (k: string) => setCats(cats.includes(k) ? cats.filter((c) => c !== k) : [...cats, k]);
  return (
    <Sheet visible onClose={onClose}>
      <View className="mb-4 flex-row items-center justify-between">
        <Txt weight="black" className="text-[20px] text-brand-ink">
          Filter plans
        </Txt>
        {cats.length > 0 && (
          <Pressable onPress={() => setCats([])} className="active:opacity-70">
            <Txt weight="semibold" className="text-[13px] text-brand-blue">
              Clear
            </Txt>
          </Pressable>
        )}
      </View>
      <Txt weight="semibold" className="mb-2.5 text-[13px] text-brand-muted">
        Categories
      </Txt>
      <View className="flex-row flex-wrap gap-2">
        {CATEGORIES.map((c) => {
          const active = cats.includes(c.key);
          return (
            <Pressable
              key={c.key}
              onPress={() => toggle(c.key)}
              className="flex-row items-center rounded-full px-4 py-2.5 active:opacity-80"
              style={{ backgroundColor: active ? c.color : C.surface }}
            >
              <Txt className="mr-1 text-[13px]">{c.emoji}</Txt>
              <Txt weight="semibold" className="text-[13px]" style={{ color: active ? C.white : C.ink }}>
                {c.label}
              </Txt>
            </Pressable>
          );
        })}
      </View>
      <Txt weight="semibold" className="mb-2.5 mt-5 text-[13px] text-brand-muted">
        Who&apos;s joining
      </Txt>
      <View className="flex-row gap-2">
        {(['all', 'women', 'men'] as const).map((g) => (
          <Pressable
            key={g}
            onPress={() => setGender(g)}
            className="flex-1 items-center rounded-full py-2.5"
            style={{ backgroundColor: gender === g ? C.ink : C.surface }}
          >
            <Txt weight="semibold" className="text-[13px]" style={{ color: gender === g ? C.white : C.muted }}>
              {g === 'all' ? 'For all' : g === 'women' ? 'Women only' : 'Men only'}
            </Txt>
          </Pressable>
        ))}
      </View>

      <Txt weight="semibold" className="mb-2.5 mt-5 text-[13px] text-brand-muted">
        Budget
      </Txt>
      <View className="flex-row gap-2">
        {BUDGET_OPTIONS.map((b) => (
          <Pressable
            key={b.key}
            onPress={() => setBudget(b.key)}
            className="flex-1 items-center rounded-full py-2.5"
            style={{ backgroundColor: budget === b.key ? C.ink : C.surface }}
            accessibilityRole="button"
            accessibilityState={{ selected: budget === b.key }}
          >
            <Txt weight="semibold" className="text-[13px]" style={{ color: budget === b.key ? C.white : C.muted }}>
              {b.label}
            </Txt>
          </Pressable>
        ))}
      </View>

      <Pressable
        onPress={() => {
          onClose();
          router.push('/categories');
        }}
        className="mt-5 flex-row items-center justify-center active:opacity-70"
      >
        <Ionicons name="grid-outline" size={15} color={C.blue} />
        <Txt weight="semibold" className="ml-1.5 text-[13px] text-brand-blue">
          Browse all categories
        </Txt>
      </Pressable>
      <View className="mt-4">
        <PrimaryButton label={count > 0 ? `Show ${count} plan${count === 1 ? '' : 's'}` : 'No plans match'} onPress={onClose} />
      </View>
    </Sheet>
  );
}
