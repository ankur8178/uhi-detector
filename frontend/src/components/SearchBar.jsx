import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const CITIES = [
  'Chennai','Mumbai','Delhi','Bangalore','Kolkata','Hyderabad','Ahmedabad',
  'Pune','Jaipur','Surat','Lucknow','Kanpur','Nagpur','Indore','Bhopal',
  'Visakhapatnam','Patna','Vadodara','Coimbatore','Madurai',
  'New York','London','Tokyo','Shanghai','Dubai','Singapore',
  'Los Angeles','Paris','Berlin','Sydney'
]

export default function SearchBar({ large = false }) {
  const [query,       setQuery]       = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [loading,     setLoading]     = useState(false)
  const [showDrop,    setShowDrop]    = useState(false)
  const navigate = useNavigate()
  const inputRef = useRef(null)
  const debounceRef = useRef(null)

  useEffect(() => {
    clearTimeout(debounceRef.current)
    if (query.length < 2) { setSuggestions([]); return }
    debounceRef.current = setTimeout(() => {
      const filtered = CITIES.filter(c =>
        c.toLowerCase().includes(query.toLowerCase()))
      setSuggestions(filtered)
      setShowDrop(filtered.length > 0)
    }, 300)
  }, [query])

  const handleSubmit = () => {
    if (!query.trim()) return
    setLoading(true)

    // Save to history
    const history = JSON.parse(localStorage.getItem('uhiHistory') || '[]')
    const updated = [query, ...history.filter(c => c !== query)].slice(0, 5)
    localStorage.setItem('uhiHistory', JSON.stringify(updated))

    navigate(`/results?city=${encodeURIComponent(query.trim())}`)
  }

  const handleKey = (e) => {
    if (e.key === 'Enter') handleSubmit()
  }

  const selectCity = (city) => {
    setQuery(city)
    setShowDrop(false)
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: large ? 600 : 400 }}>
      <div style={{ display: 'flex', gap: 8 }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKey}
            onFocus={() => suggestions.length > 0 && setShowDrop(true)}
            onBlur={() => setTimeout(() => setShowDrop(false), 150)}
            placeholder="Enter city name... e.g. Chennai, Mumbai, Delhi"
            style={{
              width: '100%',
              background: 'var(--panel)',
              border: '1px solid var(--border)',
              borderRadius: 2,
              padding: large ? '14px 16px' : '10px 14px',
              color: 'var(--text)',
              fontFamily: 'Share Tech Mono',
              fontSize: large ? 15 : 13,
              outline: 'none',
              transition: 'border-color 0.3s',
            }}
            onMouseEnter={e => e.target.style.borderColor = 'var(--accent)'}
            onMouseLeave={e => e.target.style.borderColor = 'var(--border)'}
          />

          {/* Dropdown */}
          {showDrop && (
            <div style={{
              position: 'absolute', top: '100%', left: 0, right: 0,
              background: 'var(--panel)',
              border: '1px solid var(--border)',
              borderTop: 'none', borderRadius: '0 0 4px 4px',
              zIndex: 100, maxHeight: 200, overflowY: 'auto',
            }}>
              {suggestions.map(city => (
                <div
                  key={city}
                  onMouseDown={() => selectCity(city)}
                  style={{
                    padding: '10px 16px',
                    fontFamily: 'Share Tech Mono', fontSize: 13,
                    color: 'var(--text)', cursor: 'pointer',
                    borderBottom: '1px solid var(--border)',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#0e2a45'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  📍 {city}
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="btn-heat"
          style={{ whiteSpace: 'nowrap', fontSize: large ? 14 : 12 }}
        >
          {loading ? (
            <span style={{ animation: 'blink 1s infinite' }}>···</span>
          ) : 'ANALYZE'}
        </button>
      </div>
    </div>
  )
}