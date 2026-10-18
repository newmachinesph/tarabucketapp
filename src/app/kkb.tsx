import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Pressable, ScrollView, Share, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconButton, Input, Switch } from '@/components/ui/kit';
import { useToast } from '@/components/ui/toast';
import { Txt } from '@/components/ui/txt';
import { hLight } from '@/lib/haptics';
import { C } from '@/lib/tokens';

// Manual thousands separator — avoids Intl/Hermes locale gaps on device.
const peso = (n: number) => '₱' + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
const MIN_HEADS = 1;
const MAX_HEADS = 20;
const ADJUST_STEP = 10; // ₱ per tap in uneven mode

export default function KkbScreen() {
  const insets = useSafeAreaInsets();
  const toast = useToast();
  // Prefill from ?amount=&people= (plan detail links here with the going count).
  const { amount: amountParam, people: peopleParam } = useLocalSearchParams<{ amount?: string; people?: string }>();
  const [bill, setBill] = useState(() => {
    const n = parseFloat(String(amountParam ?? '').replace(/[^0-9.]/g, ''));
    return Number.isFinite(n) && n > 0 ? String(n) : '';
  });
  const [heads, setHeads] = useState(() => {
    const n = parseInt(String(peopleParam ?? ''), 10);
    return Number.isFinite(n) ? Math.min(MAX_HEADS, Math.max(MIN_HEADS, n)) : 4;
  });
  const [serviceCharge, setServiceCharge] = useState(false);
  const [treat, setTreat] = useState(false); // "sagot ko" — I cover everyone
  const [uneven, setUneven] = useState(false);
  const [adjust, setAdjust] = useState<number[]>([]); // ₱ delta per person vs. the even baseline

  const raw = parseFloat(bill.replace(/[^0-9.]/g, '')) || 0;
  const total = serviceCharge ? raw * 1.1 : raw;
  const perHead = treat ? 0 : heads > 0 ? total / heads : 0;

  const adjustAt = (i: number) => adjust[i] ?? 0;
  // Deltas are ₱10 multiples, so the sum is exact — the === 0 reconcile check is safe.
  const sumAdj = Array.from({ length: heads }, (_, i) => adjustAt(i)).reduce((a, b) => a + b, 0);
  const bump = (i: number, delta: number) => {
    if (perHead + adjustAt(i) + delta < 0) return; // nobody pays negative
    hLight();
    setAdjust((prev) => {
      const next = [...prev];
      next[i] = (next[i] ?? 0) + delta;
      return next;
    });
  };
  const requestGcash = (amt: number, person: string) =>
    Share.share({ message: `GCash request: ${peso(amt)} for our KKB split — ${person}` }).catch(() => {});

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />
      <View className="flex-row items-center px-4 pb-2" style={{ paddingTop: insets.top + 4 }}>
        <IconButton name="chevron-back" diameter={40} size={22} accessibilityLabel="Go back" onPress={() => router.back()} />
        <View className="ml-2">
          <Txt weight="black" className="text-[20px] text-brand-ink">KKB calculator</Txt>
          <Txt weight="medium" className="text-[11.5px] text-brand-muted">Kanya-kanyang bayad, no awkward math</Txt>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-5 pb-10">
        {/* Result */}
        <View className="mt-4 items-center rounded-3xl p-6" style={{ backgroundColor: `${C.orange}0F` }}>
          <Txt weight="semibold" className="text-[12px] text-brand-muted" style={{ letterSpacing: 0.4 }}>
            {treat ? 'YOU COVER' : uneven ? 'EVEN BASELINE — ADJUST BELOW' : 'EACH PERSON PAYS'}
          </Txt>
          <Txt weight="black" style={{ fontSize: 44, color: C.orangeDark, lineHeight: 50 }}>
            {peso(treat ? total : perHead)}
          </Txt>
          {treat ? (
            <Txt weight="semibold" className="mt-1 text-[13px]" style={{ color: C.orange }}>
              Sagot mo lahat — ang lakas mo 😎
            </Txt>
          ) : (
            <Txt weight="medium" className="mt-1 text-[13px] text-brand-muted">
              {peso(total)} split {heads} way{heads === 1 ? '' : 's'}
            </Txt>
          )}
        </View>

        {/* Bill */}
        <Txt weight="bold" className="mt-6 text-[12px] text-brand-faint" style={{ letterSpacing: 0.6 }}>TOTAL BILL</Txt>
        <View className="mt-2.5 flex-row items-center rounded-2xl border px-4" style={{ borderColor: C.line }}>
          <Txt weight="bold" className="text-[20px] text-brand-ink">₱</Txt>
          <Input
            weight="bold"
            value={bill}
            onChangeText={setBill}
            placeholder="0"
            keyboardType="decimal-pad"
            className="ml-2 flex-1 py-3.5 text-[20px]"
          />
        </View>
        <View className="mt-3 flex-row items-center rounded-2xl border px-4 py-3" style={{ borderColor: C.line }}>
          <Ionicons name="receipt-outline" size={17} color={C.muted} />
          <Txt weight="semibold" className="ml-2 flex-1 text-[14px] text-brand-ink">Add 10% service charge</Txt>
          <Switch value={serviceCharge} onValueChange={setServiceCharge} />
        </View>

        {/* Heads */}
        <Txt weight="bold" className="mt-6 text-[12px] text-brand-faint" style={{ letterSpacing: 0.6 }}>HOW MANY HEADS</Txt>
        <View className="mt-2.5 flex-row items-center rounded-2xl border px-4 py-2.5" style={{ borderColor: C.line, opacity: treat ? 0.5 : 1 }}>
          <Ionicons name="people-outline" size={18} color={C.muted} />
          <Txt weight="semibold" className="ml-2 flex-1 text-[14px] text-brand-ink">Sharing the bill</Txt>
          <IconButton name="remove" diameter={40} size={22} color={heads <= MIN_HEADS ? C.faint : C.ink} accessibilityLabel="Fewer heads" onPress={() => { hLight(); setHeads((c) => Math.max(MIN_HEADS, c - 1)); }} />
          <Txt weight="black" className="mx-3 text-[20px] text-brand-ink" style={{ minWidth: 24, textAlign: 'center' }}>{heads}</Txt>
          <IconButton name="add" diameter={40} size={22} color={heads >= MAX_HEADS ? C.faint : C.ink} accessibilityLabel="More heads" onPress={() => { hLight(); setHeads((c) => Math.min(MAX_HEADS, c + 1)); }} />
        </View>

        {/* Uneven split */}
        <View className="mt-3 flex-row items-center rounded-2xl border px-4 py-3" style={{ borderColor: C.line, opacity: treat ? 0.5 : 1 }}>
          <Ionicons name="options-outline" size={17} color={C.muted} />
          <View className="ml-2 flex-1">
            <Txt weight="semibold" className="text-[14px] text-brand-ink">Uneven split</Txt>
            <Txt weight="medium" className="text-[11.5px] text-brand-muted">May extra drinks si bes? Adjust per head</Txt>
          </View>
          <Switch value={uneven} onValueChange={(v) => { hLight(); setUneven(v); }} disabled={treat} />
        </View>

        {uneven && !treat && (
          <View className="mt-3 overflow-hidden rounded-2xl border" style={{ borderColor: C.line }}>
            {Array.from({ length: heads }, (_, i) => {
              const amt = perHead + adjustAt(i);
              const adjusted = adjustAt(i) !== 0;
              return (
                <View
                  key={i}
                  className="flex-row items-center px-4 py-2"
                  style={i > 0 ? { borderTopWidth: 1, borderTopColor: C.line } : undefined}
                >
                  <View className="flex-1">
                    <Txt weight="semibold" className="text-[12.5px] text-brand-muted">Person {i + 1}</Txt>
                    <Txt weight="black" className="text-[15px]" style={{ color: adjusted ? C.orangeDark : C.ink }}>
                      {peso(amt)}
                    </Txt>
                  </View>
                  <IconButton
                    name="remove"
                    diameter={34}
                    size={18}
                    accessibilityLabel={`Person ${i + 1} pays less`}
                    onPress={() => bump(i, -ADJUST_STEP)}
                  />
                  <View style={{ width: 6 }} />
                  <IconButton
                    name="add"
                    diameter={34}
                    size={18}
                    accessibilityLabel={`Person ${i + 1} pays more`}
                    onPress={() => bump(i, ADJUST_STEP)}
                  />
                  <Pressable
                    onPress={() => requestGcash(amt, `Person ${i + 1}`)}
                    accessibilityRole="button"
                    accessibilityLabel={`Request ${peso(amt)} from person ${i + 1} via GCash`}
                    className="ml-2 flex-row items-center rounded-full px-3 py-2 active:opacity-80"
                    style={{ backgroundColor: `${C.blue}1A` }}
                  >
                    <Ionicons name="cash-outline" size={14} color={C.blue} />
                    <Txt weight="bold" className="ml-1 text-[11px] text-brand-blue">GCash</Txt>
                  </Pressable>
                </View>
              );
            })}
            {/* Running remainder — the split must land back on the bill */}
            <View
              className="flex-row items-center px-4 py-3"
              style={{ borderTopWidth: 1, borderTopColor: C.line, backgroundColor: sumAdj === 0 ? `${C.green}0A` : `${C.red}0A` }}
            >
              <Ionicons
                name={sumAdj === 0 ? 'checkmark-circle' : 'alert-circle'}
                size={15}
                color={sumAdj === 0 ? C.green : C.red}
              />
              <Txt weight="bold" className="ml-2 flex-1 text-[12px]" style={{ color: sumAdj === 0 ? C.green : C.red }}>
                {sumAdj === 0
                  ? 'Totals reconcile ✓ — walang lugi'
                  : `${peso(Math.abs(sumAdj))} ${sumAdj > 0 ? 'over the bill — minus somewhere' : 'short of the bill — plus somewhere'}`}
              </Txt>
            </View>
          </View>
        )}
        {uneven && !treat && (
          <Txt weight="medium" className="mt-2 text-[11px] text-brand-faint">
            Demo — opens your GCash request in the real app someday.
          </Txt>
        )}

        {/* Sagot ko */}
        <Pressable
          onPress={() => { hLight(); setTreat((v) => !v); }}
          className="mt-3 flex-row items-center rounded-2xl border p-3.5 active:opacity-80"
          style={{ borderColor: treat ? C.orange : C.line, backgroundColor: treat ? `${C.orange}0A` : C.white }}
          accessibilityRole="switch"
          accessibilityState={{ checked: treat }}
        >
          <View className="h-9 w-9 items-center justify-center rounded-full" style={{ backgroundColor: `${C.orange}1A` }}>
            <Txt style={{ fontSize: 18 }}>😎</Txt>
          </View>
          <View className="ml-3 flex-1">
            <Txt weight="bold" className="text-[14px] text-brand-ink">Sagot ko na lahat</Txt>
            <Txt weight="medium" className="text-[12px] text-brand-muted">You treat the whole barkada</Txt>
          </View>
          <View className="h-6 w-6 items-center justify-center rounded-full border-2" style={{ borderColor: treat ? C.orange : C.faint, backgroundColor: treat ? C.orange : 'transparent' }}>
            {treat && <Ionicons name="checkmark" size={14} color={C.white} />}
          </View>
        </Pressable>

        <Pressable
          onPress={() => {
            const summary = treat
              ? `KKB split — total ${peso(total)}, sagot ko lahat 😎`
              : uneven
                ? `KKB split — total ${peso(total)}\n` +
                  Array.from({ length: heads }, (_, i) => `Person ${i + 1}: ${peso(perHead + adjustAt(i))}`).join('\n')
                : `KKB split — total ${peso(total)}, ${peso(perHead)} each (${heads} head${heads === 1 ? '' : 's'})`;
            Share.share({ message: summary }).catch(() => {});
            toast('Split ready to share ✓');
          }}
          className="mt-6 flex-row items-center justify-center rounded-2xl border py-3.5 active:opacity-70"
          style={{ borderColor: C.line }}
          accessibilityRole="button"
          accessibilityLabel="Copy split for the group chat"
        >
          <Ionicons name="copy-outline" size={17} color={C.blue} />
          <Txt weight="bold" className="ml-2 text-[14px] text-brand-blue">Copy split for the GC</Txt>
        </Pressable>

        <View className="mt-5 flex-row items-start rounded-2xl px-4 py-3" style={{ backgroundColor: C.surface }}>
          <Ionicons name="shield-checkmark" size={15} color={C.green} style={{ marginTop: 1 }} />
          <Txt weight="medium" className="ml-2 flex-1 text-[12px] leading-[17px] text-brand-muted">
            Tara never holds your money — settle at the venue via GCash or cash. This just does the math.
          </Txt>
        </View>
      </ScrollView>
    </View>
  );
}
