import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts'

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'var(--panel)', border: '1px solid var(--border)',
      padding: '10px 14px', borderRadius: 4,
      fontFamily: 'Share Tech Mono', fontSize: 11,
    }}>
      <div>NDVI: <span style={{ color: 'var(--cool2)' }}>{payload[0]?.value}</span></div>
      <div>LST:  <span style={{ color: 'var(--heat2)' }}>{payload[1]?.value}°C</span></div>
    </div>
  )
}

const getDotColor = (ndvi) => {
  if (ndvi < 0.1) return '#ff2200'
  if (ndvi < 0.2) return '#ff6600'
  if (ndvi < 0.3) return '#ffaa00'
  if (ndvi < 0.5) return '#aadd00'
  return '#22cc44'
}

export default function NDVIScatter({ scatter }) {
  const data = (scatter || []).map(d => ({ ...d, color: getDotColor(d.ndvi) }))

  return (
    <div className="panel" style={{ padding: 24, marginBottom: 24 }}>
      <div style={{
        fontFamily: 'Orbitron', fontSize: 13, color: 'var(--accent)',
        letterSpacing: 2, marginBottom: 8,
      }}>
        🌿 NDVI vs LAND SURFACE TEMPERATURE
      </div>
      <div style={{
        fontFamily: 'Share Tech Mono', fontSize: 11,
        color: 'var(--cool2)', marginBottom: 16,
      }}>
        Strong negative correlation: as vegetation increases, temperature drops
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <ScatterChart margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="ndvi" name="NDVI" type="number" domain={[0, 0.8]}
            tick={{ fill: 'var(--dim)', fontSize: 11, fontFamily: 'Share Tech Mono' }}
            label={{ value: 'NDVI', fill: 'var(--dim)', position: 'insideBottom', offset: -5 }} />
          <YAxis dataKey="lst" name="LST" type="number"
            tick={{ fill: 'var(--dim)', fontSize: 11, fontFamily: 'Share Tech Mono' }}
            label={{ value: '°C', fill: 'var(--dim)', position: 'insideLeft' }} />
          <Tooltip content={<CustomTooltip />} />
          <Scatter data={data} fill="var(--heat2)"
            shape={(props) => {
              const { cx, cy, payload } = props
              return <circle cx={cx} cy={cy} r={4}
                fill={getDotColor(payload.ndvi)} opacity={0.8} />
            }}
          />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  )
}