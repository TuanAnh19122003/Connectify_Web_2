const express = require('express');
const router = express.Router();
const Like = require('../models/Like');

// Lấy tất cả lượt thích
router.get('/', async (req, res) => {
    try {
        const likes = await Like.find().populate('user_id').populate('post_id').populate('comment_id');
        res.json(likes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Tạo lượt thích mới
router.post('/', async (req, res) => {
    const like = new Like({
        user_id: req.body.user_id,
        post_id: req.body.post_id,
        comment_id: req.body.comment_id
    });

    try {
        const newLike = await like.save();
        res.status(201).json(newLike);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Xóa lượt thích
router.delete('/:id', async (req, res) => {
    try {
        const like = await Like.findByIdAndDelete(req.params.id);
        if (!like) return res.status(404).json({ message: 'Like not found' });
        res.json({ message: 'Like deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
