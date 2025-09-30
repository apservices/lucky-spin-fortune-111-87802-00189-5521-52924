import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface PhoenixThemeEffectsProps {
  intensity?: number;
  isActive?: boolean;
}

export const PhoenixThemeEffects: React.FC<PhoenixThemeEffectsProps> = ({
  intensity = 1,
  isActive = true
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!isActive || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Flame particles
    const flames: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      maxLife: number;
      size: number;
      hue: number;
    }> = [];

    const createFlame = () => {
      flames.push({
        x: Math.random() * canvas.width,
        y: canvas.height + 20,
        vx: (Math.random() - 0.5) * 2,
        vy: -Math.random() * 3 - 2,
        life: 1,
        maxLife: Math.random() * 60 + 40,
        size: Math.random() * 8 + 4,
        hue: Math.random() * 30 + 10 // Orange to red range
      });
    };

    const updateFlames = () => {
      for (let i = flames.length - 1; i >= 0; i--) {
        const flame = flames[i];
        
        flame.x += flame.vx;
        flame.y += flame.vy;
        flame.life -= 1;
        flame.vy *= 0.99; // Gravity simulation
        flame.size *= 0.98; // Shrink over time

        if (flame.life <= 0 || flame.size <= 0.1) {
          flames.splice(i, 1);
        }
      }
    };

    const renderFlames = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      flames.forEach(flame => {
        const alpha = flame.life / flame.maxLife;
        const gradient = ctx.createRadialGradient(
          flame.x, flame.y, 0,
          flame.x, flame.y, flame.size
        );
        
        gradient.addColorStop(0, `hsla(${flame.hue}, 100%, 70%, ${alpha * 0.8})`);
        gradient.addColorStop(0.4, `hsla(${flame.hue + 10}, 100%, 60%, ${alpha * 0.6})`);
        gradient.addColorStop(1, `hsla(${flame.hue + 20}, 100%, 50%, 0)`);
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(flame.x, flame.y, flame.size, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    let animationId: number;
    const animate = () => {
      // Create new flames
      if (Math.random() < 0.1 * intensity) {
        createFlame();
      }

      updateFlames();
      renderFlames();
      
      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, [isActive, intensity]);

  if (!isActive) return null;

  return (
    <>
      {/* Background flames canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-0"
        style={{ mixBlendMode: 'screen' }}
      />
      
      {/* Floating ember particles */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-gradient-to-r from-orange-400 to-red-500"
            style={{
              left: `${Math.random() * 100}%`,
              top: '100%',
            }}
            animate={{
              y: [-20, -window.innerHeight - 100],
              x: [0, (Math.random() - 0.5) * 200],
              opacity: [0, 1, 1, 0],
              scale: [0.5, 1, 0.8, 0]
            }}
            transition={{
              duration: Math.random() * 4 + 6,
              repeat: Infinity,
              delay: Math.random() * 3,
              ease: "easeOut"
            }}
          />
        ))}
      </div>

      {/* Parallax flame background */}
      <motion.div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: `
            radial-gradient(ellipse at 20% 100%, rgba(255, 69, 0, 0.3) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 100%, rgba(255, 140, 0, 0.2) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 100%, rgba(255, 215, 0, 0.1) 0%, transparent 60%)
          `
        }}
        animate={{
          background: [
            `radial-gradient(ellipse at 20% 100%, rgba(255, 69, 0, 0.3) 0%, transparent 50%),
             radial-gradient(ellipse at 80% 100%, rgba(255, 140, 0, 0.2) 0%, transparent 50%),
             radial-gradient(ellipse at 50% 100%, rgba(255, 215, 0, 0.1) 0%, transparent 60%)`,
            `radial-gradient(ellipse at 25% 100%, rgba(255, 69, 0, 0.4) 0%, transparent 55%),
             radial-gradient(ellipse at 75% 100%, rgba(255, 140, 0, 0.3) 0%, transparent 55%),
             radial-gradient(ellipse at 50% 100%, rgba(255, 215, 0, 0.15) 0%, transparent 65%)`
          ]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut"
        }}
      />
    </>
  );
};