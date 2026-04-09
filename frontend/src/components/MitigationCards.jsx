import { motion } from 'framer-motion'

const typeColors = {
  green:          'var(--cool2)',
  infrastructure: 'var(--heat3)',
  water:          'var(--cool1)',
  planning:       'var(--accent)',
  energy:         '#ffdd00',
}

const difficultyColors = {
  Easy:     'var(--cool2)',
  Moderate: 'var(--heat3)',
  Hard:     'var(--heat1)',
}

export default function MitigationCards({ strategies }) {
  return (
    <div className="panel" style={{ padding: 24, marginBottom: 24 }}>
      <div style={{
        fontFamily: 'Orbitron', fontSize: 13, color: 'var(--accent)',
        letterSpacing: 2, marginBottom: 20,
      }}>
        🌿 MITIGATION STRATEGIES
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 16,
      }}>
        {(strategies || []).map((s, i) => (
          <motion.div
            key={s.title}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            style={{
              background: 'var(--bg)',
              border: '1px solid var(--border)',
              borderRadius: 4,
              overflow: 'hidden',
              transition: 'all 0.3s ease',
              cursor: 'default',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-4px)'
              e.currentTarget.style.borderColor = typeColors[s.type] || 'var(--accent)'
              e.currentTarget.style.boxShadow = `0 8px 30px ${typeColors[s.type] || 'var(--accent)'}33`
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.borderColor = 'var(--border)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            {/* Top accent bar */}
            <div style={{
              height: 3,
              background: typeColors[s.type] || 'var(--accent)',
            }} />

            <div style={{ padding: 20 }}>
              {/* Icon + Title */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <span style={{ fontSize: 28 }}>{s.icon}</span>
                <div style={{
                  fontFamily: 'Orbitron', fontSize: 12, fontWeight: 700,
                  color: 'var(--text)', letterSpacing: 1,
                }}>
                  {s.title}
                </div>
              </div>

              {/* Description */}
              <div style={{
                fontFamily: 'Rajdhani', fontSize: 14,
                color: 'var(--dim)', lineHeight: 1.6, marginBottom: 16,
              }}>
                {s.description}
              </div>

              {/* LST Reduction badge */}
              <div style={{
                display: 'inline-block',
                background: 'rgba(0,229,255,0.1)',
                border: '1px solid var(--accent)',
                borderRadius: 2, padding: '4px 10px',
                fontFamily: 'Share Tech Mono', fontSize: 11,
                color: 'var(--accent)', marginBottom: 12,
              }}>
                ↓ LST Reduction: {s.lst_reduction}
              </div>

              {/* Tags */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <span style={{
                  fontFamily: 'Share Tech Mono', fontSize: 10,
                  color: difficultyColors[s.difficulty] || 'var(--dim)',
                  border: `1px solid ${difficultyColors[s.difficulty] || 'var(--dim)'}`,
                  padding: '2px 8px', borderRadius: 2,
                }}>
                  {s.difficulty}
                </span>
                <span style={{
                  fontFamily: 'Share Tech Mono', fontSize: 10,
                  color: 'var(--dim)',
                  border: '1px solid var(--border)',
                  padding: '2px 8px', borderRadius: 2,
                }}>
                  {s.timeframe}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}