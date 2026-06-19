'use client';

import { ShaderGradientCanvas, ShaderGradient } from '@shadergradient/react';

/**
 * Premium animated gradient background (shadergradient.co). Pass 3 brand colors.
 * Import ONLY via ShaderGradientHero (next/dynamic ssr:false) — it's WebGL/three.
 */
export default function ShaderGradientBg({
  colors = ['#C0532B', '#E0A53B', '#4A1D0F'],
  type = 'waterPlane',
}: {
  colors?: [string, string, string];
  type?: 'plane' | 'sphere' | 'waterPlane';
}) {
  return (
    <ShaderGradientCanvas
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      pointerEvents="none"
    >
      <ShaderGradient
        control="props"
        type={type}
        color1={colors[0]}
        color2={colors[1]}
        color3={colors[2]}
        animate="on"
        uDensity={1.3}
        uStrength={2}
        uSpeed={0.2}
        cDistance={3.6}
        cAzimuthAngle={180}
        cPolarAngle={90}
        brightness={1.1}
        grain="on"
        positionX={0}
        positionY={0}
        positionZ={0}
        rotationX={0}
        rotationY={0}
        rotationZ={0}
      />
    </ShaderGradientCanvas>
  );
}
