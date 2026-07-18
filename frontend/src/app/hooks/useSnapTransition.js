import { useRef, useCallback } from 'react';
import gsap from 'gsap';
import html2canvas from 'html2canvas';

// ─── Tuneable constants ─────────────────────────────────────────────────────
const BASE_STEP = 8;
const MAX_PARTICLES = 12000;
const PARTICLE_SIZE = 4;
const CAPTURE_SCALE = 0.5;

/**
 * Generates ash/gold themed fallback particles when html2canvas fails or crashes.
 */
function generateFallbackParticles() {
  const particles = [];
  const W = window.innerWidth;
  const H = window.innerHeight;
  // Use slightly larger steps to keep fallback generation extremely fast
  const step = 20;

  for (let y = 0; y < H; y += step) {
    for (let x = 0; x < W; x += step) {
      // Mix of dark charcoal dust and bright golden embers
      const isGold = Math.random() > 0.85;
      const r = isGold ? 220 : 40;
      const g = isGold ? 180 : 40;
      const b = isGold ? 50 : 40;
      
      const angle = (Math.random() - 0.2) * Math.PI * 0.35;
      const speed = 150 + Math.random() * 300;
      const driftX = Math.cos(angle) * speed;
      const driftY = Math.sin(angle) * speed;

      particles.push({
        x,
        y,
        r,
        g,
        b,
        a: 0.8,
        driftX,
        driftY,
        delay: Math.random() * 0.4,
      });
    }
  }
  return particles;
}

/**
 * Captures the current container element into a canvas using html2canvas,
 * then samples pixels to build a particle array. Handles modern oklab/oklch parsing crashes.
 *
 * @param {HTMLElement} containerEl - The container to capture.
 * @param {HTMLCanvasElement} canvasEl - The overlay canvas element.
 * @returns {Promise<Array<object>>} Array of particle objects.
 */
async function captureViewport(containerEl, canvasEl) {
  // Size the overlay canvas to match the full viewport
  canvasEl.width = window.innerWidth;
  canvasEl.height = window.innerHeight;

  let snapshot;
  try {
    snapshot = await html2canvas(containerEl, {
      scale: CAPTURE_SCALE,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: null,
      width: window.innerWidth,
      height: window.innerHeight,
      scrollX: 0,
      scrollY: 0,
      onclone: (clonedDoc) => {
        // 1. Force container wrapper to be visible in clone
        const clonedContainer = clonedDoc.getElementById('page-transition-container');
        if (clonedContainer) {
          clonedContainer.style.opacity = '1';
          clonedContainer.style.visibility = 'visible';
          clonedContainer.style.display = 'block';
        }

        // 2. Patch style elements to replace "oklab" and "oklch" colors that crash html2canvas
        const styles = clonedDoc.querySelectorAll('style');
        styles.forEach((styleTag) => {
          try {
            let css = styleTag.innerHTML;
            if (css.includes('oklab') || css.includes('oklch')) {
              css = css.replace(/oklab\([^)]+\)/g, 'rgb(120, 120, 120)');
              css = css.replace(/oklch\([^)]+\)/g, 'rgb(120, 120, 120)');
              styleTag.innerHTML = css;
            }
          } catch (e) {
            // Ignore style manipulation errors
          }
        });
      }
    });
  } catch (err) {
    console.error("html2canvas failed (falling back to ash particles):", err);
    return generateFallbackParticles();
  }

  const snapshotCtx = snapshot.getContext('2d');
  const sw = snapshot.width;
  const sh = snapshot.height;

  const particles = [];
  const step = BASE_STEP;

  let imgData;
  try {
    imgData = snapshotCtx.getImageData(0, 0, sw, sh);
  } catch (err) {
    console.error("getImageData failed (falling back to ash particles):", err);
    return generateFallbackParticles();
  }

  const data = imgData.data;

  for (let y = 0; y < sh; y += step) {
    for (let x = 0; x < sw; x += step) {
      const idx = (y * sw + x) * 4;
      const alpha = data[idx + 3];

      if (alpha < 15) continue;

      const screenX = (x / sw) * window.innerWidth;
      const screenY = (y / sh) * window.innerHeight;

      const angle = (Math.random() - 0.2) * Math.PI * 0.35;
      const speed = 150 + Math.random() * 300;
      const driftX = Math.cos(angle) * speed;
      const driftY = Math.sin(angle) * speed;

      particles.push({
        x: screenX,
        y: screenY,
        r: data[idx],
        g: data[idx + 1],
        b: data[idx + 2],
        a: alpha / 255,
        driftX,
        driftY,
        delay: Math.random() * 0.4,
      });
    }
  }

  if (particles.length > MAX_PARTICLES) {
    const ratio = MAX_PARTICLES / particles.length;
    return particles.filter(() => Math.random() < ratio);
  }

  return particles;
}

