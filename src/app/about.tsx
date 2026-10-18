import { Ionicons } from '@expo/vector-icons';
import { router, type Href } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import type { ComponentProps } from 'react';
import { Linking, ScrollView, Share, View } from 'react-native';

import { ScreenHeader, SettingsGroup, SettingsRow } from '@/components/ui/kit';
import { useToast } from '@/components/ui/toast';
import { Txt } from '@/components/ui/txt';
import { C } from '@/lib/tokens';

type IoniconName = ComponentProps<typeof Ionicons>['name'];
type LinkRow = { icon: IoniconName; label: string; color: string };

const LEGAL: LinkRow[] = [
  { icon: 'document-text-outline', label: 'Terms of Service', color: C.ink },
  { icon: 'lock-closed-outline', label: 'Privacy Policy', color: C.blue },
  { icon: 'people-outline', label: 'Community Guidelines', color: C.violet },
];
const APP: LinkRow[] = [
  { icon: 'star-outline', label: 'Rate Tara Bucket', color: C.orange },
  { icon: 'share-social-outline', label: 'Share the app', color: C.green },
  { icon: 'mail-outline', label: 'Contact us', color: C.blue },
  { icon: 'code-slash-outline', label: 'Open-source licenses', color: C.muted },
];

export default function AboutScreen() {
  const toast = useToast();
  const onOpen = (label: string) => {
    switch (label) {
      case 'Terms of Service':
        router.push('/legal?doc=terms');
        break;
      case 'Privacy Policy':
        router.push('/legal?doc=privacy');
        break;
      case 'Community Guidelines':
        router.push('/legal?doc=guidelines');
        break;
      case 'Contact us':
        Linking.openURL('mailto:hello@tarabucket.ph').catch(() => toast('Could not open your mail app'));
        break;
      case 'Share the app':
        Share.share({ message: 'Check out Tara Bucket — plan real-world meetups with your barkada!' }).catch(() => {});
        break;
      case 'Open-source licenses':
        // Cast: typed-routes' generated types are stale until the next `expo start` regenerates them.
        router.push('/licenses' as Href);
        break;
      default:
        toast(`Opening ${label}`);
    }
  };

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />
      <ScreenHeader title="About & legal" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-5 pb-10">
        <View className="items-center pt-4">
          <View className="h-20 w-20 items-center justify-center rounded-3xl" style={{ backgroundColor: C.blue }}>
            <Txt weight="black" className="text-white" style={{ fontSize: 34 }}>T!</Txt>
          </View>
          <Txt weight="black" className="mt-3 text-[20px] text-brand-ink">Tara Bucket!</Txt>
          <Txt weight="medium" className="mt-0.5 text-[12.5px] text-brand-muted">v1.0.0 (build 42)</Txt>
          <Txt weight="medium" className="mt-2 text-center text-[13px] text-brand-muted">Bucket-list meetups for Filipino adults</Txt>
        </View>

        <SettingsGroup title="LEGAL" className="mt-6">
          {LEGAL.map((r, i) => (
            <SettingsRow key={r.label} icon={r.icon} color={r.color} label={r.label} onPress={() => onOpen(r.label)} divider={i > 0} />
          ))}
        </SettingsGroup>
        <SettingsGroup title="APP" className="mt-6">
          {APP.map((r, i) => (
            <SettingsRow key={r.label} icon={r.icon} color={r.color} label={r.label} onPress={() => onOpen(r.label)} divider={i > 0} />
          ))}
        </SettingsGroup>

        <Txt weight="medium" className="mt-8 text-center text-[12px] text-brand-faint">
          Made in the Philippines 🇵🇭  ·  © 2027 Tara Bucket Inc.
        </Txt>
      </ScrollView>
    </View>
  );
}
