import { useState } from 'react'
import { RadialBarChart, RadialBar, ResponsiveContainer, Legend } from 'recharts'
import { simulateMitigation } from '../api/uhiService'

export default function MitigationSimulator({ cityName, baseUHI }) {
  const [greenPct, setGreenPct] = useState(0)
  const [roofPct,  setRoofPct]  = useState(0)
  const [waterPct, setWaterPct] = useState(0)
  const [result,   setResult]   = useState(null)
  const [loading,  setLoading]  = useState(false)

  const lstDrop    = (greenPct * 0.08) + (roofPct * 0.05) + (waterPct * 0.04)
  const newUHI     = Math.max(0, baseUHI - lstDrop).toFixed(2)
  const carbonOff  = ((greenPct * 10) * 2.5).toFixed(1)

  const chartData = [
    { name: 'Current UHI', value: baseUHI,         fill: 'var(--heat1)' },
    { name: 'After Sim',   value: parseFloat(newUHI), fill: 'var(--cool2)' },
  ]

  const handleApply = async () => {
    setLoading(true)
    const res = await simulateMitigation(cityName, {
      greenPct, roofPct, waterPct
    })
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
        style={{
          width: '100%', accentColor: color,
          cursor: 'pointer', height: 4,
        }}
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

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 32,
      }}>
        {/* Sliders */}
        <div>
          <SliderRow label="🌳 Add Green Cover"      value={greenPct}
            setValue={setGreenPct} max={50} color="var(--cool2)" />
          <SliderRow label="🏠 Cool Roof Coverage"   value={roofPct}
            setValue={setRoofPct}  max={80} color="var(--accent)" />
          <SliderRow label="💧 Water Body Addition"  value={waterPct}
            setValue={setWaterPct} max={30} color="var(--cool1)" />

          {/* Live results */}
          <div style={{
            background: 'var(--bg)', border: '1px solid var(--border)',
            borderRadius: 4, padding: 16, marginTop: 8,
          }}>
            <div style={{
              fontFamily: 'Share Tech Mono', fontSize: 11,
              color: 'var(--dim)', marginBottom: 12,
            }}>
              PROJECTED IMPACT
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ fontFamily: 'Share Tech Mono', fontSize: 13 }}>
                LST Reduction:{' '}
                <span style={{ color: 'var(--cool2)' }}>
                  -{lstDrop.toFixed(2)}°C
                </span>
              </div>
              <div style={{ fontFamily: 'Share Tech Mono', fontSize: 13 }}>
                New UHI Intensity:{' '}
                <span style={{ color: newUHI < 3 ? 'var(--cool2)' : 'var(--heat3)' }}>
                  {newUHI}°C
                </span>
              </div>
              <div style={{ fontFamily: 'Share Tech Mono', fontSize: 13 }}>
                Carbon Offset:{' '}
                <span style={{ color: 'var(--accent)' }}>
                  {carbonOff} t/yr
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={handleApply}
            disabled={loading}
            className="btn-heat"
            style={{ width: '100%', marginTop: 16 }}
          >
            {loading ? 'SIMULATING...' : 'APPLY SIMULATION'}
          </button>

          {result && !result.error && (
            <div style={{
              marginTop: 12, padding: 12,
              background: 'rgba(0,255,204,0.05)',
              border: '1px solid var(--cool2)',
              borderRadius: 4,
              fontFamily: 'Share Tech Mono', fontSize: 11,
              color: 'var(--cool2)',
            }}>
              ✅ Server validated: -{result.lst_drop}°C reduction
            </div>
          )}
        </div>

        {/* Radial chart */}
        <div>
          <div style={{
            fontFamily: 'Share Tech Mono', fontSize: 11,
            color: 'var(--dim)', marginBottom: 8, textAlign: 'center',
          }}>
            BEFORE vs AFTER UHI SCORE
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <RadialBarChart innerRadius={40} outerRadius={100}
              data={chartData} startAngle={180} endAngle={0}>
              <RadialBar dataKey="value" cornerRadius={4} label={{
                position: 'insideStart',
                fill: 'var(--text)',
                fontFamily: 'Share Tech Mono',
                fontSize: 11,
              }} />
              <Legend iconSize={10} wrapperStyle={{
                fontFamily: 'Share Tech Mono', fontSize: 11,
              }} />
            </RadialBarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}