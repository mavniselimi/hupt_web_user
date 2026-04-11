import { apiClient } from '@/services/apiClient'

export const registrationsService = {
  async myForEvent(eventId) {
    const { data } = await apiClient.get(`/api/events/${eventId}/registrations/me`)
    return data
  },
}