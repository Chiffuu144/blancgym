import { readFileSync } from 'node:fs';
import Workout from '../models/Workout.js';

const plans = JSON.parse(readFileSync(new URL('./workoutPlans.json', import.meta.url), 'utf8'));
const categories = { 'At the Gym': 'gym', 'At Home': 'home', Stretching: 'training' };
const durations = { gym: '40 min', home: '30 min', training: '20 min' };

function visualFor(name) {
  const text = name.toLowerCase();
  if (/dead bug/.test(text)) return 'dead-bug';
  if (/squat|sit.to.stand/.test(text)) return 'squat';
  if (/hinge|deadlift|good morning/.test(text)) return 'hinge';
  if (/lunge|split squat|step.up/.test(text)) return 'lunge';
  if (/push.up|pushup|press|pushdown|extension|raise/.test(text)) return 'press';
  if (/row|pulldown|pull.up|curl|face pull/.test(text)) return 'row';
  if (/bridge|thrust/.test(text)) return 'bridge';
  if (/plank|crunch|bird.dog|hollow/.test(text)) return 'plank';
  if (/march|walk|jump|jog|step/.test(text)) return 'march';
  return 'stretch';
}

function cueFor(name, visual) {
  const cues = {
    squat: 'Keep your chest lifted and knees tracking over your toes. Lower only as far as feels comfortable.',
    hinge: 'Push your hips back with a soft bend in the knees, keep your back long, then stand tall.',
    lunge: 'Take a steady step, keep your front knee comfortable, and use support if you need balance.',
    press: 'Move with control, keep your wrists steady, and avoid locking your elbows.',
    row: 'Keep your shoulders relaxed and pull your elbows back without leaning or swinging.',
    bridge: 'Keep your feet grounded, gently lift your hips, and avoid arching your lower back.',
    plank: 'Keep your body long and breathe steadily. Choose a variation that feels comfortable.',
    'dead-bug': 'Keep your back gently grounded and move one arm and the opposite leg slowly.',
    march: 'Stand tall, move at an easy pace, and keep each step controlled.',
    stretch: 'Move gently into a comfortable range and breathe normally. Do not force the stretch.'
  };
  return cues[visual] || `Move ${name.toLowerCase()} slowly and with control. Stop if anything hurts.`;
}

const workouts = plans.flatMap(plan => {
  const category = categories[plan.category];
  return plan.levels.flatMap(level => level.schedule.map(day => ({
    seedKey: `schedule:${category}:${level.level.toLowerCase()}:${day.day.toLowerCase()}`,
    title: day.isRestDay ? 'Rest & recover' : `${day.targetArea} session`,
    description: day.isRestDay
      ? 'Take a rest day. Gentle walking or light mobility is optional; recovery is part of the plan.'
      : `${day.day} · ${day.targetArea}. Follow the exercises at a pace and range that feel right for you.`,
    category,
    dayOfWeek: day.day,
    isRestDay: day.isRestDay,
    targetArea: day.targetArea,
    muscleGroup: day.targetArea,
    gender: 'All',
    level: level.level,
    visual: day.exercises.length ? visualFor(day.exercises[0].name) : 'stretch',
    duration: day.isRestDay ? 'Rest day' : durations[category],
    equipment: [],
    exercises: day.exercises.map(exercise => {
      const visual = visualFor(exercise.name);
      return {
        name: exercise.name,
        sets: `${exercise.sets} sets`,
        repsOrDuration: exercise.repsOrDuration,
        youtubeLink: exercise.youtubeLink,
        cue: cueFor(exercise.name, visual),
        visual
      };
    })
  })));
});

export default async function seedWorkouts() {
  const operations = workouts.map(workout => ({
    updateOne: {
      filter: { seedKey: workout.seedKey },
      update: { $set: workout },
      upsert: true
    }
  }));
  await Workout.bulkWrite(operations, { ordered: false });
  console.log(`Loaded ${workouts.length} level-based weekly workout sessions.`);
}
