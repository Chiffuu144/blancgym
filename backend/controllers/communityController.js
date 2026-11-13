import mongoose from 'mongoose';
import User from '../models/User.js';
import Message from '../models/Message.js';
import CommunityPost from '../models/CommunityPost.js';
import CommunityStory from '../models/CommunityStory.js';

const friendCard = user => ({ id: user._id, username: user.username, name: user.name, profileImage: user.profileImage || '' });

async function areFriends(firstId, secondId) {
  const [first, second] = await Promise.all([
    User.exists({ _id: firstId, friends: secondId }),
    User.exists({ _id: secondId, friends: firstId })
  ]);
  return Boolean(first && second);
}

export async function getFriends(req, res, next) {
  try {
    const user = await User.findById(req.user._id).populate({ path: 'friends', select: 'username name profileImage' }).lean();
    res.json({ friends: (user?.friends || []).map(friendCard) });
  } catch (error) { next(error); }
}

export async function searchUsers(req, res, next) {
  try {
    const query = String(req.query.query || '').trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    if (query.length < 2) return res.json({ users: [] });
    const users = await User.find({
      _id: { $ne: req.user._id, $nin: req.user.friends || [] },
      username: { $regex: `^${query}`, $options: 'i' }
    }).select('username name profileImage').limit(12).lean();
    res.json({ users: users.map(friendCard) });
  } catch (error) { next(error); }
}

export async function addFriend(req, res, next) {
  try {
    const { userId } = req.params;
    if (!mongoose.isValidObjectId(userId) || String(req.user._id) === userId) return res.status(400).json({ message: 'Choose a valid account to add.' });
    const person = await User.findById(userId).select('username name profileImage');
    if (!person) return res.status(404).json({ message: 'That account could not be found.' });
    await Promise.all([
      User.updateOne({ _id: req.user._id }, { $addToSet: { friends: person._id } }),
      User.updateOne({ _id: person._id }, { $addToSet: { friends: req.user._id } })
    ]);
    res.json({ friend: friendCard(person) });
  } catch (error) { next(error); }
}

export async function removeFriend(req, res, next) {
  try {
    const { userId } = req.params;
    if (!mongoose.isValidObjectId(userId)) return res.status(400).json({ message: 'Choose a valid account.' });
    await Promise.all([
      User.updateOne({ _id: req.user._id }, { $pull: { friends: userId } }),
      User.updateOne({ _id: userId }, { $pull: { friends: req.user._id } })
    ]);
    res.json({ message: 'Friend removed.' });
  } catch (error) { next(error); }
}

export async function getMessages(req, res, next) {
  try {
    const { userId } = req.params;
    if (!mongoose.isValidObjectId(userId)) return res.status(400).json({ message: 'Choose a valid friend.' });
    if (!await areFriends(req.user._id, userId)) return res.status(403).json({ message: 'Add each other as friends before messaging.' });
    const messages = await Message.find({
      $or: [{ sender: req.user._id, recipient: userId }, { sender: userId, recipient: req.user._id }]
    }).sort({ createdAt: -1 }).limit(100).lean();
    res.json({ messages: messages.reverse() });
  } catch (error) { next(error); }
}

export async function sendMessage(req, res, next) {
  try {
    const { userId } = req.params;
    const text = typeof req.body.text === 'string' ? req.body.text.trim() : '';
    if (!mongoose.isValidObjectId(userId)) return res.status(400).json({ message: 'Choose a valid friend.' });
    if (!text || text.length > 2000) return res.status(400).json({ message: 'Message must be 1 to 2,000 characters.' });
    if (!await areFriends(req.user._id, userId)) return res.status(403).json({ message: 'Add each other as friends before messaging.' });
    const message = await Message.create({ sender: req.user._id, recipient: userId, text });
    res.status(201).json({ message: message.toObject() });
  } catch (error) { next(error); }
}

const imageDataUrl = value => typeof value === 'string' && /^data:image\/(jpeg|png|webp);base64,/.test(value) && value.length <= 1_500_000;
const postAuthors = user => [user._id, ...(user.friends || [])];

async function findVisiblePost(user, postId) {
  if (!mongoose.isValidObjectId(postId)) return null;
  return CommunityPost.findOne({ _id: postId, author: { $in: postAuthors(user) } });
}

