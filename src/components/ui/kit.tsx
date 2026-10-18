import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, type ComponentProps, type ReactNode } from 'react';
import { Pressable, Switch as RNSwitch, TextInput, View, type SwitchProps, type TextInputProps, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { C, FONT, ORANGE_GRADIENT, tint } from '@/lib/tokens';
import { Txt } from '@/components/ui/txt';
import { useStore } from '@/store';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

export function Screen({ children, className = '' }: { children: ReactNode; className?: string }) {
  const insets = useSafeAreaInsets();
  return (
    <View className={`flex-1 bg-white ${className}`} style={{ paddingTop: insets.top }}>
      {children}
    </View>
  );
}

// Standard back-header used by every detail/settings screen: safe-area padding, a back button,
// a title, and an optional trailing action slot (`right`). `onBack` defaults to router.back().
export function ScreenHeader({
  title,
  right,
  onBack,
}: {
  title: string;
  right?: ReactNode;
  onBack?: () => void;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View className="flex-row items-center px-4 pb-2" style={{ paddingTop: insets.top + 4 }}>
      <IconButton name="chevron-back" diameter={40} size={22} accessibilityLabel="Go back" onPress={onBack ?? (() => router.back())} />
      <Txt weight="black" className="ml-2 flex-1 text-[20px] text-brand-ink" numberOfLines={1}>
        {title}
      </Txt>
      {right}
    </View>
  );
}

// Tinted circular icon badge — the left affordance on settings/menu rows.
export function IconChip({ name, color, size = 18, diameter = 36 }: { name: IoniconName; color: string; size?: number; diameter?: number }) {
  return (
    <View className="items-center justify-center rounded-full" style={{ width: diameter, height: diameter, backgroundColor: tint(color) }}>
      <Ionicons name={name} size={size} color={color} />
    </View>
  );
}

// Bordered rounded container that groups settings rows, with an optional section label above it.
// Outer spacing is the caller's job (pass `className`), since screens place groups differently.
export function SettingsGroup({ title, children, className = '' }: { title?: string; children: ReactNode; className?: string }) {
  return (
    <View className={className}>
      {title ? (
        <Txt weight="bold" className="mx-1 mb-2.5 text-[12px] text-brand-faint" style={{ letterSpacing: 0.6 }}>
          {title}
        </Txt>
      ) : null}
      <View className="overflow-hidden rounded-3xl border" style={{ borderColor: C.line }}>
        {children}
      </View>
    </View>
  );
}

// One settings/menu row: optional icon chip, label, optional sub-label, and a right slot.
// A pressable row with no explicit `right` gets a chevron; `divider` draws the inset top separator.
export function SettingsRow({
  icon,
  color = C.ink,
  label,
  sub,
  right,
  onPress,
  divider = false,
}: {
  icon?: IoniconName;
  color?: string;
  label: string;
  sub?: string;
  right?: ReactNode;
  onPress?: () => void;
  divider?: boolean;
}) {
  const body = (
    <View className="flex-row items-center px-4 py-3.5">
      {icon ? <IconChip name={icon} color={color} /> : null}
      <View className={`flex-1 ${icon ? 'ml-3' : ''}`}>
        <Txt weight="semibold" className="text-[14px] text-brand-ink">
          {label}
        </Txt>
        {sub ? (
          <Txt weight="medium" className="mt-0.5 text-[12px] text-brand-muted">
            {sub}
          </Txt>
        ) : null}
      </View>
      {right ?? (onPress ? <Ionicons name="chevron-forward" size={16} color={C.faint} /> : null)}
    </View>
  );
  return (
    <View>
      {divider && <View className={`${icon ? 'ml-16' : 'ml-4'} h-px`} style={{ backgroundColor: C.line }} />}
      {onPress ? (
        <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} className="active:opacity-70">
          {body}
        </Pressable>
      ) : (
        body
      )}
    </View>
  );
}

