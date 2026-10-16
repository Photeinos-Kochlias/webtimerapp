import type { MetadataRoute } from 'next'

export const dynamic = 'force-static'

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/webtimerapp/',
    name: 'Web Timer',
    short_name: 'Timer',
    description: 'タイマー・ストップウォッチ・ポモドーロタイマー',
    start_url: '/webtimerapp/',
    scope: '/webtimerapp/',
    display: 'standalone',
    background_color: '#0a0a0f',
    theme_color: '#0a0a0f',
    icons: [
      {
        src: '/webtimerapp/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
    ],
  }
}