import Svg, {Circle, Line} from 'react-native-svg';

export interface NeuralPatternProps {
  width: number;
  height: number;
  color?: string;
  opacity?: number;
}

/**
 * Decorative synapse mesh for gradient headers. The node positions are fixed
 * (0..100 space, scaled by preserveAspectRatio="none") rather than random, so the
 * pattern is stable across re-renders instead of twitching on every update.
 */
const NODES = [
  {x: 8, y: 22, r: 2.4},
  {x: 26, y: 8, r: 1.6},
  {x: 38, y: 30, r: 3},
  {x: 55, y: 14, r: 2},
  {x: 72, y: 32, r: 2.6},
  {x: 88, y: 16, r: 1.8},
  {x: 18, y: 52, r: 2},
  {x: 44, y: 62, r: 2.4},
  {x: 66, y: 54, r: 1.7},
  {x: 92, y: 60, r: 2.2},
  {x: 30, y: 84, r: 1.8},
  {x: 58, y: 90, r: 2.3},
  {x: 82, y: 80, r: 1.6},
];

/** Index pairs that get a connecting line. */
const EDGES: ReadonlyArray<readonly [number, number]> = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [4, 5],
  [0, 6],
  [2, 6],
  [6, 7],
  [7, 8],
  [4, 8],
  [8, 9],
  [6, 10],
  [7, 11],
  [9, 12],
  [11, 12],
];

export const NeuralPattern = ({
  width,
  height,
  color = '#FFFFFF',
  opacity = 0.18,
}: NeuralPatternProps) => (
  <Svg width={width} height={height} viewBox="0 0 100 100" preserveAspectRatio="none">
    {EDGES.map(([from, to]) => {
      const a = NODES[from]!;
      const b = NODES[to]!;
      return (
        <Line
          key={`e-${from}-${to}`}
          x1={a.x}
          y1={a.y}
          x2={b.x}
          y2={b.y}
          stroke={color}
          strokeOpacity={opacity * 0.7}
          strokeWidth={0.6}
        />
      );
    })}
    {NODES.map(node => (
      <Circle
        key={`n-${node.x}-${node.y}`}
        cx={node.x}
        cy={node.y}
        r={node.r}
        fill={color}
        fillOpacity={opacity}
      />
    ))}
  </Svg>
);
