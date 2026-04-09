import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

const handleError = (err) => ({
  error: true,
  message: err.response?.data?.error || err.message || 'Network error'
})

export const analyzeCity     = async (city)           => {
  try { return (await api.get('/analyze',  { params: { city } })).data }
  catch (e) { return handleError(e) }
}
export const compareCities   = async (city1, city2)   => {
  try { return (await api.get('/compare',  { params: { city1, city2 } })).data }
  catch (e) { return handleError(e) }
}
export const getCityTrend    = async (city)           => {
  try { return (await api.get('/trend',    { params: { city } })).data }
  catch (e) { return handleError(e) }
}
export const simulateMitigation = async (city, params) => {
  try { return (await api.get('/simulate', { params: { city, ...params } })).data }
  catch (e) { return handleError(e) }
}
export async function getCitySeasonal(city, year = 2023) {
  try {
    const res = await axios.get('/api/seasonal', { params: { city, year } })
    return res.data
  } catch (e) {
    return { error: true, message: e.message }
  }
}