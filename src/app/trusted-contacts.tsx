import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { Avatar, IconButton, Input, ScreenHeader } from '@/components/ui/kit';
import { useToast } from '@/components/ui/toast';
import { Txt } from '@/components/ui/txt';
import { PEOPLE } from '@/data/mock';
import { hLight } from '@/lib/haptics';
import { C } from '@/lib/tokens';
import { useStore } from '@/store';

// ponytail: basic PH plausibility — 10–12 digits covers 9XX…, 09XX…, 639XX… formats.
const isPlausiblePhPhone = (phone: string) => {
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 12;
};

// Deterministic mock +63 number for in-app friends (demo — no real phones in fixtures).
const mockPhone = (idx: number) => `+63 917 555 02${String(idx % 100).padStart(2, '0')}`;

function InitialBubble({ name }: { name: string }) {
  return (
    <View className="h-11 w-11 items-center justify-center rounded-full" style={{ backgroundColor: `${C.violet}1A` }}>
      <Txt weight="black" className="text-[16px]" style={{ color: C.violet }}>
        {name.charAt(0).toUpperCase()}
      </Txt>
    </View>
  );
}

export default function TrustedContactsScreen() {
  const toast = useToast();
  const contacts = useStore((s) => s.trustedContacts);
  const addTrustedContact = useStore((s) => s.addTrustedContact);
  const removeTrustedContact = useStore((s) => s.removeTrustedContact);
  const me = useStore((s) => s.me);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const addedIds = new Set(contacts.map((c) => c.id));
  const friends = PEOPLE.filter((p) => p.id !== me.id && !addedIds.has(p.id));

  const addByNumber = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      toast('Add a name first — sino siya?');
      return;
    }
    if (!isPlausiblePhPhone(phone)) {
      toast('That number looks off — try +63 917 555 0000');
      return;
    }
    hLight();
    addTrustedContact({ name: trimmed, phone: phone.trim() });
    setName('');
    setPhone('');
    toast(`${trimmed} added — they'll get your SOS by text ✓`);
  };

  const addFriend = (id: string, friendName: string, avatar: string, idx: number) => {
    hLight();
    addTrustedContact({ id, name: friendName, avatar, phone: mockPhone(idx) });
    toast(`${friendName.split(' ')[0]} added ✓`);
  };

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />
      <ScreenHeader title="Trusted contacts" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerClassName="px-5 pb-10"
      >
        <View className="mt-3 flex-row items-start rounded-3xl p-4" style={{ backgroundColor: `${C.green}12` }}>
          <Ionicons name="shield-checkmark" size={18} color={C.green} style={{ marginTop: 1 }} />
          <Txt weight="medium" className="ml-2.5 flex-1 text-[12.5px] leading-[18px] text-brand-muted">
            These people get your live location and an instant alert the moment you tap SOS. Your Nanay, your bestie —
            whoever you trust. They don&apos;t need the app, and they&apos;re never shown to other members.
          </Txt>
        </View>

        {/* Zero-contact warning — SOS has nowhere to go */}
        {contacts.length === 0 && (
          <View className="mt-3 flex-row items-start rounded-3xl p-4" style={{ backgroundColor: `${C.red}0F` }}>
            <Ionicons name="warning" size={18} color={C.red} style={{ marginTop: 1 }} />
            <Txt weight="semibold" className="ml-2.5 flex-1 text-[12.5px] leading-[18px]" style={{ color: C.red }}>
              SOS won&apos;t reach anyone yet — add at least one contact before you head out.
            </Txt>
          </View>
        )}

        {/* Current contacts */}
        <Txt weight="bold" className="mt-6 text-[12px] text-brand-faint" style={{ letterSpacing: 0.6 }}>
          YOUR TRUSTED CONTACTS ({contacts.length})
        </Txt>
        <View className="mt-2.5 gap-2.5">
          {contacts.map((c) => (
            <View
              key={c.id}
              className="flex-row items-center rounded-2xl border p-3"
              style={{ borderColor: `${C.green}55`, backgroundColor: `${C.green}0A` }}
            >
              {c.avatar ? <Avatar uri={c.avatar} size={44} /> : <InitialBubble name={c.name} />}
              <View className="ml-3 flex-1">
                <Txt weight="bold" className="text-[14px] text-brand-ink">{c.name}</Txt>
                <Txt weight="medium" className="text-[12px] text-brand-muted">{c.phone}</Txt>
              </View>
              <IconButton
                name="close"
                diameter={36}
                size={18}
                color={C.muted}
                bg={C.white}
                accessibilityLabel={`Remove ${c.name}`}
                onPress={() => {
                  hLight();
                  removeTrustedContact(c.id);
                  toast(`${c.name.split(' ')[0]} removed`);
                }}
              />
            </View>
          ))}
        </View>

        {/* Add by number — headline: Nanay doesn't need the app */}
        <Txt weight="bold" className="mt-6 text-[12px] text-brand-faint" style={{ letterSpacing: 0.6 }}>
          ADD BY NUMBER
        </Txt>
        <View className="mt-2.5 rounded-3xl border p-4" style={{ borderColor: C.line }}>
          <View className="flex-row items-center">
            <Txt style={{ fontSize: 18 }}>💬</Txt>
            <Txt weight="black" className="ml-2 text-[14px] text-brand-ink">Nanay doesn&apos;t need the app</Txt>
          </View>
          <Txt weight="medium" className="mt-1 text-[12px] text-brand-muted">
            Any PH number works — alerts arrive as a text with your live location.
          </Txt>
          <Input
            weight="semibold"
            value={name}
            onChangeText={setName}
            placeholder="Name (e.g. Nanay)"
            className="mt-3 rounded-2xl border px-4 py-3 text-[14px]"
            style={{ borderColor: C.line }}
          />
          <Input
            weight="semibold"
            value={phone}
            onChangeText={setPhone}
            placeholder="+63 917 555 0000"
            keyboardType="phone-pad"
            className="mt-2.5 rounded-2xl border px-4 py-3 text-[14px]"
            style={{ borderColor: C.line }}
          />
          <Pressable
            onPress={addByNumber}
            accessibilityRole="button"
            accessibilityLabel="Add trusted contact by number"
            className="mt-3 flex-row items-center justify-center rounded-2xl py-3 active:opacity-90"
            style={{ backgroundColor: C.ink }}
          >
            <Ionicons name="person-add" size={16} color={C.white} />
            <Txt weight="bold" className="ml-2 text-[14px] text-white">Add contact</Txt>
          </Pressable>
        </View>

        {/* Add from in-app friends */}
        <Txt weight="bold" className="mt-6 text-[12px] text-brand-faint" style={{ letterSpacing: 0.6 }}>
          ADD FROM FRIENDS
        </Txt>
        <View className="mt-2.5 gap-2.5">
          {friends.map((p, i) => (
            <View
              key={p.id}
              className="flex-row items-center rounded-2xl border p-3"
              style={{ borderColor: C.line }}
            >
              <Avatar uri={p.avatar} size={44} />
              <View className="ml-3 flex-1">
                <View className="flex-row items-center">
                  <Txt weight="bold" className="text-[14px] text-brand-ink">{p.name}</Txt>
                  {p.verified && <Ionicons name="checkmark-circle" size={14} color={C.blue} style={{ marginLeft: 4 }} />}
                </View>
                <Txt weight="medium" className="text-[12px] text-brand-muted">@{p.handle}</Txt>
              </View>
              <Pressable
                onPress={() => addFriend(p.id, p.name, p.avatar, i)}
                accessibilityRole="button"
                accessibilityLabel={`Add ${p.name} as trusted contact`}
                className="flex-row items-center rounded-full px-3.5 py-2 active:opacity-80"
                style={{ backgroundColor: `${C.green}1A` }}
              >
                <Ionicons name="add" size={15} color={C.green} />
                <Txt weight="bold" className="ml-0.5 text-[12px]" style={{ color: C.green }}>Add</Txt>
              </Pressable>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
