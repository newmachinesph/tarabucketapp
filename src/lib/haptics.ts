import * as Haptics from 'expo-haptics';

// Thin wrappers — safe no-ops on web / unsupported devices.
export const hLight = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
export const hMedium = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
export const hSuccess = () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
export const hWarn = () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
