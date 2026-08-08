import Svg, {Circle, Path} from 'react-native-svg';

export type IconName = 'brain' | 'tasks' | 'practice' | 'profile';

export interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
}

/**
 * Icon set per the brand guide: 2px strokes, rounded joins, built from neural
 * primitives (circles, nodes, connections), "single weight, never filled".
 * Selection is therefore signalled by colour alone, not by a filled variant.
 */
export const Icon = ({name, size = 24, color = '#000000'}: IconProps) => {
  const common = {
    stroke: color,
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    fill: 'none',
  };

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {/* Two lobes and the fissure between them - the brain map in miniature. */}
      {name === 'brain' && (
        <>
          <Path
            {...common}
            d="M12 4.5C9.6 3.2 6.4 4.1 5.3 6.4 3.3 7.2 2.8 9.8 4.3 11.2 3.4 13 4.4 15.3 6.3 15.9 6.6 18.2 9.3 19.6 11.4 18.6"
          />
          <Path
            {...common}
            d="M12 4.5c2.4-1.3 5.6-.4 6.7 1.9 2 .8 2.5 3.4 1 4.8.9 1.8-.1 4.1-2 4.7-.3 2.3-3 3.7-5.1 2.7"
          />
          <Path {...common} d="M12 4.5v14.6" />
        </>
      )}

      {name === 'tasks' && (
        <>
          <Circle {...common} cx={6} cy={7} r={2.4} />
          <Circle {...common} cx={6} cy={17} r={2.4} />
          <Path {...common} d="M6 9.4v5.2" />
          <Path {...common} d="M12 7h7" />
          <Path {...common} d="M12 17h7" />
        </>
      )}

      {name === 'practice' && (
        <>
          <Circle {...common} cx={12} cy={12} r={8.5} />
          <Circle {...common} cx={12} cy={12} r={4} />
          <Circle cx={12} cy={12} r={1.6} fill={color} />
        </>
      )}

      {name === 'profile' && (
        <>
          <Circle {...common} cx={12} cy={8} r={3.75} />
          <Path
            {...common}
            d="M4.5 20a7.5 7.5 0 0 1 15 0"
          />
        </>
      )}
    </Svg>
  );
};
