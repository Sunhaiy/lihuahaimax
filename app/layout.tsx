/**
 * app/layout.tsx
 *
 * 根布局 — 全局字体、主题 Provider、Meta 默认值。
 */

import type { Metadata, Viewport } from 'next'
import { ThemeProvider } from 'next-themes'
import './globals.css'

// Google Fonts 在国内网络环境下不可用，改用本地系统字体
// CSS 变量 --font-inter 在 globals.css 中有回退定义

export const metadata: Metadata = {
  title: {
    default: '梨花海 · Lihua Hai',
    template: '%s | 梨花海',
  },
  description: '极客视角的个人数字中枢。文章、瞬间、ACG、光影相册。',
  authors: [{ name: '梨花海' }],
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    siteName: '梨花海',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#0F172A' },
    { media: '(prefers-color-scheme: light)', color: '#f8fafc' },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange={false}
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
