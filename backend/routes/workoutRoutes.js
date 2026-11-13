import { Router } from 'express';
import { getWorkouts } from '../controllers/workoutController.js';
import { protect } from '../middleware/auth.js';

const router = Router();
router.get('/', protect, getWorkouts);
export default router;
