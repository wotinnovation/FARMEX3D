"use client";

import { Suspense, useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, useTexture, ContactShadows, Float } from "@react-three/drei";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const MODEL_URL = "/models/farmex_bottle.glb";
const TEXTURE_URLS = ["/textures/texture1.jfif", "/textures/texture2.jfif"];

/* ------------------------------------------------------------------ */
/* Wipe shader — diagonal sweep from top-left to bottom-right         */
/* ------------------------------------------------------------------ */
const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform sampler2D uTexA;
  uniform sampler2D uTexB;
  uniform float uProgress;   // 0 = fully A, 1 = fully B
  varying vec2 vUv;

  void main() {
    vec4 colA = texture2D(uTexA, vUv);
    vec4 colB = texture2D(uTexB, vUv);

    // diagonal axis: top-left=0, bottom-right=1
    float diag = vUv.x * 0.5 + (1.0 - vUv.y) * 0.5;

    // soft wipe edge
    float blend = smoothstep(uProgress - 0.10, uProgress + 0.10, diag);
    vec4 color = mix(colA, colB, blend);

    // shimmering glint at the wipe front
    float dist = abs(diag - uProgress);
    float glint = 1.0 - smoothstep(0.0, 0.055, dist);
    // fade glint in/out so it doesn't flash at start or end
    glint *= smoothstep(0.0, 0.12, uProgress) * smoothstep(1.0, 0.88, uProgress);
    color.rgb += glint * 2.8;

    gl_FragColor = color;
  }
`;

/* ------------------------------------------------------------------ */
/* Bottle: replaces GLB materials with the wipe shader                */
/* ------------------------------------------------------------------ */
function Bottle({
  uniformsRef,
}: {
  uniformsRef: React.MutableRefObject<{
    uTexA: THREE.IUniform<THREE.Texture>;
    uTexB: THREE.IUniform<THREE.Texture>;
    uProgress: THREE.IUniform<number>;
  }>;
}) {
  const { scene } = useGLTF(MODEL_URL);

  const prepared = useMemo(() => {
    const clone = scene.clone(true);

    const box = new THREE.Box3().setFromObject(clone);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    clone.position.sub(center);

    const targetHeight = 2.5;
    const s = targetHeight / size.y;
    clone.scale.setScalar(s);

    clone.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        child.material = new THREE.ShaderMaterial({
          uniforms: uniformsRef.current,
          vertexShader,
          fragmentShader,
        });
      }
    });

    return clone;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene]);

  return <primitive object={prepared} />;
}

/* ------------------------------------------------------------------ */
/* ScrollRig: scroll animation + continuous idle spin + wipe trigger  */
/* ------------------------------------------------------------------ */
function ScrollRig() {
  const travel = useRef<THREE.Group>(null);
  const spin = useRef<THREE.Group>(null);
  const idle = useRef<THREE.Group>(null);
  const { viewport } = useThree();

  const textures = useTexture(TEXTURE_URLS);

  useMemo(() => {
    textures.forEach((tex) => {
      tex.flipY = false;
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.needsUpdate = true;
    });
  }, [textures]);

  // shared uniforms object — all ShaderMaterial instances reference this
  const uniformsRef = useRef({
    uTexA: { value: textures[0] },
    uTexB: { value: textures[1] },
    uProgress: { value: 0 as number },
  });

  const rotAccum = useRef(0);
  const lapRef = useRef(0);
  const isSwapping = useRef(false);
  const currentTexIdx = useRef(0);

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
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: "#scroll-wrap",
            start: "top top",
            end: "bottom bottom",
            scrub: 1,
          },
        });

        const pos = travel.current!.position;
        const rot = spin.current!.rotation;
        const scl = travel.current!.scale;

        tl
          .to(pos, { x: xSlot, duration: 1 }, 0)
          .to(rot, { y: Math.PI * 2, duration: 1 }, 0)
          .to(pos, { x: -xSlot, duration: 1 }, 1)
          .to(rot, { y: Math.PI * 4, z: -0.16, duration: 1 }, 1)
          .to(pos, { x: 0, y: 0.1, duration: 1 }, 2)
          .to(rot, { y: Math.PI * 6, z: 0, duration: 1 }, 2)
          .to(scl, { x: 1.12, y: 1.12, z: 1.12, duration: 1 }, 2);

        return () => {
          tl.scrollTrigger?.kill();
          tl.kill();
        };
      }
    );

    return () => mm.revert();
  }, [xSlot]);

  useFrame(({ clock }, delta) => {
    if (!idle.current) return;

    // continuous idle spin
    rotAccum.current += delta * 0.65;
    idle.current.rotation.y = rotAccum.current;

    // gentle breathing bob
    const t = clock.getElapsedTime();
    idle.current.position.y = Math.sin(t * 0.9) * 0.05;

    // detect new lap → fire wipe animation
    const currentLap = Math.floor(rotAccum.current / (Math.PI * 2));
    if (currentLap > lapRef.current && !isSwapping.current) {
      lapRef.current = currentLap;
      isSwapping.current = true;

      const nextIdx = 1 - currentTexIdx.current;
      const u = uniformsRef.current;

      // load the incoming texture into slot B and sweep progress 0→1
      u.uTexB.value = textures[nextIdx];
      u.uProgress.value = 0;

      gsap.to(u.uProgress, {
        value: 1,
        duration: 0.75,
        ease: "power2.inOut",
        onComplete: () => {
          // settle: A becomes the new texture, reset for next swap
          u.uTexA.value = textures[nextIdx];
          u.uProgress.value = 0;
          currentTexIdx.current = nextIdx;
          isSwapping.current = false;
        },
      });
    }
  });

  return (
    <group ref={travel}>
      <group ref={spin}>
        <group ref={idle}>
          <Float speed={1.4} rotationIntensity={0.08} floatIntensity={0.15}>
            <Bottle uniformsRef={uniformsRef} />
          </Float>
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
      <ambientLight intensity={0.35} />
      <spotLight
        position={[-4, 6, 5]}
        angle={0.5}
        penumbra={0.9}
        intensity={140}
        color="#fff1dc"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <spotLight
        position={[5, 2.5, -4]}
        angle={0.6}
        penumbra={1}
        intensity={220}
        color="#ff4d1c"
      />
      <pointLight position={[0, -2.5, 4]} intensity={18} color="#7fb2ff" />
      <pointLight position={[-5, 0.5, -2]} intensity={30} color="#f2a33c" />
      <ContactShadows
        position={[0, -1.7, 0]}
        opacity={0.55}
        scale={12}
        blur={2.6}
        far={3}
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
        camera={{ position: [0, 0.2, 6.2], fov: 40 }}
        gl={{ antialias: true, alpha: true }}
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
