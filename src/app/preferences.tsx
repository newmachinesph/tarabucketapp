import { StatusBar } from 'expo-status-bar';
import { ScrollView, View } from 'react-native';

import { ScreenHeader, SettingsGroup, SettingsRow, StatusPill, Switch } from '@/components/ui/kit';
import { Txt } from '@/components/ui/txt';
import { useT } from '@/lib/i18n';
import { C } from '@/lib/tokens';
import { useStore } from '@/store';

const LANGS = [
  { key: 'taglish', label: 'Taglish' },
  { key: 'english', label: 'English' },
  { key: 'bisaya', label: 'Bisaya' },
] as const;

const THEMES = [
  { key: 'light', label: '☀️ Light' },
  { key: 'dark', label: '🌙 Dark' },
] as const;

// ponytail: both pickers show the shipped value and nothing else — the language table is 5 keys deep
// and dark mode doesn't exist, so an interactive control here would be a lie. Wire them up when the
// catalog and the dark palette land.
export default function PreferencesScreen() {
  const prefs = useStore((s) => s.prefs);
  const setPrefs = useStore((s) => s.setPrefs);
  const t = useT();

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />
      <ScreenHeader title="App preferences" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-5 pb-10">
        <View className="mt-6 flex-row items-center justify-between">
          <Txt weight="bold" className="text-[12px] text-brand-faint" style={{ letterSpacing: 0.6 }}>LANGUAGE</Txt>
          <StatusPill live={false} />
        </View>
        <View className="mt-2.5 flex-row gap-2" style={{ opacity: 0.5 }}>
          {LANGS.map((l) => (
            <View
              key={l.key}
              className="flex-1 items-center rounded-full py-2.5"
              style={{ backgroundColor: prefs.language === l.key ? C.ink : C.surface }}
            >
              <Txt weight="semibold" className="text-[13px]" style={{ color: prefs.language === l.key ? C.white : C.muted }}>{l.label}</Txt>
            </View>
          ))}
        </View>
        <Txt weight="medium" className="mt-2 text-[12px] text-brand-muted">
          Taglish muna ang buong app — English at Bisaya, paparating pa.
        </Txt>

        {/* The app's voice, in the language that actually ships today. */}
        <View className="mt-3 rounded-2xl px-4 py-3.5" style={{ backgroundColor: C.surface }}>
          <Txt weight="bold" className="text-[14px] text-brand-ink">{t('greeting')}</Txt>
          <Txt weight="medium" className="mt-0.5 text-[12px] text-brand-muted">{t('previewLine')}</Txt>
        </View>

        <View className="mt-6 flex-row items-center justify-between">
          <Txt weight="bold" className="text-[12px] text-brand-faint" style={{ letterSpacing: 0.6 }}>APPEARANCE</Txt>
          <StatusPill live={false} />
        </View>
        <View className="mt-2.5 flex-row gap-2" style={{ opacity: 0.5 }}>
          {THEMES.map((th) => (
            <View
              key={th.key}
              className="flex-1 items-center rounded-full py-2.5"
              style={{ backgroundColor: prefs.theme === th.key ? C.ink : C.surface }}
            >
              <Txt weight="semibold" className="text-[13px]" style={{ color: prefs.theme === th.key ? C.white : C.muted }}>{th.label}</Txt>
            </View>
          ))}
        </View>
        <Txt weight="medium" className="mt-2 text-[12px] text-brand-muted">
          Light lang muna ang buong app — dark mode, paparating pa.
        </Txt>

        <SettingsGroup title="DATA" className="mt-6">
          <SettingsRow icon="cellular" color={C.blue} label="Data saver" sub="Load lighter images on cellular — tipid sa load" right={<Switch value={prefs.dataSaver} onValueChange={(v) => setPrefs({ dataSaver: v })} />} />
        </SettingsGroup>

        <SettingsGroup title="MOTION" className="mt-6">
          <SettingsRow icon="accessibility" color={C.green} label="Reduce motion" sub="Fewer animations across the app" right={<Switch value={prefs.reduceMotion} onValueChange={(v) => setPrefs({ reduceMotion: v })} />} />
        </SettingsGroup>

      </ScrollView>
    </View>
  );
}
