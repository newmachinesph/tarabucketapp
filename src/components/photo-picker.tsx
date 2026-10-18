import { Image } from 'expo-image';
import { Modal, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconButton } from '@/components/ui/kit';
import { Txt } from '@/components/ui/txt';
import { C } from '@/lib/tokens';

// Mock camera roll — curated seeds, square crops.
const ROLL = Array.from({ length: 12 }, (_, i) => `https://picsum.photos/seed/photo-roll-${i + 1}/300/300`);

// ponytail: session counter so every "Take photo" yields a fresh seeded shot
let camSeq = 0;

export function PhotoPicker({
  visible,
  onClose,
  onPick,
}: {
  visible: boolean;
  onClose: () => void;
  onPick: (uri: string) => void;
}) {
  const insets = useSafeAreaInsets();

  const pick = (uri: string) => {
    onPick(uri);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable onPress={onClose} className="flex-1 justify-end" style={{ backgroundColor: 'rgba(14,23,38,0.55)' }}>
        {/* Stop backdrop-press from closing when tapping the sheet itself */}
        <Pressable onPress={() => {}} className="rounded-t-3xl bg-white px-5 pt-5" style={{ paddingBottom: insets.bottom + 16 }}>
          <View className="flex-row items-center justify-between">
            <Txt weight="black" className="text-[18px] text-brand-ink">
              Add a photo
            </Txt>
            <IconButton name="close" diameter={36} size={18} accessibilityLabel="Close photo picker" onPress={onClose} />
          </View>

          <View className="mt-4 flex-row flex-wrap gap-2">
            <Pressable
              onPress={() => pick(`https://picsum.photos/seed/photo-roll-cam-${++camSeq}/300/300`)}
              className="items-center justify-center rounded-2xl border-2 border-dashed active:opacity-70"
              style={{ width: '22.5%', aspectRatio: 1, borderColor: C.line }}
              accessibilityRole="button"
              accessibilityLabel="Take photo"
            >
              <Txt style={{ fontSize: 18 }}>📷</Txt>
              <Txt weight="semibold" className="mt-0.5 text-center text-[9px] text-brand-muted">
                Take photo
              </Txt>
            </Pressable>
            {ROLL.map((uri) => (
              <Pressable
                key={uri}
                onPress={() => pick(uri)}
                className="overflow-hidden rounded-2xl active:opacity-80"
                style={{ width: '22.5%', aspectRatio: 1 }}
                accessibilityRole="button"
                accessibilityLabel="Pick photo"
              >
                <Image source={{ uri }} style={{ width: '100%', height: '100%', backgroundColor: C.surface }} />
              </Pressable>
            ))}
          </View>

          <Txt weight="medium" className="mt-4 text-center text-[11px] text-brand-faint">
            Demo picker — your real camera roll once backend lands
          </Txt>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
