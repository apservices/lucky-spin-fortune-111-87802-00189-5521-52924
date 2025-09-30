import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface DragonThemeEffectsProps {
  intensity?: number;
  isActive?: boolean;
}

export const DragonThemeEffects: React.FC<DragonThemeEffectsProps> = ({
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

    // Lightning bolts
    const lightnings: Array<{
      x: number;
      y: number;
      endY: number;
      branches: Array<{ x: number; y: number; endX: number; endY: number }>;
      life: number;
      maxLife: number;
      intensity: number;
    }> = [];

    const createLightning = () => {
      const x = Math.random() * canvas.width;
      const lightning = {
        x,
        y: 0,
        endY: Math.random() * canvas.height * 0.6 + canvas.height * 0.3,
        branches: [],
        life: 60,
        maxLife: 60,
        intensity: Math.random() * 0.8 + 0.2
      };

      // Create branches
      const numBranches = Math.floor(Math.random() * 3) + 1;
      for (let i = 0; i < numBranches; i++) {
        const branchY = Math.random() * lightning.endY + lightning.y;
        lightning.branches.push({
          x: lightning.x + (Math.random() - 0.5) * 100,
          y: branchY,
          endX: lightning.x + (Math.random() - 0.5) * 200,
          endY: branchY + Math.random() * 100 + 50
        });
      }

      lightnings.push(lightning);
    };

    const updateLightnings = () => {
      for (let i = lightnings.length - 1; i >= 0; i--) {
        const lightning = lightnings[i];
        lightning.life -= 1;

        if (lightning.life <= 0) {
          lightnings.splice(i, 1);
        }
      }
    };

    const renderLightnings = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      lightnings.forEach(lightning => {
        const alpha = lightning.life / lightning.maxLife;
        
        // Main bolt
        ctx.strokeStyle = `rgba(135, 206, 250, ${alpha * lightning.intensity})`;
        ctx.lineWidth = 2;
        ctx.shadowColor = 'rgba(135, 206, 250, 0.5)';
        ctx.shadowBlur = 10;
        
        ctx.beginPath();
        ctx.moveTo(lightning.x, lightning.y);
        
        // Create jagged path
        const segments = 8;
        for (let i = 1; i <= segments; i++) {
          const segmentY = lightning.y + (lightning.endY - lightning.y) * (i / segments);
          const jitter = (Math.random() - 0.5) * 30;
          ctx.lineTo(lightning.x + jitter, segmentY);
        }
        
        ctx.stroke();
        
        // Draw branches
        lightning.branches.forEach(branch => {
          ctx.strokeStyle = `rgba(135, 206, 250, ${alpha * lightning.intensity * 0.6})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(branch.x, branch.y);
          ctx.lineTo(branch.endX, branch.endY);
          ctx.stroke();
        });
        
        ctx.shadowBlur = 0;
      });
    };

    let animationId: number;
    const animate = () => {
      // Create new lightning occasionally
      if (Math.random() < 0.005 * intensity) {
        createLightning();
      }

      updateLightnings();
      renderLightnings();
      
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
      {/* Lightning canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-0"
        style={{ mixBlendMode: 'screen' }}
      />
      
      {/* Mystical temple clouds background */}
      <motion.div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: `
            radial-gradient(ellipse at 30% 20%, rgba(63, 81, 181, 0.2) 0%, transparent 50%),
            radial-gradient(ellipse at 70% 40%, rgba(103, 58, 183, 0.15) 0%, transparent 60%),
            radial-gradient(ellipse at 50% 80%, rgba(25, 118, 210, 0.1) 0%, transparent 70%)
          `
        }}
        animate={{
          background: [
            `radial-gradient(ellipse at 30% 20%, rgba(63, 81, 181, 0.2) 0%, transparent 50%),
             radial-gradient(ellipse at 70% 40%, rgba(103, 58, 183, 0.15) 0%, transparent 60%),
             radial-gradient(ellipse at 50% 80%, rgba(25, 118, 210, 0.1) 0%, transparent 70%)`,
            `radial-gradient(ellipse at 35% 25%, rgba(63, 81, 181, 0.25) 0%, transparent 55%),
             radial-gradient(ellipse at 65% 45%, rgba(103, 58, 183, 0.2) 0%, transparent 65%),
             radial-gradient(ellipse at 50% 75%, rgba(25, 118, 210, 0.15) 0%, transparent 75%)`
          ]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut"
        }}
      />

      {/* Floating mystic orbs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {Array.from({ length: 6 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-3 h-3 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: `radial-gradient(circle, rgba(135, 206, 250, 0.8) 0%, rgba(63, 81, 181, 0.4) 100%)`
            }}
            animate={{
              scale: [0.5, 1.5, 0.5],
              opacity: [0.3, 0.9, 0.3],
              x: [0, (Math.random() - 0.5) * 100, 0],
              y: [0, (Math.random() - 0.5) * 100, 0]
            }}
            transition={{
              duration: Math.random() * 4 + 6,
              repeat: Infinity,
              delay: Math.random() * 3,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* Distant temple silhouettes */}
      <div className="fixed bottom-0 left-0 right-0 pointer-events-none z-0 h-40 opacity-20">
        <motion.div
          className="w-full h-full"
          style={{
            background: `
              polygon(20% 100%, 25% 80%, 30% 85%, 35% 60%, 40% 65%, 45% 40%, 50% 45%, 55% 30%, 60% 35%, 65% 50%, 70% 55%, 75% 75%, 80% 80%, 100% 100%),
              linear-gradient(to top, rgba(25, 118, 210, 0.3) 0%, transparent 100%)
            `,
            clipPath: `polygon(0% 100%, 15% 85%, 25% 90%, 35% 70%, 45% 75%, 55% 50%, 65% 55%, 75% 70%, 85% 75%, 100% 85%, 100% 100%)`
          }}
          animate={{
            opacity: [0.1, 0.3, 0.1]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>
    </>
  );
};