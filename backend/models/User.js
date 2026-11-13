import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 60 },
  profileImage: { type: String, default: '' },
  username: { type: String, required: true, unique: true, sparse: true, lowercase: true, trim: true, minlength: 3, maxlength: 32 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false },
  passwordResetCodeHash: { type: String, select: false },
  passwordResetExpires: { type: Date, select: false },
  gender: { type: String, enum: ['Male', 'Female'], required: true },
  age: { type: Number, required: true, min: 18, max: 100 },
  weightKg: { type: Number, required: true, min: 30, max: 350 },
  heightCm: { type: Number, required: true, min: 120, max: 230 },
  experience: { type: String, enum: ['starting', '6-months', '2-years'], required: true },
  workoutFrequency: { type: String, enum: ['1-2', '3-5', 'daily'], required: true },
  goal: { type: String, enum: ['fat-loss', 'build-muscle', 'maintain-weight'], required: true },
  bmr: { type: Number, required: true },
  tdee: { type: Number, required: true },
  targetDailyCalories: { type: Number, required: true },
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  friendRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  sentFriendRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  featuredPhotos: { type: [String], default: [] }
}, { timestamps: true });

export default mongoose.model('User', userSchema);
