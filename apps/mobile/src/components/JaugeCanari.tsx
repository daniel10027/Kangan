import { useEffect } from "react";
import { Text, View } from "react-native";
import Animated, { useAnimatedProps, useSharedValue, withSpring } from "react-native-reanimated";
import Svg, { ClipPath, Defs, Path, Rect } from "react-native-svg";
import { formatFcfa } from "@kangan/shared";

const AnimatedRect = Animated.createAnimatedComponent(Rect);

export function JaugeCanari({ balance, targetAmount, percent, size = 140 }: { balance: number; targetAmount: number; percent: number; size?: number }) {
  const fillY = useSharedValue(108);

  useEffect(() => {
    fillY.value = withSpring(108 - (percent / 100) * 90, { damping: 14, stiffness: 60 });
  }, [percent, fillY]);

  const animatedProps = useAnimatedProps(() => ({ y: fillY.value }));

  return (
    <View className="items-center">
      <Svg width={size} height={(size * 130) / 100} viewBox="0 0 100 130">
        <Defs>
          <ClipPath id="jarClip">
            <Path d="M28 46c0-4 4-8 4-8h36s4 4 4 8v52a22 22 0 0 1-44 0V46z" />
          </ClipPath>
        </Defs>
        <Path d="M28 46c0-4 4-8 4-8h36s4 4 4 8v52a22 22 0 0 1-44 0V46z" fill="none" stroke="#0F3D2E" strokeWidth={3} />
        <Rect x={38} y={10} width={24} height={14} rx={3} fill="none" stroke="#0F3D2E" strokeWidth={3} />
        <Path d="M32 24h36l4 14H28z" fill="none" stroke="#0F3D2E" strokeWidth={3} />
        <AnimatedRect x={24} width={52} height={90} fill="#D98E2B" clipPath="url(#jarClip)" animatedProps={animatedProps} />
      </Svg>

      <Text className="mt-2 text-center font-bold text-vert-kangan" style={{ fontSize: 24 }}>
        {percent}%
      </Text>
      <Text className="text-center text-sm text-encre/70">
        {formatFcfa(balance)} / {formatFcfa(targetAmount)}
      </Text>
    </View>
  );
}
