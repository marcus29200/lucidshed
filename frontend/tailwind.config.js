/** @type {import('tailwindcss').Config} */
export default {
	content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
	theme: {
		extend: {
			colors: {
				'neutral-regular': '#717584',
				'neutral-light': '#A7AAB4',
				'light-black': 'rgb(20, 20, 19)',
				'fade-black': 'rgb(28, 28, 26)',
				yellows: 'rgb(229, 255, 0)',
			},
			animation: {
				blink: 'blink 1s infinite',
			},
			keyframes: {
				blink: {
					'0%, 100%': { opacity: 1 },
					'50%': { opacity: 0 },
				},
				slideIn: {
					'0%': { opacity: 0 },
					'100%': { transform: 1 },
				},
			},
			screens: {
				sssm: '380px',
				ssm: '450px',
				smd: '700px',
				md: '960px',
				lg: '1024px',
				xl: '1280px',
				xxl: '1440px', // Add a custom 2xl breakpoint
			},
			borderWidth: {
				1: '1px',
			},
			fontFamily: {
				sans: ['Inter', 'Helvetica', 'Arial', 'sans'],
				serif: ['Great Vibes', 'serif'],
				radios: ['Radio Canada Big', 'sans-serif'],
				joining: ['Satisfy', 'cursive'],
				poppins: ['Poppins', 'sans-serif'],
			},
			boxShadow: {
				sm: '0 1px 4px 0 rgba(0, 0, 0, 0.08)',
				lg: '0px 5px 15px rgba(0, 0, 0, 0.35)',
				md: '5px 5px px 2px rgba(0, 0, 0, 0.35)',
			},
		},
	},
	plugins: [],
};
