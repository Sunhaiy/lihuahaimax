import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './features/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // ============================================================
      // 颜色系统 —— 对应 globals.css 中的 CSS 变量
      // ============================================================
      colors: {
        // 语义化颜色 token，直接读取 CSS 变量
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        // 高亮色
        ocean: {
          DEFAULT: '#0EA5E9',
          50: '#f0f9ff',
          400: '#38bdf8',
          500: '#0EA5E9',
          600: '#0284c7',
        },
        // 主题强调色 — 珊瑚橙 #FF8A6B（全模式通用）
        ember: {
          DEFAULT: '#FF8A6B',
          400: '#FFAA90',
          500: '#FF8A6B',
          600: '#FF5C33',  // hover 加深
        },
        // Zinc 冷灰色板（极致暗黑夜间主题）
        zinc: {
          50:  '#FAFAFA',
          100: '#F4F4F5',
          200: '#E4E4E7',
          300: '#D4D4D8',
          400: '#A1A1AA',
          500: '#71717A',
          600: '#52525B',
          700: '#3F3F46',
          800: '#27272A',
          900: '#18181B',
          950: '#09090B',
        },
      },
      // ============================================================
      // 圆角规范
      // ============================================================
      borderRadius: {
        base: '8px',      // 交互元素（按钮、输入框、Tag）
        card: '12px',     // 内容卡片（最大不超过 16px）
        surface: '16px',  // 大画幅面板 / Modal
      },
      // ============================================================
      // 字体
      // ============================================================
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      // ============================================================
      // 间距扩展 —— 严格 8pt Grid，微调使用 4px
      // ============================================================
      spacing: {
        '4.5': '18px',
        '13': '52px',
        '15': '60px',
        '18': '72px',
        '22': '88px',
      },
      // ============================================================
      // 动效
      // ============================================================
      animation: {
        'pulse-slow': 'pulse 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'flip': 'flip 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        flip: {
          '0%': { transform: 'rotateY(0deg)' },
          '100%': { transform: 'rotateY(180deg)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
