import { apiClient } from '@/services/apiClient'

export const eventsService = {
  async list() {
    const { data } = await apiClient.get('/api/events')
    return data
  },
  async detail(eventId) {
    const { data } = await apiClient.get(`/api/events/${eventId}`)
    return data
  },
  async registerMe(eventId) {
    const { data } = await apiClient.post(`/api/events/${eventId}/register/me`)
    return data
  },
  async myRegistered() {
    const { data } = await apiClient.get('/api/events/me/registered')
    return data
  },
}
