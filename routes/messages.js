const express = require('express');
const router = express.Router();
const Message = require('../models/Message');

// Lấy tất cả tin nhắn
router.get('/', async (req, res) => {
    try {
        const messages = await Message.find().populate('sender_id').populate('receiver_id');
        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Tạo tin nhắn mới
router.post('/', async (req, res) => {
    const message = new Message({
        sender_id: req.body.sender_id,
        receiver_id: req.body.receiver_id,
        content: req.body.content
    });

    try {
        const newMessage = await message.save();
        res.status(201).json(newMessage);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Xóa tin nhắn
router.delete('/:id', async (req, res) => {
    try {
        const message = await Message.findByIdAndDelete(req.params.id);
        if (!message) return res.status(404).json({ message: 'Message not found' });
        res.json({ message: 'Message deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
