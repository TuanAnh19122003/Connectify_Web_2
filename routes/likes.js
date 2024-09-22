const express = require('express');
const router = express.Router();
const Like = require('../models/Like');
const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');

// Lấy tất cả lượt thích
router.get('/', async (req, res) => {
    const page = parseInt(req.query.page) || 1; // Trang hiện tại, mặc định là 1
    const limit = 5; // Số lượng dữ liệu mỗi trang
    const skip = (page - 1) * limit; // Tính toán số lượng mục cần bỏ qua
    try {
        const likes = await Like.find()
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
            .populate({
                path: 'comment_id',
                select: 'content',
                options: { strictPopulate: false }
            }).skip(skip).limit(limit);
            const totalUsers = await Like.countDocuments();
            const totalPages = Math.ceil(totalUsers / limit); // Tổng số trang

        res.render('admin/likes/list', { 
            likes,
            currentPage: page,
            totalPages  
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Hiển thị chi tiết lượt thích
router.get('/details/:id', async (req, res) => {
    try {
        const like = await Like.findById(req.params.id)
            .populate('user_id', 'username')
            .populate('post_id', 'title')
            .populate('comment_id', 'content');

        if (!like) return res.status(404).send('Phân quyền không tìm thấy');

        res.render('admin/likes/details', { like });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Hiển thị trang tạo lượt thích
router.get('/create', async (req, res) => {
    try {
        const users = await User.find({}, 'username');
        const posts = await Post.find({}, 'title');
        const comments = await Comment.find({}, 'content');
        const type = ['post', 'comment'];

        // Render trang tạo phân quyền và truyền danh sách người dùng và vai trò vào view
        res.render('admin/likes/create', { users, posts, comments, type });
    } catch (error) {
        // Xử lý lỗi nếu có
        res.status(500).json({ message: error.message });
    }
});
//Tạo lượt thích mới
router.post('/create', async (req, res) => {
    try {
        const { user_id, post_id, comment_id, type } = req.body;

        // Tạo đối tượng Like dựa trên loại
        const likeData = {
            user_id,
            type
        };

        if (type === 'post') {
            likeData.post_id = post_id;
        } else if (type === 'comment') {
            likeData.comment_id = comment_id;
        }

        const like = new Like(likeData);
        await like.save();

        // Chuyển hướng về trang danh sách phân quyền sau khi tạo thành công
        res.redirect('/admin/likes');
    } catch (error) {
        // Xử lý lỗi nếu có
        res.status(400).json({ message: error.message });
    }
});
// Hiển thị trang chỉnh sửa lượt thích
router.get('/edit/:id', async (req, res) => {
    try {
        // Tìm lượt thích theo ID và populate các trường liên quan
        const like = await Like.findById(req.params.id)
            .populate('user_id', 'username')
            .populate('post_id', 'title')
            .populate('comment_id', 'content');

        // Lấy danh sách người dùng, bài đăng và bình luận
        const users = await User.find({}, 'username');
        const posts = await Post.find({}, 'title');
        const comments = await Comment.find({}, 'content');
        const types = ['post', 'comment'];

        // Render view với dữ liệu
        res.render('admin/likes/edit', { like, users, posts, comments, types });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// Cập nhật lượt thích
router.post('/edit/:id', async (req, res) => {
    try {
        const { user_id, post_id, comment_id, type } = req.body;
        const like = await Like.findById(req.params.id);

        like.user_id = user_id;
        like.type = type;

        if (type === 'post') {
            like.post_id = post_id;
            like.comment_id = null;
        } else if (type === 'comment') {
            like.comment_id = comment_id;
            like.post_id = null;
        }

        await like.save();

        res.redirect('/admin/likes');
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Xóa vai trò
router.get('/delete/:id', async (req, res) => {
    try {
        const like = await Like.findById(req.params.id)
            .populate('user_id', 'username')
            .populate('post_id', 'title')
            .populate('comment_id', 'content');
            if (!like) return res.status(404).send('Phân quyền không tìm thấy');

            res.render('admin/likes/delete', { like });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

router.post('/delete/:id', async (req, res) => {
    try {
        const like = await Like.findByIdAndDelete(req.params.id);
        if (!like) return res.status(404).send('Phân quyền không tìm thấy');
        res.redirect('/admin/likes');
    } catch (err) {
        res.status(500).send(err.message);
    }
});

module.exports = router;
