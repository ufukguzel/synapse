import {scallopedPath} from '@/components/brand/brainGeometry';

describe('scallopedPath', () => {
  const shape = {cx: 50, cy: 50, rx: 40, ry: 30, bumps: 9, amplitude: 0.05};

  it('emits a closed path starting with a move command', () => {
    const path = scallopedPath(shape);
    expect(path.startsWith('M')).toBe(true);
    expect(path.endsWith('Z')).toBe(true);
  });

  it('emits one cubic segment per sampled point', () => {
    const resolution = 3;
    const segments = scallopedPath({...shape, resolution}).match(/C/g) ?? [];
    expect(segments).toHaveLength(shape.bumps * resolution);
  });

  it('is deterministic - the silhouette must not shift between renders', () => {
    expect(scallopedPath(shape)).toBe(scallopedPath(shape));
  });

  it('stays within the radius the amplitude allows', () => {
    const path = scallopedPath(shape);
    const coordinates = path.match(/-?\d+(\.\d+)?,-?\d+(\.\d+)?/g) ?? [];
    expect(coordinates.length).toBeGreaterThan(0);

    const maxRadius = Math.max(shape.rx, shape.ry) * (1 + shape.amplitude) + 1;
    for (const pair of coordinates) {
      const [x, y] = pair.split(',').map(Number) as [number, number];
      const distance = Math.hypot(x - shape.cx, y - shape.cy);
      // Bezier control points sit outside the sampled ring, hence the allowance.
      expect(distance).toBeLessThanOrEqual(maxRadius * 1.3);
    }
  });

  it('returns an empty string when there are too few points to interpolate', () => {
    expect(scallopedPath({...shape, bumps: 1, resolution: 1})).toBe('');
  });
});
