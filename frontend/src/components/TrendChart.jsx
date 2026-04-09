import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, Area, AreaChart
} from 'recharts'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'var(--panel)', border: '1px solid var(--border)',
      padding: '12px 16px', borderRadius: 4,
      fontFamily: 'Share Tech Mono', fontSize: 12,
    }}>
      <div style={{ color: 'var(--accent)', marginBottom: 6 }}>{label}</div>
      {payload.map(p => (
        <div key={p.name} style={{ color: p.color }}>
          {p.name}: {p.value}°C
        </div>
      ))}
    </div>
  )
}

export default function TrendChart({ trend }) {
  const data = (trend || []).filter(d => d.urban !== null)

  return (
    <div className="panel" style={{ padding: 24, marginBottom: 24 }}>
      <div style={{
        fontFamily: 'Orbitron', fontSize: 13, color: 'var(--accent)',
        letterSpacing: 2, marginBottom: 20,
      }}>
        📈 HISTORICAL LST TREND (2015–2024)
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id="urbanGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#ff2200" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#ff2200" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="suburbGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#ffaa00" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#ffaa00" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#22cc44" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#22cc44" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="year" tick={{ fill: 'var(--dim)', fontSize: 11,
            fontFamily: 'Share Tech Mono' }} />
          <YAxis tick={{ fill: 'var(--dim)', fontSize: 11,
            fontFamily: 'Share Tech Mono' }}
            label={{ value: '°C', fill: 'var(--dim)', position: 'insideLeft' }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontFamily: 'Share Tech Mono', fontSize: 11 }} />
          <Area type="monotone" dataKey="urban"    name="Urban Core"
            stroke="#ff2200" fill="url(#urbanGrad)"  strokeWidth={2} dot={{ r: 3 }} />
          <Area type="monotone" dataKey="suburban" name="Suburban"
            stroke="#ffaa00" fill="url(#suburbGrad)" strokeWidth={2} dot={{ r: 3 }} />
          <Area type="monotone" dataKey="green"    name="Green Belt"
            stroke="#22cc44" fill="url(#greenGrad)"  strokeWidth={2} dot={{ r: 3 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}