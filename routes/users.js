const express = require('express');
const router = express.Router();
const User = require('../models/User');
const multer = require('multer');
const bcrypt = require('bcrypt');
const path = require('path');
const { format } = require('date-fns');
const { ensureAuthenticated } = require('../views/auth/middleware/middleware');

const saltRounds = 10; // Bạn có thể điều chỉnh số vòng salt



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

// Cập nhật trạng thái người dùng
router.post('/update-status/:id', async (req, res) => {
    try {
        const { status } = req.body;
        if (!['active', 'blocked'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status value' });
        }

        const user = await User.findByIdAndUpdate(req.params.id, { status }, { new: true });
        if (!user) return res.status(404).send('User not found');

        res.json(user);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Lấy tất cả người dùng
router.get('/',ensureAuthenticated,async (req, res) => {
    try {
        const users = await User.find();
        res.render('admin/users/list', { users });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

//Chi tiết người dùng
router.get('/details/:id', ensureAuthenticated, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).send('User not found');
        // Định dạng ngày giờ
        user.created_at = format(user.created_at, 'dd/MM/yyyy HH:mm:ss');
        user.updated_at = format(user.updated_at, 'dd/MM/yyyy HH:mm:ss');
        res.render('admin/users/details', { user });
    } catch (err) {
      res.status(500).send(err.message);
    }
});

router.get('/create', (req, res) => {
    res.render('admin/users/create');
});

// Tạo người dùng mới
router.post('/create', upload.single('profile_picture'), async (req, res) => {
    try {
        // Mã hóa mật khẩu
        const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);

        const user = new User({
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword, // Sử dụng mật khẩu đã mã hóa
            profile_picture: req.file ? `uploads/${req.file.filename}` : null,
            bio: req.body.bio
        });

        await user.save();
        res.redirect('/admin/users');
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Hiển thị trang chỉnh sửa người dùng
router.get('/edit/:id',ensureAuthenticated ,async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).send('User not found');
        res.render('admin/users/edit', { user });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Cập nhật người dùng
router.post('/edit/:id', upload.single('profile_picture'), async (req, res) => {
    try {
        // Mã hóa mật khẩu nếu có
        const hashedPassword = req.body.password ? await bcrypt.hash(req.body.password, saltRounds) : null;

        // Tạo đối tượng cập nhật
        const updates = {
            username: req.body.username,
            email: req.body.email,
            bio: req.body.bio,
            status: req.body.status,
            updated_at: Date.now()
        };

        // Nếu có ảnh mới, cập nhật đường dẫn của ảnh
        if (req.file) {
            updates.profile_picture = `uploads/${req.file.filename}`;
        }

        // Nếu mật khẩu được cung cấp, cập nhật mật khẩu đã mã hóa
        if (hashedPassword) {
            updates.password = hashedPassword;
        }

        // Cập nhật người dùng
        const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true });
        if (!user) return res.status(404).send('User not found');

        // Điều hướng đến danh sách người dùng sau khi cập nhật
        res.redirect('/admin/users');
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.get('/delete/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).send('User not found');
        res.render('admin/users/delete', { user });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Xóa người dùng
router.post('/delete/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).send('User not found');
        res.redirect('/admin/users'); // Điều hướng đến danh sách người dùng
    } catch (error) {
        res.status(500).send(error.message);
    }
});



module.exports = router;
