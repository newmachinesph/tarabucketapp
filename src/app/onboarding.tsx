import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Chip, IconButton, PrimaryButton, Screen } from '@/components/ui/kit';
import { Txt } from '@/components/ui/txt';
import { PH_LOCATIONS } from '@/data/locations';
import { INTERESTS } from '@/data/mock';
import { hLight, hSuccess } from '@/lib/haptics';
import { C } from '@/lib/tokens';
import { useStore } from '@/store';

const MIN_INTERESTS = 3;

function Dots({ step }: { step: number }) {
  return (
    <View className="flex-row items-center">
      {[0, 1].map((i) => (
        <View
          key={i}
          className="mr-1.5 h-2 rounded-full"
          style={{ width: step === i ? 22 : 8, backgroundColor: step === i ? C.orange : C.line }}
        />
      ))}
    </View>
  );
}

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const storeInterests = useStore((s) => s.interests);
  const location = useStore((s) => s.location);
  const setInterests = useStore((s) => s.setInterests);
  const setLocation = useStore((s) => s.setLocation);

  const [step, setStep] = useState<0 | 1>(0);
  const [selected, setSelected] = useState<string[]>(storeInterests);
  const [city, setCity] = useState(location);

  const toggle = (tag: string) => {
    hLight();
    setSelected((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const skip = () => router.replace('/(tabs)/tara');

  const next = () => {
    if (selected.length < MIN_INTERESTS) return;
    setInterests(selected);
    hLight();
    setStep(1);
  };

  const finish = () => {
    setLocation(city);
    hSuccess();
    router.replace('/(tabs)/tara');
  };

  const needMore = MIN_INTERESTS - selected.length;

  return (
    <Screen>
      <StatusBar style="dark" />

      <View className="flex-row items-center justify-between px-4 pb-2 pt-1">
        <View className="flex-row items-center">
          {step === 1 && (
            <IconButton name="chevron-back" diameter={40} size={22} accessibilityLabel="Back to interests" onPress={() => setStep(0)} />
          )}
          <View className={step === 1 ? 'ml-2' : 'ml-1'}>
            <Dots step={step} />
          </View>
        </View>
        <Pressable onPress={skip} className="px-2 py-1.5 active:opacity-70" accessibilityRole="button" accessibilityLabel="Skip onboarding">
          <Txt weight="semibold" className="text-[13px] text-brand-muted">Skip muna</Txt>
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-5 pb-8">
        {step === 0 ? (
          <>
            <Txt weight="black" className="mt-2 text-[24px] text-brand-ink">Ano ang trip mo? ✨</Txt>
            <Txt weight="medium" className="mt-1 text-[13.5px] leading-[20px] text-brand-muted">
              Pumili ng at least {MIN_INTERESTS} — gagamitin namin &rsquo;to para mag-suggest ng plans na bet mo talaga.
            </Txt>
            <View className="mt-5 flex-row flex-wrap gap-2">
              {INTERESTS.map((tag) => (
                <Chip key={tag} label={tag} active={selected.includes(tag)} onPress={() => toggle(tag)} />
              ))}
            </View>
          </>
        ) : (
          <>
            <Txt weight="black" className="mt-2 text-[24px] text-brand-ink">Saan ka based? 📍</Txt>
            <Txt weight="medium" className="mt-1 text-[13.5px] leading-[20px] text-brand-muted">
              Para ma-match ka sa mga plans na malapit lang sa&rsquo;yo.
            </Txt>
            {PH_LOCATIONS.map((group) => (
              <View key={group.region}>
                <Txt weight="bold" className="mt-6 text-[12px] text-brand-faint" style={{ letterSpacing: 0.6 }}>
                  {group.region.toUpperCase()}
                </Txt>
                <View className="mt-2.5 flex-row flex-wrap gap-2">
                  {group.places.map((place) => (
                    <Chip
                      key={place}
                      label={place}
                      active={city === place}
                      onPress={() => {
                        hLight();
                        setCity(place);
                      }}
                    />
                  ))}
                </View>
              </View>
            ))}
          </>
        )}
      </ScrollView>

      <View className="border-t px-5 pt-3" style={{ borderColor: C.line, paddingBottom: insets.bottom + 10 }}>
        {step === 0 ? (
          <>
            <Txt weight="semibold" className="mb-2 text-center text-[12px] text-brand-muted">
              {needMore > 0 ? `Pili pa ng ${needMore} para tuloy tayo` : `${selected.length} picked — solid! 🙌`}
            </Txt>
            <View pointerEvents={needMore > 0 ? 'none' : 'auto'} style={{ opacity: needMore > 0 ? 0.45 : 1 }}>
              <PrimaryButton label="Next" icon="arrow-forward" onPress={next} />
            </View>
          </>
        ) : (
          <PrimaryButton label="Tara na!" emoji="🎉" onPress={finish} />
        )}
      </View>
    </Screen>
  );
}
