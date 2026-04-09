import { useState } from 'react'
import { compareCities } from '../api/uhiService'

const Row = ({ label, v1, v2, unit = '' }) => {
  const n1 = parseFloat(v1) || 0
  const n2 = parseFloat(v2) || 0
  const c1 = n1 > n2 ? 'var(--heat2)' : 'var(--cool2)'
  const c2 = n2 > n1 ? 'var(--heat2)' : 'var(--cool2)'
  return (
    <tr>
      <td style={{ padding: '10px 12px', fontFamily: 'Share Tech Mono',
        fontSize: 11, color: 'var(--dim)' }}>{label}</td>
      <td style={{ padding: '10px 12px', textAlign: 'center',
        fontFamily: 'Orbitron', fontSize: 14, color: c1 }}>
        {v1}{unit} {n1 > n2 ? '🔴' : '✅'}
      </td>
      <td style={{ padding: '10px 12px', textAlign: 'center',
        fontFamily: 'Orbitron', fontSize: 14, color: c2 }}>
        {v2}{unit} {n2 > n1 ? '🔴' : '✅'}
      </td>
    </tr>
  )
}

export default function CityComparison({ baseCity }) {
  const [city2,   setCity2]   = useState('')
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  const handleCompare = async () => {
    if (!city2.trim()) return
    setLoading(true); setError(null)
    const res = await compareCities(baseCity, city2)
    if (res.error) setError(res.message)
    else setData(res)
    setLoading(false)
  }

  const d1 = data?.city1
  const d2 = data?.city2

  return (
    <div className="panel" style={{ padding: 24, marginBottom: 24 }}>
      <div style={{
        fontFamily: 'Orbitron', fontSize: 13, color: 'var(--accent)',
        letterSpacing: 2, marginBottom: 20,
      }}>
        ⚖️ CITY COMPARISON
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <input
          value={city2}
          onChange={e => setCity2(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleCompare()}
          placeholder="Enter city to compare..."
          style={{
            flex: 1, background: 'var(--bg)',
            border: '1px solid var(--border)', borderRadius: 2,
            padding: '10px 14px', color: 'var(--text)',
            fontFamily: 'Share Tech Mono', fontSize: 13, outline: 'none',
          }}
        />
        <button onClick={handleCompare} disabled={loading}
          className="btn-heat">
          {loading ? '...' : 'COMPARE'}
        </button>
      </div>

      {error && (
        <div style={{ color: 'var(--heat1)', fontFamily: 'Share Tech Mono',
          fontSize: 12, marginBottom: 16 }}>
          ⚠️ {error}
        </div>
      )}

      {d1 && d2 && (
        <>
          <div style={{
            fontFamily: 'Share Tech Mono', fontSize: 12,
            color: 'var(--heat2)', textAlign: 'center', marginBottom: 16,
          }}>
            {d1.city} is {Math.abs(d1.uhi_intensity - d2.uhi_intensity).toFixed(1)}°C
            {d1.uhi_intensity > d2.uhi_intensity ? ' hotter' : ' cooler'} than {d2.city}
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ padding: '8px 12px', textAlign: 'left',
                  fontFamily: 'Share Tech Mono', fontSize: 11,
                  color: 'var(--dim)', borderBottom: '1px solid var(--border)' }}>
                  METRIC
                </th>
                <th style={{ padding: '8px 12px', textAlign: 'center',
                  fontFamily: 'Orbitron', fontSize: 11, color: 'var(--accent)',
                  borderBottom: '1px solid var(--border)' }}>
                  {baseCity}
                </th>
                <th style={{ padding: '8px 12px', textAlign: 'center',
                  fontFamily: 'Orbitron', fontSize: 11, color: 'var(--heat3)',
                  borderBottom: '1px solid var(--border)' }}>
                  {city2}
                </th>
              </tr>
            </thead>
            <tbody>
              <Row label="UHI Intensity" v1={d1.uhi_intensity} v2={d2.uhi_intensity} unit="°C" />
              <Row label="Peak LST"      v1={d1.peak_lst}      v2={d2.peak_lst}      unit="°C" />
              <Row label="Avg NDVI"      v1={d1.avg_ndvi}      v2={d2.avg_ndvi}      />
              <Row label="Hotspots"      v1={d1.hotspot_count} v2={d2.hotspot_count} />
            </tbody>
          </table>
        </>
      )}
    </div>
  )
}