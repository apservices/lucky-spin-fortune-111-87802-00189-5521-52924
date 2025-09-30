import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface PandaThemeEffectsProps {
  intensity?: number;
  isActive?: boolean;
}

export const PandaThemeEffects: React.FC<PandaThemeEffectsProps> = ({
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

    // Bamboo leaves
    const leaves: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      rotation: number;
      rotationSpeed: number;
      size: number;
      opacity: number;
    }> = [];

    const createLeaf = () => {
      leaves.push({
        x: Math.random() * canvas.width,
        y: -20,
        vx: (Math.random() - 0.5) * 0.5,
        vy: Math.random() * 0.5 + 0.2,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.02,
        size: Math.random() * 12 + 8,
        opacity: Math.random() * 0.4 + 0.6
      });
    };

    const updateLeaves = () => {
      for (let i = leaves.length - 1; i >= 0; i--) {
        const leaf = leaves[i];
        
        leaf.x += leaf.vx;
        leaf.y += leaf.vy;
        leaf.rotation += leaf.rotationSpeed;
        
        // Add gentle swaying motion
        leaf.vx += Math.sin(Date.now() * 0.001 + leaf.y * 0.01) * 0.005;
        
        if (leaf.y > canvas.height + 20) {
          leaves.splice(i, 1);
        }
      }
    };

    const renderLeaves = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      leaves.forEach(leaf => {
        ctx.save();
        ctx.translate(leaf.x, leaf.y);
        ctx.rotate(leaf.rotation);
        ctx.globalAlpha = leaf.opacity;
        
        // Draw bamboo leaf shape
        ctx.fillStyle = `hsl(120, 60%, ${40 + Math.random() * 20}%)`;
        ctx.beginPath();
        ctx.ellipse(0, 0, leaf.size * 0.3, leaf.size, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Add leaf vein
        ctx.strokeStyle = `hsl(120, 40%, 30%)`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, -leaf.size);
        ctx.lineTo(0, leaf.size);
        ctx.stroke();
        
        ctx.restore();
      });
    };

    let animationId: number;
    const animate = () => {
      // Create new leaves
      if (Math.random() < 0.02 * intensity) {
        createLeaf();
      }

      updateLeaves();
      renderLeaves();
      
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
      {/* Bamboo leaves canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-0"
        style={{ mixBlendMode: 'multiply' }}
      />
      
      {/* Serene bamboo forest background */}
      <motion.div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: `
            linear-gradient(180deg, 
              rgba(34, 139, 34, 0.1) 0%, 
              rgba(46, 125, 50, 0.15) 30%, 
              rgba(27, 94, 32, 0.2) 70%, 
              rgba(1, 87, 155, 0.1) 100%
            )
          `
        }}
      />

      {/* Floating zen particles */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: `hsl(${120 + Math.random() * 60}, 50%, 70%)`
            }}
            animate={{
              scale: [0.5, 1.2, 0.5],
              opacity: [0.3, 0.8, 0.3],
              y: [0, -30, 0]
            }}
            transition={{
              duration: Math.random() * 3 + 4,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* Bamboo stalks silhouettes */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-20">
        {Array.from({ length: 5 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute bg-gradient-to-t from-green-800 to-green-600"
            style={{
              left: `${i * 20 + Math.random() * 10}%`,
              width: '4px',
              height: '100%',
              transform: `rotate(${(Math.random() - 0.5) * 4}deg)`
            }}
            animate={{
              opacity: [0.1, 0.3, 0.1],
              scaleY: [0.95, 1.05, 0.95]
            }}
            transition={{
              duration: Math.random() * 2 + 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
    </>
  );
};