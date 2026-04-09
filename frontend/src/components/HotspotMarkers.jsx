import { CircleMarker, Popup } from 'react-leaflet'

export default function HotspotMarkers({ hotspots }) {
  if (!hotspots || hotspots.length === 0) return null

  return (
    <>
      {hotspots.map((h, i) => (
        <CircleMarker
          key={i}
          center={[h.lat, h.lng]}
          radius={14}
          pathOptions={{
            color:       '#ff2200',
            fillColor:   '#ff2200',
            fillOpacity: 0.5,
            weight:      2,
          }}
        >
          <Popup>
            <div style={{
              background:  'var(--panel)',
              color:       'var(--text)',
              fontFamily:  'Share Tech Mono',
              fontSize:    12,
              padding:     8,
              minWidth:    140,
            }}>
              <div style={{ color: 'var(--heat2)', marginBottom: 6, fontWeight: 700 }}>
                🔥 HOTSPOT #{i + 1}
              </div>
              <div>Zone: <span style={{ color: 'var(--accent)' }}>{h.zone}</span></div>
              <div>LST:  <span style={{ color: 'var(--heat1)' }}>{h.lst}°C</span></div>
              <div style={{ marginTop: 4, fontSize: 10, color: 'var(--dim)' }}>
                {h.lat.toFixed(4)}, {h.lng.toFixed(4)}
              </div>
            </div>
          </Popup>

          {/* Pulsing outer ring */}
          <CircleMarker
            center={[h.lat, h.lng]}
            radius={22}
            pathOptions={{
              color:       '#ff2200',
              fillColor:   'transparent',
              fillOpacity: 0,
              weight:      1,
              opacity:     0.4,
            }}
          />
        </CircleMarker>
      ))}
    </>
  )
}