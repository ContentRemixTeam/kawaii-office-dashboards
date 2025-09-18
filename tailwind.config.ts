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
				/* SEMANTIC TEXT COLORS - Use these for guaranteed readability */
				'text-primary': 'hsl(var(--text-primary))',
				'text-secondary': 'hsl(var(--text-secondary))',
				'text-tertiary': 'hsl(var(--text-tertiary))',
				'text-inverse': 'hsl(var(--text-inverse))',
				'text-brand-contrast': 'hsl(var(--text-brand-contrast))',
				'text-accent-contrast': 'hsl(var(--text-accent-contrast))',
				
				/* SEMANTIC BACKGROUND COLORS */
				'bg-primary': 'hsl(var(--bg-primary))',
				'bg-secondary': 'hsl(var(--bg-secondary))',
				'bg-tertiary': 'hsl(var(--bg-tertiary))',
				'bg-interactive': 'hsl(var(--bg-interactive))',

				/* Core shadcn colors with semantic mapping */
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
				/* TIMER THEME COLORS - Phase-specific colors that adapt to themes */
				timer: {
					'progress-bg': 'hsl(var(--timer-progress-bg))',
					'progress-track': 'hsl(var(--timer-progress-track))',
					'focus-fill': 'hsl(var(--timer-focus-fill))',
					'focus-bg': 'hsl(var(--timer-focus-bg))',
					'focus-glow': 'hsl(var(--timer-focus-glow))',
					'short-fill': 'hsl(var(--timer-short-fill))',
					'short-bg': 'hsl(var(--timer-short-bg))',
					'short-glow': 'hsl(var(--timer-short-glow))',
					'long-fill': 'hsl(var(--timer-long-fill))',
					'long-bg': 'hsl(var(--timer-long-bg))',
					'long-glow': 'hsl(var(--timer-long-glow))',
					'idle-fill': 'hsl(var(--timer-idle-fill))',
					'idle-bg': 'hsl(var(--timer-idle-bg))',
					'text-primary': 'hsl(var(--timer-text-primary))',
					'text-secondary': 'hsl(var(--timer-text-secondary))',
					'button-bg': 'hsl(var(--timer-button-bg))',
					'button-text': 'hsl(var(--timer-button-text))',
					'button-outline': 'hsl(var(--timer-button-outline))',
					'card-bg': 'hsl(var(--timer-card-bg))',
					'card-border': 'hsl(var(--timer-card-border))'
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
				'scale-in': {
					'0%': { 
						transform: 'scale(0.8)',
						opacity: '0'
					},
					'100%': { 
						transform: 'scale(1)',
						opacity: '1'
					}
				},
				'scale-out': {
					'0%': { 
						transform: 'scale(1)',
						opacity: '1'
					},
					'100%': { 
						transform: 'scale(0.8)',
						opacity: '0'
					}
				},
				'bounce-in': {
					'0%': { 
						transform: 'scale(0.3) translateY(-30px)',
						opacity: '0'
					},
					'50%': { 
						transform: 'scale(1.05) translateY(-10px)',
						opacity: '1'
					},
					'70%': { 
						transform: 'scale(0.9) translateY(0)',
						opacity: '1'
					},
					'100%': { 
						transform: 'scale(1) translateY(0)',
						opacity: '1'
					}
				},
				'spin-slow': {
					from: { transform: 'rotate(0deg)' },
					to: { transform: 'rotate(360deg)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'bounce-cute': 'bounce 2s ease-in-out infinite',
				'pulse-soft': 'pulse 3s ease-in-out infinite',
				'scale-in': 'scale-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
				'scale-out': 'scale-out 0.3s ease-in',
				'bounce-in': 'bounce-in 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
				'spin-slow': 'spin-slow 3s linear infinite'
			},
			backgroundImage: {
				'gradient-kawaii': 'var(--gradient-kawaii)',
				'gradient-kawaii-light': 'var(--gradient-kawaii-light)',
				'gradient-primary': 'var(--gradient-primary)',
				'gradient-background': 'var(--gradient-background)',
				'gradient-card': 'var(--gradient-card)',
				'gradient-mint': 'var(--gradient-mint)',
				'gradient-peach': 'var(--gradient-peach)'
			},
			fontFamily: {
				sans: ["var(--font-sans)", ...require("tailwindcss/defaultTheme").fontFamily.sans],
				'cinzel': ['Cinzel', 'serif'],
				'medieval': ['MedievalSharp', 'cursive'],
			},
			boxShadow: {
				'soft': 'var(--shadow-soft)',
				'glow': 'var(--shadow-glow)',
				'cute': 'var(--shadow-cute)'
			},
			transitionTimingFunction: {
				'bounce': 'var(--transition-bounce)',
				'smooth': 'var(--transition-smooth)'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
