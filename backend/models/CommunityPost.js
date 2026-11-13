import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true, trim: true, maxlength: 500 }
}, { timestamps: true });

const reactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['like', 'heart', 'sad', 'angry', 'haha'], required: true }
}, { timestamps: true });

const postSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  text: { type: String, trim: true, maxlength: 1000, default: '' },
  images: { type: [String], default: [] },
  reactions: { type: [reactionSchema], default: [] },
  comments: { type: [commentSchema], default: [] }
}, { timestamps: true });

postSchema.index({ author: 1, createdAt: -1 });

export default mongoose.model('CommunityPost', postSchema);
