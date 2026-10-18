import { Text, type TextProps } from 'react-native';

import { FONT } from '@/lib/tokens';

type Weight = keyof typeof FONT;

type Props = TextProps & {
  weight?: Weight;
  className?: string;
};

// Single typography primitive — applies the Poppins family for a given weight
// (RN can't synthesize weights from one family, so each weight is its own font).
export function Txt({ weight = 'regular', className, style, maxFontSizeMultiplier = 1.6, ...rest }: Props) {
  // Cap dynamic-type scaling so extreme accessibility font sizes don't shatter card layouts.
  return (
    <Text
      maxFontSizeMultiplier={maxFontSizeMultiplier}
      className={className}
      style={[{ fontFamily: FONT[weight] }, style]}
      {...rest}
    />
  );
}
