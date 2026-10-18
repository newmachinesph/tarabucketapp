import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Chip, IconButton, Input, PrimaryButton, ScreenHeader, SectionHeader } from '@/components/ui/kit';
import { Txt } from '@/components/ui/txt';
import { useToast } from '@/components/ui/toast';
import { CATEGORIES } from '@/data/mock';
import { hLight, hSuccess } from '@/lib/haptics';
import { C } from '@/lib/tokens';
import { useStore } from '@/store';

const PRIVACY = [
  { key: 'private', label: 'Private', help: 'Only you can see it' },
  { key: 'kada', label: 'Kada', help: 'Shared with your crew' },
  { key: 'public', label: 'Public', help: 'Anyone can discover it' },
] as const;

const INTENT = [
  { key: 'solo', label: 'Solo' },
  { key: 'kada', label: 'With kada' },
  { key: 'open', label: 'Open to strangers' },
] as const;

export default function CreateBucketScreen() {
  const insets = useSafeAreaInsets();
  const toast = useToast();
  // `title`/`category` prefill the funnel (e.g. "Tara this" on a receipt); `edit` wins over both.
  const { edit, title: titleParam, category: categoryParam } = useLocalSearchParams<{
    edit?: string;
    title?: string;
    category?: string;
  }>();
  const buckets = useStore((s) => s.buckets);
  const addBucket = useStore((s) => s.addBucket);
  const updateBucket = useStore((s) => s.updateBucket);
  const editing = buckets.find((b) => b.id === edit);
  const [title, setTitle] = useState(() => editing?.title ?? titleParam ?? '');
  const [category, setCategory] = useState(
    () => editing?.category ?? (CATEGORIES.some((c) => c.key === categoryParam) ? categoryParam! : CATEGORIES[0]!.key),
  );
  const [privacy, setPrivacy] = useState<'private' | 'kada' | 'public'>(() => editing?.privacy ?? 'public');
  const [intent, setIntent] = useState<'solo' | 'kada' | 'open'>(() => editing?.intent ?? 'open');
  const [items, setItems] = useState<string[]>([]);
  const [newItem, setNewItem] = useState('');

  const addItem = () => {
    const t = newItem.trim();
    if (!t) return;
    hLight();
    setItems((prev) => [...prev, t]);
    setNewItem('');
  };

  const handleBucket = () => {
    const t = title.trim();
    if (!t) {
      toast('Add a title first');
      return;
    }
    if (editing) {
      updateBucket(editing.id, { title: t, category, privacy, intent });
      hSuccess();
      toast('Bucket updated');
      router.back();
      return;
    }
    const id = addBucket({
      title: t,
      category,
      privacy,
      intent,
      ...(items.length > 0
        ? { items: items.map((text, i) => ({ id: `sub-new-${i}`, title: text, done: false })) }
        : {}),
    });
    hSuccess();
    toast('Bucketed! Added to your list 🪣');
    router.replace({ pathname: '/bucket/[id]', params: { id } });
  };

  return (
    <View className="flex-1 bg-white">
      <ScreenHeader title={editing ? 'Edit bucket' : 'New bucket'} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="pb-8 pt-2">
        {/* Title input */}
        <View className="px-5">
          <Txt weight="bold" className="mb-2 text-[13px] text-brand-ink">
            What do you wanna do?
          </Txt>
          <Input
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. Try that samgyup place in Poblacion"
            className="rounded-2xl border-2 px-4 py-4 text-[14px]"
            style={{ borderColor: C.line }}
          />
        </View>

        {/* Category */}
        <View className="mt-6">
          <SectionHeader title="Category" />
          <View className="mt-3 flex-row flex-wrap gap-2 px-5">
            {CATEGORIES.map((cat) => {
              const active = cat.key === category;
              return (
                <Pressable
                  key={cat.key}
                  onPress={() => setCategory(cat.key)}
                  className="flex-row items-center rounded-full px-4 py-2 active:opacity-80"
                  style={{ backgroundColor: active ? cat.color : C.surface }}
                >
                  <Txt className="mr-1.5 text-[13px]">{cat.emoji}</Txt>
                  <Txt weight="semibold" className="text-[13px]" style={{ color: active ? C.white : C.muted }}>
                    {cat.label}
                  </Txt>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Privacy */}
        <View className="mt-6">
          <SectionHeader title="Who can see it" />
          <View className="mt-3 flex-row gap-2 px-5">
            {PRIVACY.map((p) => (
              <Chip key={p.key} label={p.label} active={p.key === privacy} onPress={() => setPrivacy(p.key)} />
            ))}
          </View>
          <Txt weight="medium" className="mt-2 px-5 text-[12px] text-brand-muted">
            {PRIVACY.find((p) => p.key === privacy)?.help}
          </Txt>
        </View>

        {/* Intent */}
        <View className="mt-6">
          <SectionHeader title="How do you wanna do it" />
          <View className="mt-3 flex-row flex-wrap gap-2 px-5">
            {INTENT.map((i) => (
              <Chip key={i.key} label={i.label} active={i.key === intent} onPress={() => setIntent(i.key)} />
            ))}
          </View>
        </View>

        {/* Checklist (optional, create-only — edit items on the bucket page) */}
        {!editing && (
          <View className="mt-6">
            <SectionHeader title="Checklist (optional)" />
            <Txt weight="medium" className="mt-1 px-5 text-[12px] text-brand-muted">
              Break it into stops — tick them off as you go.
            </Txt>
            <View className="mt-3 px-5">
              {items.map((it, i) => (
                <View
                  key={`${i}-${it}`}
                  className="mb-2 flex-row items-center rounded-2xl border px-4 py-2"
                  style={{ borderColor: C.line }}
                >
                  <Txt weight="semibold" className="flex-1 text-[14px] text-brand-ink" numberOfLines={1}>
                    {it}
                  </Txt>
                  <IconButton
                    name="close"
                    diameter={32}
                    size={16}
                    color={C.muted}
                    accessibilityLabel={`Remove ${it}`}
                    onPress={() => setItems((prev) => prev.filter((_, x) => x !== i))}
                  />
                </View>
              ))}
              <View className="flex-row items-center gap-2">
                <Input
                  value={newItem}
                  onChangeText={setNewItem}
                  placeholder="Add a stop…"
                  className="flex-1 rounded-2xl border px-4 py-3 text-[14px]"
                  style={{ borderColor: C.line }}
                  onSubmitEditing={addItem}
                  returnKeyType="done"
                />
                <IconButton
                  name="add"
                  diameter={44}
                  size={22}
                  color={C.white}
                  bg={C.orange}
                  accessibilityLabel="Add checklist item"
                  onPress={addItem}
                />
              </View>
            </View>
          </View>
        )}

        {/* Info line */}
        <View className="mx-5 mt-6 flex-row items-center rounded-2xl px-4 py-3" style={{ backgroundColor: `${C.orange}14` }}>
          <Txt style={{ fontSize: 15 }}>🪣</Txt>
          <Txt weight="semibold" className="ml-2 flex-1 text-[12px]" style={{ color: C.orangeDark }}>
            Open buckets appear in others&apos; Tara deck.
          </Txt>
        </View>
      </ScrollView>

      {/* Sticky bottom */}
      <View className="border-t px-5 pt-3" style={{ borderColor: C.line, paddingBottom: insets.bottom + 12 }}>
        <PrimaryButton label={editing ? 'Save changes' : 'Bucket it'} icon={editing ? 'checkmark' : 'add'} onPress={handleBucket} />
      </View>
    </View>
  );
}
