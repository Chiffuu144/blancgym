const ACTIVITY_FACTORS = {
  '1-2': 1.375,
  '3-5': 1.55,
  daily: 1.725
};

const GOAL_FACTORS = {
  'fat-loss': 0.9,
  'build-muscle': 1.1,
  'maintain-weight': 1
};

export function calculateDailyCalories({ gender, age, weightKg, heightCm, workoutFrequency, goal }) {
  const activityFactor = ACTIVITY_FACTORS[workoutFrequency];
  const goalFactor = GOAL_FACTORS[goal];
  if (!activityFactor || !goalFactor || !['Male', 'Female'].includes(gender)) {
    throw new Error('Invalid profile values for calorie calculation.');
  }

  const bmr = gender === 'Male'
    ? 88.362 + (13.397 * weightKg) + (4.799 * heightCm) - (5.677 * age)
    : 447.593 + (9.247 * weightKg) + (3.098 * heightCm) - (4.330 * age);
  const tdee = Math.round(bmr * activityFactor);

  return {
    bmr: Math.round(bmr),
    tdee,
    targetDailyCalories: Math.round(tdee * goalFactor)
  };
}
