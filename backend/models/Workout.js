import mongoose from 'mongoose';

const workoutSchema = new mongoose.Schema({
  seedKey: { type: String, unique: true, sparse: true, select: false },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, enum: ['gym', 'home', 'training'], required: true },
  dayOfWeek: { type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] },
  muscleGroup: String,
  targetArea: String,
  isRestDay: { type: Boolean, default: false },
  visual: { type: String, default: 'squat' },
  gender: { type: String, enum: ['Male', 'Female', 'All'], default: 'All' },
  level: { type: String, default: 'All levels' },
  duration: String,
  equipment: [String],
  exercises: [{ name: String, sets: String, repsOrDuration: String, youtubeLink: String, cue: String, visual: String }]
}, { timestamps: true });

export default mongoose.model('Workout', workoutSchema);
