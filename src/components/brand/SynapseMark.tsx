import Svg, {Circle, Defs, LinearGradient, Path, Stop} from 'react-native-svg';
import {brand} from '@/theme';

export interface SynapseMarkProps {
  size?: number;
  /** 'gradient' is the primary lockup; 'mono' paints everything in `color`. */
  variant?: 'gradient' | 'mono';
  /** Used by the mono variant. */
  color?: string;
}

/**
 * The Synapse mark: a single axon curving between two terminals, with the
 * synaptic cleft marked in amber. Traced from the supplied brand SVG
 * (synapse-mark-gradient.svg) - keep the path and node coordinates in sync with
 * that file rather than redrawing by eye.
 */
const AXON = 'M70,30 C70,18 35,18 35,34 C35,48 65,48 65,66 C65,82 30,82 30,70';

export const SynapseMark = ({size = 96, variant = 'gradient', color}: SynapseMarkProps) => {
  const isMono = variant === 'mono';
  const stroke = isMono ? color ?? brand.mist : 'url(#synapse-axon)';

  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      {!isMono && (
        <Defs>
          <LinearGradient id="synapse-axon" gradientUnits="userSpaceOnUse" x1="76" y1="24" x2="24" y2="76">
            <Stop offset="0%" stopColor={brand.neuralPurple} />
            <Stop offset="100%" stopColor={brand.synapseTeal} />
          </LinearGradient>
        </Defs>
      )}

      <Path d={AXON} fill="none" stroke={stroke} strokeWidth={9} strokeLinecap="round" />
      <Circle cx={70} cy={30} r={6.5} fill={isMono ? color ?? brand.mist : brand.neuralPurple} />
      {!isMono && <Circle cx={50} cy={49} r={3.6} fill={brand.sparkGold} />}
      <Circle cx={30} cy={70} r={6.5} fill={isMono ? color ?? brand.mist : brand.synapseTeal} />
    </Svg>
  );
};
