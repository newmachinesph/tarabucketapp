import { Tabs } from 'expo-router';

import { BottomTabBar } from '@/components/bottom-tab-bar';

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <BottomTabBar {...props} />}
      screenOptions={{ headerShown: false, animation: 'shift' }}
    >
      <Tabs.Screen name="tara" />
      <Tabs.Screen name="feed" />
      <Tabs.Screen name="buckets" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
