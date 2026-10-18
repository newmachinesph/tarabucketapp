import { Ionicons } from '@expo/vector-icons';
import { router, type Href } from 'expo-router';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { IconChip } from '@/components/ui/kit';
import { Sheet } from '@/components/ui/sheet';
import { Txt } from '@/components/ui/txt';
import { hLight } from '@/lib/haptics';
import { C } from '@/lib/tokens';

type IoniconName = ComponentProps<typeof Ionicons>['name'];
type Option = { icon: IoniconName; color: string; label: string; sub: string; href: Href };

// The three "create" entry points, surfaced from the tab-bar ＋ (integrated action bar) —
// so hosting a plan no longer lives only inside bucket/kada detail screens.
const OPTIONS: Option[] = [
  { icon: 'hand-left', color: C.orange, label: 'New plan', sub: 'Host a meetup on the Tara deck', href: '/create-plan' },
  { icon: 'bookmark', color: C.blue, label: 'New bucket', sub: 'Add something to your bucket list', href: '/create-bucket' },
  { icon: 'people', color: C.violet, label: 'New kada', sub: 'Start a barkada group', href: '/create-kada' },
];

export function CreateSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const go = (href: Href) => {
    hLight();
    onClose();
    router.push(href);
  };

  return (
    <Sheet visible={visible} onClose={onClose} title="Create">
      {OPTIONS.map((o, i) => (
        <Pressable
          key={o.label}
          onPress={() => go(o.href)}
          accessibilityRole="button"
          accessibilityLabel={o.label}
          className="flex-row items-center py-3 active:opacity-70"
          style={i > 0 ? { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.line } : undefined}
        >
          <IconChip name={o.icon} color={o.color} diameter={42} size={20} />
          <View className="ml-3 flex-1">
            <Txt weight="bold" className="text-[15px] text-brand-ink">
              {o.label}
            </Txt>
            <Txt weight="medium" className="mt-0.5 text-[12px] text-brand-muted">
              {o.sub}
            </Txt>
          </View>
          <Ionicons name="chevron-forward" size={18} color={C.faint} />
        </Pressable>
      ))}
    </Sheet>
  );
}
