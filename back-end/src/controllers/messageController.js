import User from '../models/userModel.js';
import Message from '../models/messageModel.js';
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from '../lib/socket.js';

export const getUserForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select('-password');
    res.status(200).json(filteredUsers);
  } catch (error) {
    console.log("error in getUserForSidebar function of messageController file ", error.message);
    res.status(500).json({ error: 'internal server error' });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: anotherUserId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: anotherUserId },
        { senderId: anotherUserId, receiverId: myId }
      ]
    });

    res.status(200).json(messages);
  } catch (error) {
    console.log("error in getMessages function of messageController file ", error.message);
    res.status(500).json({ error: 'internal server error' });
  }
};

export const sendMessages = async (req, res) => {
  try {
    const { text, image, file } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let imageUrl;
    let fileUrl;

    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    if (file) {
      const fileUploadResponse = await cloudinary.uploader.upload(file, {
        resource_type: 'raw'
      });
      fileUrl = fileUploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
      file: fileUrl,
    });

    await newMessage.save();

    // Real-time functionality with socket.io
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('newMessage', newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("error in sendMessages function of messageController file ", error.message);
    res.status(500).json({ error: 'internal server error' });
  }
};
