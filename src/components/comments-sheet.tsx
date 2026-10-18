import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';

import { Avatar, IconButton, Input } from '@/components/ui/kit';
import { Sheet } from '@/components/ui/sheet';
import { Txt } from '@/components/ui/txt';
import { hLight } from '@/lib/haptics';
import { C } from '@/lib/tokens';
import { useStore, type Comment } from '@/store';

function CommentRow({ c }: { c: Comment }) {
  return (
    <View className="mb-3 flex-row">
      <Avatar uri={c.from.avatar} size={30} />
      <View className="ml-2.5 flex-1">
        <View
          className="self-start rounded-2xl rounded-tl-md px-3.5 py-2.5"
          style={{ backgroundColor: c.mine ? `${C.orange}14` : C.surface }}
        >
          <View className="flex-row items-center">
            <Txt weight="bold" className="text-[12px] text-brand-ink">
              {c.mine ? 'You' : c.from.name.split(' ')[0]}
            </Txt>
            <Txt weight="medium" className="ml-1.5 text-[10px] text-brand-muted">
              {c.time}
            </Txt>
          </View>
          <Txt weight="medium" className="mt-0.5 text-[13px] leading-[18px] text-brand-ink">
            {c.text}
          </Txt>
        </View>
      </View>
    </View>
  );
}

export function CommentsSheet({ postId, title, onClose }: { postId: string; title: string; onClose: () => void }) {
  const comments = useStore((s) => s.postComments[postId]) ?? [];
  const addComment = useStore((s) => s.addComment);
  const [input, setInput] = useState('');

  const send = () => {
    const text = input.trim();
    if (!text) return;
    hLight();
    addComment(postId, text);
    setInput('');
  };

  return (
    <Sheet visible onClose={onClose} paddingBottom={8}>
      {/* Inside the card: the KAV pads the card's own bottom, lifting the composer clear of the keyboard. */}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Txt weight="black" className="text-[16px] text-brand-ink" numberOfLines={1}>
          Comments · {title}
        </Txt>
        <ScrollView
          style={{ maxHeight: 340 }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: 12, paddingBottom: 4 }}
        >
          {comments.length === 0 ? (
            <Txt weight="medium" className="py-8 text-center text-[13px] text-brand-muted">
              Wala pang comment — ikaw na mag-first! 💬
            </Txt>
          ) : (
            comments.map((c) => <CommentRow key={c.id} c={c} />)
          )}
        </ScrollView>
        <View className="flex-row items-center gap-2 border-t border-black/5 pt-2.5">
          <Input
            value={input}
            onChangeText={setInput}
            onSubmitEditing={send}
            returnKeyType="send"
            placeholder="Mag-comment ka…"
            placeholderTextColor={C.muted}
            className="flex-1 rounded-full border border-black/10 bg-brand-surface px-4 py-3 text-[13.5px]"
          />
          <IconButton name="send" diameter={44} size={18} bg={C.orange} color={C.white} accessibilityLabel="Send comment" onPress={send} />
        </View>
      </KeyboardAvoidingView>
    </Sheet>
  );
}
