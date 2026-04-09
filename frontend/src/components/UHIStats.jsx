import { useEffect, useState } from 'react'

function StatCard({ label, value, unit, color, tooltip }) {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    const target = parseFloat(value) || 0
    const steps  = 60
    const inc    = target / steps
    let current  = 0
    const timer  = setInterval(() => {
      current += inc
      if (current >= target) { setDisplay(target); clearInterval(timer) }
      else setDisplay(parseFloat(current.toFixed(2)))
    }, 20)
    return () => clearInterval(timer)
  }, [value])

  return (
    <div className="panel" style={{ padding: 24, textAlign: 'center', position: 'relative' }}
      title={tooltip}>
      <div style={{
        fontFamily: 'Share Tech Mono', fontSize: 11,
        color: 'var(--dim)', letterSpacing: 2, marginBottom: 12,
      }}>
        {label}
      </div>
      <div style={{
        fontFamily: 'Orbitron', fontSize: 36, fontWeight: 900,
        color: color, textShadow: `0 0 20px ${color}`,
      }}>
        {display}
        <span style={{ fontSize: 16, marginLeft: 4 }}>{unit}</span>
      </div>
    </div>
  )
}

export default function UHIStats({ data }) {
  const intensity = data?.uhi_intensity ?? 0

  const color = intensity > 5 ? 'var(--heat1)'
              : intensity > 3 ? 'var(--heat2)'
              : 'var(--cool2)'

  const cards = [
    {
      label:   'UHI INTENSITY',
      value:   data?.uhi_intensity,
      unit:    '°C',
      color,
      tooltip: 'Difference between urban core LST and rural LST'
    },
    {
      label:   'PEAK LST',
      value:   data?.peak_lst,
      unit:    '°C',
      color:   'var(--heat1)',
      tooltip: 'Maximum Land Surface Temperature recorded'
    },
    {
      label:   'AVG NDVI',
      value:   data?.avg_ndvi,
      unit:    '',
      color:   'var(--cool2)',
      tooltip: 'Average Normalized Difference Vegetation Index (0=bare, 1=dense)'
    },
    {
      label:   'HOTSPOT ZONES',
      value:   data?.hotspot_count,
      unit:    '',
      color:   'var(--heat3)',
      tooltip: 'Number of high-temperature hotspot zones detected'
    },
  ]

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
      gap: 16, marginBottom: 24,
    }}>
      {cards.map(c => <StatCard key={c.label} {...c} />)}
    </div>
  )
}