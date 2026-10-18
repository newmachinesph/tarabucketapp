import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PhotoPicker } from '@/components/photo-picker';
import { Avatar, AvatarStack, IconButton, Input, NotFound, PrimaryButton } from '@/components/ui/kit';
import { Txt } from '@/components/ui/txt';
import { useToast } from '@/components/ui/toast';
import { catColor, catEmoji, catLabel, PEOPLE } from '@/data/mock';
import { hLight, hSuccess } from '@/lib/haptics';
import { C } from '@/lib/tokens';
import { bucketProgress, useStore } from '@/store';

const PRIVACY = {
  private: { icon: 'lock-closed', label: 'Private' },
  kada: { icon: 'people', label: 'Kada only' },
  public: { icon: 'globe', label: 'Public' },
} as const;

const INTENT = { solo: 'solo', kada: 'kada only', open: 'open to strangers' } as const;

export default function BucketDetailScreen() {
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const { id } = useLocalSearchParams<{ id: string }>();
  const buckets = useStore((s) => s.buckets);
  const savedBucketIds = useStore((s) => s.savedBucketIds);
  const taraedBucketIds = useStore((s) => s.taraedBucketIds);
  const toggleSubItem = useStore((s) => s.toggleSubItem);
  const toggleBucketDone = useStore((s) => s.toggleBucketDone);
  const toggleSavedBucket = useStore((s) => s.toggleSavedBucket);
  const tapTara = useStore((s) => s.tapTara);
  const addSubItem = useStore((s) => s.addSubItem);
  const updateBucket = useStore((s) => s.updateBucket);
  const removeBucket = useStore((s) => s.removeBucket);
  const [newItem, setNewItem] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);

  const bucket = buckets.find((b) => b.id === id);
  if (!bucket) return <NotFound label="Bucket" />;

  const color = catColor(bucket.category);
  const privacy = PRIVACY[bucket.privacy];
  const crew = PEOPLE.slice(0, 6);
  const rows = PEOPLE.slice(0, 3);
  const items = bucket.items;
  const progress = bucketProgress(bucket);
  const saved = savedBucketIds.includes(bucket.id);
  const taraed = taraedBucketIds.includes(bucket.id);
  const photos = bucket.photos ?? [];

  const confirmDelete = () => {
    Alert.alert('Delete bucket?', `“${bucket.title}” will be removed. This can’t be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          removeBucket(bucket.id);
          toast('Bucket deleted');
          router.back();
        },
      },
    ]);
  };

  const addMemory = (uri: string) => {
    if (photos.includes(uri)) return;
    hSuccess();
    updateBucket(bucket.id, { photos: [...photos, uri] });
  };
  const removeMemory = (uri: string) => {
    hLight();
    updateBucket(bucket.id, { photos: photos.filter((p) => p !== uri) });
  };

  const addItem = () => {
    const t = newItem.trim();
    if (!t) return;
    hLight();
    addSubItem(bucket.id, t);
    setNewItem('');
  };

  return (
    <View className="flex-1 bg-white">
      <View className="flex-row items-center px-5 pb-2" style={{ paddingTop: insets.top + 4 }}>
        <IconButton name="chevron-back" diameter={40} size={22} accessibilityLabel="Go back" onPress={() => router.back()} />
        <Txt weight="black" className="ml-2 flex-1 text-[20px] text-brand-ink">
          Bucket
        </Txt>
        <IconButton
          name={saved ? 'bookmark' : 'bookmark-outline'}
          diameter={40}
          size={22}
          color={saved ? C.orange : C.ink}
          accessibilityLabel={saved ? 'Remove from saved' : 'Save bucket'}
          onPress={() => {
            hLight();
            toggleSavedBucket(bucket.id);
          }}
        />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-5 pb-8 pt-1">
        {/* Big card */}
        <View className="rounded-3xl border border-black/5 bg-white p-5">
          <View className="h-16 w-16 items-center justify-center rounded-2xl" style={{ backgroundColor: `${color}1A` }}>
            <Txt style={{ fontSize: 32 }}>{catEmoji(bucket.category)}</Txt>
          </View>
          <Txt weight="black" className="mt-4 text-brand-ink" style={{ fontSize: 22, lineHeight: 28 }}>
            {bucket.title}
          </Txt>
          <View className="mt-3 flex-row flex-wrap gap-2">
            <View className="flex-row items-center rounded-full px-3 py-1.5" style={{ backgroundColor: `${color}1A` }}>
              <Txt className="mr-1 text-[11px]">{catEmoji(bucket.category)}</Txt>
              <Txt weight="semibold" className="text-[11px]" style={{ color }}>
                {catLabel(bucket.category)}
              </Txt>
            </View>
            <View className="flex-row items-center rounded-full bg-brand-surface px-3 py-1.5">
              <Ionicons name={privacy.icon} size={12} color={C.muted} />
              <Txt weight="semibold" className="ml-1 text-[11px] text-brand-muted">
                {privacy.label}
              </Txt>
            </View>
            <View className="flex-row items-center rounded-full bg-brand-surface px-3 py-1.5">
              <Ionicons name="sparkles" size={12} color={C.muted} />
              <Txt weight="semibold" className="ml-1 text-[11px] text-brand-muted">
                {INTENT[bucket.intent]}
              </Txt>
            </View>
          </View>
        </View>

        {/* Fulfilled toggle */}
        <Pressable
          onPress={() => {
            hLight();
            toggleBucketDone(bucket.id);
          }}
          className="mt-3 flex-row items-center rounded-3xl border p-4 active:opacity-80"
          style={{ borderColor: bucket.done ? `${C.green}40` : C.line, backgroundColor: bucket.done ? `${C.green}0D` : C.white }}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: bucket.done }}
          accessibilityLabel="Mark bucket fulfilled"
        >
          <View
            className="h-6 w-6 items-center justify-center rounded-full border-2"
            style={{ borderColor: bucket.done ? C.green : C.faint, backgroundColor: bucket.done ? C.green : 'transparent' }}
          >
            {bucket.done && <Ionicons name="checkmark" size={14} color={C.white} />}
          </View>
          <Txt weight="bold" className="ml-3 flex-1 text-[14px]" style={{ color: bucket.done ? C.green : C.ink }}>
            {bucket.done ? 'Fulfilled — nice one!' : 'Mark as fulfilled'}
          </Txt>
        </Pressable>

        {/* Memories — only for done buckets or ones that already have photos */}
        {(bucket.done || photos.length > 0) && (
          <View className="mt-6">
            <View className="flex-row items-center justify-between">
              <Txt weight="black" className="text-[18px] text-brand-ink">
                Memories
              </Txt>
              {photos.length > 0 && (
                <Txt weight="semibold" className="text-[12px] text-brand-muted">
                  📸 {photos.length}
                </Txt>
              )}
            </View>
            {photos.length === 0 ? (
              <View className="mt-3 items-center rounded-3xl border p-5" style={{ borderColor: `${C.green}40`, backgroundColor: `${C.green}0D` }}>
                <Txt style={{ fontSize: 28 }}>🎉</Txt>
                <Txt weight="black" className="mt-2 text-[16px] text-brand-ink">
                  Tapos na &apos;to!
                </Txt>
                <Txt weight="medium" className="mt-1 text-center text-[13px] text-brand-muted">
                  Add photos para may memories ang lakad na &apos;to 📸
                </Txt>
                <Pressable
                  onPress={() => {
                    hLight();
                    setPickerOpen(true);
                  }}
                  className="mt-4 flex-row items-center rounded-full px-5 py-2.5 active:opacity-80"
                  style={{ backgroundColor: C.green }}
                  accessibilityRole="button"
                  accessibilityLabel="Add photos"
                >
                  <Ionicons name="camera" size={16} color={C.white} />
                  <Txt weight="bold" className="ml-1.5 text-[13px] text-white">
                    Add photos
                  </Txt>
                </Pressable>
              </View>
            ) : (
              <View className="mt-3 flex-row flex-wrap gap-2">
                {photos.map((uri) => (
                  <View key={uri} className="overflow-hidden rounded-2xl" style={{ width: '31%', aspectRatio: 1 }}>
                    <Image source={{ uri }} style={{ width: '100%', height: '100%', backgroundColor: C.surface }} />
                    <Pressable
                      onPress={() => removeMemory(uri)}
                      className="absolute right-1.5 top-1.5 h-6 w-6 items-center justify-center rounded-full"
                      style={{ backgroundColor: 'rgba(14,23,38,0.7)' }}
                      hitSlop={8}
                      accessibilityRole="button"
                      accessibilityLabel="Remove memory"
                    >
                      <Ionicons name="close" size={13} color={C.white} />
                    </Pressable>
                  </View>
                ))}
                <Pressable
                  onPress={() => {
                    hLight();
                    setPickerOpen(true);
                  }}
                  className="items-center justify-center rounded-2xl border-2 border-dashed active:opacity-70"
                  style={{ width: '31%', aspectRatio: 1, borderColor: C.line }}
                  accessibilityRole="button"
                  accessibilityLabel="Add memory"
                >
                  <Ionicons name="add" size={22} color={C.faint} />
                  <Txt weight="semibold" className="mt-0.5 text-[11px] text-brand-muted">
                    Add memory
                  </Txt>
                </Pressable>
              </View>
            )}
          </View>
        )}

        {/* Sub-buckets checklist — header + add input always render so a plain
            bucket can get its first stop; progress bar + list only once items exist. */}
        <View className="mt-6">
          <View className="flex-row items-center justify-between">
            <Txt weight="black" className="text-[18px] text-brand-ink">
              Checklist
            </Txt>
            {progress && (
              <Txt weight="bold" className="text-[13px]" style={{ color }}>
                {progress.done}/{progress.total} done
              </Txt>
            )}
          </View>
          {items && progress && (
            <>
              <View className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-brand-surface">
                <View className="h-2 rounded-full" style={{ width: `${(progress.done / progress.total) * 100}%`, backgroundColor: color }} />
              </View>
              <View className="mt-3.5 gap-2.5">
                {items.map((it) => (
                  <Pressable
                    key={it.id}
                    onPress={() => {
                      hLight();
                      toggleSubItem(bucket.id, it.id);
                    }}
                    className="flex-row items-center rounded-2xl border p-3.5 active:opacity-80"
                    style={{ borderColor: C.line, backgroundColor: it.done ? `${color}0D` : C.white }}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: it.done }}
                    accessibilityLabel={it.title}
                  >
                    <View
                      className="h-6 w-6 items-center justify-center rounded-full border-2"
                      style={{ borderColor: it.done ? color : C.faint, backgroundColor: it.done ? color : 'transparent' }}
                    >
                      {it.done && <Ionicons name="checkmark" size={14} color={C.white} />}
                    </View>
                    <View className="ml-3 flex-1">
                      <Txt
                        weight="semibold"
                        className="text-[14px]"
                        style={{ color: it.done ? C.muted : C.ink, textDecorationLine: it.done ? 'line-through' : 'none' }}
                      >
                        {it.title}
                      </Txt>
                      {it.note ? (
                        <Txt weight="medium" className="mt-0.5 text-[12px] text-brand-faint">
                          {it.note}
                        </Txt>
                      ) : null}
                    </View>
                  </Pressable>
                ))}
              </View>
            </>
          )}
          {/* Add checklist item */}
          <View className="mt-2.5 flex-row items-center gap-2">
            <Input
              value={newItem}
              onChangeText={setNewItem}
              placeholder="Add a stop…"
              className="flex-1 rounded-2xl border px-4 py-3 text-[14px]"
              style={{ borderColor: C.line }}
              onSubmitEditing={addItem}
              returnKeyType="done"
            />
            <IconButton name="add" diameter={44} size={22} color={C.white} bg={C.orange} accessibilityLabel="Add checklist item" onPress={addItem} />
          </View>
        </View>

        {/* Who's in */}
        <View className="mt-6 flex-row items-center justify-between">
          <Txt weight="black" className="text-[18px] text-brand-ink">
            Who&apos;s in
          </Txt>
          <AvatarStack uris={crew.map((p) => p.avatar)} size={28} max={4} />
        </View>
        <Txt weight="medium" className="mt-1 text-[13px] text-brand-muted">
          <Txt weight="bold" style={{ color: C.orange }}>
            🪣 {bucket.interested} people
          </Txt>{' '}
          tapped Tara! on this
        </Txt>
        <Pressable
          onPress={() => {
            hLight();
            tapTara(bucket.id);
          }}
          className="mt-3 flex-row items-center self-start rounded-full px-4 py-2 active:opacity-80"
          style={{ backgroundColor: taraed ? C.orange : `${C.orange}14` }}
          accessibilityRole="button"
          accessibilityState={{ selected: taraed }}
          accessibilityLabel={taraed ? "You're in — tap to undo" : 'Tap Tara — I want in'}
        >
          <Ionicons name={taraed ? 'checkmark-circle' : 'arrow-forward-circle'} size={16} color={taraed ? C.white : C.orange} />
          <Txt weight="bold" className="ml-1.5 text-[12.5px]" style={{ color: taraed ? C.white : C.orangeDark }}>
            {taraed ? 'Interested ✓' : 'Tara! — I want in'}
          </Txt>
        </Pressable>

        <View className="mt-4 gap-3">
          {rows.map((p) => (
            <Pressable
              key={p.id}
              onPress={() => router.push({ pathname: '/profile/[id]', params: { id: p.id } })}
              className="flex-row items-center rounded-3xl border border-black/5 bg-white p-3 active:opacity-80"
            >
              <Avatar uri={p.avatar} size={44} />
              <View className="ml-3 flex-1 flex-row items-center">
                <Txt weight="bold" className="text-[14px] text-brand-ink">
                  {p.name}
                </Txt>
                {p.verified && <Ionicons name="checkmark-circle" size={15} color={C.blue} style={{ marginLeft: 4 }} />}
              </View>
              <View className="flex-row items-center rounded-full px-2.5 py-1" style={{ backgroundColor: `${C.orange}1A` }}>
                <Txt className="text-[11px]">🪣</Txt>
                <Txt weight="bold" className="ml-1 text-[11px]" style={{ color: C.orangeDark }}>
                  Tara!
                </Txt>
              </View>
            </Pressable>
          ))}
        </View>

        {/* Note card */}
        <View className="mt-6 flex-row rounded-3xl border p-4" style={{ backgroundColor: `${C.blue}0D`, borderColor: `${C.blue}26` }}>
          <Txt style={{ fontSize: 20 }}>💡</Txt>
          <Txt weight="medium" className="ml-3 flex-1 text-[13px] text-brand-muted" style={{ lineHeight: 19 }}>
            {items ? 'Tick off each stop as you go — turn any of them into a real plan with your kada.' : 'Turn this into a real plan — pick a venue, date, and who’s coming.'}
          </Txt>
        </View>
      </ScrollView>

      {/* Sticky bottom */}
      <View className="border-t px-5 pt-3" style={{ borderColor: C.line, paddingBottom: insets.bottom + 12 }}>
        <PrimaryButton
          label="Make it a plan"
          icon="calendar"
          onPress={() => {
            hSuccess();
            router.push({
              pathname: '/create-plan',
              params: { bucketId: bucket.id, title: bucket.title, category: bucket.category },
            });
          }}
        />
        <View className="mt-3 flex-row items-center justify-center gap-6">
          <Txt
            weight="bold"
            className="text-center text-[14px] text-brand-blue"
            onPress={() => router.push({ pathname: '/create-bucket', params: { edit: bucket.id } })}
          >
            Edit bucket
          </Txt>
          <Txt
            weight="bold"
            className="text-center text-[14px]"
            style={{ color: C.red }}
            accessibilityRole="button"
            accessibilityLabel="Delete bucket"
            onPress={confirmDelete}
          >
            Delete bucket
          </Txt>
        </View>
      </View>

      <PhotoPicker visible={pickerOpen} onClose={() => setPickerOpen(false)} onPick={addMemory} />
    </View>
  );
}
