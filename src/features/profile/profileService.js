import { apiClient } from '@/services/apiClient'

export const profileService = {
  async me() {
    const { data } = await apiClient.get('/api/users/me')
    return data
  },
}
