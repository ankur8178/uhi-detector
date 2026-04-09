import { useEffect, useState, Suspense, lazy } from 'react'
import { useSearchParams, useNavigate }         from 'react-router-dom'
import { analyzeCity, getCityTrend }            from '../api/uhiService'
import Loader              from '../components/Loader'
import SeverityBanner      from '../components/SeverityBanner'
import UHIStats            from '../components/UHIStats'
import ZoneChart           from '../components/ZoneChart'
import TrendChart          from '../components/TrendChart'
import NDVIScatter         from '../components/NDVIScatter'
import LandCoverPie        from '../components/LandCoverPie'
import MitigationCards     from '../components/MitigationCards'
import MitigationSimulator from '../components/MitigationSimulator'
import BeforeAfterSlider   from '../components/BeforeAfterSlider'
import CityComparison      from '../components/CityComparison'
import PDFExportButton     from '../components/PDFExportButton'      // ── NEW
import SeasonalComparison  from '../components/SeasonalComparison'   // ── NEW
import { buildAndCopyShareLink } from '../utils/shareLink'           // ── NEW

const HeatMap = lazy(() => import('../components/HeatMap'))

export default function Results() {
  const [searchParams] = useSearchParams()
  const navigate       = useNavigate()
  const city           = searchParams.get('city') || ''

  const [data,        setData]        = useState(null)
  const [trend,       setTrend]       = useState(null)
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState(null)
  const [showCompare, setShowCompare] = useState(false)
  const [linkCopied,  setLinkCopied]  = useState(false)   // ── NEW

  const history = JSON.parse(localStorage.getItem('uhiHistory') || '[]')

  useEffect(() => {
    if (!city) { navigate('/'); return }
    fetchData()
  }, [city])

  const fetchData = async () => {
    setLoading(true); setError(null)
    const [mainRes, trendRes] = await Promise.all([
      analyzeCity(city),
      getCityTrend(city),
    ])
    if (mainRes.error) { setError(mainRes.message); setLoading(false); return }
    setData(mainRes)
    setTrend(trendRes?.trend || [])
    setLoading(false)
  }

  // ── NEW: share handler ────────────────────────────────────────────────────
  const handleShare = async () => {
    const { copied } = await buildAndCopyShareLink(city)
    if (copied) {
      setLinkCopied(true)
      setTimeout(() => setLinkCopied(false), 2500)
    }
  }

  if (loading) return <Loader />

  if (error) return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', gap: 20, padding: 40,
    }}>
      <div style={{ fontSize: 48 }}>🛰️</div>
      <div style={{
        fontFamily: 'Orbitron', fontSize: 18,
        color: 'var(--heat1)', letterSpacing: 2,
      }}>
        ANALYSIS FAILED
      </div>
      <div style={{
        fontFamily: 'Share Tech Mono', fontSize: 13,
        color: 'var(--dim)', textAlign: 'center', maxWidth: 400,
      }}>
        {error}
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        <button onClick={fetchData} className="btn-heat">RETRY</button>
        <button onClick={() => navigate('/')} className="btn-accent">
          ← SEARCH ANOTHER CITY
        </button>
      </div>
    </div>
  )

  return (
    // ── NEW: id="results-root" added so PDFExportButton can target this div
    <div id="results-root"
      style={{ minHeight: '100vh', padding: '24px 20px',
        maxWidth: 1100, margin: '0 auto' }}>

      {/* Top bar */}
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', marginBottom: 24,
        flexWrap: 'wrap', gap: 12,
      }}>
        <button onClick={() => navigate('/')} className="btn-accent">
          ← SEARCH ANOTHER CITY
        </button>

        <div style={{
          fontFamily: 'Orbitron', fontSize: 20, fontWeight: 700,
          color: 'var(--text)', letterSpacing: 2,
        }}>
          {city.toUpperCase()}
        </div>

        {/* ── NEW: action buttons row ─────────────────────────────────────── */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>

          {/* Share button */}
          <button
            onClick={handleShare}
            className="btn-accent"
            style={{ padding: '10px 18px', fontSize: 13, display: 'flex',
              alignItems: 'center', gap: 6 }}
          >
            {linkCopied ? '✅ LINK COPIED!' : '🔗 SHARE'}
          </button>

          {/* PDF export */}
          <PDFExportButton city={city} targetId="results-root" />
        </div>

        {/* History chips */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', width: '100%' }}>
          {history.filter(c => c !== city).slice(0, 4).map(c => (
            <button key={c}
              onClick={() => navigate(`/results?city=${encodeURIComponent(c)}`)}
              style={{
                background: 'transparent',
                border: '1px solid var(--border)',
                color: 'var(--dim)',
                fontFamily: 'Share Tech Mono', fontSize: 10,
                padding: '4px 10px', borderRadius: 20,
                cursor: 'pointer', transition: 'all 0.2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--accent)'
                e.currentTarget.style.color = 'var(--accent)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border)'
                e.currentTarget.style.color = 'var(--dim)'
              }}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* 1. Severity Banner */}
      <SeverityBanner intensity={data.uhi_intensity} />

      {/* 2. Stats */}
      <UHIStats data={data} />

      {/* 3. Heat Map */}
      <Suspense fallback={
        <div className="panel" style={{ height: 500, display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          fontFamily: 'Share Tech Mono', color: 'var(--dim)' }}>
          Loading map...
        </div>
      }>
        <HeatMap
          lat={data.lat} lng={data.lng}
          tileUrls={data.tile_urls}
          hotspots={data.hotspots}
        />
      </Suspense>

      {/* 4 + 5. Zone + Trend side by side on desktop */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
        gap: 24,
      }}>
        <ZoneChart  zoneStats={data.zone_stats} />
        <TrendChart trend={trend} />
      </div>

      {/* 6 + 7. Scatter + Pie side by side */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
        gap: 24,
      }}>
        <NDVIScatter  scatter={data.scatter} />
        <LandCoverPie landCover={data.land_cover} cityName={city} />
      </div>

      {/* ── NEW: 8. Seasonal Comparison ──────────────────────────────────── */}
      <SeasonalComparison city={city} />

      {/* 9. Before/After Slider */}
      <BeforeAfterSlider
        cityName={city}
        uhiIntensity={data.uhi_intensity}
      />

      {/* 10. Mitigation Simulator */}
      <MitigationSimulator
        cityName={city}
        baseUHI={data.uhi_intensity}
      />

      {/* 11. Mitigation Cards */}
      <MitigationCards
        strategies={data.mitigation?.strategies || []}
      />

      {/* 12. City Comparison toggle */}
      <div style={{ marginBottom: 24 }}>
        <button
          onClick={() => setShowCompare(v => !v)}
          className="btn-accent"
          style={{ width: '100%', padding: 14 }}
        >
          {showCompare ? '▲ HIDE' : '▼ COMPARE WITH ANOTHER CITY'}
        </button>
        {showCompare && (
          <div style={{ marginTop: 16 }}>
            <CityComparison baseCity={city} />
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{
        textAlign: 'center', padding: '24px 0',
        borderTop: '1px solid var(--border)',
        fontFamily: 'Share Tech Mono', fontSize: 11,
        color: 'var(--dim)',
      }}>
        UHI Detector • Powered by Landsat 8 + Google Earth Engine •{' '}
        Data: {new Date().getFullYear()}
      </div>
    </div>
  )
}