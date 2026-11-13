import mongoose from 'mongoose';
import User from '../models/User.js';
import Message from '../models/Message.js';

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
