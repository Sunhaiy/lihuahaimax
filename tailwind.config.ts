import type { Config } from 'tailwindcss'
import typography from '@tailwindcss/typography'

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './features/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary) / <alpha-value>)',
          foreground: 'hsl(var(--primary-foreground) / <alpha-value>)',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary) / <alpha-value>)',
          foreground: 'hsl(var(--secondary-foreground) / <alpha-value>)',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent) / <alpha-value>)',
          foreground: 'hsl(var(--accent-foreground) / <alpha-value>)',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        surface: {
          DEFAULT: 'hsl(var(--surface) / <alpha-value>)',
          foreground: 'hsl(var(--surface-foreground) / <alpha-value>)',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        line: {
          DEFAULT: 'hsl(var(--line) / <alpha-value>)',
          strong: 'hsl(var(--line-strong) / <alpha-value>)',
        },
        hero: {
          DEFAULT: 'hsl(var(--hero-foreground) / <alpha-value>)',
          muted: 'hsl(var(--hero-muted) / <alpha-value>)',
          subtle: 'hsl(var(--hero-subtle) / <alpha-value>)',
          panel: 'hsl(var(--hero-panel) / <alpha-value>)',
          border: 'hsl(var(--hero-panel-border) / <alpha-value>)',
        },
        weather: {
          rain: 'hsl(var(--weather-rain) / <alpha-value>)',
          flash: 'hsl(var(--weather-flash) / <alpha-value>)',
        },
        ocean: {
          DEFAULT: '#0EA5E9',
          50: '#f0f9ff',
          400: '#38bdf8',
          500: '#0EA5E9',
          600: '#0284c7',
        },
        ember: {
          DEFAULT: 'hsl(var(--ember) / <alpha-value>)',
          400: '#FFAA90',
          500: '#FF8A6B',
          600: '#FF5C33',
        },
        zinc: {
          50:  '#FAFAFA', 100: '#F4F4F5', 200: '#E4E4E7',
          300: '#D4D4D8', 400: '#A1A1AA', 500: '#71717A',
          600: '#52525B', 700: '#3F3F46', 800: '#27272A',
          900: '#18181B', 950: '#09090B',
        },
      },
      borderRadius: {
        base: '8px',
        card: '12px',
        surface: '16px',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      spacing: {
        '4.5': '18px', '13': '52px', '15': '60px', '18': '72px', '22': '88px',
      },
      animation: {
        'pulse-slow': 'pulse 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'flip': 'flip 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(16px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        flip: { '0%': { transform: 'rotateY(0deg)' }, '100%': { transform: 'rotateY(180deg)' } },
      },
      // ── Typography 插件配置 ─────────────────────────────
      typography: {
        DEFAULT: {
          css: {
            fontFamily: 'var(--font-inter), system-ui, sans-serif',
            '--tw-prose-body':          'hsl(var(--foreground))',
            '--tw-prose-headings':      'hsl(var(--foreground))',
            '--tw-prose-lead':          'hsl(var(--muted-foreground))',
            '--tw-prose-links':         '#0EA5E9',
            '--tw-prose-bold':          'hsl(var(--foreground))',
            '--tw-prose-counters':      'hsl(var(--muted-foreground))',
            '--tw-prose-bullets':       'hsl(var(--muted-foreground))',
            '--tw-prose-hr':            'hsl(var(--border))',
            '--tw-prose-quotes':        'hsl(var(--muted-foreground))',
            '--tw-prose-quote-borders': '#0EA5E9',
            '--tw-prose-captions':      'hsl(var(--muted-foreground))',
            '--tw-prose-kbd':           'hsl(var(--foreground))',
            '--tw-prose-code':          '#FF8A6B',
            '--tw-prose-pre-code':      '#abb2bf',
            '--tw-prose-pre-bg':        '#282c34',
            '--tw-prose-th-borders':    'hsl(var(--border))',
            '--tw-prose-td-borders':    'hsl(var(--border))',
            maxWidth: 'none',
            lineHeight: '1.8',
            // 链接样式
            a: {
              color: '#0EA5E9',
              textDecoration: 'underline',
              textUnderlineOffset: '3px',
              '&:hover': { color: '#38bdf8' },
            },
            // 引用块
            blockquote: {
              borderLeftColor: 'rgba(14,165,233,0.4)',
              fontStyle: 'italic',
              color: 'hsl(var(--muted-foreground))',
            },
            // 行内代码
            'code::before': { content: 'none' },
            'code::after':  { content: 'none' },
            code: {
              fontFamily: 'var(--font-mono), monospace',
              color: '#FF8A6B',
              backgroundColor: 'rgba(255,138,107,0.08)',
              border: '1px solid rgba(255,138,107,0.15)',
              borderRadius: '4px',
              padding: '0.15em 0.4em',
              fontWeight: '400',
              fontSize: '0.85em',
            },
            // pre 交给我们自定义的 .code-block 处理，这里只做基础重置
            pre: {
              fontFamily: 'var(--font-mono), monospace',
              backgroundColor: 'transparent',
              padding: '0',
              borderRadius: '0',
              border: 'none',
            },
            'pre code': {
              fontFamily: 'var(--font-mono), monospace',
              backgroundColor: 'transparent',
              border: 'none',
              padding: '0',
              color: 'inherit',
              fontSize: 'inherit',
            },
            // h2 下划线
            h2: {
              borderBottom: '1px solid hsl(var(--border))',
              paddingBottom: '0.4em',
            },
          },
        },
        // invert 变体复用相同的 CSS 变量（CSS var 本身随主题变化）
        invert: {
          css: {
            '--tw-prose-body':          'hsl(var(--foreground))',
            '--tw-prose-headings':      'hsl(var(--foreground))',
            '--tw-prose-links':         '#38bdf8',
            '--tw-prose-bold':          'hsl(var(--foreground))',
            '--tw-prose-counters':      'hsl(var(--muted-foreground))',
            '--tw-prose-bullets':       'hsl(var(--muted-foreground))',
            '--tw-prose-hr':            'hsl(var(--border))',
            '--tw-prose-quotes':        'hsl(var(--muted-foreground))',
            '--tw-prose-quote-borders': '#38bdf8',
            '--tw-prose-code':          '#FF8A6B',
            '--tw-prose-pre-code':      '#abb2bf',
            '--tw-prose-pre-bg':        '#282c34',
            '--tw-prose-th-borders':    'hsl(var(--border))',
            '--tw-prose-td-borders':    'hsl(var(--border))',
          },
        },
      },
    },
  },
  plugins: [typography],
}

export default config
