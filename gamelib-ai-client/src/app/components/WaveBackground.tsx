'use client';

import { useEffect, useRef } from 'react';

export default function WaveBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 1.5) : 1;

    let lastWidth = 0;
    let lastHeight = 0;
    let lastDocHeight = 0;

    // Set canvas size to cover full page height (including scroll) with devicePixelRatio
    const resizeCanvas = () => {
      const fullHeight = Math.max(
        window.innerHeight,
        document.documentElement.scrollHeight,
        document.body.scrollHeight
      );

      const targetWidth = Math.floor(window.innerWidth);
      const targetHeight = Math.floor(fullHeight);

      // Only resize if dimensions actually changed to avoid flicker
      if (targetWidth === lastWidth && targetHeight === lastHeight) return;
      lastWidth = targetWidth;
      lastHeight = targetHeight;
      lastDocHeight = targetHeight;

      canvas.style.width = `${targetWidth}px`;
      canvas.style.height = `${targetHeight}px`;
      canvas.width = Math.floor(targetWidth * dpr);
      canvas.height = Math.floor(targetHeight * dpr);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildGradients();
    };

    // Wave parameters
    const waveCount = 6;
    const segmentsPerWave = 220;
    const baseAmplitude = 68;
    const baseWavelength = 260;
    const baseSpeed = 0.16;

    const waveColors = [
      ['rgba(96, 165, 250, 0.15)', 'rgba(147, 51, 234, 0.2)'], // blue -> purple
      ['rgba(59, 130, 246, 0.18)', 'rgba(168, 85, 247, 0.18)'],
      ['rgba(129, 140, 248, 0.18)', 'rgba(59, 130, 246, 0.18)'],
      ['rgba(139, 92, 246, 0.16)', 'rgba(56, 189, 248, 0.14)'],
    ];

    let gradients: CanvasGradient[] = [];

    const buildGradients = () => {
      gradients = waveColors.map(([from, to]) => {
        // Mirrored vertical gradient so colors reverse further down the page
        const g = ctx.createLinearGradient(0, 0, 0, canvas.height * 2);
        g.addColorStop(0, from);
        g.addColorStop(0.5, to);
        g.addColorStop(1, from);
        return g;
      });
    };

    let time = 0;
    let animationFrameId: number;
    let resizeRaf: number | null = null;
    let frameCount = 0;

    const drawWave = (waveIndex: number) => {
      const amplitude = baseAmplitude * (0.75 + waveIndex * 0.18);
      const wavelength = baseWavelength * (0.9 + waveIndex * 0.1);
      const speed = baseSpeed * (1 + waveIndex * 0.09);
      const yOffset = canvas.height * (0.15 + 0.15 * waveIndex);

      const gradient = gradients[waveIndex % gradients.length] as CanvasGradient;

      ctx.beginPath();
      for (let i = 0; i <= segmentsPerWave; i++) {
        const t = i / segmentsPerWave;
        const x = t * canvas.width;

        // Smooth layered wave motion
        const y =
          yOffset +
          Math.sin((x / wavelength) + time * speed) * amplitude * 1.0 +
          Math.sin((x / (wavelength * 0.55)) + time * speed * 1.6) * amplitude * 0.35 +
          Math.cos((x / (wavelength * 1.35)) - time * speed * 1.1) * amplitude * 0.22;

        const py = y + Math.sin(time * 0.6 + x * 0.0035) * 5;

        if (i === 0) {
          ctx.moveTo(x, py);
        } else {
          ctx.lineTo(x, py);
        }
      }

      // Fill a band under the wave to create stacked ribbons
      ctx.lineTo(canvas.width, canvas.height);
      ctx.lineTo(0, canvas.height);
      ctx.closePath();

      ctx.fillStyle = gradient;
      ctx.globalAlpha = 0.7;
      ctx.fill();

      // Brighter stroke on top for definition
      ctx.globalAlpha = 0.9;
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 3;
      ctx.shadowColor = 'rgba(99, 102, 241, 0.3)';
      ctx.shadowBlur = 14;
      ctx.stroke();

      // Soft highlight overlay
      ctx.shadowBlur = 0;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      ctx.globalAlpha = 1;
    };

    const animate = () => {
      time += 0.016;
      frameCount++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Dark overlay to keep background black while waves glow on top
      ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw layered waves back-to-front
      for (let i = waveCount - 1; i >= 0; i--) {
        ctx.globalAlpha = 0.55 + i * 0.08;
        drawWave(i);
      }

      // Occasionally verify height changes without tying to scroll events
      if (frameCount % 120 === 0) {
        resizeCanvas();
      }

      ctx.globalAlpha = 1;
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    // Initial sizing and gradient build
    resizeCanvas();

    const scheduleResize = () => {
      if (resizeRaf) return;
      resizeRaf = requestAnimationFrame(() => {
        resizeCanvas();
        resizeRaf = null;
      });
    };

    const onResize = () => scheduleResize();
    const onScroll = () => {
      // Only trigger if document height likely changed (e.g., lazy content)
      const currentHeight = Math.max(
        window.innerHeight,
        document.documentElement.scrollHeight,
        document.body.scrollHeight
      );
      if (currentHeight !== lastDocHeight) {
        scheduleResize();
      }
    };

    window.addEventListener('resize', onResize, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(animationFrameId);
      if (resizeRaf) cancelAnimationFrame(resizeRaf);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 1 }}
    />
  );
}
