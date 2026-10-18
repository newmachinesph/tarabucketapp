import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar, IconButton, Input } from '@/components/ui/kit';
import { Txt } from '@/components/ui/txt';
import { type Note } from '@/data/mock';
import { C } from '@/lib/tokens';
import { useStore } from '@/store';

function Bubble({ note }: { note: Note }) {
  if (note.mine) {
    return (
      <View className="mb-3 items-end">
        <View className="max-w-[78%] self-end rounded-2xl rounded-br-md bg-brand-orange px-3.5 py-2.5">
          <Txt weight="medium" className="text-[13.5px] leading-[19px] text-white">
            {note.text}
          </Txt>
        </View>
        <Txt weight="medium" className="mr-1 mt-1 text-[10px] text-brand-muted">
          {note.time}
        </Txt>
      </View>
    );
  }
  return (
    <View className="mb-3 flex-row items-end">
      <Avatar uri={note.from.avatar} size={28} />
      <View className="ml-2 max-w-[78%]">
        <Txt weight="semibold" className="mb-1 ml-1 text-[11px] text-brand-muted">
          {note.from.name.split(' ')[0]}
        </Txt>
        <View className="self-start rounded-2xl rounded-bl-md bg-brand-surface px-3.5 py-2.5">
          <Txt weight="medium" className="text-[13.5px] leading-[19px] text-brand-ink">
            {note.text}
          </Txt>
        </View>
        <Txt weight="medium" className="ml-1 mt-1 text-[10px] text-brand-muted">
          {note.time}
        </Txt>
      </View>
    </View>
  );
}

// Universal conversation screen, keyed by conversation id (a plan `d…`, kada `k…`,
// or person `u…` for a DM). Callers pass `title`/`subtitle`/`kind` so the header
// reads correctly for DMs and kada GCs, not just plans.
export default function PlanNoteScreen() {
  const insets = useSafeAreaInsets();
  const { id, title, subtitle, kind } = useLocalSearchParams<{ id?: string; title?: string; subtitle?: string; kind?: string }>();
  const discovery = useStore((s) => s.discovery);
  // A plan conversation resolves live from the deck (so freshly created plans work); DMs/kadas won't match.
  const plan = discovery.find((d) => d.id === id);
  const convoId = id ?? plan?.id ?? 'general';
  const isPlan = kind !== 'dm' && kind !== 'kada' && !!plan;

  const headerTitle = title ?? plan?.title ?? 'Chat';
  const headerSub = subtitle ?? (plan ? `${plan.going} going · ${plan.when}` : kind === 'dm' ? 'Direct message' : undefined);
  const composerPlaceholder = kind === 'dm' ? 'Message…' : 'Message the group…';

  const scrollRef = useRef<ScrollView>(null);
  const messages = useStore((s) => s.threads[convoId]) ?? [];
  const sendMessage = useStore((s) => s.sendMessage);
  const markConvoRead = useStore((s) => s.markConvoRead);
  const [input, setInput] = useState('');

  useEffect(() => {
    markConvoRead(convoId);
  }, [convoId, markConvoRead]);

  const send = () => {
    const text = input.trim();
    if (!text) return;
    sendMessage(convoId, text);
    setInput('');
  };

  return (
    <View className="flex-1 bg-white">
      <View className="flex-row items-center px-4 pb-2" style={{ paddingTop: insets.top + 4 }}>
        <IconButton name="chevron-back" diameter={40} size={22} accessibilityLabel="Go back" onPress={() => router.back()} />
        <View className="ml-2 flex-1">
          <Txt weight="black" className="text-[17px] text-brand-ink" numberOfLines={1}>
            {headerTitle}
          </Txt>
          {headerSub ? (
            <Txt weight="medium" className="text-[12px] text-brand-muted" numberOfLines={1}>
              {headerSub}
            </Txt>
          ) : null}
        </View>
      </View>

      {isPlan ? (
        <View className="mx-4 mb-1 mt-1 flex-row items-center self-start rounded-full bg-brand-surface px-3 py-2">
          <Txt className="text-[13px]">🪣</Txt>
          <Txt weight="semibold" className="ml-1.5 text-[12px] text-brand-ink">
            Plan confirmed · double-confirm 1 hour before
          </Txt>
        </View>
      ) : null}

      <ScrollView
        ref={scrollRef}
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 16 }}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.length === 0 ? (
          <View className="mt-24 items-center px-8">
            <Txt className="text-[34px]">💬</Txt>
            <Txt weight="bold" className="mt-2 text-center text-[15px] text-brand-ink">No messages yet</Txt>
            <Txt weight="medium" className="mt-1 text-center text-[13px] text-brand-muted">
              Say hi and start the conversation.
            </Txt>
          </View>
        ) : (
          messages.map((note) => <Bubble key={note.id} note={note} />)
        )}
      </ScrollView>

      <View
        className="flex-row items-center gap-2 border-t border-black/5 px-4 pt-2.5"
        style={{ paddingBottom: insets.bottom + 8 }}
      >
        <Input
          value={input}
          onChangeText={setInput}
          onSubmitEditing={send}
          returnKeyType="send"
          placeholder={composerPlaceholder}
          placeholderTextColor={C.muted}
          className="flex-1 rounded-full border border-black/10 bg-brand-surface px-4 py-3 text-[13.5px]"
        />
        <IconButton name="send" diameter={44} size={18} bg={C.orange} color={C.white} accessibilityLabel="Send message" onPress={send} />
      </View>
    </View>
  );
}
