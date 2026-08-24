/* Adapted from wondopamine/logo-grid-generator's DXD Mark Lab. The landing
   preview keeps the reference implementation's clean cubic trace path,
   arc-length mapping, and analytic curvature frame so the line and its drawing
   instrument share one source of truth. */

export const DXD_CENTER = 500;

export interface DxdConstructionSettings {
  sharpness: number;
  radius: number;
  rotation: number;
}

export interface DxdPoint {
  x: number;
  y: number;
}

export interface DxdArcLengthSample {
  parameter: number;
  progress: number;
}

export interface DxdCurveFrame {
  point: DxdPoint;
  tangent: DxdPoint;
  normal: DxdPoint;
  curvatureRadius: number;
  curvatureCenter: DxdPoint;
  alternateCurvatureCenter: DxdPoint | null;
  atCusp: boolean;
}

function signedPower(value: number, exponent: number) {
  return Math.sign(value) * Math.pow(Math.abs(value), exponent);
}

function getPointAndDerivative(settings: DxdConstructionSettings, angle: number) {
  const radians = (settings.rotation * Math.PI) / 180;
  const cosRotation = Math.cos(radians);
  const sinRotation = Math.sin(radians);
  const cosine = Math.cos(angle);
  const sine = Math.sin(angle);
  const localX = settings.radius * signedPower(cosine, settings.sharpness);
  const localY = settings.radius * signedPower(sine, settings.sharpness);
  const derivativeX =
    -settings.radius *
    settings.sharpness *
    Math.pow(Math.abs(cosine), settings.sharpness - 1) *
    sine;
  const derivativeY =
    settings.radius *
    settings.sharpness *
    Math.pow(Math.abs(sine), settings.sharpness - 1) *
    cosine;

  return {
    point: {
      x: DXD_CENTER + localX * cosRotation - localY * sinRotation,
      y: DXD_CENTER + localX * sinRotation + localY * cosRotation,
    },
    derivative: {
      x: derivativeX * cosRotation - derivativeY * sinRotation,
      y: derivativeX * sinRotation + derivativeY * cosRotation,
    },
  };
}

function getOpenArcSignedCurvature(settings: DxdConstructionSettings, angle: number) {
  const a = Math.abs(Math.cos(angle));
  const b = Math.abs(Math.sin(angle));
  const p = settings.sharpness;
  const numerator = Math.pow(a * b, p - 4);
  const denominator = Math.pow(
    Math.pow(a, 2 * p - 4) + Math.pow(b, 2 * p - 4),
    1.5,
  );

  return -((p - 2) / (settings.radius * p)) * (numerator / denominator);
}

function formatNumber(value: number) {
  return Number(value.toFixed(3)).toString();
}

export function getAstroidFrame(
  settings: DxdConstructionSettings,
  progress: number,
): DxdCurveFrame {
  const boundedProgress = Math.min(1, Math.max(0, progress));
  const angle = boundedProgress * Math.PI * 2;
  const current = getPointAndDerivative(settings, angle);
  const quarterTurn = angle / (Math.PI / 2);
  const atCusp = Math.abs(quarterTurn - Math.round(quarterTurn)) < 1e-10;
  const curvatureEpsilon = (Math.PI * 2) / 65536;
  const sampleAngle = atCusp ? angle + curvatureEpsilon : angle;
  const deltaX = atCusp ? DXD_CENTER - current.point.x : current.derivative.x;
  const deltaY = atCusp ? DXD_CENTER - current.point.y : current.derivative.y;
  const length = Math.hypot(deltaX, deltaY) || 1;
  const tangent = { x: deltaX / length, y: deltaY / length };
  const normal = { x: -tangent.y, y: tangent.x };
  const sampledCurvature = getOpenArcSignedCurvature(settings, sampleAngle);
  let signedCurvatureRadius = sampledCurvature === 0 ? 0 : 1 / sampledCurvature;

  if (atCusp && Math.abs(settings.sharpness - 4) <= 1e-8) {
    signedCurvatureRadius =
      Math.sign(sampledCurvature || -1) * settings.radius * 2;
  }

  const curvatureRadius = Math.abs(signedCurvatureRadius);
  const curvatureCenter = {
    x: current.point.x + normal.x * signedCurvatureRadius,
    y: current.point.y + normal.y * signedCurvatureRadius,
  };
  const alternateCurvatureCenter =
    atCusp && Math.abs(settings.sharpness - 4) <= 1e-8
      ? {
          x: current.point.x - normal.x * signedCurvatureRadius,
          y: current.point.y - normal.y * signedCurvatureRadius,
        }
      : null;

  return {
    point: current.point,
    tangent,
    normal,
    curvatureRadius,
    curvatureCenter,
    alternateCurvatureCenter,
    atCusp,
  };
}

