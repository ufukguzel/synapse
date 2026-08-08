/**
 * Geometry for the brain silhouette.
 *
 * The outline is generated rather than hand-authored: what makes a shape read as
 * a brain is the scalloped edge left by the gyri, and hand-guessing thirty bezier
 * control points for that never converges. Here a smooth closed curve is fitted
 * through points sampled in polar space, with the radius modulated to produce the
 * bumps. Everything is deterministic - same input, same path, every render.
 */

export interface PolarShape {
  cx: number;
  cy: number;
  /** Base horizontal radius. */
  rx: number;
  /** Base vertical radius. */
  ry: number;
  /** Number of gyri bumps around the edge. */
  bumps: number;
  /** Bump depth as a fraction of the radius. */
  amplitude: number;
  /** Rotates the bump pattern so shapes do not look stamped from one mould. */
  phase?: number;
  /** Samples per bump. Three keeps the curve smooth without bloating the path. */
  resolution?: number;
}

interface Point {
  x: number;
  y: number;
}

/** Radius of an axis-aligned ellipse at a given angle. */
const ellipseRadius = (rx: number, ry: number, angle: number) => {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return (rx * ry) / Math.sqrt(ry * ry * c * c + rx * rx * s * s);
};

const samplePoints = ({
  cx,
  cy,
  rx,
  ry,
  bumps,
  amplitude,
  phase = 0,
  resolution = 3,
}: PolarShape): Point[] => {
  const count = bumps * resolution;
  return Array.from({length: count}, (_, index) => {
    const angle = (index / count) * Math.PI * 2;
    const base = ellipseRadius(rx, ry, angle);
    const radius = base * (1 + amplitude * Math.cos(bumps * angle + phase));
    return {x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle)};
  });
};

const round = (value: number) => Math.round(value * 100) / 100;

/**
 * Closed Catmull-Rom spline through the points, emitted as cubic beziers. The
 * standard 1/6 tangent scaling gives a curve that passes through every sample,
 * so the bump count is exactly what was asked for.
 */
const closedSplinePath = (points: Point[]): string => {
  const n = points.length;
  if (n < 3) {
    return '';
  }

  const at = (index: number) => points[((index % n) + n) % n]!;
  let path = `M${round(at(0).x)},${round(at(0).y)}`;

  for (let i = 0; i < n; i++) {
    const p0 = at(i - 1);
    const p1 = at(i);
    const p2 = at(i + 1);
    const p3 = at(i + 2);

    const c1 = {x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6};
    const c2 = {x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6};

    path +=
      `C${round(c1.x)},${round(c1.y)} ` +
      `${round(c2.x)},${round(c2.y)} ` +
      `${round(p2.x)},${round(p2.y)}`;
  }

  return `${path}Z`;
};

export const scallopedPath = (shape: PolarShape): string => closedSplinePath(samplePoints(shape));
