// ── i18n demo layer ─────────────────────────────────────────────────
// Frontend demo of real localization: the language chosen in Preferences
// (Taglish / English / Bisaya) changes live copy wherever `useT()` is used.
// ponytail: tiny string table, swap for i18next + full catalogs when copy grows.

import { useStore } from '@/store';

const STRINGS = {
  greeting: {
    taglish: 'Kumusta! G ka ba today?',
    english: 'Hey there! Ready to head out?',
    bisaya: 'Kumusta! Andam na ka karon?',
  },
  tagline: {
    taglish: 'Gawing totoong lakad ang "tara, minsan".',
    english: 'Turn "someday" into a real plan.',
    bisaya: 'Himuong tinuod nga laag ang "puhon".',
  },
  letsGo: {
    taglish: 'Tara na!',
    english: "Let's go!",
    bisaya: 'Tara na!',
  },
  seePlans: {
    taglish: 'Tingnan ang mga lakad malapit sa’yo',
    english: 'See plans near you',
    bisaya: 'Tan-awa ang mga laag duol nimo',
  },
  previewLine: {
    taglish: 'Ganito kakausapin ka ng app 🇵🇭',
    english: 'This is how the app will talk to you',
    bisaya: 'Ing-ani ka istorya sa app nimo 🇵🇭',
  },
} as const;

type StringKey = keyof typeof STRINGS;

/** Hook: returns a translator bound to the language picked in Preferences. */
export const useT = () => {
  const lang = useStore((s) => s.prefs.language);
  return (key: StringKey) => STRINGS[key][lang];
};