export function createAstroidArcLengthLookup(
  settings: DxdConstructionSettings,
  segments = 1024,
): DxdArcLengthSample[] {
  const safeSegments = Math.max(128, Math.round(segments / 4) * 4);
  const samples: Array<DxdArcLengthSample & { distance: number }> = [
    { parameter: 0, progress: 0, distance: 0 },
  ];
  let previous = getPointAndDerivative(settings, 0).point;
  let totalDistance = 0;

  for (let index = 1; index <= safeSegments; index += 1) {
    const parameter = index / safeSegments;
    const point = getPointAndDerivative(settings, parameter * Math.PI * 2).point;
    totalDistance += Math.hypot(point.x - previous.x, point.y - previous.y);
    samples.push({ parameter, progress: 0, distance: totalDistance });
    previous = point;
  }

  return samples.map(({ parameter, distance }) => ({
    parameter,
    progress: totalDistance === 0 ? parameter : distance / totalDistance,
  }));
}

export function getParameterAtArcProgress(
  lookup: readonly DxdArcLengthSample[],
  progress: number,
) {
  const bounded = Math.min(1, Math.max(0, progress));

  if (lookup.length < 2 || bounded === 0) return 0;
  if (bounded === 1) return 1;

  let low = 0;
  let high = lookup.length - 1;

  while (low + 1 < high) {
    const middle = Math.floor((low + high) / 2);
    if (lookup[middle].progress < bounded) low = middle;
    else high = middle;
  }

  const from = lookup[low];
  const to = lookup[high];
  const span = to.progress - from.progress;
  const interpolation = span === 0 ? 0 : (bounded - from.progress) / span;
  return from.parameter + (to.parameter - from.parameter) * interpolation;
}

/* The drawn portion of the curve, from parameter 0 to `endParameter`. Built
   geometrically each frame so the visible tip is exactly the tracer's point —
   a dash-offset reveal drifts from the instrument in browsers that disagree
   on how pathLength interacts with vector-effect. */
export function createAstroidPartialPath(
  settings: DxdConstructionSettings,
  endParameter: number,
  segments = 64,
) {
  const bounded = Math.min(1, Math.max(0, endParameter));
  const safeSegments = Math.max(16, Math.round(segments / 4) * 4);
  const endAngle = bounded * Math.PI * 2;
  const fullStep = (Math.PI * 2) / safeSegments;
  const start = getPointAndDerivative(settings, 0).point;
  const commands = [`M ${formatNumber(start.x)} ${formatNumber(start.y)}`];

  for (let startAngle = 0; startAngle < endAngle; startAngle += fullStep) {
    const segmentEnd = Math.min(startAngle + fullStep, endAngle);
    const from = getPointAndDerivative(settings, startAngle);
    const to = getPointAndDerivative(settings, segmentEnd);
    const controlScale = (segmentEnd - startAngle) / 3;
    const control1 = {
      x: from.point.x + from.derivative.x * controlScale,
      y: from.point.y + from.derivative.y * controlScale,
    };
    const control2 = {
      x: to.point.x - to.derivative.x * controlScale,
      y: to.point.y - to.derivative.y * controlScale,
    };

    commands.push(
      `C ${formatNumber(control1.x)} ${formatNumber(control1.y)} ${formatNumber(control2.x)} ${formatNumber(control2.y)} ${formatNumber(to.point.x)} ${formatNumber(to.point.y)}`,
    );
  }

  return commands.join(" ");
}

export function createAstroidPath(
  settings: DxdConstructionSettings,
  segments = 64,
  closed = true,
) {
  const safeSegments = Math.max(16, Math.round(segments / 4) * 4);
  const angleStep = (Math.PI * 2) / safeSegments;
  const start = getPointAndDerivative(settings, 0).point;
  const commands = [`M ${formatNumber(start.x)} ${formatNumber(start.y)}`];

  for (let index = 0; index < safeSegments; index += 1) {
    const startAngle = index * angleStep;
    const endAngle = (index + 1) * angleStep;
    const from = getPointAndDerivative(settings, startAngle);
    const to = getPointAndDerivative(settings, endAngle);
    const controlScale = angleStep / 3;
    const control1 = {
      x: from.point.x + from.derivative.x * controlScale,
      y: from.point.y + from.derivative.y * controlScale,
    };
    const control2 = {
      x: to.point.x - to.derivative.x * controlScale,
      y: to.point.y - to.derivative.y * controlScale,
    };

    commands.push(
      `C ${formatNumber(control1.x)} ${formatNumber(control1.y)} ${formatNumber(control2.x)} ${formatNumber(control2.y)} ${formatNumber(to.point.x)} ${formatNumber(to.point.y)}`,
    );
  }

  if (closed) commands.push("Z");
  return commands.join(" ");
}
