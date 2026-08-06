import { asyncHandler } from '../utils/asyncHandler.js'
import * as interventionService from '../services/interventionService.js'

export const listInterventions = asyncHandler(async (req, res) => {
  const data = await interventionService.getAllInterventions(req.query.status)
  res.json({ success: true, count: data.length, data })
})

export const getStudentInterventions = asyncHandler(async (req, res) => {
  const data = await interventionService.getInterventionsByStudent(req.params.studentId)
  res.json({ success: true, count: data.length, data })
})

export const createIntervention = asyncHandler(async (req, res) => {
  const data = await interventionService.createIntervention({
    ...req.body,
    created_by: req.user.id,
  })
  res.status(201).json({ success: true, data })
})

export const updateIntervention = asyncHandler(async (req, res) => {
  const data = await interventionService.updateIntervention(req.params.id, req.body)
  res.json({ success: true, data })
})
