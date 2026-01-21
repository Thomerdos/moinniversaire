import { defineConfig, presetUno, presetAttributify } from 'unocss'

export default defineConfig({
  presets: [
    presetUno(),
    presetAttributify(),
  ],
  theme: {
    colors: {
      'purple-gradient-start': '#667eea',
      'purple-gradient-end': '#764ba2',
      'pink-gradient-start': '#f093fb',
      'pink-gradient-end': '#f5576c',
      'peach-gradient-start': '#ffecd2',
      'peach-gradient-end': '#fcb69f',
    },
  },
  shortcuts: {
    'animate-fade-in': 'animate-[fadeIn_0.6s_ease_forwards]',
    'animate-bounce-slow': 'animate-[bounce_1s_ease_infinite]',
    'animate-pulse-slow': 'animate-[pulse_2s_ease_infinite]',
  },
})
