import mongoose from 'mongoose';

const storySchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  caption: { type: String, trim: true, maxlength: 240, default: '' },
  image: { type: String, default: '' },
  expiresAt: { type: Date, required: true, index: { expires: 0 } }
}, { timestamps: true });

storySchema.index({ author: 1, createdAt: -1 });

export default mongoose.model('CommunityStory', storySchema);
