/**
 * 3D 인체 계측(anthropometry) 데모용 파라메트릭 체형 모델.
 *
 * 신체 둘레 계측치(키·가슴·허리·엉덩이)를 받아 메타볼(implicit surface) 필드를
 * 구성합니다. MarchingCubes 로 폴리곤화하면 계측치에 따라 부드럽게 변형되는
 * 인체 메시가 만들어집니다. three.js 에 의존하지 않는 순수 함수라
 * 노드 스크립트(scripts/check-body.mts)에서 치수를 그대로 검증할 수 있습니다.
 */

export interface BodyMeasurements {
  /** 키 (cm) */
  height: number;
  /** 가슴둘레 (cm) */
  chest: number;
  /** 허리둘레 (cm) */
  waist: number;
  /** 엉덩이둘레 (cm) */
  hip: number;
}

export const DEFAULT_BODY: BodyMeasurements = { height: 170, chest: 92, waist: 78, hip: 96 };

export const BODY_RANGE: Record<keyof BodyMeasurements, { min: number; max: number }> = {
  height: { min: 145, max: 200 },
  chest: { min: 70, max: 130 },
  waist: { min: 55, max: 130 },
  hip: { min: 75, max: 135 },
};

/** MarchingCubes 파라미터 — 표면은 field = ISOLATION 등고면입니다. */
export const ISOLATION = 80;

export interface FieldOptions {
  /** 메타볼 감쇠 계수. 작을수록 이웃 볼과 부드럽게 섞이고 크게 부풉니다. */
  subtract?: number;
  /** 몸통/사지 반지름 보정 (겹침으로 부푸는 만큼 미리 깎음) */
  torsoShrink?: number;
  limbShrink?: number;
}

/** scripts/check-body.mts 로 실측해 맞춘 기본값 (둘레 오차 ≤ 5%, 요철 0.03cm) */
const DEFAULTS: Required<FieldOptions> = {
  subtract: 240,
  torsoShrink: 0.88,
  limbShrink: 0.85,
};

/** 필드 큐브(0..1) 안에서 몸이 차지하는 세로 비율과 바닥 위치 */
const BODY_H = 0.9;
const FLOOR = 0.05;
/**
 * 사람은 세로로 길어 큐브 격자의 좌우·앞뒤가 남습니다. 좌우·앞뒤(및 반지름)를
 * SPREAD 배로 부풀려 격자를 채우고, 렌더링할 때 MESH_SCALE 로 되돌립니다.
 * 팔·발목처럼 가는 부위가 폴리곤화될 때 충분한 복셀 수를 확보하기 위한 것입니다.
 */
export const SPREAD = 1.4;
/** MarchingCubes 오브젝트에 적용할 스케일 (SPREAD 보정) */
export const MESH_SCALE = { x: 1 / SPREAD, y: 1, z: 1 / SPREAD };
/** 몸통 단면 샘플 간격 (키 대비) — 촘촘할수록 표면이 매끄럽습니다. */
const TORSO_STEP = 0.012;

export interface BallSink {
  addBall(x: number, y: number, z: number, strength: number, subtract: number): void;
}

/** 키 대비 비율(f: 발바닥 0 ~ 머리끝 1)을 필드 y 좌표로 */
const yOf = (f: number) => FLOOR + BODY_H * f;
/** 키 대비 비율을 필드 길이로 */
const s = (f: number) => f * BODY_H;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const smooth = (t: number) => t * t * (3 - 2 * t);

interface Node3 {
  /** 좌우 (몸 중심 0) */
  x: number;
  /** 키 대비 높이 비율 */
  f: number;
  /** 앞뒤 (앞이 +) */
  z?: number;
  /** 필드 단위 반지름 */
  r: number;
}

/** 몸통 단면 키프레임: 높이 비율 / 둘레(cm) / 좌우:앞뒤 비 / 앞쪽 이동 */
interface Level {
  f: number;
  c: number;
  aspect: number;
  z: number;
}

