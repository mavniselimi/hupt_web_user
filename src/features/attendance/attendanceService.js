import { apiClient } from '@/services/apiClient'

export const attendanceService = {
  async myAttendanceList() {
    const { data } = await apiClient.get('/api/attendance/me')
    return data
  },
  async myAttendanceCount() {
    const { data } = await apiClient.get('/api/attendance/me/count')
    return data
  },
  async submit(payload) {
    const { data } = await apiClient.post('/api/attendance/submit', payload)
    return data
  },
}
