import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PhotoPicker } from '@/components/photo-picker';
import { Input, PrimaryButton, ScreenHeader } from '@/components/ui/kit';
import { useToast } from '@/components/ui/toast';
import { Txt } from '@/components/ui/txt';
import { INTERESTS } from '@/data/mock';
import { hLight, hSuccess } from '@/lib/haptics';
import { C } from '@/lib/tokens';
import { useStore } from '@/store';

export default function EditProfileScreen() {
  const insets = useSafeAreaInsets();
  const showToast = useToast();

  const me = useStore((s) => s.me);
  const interests = useStore((s) => s.interests);
  const toggleInterest = useStore((s) => s.toggleInterest);
  const updateProfile = useStore((s) => s.updateProfile);

  const [name, setName] = useState(me.name);
  const [bio, setBio] = useState(me.bio);
  const [pickerOpen, setPickerOpen] = useState(false);

  const addPhoto = (uri: string) => {
    if (me.photos.includes(uri) || me.photos.length >= 6) return;
    hSuccess();
    updateProfile({ photos: [...me.photos, uri] });
  };
  const removePhoto = (uri: string) => {
    hLight();
    updateProfile({ photos: me.photos.filter((p) => p !== uri) });
  };
  const makePrimary = (uri: string) => {
    hLight();
    updateProfile({ photos: [uri, ...me.photos.filter((p) => p !== uri)] });
  };

  const save = () => {
    updateProfile({ name: name.trim() || me.name, bio: bio.trim() });
    hSuccess();
    showToast('Profile updated');
    router.back();
  };

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />
      <ScreenHeader title="Edit profile" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-5 pb-28">
        {/* Photos */}
        <Txt weight="bold" className="mt-4 text-[12px] text-brand-faint" style={{ letterSpacing: 0.6 }}>PHOTOS</Txt>
        <View className="mt-3 flex-row flex-wrap gap-3">
          {me.photos.map((uri, i) => (
            <View key={uri} style={{ width: 84 }}>
              <View style={{ width: 84, height: 84, borderRadius: 18, overflow: 'hidden' }}>
                <Image source={{ uri }} style={{ width: '100%', height: '100%', backgroundColor: C.surface }} />
                <Pressable
                  onPress={() => removePhoto(uri)}
                  className="absolute right-1 top-1 h-5 w-5 items-center justify-center rounded-full"
                  style={{ backgroundColor: 'rgba(14,23,38,0.7)' }}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel="Remove photo"
                >
                  <Ionicons name="close" size={12} color={C.white} />
                </Pressable>
              </View>
              {i === 0 ? (
                <View className="mt-1.5 items-center rounded-full py-1" style={{ backgroundColor: `${C.green}1A` }}>
                  <Txt weight="bold" className="text-[10px]" style={{ color: C.green }}>
                    Primary
                  </Txt>
                </View>
              ) : (
                <Pressable
                  onPress={() => makePrimary(uri)}
                  className="mt-1.5 items-center py-1 active:opacity-70"
                  accessibilityRole="button"
                  accessibilityLabel="Make primary"
                >
                  <Txt weight="bold" className="text-[10px] text-brand-blue">
                    Make primary
                  </Txt>
                </Pressable>
              )}
            </View>
          ))}
          {me.photos.length < 6 && (
            <Pressable
              onPress={() => setPickerOpen(true)}
              className="items-center justify-center rounded-2xl border-2 border-dashed active:opacity-70"
              style={{ width: 84, height: 84, borderColor: C.line }}
              accessibilityRole="button"
              accessibilityLabel="Add photo"
            >
              <Ionicons name="add" size={26} color={C.faint} />
            </Pressable>
          )}
        </View>

        {/* Name */}
        <Txt weight="bold" className="mt-7 text-[12px] text-brand-faint" style={{ letterSpacing: 0.6 }}>DISPLAY NAME</Txt>
        <Input
          value={name}
          onChangeText={setName}
          placeholder="Your name"
          className="mt-2.5 rounded-2xl border px-4 py-3 text-[15px]"
          style={{ borderColor: C.line }}
        />

        {/* Age (read-only) */}
        <View className="mt-3 flex-row items-center rounded-2xl border px-4 py-3" style={{ borderColor: C.line }}>
          <Ionicons name="shield-checkmark" size={16} color={C.green} />
          <Txt weight="semibold" className="ml-2 flex-1 text-[14px] text-brand-ink">{me.age} · Age verified</Txt>
          <Txt weight="medium" className="text-[12px] text-brand-faint">Locked</Txt>
        </View>

        {/* Bio */}
        <Txt weight="bold" className="mt-7 text-[12px] text-brand-faint" style={{ letterSpacing: 0.6 }}>BIO</Txt>
        <Input
          value={bio}
          onChangeText={setBio}
          placeholder="Say something about you…"
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          maxLength={180}
          className="mt-2.5 rounded-2xl border px-4 py-3 text-[15px]"
          style={{ borderColor: C.line, minHeight: 96 }}
        />
        <Txt weight="medium" className="mt-1 text-right text-[11px] text-brand-faint">{bio.length}/180</Txt>

        {/* Interests */}
        <View className="mt-6 flex-row items-center justify-between">
          <Txt weight="bold" className="text-[12px] text-brand-faint" style={{ letterSpacing: 0.6 }}>INTERESTS</Txt>
          <Txt weight="semibold" className="text-[12px] text-brand-muted">{interests.length} selected</Txt>
        </View>
        <Txt weight="medium" className="mt-1 text-[12.5px] text-brand-muted">Tap to pick what you’re into — we use these to surface better plans.</Txt>
        <View className="mt-3 flex-row flex-wrap gap-2">
          {INTERESTS.map((tag) => {
            const active = interests.includes(tag);
            return (
              <Pressable
                key={tag}
                onPress={() => {
                  hLight();
                  toggleInterest(tag);
                }}
                className="flex-row items-center rounded-full px-4 py-2.5 active:opacity-80"
                style={{ backgroundColor: active ? C.blue : C.surface }}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                accessibilityLabel={tag}
              >
                {active && <Ionicons name="checkmark" size={14} color={C.white} style={{ marginRight: 5 }} />}
                <Txt weight="semibold" className="text-[13px]" style={{ color: active ? C.white : C.ink }}>{tag}</Txt>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <View className="border-t px-5 pt-3" style={{ borderColor: C.line, paddingBottom: insets.bottom + 10 }}>
        <PrimaryButton label="Save changes" icon="checkmark" onPress={save} />
      </View>

      <PhotoPicker visible={pickerOpen} onClose={() => setPickerOpen(false)} onPick={addPhoto} />
    </View>
  );
}