export function buildBodyField(
  sink: BallSink,
  mRaw: BodyMeasurements,
  options: FieldOptions = {},
): void {
  const { subtract, torsoShrink, limbShrink } = { ...DEFAULTS, ...options };
  /** 반지름 R 인 구를 만드는 strength (단독 볼 기준) */
  const strengthOf = (r: number) => r * r * (ISOLATION + subtract);

  const ball = (x: number, f: number, z: number, r: number) => {
    if (r <= 0.004) return;
    sink.addBall(
      0.5 + x * SPREAD,
      yOf(f),
      0.5 + z * SPREAD,
      strengthOf(r * SPREAD),
      subtract,
    );
  };

  const m: BodyMeasurements = {
    height: clamp(mRaw.height, BODY_RANGE.height.min, BODY_RANGE.height.max),
    chest: clamp(mRaw.chest, BODY_RANGE.chest.min, BODY_RANGE.chest.max),
    waist: clamp(mRaw.waist, BODY_RANGE.waist.min, BODY_RANGE.waist.max),
    hip: clamp(mRaw.hip, BODY_RANGE.hip.min, BODY_RANGE.hip.max),
  };

  /** cm → 필드 단위 */
  const unit = BODY_H / m.height;
  /** 체격 배수 — 사지 굵기와 어깨 너비에 반영 */
  const bulk = clamp(Math.pow((m.chest + m.waist + m.hip) / 3 / (0.51 * m.height), 0.8), 0.78, 1.45);
  /** 복부 돌출 — 허리가 가슴보다 두꺼워질수록 앞으로 */
  const belly = Math.max(0, m.waist - m.chest * 0.86) * unit * 0.22;

  // ── 몸통: 골반 → 어깨. 키프레임을 부드럽게 보간해 촘촘히 채웁니다 ──
  const levels: Level[] = [
    { f: 0.45, c: m.hip * 0.9, aspect: 1.26, z: 0 },
    { f: 0.52, c: m.hip, aspect: 1.35, z: 0 },
    { f: 0.575, c: lerp(m.hip, m.waist, 0.62), aspect: 1.3, z: belly * 0.5 },
    { f: 0.615, c: m.waist, aspect: 1.26, z: belly },
    { f: 0.665, c: lerp(m.waist, m.chest, 0.62), aspect: 1.3, z: belly * 0.55 },
    { f: 0.715, c: m.chest, aspect: 1.36, z: 0 },
    { f: 0.775, c: m.chest * 0.96, aspect: 1.42, z: 0 },
    { f: 0.815, c: m.chest * 0.87, aspect: 1.46, z: 0 },
  ];

  const at = (f: number): Level => {
    if (f <= levels[0].f) return levels[0];
    for (let i = 1; i < levels.length; i++) {
      const b = levels[i];
      if (f > b.f) continue;
      const a = levels[i - 1];
      const t = smooth((f - a.f) / (b.f - a.f));
      return { f, c: lerp(a.c, b.c, t), aspect: lerp(a.aspect, b.aspect, t), z: lerp(a.z, b.z, t) };
    }
    return levels[levels.length - 1];
  };

  const first = levels[0].f;
  const last = levels[levels.length - 1].f;
  for (let f = first; f <= last + 1e-9; f += TORSO_STEP) {
    const lv = at(f);
    const r = (lv.c / (2 * Math.PI)) * unit * torsoShrink;
    const a = r * Math.sqrt(lv.aspect); // 좌우 반지름
    const b = r / Math.sqrt(lv.aspect); // 앞뒤 반지름
    // 좌우로 늘어놓은 볼들의 합집합이 타원 단면이 됩니다.
    // 두 개만 쓰면 가운데에 이음매가 보이므로 촘촘히 채웁니다.
    const off = Math.max(0, a - b);
    const steps = Math.max(1, Math.ceil(off / (b * 0.45)));
    for (let k = -steps; k <= steps; k++) ball((off * k) / steps, f, lv.z, b);
  }

  /** 관절 노드를 잇는 사지 — 반지름에 비례해 촘촘히 채웁니다 */
  const chain = (nodes: Node3[]) => {
    for (let i = 0; i < nodes.length - 1; i++) {
      const a = nodes[i];
      const b = nodes[i + 1];
      const dx = b.x - a.x;
      const dy = s(b.f - a.f);
      const dz = (b.z ?? 0) - (a.z ?? 0);
      const len = Math.hypot(dx, dy, dz);
      const step = Math.max(0.006, Math.min(a.r, b.r) * limbShrink * 0.5);
      const n = Math.max(1, Math.ceil(len / step));
      for (let j = 0; j <= n; j++) {
        if (j === n && i < nodes.length - 2) break; // 이음새 중복 방지
        const t = j / n;
        ball(
          lerp(a.x, b.x, t),
          lerp(a.f, b.f, t),
          lerp(a.z ?? 0, b.z ?? 0, t),
          lerp(a.r, b.r, t) * limbShrink,
        );
      }
    }
  };

  // ── 어깨·목·머리 ────────────────────────────────────────────────
  // SPREAD 로 부풀린 필드에서 구는 세로로 SPREAD 배 길어져 렌더링됩니다.
  // 머리·발처럼 위아래 끝을 정하는 부위는 반지름과 위치를 미리 나눠 보정합니다.
  const shoulder = s(0.112) * Math.pow(bulk, 0.55); // 어깨 반너비
  const armR = s(0.032) * bulk;
  // 머리는 SPREAD 때문에 세로로 길어집니다 — 사람 머리(가로:세로 ≈ 1:1.4)와 같은 방향
  const headR = s(0.048);
  const headF = 1 - (SPREAD * headR) / BODY_H; // 정수리가 키 100% 에 닿도록
  chain([
    { x: -shoulder, f: 0.812, r: armR * 1.12 },
    { x: shoulder, f: 0.812, r: armR * 1.12 },
  ]);
  chain([
    { x: 0, f: 0.822, r: s(0.038) * bulk }, // 목
    { x: 0, f: 0.87, r: s(0.031) },
    { x: 0, f: headF, r: headR }, // 머리
  ]);

  // ── 팔: 3D 스캐너 표준에 가까운 좁은 A-포즈 ──────────────────────
  for (const side of [-1, 1]) {
    chain([
      { x: side * shoulder, f: 0.812, r: armR },
      { x: side * (shoulder + s(0.06)), f: 0.63, r: armR * 0.8 }, // 팔꿈치
      { x: side * (shoulder + s(0.115)), f: 0.45, r: armR * 0.58 }, // 손목
      { x: side * (shoulder + s(0.142)), f: 0.392, r: armR * 0.52 }, // 손
    ]);
  }

  // ── 다리 ────────────────────────────────────────────────────────
  const hipR = (m.hip / (2 * Math.PI)) * unit;
  const thighR = clamp(hipR * 0.58, s(0.04), s(0.085));
  const ankleR = thighR * 0.34;
  const footR = (thighR * 0.36) / SPREAD;
  const footF = (SPREAD * footR) / BODY_H; // 발바닥이 바닥(f=0)에 닿도록
  for (const side of [-1, 1]) {
    chain([
      { x: side * hipR * 0.42, f: 0.505, r: thighR },
      { x: side * s(0.06), f: 0.33, r: thighR * 0.72 },
      { x: side * s(0.058), f: 0.27, r: thighR * 0.58 }, // 무릎
      { x: side * s(0.06), f: 0.205, r: thighR * 0.66 }, // 종아리
      { x: side * s(0.062), f: footF + (SPREAD * ankleR) / BODY_H, r: ankleR }, // 발목
      { x: side * s(0.062), f: footF, z: 0, r: footR }, // 발뒤꿈치
      { x: side * s(0.062), f: footF, z: s(0.075), r: footR * 0.8 }, // 발끝
    ]);
  }
}

