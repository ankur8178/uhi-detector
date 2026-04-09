import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell
} from 'recharts'

const getBarColor = (lst) => {
  if (lst > 45) return 'var(--heat1)'
  if (lst > 42) return 'var(--heat2)'
  if (lst > 38) return 'var(--heat3)'
  if (lst > 34) return '#aadd00'
  return 'var(--cool1)'
}

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div style={{
      background: 'var(--panel)', border: '1px solid var(--border)',
      padding: '12px 16px', borderRadius: 4,
      fontFamily: 'Share Tech Mono', fontSize: 12,
    }}>
      <div style={{ color: 'var(--accent)', marginBottom: 6 }}>{d.zone}</div>
      <div>LST: <span style={{ color: getBarColor(d.lst) }}>{d.lst}°C</span></div>
      <div>NDVI: <span style={{ color: 'var(--cool2)' }}>{d.ndvi}</span></div>
    </div>
  )
}

export default function ZoneChart({ zoneStats }) {
  const data = Object.entries(zoneStats || {}).map(([zone, v]) => ({
    zone, lst: v.lst, ndvi: v.ndvi
  }))

  return (
    <div className="panel" style={{ padding: 24, marginBottom: 24 }}>
      <div style={{
        fontFamily: 'Orbitron', fontSize: 13, color: 'var(--accent)',
        letterSpacing: 2, marginBottom: 20,
      }}>
        🌡️ ZONE TEMPERATURE ANALYSIS
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="zone" tick={{ fill: 'var(--dim)', fontSize: 11,
            fontFamily: 'Share Tech Mono' }} />
          <YAxis tick={{ fill: 'var(--dim)', fontSize: 11,
            fontFamily: 'Share Tech Mono' }}
            label={{ value: '°C', fill: 'var(--dim)', position: 'insideLeft' }} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="lst" radius={[2, 2, 0, 0]}>
            {data.map((d, i) => (
              <Cell key={i} fill={getBarColor(d.lst)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}