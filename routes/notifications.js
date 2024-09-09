const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');

// Lấy tất cả thông báo
router.get('/', async (req, res) => {
    try {
        const notifications = await Notification.find().populate('user_id');
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Tạo thông báo mới
router.post('/', async (req, res) => {
    const notification = new Notification({
        user_id: req.body.user_id,
        message: req.body.message,
        read: req.body.read
    });

    try {
        const newNotification = await notification.save();
        res.status(201).json(newNotification);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Xóa thông báo
router.delete('/:id', async (req, res) => {
    try {
        const notification = await Notification.findByIdAndDelete(req.params.id);
        if (!notification) return res.status(404).json({ message: 'Notification not found' });
        res.json({ message: 'Notification deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
