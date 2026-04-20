// Auteur : Gilles - Projet : AGC Space - Module : Configuration Tailwind
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Design System AGC Space — Stellar Nexus
        background: '#f7f9fb',
        'inverse-surface': '#2d3133',
        'primary-fixed': '#d6e3ff',
        'surface-variant': '#e0e3e5',
        'secondary-fixed-dim': '#00daf3',
        'surface-container': '#eceef0',
        'tertiary-container': '#001c3b',
        'on-primary-fixed': '#0e1c31',
        outline: '#75777d',
        'on-background': '#191c1e',
        'surface-dim': '#d8dadc',
        'surface-container-low': '#f2f4f6',
        'secondary-fixed': '#9cf0ff',
        'on-surface-variant': '#44474d',
        'surface-tint': '#525f77',
        'surface-container-lowest': '#ffffff',
        'on-secondary-fixed': '#001f24',
        'on-surface': '#191c1e',
        primary: '#000000',
        'secondary-container': '#00e3fd',
        secondary: '#006875',
        'on-tertiary-container': '#6b85ae',
        'on-secondary': '#ffffff',
        'outline-variant': '#c5c6cd',
        'inverse-on-surface': '#eff1f3',
        'surface-container-highest': '#e0e3e5',
        'surface-bright': '#f7f9fb',
        'inverse-primary': '#bac7e3',
        tertiary: '#000000',
        'primary-fixed-dim': '#bac7e3',
        'on-primary': '#ffffff',
        'primary-container': '#0e1c31',
        'surface-container-high': '#e6e8ea',
        surface: '#f7f9fb',
        'on-secondary-container': '#00616d',
        'tertiary-fixed-dim': '#adc8f5',
        'tertiary-fixed': '#d5e3ff',
        'on-primary-container': '#77849e',
        'on-primary-fixed-variant': '#3a475e',
      },
      borderRadius: {
        DEFAULT: '0.125rem',
        lg: '0.25rem',
        xl: '0.5rem',
        full: '0.75rem',
        theme: '0.5rem',
      },
      fontFamily: {
        headline: ['Manrope', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        label: ['Inter', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
      },
      backdropBlur: {
        xl: '20px',
      },
    },
  },
  plugins: [],
}

export default config
