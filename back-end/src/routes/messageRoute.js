import express from 'express';
import { protectRoute } from '../middlewares/authMiddleware.js';
import { getUserForSidebar, getMessages, sendMessages } from '../controllers/messageController.js';

const messageRouter = express.Router();

messageRouter.get('/users', protectRoute, getUserForSidebar);
messageRouter.get('/:id', protectRoute, getMessages);

messageRouter.post('/send/:id', protectRoute, sendMessages);

export default messageRouter;
