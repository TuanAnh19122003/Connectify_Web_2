const express = require('express');
const router = express.Router();
const Follow = require('../models/Follow');

// Lấy tất cả theo dõi
router.get('/', async (req, res) => {
    try {
        const follows = await Follow.find().populate('follower_id').populate('following_id');
        res.json(follows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Tạo theo dõi mới
router.post('/', async (req, res) => {
    const follow = new Follow({
        follower_id: req.body.follower_id,
        following_id: req.body.following_id
    });

    try {
        const newFollow = await follow.save();
        res.status(201).json(newFollow);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Xóa theo dõi
router.delete('/:id', async (req, res) => {
    try {
        const follow = await Follow.findByIdAndDelete(req.params.id);
        if (!follow) return res.status(404).json({ message: 'Follow not found' });
        res.json({ message: 'Follow deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
