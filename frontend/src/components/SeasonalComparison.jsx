import { useEffect, useState } from 'react'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { getCitySeasonal } from '../api/uhiService'

const SEASON_COLORS = {
  Summer:  '#ff2200',
  Monsoon: '#00e5ff',
  Autumn:  '#ffaa00',
  Winter:  '#00ffcc',
}

const SEASON_ICONS = {
  Summer:  '☀️',
  Monsoon: '🌧️',
  Autumn:  '🍂',
  Winter:  '❄️',
}

export default function SeasonalComparison({ city }) {
  const [seasons, setSeasons] = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)
  const [year,    setYear]    = useState(2023)

  useEffect(() => {
    fetchSeasonal()
  }, [city, year])

  const fetchSeasonal = async () => {
    setLoading(true); setError(null)
    const res = await getCitySeasonal(city, year)
    if (res.error) { setError(res.message); setLoading(false); return }
    setSeasons(res.seasons || [])
    setLoading(false)
  }

  // Build radar-compatible data (one entry per season, with lst + ndvi)
  const radarData = seasons.map(s => ({
    season: `${SEASON_ICONS[s.season]} ${s.season}`,
    'LST (°C)':  s.lst  ?? 0,
    'NDVI × 10': s.ndvi != null ? +(s.ndvi * 10).toFixed(2) : 0,
  }))

  return (
    <div className="panel" style={{ marginBottom: 24 }}>

      {/* Header */}
      <div style={{
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'space-between',
        marginBottom:   20,
        flexWrap:       'wrap',
        gap:            12,
      }}>
        <div style={{
          fontFamily:    'Orbitron',
          fontSize:      15,
          letterSpacing: 2,
          color:         'var(--text)',
        }}>
          🌍 SEASONAL COMPARISON
        </div>

        {/* Year selector */}
        <select
          value={year}
          onChange={e => setYear(Number(e.target.value))}
          style={{
            background:   'var(--card)',
            border:       '1px solid var(--border)',
            color:        'var(--text)',
            fontFamily:   'Share Tech Mono',
            fontSize:     12,
            padding:      '6px 12px',
            borderRadius: 6,
            cursor:       'pointer',
          }}
        >
          {[2019, 2020, 2021, 2022, 2023, 2024].map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      {loading && (
        <div style={{
          textAlign:  'center',
          padding:    40,
          fontFamily: 'Share Tech Mono',
          color:      'var(--dim)',
          fontSize:   13,
        }}>
          ⟳ Fetching seasonal satellite data…
        </div>
      )}

      {error && (
        <div style={{
          textAlign:  'center',
          padding:    20,
          fontFamily: 'Share Tech Mono',
          color:      'var(--heat1)',
          fontSize:   12,
        }}>
          {error}
        </div>
      )}

      {!loading && !error && seasons.length > 0 && (
        <>
          {/* Season cards */}
          <div style={{
            display:             'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap:                 12,
            marginBottom:        24,
          }}>
            {seasons.map(s => (
              <div key={s.season} style={{
                background:   'var(--card)',
                border:       `1px solid ${SEASON_COLORS[s.season]}44`,
                borderRadius: 10,
                padding:      '14px 16px',
                textAlign:    'center',
              }}>
                <div style={{ fontSize: 24, marginBottom: 6 }}>
                  {SEASON_ICONS[s.season]}
                </div>
                <div style={{
                  fontFamily:    'Orbitron',
                  fontSize:      11,
                  color:         SEASON_COLORS[s.season],
                  letterSpacing: 1,
                  marginBottom:  8,
                }}>
                  {s.season.toUpperCase()}
                </div>
                <div style={{
                  fontFamily: 'Share Tech Mono',
                  fontSize:   20,
                  color:      SEASON_COLORS[s.season],
                  fontWeight: 700,
                }}>
                  {s.lst != null ? `${s.lst}°C` : 'N/A'}
                </div>
                <div style={{
                  fontFamily: 'Share Tech Mono',
                  fontSize:   11,
                  color:      'var(--dim)',
                  marginTop:  4,
                }}>
                  NDVI {s.ndvi != null ? s.ndvi.toFixed(3) : '—'}
                </div>
                <div style={{
                  fontFamily: 'Share Tech Mono',
                  fontSize:   10,
                  color:      'var(--dim)',
                  marginTop:  4,
                }}>
                  {s.start} → {s.end}
                </div>
              </div>
            ))}
          </div>

          {/* Radar chart */}
          <div style={{ height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis
                  dataKey="season"
                  tick={{ fill: 'var(--dim)', fontFamily: 'Share Tech Mono', fontSize: 11 }}
                />
                <PolarRadiusAxis
                  tick={{ fill: 'var(--dim)', fontFamily: 'Share Tech Mono', fontSize: 9 }}
                />
                <Radar
                  name="LST (°C)"
                  dataKey="LST (°C)"
                  stroke="#ff6600"
                  fill="#ff6600"
                  fillOpacity={0.25}
                />
                <Radar
                  name="NDVI × 10"
                  dataKey="NDVI × 10"
                  stroke="#00ffcc"
                  fill="#00ffcc"
                  fillOpacity={0.2}
                />
                <Tooltip
                  contentStyle={{
                    background:   'var(--card)',
                    border:       '1px solid var(--border)',
                    fontFamily:   'Share Tech Mono',
                    fontSize:     12,
                    color:        'var(--text)',
                    borderRadius: 8,
                  }}
                />
                <Legend
                  wrapperStyle={{ fontFamily: 'Share Tech Mono', fontSize: 12 }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Hottest / Coolest callout */}
          {(() => {
            const valid    = seasons.filter(s => s.lst != null)
            const hottest  = valid.reduce((a, b) => a.lst > b.lst ? a : b, valid[0])
            const coolest  = valid.reduce((a, b) => a.lst < b.lst ? a : b, valid[0])
            return (
              <div style={{
                display:             'grid',
                gridTemplateColumns: '1fr 1fr',
                gap:                 12,
                marginTop:           16,
              }}>
                <div style={{
                  background:   '#ff220011',
                  border:       '1px solid #ff220033',
                  borderRadius: 8,
                  padding:      '12px 16px',
                  textAlign:    'center',
                }}>
                  <div style={{ fontFamily: 'Orbitron', fontSize: 10, color: '#ff2200', letterSpacing: 1 }}>
                    🔥 HOTTEST SEASON
                  </div>
                  <div style={{ fontFamily: 'Share Tech Mono', fontSize: 18, color: '#ff2200', marginTop: 4 }}>
                    {hottest?.season} — {hottest?.lst}°C
                  </div>
                </div>
                <div style={{
                  background:   '#00ffcc11',
                  border:       '1px solid #00ffcc33',
                  borderRadius: 8,
                  padding:      '12px 16px',
                  textAlign:    'center',
                }}>
                  <div style={{ fontFamily: 'Orbitron', fontSize: 10, color: '#00ffcc', letterSpacing: 1 }}>
                    ❄️ COOLEST SEASON
                  </div>
                  <div style={{ fontFamily: 'Share Tech Mono', fontSize: 18, color: '#00ffcc', marginTop: 4 }}>
                    {coolest?.season} — {coolest?.lst}°C
                  </div>
                </div>
              </div>
            )
          })()}
        </>
      )}
    </div>
  )
}