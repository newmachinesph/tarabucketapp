import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar, Input, PrimaryButton, ScreenHeader, SectionHeader } from '@/components/ui/kit';
import { Txt } from '@/components/ui/txt';
import { useToast } from '@/components/ui/toast';
import { CATEGORIES, PEOPLE } from '@/data/mock';
import { hSuccess } from '@/lib/haptics';
import { C } from '@/lib/tokens';
import { useStore } from '@/store';

const EMOJIS = ['🍻', '🏔', '✨', '☕', '🎲', '🏝'];
const COLORS = CATEGORIES.map((c) => c.color);

export default function CreateKadaScreen() {
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const createKada = useStore((s) => s.createKada);
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState(EMOJIS[0]!);
  const [color, setColor] = useState(COLORS[0]!);
  const [members, setMembers] = useState<Set<string>>(new Set());

  const toggleMember = (id: string) =>
    setMembers((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const handleCreate = () => {
    if (!name.trim()) {
      toast('Name your kada first');
      return;
    }
    const id = createKada({ name: name.trim(), emoji, color, memberIds: Array.from(members) });
    hSuccess();
    toast('Kada created — invites sent 🎉');
    router.replace({ pathname: '/kada/[id]', params: { id } });
  };

  return (
    <View className="flex-1 bg-white">
      <ScreenHeader title="New kada" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="pb-8 pt-2">
        {/* Name */}
        <View className="px-5">
          <Txt weight="bold" className="mb-2 text-[13px] text-brand-ink">
            Kada name
          </Txt>
          <Input
            value={name}
            onChangeText={setName}
            placeholder="e.g. Weekend Warriors"
            className="rounded-2xl border-2 px-4 py-4 text-[14px]"
            style={{ borderColor: C.line }}
          />
        </View>

        {/* Emoji picker */}
        <View className="mt-6">
          <SectionHeader title="Pick an emoji" />
          <View className="mt-3 flex-row flex-wrap gap-2.5 px-5">
            {EMOJIS.map((e) => {
              const active = e === emoji;
              return (
                <Pressable
                  key={e}
                  onPress={() => setEmoji(e)}
                  className="h-12 w-12 items-center justify-center rounded-2xl border-2 active:opacity-80"
                  style={{ borderColor: active ? C.orange : C.line, backgroundColor: active ? `${C.orange}12` : C.white }}
                >
                  <Txt style={{ fontSize: 24 }}>{e}</Txt>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Accent color */}
        <View className="mt-6">
          <SectionHeader title="Accent color" />
          <View className="mt-3 flex-row flex-wrap gap-3 px-5">
            {COLORS.map((col) => {
              const active = col === color;
              return (
                <Pressable
                  key={col}
                  onPress={() => setColor(col)}
                  className="h-11 w-11 items-center justify-center rounded-full active:opacity-80"
                  style={{ backgroundColor: col }}
                >
                  {active ? <Ionicons name="checkmark" size={20} color={C.white} /> : null}
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Add members */}
        <View className="mt-6">
          <SectionHeader title="Add members" />
          <View className="mt-3">
            {PEOPLE.slice(0, 6).map((p) => {
              const added = members.has(p.id);
              return (
                <View
                  key={p.id}
                  className="mx-5 mb-2 flex-row items-center rounded-2xl border border-black/5 p-3"
                >
                  <Avatar uri={p.avatar} size={44} />
                  <View className="ml-3 flex-1">
                    <Txt weight="bold" className="text-[14px] text-brand-ink">
                      {p.name}
                    </Txt>
                    <Txt weight="medium" className="text-[12px] text-brand-muted">
                      @{p.handle}
                    </Txt>
                  </View>
                  <Pressable
                    onPress={() => toggleMember(p.id)}
                    className="h-9 w-9 items-center justify-center rounded-full border-2 active:opacity-70"
                    style={{ borderColor: added ? C.orange : C.line, backgroundColor: added ? C.orange : 'transparent' }}
                  >
                    <Ionicons name={added ? 'checkmark' : 'add'} size={18} color={added ? C.white : C.muted} />
                  </Pressable>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Sticky bottom */}
      <View
        className="border-t border-black/5 bg-white px-5 pt-3"
        style={{ paddingBottom: insets.bottom + 10 }}
      >
        <PrimaryButton label="Create kada" icon="people" onPress={handleCreate} />
      </View>
    </View>
  );
}
