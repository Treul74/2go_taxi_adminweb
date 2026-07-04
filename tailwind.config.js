/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  corePlugins: {
    // Preflight is a global reset; disabled so it doesn't alter the existing
    // (non-Tailwind) demo page in App.tsx. New screens opt into resets locally.
    preflight: false,
  },
  theme: {
    extend: {
      colors: {
        primary: '#26344F',
        accent: '#FE5035',
        surface: '#E7F1F9',
        card: '#FFFFFF',
        muted: '#7B8387',
        success: '#00D26A',
        warning: '#FFB800',
        danger: '#EF4444',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '8px',
        button: '16px',
      },
    },
  },
  plugins: [],
}
