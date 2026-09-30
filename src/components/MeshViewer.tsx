"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ACESFilmicToneMapping,
  AmbientLight,
  Box3,
  BufferGeometry,
  DirectionalLight,
  Group,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  PerspectiveCamera,
  Points,
  PointsMaterial,
  Scene,
  Vector3,
  WebGLRenderer,
} from "three";
import { MarchingCubes } from "three/examples/jsm/objects/MarchingCubes.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import {
  BODY_RANGE,
  BallRecorder,
  DEFAULT_BODY,
  ISOLATION,
  MESH_SCALE,
  refineSurface,
  buildBodyField,
  waistHipRatio,
  type BodyMeasurements,
} from "@/lib/body-model";
import { getDict } from "@/lib/i18n";
import type { Lang } from "@/lib/types";

export interface MeshViewerProps {
  /** 모델 파일 경로(/models/*.glb|ply|obj|stl). 비우면 파라메트릭 인체 데모 */
  src?: string;
  lang: Lang;
}

const SURFACE = { light: 0xdcdcdc, dark: 0xb0b0b0 };

function isDark() {
  return typeof document !== "undefined" && document.documentElement.classList.contains("dark");
}

/** 사용자가 "움직임 줄이기"를 켰는지 */
function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/** 화면 크기에 따른 마칭큐브 해상도 — 모바일에서는 낮춰 부담을 줄입니다. */
function resolutionFor(width: number) {
  if (width < 480) return 80;
  if (width < 900) return 104;
  return 128;
}

