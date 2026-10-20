import React, { useEffect, useRef } from 'react';
import { ReadingPhase } from '../types/tarot';

export interface StardustEmitterHandle {
  spawnBurst: (x: number, y: number, vx?: number, vy?: number, count?: number) => void;
  setOrbitState: (angle: number, velocity: number, phase: ReadingPhase) => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  decay: number;
  isGold: boolean;
  twinklePhase: number;
}

interface StardustCanvasProps {
  emitterRef: React.MutableRefObject<StardustEmitterHandle | null>;
}

const TILT_ANGLE = -21 * (Math.PI / 180); // Diagonal banking angle matching the concept image

export const StardustCanvas: React.FC<StardustCanvasProps> = ({ emitterRef }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const orbitStateRef = useRef<{ angle: number; velocity: number; phase: ReadingPhase }>({
    angle: 0,
    velocity: 0.004,
    phase: 'intro',
  });

  useEffect(() => {
    emitterRef.current = {
      spawnBurst: (x: number, y: number, vx = 0, vy = 0, count = 4) => {
        const isMobile = window.innerWidth < 768;
        const actualCount = isMobile ? Math.min(2, count) : count;
        const maxParticles = isMobile ? 65 : 420;

        for (let i = 0; i < actualCount; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * 0.6 + 0.1;
          particlesRef.current.push({
            x: x + (Math.random() - 0.5) * 8,
            y: y + (Math.random() - 0.5) * 8,
            vx: vx * 0.08 + Math.cos(angle) * speed,
            vy: vy * 0.08 + Math.sin(angle) * speed - 0.1,
            size: Math.random() * 1.8 + 0.5,
            alpha: Math.random() * 0.5 + 0.35,
            decay: Math.random() * 0.011 + 0.005,
            isGold: Math.random() > 0.25,
            twinklePhase: Math.random() * Math.PI * 2,
          });
        }
        if (particlesRef.current.length > maxParticles) {
          particlesRef.current.splice(0, particlesRef.current.length - maxParticles);
        }
      },
      setOrbitState: (angle: number, velocity: number, phase: ReadingPhase) => {
        orbitStateRef.current.angle = angle;
        orbitStateRef.current.velocity = velocity;
        orbitStateRef.current.phase = phase;
      },
    };
  }, [emitterRef]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      if (!canvas.parentElement) return;
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    let animId: number;
    let frame = 0;

    // Project a point on the 3D tilted ellipse to 2D canvas coordinates
    const projectOrbitPoint = (
      theta: number,
      rx: number,
      ry: number,
      cx: number,
      cy: number,
      tilt = TILT_ANGLE
    ) => {
      const lx = Math.cos(theta) * rx;
      const ly = Math.sin(theta) * ry;
      const cosT = Math.cos(tilt);
      const sinT = Math.sin(tilt);
      return {
        x: cx + (lx * cosT - ly * sinT),
        y: cy + (lx * sinT + ly * cosT),
      };
    };

    const drawTargetNode = (x: number, y: number, pulse: number, isMobile = false) => {
      ctx.save();
      if (!isMobile) {
        // Soft outer halo on desktop
        const grad = ctx.createRadialGradient(x, y, 1, x, y, 14);
        grad.addColorStop(0, 'rgba(224, 242, 254, 0.95)');
        grad.addColorStop(0.35, 'rgba(186, 230, 253, 0.45)');
        grad.addColorStop(1, 'rgba(186, 230, 253, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, 14, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Lightweight flat halo on mobile
        ctx.fillStyle = 'rgba(186, 230, 253, 0.35)';
        ctx.beginPath();
        ctx.arc(x, y, 10, 0, Math.PI * 2);
        ctx.fill();
      }

      // Crisp outer ring
      ctx.strokeStyle = `rgba(226, 232, 240, ${0.65 + pulse * 0.25})`;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(x, y, 7.5 + pulse * 1.2, 0, Math.PI * 2);
      ctx.stroke();

      // Solid bright center core
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(x, y, 3.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    const drawCometArc = (
      startTheta: number,
      arcLength: number,
      rx: number,
      ry: number,
      cx: number,
      cy: number,
      isMobile = false
    ) => {
      const steps = isMobile ? 12 : 42;
      ctx.save();
      for (let i = 0; i < steps; i++) {
        const t0 = i / steps;
        const t1 = (i + 1) / steps;
        const p0 = projectOrbitPoint(startTheta + t0 * arcLength, rx, ry, cx, cy);
        const p1 = projectOrbitPoint(startTheta + t1 * arcLength, rx, ry, cx, cy);

        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(p1.x, p1.y);
        ctx.strokeStyle = `rgba(248, 198, 108, ${Math.pow(t1, 1.7) * 0.88})`;
        ctx.lineWidth = 0.5 + Math.pow(t1, 1.9) * 3.2;
        if (!isMobile) {
          ctx.shadowBlur = 12 * t1;
          ctx.shadowColor = 'rgba(245, 166, 35, 0.9)';
        }
        ctx.stroke();
      }

      // Comet Starburst Head
      const head = projectOrbitPoint(startTheta + arcLength, rx, ry, cx, cy);
      if (!isMobile) {
        const headGrad = ctx.createRadialGradient(head.x, head.y, 0.5, head.x, head.y, 18);
        headGrad.addColorStop(0, '#ffffff');
        headGrad.addColorStop(0.25, 'rgba(255, 224, 150, 0.95)');
        headGrad.addColorStop(0.6, 'rgba(234, 155, 60, 0.35)');
        headGrad.addColorStop(1, 'rgba(234, 155, 60, 0)');
        ctx.fillStyle = headGrad;
        ctx.beginPath();
        ctx.arc(head.x, head.y, 18, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = 'rgba(255, 224, 150, 0.95)';
        ctx.beginPath();
        ctx.arc(head.x, head.y, 6, 0, Math.PI * 2);
        ctx.fill();
      }

      // 4-point lens flare spike on comet head
      ctx.strokeStyle = 'rgba(255, 245, 220, 0.85)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(head.x - 12, head.y);
      ctx.lineTo(head.x + 12, head.y);
      ctx.moveTo(head.x, head.y - 12);
      ctx.lineTo(head.x, head.y + 12);
      ctx.stroke();

      // Spawn trailing golden sparks from the comet head (throttled on mobile)
      if (frame % (isMobile ? 5 : 2) === 0) {
        particlesRef.current.push({
          x: head.x + (Math.random() - 0.5) * 8,
          y: head.y + (Math.random() - 0.5) * 8,
          vx: (Math.random() - 0.5) * 0.6,
          vy: (Math.random() - 0.5) * 0.6,
          size: Math.random() * 1.9 + 0.5,
          alpha: 0.85,
          decay: 0.022,
          isGold: true,
          twinklePhase: Math.random() * Math.PI * 2,
        });
      }
      ctx.restore();
    };

    const render = () => {
      frame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const { angle, phase } = orbitStateRef.current;
      const isMobile = canvas.width < 768;
      const cx = canvas.width * 0.47;
      const cy = canvas.height * 0.49;

      // Render Astrolabe Dotted Orbital Tracks, Nodes & Golden Comet Ribbons during Intro / Shuffling
      if (phase === 'intro' || phase === 'shuffling') {
        const rx = isMobile ? 165 : 340;
        const ry = isMobile ? 88 : 172;
        const outerRx = rx * 1.18;
        const outerRy = ry * 1.18;

        // 1. Primary Dotted Orbital Track with Gaps
        ctx.save();
        const dotCount = isMobile ? 65 : 140;
        for (let i = 0; i < dotCount; i++) {
          // Leave artistic breaks around the track like the concept image
          if ((i > 18 && i < 26) || (i > 68 && i < 76) || (i > 112 && i < 120)) continue;
          const theta = (i / dotCount) * Math.PI * 2 + angle * 0.35;
          const pt = projectOrbitPoint(theta, rx, ry, cx, cy);
          const isLongDash = i % 5 === 0;
          ctx.fillStyle = 'rgba(206, 228, 255, 0.55)';
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, isLongDash ? 1.5 : 1.0, 0, Math.PI * 2);
          ctx.fill();
        }

        // 2. Secondary Intersecting Dotted Astrolabe Arc (Bottom-Right & Far-Left)
        const secDotCount = isMobile ? 32 : 65;
        for (let i = 0; i < secDotCount; i++) {
          const theta = -0.55 + (i / secDotCount) * 1.65;
          const pt = projectOrbitPoint(
            theta,
            outerRx,
            outerRy * 1.25,
            cx + 25,
            cy + 30,
            TILT_ANGLE + 0.32
          );
          ctx.fillStyle = 'rgba(190, 220, 255, 0.45)';
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 1.1, 0, Math.PI * 2);
          ctx.fill();
        }

        // 3. Directional Arrowheads along the Dotted Track
        const arrowAngles = [-1.85, -1.25, -0.35, 0.25];
        arrowAngles.forEach((a) => {
          const theta = a + angle * 0.35;
          const pTip = projectOrbitPoint(theta, rx, ry, cx, cy);
          const pPrev = projectOrbitPoint(theta - 0.04, rx, ry, cx, cy);
          const dir = Math.atan2(pTip.y - pPrev.y, pTip.x - pPrev.x);

          ctx.save();
          ctx.translate(pTip.x, pTip.y);
          ctx.rotate(dir);
          ctx.strokeStyle = 'rgba(210, 232, 255, 0.75)';
          ctx.lineWidth = 1.3;
          ctx.beginPath();
          ctx.moveTo(-6, -3.5);
          ctx.lineTo(0, 0);
          ctx.lineTo(-6, 3.5);
          ctx.stroke();
          ctx.restore();
        });
        ctx.restore();

        // 4. Sweeping Golden Comet Light Ribbons (Left Upper Swoop & Right Lower Swoop)
        drawCometArc(2.35 + angle * 0.5, -0.82, outerRx * 0.96, outerRy * 0.92, cx, cy, isMobile);
        drawCometArc(-0.62 + angle * 0.5, 1.55, outerRx * 1.03, outerRy * 1.06, cx, cy, isMobile);

        // 5. Glowing Circular Target Nodes (⦿) matching the 5 nodes in the reference image
        const pulse = 0.5 + 0.5 * Math.sin(frame * 0.06);
        const nodePositions = [
          projectOrbitPoint(2.88 + angle * 0.2, outerRx * 1.04, outerRy * 0.95, cx, cy), // Far Left Node
          projectOrbitPoint(1.52 + angle * 0.2, outerRx * 1.05, outerRy * 1.08, cx, cy), // Bottom Center Node
          projectOrbitPoint(0.72 + angle * 0.2, rx * 0.76, ry * 0.72, cx, cy), // Inner Right Node
          projectOrbitPoint(0.08 + angle * 0.2, outerRx * 0.95, outerRy * 0.95, cx, cy), // Far Right Node
        ];
        nodePositions.forEach((np) => drawTargetNode(np.x, np.y, pulse, isMobile));
      }

      // Render Stardust Particles
      const list = particlesRef.current;
      const maxP = isMobile ? 60 : 350;
      if (list.length > maxP) {
        list.splice(0, list.length - maxP);
      }

      for (let i = list.length - 1; i >= 0; i--) {
        const p = list[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.97;
        p.vy *= 0.97;
        p.alpha -= p.decay;

        if (p.alpha <= 0.01) {
          list.splice(i, 1);
          continue;
        }

        const twinkle = 0.65 + 0.35 * Math.sin(frame * 0.1 + p.twinklePhase);
        const a = Math.max(0, Math.min(1, p.alpha * twinkle));

        ctx.save();
        ctx.beginPath();
        ctx.fillStyle = p.isGold ? `rgba(248, 202, 115, ${a})` : `rgba(226, 240, 255, ${a})`;
        if (!isMobile) {
          ctx.shadowBlur = p.size * 3.5;
          ctx.shadowColor = p.isGold ? 'rgba(245, 175, 65, 0.85)' : 'rgba(200, 230, 255, 0.85)';
        }
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-20" />
  );
};
