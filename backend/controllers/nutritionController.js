import MealLog from '../models/MealLog.js';

const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner'];
const FOOD_CATEGORIES = ['Rice', 'Ulam', 'Other'];

function validDateKey(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
}

export async function getDailyNutrition(req, res, next) {
  try {
    const dateKey = req.query.date || new Date().toISOString().slice(0, 10);
    if (!validDateKey(dateKey)) return res.status(400).json({ message: 'Date must use YYYY-MM-DD format.' });

    const meals = await MealLog.find({ user: req.user._id, dateKey }).sort({ createdAt: 1 }).lean();
    const caloriesConsumed = meals.reduce((total, meal) => total + meal.calories, 0);
    const targetCalories = req.user.targetDailyCalories;

    res.json({
      date: dateKey,
      targetCalories,
      caloriesConsumed,
      remainingCalories: targetCalories - caloriesConsumed,
      progressPercent: targetCalories > 0 ? Math.min(100, Math.round((caloriesConsumed / targetCalories) * 100)) : 0,
      meals
    });
  } catch (error) { next(error); }
}

export async function addMeal(req, res, next) {
  try {
    const { mealType, foodCategory = 'Other', name, calories, healthyChoice = false, date, photos = [] } = req.body;
    const dateKey = date || new Date().toISOString().slice(0, 10);
    const numericCalories = Number(calories);

    if (!MEAL_TYPES.includes(mealType)) return res.status(400).json({ message: 'Choose breakfast, lunch, or dinner.' });
    if (!FOOD_CATEGORIES.includes(foodCategory)) return res.status(400).json({ message: 'Choose Rice, Ulam, or Other.' });
    if (typeof name !== 'string' || !name.trim() || name.trim().length > 80) return res.status(400).json({ message: 'Meal name must be 1-80 characters.' });
    if (!Number.isInteger(numericCalories) || numericCalories < 1 || numericCalories > 10000) return res.status(400).json({ message: 'Calories must be a whole number from 1 to 10000.' });
    if (typeof healthyChoice !== 'boolean') return res.status(400).json({ message: 'Healthy choice must be true or false.' });
    if (!validDateKey(dateKey)) return res.status(400).json({ message: 'Date must use YYYY-MM-DD format.' });
    if (!Array.isArray(photos) || photos.length > 4 || photos.some(photo => typeof photo !== 'string' || !/^data:image\/(jpeg|png|webp);base64,/.test(photo) || photo.length > 1_500_000)) return res.status(400).json({ message: 'Add up to 4 photos, each under 1 MB.' });

    const meal = await MealLog.create({ user: req.user._id, dateKey, mealType, foodCategory, name: name.trim(), calories: numericCalories, healthyChoice, photos });
    res.status(201).json({ meal });
  } catch (error) { next(error); }
}

export async function removeMeal(req, res, next) {
  try {
    const meal = await MealLog.findOneAndDelete({ _id: req.params.mealId, user: req.user._id });
    if (!meal) return res.status(404).json({ message: 'Meal entry not found.' });
    res.json({ message: 'Meal removed.', id: meal._id });
  } catch (error) { next(error); }
}
