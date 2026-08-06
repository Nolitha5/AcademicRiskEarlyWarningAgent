import { useState, useEffect } from 'react'
import { studentsApi } from '../services/api'

export function useStudents() {
  const [students, setStudents] = useState<unknown[]>([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState<string | null>(null)

  useEffect(() => {
    studentsApi.list()
      .then(res => setStudents(res.data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return { students, loading, error }
}
