const express = require('express');
const router = express.Router();
const Friendship = require('../models/Friendship');

// Lấy tất cả mối quan hệ bạn bè
router.get('/', async (req, res) => {
    try {
        const friendships = await Friendship.find().populate('user_id').populate('friend_id');
        res.json(friendships);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Tạo mối quan hệ bạn bè mới
router.post('/', async (req, res) => {
    const friendship = new Friendship({
        user_id: req.body.user_id,
        friend_id: req.body.friend_id,
        status: req.body.status
    });

    try {
        const newFriendship = await friendship.save();
        res.status(201).json(newFriendship);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Xóa mối quan hệ bạn bè
router.delete('/:id', async (req, res) => {
    try {
        const friendship = await Friendship.findByIdAndDelete(req.params.id);
        if (!friendship) return res.status(404).json({ message: 'Friendship not found' });
        res.json({ message: 'Friendship deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
