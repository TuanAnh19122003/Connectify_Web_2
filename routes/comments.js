const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');

// Lấy tất cả bình luận
router.get('/', async (req, res) => {
    try {
        const comments = await Comment.find().populate('user_id').populate('post_id');
        res.json(comments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Tạo bình luận mới
router.post('/', async (req, res) => {
    const comment = new Comment({
        post_id: req.body.post_id,
        user_id: req.body.user_id,
        content: req.body.content
    });

    try {
        const newComment = await comment.save();
        res.status(201).json(newComment);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Xóa bình luận
router.delete('/:id', async (req, res) => {
    try {
        const comment = await Comment.findByIdAndDelete(req.params.id);
        if (!comment) return res.status(404).json({ message: 'Comment not found' });
        res.json({ message: 'Comment deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
