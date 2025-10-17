/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary colors
        primary: '#FAB617',

        // Background colors
        background: '#242424',
        'camera-bg': '#1C1C1E',
        'button-bg': '#232323',

        // Border colors
        'border-primary': '#666666',
        'border-outer': '#000000',

        // Text colors
        'text-primary': '#FFFFFF',
        'text-accent': '#FAB617',

        // Semantic colors
        error: '#FF0000',
      },
      boxShadow: {
        'camera-view': '0px 4px 4px 0px rgba(255, 255, 255, 0.15)',
        'camera-inner': 'inset 0px 2px 6px 0px rgba(0, 0, 0, 0.4)',
      },
      borderRadius: {
        'button': '16px',
        'button-outer': '19px',
        'camera': '32px',
        'camera-outer': '48px',
        'controls': '16px',
      },
      spacing: {
        'screen-padding': '12px',
        'screen-padding-y': '8px',
        'button-padding': '16px',
        'button-padding-sm': '12px',
        'button-bar-x': '32px',
        'button-bar-y': '16px',
        'button-gap': '73px',
        'filter-gap': '24px',
        'filter-border': '3px',
      },
      fontFamily: {
        mono: ['var(--font-ibm-plex-mono)', 'monospace'],
        'dm-mono': ['var(--font-dm-mono)', 'monospace'],
      },
      fontSize: {
        'heading': '24px',
        'body': '16px',
      },
      lineHeight: {
        'normal-custom': '22px',
      },
      width: {
        'button-main': '88px',
        'button-secondary': '64px',
        'button-nav': '48px',
        'filter': '140px',
        'error-message': '334px',
      },
      height: {
        'button-main': '88px',
        'button-secondary': '64px',
        'button-nav': '48px',
        'error-icon': '88px',
      },
    },
  },
  plugins: [],
}
