import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const COLORS = {
  'Built-up':   'var(--heat2)',
  'Vegetation': '#22cc44',
  'Water':      'var(--cool1)',
  'Bare Soil':  '#aa8800',
  'Mixed':      'var(--dim)',
}

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'var(--panel)', border: '1px solid var(--border)',
      padding: '10px 14px', borderRadius: 4,
      fontFamily: 'Share Tech Mono', fontSize: 12,
    }}>
      <div style={{ color: payload[0].payload.fill }}>
        {payload[0].name}: {payload[0].value}%
      </div>
    </div>
  )
}

export default function LandCoverPie({ landCover, cityName }) {
  const data = Object.entries(landCover || {}).map(([name, value]) => ({
    name, value, fill: COLORS[name] || 'var(--dim)'
  }))

  return (
    <div className="panel" style={{ padding: 24, marginBottom: 24 }}>
      <div style={{
        fontFamily: 'Orbitron', fontSize: 13, color: 'var(--accent)',
        letterSpacing: 2, marginBottom: 20,
      }}>
        🗺️ LAND COVER DISTRIBUTION
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={100}
            dataKey="value" paddingAngle={3}
            label={({ name, value }) => `${name} ${value}%`}
            labelLine={{ stroke: 'var(--dim)' }}
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <div style={{
        textAlign: 'center', fontFamily: 'Share Tech Mono',
        fontSize: 12, color: 'var(--dim)', marginTop: 8,
      }}>
        {cityName}
      </div>
    </div>
  )
}