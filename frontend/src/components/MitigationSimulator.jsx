import { useState } from 'react'
import { simulateMitigation } from '../api/uhiService'

// ── Custom SVG half-gauge ─────────────────────────────────────────────────────
function HalfGauge({ baseUHI, newUHI }) {
  const maxVal = Math.max(baseUHI * 1.5, 5)
  const cx     = 110
  const cy     = 110
  const r      = 80
  const stroke = 18

  const toXY = (val) => {
    const angle = Math.PI - (val / maxVal) * Math.PI
    return {
      x: cx + r * Math.cos(angle),
      y: cy - r * Math.sin(angle),
    }
  }

  const arcPath = (val, color) => {
    if (val <= 0) return null
    const pct     = Math.min(val / maxVal, 1)
    const circumf = Math.PI * r
    const dash    = pct * circumf
    return (
      <path
        d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={`${dash} ${circumf}`}
      />
    )
  }

  const afterPt = toXY(newUHI)
  const basePt  = toXY(baseUHI)

  return (
    <svg viewBox="0 0 220 130" style={{ width: '100%', maxWidth: 260, display: 'block', margin: '0 auto' }}>
      {/* Track */}
      <path
        d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
        fill="none" stroke="#0e2a45" strokeWidth={stroke} strokeLinecap="round"
      />

      {/* Current UHI arc */}
      {arcPath(baseUHI, '#c45a1a')}

      {/* After Sim arc — always show, min dash so it's visible even at 0 */}
      <path
        d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
        fill="none"
        stroke="#00ffcc"
        strokeWidth={stroke - 6}
        strokeLinecap="round"
        strokeDasharray={`${Math.max(newUHI / maxVal, 0.01) * Math.PI * r} ${Math.PI * r}`}
      />

      {/* Needle for baseUHI */}
      <line
        x1={cx} y1={cy}
        x2={basePt.x} y2={basePt.y}
        stroke="#ff6600" strokeWidth={2} strokeLinecap="round"
      />

      {/* Needle for newUHI — always show, hardcoded color */}
      <line
        x1={cx} y1={cy}
        x2={afterPt.x} y2={afterPt.y}
        stroke="#00ffcc" strokeWidth={2} strokeLinecap="round"
      />

      {/* Center pivot */}
      <circle cx={cx} cy={cy} r={5} fill="#c8dff0" />

      {/* Scale labels */}
      <text x={cx - r - 4} y={cy + 16} textAnchor="middle"
        fill="#4a6880" fontSize="9" fontFamily="Share Tech Mono">0</text>
      <text x={cx + r + 4} y={cy + 16} textAnchor="middle"
        fill="#4a6880" fontSize="9" fontFamily="Share Tech Mono">{maxVal.toFixed(1)}</text>
      <text x={cx} y={cy - r - 10} textAnchor="middle"
        fill="#4a6880" fontSize="9" fontFamily="Share Tech Mono">{(maxVal / 2).toFixed(1)}</text>

      {/* Value labels */}
      <text x={cx - 28} y={cy + 28} textAnchor="middle"
        fill="#00ffcc" fontSize="11" fontFamily="Share Tech Mono">
        {newUHI === 0 ? '0.00' : newUHI}°C
      </text>
      <text x={cx + 28} y={cy + 28} textAnchor="middle"
        fill="#c45a1a" fontSize="11" fontFamily="Share Tech Mono">
        {baseUHI}°C
      </text>
    </svg>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function MitigationSimulator({ cityName, baseUHI }) {
  const [greenPct, setGreenPct] = useState(0)
  const [roofPct,  setRoofPct]  = useState(0)
  const [waterPct, setWaterPct] = useState(0)
  const [result,   setResult]   = useState(null)
  const [loading,  setLoading]  = useState(false)

  const lstDrop   = (greenPct * 0.08) + (roofPct * 0.05) + (waterPct * 0.04)
  const newUHI    = parseFloat(Math.max(0, baseUHI - lstDrop).toFixed(2))
  const carbonOff = ((greenPct * 10) * 2.5).toFixed(1)

  const handleApply = async () => {
    setLoading(true)
    const res = await simulateMitigation(cityName, { greenPct, roofPct, waterPct })
    setResult(res)
    setLoading(false)
  }

  const SliderRow = ({ label, value, setValue, max, color }) => (
    <div style={{ marginBottom: 20 }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        fontFamily: 'Share Tech Mono', fontSize: 12,
        color: 'var(--text)', marginBottom: 8,
      }}>
        <span>{label}</span>
        <span style={{ color }}>{value}%</span>
      </div>
      <input type="range" min={0} max={max} value={value}
        onChange={e => setValue(Number(e.target.value))}
        style={{ width: '100%', accentColor: color, cursor: 'pointer', height: 4 }}
      />
    </div>
  )

  return (
    <div className="panel" style={{ padding: 24, marginBottom: 24 }}>
      <div style={{
        fontFamily: 'Orbitron', fontSize: 13, color: 'var(--accent)',
        letterSpacing: 2, marginBottom: 24,
      }}>
        ⚙️ MITIGATION SIMULATOR
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>

        {/* ── Left: sliders + stats ── */}
        <div>
          <SliderRow label="🌳 Add Green Cover"     value={greenPct} setValue={setGreenPct} max={50} color="var(--cool2)" />
          <SliderRow label="🏠 Cool Roof Coverage"  value={roofPct}  setValue={setRoofPct}  max={80} color="var(--accent)" />
          <SliderRow label="💧 Water Body Addition" value={waterPct} setValue={setWaterPct} max={30} color="var(--cool1)" />

          <div style={{
            background: 'var(--bg)', border: '1px solid var(--border)',
            borderRadius: 4, padding: 16, marginTop: 8,
          }}>
            <div style={{ fontFamily: 'Share Tech Mono', fontSize: 11, color: 'var(--dim)', marginBottom: 12 }}>
              PROJECTED IMPACT
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ fontFamily: 'Share Tech Mono', fontSize: 13 }}>
                LST Reduction:{' '}
                <span style={{ color: '#00ffcc' }}>-{lstDrop.toFixed(2)}°C</span>
              </div>
              <div style={{ fontFamily: 'Share Tech Mono', fontSize: 13 }}>
                New UHI Intensity:{' '}
                <span style={{ color: newUHI < 3 ? '#00ffcc' : 'var(--heat3)' }}>
                  {newUHI.toFixed(2)}°C
                </span>
              </div>
              <div style={{ fontFamily: 'Share Tech Mono', fontSize: 13 }}>
                Carbon Offset:{' '}
                <span style={{ color: 'var(--accent)' }}>{carbonOff} t/yr</span>
              </div>
            </div>
          </div>

          <button onClick={handleApply} disabled={loading}
            className="btn-heat" style={{ width: '100%', marginTop: 16 }}>
            {loading ? 'SIMULATING...' : 'APPLY SIMULATION'}
          </button>

          {result && !result.error && (
            <div style={{
              marginTop: 12, padding: 12,
              background: 'rgba(0,255,204,0.05)',
              border: '1px solid #00ffcc',
              borderRadius: 4, fontFamily: 'Share Tech Mono',
              fontSize: 11, color: '#00ffcc',
            }}>
              ✅ Server validated: -{result.lst_drop}°C reduction
            </div>
          )}
        </div>

        {/* ── Right: custom gauge ── */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{
            fontFamily: 'Share Tech Mono', fontSize: 11,
            color: 'var(--dim)', marginBottom: 12, textAlign: 'center',
          }}>
            BEFORE vs AFTER UHI SCORE
          </div>

          <HalfGauge baseUHI={baseUHI} newUHI={newUHI} />

          {/* Legend */}
          <div style={{ display: 'flex', gap: 20, marginTop: 12, fontFamily: 'Share Tech Mono', fontSize: 11 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 12, height: 3, background: '#c45a1a', borderRadius: 2 }} />
              <span style={{ color: '#c45a1a' }}>Current UHI</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 12, height: 3, background: '#00ffcc', borderRadius: 2 }} />
              <span style={{ color: '#00ffcc' }}>After Sim</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}