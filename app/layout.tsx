import type { Metadata, Viewport } from 'next'
import './globals.css'
import ThemeProvider from './components/ThemeProvider'
import ThemeToggle from './components/ThemeToggle'

export const metadata: Metadata = {
  title: 'Web Timer',
  description: 'タイマー・ストップウォッチ・ポモドーロタイマー',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=DM+Sans:wght@300;400;500&display=swap"
          rel="stylesheet"
        />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body>
        <ThemeProvider>
          <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end', padding: '12px 20px 0' }}>
            <ThemeToggle />
          </div>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
