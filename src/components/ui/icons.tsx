import Svg, {Circle, Path} from 'react-native-svg';

export interface IconProps {
  color: string;
  size?: number;
}

/** Learn — an open book. */
export const LearnIcon = ({color, size = 24}: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 6.5C10.5 5.2 8.5 4.7 4.8 4.7v11.6c3.7 0 5.7.5 7.2 1.8 1.5-1.3 3.5-1.8 7.2-1.8V4.7C15.5 4.7 13.5 5.2 12 6.5Z"
      stroke={color}
      strokeWidth={1.7}
      strokeLinejoin="round"
    />
    <Path d="M12 6.5v11" stroke={color} strokeWidth={1.7} strokeLinecap="round" />
  </Svg>
);

/** Practice — stacked flash cards. */
export const PracticeIcon = ({color, size = 24}: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M7.5 8.5h9a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-9a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2Z"
      stroke={color}
      strokeWidth={1.7}
      strokeLinejoin="round"
    />
    <Path d="M8 6h8" stroke={color} strokeWidth={1.7} strokeLinecap="round" />
  </Svg>
);

/** Profile — a person. */
export const ProfileIcon = ({color, size = 24}: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx={12} cy={8.5} r={3.3} stroke={color} strokeWidth={1.7} />
    <Path
      d="M5.5 19c0-3.3 2.9-5.6 6.5-5.6s6.5 2.3 6.5 5.6"
      stroke={color}
      strokeWidth={1.7}
      strokeLinecap="round"
    />
  </Svg>
);