/** 허리-엉덩이 비율 (WHR) — 체형 지표 */
export function waistHipRatio(m: BodyMeasurements): number {
  return m.waist / m.hip;
}
/**
 * 메타볼 필드를 기록해 두는 싱크. 폴리곤화 뒤 정확한 법선을 다시 계산할 때 씁니다.
 * (MarchingCubes 가 만드는 법선은 격자에서 샘플링해 얇은 부위에서 계단처럼 보입니다)
 */
export class BallRecorder implements BallSink {
  /** [x, y, z, strength, subtract] × N */
  readonly data: number[] = [];
  private readonly forward?: BallSink;

  constructor(forward?: BallSink) {
    this.forward = forward;
  }

  addBall(x: number, y: number, z: number, strength: number, subtract: number): void {
    this.data.push(x, y, z, strength, subtract);
    this.forward?.addBall(x, y, z, strength, subtract);
  }

  reset(): void {
    this.data.length = 0;
  }
}

/**
 * 등고면 뉴턴 보정 패스 수 (마지막 패스는 법선 계산용).
 * 4패스면 등고면 오차 평균 1.1% 로 수렴합니다 (scripts/check-body.mts 로 측정).
 */
const REFINE_PASSES = 4;

/**
 * MarchingCubes 결과를 다듬습니다.
 *
 *  1) 정점을 뉴턴 1스텝으로 실제 등고면 위로 옮깁니다.
 *     격자 선형보간은 1/d² 필드에서 오차가 커서, 팔·발목처럼 가는 부위가
 *     복셀 주기로 울퉁불퉁해집니다(구슬 자국).
 *  2) 옮긴 자리에서 필드의 해석적 기울기로 법선을 다시 계산합니다.
 *
 * positions/normals 는 MarchingCubes 의 -1..1 오브젝트 좌표계,
 * balls 는 0..1 필드 좌표계입니다.
 */
