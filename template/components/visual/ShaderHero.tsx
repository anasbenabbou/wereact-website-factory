'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

/**
 * Animated WebGL gradient — a flowing brand-colored shader backdrop. Rendered
 * fullscreen via a clip-space quad (camera-independent, robust). Import this
 * ONLY through ShaderHeroClient (next/dynamic, ssr:false) so it never runs in SSR.
 */

const vertex = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

const fragment = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec3 uColorC;

  // smooth flowing field
  float blob(vec2 p, float t) {
    return sin(p.x * 3.0 + t) * 0.5 + sin(p.y * 2.5 - t * 0.8) * 0.5;
  }

  void main() {
    vec2 uv = vUv;
    float t = uTime * 0.25;
    float f = blob(uv * 2.0, t) + blob(uv * 4.0 + 1.7, -t * 1.3) * 0.5;
    f = f * 0.5 + 0.5;
    vec3 col = mix(uColorA, uColorB, smoothstep(0.2, 0.8, f));
    col = mix(col, uColorC, smoothstep(0.6, 1.0, uv.y + sin(t + uv.x * 3.0) * 0.1));
    // subtle vignette
    col *= 1.0 - 0.25 * length(uv - 0.5);
    gl_FragColor = vec4(col, 1.0);
  }
`;

function Quad({ colors }: { colors: [string, string, string] }) {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColorA: { value: new THREE.Color(colors[0]) },
      uColorB: { value: new THREE.Color(colors[1]) },
      uColorC: { value: new THREE.Color(colors[2]) },
    }),
    [colors]
  );
  useFrame((_, delta) => {
    if (mat.current) mat.current.uniforms.uTime.value += delta;
  });
  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial ref={mat} uniforms={uniforms} vertexShader={vertex} fragmentShader={fragment} />
    </mesh>
  );
}

export default function ShaderHero({
  colors = ['#1d47d8', '#5a8dff', '#0b1020'],
  className,
}: {
  colors?: [string, string, string];
  className?: string;
}) {
  return (
    <div className={`absolute inset-0 -z-10 ${className ?? ''}`} aria-hidden>
      <Canvas gl={{ antialias: true, powerPreference: 'high-performance' }} dpr={[1, 1.5]} frameloop="always">
        <Quad colors={colors} />
      </Canvas>
    </div>
  );
}
