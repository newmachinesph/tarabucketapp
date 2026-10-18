import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Pressable, ScrollView, View } from 'react-native';

import { IconChip, ScreenHeader, SettingsGroup, SettingsRow, Switch } from '@/components/ui/kit';
import { Txt } from '@/components/ui/txt';
import { C } from '@/lib/tokens';
import { useStore } from '@/store';

const DISTANCES: { label: string; value: number | null }[] = [
  { label: '5 km', value: 5 },
  { label: '10 km', value: 10 },
  { label: '25 km', value: 25 },
  { label: '50 km', value: 50 },
  { label: 'Anywhere', value: null },
];

const clamp = (n: number) => Math.max(18, Math.min(60, n));

export default function DiscoverySettingsScreen() {
  const location = useStore((s) => s.location);
  const prefs = useStore((s) => s.discoveryPrefs);
  const setPref = useStore((s) => s.setDiscoveryPref);

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />
      <ScreenHeader title="Location & discovery" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-5 pb-10">
        {/* Location */}
        <Txt weight="bold" className="mt-6 text-[12px] text-brand-faint" style={{ letterSpacing: 0.6 }}>LOCATION</Txt>
        <View className="mt-2.5 rounded-3xl border" style={{ borderColor: C.line }}>
          <Pressable
            onPress={() => router.replace('/(tabs)/tara')}
            className="flex-row items-center px-4 py-3.5 active:opacity-70"
            accessibilityRole="button"
            accessibilityLabel="Change location in the Tara tab"
          >
            <IconChip name="location" color={C.blue} />
            <View className="ml-3 flex-1">
              <Txt weight="semibold" className="text-[14px] text-brand-ink">{location}</Txt>
              <Txt weight="medium" className="mt-0.5 text-[12px] text-brand-muted">Change your city from the Tara tab</Txt>
            </View>
            <Ionicons name="chevron-forward" size={16} color={C.faint} />
          </Pressable>
          <View className="ml-16 h-px" style={{ backgroundColor: C.line }} />
          <View className="flex-row items-center px-4 py-3.5">
            <IconChip name="navigate" color={C.blue} size={17} />
            <Txt weight="semibold" className="ml-3 flex-1 text-[14px] text-brand-ink">Use precise location</Txt>
            <Switch value={prefs.preciseLocation} onValueChange={(v) => setPref({ preciseLocation: v })} />
          </View>
        </View>

        {/* Distance */}
        <Txt weight="bold" className="mt-7 text-[12px] text-brand-faint" style={{ letterSpacing: 0.6 }}>MAXIMUM DISTANCE</Txt>
        <View className="mt-2.5 flex-row flex-wrap gap-2">
          {DISTANCES.map((d) => {
            const active = prefs.maxDistanceKm === d.value;
            return (
              <Pressable
                key={d.label}
                onPress={() => setPref({ maxDistanceKm: d.value })}
                className="rounded-full px-4 py-2.5 active:opacity-80"
                style={{ backgroundColor: active ? C.ink : C.surface }}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
              >
                <Txt weight="semibold" className="text-[13px]" style={{ color: active ? C.white : C.muted }}>{d.label}</Txt>
              </Pressable>
            );
          })}
        </View>

        {/* Age range */}
        <Txt weight="bold" className="mt-7 text-[12px] text-brand-faint" style={{ letterSpacing: 0.6 }}>AGE RANGE</Txt>
        <Txt weight="semibold" className="mt-2 text-[14px] text-brand-ink">Show me people aged {prefs.ageMin}–{prefs.ageMax}</Txt>
        <View className="mt-3 gap-2.5">
          <Stepper
            label="Minimum"
            value={prefs.ageMin}
            onDec={() => setPref({ ageMin: clamp(prefs.ageMin - 1) })}
            onInc={() => setPref({ ageMin: Math.min(prefs.ageMax, clamp(prefs.ageMin + 1)) })}
          />
          <Stepper
            label="Maximum"
            value={prefs.ageMax}
            onDec={() => setPref({ ageMax: Math.max(prefs.ageMin, clamp(prefs.ageMax - 1)) })}
            onInc={() => setPref({ ageMax: clamp(prefs.ageMax + 1) })}
          />
        </View>

        {/* Visibility */}
        <SettingsGroup title="VISIBILITY" className="mt-7">
          <SettingsRow label="Show me on Tara discovery" right={<Switch value={prefs.showOnDiscovery} onValueChange={(v) => setPref({ showOnDiscovery: v })} />} />
          <SettingsRow divider label="Only show me to verified members" right={<Switch value={prefs.verifiedOnly} onValueChange={(v) => setPref({ verifiedOnly: v })} />} />
          <SettingsRow divider label="Hide my distance" right={<Switch value={prefs.hideDistance} onValueChange={(v) => setPref({ hideDistance: v })} />} />
        </SettingsGroup>
      </ScrollView>
    </View>
  );
}

function Stepper({ label, value, onDec, onInc }: { label: string; value: number; onDec: () => void; onInc: () => void }) {
  return (
    <View className="flex-row items-center rounded-2xl border px-4 py-2.5" style={{ borderColor: C.line }}>
      <Txt weight="semibold" className="flex-1 text-[14px] text-brand-ink">{label}</Txt>
      <Pressable onPress={onDec} className="active:opacity-60" accessibilityRole="button" accessibilityLabel={`Decrease ${label}`}>
        <Ionicons name="remove-circle-outline" size={28} color={C.muted} />
      </Pressable>
      <Txt weight="black" className="mx-4 w-8 text-center text-[16px] text-brand-ink">{value}</Txt>
      <Pressable onPress={onInc} className="active:opacity-60" accessibilityRole="button" accessibilityLabel={`Increase ${label}`}>
        <Ionicons name="add-circle-outline" size={28} color={C.orange} />
      </Pressable>
    </View>
  );
}
