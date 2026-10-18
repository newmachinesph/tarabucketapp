import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CreateSheet } from '@/components/create-sheet';
import { Txt } from '@/components/ui/txt';
import { hLight } from '@/lib/haptics';
import { C } from '@/lib/tokens';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

// Minimal shape of the props expo-router's <Tabs tabBar> passes — avoids a hard
// dependency import while staying type-safe for what we actually use.
type TabBarProps = {
  state: { index: number; routes: { key: string; name: string }[] };
  navigation: {
    emit: (e: { type: 'tabPress'; target: string; canPreventDefault: true }) => { defaultPrevented: boolean };
    navigate: (name: string) => void;
  };
};

// Bottom-bar tabs only (max 5 items = these 4 + the center Create). Kadas is intentionally
// off the bar — it's reachable from Profile. A route not listed here is never drawn in the bar.
const TABS: Record<string, { icon: IoniconName; activeIcon: IoniconName; label: string }> = {
  tara: { icon: 'arrow-forward-circle-outline', activeIcon: 'arrow-forward-circle', label: 'Tara' },
  feed: { icon: 'newspaper-outline', activeIcon: 'newspaper', label: 'Feed' },
  buckets: { icon: 'bookmark-outline', activeIcon: 'bookmark', label: 'Buckets' },
  profile: { icon: 'person-circle-outline', activeIcon: 'person-circle', label: 'You' },
};

export function BottomTabBar({ state, navigation }: TabBarProps) {
  const insets = useSafeAreaInsets();
  const [showCreate, setShowCreate] = useState(false);

  // Only draw routes that belong on the bar (skip hidden ones like kadas), then inject the center
  // ＋ into the middle of that visible set — so hosting a plan/bucket/kada stays first-class.
  const visible = state.routes.filter((r) => TABS[r.name]);
  const mid = Math.floor(visible.length / 2);

  return (
    <>
      <View
        className="flex-row items-start border-t border-black/5 bg-white pt-2.5"
        style={{ paddingBottom: insets.bottom || 10 }}
      >
        {visible.map((route, i) => {
          const focused = state.index === state.routes.indexOf(route);
          const t = TABS[route.name]!;
          const color = focused ? C.orange : C.faint;
          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
          };
          const tab = (
            <Pressable key={route.key} onPress={onPress} className="flex-1 items-center active:opacity-70">
              {route.name === 'buckets' ? (
                <MaterialCommunityIcons name={focused ? 'bucket' : 'bucket-outline'} size={24} color={color} />
              ) : route.name === 'tara' ? (
                <MaterialCommunityIcons name={focused ? 'hand-wave' : 'hand-wave-outline'} size={24} color={color} />
              ) : (
                <Ionicons name={focused ? t.activeIcon : t.icon} size={24} color={color} />
              )}
              <Txt weight={focused ? 'bold' : 'medium'} className="mt-1 text-[10px]" style={{ color }}>
                {t.label}
              </Txt>
            </Pressable>
          );
          if (i !== mid) return tab;
          return (
            <View key={route.key} className="flex-row" style={{ flex: 2 }}>
              <View className="flex-1 items-center">
                <Pressable
                  onPress={() => {
                    hLight();
                    setShowCreate(true);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel="Create"
                  className="items-center justify-center rounded-full active:opacity-80"
                  style={{ width: 46, height: 46, marginTop: -6, backgroundColor: C.orange }}
                >
                  <Ionicons name="add" size={28} color={C.white} />
                </Pressable>
              </View>
              {tab}
            </View>
          );
        })}
      </View>
      <CreateSheet visible={showCreate} onClose={() => setShowCreate(false)} />
    </>
  );
}
