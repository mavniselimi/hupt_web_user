import { apiClient } from '@/services/apiClient'

export const sessionsService = {
  async byEvent(eventId) {
    const { data } = await apiClient.get(`/api/sessions/event/${eventId}`)
    return data
  },
  async active() {
    const { data } = await apiClient.get('/api/sessions/active')
    return data
  },
  async detail(sessionId) {
    const { data } = await apiClient.get(`/api/sessions/${sessionId}`)
    return data
  },
}
