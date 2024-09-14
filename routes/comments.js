const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const Post = require('../models/Post');
const User = require('../models/User');

// Lấy tất cả bình luận
router.get('/', async (req, res) => {
    try {
        const comments = await Comment.find()
            .populate({
                path: 'user_id',
                select: 'username',
                options: { strictPopulate: false }
            })
            .populate({
                path: 'post_id',
                select: 'title',
                options: { strictPopulate: false }
            })
        res.render('admin/comments/list', { comments });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Hiển thị chi tiết bình luận
router.get('/details/:id', async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id)
            .populate('user_id', 'username')
            .populate('post_id', 'title'); // Giả sử bạn muốn hiển thị tiêu đề bài viết

        if (!comment) return res.status(404).send('Comment not found');
        res.render('admin/comments/details', { comment });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});




// Hiển thị form thêm bình luận
router.get('/create', async (req, res) => {
    try {
        const posts = await Post.find({}, 'title'); // Lấy tất cả bài viết để chọn
        const users = await User.find({}, 'username'); // Lấy tất cả người dùng để chọn
        res.render('admin/comments/create', { posts, users });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Xử lý form thêm bình luận
router.post('/create', async (req, res) => {
    const { post_id, user_id, content } = req.body;

    const comment = new Comment({
        post_id,
        user_id,
        content
    });

    try {
        const newComment = await comment.save();
        res.redirect('/admin/comments'); // Chuyển hướng về danh sách bình luận
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Hiển thị form sửa bình luận
router.get('/edit/:id', async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id)
            .populate('post_id', 'title')
            .populate('user_id', 'username');

        if (!comment) return res.status(404).send('Comment not found');

        const posts = await Post.find({}, 'title');
        const users = await User.find({}, 'username');

        res.render('admin/comments/edit', { comment, posts, users });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Xử lý form sửa bình luận
router.post('/edit/:id', async (req, res) => {
    const { post_id, user_id, content } = req.body;

    try {
        const updatedComment = await Comment.findByIdAndUpdate(req.params.id, {
            post_id,
            user_id,
            content
        }, { new: true });

        if (!updatedComment) return res.status(404).send('Comment not found');

        res.redirect('/admin/comments'); // Chuyển hướng về danh sách bình luận
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});


// Xóa bình luận
// Hiển thị trang xác nhận xóa bình luận
router.get('/delete/:id', async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id)
            .populate('user_id', 'username') // Populate thông tin người dùng nếu cần
            .populate('post_id', 'title'); // Populate thông tin bài viết nếu cần

        if (!comment) return res.status(404).send('Bình luận không tìm thấy');

        res.render('admin/comments/delete', { comment });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Xử lý form xóa bình luận
router.post('/delete/:id', async (req, res) => {
    try {
        const comment = await Comment.findByIdAndDelete(req.params.id);
        if (!comment) return res.status(404).send('Bình luận không tìm thấy');
        res.redirect('/admin/comments'); // Chuyển hướng về danh sách bình luận
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


module.exports = router;
