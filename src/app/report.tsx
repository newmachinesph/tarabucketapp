import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Pressable, ScrollView, Switch, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar, Input, PrimaryButton, ScreenHeader } from '@/components/ui/kit';
import { useToast } from '@/components/ui/toast';
import { Txt } from '@/components/ui/txt';
import { PEOPLE } from '@/data/mock';
import { C } from '@/lib/tokens';
import { useStore } from '@/store';

const REASONS = [
  'Harassment',
  'Inappropriate behavior',
  'Fake profile',
  'Safety concern',
  'Spam',
  'Other',
] as const;

export default function ReportScreen() {
  const insets = useSafeAreaInsets();
  const toast = useToast();
  // Optional subject — profile/plan screens pass ?id=<person id>; generic entries don't.
  const { id } = useLocalSearchParams<{ id?: string }>();
  const subject = id ? PEOPLE.find((p) => p.id === id) : undefined;
  const blockUser = useStore((s) => s.blockUser);

  const [reason, setReason] = useState<string | null>(null);
  const [details, setDetails] = useState('');
  const [blockToo, setBlockToo] = useState(Boolean(subject)); // default ON when arriving from a profile

  const handleSubmit = () => {
    if (!reason) {
      toast('Pick a reason first');
      return;
    }
    toast(`Report sent: ${reason} — our Trust & Safety team reviews high-severity reports within 24 hrs`);
    if (subject && blockToo) {
      blockUser(subject.id);
      // Second step of feedback, after the first toast has had its moment.
      setTimeout(() => toast(`@${subject.handle} has been blocked`), 2400);
    }
    router.back();
  };

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />

      <ScreenHeader title="Report" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerClassName="px-5 pb-8 pt-1"
      >
        {subject && (
          <View className="mb-4 flex-row items-center rounded-2xl border p-3" style={{ borderColor: C.line }}>
            <Avatar uri={subject.avatar} size={40} />
            <View className="ml-3 flex-1">
              <Txt weight="bold" className="text-[14px] text-brand-ink">{subject.name}</Txt>
              <Txt weight="medium" className="text-[12px] text-brand-muted">@{subject.handle}</Txt>
            </View>
            <Txt weight="semibold" className="text-[11px] text-brand-faint">REPORTING</Txt>
          </View>
        )}

        <Txt weight="black" className="text-[18px] text-brand-ink">
          What&apos;s happening?
        </Txt>
        <Txt weight="medium" className="mt-1 text-[13px] text-brand-muted">
          Pick the closest reason so we can route it right.
        </Txt>

        <View className="mt-4 gap-2.5">
          {REASONS.map((r) => {
            const active = r === reason;
            return (
              <Pressable
                key={r}
                onPress={() => setReason(r)}
                className="flex-row items-center rounded-2xl border-2 px-4 py-3.5 active:opacity-80"
                style={{ borderColor: active ? C.orange : C.line, backgroundColor: active ? `${C.orange}0A` : C.white }}
              >
                <View
                  className="h-5 w-5 items-center justify-center rounded-full border-2"
                  style={{ borderColor: active ? C.orange : C.faint }}
                >
                  {active ? <View className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: C.orange }} /> : null}
                </View>
                <Txt weight="semibold" className="ml-3 text-[14px] text-brand-ink">
                  {r}
                </Txt>
              </Pressable>
            );
          })}
        </View>

        <Txt weight="bold" className="mb-2 mt-6 text-[13px] text-brand-ink">
          Add details (optional)
        </Txt>
        <Input
          value={details}
          onChangeText={setDetails}
          placeholder="What happened? Names, time, place — anything helps."
          multiline
          textAlignVertical="top"
          className="rounded-2xl border-2 px-4 py-3.5 text-[14px]"
          style={{ borderColor: C.line, minHeight: 110 }}
        />

        {subject && (
          <View className="mt-5 flex-row items-center rounded-2xl border px-4 py-3.5" style={{ borderColor: C.line }}>
            <View className="h-9 w-9 items-center justify-center rounded-full" style={{ backgroundColor: `${C.red}1A` }}>
              <Ionicons name="ban" size={17} color={C.red} />
            </View>
            <View className="ml-3 flex-1">
              <Txt weight="semibold" className="text-[14px] text-brand-ink">Also block this user</Txt>
              <Txt weight="medium" className="mt-0.5 text-[12px] text-brand-muted">
                @{subject.handle} won&apos;t see you or your plans
              </Txt>
            </View>
            <Switch
              value={blockToo}
              onValueChange={setBlockToo}
              trackColor={{ false: C.line, true: C.red }}
              thumbColor={C.white}
            />
          </View>
        )}

        <View className="mt-5 flex-row items-start rounded-2xl px-4 py-3.5" style={{ backgroundColor: C.surface }}>
          <Ionicons name="people" size={17} color={C.blue} style={{ marginTop: 1 }} />
          <Txt weight="medium" className="ml-2.5 flex-1 text-[12.5px] leading-[18px] text-brand-muted">
            Our human team reviews high-severity reports fast — not a chatbot.
          </Txt>
        </View>
      </ScrollView>

      <View className="border-t px-5 pt-3" style={{ borderColor: C.line, paddingBottom: insets.bottom + 12 }}>
        <PrimaryButton label="Submit report" icon="shield-checkmark" onPress={handleSubmit} />
      </View>
    </View>
  );
}
