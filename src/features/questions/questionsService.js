import { apiClient } from '@/services/apiClient'

/** Aligns with backend QuestionController: POST /api/questions/session/{sessionId} */
export const questionsService = {
  async ask(sessionId, payload) {
    const { data } = await apiClient.post(`/api/questions/session/${sessionId}`, payload)
    return data
  },

  /** GET /api/questions/session/{sessionId}/approved — approved only */
  async approvedBySession(sessionId) {
    const { data } = await apiClient.get(`/api/questions/session/${sessionId}/approved`)
    return data
  },
}
