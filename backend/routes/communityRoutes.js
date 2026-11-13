import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { addFriend, getFriends, getMessages, removeFriend, searchUsers, sendMessage } from '../controllers/communityController.js';

const router = Router();
router.use(protect);
router.get('/friends', getFriends);
router.get('/users', searchUsers);
router.put('/friends/:userId', addFriend);
router.delete('/friends/:userId', removeFriend);
router.get('/messages/:userId', getMessages);
router.post('/messages/:userId', sendMessage);
export default router;
