'use client';

import { useEffect, useState } from 'react';
import Particles from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import type { Engine } from '@tsparticles/engine';

export function ParticleBackground() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    loadSlim({} as Engine).catch(() => {});
    setReady(true);
  }, []);

  if (!ready) return null;

  return (
    <Particles
      id="tsparticles"
      options={{
        fullScreen: {
          enable: true,
          zIndex: 0,
        },
        background: {
          color: {
            value: '#000000',
          },
        },
        fpsLimit: 60,
        particles: {
          color: {
            value: ['#D4AF37', '#B8860B', '#FFFFFF'],
          },
          links: {
            color: '#D4AF37',
            distance: 150,
            enable: true,
            opacity: 0.1,
            width: 1,
          },
          move: {
            enable: true,
            speed: 0.5,
            direction: 'none',
            random: true,
            straight: false,
            outModes: {
              default: 'out',
            },
          },
          number: {
            density: {
              enable: true,
              width: 1920,
              height: 1080,
            },
            value: 80,
          },
          opacity: {
            value: { min: 0.1, max: 0.5 },
          },
          shape: {
            type: 'circle',
          },
          size: {
            value: { min: 1, max: 3 },
          },
        },
        detectRetina: true,
      }}
      className="absolute inset-0"
    />
  );
}
