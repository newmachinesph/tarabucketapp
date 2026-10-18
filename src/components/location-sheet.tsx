import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { Input } from '@/components/ui/kit';
import { Sheet } from '@/components/ui/sheet';
import { Txt } from '@/components/ui/txt';
import { PH_LOCATIONS } from '@/data/locations';
import { hLight } from '@/lib/haptics';
import { C } from '@/lib/tokens';

// Location picker — separate from the category filter. Browse plans anywhere in PH.
export function LocationSheet({ current, onPick, onClose }: { current: string; onPick: (loc: string) => void; onClose: () => void }) {
  const [q, setQ] = useState('');
  const groups = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return PH_LOCATIONS;
    return PH_LOCATIONS.map((g) => ({ region: g.region, places: g.places.filter((p) => p.toLowerCase().includes(query)) })).filter(
      (g) => g.places.length > 0,
    );
  }, [q]);

  return (
    // ponytail: the list is the whole sheet, so it gets a fixed height and rides the safe-area inset alone.
    <Sheet visible onClose={onClose} height="84%" paddingBottom={0}>
      <Txt weight="black" className="text-[20px] text-brand-ink">
        Where to?
      </Txt>
      <Txt weight="medium" className="mt-0.5 text-[12.5px] text-brand-muted">
        Browse plans anywhere in the Philippines
      </Txt>
      <View className="mt-3 flex-row items-center rounded-2xl px-3.5" style={{ backgroundColor: C.surface }}>
        <Ionicons name="search" size={18} color={C.faint} />
        <Input
          value={q}
          onChangeText={setQ}
          placeholder="Search city or place"
          className="ml-2 flex-1 py-3 text-[15px]"
        />
        {q ? (
          <Pressable onPress={() => setQ('')} accessibilityRole="button" accessibilityLabel="Clear search">
            <Ionicons name="close-circle" size={18} color={C.faint} />
          </Pressable>
        ) : null}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="pb-10 pt-1">
        {groups.map((g) => (
          <View key={g.region} className="mt-4">
            <Txt weight="bold" className="text-[12px] text-brand-faint" style={{ letterSpacing: 0.6 }}>
              {g.region.toUpperCase()}
            </Txt>
            <View className="mt-2 overflow-hidden rounded-2xl border border-brand-line">
              {g.places.map((p, i) => {
                const active = p === current;
                return (
                  <View key={p}>
                    {i > 0 && <View className="ml-11 h-px bg-brand-line" />}
                    <Pressable
                      onPress={() => {
                        hLight();
                        onPick(p);
                        onClose();
                      }}
                      className="flex-row items-center px-4 py-3 active:opacity-70"
                      accessibilityRole="button"
                      accessibilityLabel={p}
                    >
                      <Ionicons name="location-outline" size={16} color={active ? C.orange : C.faint} />
                      <Txt
                        weight={active ? 'bold' : 'medium'}
                        className="ml-3 flex-1 text-[14px]"
                        style={{ color: active ? C.orange : C.ink }}
                      >
                        {p}
                      </Txt>
                      {active && <Ionicons name="checkmark-circle" size={18} color={C.orange} />}
                    </Pressable>
                  </View>
                );
              })}
            </View>
          </View>
        ))}
        {groups.length === 0 && (
          <View className="items-center pt-16">
            <Txt weight="semibold" className="text-[14px] text-brand-muted">
              No places match “{q}”
            </Txt>
          </View>
        )}
      </ScrollView>
    </Sheet>
  );
}
