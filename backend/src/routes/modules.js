import { Router } from 'express'
import { listModules, getModuleMarks } from '../controllers/moduleController.js'

const router = Router()

router.get('/', listModules)
router.get('/:moduleId/marks', getModuleMarks)

export default router