export function refineSurface(
  positions: Float32Array,
  normals: Float32Array,
  vertexCount: number,
  balls: readonly number[],
): void {
  // 높이(y) 구간별 색인 — 정점마다 영향권에 드는 볼만 훑습니다.
  const BUCKETS = 96;
  const buckets: number[][] = Array.from({ length: BUCKETS }, () => []);
  for (let b = 0; b < balls.length; b += 5) {
    const reach = Math.sqrt(balls[b + 3] / balls[b + 4]); // 필드가 0 이 되는 거리
    const lo = Math.max(0, Math.floor((balls[b + 1] - reach) * BUCKETS));
    const hi = Math.min(BUCKETS - 1, Math.floor((balls[b + 1] + reach) * BUCKETS));
    for (let i = lo; i <= hi; i++) buckets[i].push(b);
  }

  for (let i = 0; i < vertexCount; i++) {
    let px = (positions[i * 3] + 1) / 2;
    let py = (positions[i * 3 + 1] + 1) / 2;
    let pz = (positions[i * 3 + 2] + 1) / 2;
    const near = buckets[Math.min(BUCKETS - 1, Math.max(0, Math.floor(py * BUCKETS)))];
    if (near.length === 0) continue;

    let gx = 0;
    let gy = 0;
    let gz = 0;
    // 뉴턴 보정 (PASSES-1 회) + 마지막 위치에서 법선 계산
    for (let pass = 0; pass < REFINE_PASSES; pass++) {
      let field = 0;
      gx = 0;
      gy = 0;
      gz = 0;
      for (let n = 0; n < near.length; n++) {
        const b = near[n];
        const dx = px - balls[b];
        const dy = py - balls[b + 1];
        const dz = pz - balls[b + 2];
        const d2 = dx * dx + dy * dy + dz * dz + 1e-6;
        const strength = balls[b + 3];
        const val = strength / d2 - balls[b + 4];
        if (val <= 0) continue; // 영향권 밖
        field += val;
        // ∇F = -2·k·(p-c) 이므로 (gx,gy,gz) 는 바깥 방향 성분
        const k = strength / (d2 * d2);
        gx += k * dx;
        gy += k * dy;
        gz += k * dz;
      }
      const g2 = gx * gx + gy * gy + gz * gz;
      if (g2 === 0) break;
      if (pass === REFINE_PASSES - 1) break;
      // F(p) = ISOLATION 이 되도록 기울기 방향으로 한 걸음
      const t = (ISOLATION - field) / (2 * g2);
      px -= t * gx;
      py -= t * gy;
      pz -= t * gz;
    }

    const len = Math.hypot(gx, gy, gz);
    if (len === 0) continue;
    positions[i * 3] = px * 2 - 1;
    positions[i * 3 + 1] = py * 2 - 1;
    positions[i * 3 + 2] = pz * 2 - 1;
    normals[i * 3] = gx / len;
    normals[i * 3 + 1] = gy / len;
    normals[i * 3 + 2] = gz / len;
  }
}
