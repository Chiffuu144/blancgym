import mongoose from 'mongoose';

const mealLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  dateKey: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
  mealType: { type: String, enum: ['Breakfast', 'Lunch', 'Dinner'], required: true },
  foodCategory: { type: String, enum: ['Rice', 'Ulam', 'Other'], default: 'Other' },
  name: { type: String, required: true, trim: true, maxlength: 80 },
  calories: { type: Number, required: true, min: 1, max: 10000 },
  proteinGrams: { type: Number, default: 0, min: 0, max: 300 },
  healthyChoice: { type: Boolean, default: false },
  photos: { type: [String], default: [] }
}, { timestamps: true });

mealLogSchema.index({ user: 1, dateKey: 1, createdAt: 1 });

export default mongoose.model('MealLog', mealLogSchema);
