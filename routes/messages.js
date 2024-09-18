const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User');

router.get('/', async (req, res) => {
    try {
        const messages = await Message.find()
            .populate({
                path: 'sender_id',
                select: 'username',
                options: { strictPopulate: false }
            })
            .populate({
                path: 'receiver_id',
                select: 'username',
                options: { strictPopulate: false }
            })
        res.render('admin/messages/list', { messages });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Hiển thị chi tiết tin nhắn
router.get('/details/:id', async (req, res) => {
    try {
        const message = await Message.findById(req.params.id)
            .populate('sender_id', 'username')
            .populate('receiver_id', 'username');

        if (!message) return res.status(404).send('message not found');
        res.render('admin/messages/details', { message });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Hiển thị form thêm tin nhắn
router.get('/create', async (req, res) => {
    try {
        const users = await User.find({}, 'username');
        res.render('admin/messages/create', { users });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Tạo tin nhắn mới
router.post('/create', async (req, res) => {
    try {
        const { sender_id, receiver_id, content } = req.body;
        const message = new Message({
            sender_id,
            receiver_id,
            content
        });
        await message.save();
        res.redirect('/admin/messages'); // Chuyển hướng về danh sách tin nhắn sau khi tạo
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});


// Hiển thị trang cập nhật tin nhắn
router.get('/edit/:id', async (req, res) => {
    try {
        const message = await Message.findById(req.params.id)
            .populate('sender_id', 'username')
            .populate('receiver_id', 'username');

        if (!message) return res.status(404).send('Message not found');
        const users = await User.find({}, 'username');
        res.render('admin/messages/edit', { message, users });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Cập nhật tin nhắn
router.post('/edit/:id', async (req, res) => {
    try {
        const { sender_id, receiver_id, content } = req.body;
        const message = await Message.findById(req.params.id);

        if (!message) return res.status(404).json({ message: 'Message not found' });

        message.sender_id = sender_id;
        message.receiver_id = receiver_id;
        message.content = content;

        await message.save();

        res.redirect('/admin/messages'); 
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});



// Xóa tin nhắn
router.get('/delete/:id', async (req, res) => {
    try {
        const message = await Message.findById(req.params.id)
            .populate('sender_id', 'username')
            .populate('receiver_id', 'username');

        if (!message) return res.status(404).send('Message not found');
        const users = await User.find({}, 'username');
        res.render('admin/messages/delete', { message, users });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Xử lý form xóa bình luận
router.post('/delete/:id', async (req, res) => {
    try {
        const message = await Message.findByIdAndDelete(req.params.id);
        if (!message) return res.status(404).json({ message: 'Message not found' });
        res.redirect('/admin/messages'); // Chuyển hướng về danh sách bình luận
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
