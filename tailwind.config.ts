
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
					foreground: 'hsl(var(--primary-foreground))'
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
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				cvsite: {
					navy: '#1a365d',
					teal: '#2c7a7b',
					'light-blue': '#90cdf4',
					'light-teal': '#81e6d9',
					gray: '#718096',
					'light-gray': '#EDF2F7',
					'dark-gray': '#2D3748'
				},
				// Gamification colors
				game: {
					'xp-start': 'hsl(var(--game-xp-start))',
					'xp-end': 'hsl(var(--game-xp-end))',
					'achievement-bronze': 'hsl(var(--game-achievement-bronze))',
					'achievement-silver': 'hsl(var(--game-achievement-silver))',
					'achievement-gold': 'hsl(var(--game-achievement-gold))',
					'achievement-platinum': 'hsl(var(--game-achievement-platinum))',
					'level': 'hsl(var(--game-level-bg))',
					'level-text': 'hsl(var(--game-level-text))',
					'progress-bg': 'hsl(var(--game-progress-bg))',
					'progress-fill': 'hsl(var(--game-progress-fill))',
					'milestone': 'hsl(var(--game-milestone))',
					'reward': 'hsl(var(--game-reward))',
					'interactive-hover': 'hsl(var(--game-interactive-hover))',
					'celebration': 'hsl(var(--game-celebration))',
					'completion': 'hsl(var(--game-completion))'
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
				// Gamification animations
				'xp-fill': {
					'0%': { width: '0%' },
					'100%': { width: 'var(--xp-width)' }
				},
				'achievement-bounce': {
					'0%, 20%, 50%, 80%, 100%': { transform: 'translateY(0)' },
					'40%': { transform: 'translateY(-10px)' },
					'60%': { transform: 'translateY(-5px)' }
				},
				'level-up': {
					'0%': { transform: 'scale(1)', opacity: '1' },
					'50%': { transform: 'scale(1.2)', opacity: '0.8' },
					'100%': { transform: 'scale(1)', opacity: '1' }
				},
				'milestone-glow': {
					'0%, 100%': { boxShadow: '0 0 5px hsl(var(--game-milestone))' },
					'50%': { boxShadow: '0 0 20px hsl(var(--game-milestone)), 0 0 30px hsl(var(--game-milestone))' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				// Gamification animations
				'xp-fill': 'xp-fill 1s ease-out',
				'achievement-bounce': 'achievement-bounce 1s ease-in-out',
				'level-up': 'level-up 0.6s ease-in-out',
				'milestone-glow': 'milestone-glow 2s ease-in-out infinite'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
