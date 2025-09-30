import React from 'react';
import { motion } from 'framer-motion';
import { usePremiumTheme } from './PremiumThemeProvider';
import { cn } from '@/lib/utils';

interface PremiumAppleStyleLayoutProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'fullscreen' | 'card' | 'modal';
  showBackground?: boolean;
}

export const PremiumAppleStyleLayout: React.FC<PremiumAppleStyleLayoutProps> = ({
  children,
  className = '',
  variant = 'fullscreen',
  showBackground = true
}) => {
  const { appleStyleEnabled, visualQuality } = usePremiumTheme();

  const layoutClasses = cn(
    'relative overflow-hidden',
    appleStyleEnabled && 'apple-enhanced',
    variant === 'fullscreen' && 'min-h-screen w-full',
    variant === 'card' && 'rounded-3xl border border-border/20 backdrop-blur-apple',
    variant === 'modal' && 'rounded-2xl backdrop-blur-apple border border-border/30',
    className
  );

  const backgroundVariant = variant === 'fullscreen' 
    ? 'bg-gradient-to-br from-background via-background/95 to-background/90'
    : 'glass-morphism';

  return (
    <motion.div
      className={layoutClasses}
      initial={{ opacity: 0, scale: variant === 'fullscreen' ? 1 : 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ 
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94] // Apple's standard easing
      }}
    >
      {/* Premium Background with Parallax Effect */}
      {showBackground && (
        <div className="absolute inset-0 z-0">
          {/* Base gradient background */}
          <motion.div
            className={cn(
              'absolute inset-0',
              backgroundVariant
            )}
            animate={appleStyleEnabled ? {
              background: [
                'radial-gradient(ellipse at 20% 30%, hsl(var(--primary) / 0.15) 0%, transparent 50%)',
                'radial-gradient(ellipse at 80% 70%, hsl(var(--secondary) / 0.12) 0%, transparent 50%)',
                'radial-gradient(ellipse at 40% 80%, hsl(var(--accent) / 0.1) 0%, transparent 50%)',
                'radial-gradient(ellipse at 20% 30%, hsl(var(--primary) / 0.15) 0%, transparent 50%)'
              ]
            } : undefined}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />

          {/* Floating geometric shapes for depth */}
          {appleStyleEnabled && visualQuality !== 'low' && (
            <div className="absolute inset-0 overflow-hidden">
              {Array.from({ length: visualQuality === 'ultra' ? 8 : 4 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-64 h-64 rounded-full bg-gradient-to-br from-primary/5 to-secondary/5 backdrop-blur-3xl"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    x: [0, 50, -50, 0],
                    y: [0, -30, 30, 0],
                    scale: [1, 1.1, 0.9, 1],
                    opacity: [0.3, 0.6, 0.3, 0.3]
                  }}
                  transition={{
                    duration: 15 + Math.random() * 10,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 2
                  }}
                />
              ))}
            </div>
          )}

          {/* Premium mesh gradient overlay */}
          {appleStyleEnabled && (
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-primary/[0.02] to-secondary/[0.02]" />
          )}
        </div>
      )}

      {/* Content with proper z-index */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Premium border glow effect */}
      {appleStyleEnabled && variant !== 'fullscreen' && (
        <div className="absolute inset-0 rounded-inherit bg-gradient-to-br from-primary/20 via-transparent to-secondary/20 opacity-50 pointer-events-none" />
      )}
    </motion.div>
  );
};

// Apple-style button component with premium interactions
interface AppleStyleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
  isLoading?: boolean;
}

export const AppleStyleButton: React.FC<AppleStyleButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  isLoading = false,
  className = '',
  disabled,
  onClick,
  ...props
}) => {
  const { appleStyleEnabled } = usePremiumTheme();

  const baseClasses = cn(
    'relative inline-flex items-center justify-center rounded-2xl font-semibold transition-all duration-200',
    'transform-gpu will-change-transform active:scale-[0.98]',
    appleStyleEnabled && 'backdrop-blur-apple',
    disabled && 'opacity-50 cursor-not-allowed'
  );

  const variantClasses = {
    primary: cn(
      'bg-primary text-primary-foreground shadow-lg',
      appleStyleEnabled && 'glow-gold',
      'hover:shadow-xl hover:scale-[1.02]'
    ),
    secondary: cn(
      'bg-secondary text-secondary-foreground shadow-lg',
      appleStyleEnabled && 'glow-purple',
      'hover:shadow-xl hover:scale-[1.02]'
    ),
    ghost: cn(
      'bg-card/50 text-foreground border border-border/30',
      'hover:bg-card/80 hover:border-border/50'
    ),
    destructive: cn(
      'bg-destructive text-destructive-foreground shadow-lg',
      appleStyleEnabled && 'glow-red',
      'hover:shadow-xl hover:scale-[1.02]'
    )
  };

  const sizeClasses = {
    sm: 'h-8 px-4 text-sm',
    md: 'h-12 px-6 text-base',
    lg: 'h-14 px-8 text-lg',
    xl: 'h-16 px-10 text-xl'
  };

  return (
    <motion.button
      className={cn(baseClasses, variantClasses[variant], sizeClasses[size], className)}
      whileHover={appleStyleEnabled ? { scale: 1.02 } : undefined}
      whileTap={appleStyleEnabled ? { scale: 0.98 } : undefined}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      disabled={disabled || isLoading}
      onClick={onClick}
    >
      {/* Loading spinner */}
      {isLoading && (
        <motion.div
          className="w-5 h-5 border-2 border-current border-t-transparent rounded-full mr-2"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      )}
      
      {/* Button content */}
      <span className={isLoading ? 'opacity-70' : ''}>{children}</span>
      
      {/* Premium shine effect */}
      {appleStyleEnabled && variant === 'primary' && (
        <div className="absolute inset-0 rounded-inherit bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      )}
    </motion.button>
  );
};

// Apple-style card with premium glass morphism
interface AppleStyleCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'bordered';
  interactive?: boolean;
}

export const AppleStyleCard: React.FC<AppleStyleCardProps> = ({
  children,
  className = '',
  variant = 'default',
  interactive = false
}) => {
  const { appleStyleEnabled } = usePremiumTheme();

  const baseClasses = cn(
    'relative rounded-3xl p-6',
    appleStyleEnabled && 'backdrop-blur-apple',
    interactive && 'cursor-pointer transform-gpu will-change-transform hover:scale-[1.02] transition-transform duration-200'
  );

  const variantClasses = {
    default: 'bg-card/80 border border-border/30',
    elevated: 'bg-card/90 shadow-2xl border border-border/20',
    bordered: 'bg-card/60 border-2 border-border/50'
  };

  const CardComponent = interactive ? motion.div : 'div';

  return (
    <CardComponent
      className={cn(baseClasses, variantClasses[variant], className)}
      {...(interactive && appleStyleEnabled ? {
        whileHover: { scale: 1.02, y: -2 },
        whileTap: { scale: 0.98 },
        transition: { type: "spring", stiffness: 400, damping: 17 }
      } : {})}
    >
      {children}
      
      {/* Premium border glow */}
      {appleStyleEnabled && variant === 'elevated' && (
        <div className="absolute inset-0 rounded-inherit bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 pointer-events-none" />
      )}
    </CardComponent>
  );
};