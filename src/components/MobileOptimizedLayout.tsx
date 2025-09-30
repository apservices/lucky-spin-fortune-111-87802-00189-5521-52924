/**
 * Mobile-Optimized Layout Component
 * Handles safe areas, orientation, and responsive scaling
 */

import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface MobileOptimizedLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export const MobileOptimizedLayout: React.FC<MobileOptimizedLayoutProps> = ({
  children,
  className
}) => {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [safeAreaInsets, setSafeAreaInsets] = useState({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0
  });

  useEffect(() => {
    // Detect orientation
    const handleOrientationChange = () => {
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape');
    };

    // Get safe area insets from CSS environment variables
    const updateSafeAreaInsets = () => {
      const computedStyle = getComputedStyle(document.documentElement);
      
      setSafeAreaInsets({
        top: parseInt(computedStyle.getPropertyValue('--safe-area-inset-top') || '0'),
        bottom: parseInt(computedStyle.getPropertyValue('--safe-area-inset-bottom') || '0'),
        left: parseInt(computedStyle.getPropertyValue('--safe-area-inset-left') || '0'),
        right: parseInt(computedStyle.getPropertyValue('--safe-area-inset-right') || '0')
      });
    };

    // Initial setup
    handleOrientationChange();
    updateSafeAreaInsets();

    // Event listeners
    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('resize', handleOrientationChange);

    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange);
      window.removeEventListener('resize', handleOrientationChange);
    };
  }, []);

  return (
    <div 
      className={cn(
        "relative w-full min-h-screen overflow-hidden",
        orientation === 'landscape' ? "landscape-layout" : "portrait-layout",
        className
      )}
      style={{
        paddingTop: `max(${safeAreaInsets.top}px, env(safe-area-inset-top, 0px))`,
        paddingBottom: `max(${safeAreaInsets.bottom}px, env(safe-area-inset-bottom, 0px))`,
        paddingLeft: `max(${safeAreaInsets.left}px, env(safe-area-inset-left, 0px))`,
        paddingRight: `max(${safeAreaInsets.right}px, env(safe-area-inset-right, 0px))`
      }}
    >
      {children}
      
      {/* Development orientation indicator */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-2 left-2 z-50 px-2 py-1 bg-black/80 text-white text-xs rounded">
          {orientation} | {window.innerWidth}x{window.innerHeight}
        </div>
      )}
    </div>
  );
};