export function Avatar({ uri, size = 40, ring }: { uri: string; size?: number; ring?: string }) {
  return (
    <View
      style={{
        width: size + (ring ? 4 : 0),
        height: size + (ring ? 4 : 0),
        borderRadius: 999,
        borderWidth: ring ? 2 : 0,
        borderColor: ring ?? 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Image source={{ uri }} style={{ width: size, height: size, borderRadius: 999, backgroundColor: C.surface }} />
    </View>
  );
}

export function AvatarStack({ uris, size = 26, max = 4 }: { uris: string[]; size?: number; max?: number }) {
  const shown = uris.slice(0, max);
  const extra = uris.length - shown.length;
  return (
    <View className="flex-row items-center">
      {shown.map((uri, i) => (
        <View key={uri} style={{ marginLeft: i === 0 ? 0 : -size * 0.34 }}>
          <View style={{ borderRadius: 999, borderWidth: 2, borderColor: C.white }}>
            <Image source={{ uri }} style={{ width: size, height: size, borderRadius: 999, backgroundColor: C.surface }} />
          </View>
        </View>
      ))}
      {extra > 0 && (
        <View
          style={{ marginLeft: -size * 0.34, width: size, height: size, borderRadius: 999, borderWidth: 2, borderColor: C.white, backgroundColor: C.ink }}
          className="items-center justify-center"
        >
          <Txt weight="bold" className="text-white" style={{ fontSize: size * 0.36 }}>
            +{extra}
          </Txt>
        </View>
      )}
    </View>
  );
}

export function CategoryTag({ label, emoji, color = C.ink }: { label: string; emoji?: string; color?: string }) {
  return (
    <View className="flex-row items-center self-start rounded-full px-3 py-1.5" style={{ backgroundColor: tint(color) }}>
      {emoji ? <Txt className="mr-1 text-xs">{emoji}</Txt> : null}
      <Txt weight="semibold" className="text-[11px]" style={{ color }}>
        {label}
      </Txt>
    </View>
  );
}

export function Chip({ label, active = false, onPress }: { label: string; active?: boolean; onPress?: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: active }}
      className="rounded-full px-4 py-2"
      style={{ backgroundColor: active ? C.ink : C.surface }}
    >
      <Txt weight="semibold" className="text-[13px]" style={{ color: active ? C.white : C.muted }}>
        {label}
      </Txt>
    </Pressable>
  );
}

// Single text-input primitive — owns the Poppins family, the placeholder color, and the ink text
// color, so no screen hand-rolls them. Layout, border, and size stay the caller's `className`.
export function Input({
  weight = 'medium',
  className = '',
  style,
  placeholderTextColor = C.faint,
  ...rest
}: TextInputProps & { weight?: keyof typeof FONT; className?: string }) {
  return (
    <TextInput
      placeholderTextColor={placeholderTextColor}
      className={`text-brand-ink ${className}`}
      style={[{ fontFamily: FONT[weight] }, style]}
      {...rest}
    />
  );
}

// RN's Switch in the app's colors. Callers pass `value` / `onValueChange` (and `disabled`) only.
export function Switch(props: SwitchProps) {
  return (
    <RNSwitch trackColor={{ true: C.orange, false: C.track }} thumbColor={C.white} ios_backgroundColor={C.track} {...props} />
  );
}