/**
 * Custom hook that returns disintegrate and reassemble animators.
 */
export function useSnapTransition() {
  const timelinesRef = useRef([]);

  const killAll = useCallback(() => {
    timelinesRef.current.forEach((tl) => tl.kill());
    timelinesRef.current = [];
  }, []);

  /**
   * EXIT: Disintegrates the current page container into drifting particles.
   */
  const disintegrate = useCallback(
    async (containerEl, canvasEl, lenis, onComplete) => {
      killAll();

      if (lenis) lenis.stop();

      const particles = await captureViewport(containerEl, canvasEl);

      const ctx = canvasEl.getContext('2d');
      const W = canvasEl.width;
      const H = canvasEl.height;

      // Hide live DOM container
      containerEl.style.opacity = '0';

      // Show canvas overlay
      canvasEl.style.display = 'block';
      canvasEl.style.opacity = '1';

      const animObj = { progress: 0 };

      const drawLoop = () => {
        ctx.clearRect(0, 0, W, H);
        const progress = animObj.progress;

        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          const localProgress = Math.max(0, Math.min(1, (progress - p.delay) / (1 - p.delay)));

          if (localProgress === 0) {
            ctx.fillStyle = `rgba(${p.r},${p.g},${p.b},${p.a})`;
            ctx.fillRect(p.x, p.y, PARTICLE_SIZE, PARTICLE_SIZE);
            continue;
          }

          if (localProgress >= 1) continue;

          const ease = localProgress * localProgress * localProgress;
          const curX = p.x + p.driftX * ease;
          const curY = p.y + p.driftY * ease;
          const curAlpha = p.a * (1 - localProgress);

          ctx.fillStyle = `rgba(${p.r},${p.g},${p.b},${curAlpha})`;
          ctx.fillRect(curX, curY, PARTICLE_SIZE, PARTICLE_SIZE);
        }
      };

      gsap.ticker.add(drawLoop);

      const tl = gsap.timeline({
        onComplete: () => {
          gsap.ticker.remove(drawLoop);
          ctx.clearRect(0, 0, W, H);
          onComplete();
        }
      });

      tl.to(animObj, {
        progress: 1,
        duration: 1.4,
        ease: 'power1.inOut',
      });

      timelinesRef.current.push(tl);
    },
    [killAll]
  );

  /**
   * ENTRY: Reassembles the new page from scattered particles.
   */
  const reassemble = useCallback(
    async (containerEl, canvasEl, lenis, onComplete) => {
      killAll();

      const particles = await captureViewport(containerEl, canvasEl);

      const ctx = canvasEl.getContext('2d');
      const W = canvasEl.width;
      const H = canvasEl.height;

      // Show canvas overlay
      canvasEl.style.display = 'block';
      canvasEl.style.opacity = '1';

      particles.forEach((p) => {
        const angle = (Math.random() - 0.2) * Math.PI * 0.35;
        const speed = 150 + Math.random() * 300;
        p.startX = p.x - Math.cos(angle) * speed;
        p.startY = p.y - Math.sin(angle) * speed;
      });

      const animObj = { progress: 0 };

      const drawLoop = () => {
        ctx.clearRect(0, 0, W, H);
        const progress = animObj.progress;

        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          const localProgress = Math.max(0, Math.min(1, (progress - p.delay) / (1 - p.delay)));

          if (localProgress === 0) continue;

          const t = localProgress;
          const ease = 1 - Math.pow(1 - t, 3);

          const curX = p.startX + (p.x - p.startX) * ease;
          const curY = p.startY + (p.y - p.startY) * ease;
          const curAlpha = p.a * localProgress;

          ctx.fillStyle = `rgba(${p.r},${p.g},${p.b},${curAlpha})`;
          ctx.fillRect(curX, curY, PARTICLE_SIZE, PARTICLE_SIZE);
        }
      };

      gsap.ticker.add(drawLoop);

      const tl = gsap.timeline({
        onComplete: () => {
          // Reveal live DOM container
          containerEl.style.opacity = '1';

          // Fade canvas out smoothly
          gsap.to(canvasEl, {
            opacity: 0,
            duration: 0.25,
            onComplete: () => {
              gsap.ticker.remove(drawLoop);
              canvasEl.style.display = 'none';
              canvasEl.style.opacity = '1';
              ctx.clearRect(0, 0, W, H);
              if (lenis) lenis.start();
              onComplete?.();
            }
          });
        }
      });

      tl.to(animObj, {
        progress: 1,
        duration: 1.4,
        ease: 'power1.inOut',
      });

      timelinesRef.current.push(tl);
    },
    [killAll]
  );

  return { disintegrate, reassemble, killAll };
}
