import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
					glow: 'hsl(var(--primary-glow))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				fortune: {
					gold: 'hsl(var(--fortune-gold))',
					red: 'hsl(var(--fortune-red))',
					dark: 'hsl(var(--fortune-dark))',
					ember: 'hsl(var(--fortune-ember))',
					crimson: 'hsl(var(--fortune-crimson))',
					bronze: 'hsl(var(--fortune-bronze))'
				},
				pgbet: {
					gold: 'hsl(var(--pgbet-gold))',
					red: 'hsl(var(--pgbet-red))',
					dark: 'hsl(var(--pgbet-dark))',
					emerald: 'hsl(var(--pgbet-emerald))',
					purple: 'hsl(var(--pgbet-purple))',
					amber: 'hsl(var(--pgbet-amber))',
					bronze: 'hsl(var(--pgbet-bronze))',
					crimson: 'hsl(var(--pgbet-crimson))',
					jade: 'hsl(var(--pgbet-jade))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'spin-wheel': {
					'0%': { transform: 'rotate(0deg)' },
					'100%': { transform: 'rotate(1080deg)' }
				},
				'coin-flip': {
					'0%': { transform: 'rotateY(0deg) translateY(0px)' },
					'50%': { transform: 'rotateY(180deg) translateY(-20px)' },
					'100%': { transform: 'rotateY(360deg) translateY(0px)' }
				},
				'glow-pulse': {
					'0%, 100%': { boxShadow: 'var(--glow-gold)' },
					'50%': { boxShadow: '0 0 40px hsl(45 100% 50% / 0.8)' }
				},
				'bounce-coin': {
					'0%, 20%, 50%, 80%, 100%': { transform: 'translateY(0)' },
					'40%': { transform: 'translateY(-10px)' },
					'60%': { transform: 'translateY(-5px)' }
				},
				'yin-yang-spin': {
					'0%': { transform: 'rotate(0deg) scale(1)' },
					'25%': { transform: 'rotate(90deg) scale(1.05)' },
					'50%': { transform: 'rotate(180deg) scale(1)' },
					'75%': { transform: 'rotate(270deg) scale(1.05)' },
					'100%': { transform: 'rotate(360deg) scale(1)' }
				},
				'reel-spin': {
					'0%': { transform: 'translateY(0) rotateX(0deg)' },
					'25%': { transform: 'translateY(-10px) rotateX(15deg)' },
					'75%': { transform: 'translateY(10px) rotateX(-15deg)' },
					'100%': { transform: 'translateY(0) rotateX(0deg)' }
				},
				'coin-rain': {
					'0%': { transform: 'translateY(-100vh) rotate(0deg)', opacity: '1' },
					'100%': { transform: 'translateY(100vh) rotate(720deg)', opacity: '0' }
				},
				'dragon-fire': {
					'0%, 100%': { opacity: '0.8', transform: 'scale(1)' },
					'50%': { opacity: '1', transform: 'scale(1.1)' }
				},
				'pgbet-reel-spin': {
					'0%': { transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)' },
					'25%': { transform: 'perspective(1000px) rotateX(15deg) rotateY(5deg) scale(1.05)' },
					'50%': { transform: 'perspective(1000px) rotateX(0deg) rotateY(10deg) scale(1)' },
					'75%': { transform: 'perspective(1000px) rotateX(-15deg) rotateY(5deg) scale(1.05)' },
					'100%': { transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)' }
				},
				'pgbet-win-pulse': {
					'0%': { transform: 'scale(1)', boxShadow: '0 0 20px rgba(255, 215, 0, 0.5)' },
					'50%': { transform: 'scale(1.05)', boxShadow: '0 0 40px rgba(255, 215, 0, 0.8)' },
					'100%': { transform: 'scale(1)', boxShadow: '0 0 20px rgba(255, 215, 0, 0.5)' }
				},
				'pgbet-glow': {
					'0%, 100%': { boxShadow: '0 0 20px currentColor' },
					'50%': { boxShadow: '0 0 40px currentColor, 0 0 60px currentColor' }
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0px)' },
					'50%': { transform: 'translateY(-20px)' }
				},
				'pgbet-coin-float': {
					'0%': { transform: 'translateY(0px) rotate(0deg)', opacity: '0.2' },
					'50%': { transform: 'translateY(-30px) rotate(180deg)', opacity: '0.4' },
					'100%': { transform: 'translateY(0px) rotate(360deg)', opacity: '0.2' }
				},
				'pgbet-premium-spin': {
					'0%': { 
						transform: 'perspective(2000px) rotateX(0deg) rotateY(0deg) translateZ(0px) scale(1)',
						filter: 'blur(0px) brightness(1)'
					},
					'20%': { 
						transform: 'perspective(2000px) rotateX(20deg) rotateY(5deg) translateZ(20px) scale(1.05)',
						filter: 'blur(1px) brightness(1.2)'
					},
					'40%': { 
						transform: 'perspective(2000px) rotateX(-10deg) rotateY(-5deg) translateZ(10px) scale(1.1)',
						filter: 'blur(2px) brightness(1.4)'
					},
					'60%': { 
						transform: 'perspective(2000px) rotateX(15deg) rotateY(10deg) translateZ(15px) scale(1.08)',
						filter: 'blur(1.5px) brightness(1.3)'
					},
					'80%': { 
						transform: 'perspective(2000px) rotateX(-5deg) rotateY(-3deg) translateZ(5px) scale(1.02)',
						filter: 'blur(0.5px) brightness(1.1)'
					},
					'100%': { 
						transform: 'perspective(2000px) rotateX(0deg) rotateY(0deg) translateZ(0px) scale(1)',
						filter: 'blur(0px) brightness(1)'
					}
				},
				'pgbet-symbol-win': {
					'0%': { 
						transform: 'scale(1) rotate(0deg)',
						filter: 'brightness(1) drop-shadow(0 0 5px currentColor)'
					},
					'25%': { 
						transform: 'scale(1.2) rotate(5deg)',
						filter: 'brightness(1.5) drop-shadow(0 0 20px currentColor)'
					},
					'50%': { 
						transform: 'scale(1.3) rotate(-5deg)',
						filter: 'brightness(2) drop-shadow(0 0 30px currentColor)'
					},
					'75%': { 
						transform: 'scale(1.2) rotate(5deg)',
						filter: 'brightness(1.5) drop-shadow(0 0 20px currentColor)'
					},
					'100%': { 
						transform: 'scale(1) rotate(0deg)',
						filter: 'brightness(1) drop-shadow(0 0 5px currentColor)'
					}
				},
				'premium-parallax-float': {
					'0%': { 
						transform: 'translateY(0px) translateX(0px) rotateZ(0deg)',
						opacity: '0.1'
					},
					'25%': { 
						transform: 'translateY(-20px) translateX(5px) rotateZ(90deg)',
						opacity: '0.3'
					},
					'50%': { 
						transform: 'translateY(-40px) translateX(-5px) rotateZ(180deg)',
						opacity: '0.2'
					},
					'75%': { 
						transform: 'translateY(-20px) translateX(10px) rotateZ(270deg)',
						opacity: '0.4'
					},
					'100%': { 
						transform: 'translateY(0px) translateX(0px) rotateZ(360deg)',
						opacity: '0.1'
					}
				},
				'premium-jackpot-explosion': {
					'0%': { 
						transform: 'scale(0.8) rotate(0deg)',
						opacity: '0'
					},
					'20%': { 
						transform: 'scale(1.4) rotate(72deg)',
						opacity: '0.9'
					},
					'40%': { 
						transform: 'scale(1.8) rotate(144deg)',
						opacity: '1'
					},
					'60%': { 
						transform: 'scale(1.6) rotate(216deg)',
						opacity: '0.8'
					},
					'80%': { 
						transform: 'scale(1.2) rotate(288deg)',
						opacity: '0.6'
					},
					'100%': { 
						transform: 'scale(1) rotate(360deg)',
						opacity: '0.4'
					}
				},
				'apple-elastic-in': {
					'0%': { 
						transform: 'scale(0.8) translateY(30px)',
						opacity: '0'
					},
					'30%': { 
						transform: 'scale(1.15) translateY(-10px)',
						opacity: '0.7'
					},
					'50%': { 
						transform: 'scale(0.95) translateY(5px)',
						opacity: '0.9'
					},
					'70%': { 
						transform: 'scale(1.05) translateY(-2px)',
						opacity: '1'
					},
					'100%': { 
						transform: 'scale(1) translateY(0)',
						opacity: '1'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'spin-wheel': 'spin-wheel 3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
				'coin-flip': 'coin-flip 0.6s ease-in-out',
				'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
				'bounce-coin': 'bounce-coin 0.8s ease-in-out',
				'yin-yang-spin': 'yin-yang-spin 2s ease-in-out',
				'reel-spin': 'reel-spin 1s ease-in-out infinite',
				'coin-rain': 'coin-rain 3s linear infinite',
				'dragon-fire': 'dragon-fire 1.5s ease-in-out infinite',
				'pgbet-reel-spin': 'pgbet-reel-spin 0.1s ease-in-out infinite',
				'pgbet-win-pulse': 'pgbet-win-pulse 1s ease-in-out infinite',
				'pgbet-glow': 'pgbet-glow 2s ease-in-out infinite',
				'pgbet-coin-float': 'pgbet-coin-float 6s ease-in-out infinite',
				'pgbet-premium-spin': 'pgbet-premium-spin 0.15s ease-in-out infinite',
				'pgbet-symbol-win': 'pgbet-symbol-win 1s ease-in-out infinite',
				'premium-parallax-float': 'premium-parallax-float 8s ease-in-out infinite',
				'premium-jackpot-explosion': 'premium-jackpot-explosion 2s ease-out',
				'apple-elastic-in': 'apple-elastic-in 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
			},
			backgroundImage: {
				'gradient-gold': 'var(--gradient-gold)',
				'gradient-red': 'var(--gradient-red)',
				'gradient-wheel': 'var(--gradient-wheel)',
				'gradient-background': 'var(--gradient-background)',
				'gradient-reels': 'var(--gradient-reels)',
				'gradient-radial': 'radial-gradient(circle, var(--tw-gradient-stops))'
			},
			boxShadow: {
				'glow-gold': 'var(--glow-gold)',
				'glow-red': 'var(--glow-red)',
				'fortune': 'var(--shadow-fortune)'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
