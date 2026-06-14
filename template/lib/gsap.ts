'use client';
// Central GSAP setup. Registers ScrollTrigger once on the client so any
// component can `import { gsap, ScrollTrigger } from '@/lib/gsap'`.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined' && !(gsap as any)._wereactRegistered) {
  gsap.registerPlugin(ScrollTrigger);
  (gsap as any)._wereactRegistered = true;
}

export { gsap, ScrollTrigger };
