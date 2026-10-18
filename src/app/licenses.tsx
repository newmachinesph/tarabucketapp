import { StatusBar } from 'expo-status-bar';
import { ScrollView, View } from 'react-native';

import { ScreenHeader, SettingsGroup, SettingsRow } from '@/components/ui/kit';
import { Txt } from '@/components/ui/txt';

// Static credits for the open-source libraries this app is built on.
type Lib = { name: string; version: string; license: string };
const LIBS: Lib[] = [
  { name: 'react-native', version: '0.86.0', license: 'MIT' },
  { name: 'expo', version: '~57.0.4', license: 'MIT' },
  { name: 'expo-router', version: '~57.0.4', license: 'MIT' },
  { name: 'nativewind', version: '^4.2.6', license: 'MIT' },
  { name: 'zustand', version: '^5.0.14', license: 'MIT' },
  { name: 'react-native-reanimated', version: '4.5.0', license: 'MIT' },
  { name: 'react-native-gesture-handler', version: '~2.32.0', license: 'MIT' },
  { name: '@expo-google-fonts/poppins', version: '^0.4.1', license: 'OFL-1.1' },
];

export default function LicensesScreen() {
  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />
      <ScreenHeader title="Open-source licenses" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-5 pb-10 pt-1">
        <Txt weight="medium" className="mb-4 text-[13px] leading-[19px] text-brand-muted">
          Tara Bucket is built on the incredible work of the open-source community. Salamat sa mga
          maintainers ng mga library na ito.
        </Txt>

        <SettingsGroup>
          {LIBS.map((lib, i) => (
            <SettingsRow
              key={lib.name}
              divider={i > 0}
              label={lib.name}
              sub={`v${lib.version}`}
              right={
                <Txt weight="bold" className="text-[12px] text-brand-faint">
                  {lib.license}
                </Txt>
              }
            />
          ))}
        </SettingsGroup>

        <Txt weight="medium" className="mt-6 text-center text-[12px] text-brand-faint">
          Full license texts are available in each package&rsquo;s repository.
        </Txt>
      </ScrollView>
    </View>
  );
}