export async function getFeed(req, res, next) {
  try {
    const posts = await CommunityPost.find({ author: { $in: postAuthors(req.user) } })
      .sort({ createdAt: -1 }).limit(50)
      .populate('author', 'username name profileImage')
      .populate('reactions.user', 'username name profileImage')
      .populate('comments.author', 'username name profileImage')
      .lean();
    res.json({ posts });
  } catch (error) { next(error); }
}

export async function createPost(req, res, next) {
  try {
    const text = typeof req.body.text === 'string' ? req.body.text.trim() : '';
    const images = req.body.images ?? [];
    if (text.length > 1000) return res.status(400).json({ message: 'Post text must be 1,000 characters or fewer.' });
    if (!Array.isArray(images) || images.length > 4 || images.some(image => !imageDataUrl(image))) return res.status(400).json({ message: 'Add up to 4 JPG, PNG, or WebP photos.' });
    if (!text && !images.length) return res.status(400).json({ message: 'Write something or add a photo to post.' });
    const post = await CommunityPost.create({ author: req.user._id, text, images });
    await post.populate('author', 'username name profileImage');
    res.status(201).json({ post });
  } catch (error) { next(error); }
}

export async function deletePost(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.postId)) return res.status(400).json({ message: 'Choose a valid post.' });
    const post = await CommunityPost.findOneAndDelete({ _id: req.params.postId, author: req.user._id });
    if (!post) return res.status(404).json({ message: 'Your post could not be found.' });
    res.json({ message: 'Post removed.' });
  } catch (error) { next(error); }
}

export async function reactToPost(req, res, next) {
  try {
    const { reaction } = req.body;
    if (!['like', 'heart', 'sad', 'angry', 'haha'].includes(reaction)) return res.status(400).json({ message: 'Choose a reaction.' });
    const post = await findVisiblePost(req.user, req.params.postId);
    if (!post) return res.status(404).json({ message: 'This post is no longer available to you.' });
    const existing = post.reactions.find(item => String(item.user) === String(req.user._id));
    if (existing?.type === reaction) post.reactions.pull(existing._id);
    else if (existing) existing.type = reaction;
    else post.reactions.push({ user: req.user._id, type: reaction });
    await post.save();
    await post.populate('author', 'username name profileImage');
    await post.populate('reactions.user', 'username name profileImage');
    await post.populate('comments.author', 'username name profileImage');
    res.json({ post });
  } catch (error) { next(error); }
}

export async function addPostComment(req, res, next) {
  try {
    const text = typeof req.body.text === 'string' ? req.body.text.trim() : '';
    if (!text || text.length > 500) return res.status(400).json({ message: 'Comment must be 1 to 500 characters.' });
    const post = await findVisiblePost(req.user, req.params.postId);
    if (!post) return res.status(404).json({ message: 'This post is no longer available to you.' });
    if (post.comments.length >= 200) return res.status(400).json({ message: 'This post has reached its comment limit.' });
    post.comments.push({ author: req.user._id, text });
    await post.save();
    await post.populate('author', 'username name profileImage');
    await post.populate('reactions.user', 'username name profileImage');
    await post.populate('comments.author', 'username name profileImage');
    res.status(201).json({ post });
  } catch (error) { next(error); }
}

export async function getStories(req, res, next) {
  try {
    const stories = await CommunityStory.find({ author: { $in: postAuthors(req.user) }, expiresAt: { $gt: new Date() } })
      .sort({ createdAt: 1 }).populate('author', 'username name profileImage').lean();
    res.json({ stories });
  } catch (error) { next(error); }
}

export async function createStory(req, res, next) {
  try {
    const caption = typeof req.body.caption === 'string' ? req.body.caption.trim() : '';
    const image = req.body.image || '';
    if (caption.length > 240) return res.status(400).json({ message: 'Story caption must be 240 characters or fewer.' });
    if (image && !imageDataUrl(image)) return res.status(400).json({ message: 'Add a JPG, PNG, or WebP photo.' });
    if (!caption && !image) return res.status(400).json({ message: 'Add a photo or a short update to your story.' });
    const story = await CommunityStory.create({ author: req.user._id, caption, image, expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) });
    await story.populate('author', 'username name profileImage');
    res.status(201).json({ story });
  } catch (error) { next(error); }
}
