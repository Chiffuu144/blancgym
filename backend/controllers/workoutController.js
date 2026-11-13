import Workout from '../models/Workout.js';

export async function getWorkouts(req, res, next) {
  try {
    const category = ['gym', 'home', 'training'].includes(req.query.category) ? req.query.category : 'gym';
    const gender = req.user.gender;
    const levelByExperience = { starting: 'Beginner', '6-months': 'Intermediate', '2-years': 'Advanced' };
    const level = levelByExperience[req.user.experience] || 'Beginner';
    const workouts = await Workout.find({ category, level, dayOfWeek: { $exists: true }, gender: { $in: [gender, 'All'] } }).sort({ dayOfWeek: 1 }).lean();
    res.json({ category, gender, level, workouts });
  } catch (error) {
    next(error);
  }
}
