import { ImageResponse } from 'next/og'

export const alt = 'Couto Software House — High-Performance Web Applications'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          padding: '80px',
          backgroundColor: '#0a0a0a',
          color: '#ffffff',
        }}
      >
        <div
          style={{
            fontSize: 72,
            fontWeight: 700,
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
          }}
        >
          Couto Software House
        </div>
        <div
          style={{
            marginTop: 24,
            fontSize: 32,
            color: '#a3a3a3',
            maxWidth: 800,
            lineHeight: 1.4,
          }}
        >
          High-performance web applications built in Brazil, delivered globally.
        </div>
      </div>
    ),
    { ...size },
  )
}
