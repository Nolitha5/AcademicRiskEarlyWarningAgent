import { asyncHandler } from '../utils/asyncHandler.js'
import * as studentService from '../services/studentService.js'

/**
 * GET /api/students
 * Supports three modes:
 *   ?email=   – find the student linked to this auth user's email (profile linking)
 *   ?q=       – search by name or student number
 *   (none)    – return all active students
 */
export const listStudents = asyncHandler(async (req, res) => {
  const { q, email } = req.query

  let data
  if (email) {
    // Profile linking: find the student whose institutional email matches.
    // Pass the authenticated user's UUID so we can opportunistically cache the link.
    const authUserId = req.user?.id ?? null
    const student = await studentService.getStudentByEmail(email, authUserId)
    data = student ? [student] : []
  } else if (q) {
    data = await studentService.searchStudents(q)
  } else {
    data = await studentService.getAllStudents()
  }

  res.json({ success: true, count: data.length, data })
})

export const getStudent = asyncHandler(async (req, res) => {
  const data = await studentService.getStudentById(req.params.id)
  if (!data) return res.status(404).json({ error: 'Student not found' })
  res.json({ success: true, data })
})

export const getStudentProfile = asyncHandler(async (req, res) => {
  const data = await studentService.getStudentProfile(req.params.id)
  res.json({ success: true, data })
})
