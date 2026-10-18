import { router } from 'expo-router';
import { Image } from 'expo-image';
import { Pressable, ScrollView, View } from 'react-native';

import { IconButton, ScreenHeader } from '@/components/ui/kit';
import { Txt } from '@/components/ui/txt';
import { KADAS, PEOPLE } from '@/data/mock';
import { C } from '@/lib/tokens';
import { useStore } from '@/store';

const p = (id: string) => PEOPLE.find((x) => x.id === id)!;
const k = (id: string) => KADAS.find((x) => x.id === id)!;

type Convo =
  | { id: string; kind: 'kada'; kada: string; last: string; time: string; unread: number }
  | { id: string; kind: 'dm' | 'plan'; person: string; title?: string; last: string; time: string; unread: number };

// `last` is the seeded preview — only used for conversations with no thread in the store yet.
// A plan row's id must be the plan id (d…) so it resolves against `threads` and the discovery deck.
const CONVOS: Convo[] = [
  { id: 'd1', kind: 'plan', person: 'u_jio', title: 'Samgyup + soju crawl', last: 'Bea: Reserved na yung table for 6!', time: '7:01 PM', unread: 2 },
  { id: 'c2', kind: 'kada', kada: 'k1', last: 'Jio: San tayo this Friday?', time: '2h', unread: 0 },
  { id: 'c3', kind: 'kada', kada: 'k2', last: 'Paolo: Batulao this Sunday, sino sama?', time: '5h', unread: 3 },
  { id: 'c4', kind: 'dm', person: 'u_andrea', last: 'Andrea: See you sa board game night!', time: '1d', unread: 0 },
  { id: 'c5', kind: 'kada', kada: 'k6', last: 'You: Binondo crawl was busog lipos 😅', time: '2d', unread: 0 },
  { id: 'c6', kind: 'dm', person: 'u_bea', last: 'You: Salamat sa coffee hop!', time: '3d', unread: 0 },
];

function Row({ c }: { c: Convo }) {
  const readConvoIds = useStore((s) => s.readConvoIds);
  const kada = c.kind === 'kada' ? k(c.kada) : null;
  const person = c.kind !== 'kada' ? p(c.person) : null;
  const title = c.kind === 'kada' ? kada!.name : c.kind === 'plan' ? c.title! : person!.name;
  // dm → peer person id (matches seeded threads); plan → plan id; kada → kada id.
  const convoId = c.kind === 'kada' ? c.kada : c.kind === 'dm' ? c.person : c.id;
  // Live preview: the last note of this conversation's thread (so a message sent in
  // plan-note shows up here immediately). Falls back to the seed until a thread exists.
  const thread = useStore((s) => s.threads[convoId]);
  const lastNote = thread?.[thread.length - 1];
  const last = lastNote ? `${lastNote.mine ? 'You' : lastNote.from.name.split(' ')[0]}: ${lastNote.text}` : c.last;
  // Key the unread dot on the routed conversation id (what markConvoRead records), so it clears on return.
  // If the last message is yours, there is nothing to be unread about.
  const unread = c.unread > 0 && !readConvoIds.includes(convoId) && !lastNote?.mine;
  return (
    <Pressable
      onPress={() => router.push({ pathname: '/plan-note', params: { id: convoId, title, kind: c.kind } })}
      accessibilityRole="button"
      accessibilityLabel={`${title}, conversation${unread ? `, ${c.unread} unread` : ''}`}
      className="flex-row items-center px-5 py-3 active:opacity-70"
    >
      {kada ? (
        <View className="h-14 w-14 items-center justify-center rounded-2xl" style={{ backgroundColor: `${kada.color}1A` }}>
          <Txt style={{ fontSize: 26 }}>{kada.emoji}</Txt>
        </View>
      ) : (
        <Image source={{ uri: person!.avatar }} style={{ width: 56, height: 56, borderRadius: 999, backgroundColor: C.surface }} />
      )}
      <View className="ml-3 flex-1">
        <View className="flex-row items-center">
          <Txt weight="bold" className="flex-1 text-[15px] text-brand-ink" numberOfLines={1}>
            {title}
          </Txt>
          {c.kind === 'plan' && (
            <View className="ml-2 rounded-full px-2 py-0.5" style={{ backgroundColor: `${C.orange}1A` }}>
              <Txt weight="bold" className="text-[10px]" style={{ color: C.orangeDark }}>
                Plan
              </Txt>
            </View>
          )}
        </View>
        <Txt weight={unread ? 'semibold' : 'medium'} className="mt-0.5 text-[13px]" style={{ color: unread ? C.ink : C.muted }} numberOfLines={1}>
          {last}
        </Txt>
      </View>
      <View className="ml-2 items-end">
        <Txt weight="medium" className="text-[11px] text-brand-faint">{c.time}</Txt>
        {unread && (
          <View className="mt-1.5 h-5 min-w-[20px] items-center justify-center rounded-full px-1.5" style={{ backgroundColor: C.orange }}>
            <Txt weight="bold" className="text-[11px] text-white">{c.unread}</Txt>
          </View>
        )}
      </View>
    </Pressable>
  );
}

export default function MessagesScreen() {
  return (
    <View className="flex-1 bg-white">
      <ScreenHeader
        title="Messages"
        right={
          <IconButton
            name="create-outline"
            diameter={40}
            size={22}
            accessibilityLabel="Find people to message"
            onPress={() => router.push({ pathname: '/search', params: { type: 'people' } })}
          />
        }
      />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="pb-8 pt-1">
        {CONVOS.map((c) => (
          <Row key={c.id} c={c} />
        ))}
      </ScrollView>
    </View>
  );
}
