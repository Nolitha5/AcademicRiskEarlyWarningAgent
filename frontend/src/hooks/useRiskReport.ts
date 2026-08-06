import { useState, useEffect } from 'react'
import { riskApi } from '../services/api'

export function useRiskReport(studentId: string) {
  const [report,  setReport]  = useState<unknown>(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState<string | null>(null)

  useEffect(() => {
    if (!studentId) return
    riskApi.getReport(studentId)
      .then(res => setReport(res.data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [studentId])

  return { report, loading, error }
}
