import Svg, { ClipPath, Defs, Path, Rect } from "react-native-svg";

/** Le canari — jarre en terre cuite qui se remplit (section 11). */
export function CanariIcon({ percent = 0, size = 32, color = "#0F3D2E" }: { percent?: number; size?: number; color?: string }) {
  const clamped = Math.max(0, Math.min(100, percent));
  const fillHeight = (clamped / 100) * 30;
  const fillY = 44 - fillHeight;

  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Defs>
        <ClipPath id="canariClip">
          <Path d="M18 30a14 14 0 0 0 28 0v10a14 14 0 0 1-28 0V30z" />
        </ClipPath>
      </Defs>
      <Path
        d="M24 8h16v6a4 4 0 0 1-2 3.5V22a12 12 0 0 1 8 11.3V40a10 10 0 0 1-10 10h-8a10 10 0 0 1-10-10v-6.7A12 12 0 0 1 26 17.5V14a4 4 0 0 1-2-3.5V8z"
        fill="none"
        stroke={color}
        strokeWidth={2}
      />
      <Rect x={16} y={fillY} width={32} height={30} fill={color} opacity={0.85} clipPath="url(#canariClip)" />
    </Svg>
  );
}
