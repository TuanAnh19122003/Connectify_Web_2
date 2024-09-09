const express = require('express');
const router = express.Router();
const Post = require('../models/Post');

// Lấy tất cả bài viết
router.get('/', async (req, res) => {
    try {
        const posts = await Post.find().populate('user_id');
        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Tạo bài viết mới
router.post('/', async (req, res) => {
    const post = new Post({
        user_id: req.body.user_id,
        content: req.body.content,
        image: req.body.image
    });

    try {
        const newPost = await post.save();
        res.status(201).json(newPost);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Xóa bài viết
router.delete('/:id', async (req, res) => {
    try {
        const post = await Post.findByIdAndDelete(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });
        res.json({ message: 'Post deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
