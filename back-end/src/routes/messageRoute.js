const express = require('express')
const { protectRoute } = require('../middlewares/authMiddleware')
const { getUserForSidebar, getMessages, sendMessages } = require('../controllers/messageController')

const messageRouter = express.Router()

messageRouter.get('/users',protectRoute,getUserForSidebar)
messageRouter.get('/:id',protectRoute,getMessages)

messageRouter.post('/send/:id',protectRoute,sendMessages)

module.exports = messageRouter