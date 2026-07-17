"use client";

import { Suspense, useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, Float, Environment, ContactShadows } from "@react-three/drei";
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
  // Bottle 1 — travels throughout all sections
  const travel1 = useRef<THREE.Group>(null);
  const spin1   = useRef<THREE.Group>(null);
  const idle1   = useRef<THREE.Group>(null);

  // Bottle 2 — sits fixed on the right, visible only in the split-showcase section
  const b2      = useRef<THREE.Group>(null);
  const spin2   = useRef<THREE.Group>(null);

  const { viewport } = useThree();
  const xSlot = Math.min(viewport.width * 0.24, 2.4);

  useLayoutEffect(() => {
    if (!travel1.current || !spin1.current || !b2.current || !spin2.current) return;

    const mm = gsap.matchMedia();
    mm.add(
      {
        motionOk: "(prefers-reduced-motion: no-preference)",
        motionOff: "(prefers-reduced-motion: reduce)",
      },
      (ctx) => {
        const { motionOff } = ctx.conditions as { motionOff: boolean };
        if (motionOff) return;

        // Clone materials on bottle 2 so they are independent from bottle 1's shared materials
        const b2Mats: THREE.MeshStandardMaterial[] = [];
        b2.current.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            const mat = (mesh.material as THREE.MeshStandardMaterial).clone();
            mat.transparent = true;
            mat.opacity = 0;
            mesh.material = mat;   // replace shared ref with own copy
            b2Mats.push(mat);
          }
        });

        // Proxy tweened by GSAP; onUpdate pushes value to all materials
        const op2 = { v: 0 };
        // Toggle visible so bottle 2 casts zero shadow outside section 3
        const applyOp = () => {
          b2Mats.forEach((m) => { m.opacity = op2.v; });
          if (b2.current) b2.current.visible = op2.v > 0;
        };
        // Start fully hidden — no geometry, no shadow
        if (b2.current) b2.current.visible = false;

        // Bottle 2: starts at centre, invisible
        gsap.set(b2.current!.position, { x: 0, z: 0 });
        gsap.set(b2.current!.scale,    { x: 0.88, y: 0.88, z: 0.88 });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: "#scroll-wrap",
            start: "top top",
            end:   "bottom bottom",
            scrub: 2,
          },
        });

        const pos = travel1.current!.position;
        const rot = spin1.current!.rotation;
        const scl = travel1.current!.scale;

        tl
          // Beat 0 — S0→S1: drift right, full spin
          .to(pos, { x:  xSlot, duration: 1, ease: "power2.inOut" }, 0)
          .to(rot, { y: Math.PI * 2, duration: 1, ease: "power1.inOut" }, 0)

          // Beat 1 — S1→S2: cross to left, slight tilt
          .to(pos, { x: -xSlot, duration: 1, ease: "power2.inOut" }, 1)
          .to(rot, { y: Math.PI * 4, z: -0.18, duration: 1, ease: "power1.inOut" }, 1)

          // Beat 2 — S2→S3: bottle 1 holds left & straightens;
          //   bottle 2 slides from behind (left → right), fading in
          .to(pos,                  { x: -xSlot, y: 0, duration: 1, ease: "power2.out"    }, 2)
          .to(rot,                  { y: Math.PI * 6, z: 0, duration: 1, ease: "power1.inOut" }, 2)
          .to(b2.current!.position, { x: xSlot,       duration: 0.9, ease: "power2.inOut" }, 2.05)
          .to(spin2.current!.rotation, { y: Math.PI * 2, duration: 0.9, ease: "power1.inOut" }, 2.05)
          .to(op2, { v: 1,             duration: 0.5, ease: "power2.out", onUpdate: applyOp }, 2.05)

          // Beat 3 — S3→S4: bottle 2 fades out in place; bottle 1 sweeps to centre (no overlaps)
          .to(op2, { v: 0, duration: 0.45, ease: "power2.in", onUpdate: applyOp           }, 3)
          .to(pos, { x: 0, y: 0.15,    duration: 0.65, ease: "power2.out"                 }, 3.5)
          .to(rot, { y: Math.PI * 8, z: 0, duration: 0.65, ease: "power1.inOut"           }, 3.5)
          .to(scl, { x: 1.15, y: 1.15, z: 1.15, duration: 0.35, ease: "back.out(1.4)"    }, 3.75);

        return () => { tl.scrollTrigger?.kill(); tl.kill(); };
      }
    );

    return () => mm.revert();
  }, [xSlot]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (idle1.current) idle1.current.position.y = Math.sin(t * 0.85) * 0.06;
    if (b2.current) b2.current.position.y = Math.sin(t * 0.85 + 1.1) * 0.06;
  });

  return (
    <>
      {/* Bottle 1 — animated across all sections */}
      <group ref={travel1}>
        <group ref={spin1}>
          <group rotation={[0.04, -0.38, 0]}>
            <group ref={idle1}>
              <Float speed={1.8} rotationIntensity={0.10} floatIntensity={0.22}>
                <Bottle />
              </Float>
            </group>
          </group>
        </group>
      </group>

      {/* Bottle 2 — fixed right, scale-in on split section, scale-out on CTA */}
      <group ref={b2}>
        <group ref={spin2}>
          <group rotation={[0.04, 0.38, 0]}>
            <Float speed={1.8} rotationIntensity={0.10} floatIntensity={0.22}>
              <Bottle />
            </Float>
          </group>
        </group>
      </group>
    </>
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
        opacity={0.35}
        scale={12}
        blur={3}
        far={4}
        color="#000000"
      />
    </>
  );
}

/* ------------------------------------------------------------------ */
export default function Experience() {
  return (
    <div className="pointer-events-none fixed inset-0 z-30 h-screen w-screen">
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
