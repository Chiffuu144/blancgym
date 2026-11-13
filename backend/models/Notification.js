import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['friend_request', 'friend_accepted', 'post_reaction', 'post_comment'], required: true },
  post: { type: mongoose.Schema.Types.ObjectId, ref: 'CommunityPost', default: null },
  message: { type: String, required: true, maxlength: 180 },
  readAt: { type: Date, default: null }
}, { timestamps: true });

notificationSchema.index({ recipient: 1, createdAt: -1 });
export default mongoose.model('Notification', notificationSchema);