export default function MeshViewer({ src, lang }: MeshViewerProps) {
  const t = getDict(lang).viewer;
  const mountRef = useRef<HTMLDivElement>(null);
  const rebuildRef = useRef<((m: BodyMeasurements) => void) | null>(null);
  const resetViewRef = useRef<(() => void) | null>(null);
  const setWireRef = useRef<((on: boolean) => void) | null>(null);
  const setAutoRef = useRef<((on: boolean) => void) | null>(null);

  const [body, setBody] = useState<BodyMeasurements>(DEFAULT_BODY);
  const [wire, setWire] = useState(false);
  // 움직임 줄이기 설정이 켜져 있으면 자동 회전 없이 시작합니다
  const [auto, setAuto] = useState(() => !prefersReducedMotion());
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  /** 렌더 도중이 아니라 이펙트 밖에서 상태를 알리기 위한 헬퍼 */
  const publish = useCallback((fn: () => void) => queueMicrotask(fn), []);

  const whr = useMemo(() => waistHipRatio(body), [body]);

  // ── three.js 씬 부트스트랩 (마운트당 1회) ─────────────────────────
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let renderer: WebGLRenderer;
    try {
      renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    } catch {
      publish(() => setStatus("error"));
      return;
    }

    const disposables: { dispose(): void }[] = [];
    const scene = new Scene();
    const camera = new PerspectiveCamera(32, 1, 0.1, 100);
    const material = new MeshStandardMaterial({
      color: isDark() ? SURFACE.dark : SURFACE.light,
      roughness: 0.62,
      metalness: 0.04,
    });
    disposables.push(material);

    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    renderer.toneMapping = ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    mount.appendChild(renderer.domElement);
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";
    renderer.domElement.style.touchAction = "pan-y";

    const key = new DirectionalLight(0xfff4e6, 2.1);
    key.position.set(2.4, 3.2, 2.6);
    const fill = new DirectionalLight(0xdce6ff, 0.9);
    fill.position.set(-2.6, 0.6, -1.8);
    scene.add(key, fill, new AmbientLight(0xffffff, 0.6));

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = false;
    controls.minDistance = 1.4;
    controls.maxDistance = 9;
    controls.autoRotateSpeed = 1.1;

    const reduceMotion = prefersReducedMotion();
    controls.autoRotate = !reduceMotion;

    /** 사용자가 시점을 건드렸는지 — 이후 리사이즈/재생성에서 시점을 유지 */
    let touched = false;
    let idleTimer: ReturnType<typeof setTimeout> | null = null;
    let userWantsAuto = !reduceMotion;
    const onStart = () => {
      touched = true;
      controls.autoRotate = false;
      if (idleTimer) clearTimeout(idleTimer);
    };
    const onEnd = () => {
      if (!userWantsAuto) return;
      if (idleTimer) clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        controls.autoRotate = true;
      }, 2500);
    };
    controls.addEventListener("start", onStart);
    controls.addEventListener("end", onEnd);
    setAutoRef.current = (on) => {
      userWantsAuto = on;
      controls.autoRotate = on;
    };
    setWireRef.current = (on) => {
      material.wireframe = on;
      material.needsUpdate = true;
    };

    /** 대상 오브젝트가 화면에 꽉 차도록 카메라를 잡아줍니다 */
    let framed = { center: new Vector3(), half: new Vector3(1, 1, 1) };
    const frame = (object: Object3D) => {
      const box = new Box3().setFromObject(object);
      if (box.isEmpty()) return;
      framed = {
        center: box.getCenter(new Vector3()),
        half: box.getSize(new Vector3()).multiplyScalar(0.5),
      };
      resetView();
    };
    const resetView = () => {
      const vFov = (camera.fov * Math.PI) / 180;
      const hFov = 2 * Math.atan(Math.tan(vFov / 2) * camera.aspect);
      // 자동 회전하므로 수평 반경은 x·z 를 함께 고려
      const radiusH = Math.hypot(framed.half.x, framed.half.z);
      // 좁은 화면에서는 조작 버튼과 겹치지 않도록 여백을 더 둡니다
      const margin = camera.aspect < 1.2 ? 1.32 : 1.12;
      const dist =
        Math.max(framed.half.y / Math.tan(vFov / 2), radiusH / Math.tan(hFov / 2)) * margin;
      const dir = new Vector3(0.3, 0.14, 0.94).normalize().multiplyScalar(dist);
      controls.target.copy(framed.center);
      camera.position.copy(framed.center).add(dir);
      controls.minDistance = dist * 0.35;
      controls.maxDistance = dist * 3;
      camera.near = Math.max(0.01, dist / 100);
      camera.far = dist * 20;
      camera.updateProjectionMatrix();
      controls.update();
    };
    resetViewRef.current = () => {
      touched = false;
      resetView();
    };

    // ── 콘텐츠: 파라메트릭 인체 또는 모델 파일 ──────────────────────
    let cancelled = false;

    if (!src) {
      const res = resolutionFor(mount.clientWidth || 640);
      const mc = new MarchingCubes(res, material, false, false, 200_000);
      mc.isolation = ISOLATION;
      // 필드 좌표(0..1) → 오브젝트 좌표(-1..1).
      // SPREAD 로 부풀려 놓은 좌우·앞뒤를 여기서 원래 비율로 되돌립니다.
      mc.scale.set(MESH_SCALE.x, MESH_SCALE.y, MESH_SCALE.z);
      scene.add(mc);
      disposables.push(mc.geometry);
      const recorder = new BallRecorder(mc);
      const rebuild = (m: BodyMeasurements) => {
        mc.reset();
        recorder.reset();
        buildBodyField(recorder, m);
        mc.update();
        // 격자 선형보간 오차(구슬 자국)를 없애고 법선을 필드에서 정확히 다시 계산
        const positionAttr = mc.geometry.getAttribute("position");
        const normalAttr = mc.geometry.getAttribute("normal");
        refineSurface(
          positionAttr.array as Float32Array,
          normalAttr.array as Float32Array,
          mc.count,
          recorder.data,
        );
        positionAttr.needsUpdate = true;
        normalAttr.needsUpdate = true;
        if (!touched) {
          // 생성된 삼각형 범위만으로 경계 상자를 구해 화면에 맞춥니다 (스케일 반영)
          const pos = mc.geometry.getAttribute("position").array as ArrayLike<number>;
          const box = new Box3();
          const v = new Vector3();
          for (let i = 0; i < mc.count; i++) {
            box.expandByPoint(
              v.set(
                pos[i * 3] * MESH_SCALE.x,
                pos[i * 3 + 1] * MESH_SCALE.y,
                pos[i * 3 + 2] * MESH_SCALE.z,
              ),
            );
          }
          if (!box.isEmpty()) {
            framed = {
              center: box.getCenter(new Vector3()),
              half: box.getSize(new Vector3()).multiplyScalar(0.5),
            };
            resetView();
          }
        }
      };
      rebuild(DEFAULT_BODY);
      rebuildRef.current = rebuild;
      publish(() => setStatus("ready"));
    } else {
      loadModel(src)
        .then((object) => {
          if (cancelled) {
            disposeTree(object);
            return;
          }
          object.traverse((child) => {
            if (child instanceof Mesh) {
              const old = child.material;
              child.material = material;
              disposeMaterial(old);
              disposables.push(child.geometry);
            } else if (child instanceof Points) {
              disposables.push(child.geometry, child.material as PointsMaterial);
            }
          });
          scene.add(object);
          frame(object);
          setStatus("ready");
        })
        .catch(() => {
          if (!cancelled) setStatus("error");
        });
    }

    // ── 리사이즈 / 테마 / 렌더 루프 ────────────────────────────────
    const resize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      if (w === 0 || h === 0) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      if (!touched) resetView();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(mount);

    const applyTheme = () => {
      const dark = isDark();
      material.color.setHex(dark ? SURFACE.dark : SURFACE.light);
      scene.background = null;
      renderer.setClearColor(0x000000, 0);
    };
    applyTheme();
    const themeObserver = new MutationObserver(applyTheme);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    renderer.setAnimationLoop(() => {
      controls.update();
      renderer.render(scene, camera);
    });

    return () => {
      cancelled = true;
      if (idleTimer) clearTimeout(idleTimer);
      renderer.setAnimationLoop(null);
      themeObserver.disconnect();
      ro.disconnect();
      controls.removeEventListener("start", onStart);
      controls.removeEventListener("end", onEnd);
      controls.dispose();
      for (const d of disposables) d.dispose();
      renderer.dispose();
      renderer.domElement.remove();
      rebuildRef.current = null;
      resetViewRef.current = null;
      setWireRef.current = null;
      setAutoRef.current = null;
    };
  }, [src, publish]);

  // 슬라이더 변경 → 다음 프레임에 메시 재생성 (드래그 중 과부하 방지)
  useEffect(() => {
    if (src || !rebuildRef.current) return;
    const id = requestAnimationFrame(() => rebuildRef.current?.(body));
    return () => cancelAnimationFrame(id);
  }, [body, src, status]);

  const onSlide = useCallback((key: keyof BodyMeasurements, value: number) => {
    setBody((prev) => ({ ...prev, [key]: value }));
  }, []);

  return (
    <div className="border border-border">
      <div className="relative">
        <div ref={mountRef} className="h-[360px] w-full sm:h-[460px]" aria-hidden="true" />

        {status !== "ready" && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-muted">
            {status === "loading" ? t.loading : t.failed}
          </div>
        )}

        {/* 조작 버튼 */}
        <div className="absolute right-3 top-3 flex gap-3 text-sm">
          <button
            type="button"
            onClick={() => {
              const next = !auto;
              setAuto(next);
              setAutoRef.current?.(next);
            }}
            aria-pressed={auto}
            className={auto ? "text-foreground underline underline-offset-2" : "text-muted hover:text-foreground"}
          >
            {t.autoRotate}
          </button>
          <button
            type="button"
            onClick={() => {
              const next = !wire;
              setWire(next);
              setWireRef.current?.(next);
            }}
            aria-pressed={wire}
            className={wire ? "text-foreground underline underline-offset-2" : "text-muted hover:text-foreground"}
          >
            {t.wireframe}
          </button>
          <button
            type="button"
            onClick={() => resetViewRef.current?.()}
            className="text-muted hover:text-foreground"
          >
            {t.reset}
          </button>
        </div>

        <p className="pointer-events-none absolute bottom-3 left-4 text-sm text-muted">{t.hint}</p>
      </div>

      {/* 계측치 슬라이더 (파라메트릭 데모 전용) */}
      {!src && (
        <div className="border-t border-border px-5 py-5">
          <div className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
            {(Object.keys(BODY_RANGE) as (keyof BodyMeasurements)[]).map((k) => (
              <label key={k} className="block text-sm">
                <span className="flex items-baseline justify-between">
                  <span>{t.fields[k]}</span>
                  <span className="tabular-nums text-muted">{body[k]} cm</span>
                </span>
                <input
                  type="range"
                  min={BODY_RANGE[k].min}
                  max={BODY_RANGE[k].max}
                  step={1}
                  value={body[k]}
                  onChange={(e) => onSlide(k, Number(e.target.value))}
                  className="mt-2 w-full accent-[var(--foreground)]"
                />
              </label>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted">
            <span>
              {t.whr} <span className="tabular-nums text-foreground">{whr.toFixed(2)}</span>
            </span>
            <button
              type="button"
              onClick={() => setBody(DEFAULT_BODY)}
              className="underline underline-offset-2 hover:text-foreground"
            >
              {t.resetBody}
            </button>
            <span className="ml-auto">{t.note}</span>
          </div>
        </div>
      )}
    </div>
  );
}

/** 확장자에 맞는 로더를 동적으로 불러와 모델을 반환합니다. */
async function loadModel(src: string): Promise<Object3D> {
  const ext = src.split("?")[0].split(".").pop()?.toLowerCase();
  if (ext === "glb" || ext === "gltf") {
    const { GLTFLoader } = await import("three/examples/jsm/loaders/GLTFLoader.js");
    const gltf = await new GLTFLoader().loadAsync(src);
    return gltf.scene;
  }
  if (ext === "ply") {
    const { PLYLoader } = await import("three/examples/jsm/loaders/PLYLoader.js");
    const geometry = await new PLYLoader().loadAsync(src);
    return geometryToObject(geometry);
  }
  if (ext === "stl") {
    const { STLLoader } = await import("three/examples/jsm/loaders/STLLoader.js");
    const geometry = await new STLLoader().loadAsync(src);
    return geometryToObject(geometry);
  }
  if (ext === "obj") {
    const { OBJLoader } = await import("three/examples/jsm/loaders/OBJLoader.js");
    return (await new OBJLoader().loadAsync(src)) as Group;
  }
  throw new Error(`unsupported model format: ${src}`);
}

/** 면이 없는 스캔 데이터(포인트 클라우드)는 Points 로 렌더링합니다. */
function geometryToObject(geometry: BufferGeometry): Object3D {
  geometry.computeVertexNormals();
  const hasFaces = geometry.getIndex() !== null || geometry.getAttribute("normal") !== undefined;
  if (!hasFaces) {
    const mat = new PointsMaterial({ size: 0.004, vertexColors: geometry.hasAttribute("color") });
    return new Points(geometry, mat);
  }
  return new Mesh(geometry);
}

function disposeMaterial(material: unknown) {
  if (Array.isArray(material)) material.forEach(disposeMaterial);
  else if (material && typeof (material as { dispose?: unknown }).dispose === "function")
    (material as { dispose(): void }).dispose();
}

function disposeTree(object: Object3D) {
  object.traverse((child) => {
    const withGeom = child as { geometry?: BufferGeometry; material?: unknown };
    withGeom.geometry?.dispose();
    disposeMaterial(withGeom.material);
  });
}
