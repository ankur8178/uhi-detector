import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import SearchBar from '../components/SearchBar'

const features = [
  {
    icon: '🛰️',
    title: 'Satellite Detection',
    desc: 'Real-time Landsat 8 imagery processed via Google Earth Engine to compute Land Surface Temperature.'
  },
  {
    icon: '🌡️',
    title: 'Thermal Analysis',
    desc: 'NDVI, NDBI, emissivity-corrected LST, and zone-based heat classification for 6 urban zone types.'
  },
  {
    icon: '🌿',
    title: 'Mitigation Strategies',
    desc: 'AI-prioritized cooling interventions based on UHI severity — from green roofs to urban forests.'
  }
]

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show:   { opacity: 1, y: 0 }
}

export default function Home() {
  const navigate  = useNavigate()
  const history   = JSON.parse(localStorage.getItem('uhiHistory') || '[]')

  const clearHistory = () => {
    localStorage.removeItem('uhiHistory')
    window.location.reload()
  }

  return (
    <div className="grid-bg" style={{
      minHeight: '100vh', display: 'flex',
      flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '40px 20px',
      position: 'relative', overflow: 'hidden',
    }}>

      {/* Background glow blobs */}
      <div style={{
        position: 'absolute', top: '20%', left: '10%',
        width: 400, height: 400, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,102,0,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '20%', right: '10%',
        width: 300, height: 300, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0,229,255,0.05) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Hero content */}
      <motion.div
        variants={{ show: { transition: { staggerChildren: 0.15 } } }}
        initial="hidden" animate="show"
        style={{ textAlign: 'center', maxWidth: 700, zIndex: 1 }}
      >
        {/* Badge */}
        <motion.div variants={fadeUp}>
          <span style={{
            fontFamily: 'Share Tech Mono', fontSize: 11,
            color: 'var(--accent)', letterSpacing: 3,
            border: '1px solid var(--accent)',
            padding: '4px 16px', borderRadius: 20,
            display: 'inline-block', marginBottom: 24,
          }}>
            ◉ LIVE SATELLITE ANALYSIS
          </span>
        </motion.div>

        {/* Title */}
        <motion.h1 variants={fadeUp} style={{
          fontFamily: 'Orbitron', fontWeight: 900,
          fontSize: 'clamp(28px, 5vw, 56px)',
          lineHeight: 1.2, marginBottom: 20, letterSpacing: 2,
        }}>
          Urban{' '}
          <span style={{ color: 'var(--heat2)' }} className="glow-heat">
            Heat Island
          </span>
          <br />Detector
        </motion.h1>

        {/* Subtitle */}
        <motion.p variants={fadeUp} style={{
          fontFamily: 'Rajdhani', fontSize: 18,
          color: 'var(--dim)', marginBottom: 40, lineHeight: 1.6,
        }}>
          Enter any city to detect UHI effect using live{' '}
          <span style={{ color: 'var(--accent)' }}>Landsat 8</span> satellite data
        </motion.p>

        {/* Search bar */}
        <motion.div variants={fadeUp}
          style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
          <SearchBar large />
        </motion.div>

        {/* Search history chips */}
        {history.length > 0 && (
          <motion.div variants={fadeUp}
            style={{ display: 'flex', gap: 8, justifyContent: 'center',
              flexWrap: 'wrap', marginBottom: 16 }}>
            <span style={{ fontFamily: 'Share Tech Mono', fontSize: 11,
              color: 'var(--dim)', alignSelf: 'center' }}>Recent:</span>
            {history.map(city => (
              <button key={city}
                onClick={() => navigate(`/results?city=${encodeURIComponent(city)}`)}
                style={{
                  background: 'transparent', border: '1px solid var(--border)',
                  color: 'var(--text)', fontFamily: 'Share Tech Mono',
                  fontSize: 11, padding: '4px 12px', borderRadius: 20,
                  cursor: 'pointer', transition: 'all 0.2s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'var(--accent)'
                  e.currentTarget.style.color = 'var(--accent)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border)'
                  e.currentTarget.style.color = 'var(--text)'
                }}
              >
                {city}
              </button>
            ))}
            <button onClick={clearHistory}
              style={{
                background: 'transparent', border: 'none',
                color: 'var(--dim)', fontSize: 11, cursor: 'pointer',
                fontFamily: 'Share Tech Mono',
              }}>✕ clear</button>
          </motion.div>
        )}
      </motion.div>

      {/* Feature cards */}
      <motion.div
        variants={{ show: { transition: { staggerChildren: 0.15, delayChildren: 0.4 } } }}
        initial="hidden" animate="show"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 20, maxWidth: 800, width: '100%', marginTop: 60, zIndex: 1,
        }}
      >
        {features.map(f => (
          <motion.div key={f.title} variants={fadeUp}
            className="panel"
            style={{ padding: 24, textAlign: 'center' }}
          >
            <div style={{ fontSize: 36, marginBottom: 12 }}>{f.icon}</div>
            <div style={{
              fontFamily: 'Orbitron', fontSize: 13, fontWeight: 700,
              color: 'var(--accent)', marginBottom: 10, letterSpacing: 1,
            }}>
              {f.title}
            </div>
            <div style={{
              fontFamily: 'Rajdhani', fontSize: 14,
              color: 'var(--dim)', lineHeight: 1.6,
            }}>
              {f.desc}
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* City skyline SVG */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        pointerEvents: 'none', opacity: 0.15,
      }}>
        <svg viewBox="0 0 1440 200" xmlns="http://www.w3.org/2000/svg"
          style={{ width: '100%', display: 'block' }}>
          <rect x="0"    y="120" width="60"  height="80"  fill="var(--accent)" />
          <rect x="70"   y="80"  width="40"  height="120" fill="var(--accent)" />
          <rect x="120"  y="100" width="80"  height="100" fill="var(--accent)" />
          <rect x="210"  y="60"  width="50"  height="140" fill="var(--accent)" />
          <rect x="270"  y="90"  width="70"  height="110" fill="var(--accent)" />
          <rect x="350"  y="40"  width="40"  height="160" fill="var(--heat2)"  />
          <rect x="400"  y="70"  width="60"  height="130" fill="var(--accent)" />
          <rect x="470"  y="110" width="90"  height="90"  fill="var(--accent)" />
          <rect x="570"  y="50"  width="45"  height="150" fill="var(--heat2)"  />
          <rect x="625"  y="80"  width="80"  height="120" fill="var(--accent)" />
          <rect x="715"  y="30"  width="55"  height="170" fill="var(--heat1)"  />
          <rect x="780"  y="70"  width="70"  height="130" fill="var(--accent)" />
          <rect x="860"  y="100" width="50"  height="100" fill="var(--accent)" />
          <rect x="920"  y="55"  width="40"  height="145" fill="var(--heat2)"  />
          <rect x="970"  y="85"  width="90"  height="115" fill="var(--accent)" />
          <rect x="1070" y="45"  width="50"  height="155" fill="var(--accent)" />
          <rect x="1130" y="75"  width="65"  height="125" fill="var(--heat2)"  />
          <rect x="1205" y="95"  width="80"  height="105" fill="var(--accent)" />
          <rect x="1295" y="60"  width="45"  height="140" fill="var(--accent)" />
          <rect x="1350" y="90"  width="90"  height="110" fill="var(--accent)" />
        </svg>
      </div>
    </div>
  )
}