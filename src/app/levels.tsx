import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { ScrollView, View } from 'react-native';

import { ScreenHeader, StatusPill } from '@/components/ui/kit';
import { Txt } from '@/components/ui/txt';
import { C } from '@/lib/tokens';
import { useStore } from '@/store';

const UNLOCKS: { level: number; emoji: string; title: string; sub: string }[] = [
  { level: 5, emoji: '👥', title: 'Bigger kada cap', sub: 'Mas maraming barkada — up to 30 members' },
  { level: 8, emoji: '🍽️', title: 'Early Tara Tables access', sub: 'Una kang makaka-reserve bago mag-open sa lahat' },
  { level: 10, emoji: '⭐', title: 'Premium badge week', sub: 'Isang linggo ng Premium perks, libre' },
];

export default function LevelsScreen() {
  const stats = useStore((s) => s.stats);

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />

      <ScreenHeader title="How levels work" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-5 pb-10">
        {/* Demo banner */}
        <View className="mt-3 flex-row items-start rounded-2xl p-3.5" style={{ backgroundColor: C.surface }}>
          <Ionicons name="information-circle" size={16} color={C.blue} style={{ marginTop: 1 }} />
          <Txt weight="medium" className="ml-2 flex-1 text-[12.5px] leading-[18px] text-brand-muted">
            Demo — unlocks are illustrative. Leveling up is live na; yung rewards, paparating pa lang.
          </Txt>
        </View>

        {/* Tara Level */}
        <Txt weight="bold" className="mt-7 text-[12px] text-brand-faint" style={{ letterSpacing: 0.6 }}>
          TARA LEVEL — IKAW
        </Txt>
        <View className="mt-2.5 rounded-3xl p-4" style={{ backgroundColor: `${C.orange}12` }}>
          <View className="flex-row items-center justify-between">
            <Txt weight="black" className="text-[15px]" style={{ color: C.orangeDark }}>
              You&rsquo;re Level {stats.level} 🔥
            </Txt>
            <StatusPill live />
          </View>
          <Txt weight="medium" className="mt-2 text-[12.5px] leading-[19px] text-brand-muted">
            Personal XP mo &rsquo;to — tumataas kada plan na natupad. Sumali ka ng plan, mag-host, or panatilihin ang
            weekly streak mo para mas mabilis mag-level up.
          </Txt>
          <View className="mt-3">
            <Txt weight="semibold" className="text-[12.5px] text-brand-ink">🎟 Join a plan — XP kada natupad na Tara</Txt>
            <Txt weight="semibold" className="mt-1.5 text-[12.5px] text-brand-ink">📣 Host a plan — mas malaking XP pag ikaw ang nag-aya</Txt>
            <Txt weight="semibold" className="mt-1.5 text-[12.5px] text-brand-ink">⚡ Streak bonus — extra XP kada week na may plan ka</Txt>
          </View>
        </View>

        {/* Kada Level */}
        <Txt weight="bold" className="mt-7 text-[12px] text-brand-faint" style={{ letterSpacing: 0.6 }}>
          KADA LEVEL — KAYONG LAHAT
        </Txt>
        <View className="mt-2.5 rounded-3xl p-4" style={{ backgroundColor: `${C.blue}12` }}>
          <View className="flex-row items-center justify-between">
            <Txt weight="black" className="text-[15px]" style={{ color: C.blueDark }}>
              Sama-sama kayong aangat 🪣
            </Txt>
            <StatusPill live />
          </View>
          <Txt weight="medium" className="mt-2 text-[12.5px] leading-[19px] text-brand-muted">
            Ang kada level ay group effort — every 5 plans na natupad ng buong kada, +1 level. Kaya mas madalas
            kayong lumabas, mas mataas ang level ng barkada niyo.
          </Txt>
        </View>

        {/* Unlocks */}
        <Txt weight="bold" className="mt-7 text-[12px] text-brand-faint" style={{ letterSpacing: 0.6 }}>
          UNLOCKS
        </Txt>
        <View className="mt-2.5 overflow-hidden rounded-3xl border" style={{ borderColor: C.line }}>
          {UNLOCKS.map((u, i) => (
            <View key={u.level}>
              {i > 0 && <View className="ml-16 h-px" style={{ backgroundColor: C.line }} />}
              <View className="flex-row items-center px-4 py-3.5">
                <View className="h-10 w-10 items-center justify-center rounded-full bg-brand-surface">
                  <Txt style={{ fontSize: 18 }}>{u.emoji}</Txt>
                </View>
                <View className="ml-3 flex-1">
                  <Txt weight="bold" className="text-[14px] text-brand-ink">
                    Level {u.level} · {u.title}
                  </Txt>
                  <Txt weight="medium" className="mt-0.5 text-[12px] text-brand-muted">
                    {u.sub}
                  </Txt>
                </View>
                <StatusPill live={false} />
              </View>
            </View>
          ))}
        </View>

        <Txt weight="medium" className="mt-5 text-center text-[12px] text-brand-faint">
          Walang mawawala pag hindi ka lumabas — levels go up lang, never down. 😌
        </Txt>
      </ScrollView>
    </View>
  );
}
