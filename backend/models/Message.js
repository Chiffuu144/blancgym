import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  text: { type: String, trim: true, maxlength: 2000, default: '' },
  media: {
    url: { type: String, trim: true },
    publicId: { type: String, trim: true },
    resourceType: { type: String, enum: ['image', 'video'] },
    format: { type: String, trim: true }
  }
}, { timestamps: true });

messageSchema.pre('validate', function validateMessage(next) {
  if (!this.text?.trim() && !this.media?.url) return next(new Error('A message must include text or an attachment.'));
  next();
});

messageSchema.index({ sender: 1, recipient: 1, createdAt: -1 });

export default mongoose.model('Message', messageSchema);
