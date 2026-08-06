import { Router } from 'express'
import Joi from 'joi'
import { validate } from '../middleware/validate.js'
import {
  listInterventions,
  getStudentInterventions,
  createIntervention,
  updateIntervention,
} from '../controllers/interventionController.js'

const router = Router()

const createSchema = Joi.object({
  student_id:        Joi.string().uuid().required(),
  risk_report_id:    Joi.string().uuid().allow(null),
  intervention_type: Joi.string().valid(
    'TUTOR_REFERRAL','ACADEMIC_ADVISOR','COUNSELLING','ATTENDANCE_WARNING',
    'ASSESSMENT_MAKEUP','SUPPLEMENTARY_TUTORIAL','PARENT_NOTIFICATION',
    'ACADEMIC_PROBATION','OTHER'
  ).required(),
  description: Joi.string().min(10).required(),
  priority:    Joi.string().valid('URGENT','HIGH','MEDIUM','LOW').required(),
  due_date:    Joi.string().isoDate().allow(null),
  assigned_to: Joi.string().uuid().allow(null),
})

const updateSchema = Joi.object({
  status:        Joi.string().valid('PENDING','IN_PROGRESS','COMPLETED','CANCELLED'),
  outcome_notes: Joi.string().allow('', null),
  completed_at:  Joi.string().isoDate().allow(null),
  assigned_to:   Joi.string().uuid().allow(null),
})

// GET /api/interventions?status=PENDING
router.get('/',                      listInterventions)
// GET /api/interventions/:studentId
router.get('/:studentId',            getStudentInterventions)
// POST /api/interventions
router.post('/',                     validate(createSchema), createIntervention)
// PUT /api/interventions/:id
router.put('/:id',                   validate(updateSchema), updateIntervention)

export default router
