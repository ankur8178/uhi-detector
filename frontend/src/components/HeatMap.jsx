import { useState } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'

export default function HeatMap({ lat, lng, tileUrls, hotspots }) {
  const [layer, setLayer] = useState('thermal')

  const tileUrl = layer === 'thermal'
    ? tileUrls?.lst_tile_url
    : tileUrls?.ndvi_tile_url

  return (
    <div className="panel" style={{ padding: 24, marginBottom: 24 }}>
      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: 16,
      }}>
        <div style={{
          fontFamily: 'Orbitron', fontSize: 13, color: 'var(--accent)',
          letterSpacing: 2,
        }}>
          🗺️ THERMAL MAP
        </div>

        {/* Toggle */}
        <div style={{
          display: 'flex', background: 'var(--bg)',
          border: '1px solid var(--border)', borderRadius: 20,
          overflow: 'hidden',
        }}>
          {['thermal', 'ndvi'].map(l => (
            <button key={l} onClick={() => setLayer(l)}
              style={{
                padding: '6px 18px',
                background: layer === l ? 'var(--accent)' : 'transparent',
                color:      layer === l ? '#000' : 'var(--dim)',
                border: 'none', cursor: 'pointer',
                fontFamily: 'Share Tech Mono', fontSize: 11,
                letterSpacing: 1, transition: 'all 0.3s',
              }}>
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Map */}
      <div style={{ height: 450, borderRadius: 4, overflow: 'hidden' }}>
        <MapContainer
          center={[lat || 13, lng || 80]}
          zoom={11}
          style={{ height: '100%', width: '100%' }}
        >
          {/* Dark basemap */}
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; OpenStreetMap &copy; CARTO'
          />

          {/* GEE tile layer */}
          {tileUrl && (
            <TileLayer url={tileUrl} opacity={0.7} />
          )}

          {/* Hotspot markers */}
          {(hotspots || []).map((h, i) => (
            <CircleMarker key={i}
              center={[h.lat, h.lng]}
              radius={12}
              pathOptions={{
                color: 'var(--heat1)', fillColor: '#ff2200',
                fillOpacity: 0.6, weight: 2,
              }}
            >
              <Popup>
                <div style={{
                  background: 'var(--panel)', color: 'var(--text)',
                  fontFamily: 'Share Tech Mono', fontSize: 12, padding: 8,
                }}>
                  <div style={{ color: 'var(--heat2)', marginBottom: 4 }}>
                    🔥 {h.zone}
                  </div>
                  <div>LST: {h.lst}°C</div>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>

      {/* Legend */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        marginTop: 12, justifyContent: 'center',
      }}>
        <span style={{ fontFamily: 'Share Tech Mono', fontSize: 10,
          color: 'var(--dim)' }}>COOL</span>
        {['#00aaff','#00ffcc','#ffdd00','#ff6600','#ff2200'].map(c => (
          <div key={c} style={{
            width: 30, height: 8, background: c, borderRadius: 2,
          }} />
        ))}
        <span style={{ fontFamily: 'Share Tech Mono', fontSize: 10,
          color: 'var(--dim)' }}>HOT</span>
      </div>
    </div>
  )
}