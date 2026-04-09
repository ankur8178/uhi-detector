import { useState, useRef } from 'react'

export default function BeforeAfterSlider({ cityName, uhiIntensity }) {
  const [sliderPos, setSliderPos] = useState(50)
  const containerRef = useRef(null)
  const dragging = useRef(false)

  const handleMouseDown = () => { dragging.current = true }
  const handleMouseUp   = () => { dragging.current = false }

  const handleMouseMove = (e) => {
    if (!dragging.current || !containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const pct  = ((e.clientX - rect.left) / rect.width) * 100
    setSliderPos(Math.min(Math.max(pct, 5), 95))
  }

  const handleTouchMove = (e) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const pct  = ((e.touches[0].clientX - rect.left) / rect.width) * 100
    setSliderPos(Math.min(Math.max(pct, 5), 95))
  }

  return (
    <div className="panel" style={{ padding: 24, marginBottom: 24 }}>
      <div style={{
        fontFamily: 'Orbitron', fontSize: 13, color: 'var(--accent)',
        letterSpacing: 2, marginBottom: 8,
      }}>
        ⏱️ BEFORE / AFTER COMPARISON
      </div>
      <div style={{
        fontFamily: 'Share Tech Mono', fontSize: 11,
        color: 'var(--dim)', marginBottom: 16,
      }}>
        Drag the slider to compare 2015 vs 2024 thermal signature
      </div>

      {/* Slider container */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchMove={handleTouchMove}
        style={{
          position: 'relative', height: 300,
          borderRadius: 4, overflow: 'hidden',
          cursor: 'ew-resize', userSelect: 'none',
        }}
      >
        {/* 2015 side — cooler */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(135deg, #001830, #003060, #0060a0, #00aaff)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            fontFamily: 'Orbitron', fontSize: 40, fontWeight: 900,
            color: 'rgba(0,170,255,0.3)', letterSpacing: 4,
          }}>2015</div>
          {/* Simulated heat blobs */}
          <div style={{
            position: 'absolute', top: '30%', left: '30%',
            width: 80, height: 80, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,170,0,0.4), transparent)',
          }} />
        </div>

        {/* 2024 side — hotter, clipped */}
        <div style={{
          position: 'absolute', inset: 0,
          clipPath: `inset(0 ${100 - sliderPos}% 0 0)`,
          background: 'linear-gradient(135deg, #300000, #600000, #a02000, #ff4400)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            fontFamily: 'Orbitron', fontSize: 40, fontWeight: 900,
            color: 'rgba(255,68,0,0.3)', letterSpacing: 4,
          }}>2024</div>
          <div style={{
            position: 'absolute', top: '20%', left: '40%',
            width: 120, height: 120, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,34,0,0.6), transparent)',
          }} />
          <div style={{
            position: 'absolute', bottom: '25%', left: '25%',
            width: 90, height: 90, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,102,0,0.5), transparent)',
          }} />
        </div>

        {/* Divider line */}
        <div
          onMouseDown={handleMouseDown}
          onTouchStart={() => { dragging.current = true }}
          style={{
            position: 'absolute', top: 0, bottom: 0,
            left: `${sliderPos}%`, width: 3,
            background: 'white', cursor: 'ew-resize',
            transform: 'translateX(-50%)',
            boxShadow: '0 0 10px rgba(255,255,255,0.8)',
          }}
        >
          {/* Handle */}
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 32, height: 32, borderRadius: '50%',
            background: 'white', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 15px rgba(255,255,255,0.9)',
            fontSize: 14, cursor: 'ew-resize',
          }}>
            ↔
          </div>
        </div>

        {/* Labels */}
        <div style={{
          position: 'absolute', top: 12, left: 16,
          fontFamily: 'Orbitron', fontSize: 12,
          color: 'var(--cool1)', letterSpacing: 2,
        }}>◀ 2015</div>
        <div style={{
          position: 'absolute', top: 12, right: 16,
          fontFamily: 'Orbitron', fontSize: 12,
          color: 'var(--heat1)', letterSpacing: 2,
        }}>2024 ▶</div>
      </div>

      {/* Temp callout */}
      <div style={{
        marginTop: 16, textAlign: 'center',
        fontFamily: 'Share Tech Mono', fontSize: 13,
        color: 'var(--heat2)',
      }}>
        ⚠️ Estimated +{uhiIntensity}°C increase in urban core over 9 years
      </div>
    </div>
  )
}