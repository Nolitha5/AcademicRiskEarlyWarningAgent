import axios from 'axios'
import { AI_SERVICE_URL } from '../config/aiService.js'

/**
 * Send student academic data to the Python AI service for risk analysis.
 * @param {object} studentAcademicData - Shaped to match StudentAcademicData Pydantic model
 * @returns {object} RiskReport from Python service
 */
export async function analyseStudentRisk(studentAcademicData) {
  try {
    const response = await axios.post(
      `${AI_SERVICE_URL}/risk/analyse`,
      studentAcademicData,
      { timeout: 30_000 }
    )
    return response.data
  } catch (err) {
    const msg = err.response?.data?.detail ?? err.message
    throw new Error(`AI service error: ${msg}`)
  }
}

/** Check if the Python AI service is reachable */
export async function checkAiServiceHealth() {
  try {
    const res = await axios.get(`${AI_SERVICE_URL}/health/`, { timeout: 5_000 })
    return { healthy: true, ...res.data }
  } catch {
    return { healthy: false }
  }
}
