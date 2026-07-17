"use client";

import { Suspense, useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, ContactShadows, Float, Environment } from "@react-three/drei";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const MODEL_URL = "/models/farmex_bottle.glb";

/* ------------------------------------------------------------------ */
/* Bottle                                                              */
/* ------------------------------------------------------------------ */
function Bottle() {
  const { scene } = useGLTF(MODEL_URL);

  const prepared = useMemo(() => {
    const clone  = scene.clone(true);
    const box    = new THREE.Box3().setFromObject(clone);
    const size   = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    clone.position.sub(center);
    clone.scale.setScalar(2.1 / size.y);

    clone.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow    = true;
        child.receiveShadow = true;
        const mat = child.material as THREE.MeshStandardMaterial;
        if (mat && "roughness" in mat) {
          mat.roughness       = Math.min(mat.roughness ?? 0.5, 0.30);
          mat.envMapIntensity = 1.8;
        }
      }
    });

    return clone;
  }, [scene]);

  return <primitive object={prepared} />;
}

/* ------------------------------------------------------------------ */
/* ScrollRig                                                           */
/* ------------------------------------------------------------------ */
function ScrollRig() {
  const travel = useRef<THREE.Group>(null);
  const spin   = useRef<THREE.Group>(null);
  const idle   = useRef<THREE.Group>(null);
  const { viewport } = useThree();

  const xSlot = Math.min(viewport.width * 0.24, 2.4);

  useLayoutEffect(() => {
    if (!travel.current || !spin.current) return;

    const mm = gsap.matchMedia();
    mm.add(
      {
        motionOk: "(prefers-reduced-motion: no-preference)",
        motionOff: "(prefers-reduced-motion: reduce)",
      },
      (ctx) => {
        const { motionOff } = ctx.conditions as { motionOff: boolean };
        if (motionOff) return;

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: "#scroll-wrap",
            start: "top top",
            end:   "bottom bottom",
            scrub: 2,           // higher = smoother, more inertia feel
          },
        });

        const pos = travel.current!.position;
        const rot = spin.current!.rotation;
        const scl = travel.current!.scale;

        tl
          // S1 → S2  bottle drifts right, full spin
          .to(pos, { x: xSlot,  duration: 1, ease: "power2.inOut" }, 0)
          .to(rot, { y: Math.PI * 2, duration: 1, ease: "power1.inOut" }, 0)

          // S2 → S3  crosses to left, slight tilt
          .to(pos, { x: -xSlot, duration: 1, ease: "power2.inOut" }, 1)
          .to(rot, { y: Math.PI * 4, z: -0.18, duration: 1, ease: "power1.inOut" }, 1)

          // S3 → S4  returns to centre, pops in scale
          .to(pos, { x: 0, y: 0.15, duration: 1, ease: "power2.out" }, 2)
          .to(rot, { y: Math.PI * 6, z: 0,  duration: 1, ease: "power1.inOut" }, 2)
          .to(scl, { x: 1.15, y: 1.15, z: 1.15, duration: 0.6, ease: "back.out(1.4)" }, 2.4);

        return () => { tl.scrollTrigger?.kill(); tl.kill(); };
      }
    );

    return () => mm.revert();
  }, [xSlot]);

  // gentle breathing bob
  useFrame(({ clock }) => {
    if (!idle.current) return;
    const t = clock.getElapsedTime();
    idle.current.position.y = Math.sin(t * 0.85) * 0.06;
  });

  return (
    <group ref={travel}>
      <group ref={spin}>
        {/*
          Start at a nice 3/4 product angle:
          slight Y rotation shows the label face, tiny X tilt adds depth
        */}
        <group rotation={[0.04, -0.38, 0]}>
          <group ref={idle}>
            <Float
              speed={1.8}
              rotationIntensity={0.10}
              floatIntensity={0.22}
            >
              <Bottle />
            </Float>
          </group>
        </group>
      </group>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Lighting                                                            */
/* ------------------------------------------------------------------ */
function Studio() {
  return (
    <>
      {/* studio HDR for clean material reflections */}
      <Environment preset="studio" environmentIntensity={0.4} />

      {/* low ambient — let the key light do the work */}
      <ambientLight intensity={0.15} />

      {/* KEY — pure white, upper-left front, tight beam */}
      <spotLight
        position={[-2.5, 6, 5]}
        angle={0.35}
        penumbra={0.6}
        intensity={220}
        color="#ffffff"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0003}
      />

      {/* FILL — opposite side, very soft so shadow side still readable */}
      <pointLight position={[3, 1, 3]} intensity={18} color="#f0fff4" />

      {/* RED RIM — behind-right, creates hot-sauce heat edge */}
      <spotLight
        position={[4, 2, -4]}
        angle={0.5}
        penumbra={1}
        intensity={160}
        color="#dc2626"
      />

      {/* GREEN KICKER — behind-left, brand identity edge */}
      <spotLight
        position={[-4, 1.5, -3]}
        angle={0.5}
        penumbra={1}
        intensity={100}
        color="#22c55e"
      />

      <ContactShadows
        position={[0, -1.6, 0]}
        opacity={0.45}
        scale={10}
        blur={2.5}
        far={3.5}
        color="#000000"
      />
    </>
  );
}

/* ------------------------------------------------------------------ */
export default function Experience() {
  return (
    <div className="fixed inset-0 z-10 h-screen w-screen">
      <Canvas
        shadows
        dpr={[1, 2]}
        /* slightly higher camera + tighter FOV = compressed, dramatic product look */
        camera={{ position: [0, 0.6, 5.5], fov: 38 }}
        gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.1 }}
      >
        <Suspense fallback={null}>
          <Studio />
          <ScrollRig />
        </Suspense>
      </Canvas>
    </div>
  );
}

useGLTF.preload(MODEL_URL);
