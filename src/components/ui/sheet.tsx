// The one bottom sheet. Lifted verbatim out of create-sheet.tsx, which already had the correct
// version — this chrome (transparent Modal, tap-to-dismiss backdrop, grabber pill, rounded card,
// reduce-motion-aware entrance, safe-area bottom padding) had been hand-rolled five separate times.
//
// Frosted where liquid glass is available (iOS 26+), solid surface everywhere else: glassmorphism
// belongs on floating overlays, and this degrades cleanly without it.

import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import type { ReactNode } from 'react';
import { Modal, Pressable, StyleSheet, View, type DimensionValue, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Txt } from '@/components/ui/txt';
import { C } from '@/lib/tokens';
import { useStore } from '@/store';

type SheetProps = {
  visible: boolean;
  onClose: () => void;
  /** Rendered as the sheet's heading. Omit for menus that carry their own header. */
  title?: string;
  /** Extra padding below the content, on top of the safe-area inset. */
  paddingBottom?: number;
  /** Fixed card height (e.g. '84%' of the screen) for sheets with a long scrollable body. Omit to size to content. */
  height?: DimensionValue;
  children: ReactNode;
};

function SheetCard({ children, paddingBottom, fill }: { children: ReactNode; paddingBottom: number; fill: boolean }) {
  const style: StyleProp<ViewStyle> = [styles.card, fill && styles.fill, { paddingBottom }];
  if (isLiquidGlassAvailable()) {
    return (
      <GlassView glassEffectStyle="regular" style={style}>
        {children}
      </GlassView>
    );
  }
  return <View style={[style, styles.solid]}>{children}</View>;
}

export function Sheet({ visible, onClose, title, paddingBottom = 10, height, children }: SheetProps) {
  const insets = useSafeAreaInsets();
  const reduceMotion = useStore((s) => s.prefs.reduceMotion);

  return (
    <Modal visible={visible} transparent animationType="none" statusBarTranslucent onRequestClose={onClose}>
      <View style={StyleSheet.absoluteFill} className="justify-end">
        <Animated.View entering={FadeIn.duration(160)} style={StyleSheet.absoluteFill}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={onClose}
            className="bg-black/40"
            accessibilityRole="button"
            accessibilityLabel="Close"
          />
        </Animated.View>
        <Animated.View
          entering={reduceMotion ? FadeIn.duration(120) : SlideInDown.springify().damping(20).mass(0.7)}
          style={height === undefined ? undefined : { height }}
        >
          <SheetCard paddingBottom={insets.bottom + paddingBottom} fill={height !== undefined}>
            <View className="mb-3 items-center">
              <View className="h-1.5 w-10 rounded-full bg-black/10" />
            </View>
            {title ? (
              <Txt weight="black" className="mb-1 text-[18px] text-brand-ink">
                {title}
              </Txt>
            ) : null}
            {children}
          </SheetCard>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  card: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  fill: { flex: 1 },
  solid: { backgroundColor: C.white },
});
