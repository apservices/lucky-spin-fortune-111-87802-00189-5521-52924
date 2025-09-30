import React, { useEffect, useRef, useCallback } from 'react';

interface ParallaxCoin {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  size: number;
  alpha: number;
  layer: number;
}

interface ParallaxCoinsBackgroundProps {
  width?: number;
  height?: number;
  enabled?: boolean;
}

export const ParallaxCoinsBackground: React.FC<ParallaxCoinsBackgroundProps> = ({
  width = window.innerWidth,
  height = window.innerHeight,
  enabled = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const coinsRef = useRef<ParallaxCoin[]>([]);
  const animationRef = useRef<number>();
  const lastTimeRef = useRef(0);

  const createCoins = useCallback(() => {
    const coins: ParallaxCoin[] = [];
    const layers = [
      { count: 12, speed: 0.3, blur: 3, alpha: 0.08, depth: 0.2 },
      { count: 8, speed: 0.6, blur: 2, alpha: 0.12, depth: 0.5 },
      { count: 6, speed: 1.0, blur: 0, alpha: 0.15, depth: 1.0 },
    ];

    layers.forEach((layer, layerIndex) => {
      for (let i = 0; i < layer.count; i++) {
        coins.push({
          x: Math.random() * width,
          y: Math.random() * height,
          z: layer.depth * 100,
          vx: (Math.random() - 0.5) * layer.speed * 0.5,
          vy: Math.random() * layer.speed * 0.3 + layer.speed * 0.2,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.02 * layer.speed,
          size: Math.random() * 8 + 6 + (2 - layerIndex) * 3,
          alpha: layer.alpha + Math.random() * 0.05,
          layer: layerIndex,
        });
      }
    });

    coinsRef.current = coins;
  }, [width, height]);

  const updateCoins = useCallback((deltaTime: number) => {
    coinsRef.current.forEach((coin) => {
      // Update position
      coin.x += coin.vx * deltaTime;
      coin.y += coin.vy * deltaTime;
      coin.rotation += coin.rotationSpeed * deltaTime;

      // Wrap around screen
      if (coin.x < -50) coin.x = width + 50;
      if (coin.x > width + 50) coin.x = -50;
      if (coin.y > height + 50) {
        coin.y = -50;
        coin.x = Math.random() * width;
      }

      // Subtle floating motion
      coin.y += Math.sin(Date.now() * 0.001 + coin.x * 0.01) * 0.1;
    });
  }, [width, height]);

  const drawCoin = useCallback((ctx: CanvasRenderingContext2D, coin: ParallaxCoin) => {
    ctx.save();
    
    // 3D perspective
    const perspective = 800;
    const scale = perspective / (perspective + coin.z);
    const screenX = coin.x * scale;
    const screenY = coin.y * scale;
    
    ctx.translate(screenX, screenY);
    ctx.rotate(coin.rotation);
    ctx.scale(scale, scale);
    ctx.globalAlpha = coin.alpha;

    // Apply layer blur
    if (coin.layer === 0) {
      ctx.filter = 'blur(3px)';
    } else if (coin.layer === 1) {
      ctx.filter = 'blur(1.5px)';
    } else {
      ctx.filter = 'blur(0px)';
    }

    // Create gradient for 3D coin effect
    const gradient = ctx.createRadialGradient(
      -coin.size * 0.3, -coin.size * 0.3, 0,
      0, 0, coin.size
    );
    
    // Golden coin colors based on design system
    gradient.addColorStop(0, 'hsl(45, 100%, 70%)');
    gradient.addColorStop(0.3, 'hsl(45, 100%, 50%)');
    gradient.addColorStop(0.7, 'hsl(35, 100%, 45%)');
    gradient.addColorStop(1, 'hsl(30, 100%, 35%)');

    ctx.fillStyle = gradient;
    
    // Draw coin body (ellipse for 3D effect)
    ctx.beginPath();
    ctx.ellipse(0, 0, coin.size, coin.size * 0.7, 0, 0, Math.PI * 2);
    ctx.fill();

    // Inner shadow for depth
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.beginPath();
    ctx.ellipse(coin.size * 0.2, coin.size * 0.2, coin.size * 0.7, coin.size * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Highlight for metallic effect
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath();
    ctx.ellipse(-coin.size * 0.3, -coin.size * 0.3, coin.size * 0.25, coin.size * 0.15, 0, 0, Math.PI * 2);
    ctx.fill();

    // Edge highlight
    ctx.strokeStyle = 'hsl(45, 100%, 60%)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(0, 0, coin.size, coin.size * 0.7, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !enabled) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Sort coins by z-depth (back to front)
    const sortedCoins = [...coinsRef.current].sort((a, b) => a.z - b.z);
    
    // Draw each coin
    sortedCoins.forEach(coin => drawCoin(ctx, coin));
  }, [enabled, drawCoin]);

  const animate = useCallback((currentTime: number) => {
    if (!enabled) return;
    
    const deltaTime = currentTime - lastTimeRef.current;
    lastTimeRef.current = currentTime;

    if (deltaTime > 0) {
      updateCoins(Math.min(deltaTime / 16, 2)); // Cap delta time
      draw();
    }

    animationRef.current = requestAnimationFrame(animate);
  }, [enabled, updateCoins, draw]);

  useEffect(() => {
    createCoins();
  }, [createCoins]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = width * 2; // High DPI
    canvas.height = height * 2;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(2, 2);
    }

    if (enabled) {
      lastTimeRef.current = performance.now();
      animationRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [width, height, enabled, animate]);

  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
      style={{
        opacity: 0.6,
        mixBlendMode: 'soft-light',
      }}
    />
  );
};