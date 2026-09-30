/**
 * 파라메트릭 체형 메시 검증/보정 스크립트.
 *   node --experimental-strip-types scripts/check-body.mts
 *   SWEEP=1 node --experimental-strip-types scripts/check-body.mts   # 파라미터 탐색
 *
 * 필드를 직접 샘플링해 실제 둘레(cm)와 표면 요철(ripple)을 측정합니다.
 */
import { MeshBasicMaterial } from "three";
import { MarchingCubes } from "three/examples/jsm/objects/MarchingCubes.js";
import {
  buildBodyField,
  ISOLATION,
  SPREAD,
  DEFAULT_BODY,
  type BallSink,
  type BodyMeasurements,
  type FieldOptions,
} from "../src/lib/body-model.ts";

const RES = Number(process.env.RES ?? 128);

type Ball = { x: number; y: number; z: number; s: number; sub: number };

function collect(m: BodyMeasurements, opts: FieldOptions): Ball[] {
  const balls: Ball[] = [];
  const sink: BallSink = { addBall: (x, y, z, s, sub) => balls.push({ x, y, z, s, sub }) };
  buildBodyField(sink, m, opts);
  return balls;
}

function fieldAt(balls: Ball[], x: number, y: number, z: number): number {
  let v = 0;
  for (const b of balls) {
    const d2 = (x - b.x) ** 2 + (y - b.y) ** 2 + (z - b.z) ** 2;
    const val = b.s / (0.000001 + d2) - b.sub;
    if (val > 0) v += val;
  }
  return v;
}

/** 중심축에서 방향 dir 로 진행하며 첫 표면 교차까지의 거리 */
function rayOut(balls: Ball[], y: number, dir: [number, number], cx = 0.5): number {
  const step = 0.0008;
  let prev = 0;
  for (let t = 0; t < 0.5; t += step) {
    if (fieldAt(balls, cx + dir[0] * t, y, 0.5 + dir[1] * t) < ISOLATION) {
      // 이분법으로 교차점 정밀화 (측정 잡음 제거)
      let lo = prev;
      let hi = t;
      for (let i = 0; i < 24; i++) {
        const mid = (lo + hi) / 2;
        if (fieldAt(balls, cx + dir[0] * mid, y, 0.5 + dir[1] * mid) < ISOLATION) hi = mid;
        else lo = mid;
      }
      return (lo + hi) / 2;
    }
    prev = t;
  }
  return 0.5;
}

const perimeter = (a: number, b: number) => {
  const h = ((a - b) / (a + b)) ** 2;
  return Math.PI * (a + b) * (1 + (3 * h) / (10 + Math.sqrt(4 - 3 * h)));
};

/**
 * 몸통 옆면 반지름을 높이별로 훑어
 *  - ripple: 표면 요철 (2차 차분 평균, cm) — 클수록 볼 자국이 보임
 *  - webbed: 팔·다리가 몸통에 필드로 붙어버린(물갈퀴) 높이 비율
 */
function torsoScan(balls: Ball[], m: BodyMeasurements) {
  const toCm = m.height / 0.9 / SPREAD; // 좌우·앞뒤는 SPREAD 만큼 부풀려져 있음
  const clean: number[] = [];
  let webbed = 0;
  let total = 0;
  for (let f = 0.47; f <= 0.8; f += 0.006) {
    const y = 0.05 + 0.9 * f;
    const a = rayOut(balls, y, [1, 0]);
    const b = (rayOut(balls, y, [0, 1]) + rayOut(balls, y, [0, -1])) / 2;
    total++;
    if (a > b * 1.9) {
      webbed++;
      clean.push(NaN);
    } else {
      clean.push(a * toCm);
    }
  }
  let acc = 0;
  let n = 0;
  for (let i = 1; i < clean.length - 1; i++) {
    const d = Math.abs(clean[i - 1] - 2 * clean[i] + clean[i + 1]);
    if (!Number.isNaN(d)) {
      acc += d;
      n++;
    }
  }
  return { ripple: n ? acc / n : NaN, webbed: webbed / total };
}

