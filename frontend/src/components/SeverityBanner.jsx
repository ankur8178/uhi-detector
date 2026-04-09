import { motion } from 'framer-motion'

export default function SeverityBanner({ intensity }) {
  let bg, icon, label, textColor

  if (intensity > 5) {
    bg = 'linear-gradient(90deg, #3a0000, #1a0000)'
    icon = '⚠️'
    label = 'CRITICAL UHI DETECTED'
    textColor = 'var(--heat1)'
  } else if (intensity >= 3) {
    bg = 'linear-gradient(90deg, #2a1500, #1a0e00)'
    icon = '⚡'
    label = 'MODERATE UHI DETECTED'
    textColor = 'var(--heat2)'
  } else {
    bg = 'linear-gradient(90deg, #001a0e, #000f08)'
    icon = '✅'
    label = 'LOW UHI INTENSITY'
    textColor = 'var(--cool2)'
  }

  return (
    <motion.div
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0,   opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      style={{
        background: bg,
        border: `1px solid ${textColor}`,
        borderRadius: 4,
        padding: '16px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 24,
        boxShadow: `0 0 30px ${textColor}22`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <span style={{ fontSize: 28 }}>{icon}</span>
        <div>
          <div style={{
            fontFamily: 'Orbitron', fontSize: 18, fontWeight: 700,
            color: textColor, letterSpacing: 3,
          }}>
            {label}
          </div>
          <div style={{
            fontFamily: 'Share Tech Mono', fontSize: 12,
            color: 'var(--dim)', marginTop: 4,
          }}>
            Urban Heat Island Intensity detected via Landsat 8 satellite analysis
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'right' }}>
        <div style={{
          fontFamily: 'Orbitron', fontSize: 36, fontWeight: 900,
          color: textColor,
          textShadow: `0 0 20px ${textColor}`,
        }}>
          {intensity > 0 ? '+' : ''}{intensity}°C
        </div>
        <div style={{
          fontFamily: 'Share Tech Mono', fontSize: 11,
          color: 'var(--dim)',
        }}>
          UHI INTENSITY
        </div>
      </div>
    </motion.div>
  )
}