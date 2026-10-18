import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Txt } from '@/components/ui/txt';
import { C } from '@/lib/tokens';

const ToastCtx = createContext<(msg: string) => void>(() => {});

/** Call `const toast = useToast(); toast('Done ✓')` from any screen for lightweight action feedback. */
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [msg, setMsg] = useState<string | null>(null);
  const insets = useSafeAreaInsets();
  const show = useCallback((m: string) => setMsg(m), []);

  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(null), 2200);
    return () => clearTimeout(t);
  }, [msg]);

  return (
    <ToastCtx.Provider value={show}>
      {children}
      {msg && (
        <View
          pointerEvents="none"
          // Screen readers must hear the toast: Android announces the live region, iOS the alert role.
          accessibilityLiveRegion="polite"
          accessibilityRole="alert"
          style={{ position: 'absolute', left: 0, right: 0, bottom: insets.bottom + 96, alignItems: 'center' }}
        >
          <View className="max-w-[86%] rounded-full px-5 py-3" style={{ backgroundColor: C.ink }}>
            <Txt weight="semibold" className="text-center text-[13px] text-white">
              {msg}
            </Txt>
          </View>
        </View>
      )}
    </ToastCtx.Provider>
  );
}