function report(m: BodyMeasurements, opts: FieldOptions) {
  const balls = collect(m, opts);
  const toCm = m.height / 0.9 / SPREAD; // 좌우·앞뒤 실제 길이
  const out: Record<string, number> = {};
  for (const [name, f, want] of [
    ["chest", 0.715, m.chest],
    ["waist", 0.615, m.waist],
    ["hip", 0.52, m.hip],
  ] as const) {
    const y = 0.05 + 0.9 * f;
    const a = rayOut(balls, y, [1, 0]);
    const b = (rayOut(balls, y, [0, 1]) + rayOut(balls, y, [0, -1])) / 2;
    out[name] = (perimeter(a, b) * toCm - want) / want;
  }
  // 팔뚝 지름 (f=0.55 부근, 바깥쪽 반지름 ×2)
  const armAxis = 0.5 + (0.112 + (0.075 * (0.812 - 0.55)) / (0.812 - 0.63)) * 0.9 * SPREAD;
  out.armDia = rayOut(balls, 0.05 + 0.9 * 0.55, [1, 0], armAxis) * 2 * toCm;
  const scan = torsoScan(balls, m);
  out.ripple = scan.ripple;
  out.webbed = scan.webbed;
  out.balls = balls.length;
  return out;
}

const BODIES: BodyMeasurements[] = [
  DEFAULT_BODY,
  { height: 160, chest: 84, waist: 68, hip: 92 },
  { height: 185, chest: 112, waist: 108, hip: 112 },
];

if (process.env.SWEEP) {
  console.log("sub  torso | chest%  waist%   hip%  | ripple  webbed  arm(cm)");
  for (const subtract of [90, 130, 180, 240]) {
    for (const torsoShrink of [0.72, 0.8, 0.88, 0.95]) {
      const rows = BODIES.map((b) => report(b, { subtract, torsoShrink, limbShrink: 0.85 }));
      const avg = (k: string) => rows.reduce((a, r) => a + r[k], 0) / rows.length;
      console.log(
        `${String(subtract).padStart(3)}  ${torsoShrink.toFixed(2)} |` +
          ` ${(avg("chest") * 100).toFixed(1).padStart(6)} ${(avg("waist") * 100).toFixed(1).padStart(6)}` +
          ` ${(avg("hip") * 100).toFixed(1).padStart(6)} | ${avg("ripple").toFixed(3)}` +
          `   ${(avg("webbed") * 100).toFixed(0).padStart(3)}%   ${avg("armDia").toFixed(1)}`,
      );
    }
  }
} else {
  for (const m of BODIES) {
    const r = report(m, {});
    const mc = new MarchingCubes(RES, new MeshBasicMaterial(), false, false, 250_000);
    mc.isolation = ISOLATION;
    mc.reset();
    buildBodyField(mc, m);
    mc.update();
    const pos = mc.geometry.getAttribute("position").array as Float32Array;
    let ymin = 1;
    let ymax = 0;
    for (let i = 0; i < mc.count; i++) {
      const yy = (pos[i * 3 + 1] + 1) / 2;
      if (yy < ymin) ymin = yy;
      if (yy > ymax) ymax = yy;
    }
    console.log(
      `\n== ${JSON.stringify(m)}  볼 ${r.balls}개  삼각형 ${mc.count / 3}개\n` +
        `   키 ${(((ymax - ymin) * m.height) / 0.9).toFixed(0)}cm` +
        `  가슴 ${(r.chest * 100).toFixed(1)}%  허리 ${(r.waist * 100).toFixed(1)}%  엉덩이 ${(r.hip * 100).toFixed(1)}%` +
        `  팔뚝지름 ${r.armDia.toFixed(1)}cm  요철 ${r.ripple.toFixed(3)}  물갈퀴 ${(r.webbed * 100).toFixed(0)}%`,
    );
  }
}
