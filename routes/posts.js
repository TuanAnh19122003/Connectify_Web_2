const express = require('express');
const router = express.Router();
const { format } = require('date-fns');
const multer = require('multer');
const path = require('path');
const Post = require('../models/Post');
const User = require('../models/User');
const fs = require('fs');

// Cấu hình multer để lưu trữ ảnh
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Tạo tên duy nhất cho ảnh
    }
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Chỉ cho phép tải lên ảnh'), false);
        }
    }
});


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
router.post('/create', upload.array('images', 10), async (req, res) => {
    try {
        // Mã hóa mật khẩu

        const post = new Post({
            user_id: req.body.username,
            title: req.body.title,
            content: req.body.content,
            images: req.files.map(file => `uploads/${file.filename}`),
            like_count: req.body.like_count
        });

        await post.save();
        res.redirect('/admin/posts');
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.get('/delete-image/:id', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).send('Bài đăng không tìm thấy');

        // Xóa ảnh từ hệ thống tập tin
        const imagePath = path.join(__dirname, '../public', req.query.image);
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
        }

        // Xóa ảnh khỏi cơ sở dữ liệu
        post.images = post.images.filter(img => img !== req.query.image);
        await post.save();

        res.redirect(`/admin/posts/edit/${post._id}`);
    } catch (error) {
        res.status(500).send(error.message);
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
router.post('/edit/:id', upload.array('images', 10), async (req, res) => {
    try {
        // Lấy bài đăng hiện tại
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).send('Bài đăng không tìm thấy');

        // Cập nhật thông tin bài đăng
        const updates = {
            user_id: req.body.username,
            content: req.body.content,
            title: req.body.title,
            like_count: req.body.like_count,
            updated_at: Date.now()
        };

        // Cập nhật ảnh mới nếu có
        if (req.files && req.files.length > 0) {
            updates.images = post.images.concat(req.files.map(file => `uploads/${file.filename}`));
        } else {
            updates.images = post.images;
        }

        // Cập nhật bài đăng
        await Post.findByIdAndUpdate(req.params.id, updates, { new: true });

        // Điều hướng đến danh sách bài đăng sau khi cập nhật
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
