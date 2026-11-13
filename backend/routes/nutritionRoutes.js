import { Router } from 'express';
import { addMeal, getDailyNutrition, removeMeal } from '../controllers/nutritionController.js';
import { protect } from '../middleware/auth.js';

const router = Router();
router.use(protect);
router.get('/', getDailyNutrition);
router.post('/meals', addMeal);
router.delete('/meals/:mealId', removeMeal);
export default router;
