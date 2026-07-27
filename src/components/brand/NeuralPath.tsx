import {Pressable, View} from 'react-native';
import Svg, {Circle, Line} from 'react-native-svg';
import {Text} from '@/components/ui';
import {useTheme} from '@/providers';

export interface NeuralPathNode {
  id: string;
  label: string;
  state: 'done' | 'current' | 'locked';
}

export interface NeuralPathProps {
  nodes: NeuralPathNode[];
  onPressNode?: (id: string) => void;
  /** Height of the drawn area; the path zig-zags to fill it. */
  height?: number;
}

const NODE_RADIUS = 20;
const ROW_HEIGHT = 92;

/**
 * The lesson sequence drawn as a synapse chain rather than a flat list: nodes are
 * neurons, the connecting axons light up as lessons are completed. Positions
 * alternate left/right so a long course reads as a path instead of a column.
 */
export const NeuralPath = ({nodes, onPressNode}: NeuralPathProps) => {
  const theme = useTheme();

  const canvasHeight = Math.max(ROW_HEIGHT, nodes.length * ROW_HEIGHT);
  // x in 0..100 (percent of width), y in absolute points.
  const layout = nodes.map((node, index) => ({
    ...node,
    x: index % 2 === 0 ? 26 : 74,
    y: ROW_HEIGHT / 2 + index * ROW_HEIGHT,
  }));

  const colorFor = (state: NeuralPathNode['state']) =>
    state === 'done'
      ? theme.colors.success
      : state === 'current'
      ? theme.colors.primary
      : theme.colors.surfaceAlt;

  return (
    <View style={{height: canvasHeight}}>
      {/* Axons sit behind the touchable nodes. */}
      <Svg
        width="100%"
        height={canvasHeight}
        viewBox={`0 0 100 ${canvasHeight}`}
        preserveAspectRatio="none"
        style={{position: 'absolute'}}>
        {layout.slice(0, -1).map((node, index) => {
          const next = layout[index + 1]!;
          // An axon is "active" only when the lesson it leads out of is done.
          const active = node.state === 'done';
          return (
            <Line
              key={`axon-${node.id}`}
              x1={node.x}
              y1={node.y}
              x2={next.x}
              y2={next.y}
              stroke={active ? theme.colors.success : theme.colors.border}
              strokeWidth={active ? 1.4 : 1}
              strokeDasharray={active ? undefined : '2 2'}
            />
          );
        })}
        {layout.map(node => (
          <Circle
            key={`halo-${node.id}`}
            cx={node.x}
            cy={node.y}
            r={node.state === 'current' ? 4.5 : 0}
            fill={theme.colors.primary}
            fillOpacity={0.18}
          />
        ))}
      </Svg>

      {layout.map(node => (
        <Pressable
          key={node.id}
          disabled={node.state === 'locked' || !onPressNode}
          onPress={() => onPressNode?.(node.id)}
          style={({pressed}) => ({
            position: 'absolute',
            left: `${node.x}%`,
            top: node.y - NODE_RADIUS,
            marginLeft: -NODE_RADIUS,
            alignItems: 'center',
            width: NODE_RADIUS * 2,
            opacity: pressed ? 0.85 : 1,
          })}>
          <View
            style={{
              width: NODE_RADIUS * 2,
              height: NODE_RADIUS * 2,
              borderRadius: theme.radius.pill,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: colorFor(node.state),
              borderWidth: node.state === 'locked' ? 2 : 0,
              borderColor: theme.colors.border,
              ...(node.state === 'locked' ? {} : theme.shadow.sm),
            }}>
            <Text
              variant="bodyStrong"
              color={
                node.state === 'locked' ? theme.colors.textTertiary : theme.colors.onPrimary
              }>
              {node.state === 'done' ? '✓' : node.state === 'locked' ? '🔒' : '▶'}
            </Text>
          </View>
          <Text
            variant="caption"
            center
            numberOfLines={2}
            color={node.state === 'locked' ? theme.colors.textTertiary : theme.colors.text}
            style={{marginTop: theme.spacing.xs, width: 96}}>
            {node.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
};
