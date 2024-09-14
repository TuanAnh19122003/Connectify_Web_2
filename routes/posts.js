const express = require('express');
const router = express.Router();
const { format } = require('date-fns');
const multer = require('multer');
const path = require('path');
const Post = require('../models/Post');
const User = require('../models/User');

// Cấu hình multer để lưu trữ ảnh
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Tạo tên duy nhất cho ảnh
    }
});

const upload = multer({ storage });

// Lấy tất cả bài viết
router.get('/', async (req, res) => {
    try {
        const posts = await Post.find()
            .populate({
                path: 'user_id',
                select: 'username',
                options: { strictPopulate: false }
            })

        res.render('admin/posts/list', { posts });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

//Chi tiết bài đăng
router.get('/details/:id', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).send('Post not found');
        // Định dạng ngày giờ
        post.created_at = format(post.created_at, 'dd/MM/yyyy HH:mm:ss');
        post.updated_at = format(post.updated_at, 'dd/MM/yyyy HH:mm:ss');
        res.render('admin/posts/details', { post });
    } catch (err) {
      res.status(500).send(err.message);
    }
});


router.get('/create', async (req, res) => {
    try {
        // Lấy danh sách tất cả người dùng
        const users = await User.find({}, 'username');
        res.render('admin/posts/create', { users });
    } catch (error) {
        // Xử lý lỗi nếu có
        res.status(500).json({ message: error.message });
    }
});

// Tạo người dùng mới
router.post('/create', upload.single('image'), async (req, res) => {
    try {
        // Mã hóa mật khẩu

        const post = new Post({
            user_id: req.body.username,
            content: req.body.content,
            image: req.file ? `uploads/${req.file.filename}` : null,
            like_count: req.body.like_count
        });

        await post.save();
        res.redirect('/admin/posts');
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.get('/edit/:id', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id).populate('user_id')
        if (!post) return res.status(404).send('Post not found');
        const users = await User.find({}, 'username');
        res.render('admin/posts/edit', { post, users });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Cập nhật bài đăng
router.post('/edit/:id', upload.single('image'), async (req, res) => {
    try {
        // Tạo đối tượng cập nhật
        const updates = {
            user_id: req.body.username,
            content: req.body.content,
            like_count: req.body.like_count,
            updated_at: Date.now()
        };

        // Nếu có ảnh mới, cập nhật đường dẫn của ảnh
        if (req.file) {
            updates.image = `uploads/${req.file.filename}`;
        }

        // Cập nhật người dùng
        const post = await Post.findByIdAndUpdate(req.params.id, updates, { new: true });
        if (!post) return res.status(404).send('User not found');

        // Điều hướng đến danh sách người dùng sau khi cập nhật
        res.redirect('/admin/posts');
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Xóa bài đăng
router.get('/delete/:id', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
            .populate('user_id', 'username')  
            if (!post) return res.status(404).send('Phân quyền không tìm thấy');

            res.render('admin/posts/delete', { post });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

router.post('/delete/:id', async (req, res) => {
    try {
        const post = await Post.findByIdAndDelete(req.params.id);
        if (!post) return res.status(404).send('Phân quyền không tìm thấy');
        res.redirect('/admin/posts');
    } catch (err) {
        res.status(500).send(err.message);
    }
});


module.exports = router;
