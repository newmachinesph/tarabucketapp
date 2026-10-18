import { useState } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { IconButton } from '@/components/ui/kit';
import { Txt } from '@/components/ui/txt';
import { hLight, hMedium } from '@/lib/haptics';
import { C } from '@/lib/tokens';

type Dir = 'left' | 'right';

type Props<T> = {
  data: T[];
  keyOf: (item: T) => string;
  renderCard: (item: T) => React.ReactNode;
  // Return `false` to reject the swipe (card snaps back, deck does not advance) —
  // used to gate a right-swipe behind a paywall or a full table without losing the card.
  onSwipe?: (item: T, dir: Dir) => boolean | void;
  onCardTap?: (item: T) => void;
  onRewind?: () => void;
  renderEmpty?: () => React.ReactNode;
};

const SWIPE_THRESHOLD = 120;

export function SwipeDeck<T>({ data, keyOf, renderCard, onSwipe, onCardTap, onRewind, renderEmpty }: Props<T>) {
  const { width } = useWindowDimensions();
  // Track swiped cards by id, not a positional index — so the deck stays correct even if `data`
  // gains or loses items mid-session (e.g. a plan created while the deck is mounted).
  const [consumedIds, setConsumedIds] = useState<string[]>([]);
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);

  const consumedSet = new Set(consumedIds);
  const remaining = data.filter((d) => !consumedSet.has(keyOf(d)));
  const top = remaining[0];

  // Plain functions — reactCompiler (enabled in app.json) handles memoization; manual useCallback
  // here fights the compiler because `top` is derived from a fresh filter each render.
  const advance = (dir: Dir, item: T) => {
    // Ask the handler whether this swipe is consumed. `false` = rejected (paywall/full):
    // keep the card and snap it back so the deck stays in sync with store history.
    const consumed = onSwipe?.(item, dir);
    if (consumed === false) {
      tx.value = withSpring(0, { damping: 18 });
      ty.value = withSpring(0, { damping: 18 });
      return;
    }
    hMedium();
    tx.value = 0;
    ty.value = 0;
    setConsumedIds((c) => [...c, keyOf(item)]);
  };

  const fling = (dir: Dir) => {
    if (!top) return;
    const item = top;
    hLight();
    const to = dir === 'right' ? width * 1.6 : -width * 1.6;
    tx.value = withTiming(to, { duration: 240 }, (finished) => {
      if (finished) runOnJS(advance)(dir, item);
    });
  };

  const rewind = () => {
    if (consumedIds.length === 0) return; // nothing to rewind — don't pop store history
    hLight();
    setConsumedIds((c) => c.slice(0, -1));
    tx.value = 0;
    ty.value = 0;
    onRewind?.();
  };

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      tx.value = e.translationX;
      ty.value = e.translationY;
    })
    .onEnd((e) => {
      const item = top;
      if (Math.abs(e.translationX) > SWIPE_THRESHOLD && item) {
        const dir: Dir = e.translationX > 0 ? 'right' : 'left';
        const to = dir === 'right' ? width * 1.6 : -width * 1.6;
        tx.value = withTiming(to, { duration: 220 }, (finished) => {
          if (finished) runOnJS(advance)(dir, item);
        });
      } else {
        tx.value = withSpring(0, { damping: 18 });
        ty.value = withSpring(0, { damping: 18 });
      }
    });

  const handleTap = () => {
    if (top) onCardTap?.(top);
  };

  // Tap opens details; racing with Pan means a drag swipes and a stationary tap opens.
  const tap = Gesture.Tap()
    .maxDistance(10)
    .onEnd((_e, success) => {
      if (success) runOnJS(handleTap)();
    });

  const composed = Gesture.Race(pan, tap);

  const topStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: tx.value },
      { translateY: ty.value },
      { rotate: `${interpolate(tx.value, [-width, 0, width], [-9, 0, 9], Extrapolation.CLAMP)}deg` },
    ],
  }));
  const taraOverlay = useAnimatedStyle(() => ({
    opacity: interpolate(tx.value, [30, 140], [0, 1], Extrapolation.CLAMP),
  }));
  const skipOverlay = useAnimatedStyle(() => ({
    opacity: interpolate(tx.value, [-140, -30], [1, 0], Extrapolation.CLAMP),
  }));

  const done = remaining.length === 0;

  return (
    <View style={styles.root}>
      <View style={styles.deck}>
        {done
          ? renderEmpty?.()
          : remaining
              .slice(0, 3)
              .map((item, i) => {
                const depth = i; // 0 = top
                const isTop = depth === 0;
                const staticStyle = {
                  transform: [{ scale: 1 - depth * 0.04 }, { translateY: depth * 14 }],
                };
                const content = (
                  <View style={styles.card}>
                    {renderCard(item)}
                    {isTop && (
                      <>
                        <Animated.View style={[styles.badge, styles.badgeTara, taraOverlay]}>
                          <Txt weight="black" style={styles.badgeText}>
                            TARA!
                          </Txt>
                        </Animated.View>
                        <Animated.View style={[styles.badge, styles.badgeSkip, skipOverlay]}>
                          <Txt weight="black" style={[styles.badgeText, { color: C.red }]}>
                            SKIP
                          </Txt>
                        </Animated.View>
                      </>
                    )}
                  </View>
                );
                if (isTop) {
                  return (
                    <GestureDetector key={keyOf(item)} gesture={composed}>
                      <Animated.View style={[styles.cardWrap, { zIndex: 10 - depth }, topStyle]}>{content}</Animated.View>
                    </GestureDetector>
                  );
                }
                return (
                  <Animated.View key={keyOf(item)} style={[styles.cardWrap, { zIndex: 10 - depth }, staticStyle]}>
                    {content}
                  </Animated.View>
                );
              })
              .reverse()}
      </View>

      {!done && (
        <View style={styles.actions}>
          <IconButton name="arrow-undo" diameter={48} size={20} color={C.faint} onPress={rewind} accessibilityLabel="Rewind" />
          <IconButton name="close" diameter={60} size={30} color={C.red} onPress={() => fling('left')} accessibilityLabel="Skip" />
          <Pressable
            onPress={() => fling('right')}
            accessibilityRole="button"
            accessibilityLabel="Tara — I'm in"
            className="items-center justify-center rounded-full active:opacity-80"
            style={{ width: 68, height: 68, backgroundColor: C.orange }}
          >
            <MaterialCommunityIcons name="hand-wave" size={30} color={C.white} />
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  deck: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  cardWrap: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  card: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.line,
  },
  badge: {
    position: 'absolute',
    top: 26,
    borderWidth: 4,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  badgeTara: { right: 22, borderColor: C.orange, transform: [{ rotate: '12deg' }] },
  badgeSkip: { left: 22, borderColor: C.red, transform: [{ rotate: '-12deg' }] },
  badgeText: { fontSize: 30, letterSpacing: 1, color: C.orange },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 18,
    paddingVertical: 16,
  },
});
