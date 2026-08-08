import {useEffect} from 'react';
import {Pressable, View} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, {ClipPath, Defs, Ellipse, G, Path} from 'react-native-svg';
import {Text} from '@/components/ui';
import {useTheme} from '@/providers';
import type {RegionCode} from '@/types';
import {scallopedPath} from './brainGeometry';

export interface BrainMapRegion {
  code: RegionCode;
  title: string;
  /** 0..100 */
  strength: number;
  accent: string;
}

export interface BrainMapProps {
  regions: BrainMapRegion[];
  /** Width of the whole component, including labels. */
  size?: number;
  /** Highlighted as "focus next" - this region breathes. */
  focusCode?: RegionCode | null;
  onPressRegion?: (code: RegionCode) => void;
}

/**
 * The signature view: a top-down brain whose regions fill in with the learner's
 * strength.
 *
 * Seen from above, so both hemispheres are visible and each region gets its own
 * quadrant of colour - which is the only layout where five regions read cleanly
 * at card size. The mapping is anatomically honest: Broca's area really is left
 * frontal, the reading circuit left posterior, and the hippocampus sits deep in
 * the middle.
 */

const VB_W = 160;
const VB_H = 134;

const CX = 80;
const CY = 62;

/** Outer contour: a lobed oval, taller than wide, as a brain looks from above. */
const OUTLINE = scallopedPath({
  cx: CX,
  cy: CY,
  rx: 40,
  ry: 46,
  bumps: 9,
  amplitude: 0.055,
  phase: 0.35,
});

/**
 * Organic seam between the frontal and posterior regions. A straight horizontal
 * cut read as a pie chart; a wave reads as anatomy.
 */
const BACK_LEFT =
  `M0,${CY - 3} C18,${CY + 7} 50,${CY - 9} ${CX},${CY + 3} ` +
  `L${CX},${VB_H} L0,${VB_H} Z`;
const BACK_RIGHT =
  `M${CX},${CY + 3} C104,${CY - 7} 134,${CY + 9} ${VB_W},${CY - 1} ` +
  `L${VB_W},${VB_H} L${CX},${VB_H} Z`;

/** The longitudinal fissure dividing the hemispheres. */
const FISSURE = `M${CX},${CY - 44} C${CX + 3},${CY - 20} ${CX - 3},${CY + 20} ${CX},${CY + 44}`;

/** Gyri, as the white squiggles of the reference illustration. */
const GYRI = [
  'M52,34 C60,28 68,32 70,40',
  'M46,52 C56,46 64,50 66,58',
  'M48,74 C58,68 66,72 68,80',
  'M56,92 C64,86 70,90 72,96',
  'M108,34 C100,28 92,32 90,40',
  'M114,52 C104,46 96,50 94,58',
  'M112,74 C102,68 94,72 92,80',
  'M104,92 C96,86 90,90 88,96',
];

/** Which half of the brain each region occupies, plus its label anchor. */
interface RegionGeometry {
  /** Region shape within the outline. Null for memory, which is drawn centrally. */
  shape: string | null;
  /** Label anchor. */
  lx: number;
  ly: number;
}

const GEOMETRY: Record<RegionCode, RegionGeometry> = {
  // Broca's area - left frontal. Frontal shapes cover full height and are then
  // overlaid by the posterior shapes, which is what creates the wavy seam.
  speaking: {shape: `M0,0 L${CX},0 L${CX},${VB_H} L0,${VB_H} Z`, lx: 22, ly: 22},
  // Motor and premotor cortex - right frontal.
  writing: {shape: `M${CX},0 L${VB_W},0 L${VB_W},${VB_H} L${CX},${VB_H} Z`, lx: 138, ly: 22},
  // Reading circuit - left posterior.
  reading: {shape: BACK_LEFT, lx: 22, ly: 96},
  // Auditory cortex - right posterior.
  listening: {shape: BACK_RIGHT, lx: 138, ly: 96},
  // Hippocampus - deep and central, so it spans the middle instead of a quadrant.
  memory: {shape: null, lx: 80, ly: 122},
};

const LABEL_WIDTH = 74;

