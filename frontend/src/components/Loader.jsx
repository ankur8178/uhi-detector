import { useEffect, useState } from 'react'

const messages = [
  'Fetching Landsat 8 imagery...',
  'Computing Land Surface Temperature...',
  'Calculating NDVI indices...',
  'Identifying heat zones...',
  'Analyzing land cover...',
  'Generating mitigation strategies...',
  'Finalizing satellite data...',
]

export default function Loader() {
  const [progress,  setProgress]  = useState(0)
  const [msgIndex,  setMsgIndex]  = useState(0)

  useEffect(() => {
    const progressTimer = setInterval(() => {
      setProgress(p => Math.min(p + 100 / 150, 100))
    }, 100)

    const msgTimer = setInterval(() => {
      setMsgIndex(i => (i + 1) % messages.length)
    }, 2000)

    return () => { clearInterval(progressTimer); clearInterval(msgTimer) }
  }, [])

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(3,8,16,0.97)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      zIndex: 1000
    }}>
      {/* Satellite SVG animation */}
      <div style={{ position: 'relative', width: 200, height: 200, marginBottom: 40 }}>
        {/* Globe */}
        <svg viewBox="0 0 200 200" style={{ position: 'absolute', inset: 0 }}>
          <defs>
            <radialGradient id="globeGrad" cx="40%" cy="35%">
              <stop offset="0%" stopColor="#0a4080" />
              <stop offset="100%" stopColor="#030810" />
            </radialGradient>
          </defs>
          <circle cx="100" cy="100" r="60" fill="url(#globeGrad)"
            stroke="var(--accent)" strokeWidth="1" strokeDasharray="4 4" />
          <ellipse cx="100" cy="100" rx="60" ry="20"
            fill="none" stroke="var(--accent)" strokeWidth="0.5" opacity="0.5" />
          <ellipse cx="100" cy="100" rx="20" ry="60"
            fill="none" stroke="var(--accent)" strokeWidth="0.5" opacity="0.5" />
          {/* Heat patches */}
          <circle cx="85"  cy="90"  r="8" fill="var(--heat2)" opacity="0.6" />
          <circle cx="110" cy="105" r="6" fill="var(--heat1)" opacity="0.5" />
          <circle cx="95"  cy="115" r="5" fill="var(--heat3)" opacity="0.4" />
        </svg>

        {/* Orbiting satellite */}
        <div style={{
          position: 'absolute', inset: 0,
          animation: 'spin 3s linear infinite',
        }}>
          <style>{`
            @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
          `}</style>
          <div style={{
            position: 'absolute', top: 8, left: '50%',
            transform: 'translateX(-50%)',
            fontSize: 24,
          }}>🛰️</div>
        </div>

        {/* Pulse rings */}
        {[1,2,3].map(i => (
          <div key={i} style={{
            position: 'absolute', inset: 0,
            border: '1px solid var(--accent)',
            borderRadius: '50%',
            animation: `pulse-ring ${i * 0.8}s ease-out infinite`,
            animationDelay: `${i * 0.3}s`,
            opacity: 0,
          }} />
        ))}
      </div>

      {/* Title */}
      <div style={{
        fontFamily: 'Orbitron', fontSize: 14, letterSpacing: 4,
        color: 'var(--accent)', marginBottom: 8,
      }}>
        ACQUIRING SATELLITE DATA
      </div>

      {/* Rotating message */}
      <div style={{
        fontFamily: 'Share Tech Mono', fontSize: 12,
        color: 'var(--dim)', marginBottom: 32,
        height: 20, transition: 'opacity 0.3s',
      }}>
        {messages[msgIndex]}
      </div>

      {/* Progress bar */}
      <div style={{
        width: 320, height: 4,
        background: 'var(--border)', borderRadius: 2, overflow: 'hidden',
      }}>
        <div style={{
          height: '100%', width: `${progress}%`,
          background: `linear-gradient(90deg, var(--cool1), var(--accent))`,
          borderRadius: 2, transition: 'width 0.1s linear',
          boxShadow: '0 0 10px var(--accent)',
        }} />
      </div>

      <div style={{
        fontFamily: 'Share Tech Mono', fontSize: 11,
        color: 'var(--dim)', marginTop: 8,
      }}>
        {Math.round(progress)}%
      </div>
    </div>
  )
}