export function PrimaryButton({
  label,
  onPress,
  icon,
  emoji,
}: {
  label: string;
  onPress?: () => void;
  icon?: IoniconName;
  emoji?: string;
}) {
  return (
    <Pressable onPress={onPress} className="overflow-hidden rounded-2xl active:opacity-90">
      <LinearGradient colors={ORANGE_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <View className="flex-row items-center justify-center py-4">
          {emoji ? (
            <Txt style={{ fontSize: 16, marginRight: 8 }}>{emoji}</Txt>
          ) : icon ? (
            <Ionicons name={icon} size={18} color={C.white} style={{ marginRight: 8 }} />
          ) : null}
          <Txt weight="bold" className="text-[16px] text-white">
            {label}
          </Txt>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

export function IconButton({
  name,
  onPress,
  size = 22,
  color = C.ink,
  bg = C.surface,
  diameter = 44,
  accessibilityLabel,
}: {
  name: IoniconName;
  onPress?: () => void;
  size?: number;
  color?: string;
  bg?: string;
  diameter?: number;
  accessibilityLabel: string; // required: an icon-only button is invisible to screen readers without it
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      className="items-center justify-center rounded-full active:opacity-80"
      style={{ width: diameter, height: diameter, backgroundColor: bg }}
    >
      <Ionicons name={name} size={size} color={color} />
    </Pressable>
  );
}

export function TrustBadge({ score }: { score: number }) {
  return (
    <View className="flex-row items-center rounded-full px-2.5 py-1" style={{ backgroundColor: tint(C.green) }}>
      <Ionicons name="shield-checkmark" size={13} color={C.green} />
      <Txt weight="bold" className="ml-1 text-[11px]" style={{ color: C.green }}>
        {score}
      </Txt>
    </View>
  );
}

// Marks a surface that's visible but not shipped yet — so a demo affordance reads as honest
// rather than broken.
export function StatusPill({ live }: { live: boolean }) {
  const color = live ? C.green : C.faint;
  return (
    <View className="rounded-full px-2.5 py-1" style={{ backgroundColor: tint(color) }}>
      <Txt weight="bold" className="text-[10px]" style={{ color: live ? C.green : C.muted }}>
        {live ? 'Live' : 'Coming soon'}
      </Txt>
    </View>
  );
}

export function SectionHeader({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <View className="flex-row items-center justify-between px-5">
      <Txt weight="black" className="text-[19px] text-brand-ink">
        {title}
      </Txt>
      {action ? (
        <Pressable onPress={onAction} className="active:opacity-70">
          <Txt weight="semibold" className="text-[13px] text-brand-blue">
            {action}
          </Txt>
        </Pressable>
      ) : null}
    </View>
  );
}

export function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View className="items-center">
      <Txt weight="black" className="text-[20px] text-brand-ink">
        {value}
      </Txt>
      <Txt weight="medium" className="mt-0.5 text-[12px] text-brand-muted">
        {label}
      </Txt>
    </View>
  );
}

// Full-screen "not found" state for detail routes hit with an unknown/removed id.
export function NotFound({ label = 'Item' }: { label?: string }) {
  const insets = useSafeAreaInsets();
  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center px-4 pb-2 pt-1">
        <IconButton name="chevron-back" diameter={40} size={22} accessibilityLabel="Go back" onPress={() => router.back()} />
      </View>
      <View className="flex-1 items-center justify-center px-10" style={{ marginTop: -40 }}>
        <View className="h-20 w-20 items-center justify-center rounded-full bg-brand-surface">
          <Ionicons name="help-circle-outline" size={34} color={C.faint} />
        </View>
        <Txt weight="black" className="mt-4 text-[18px] text-brand-ink">{label} not found</Txt>
        <Txt weight="medium" className="mt-1 text-center text-[13px] text-brand-muted">It may have been removed or the link is out of date.</Txt>
        <View className="mt-6 w-full">
          <PrimaryButton label="Go back" icon="arrow-back" onPress={() => router.back()} />
        </View>
      </View>
    </View>
  );
}

// Pulsing loading placeholder. Size it via `style` (width/height/borderRadius).
// Honors the in-app "Reduce motion" preference — holds a static opacity instead of looping.
export function Skeleton({ style }: { style?: ViewStyle }) {
  const reduceMotion = useStore((s) => s.prefs.reduceMotion);
  const o = useSharedValue(0.5);
  useEffect(() => {
    if (reduceMotion) {
      o.value = 0.7;
      return;
    }
    o.value = withRepeat(withTiming(1, { duration: 850 }), -1, true);
  }, [o, reduceMotion]);
  const anim = useAnimatedStyle(() => ({ opacity: o.value }));
  return <Animated.View style={[{ backgroundColor: C.surface, borderRadius: 12 }, style, anim]} />;
}