export const BrainMap = ({regions, size = 300, focusCode, onPressRegion}: BrainMapProps) => {
  const theme = useTheme();

  // "Breathe" from the brand motion principles.
  const breathe = useSharedValue(0);
  useEffect(() => {
    breathe.value = withRepeat(withTiming(1, {duration: 2400}), -1, true);
  }, [breathe]);

  const focusStyle = useAnimatedStyle(() => ({opacity: 0.3 + 0.55 * breathe.value}));

  const scale = size / VB_W;
  const height = VB_H * scale;
  const toX = (x: number) => x * scale;
  const toY = (y: number) => y * scale;

  const nodes = regions
    .filter(region => GEOMETRY[region.code])
    .map(region => {
      const ratio = Math.max(0, Math.min(100, region.strength)) / 100;
      return {
        ...region,
        ...GEOMETRY[region.code],
        ratio,
        // Quiet regions stay visible; strong ones read as fully lit.
        fillOpacity: 0.2 + 0.72 * ratio,
      };
    });

  const memory = nodes.find(node => node.code === 'memory');
  // Frontal shapes first: the posterior shapes paint over them along the seam.
  const order: RegionCode[] = ['speaking', 'writing', 'reading', 'listening'];
  const orderedQuadrants = order
    .map(code => nodes.find(node => node.code === code))
    .filter((node): node is (typeof nodes)[number] => !!node && !!node.shape);
  const focus = nodes.find(node => node.code === focusCode);

  return (
    <View style={{width: size, height}}>
      <Svg width={size} height={height} viewBox={`0 0 ${VB_W} ${VB_H}`}>
        <Defs>
          <ClipPath id="brain-clip">
            <Path d={OUTLINE} />
          </ClipPath>
        </Defs>

        {/* Base */}
        <Path d={OUTLINE} fill={theme.colors.surfaceAlt} />

        {/* One flat colour per quadrant, clipped to the outline. */}
        <G clipPath="url(#brain-clip)">
          {orderedQuadrants.map(node => (
            <Path
              key={`fill-${node.code}`}
              d={node.shape!}
              fill={node.accent}
              fillOpacity={node.fillOpacity}
            />
          ))}

          {/* Memory sits over the middle, spanning both hemispheres. */}
          {!!memory && (
            <Ellipse
              cx={CX}
              cy={CY + 6}
              rx={15}
              ry={18}
              fill={memory.accent}
              fillOpacity={memory.fillOpacity}
            />
          )}

          {/* White gyri, as in the reference illustration. */}
          {GYRI.map(gyrus => (
            <Path
              key={gyrus}
              d={gyrus}
              fill="none"
              stroke={theme.brand.mist}
              strokeOpacity={0.6}
              strokeWidth={3.4}
              strokeLinecap="round"
            />
          ))}

          {/* The hemispheres are separated by a fissure, not a hairline. */}
          <Path
            d={FISSURE}
            fill="none"
            stroke={theme.colors.background}
            strokeWidth={4.5}
            strokeLinecap="round"
          />
        </G>

        {/* Heavy contour, like the reference. Drawn last so nothing bleeds out. */}
        <Path
          d={OUTLINE}
          fill="none"
          stroke={theme.colors.borderStrong}
          strokeWidth={4}
          strokeLinejoin="round"
        />
      </Svg>

      {/* The focus region breathes on its own layer. */}
      {!!focus && (
        <Animated.View
          style={[{position: 'absolute', left: 0, top: 0}, focusStyle]}
          pointerEvents="none">
          <Svg width={size} height={height} viewBox={`0 0 ${VB_W} ${VB_H}`}>
            <Defs>
              <ClipPath id="focus-clip">
                <Path d={OUTLINE} />
              </ClipPath>
            </Defs>
            <G clipPath="url(#focus-clip)">
              {focus.shape ? (
                <Path d={focus.shape} fill={focus.accent} />
              ) : (
                <Ellipse cx={CX} cy={CY + 6} rx={15} ry={18} fill={focus.accent} />
              )}
            </G>
          </Svg>
        </Animated.View>
      )}

      {/* Labels around the silhouette. */}
      {nodes.map(node => (
        <Pressable
          key={`hit-${node.code}`}
          disabled={!onPressRegion}
          onPress={() => onPressRegion?.(node.code)}
          style={({pressed}) => ({
            position: 'absolute',
            left: toX(node.lx) - LABEL_WIDTH / 2,
            top: toY(node.ly) - 14,
            width: LABEL_WIDTH,
            alignItems: 'center',
            opacity: pressed ? 0.7 : 1,
          })}>
          <Text variant="caption" center color={theme.colors.textSecondary} numberOfLines={1}>
            {node.title}
          </Text>
          <Text variant="bodyStrong" center color={node.accent}>
            {Math.round(node.strength)}%
          </Text>
        </Pressable>
      ))}
    </View>
  );
};
