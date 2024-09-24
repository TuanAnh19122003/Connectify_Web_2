const express = require('express');
const router = express.Router();
const User = require('../models/User');
const multer = require('multer');
const bcrypt = require('bcrypt');
const path = require('path');
const { format } = require('date-fns');

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
router.get('/',async (req, res) => {
    const page = parseInt(req.query.page) || 1; // Trang hiện tại, mặc định là 1
    const limit = 5; // Số lượng dữ liệu mỗi trang
    const skip = (page - 1) * limit; // Tính toán số lượng mục cần bỏ qua
    try {
        const users = await User.find().skip(skip).limit(limit);
        const totalUsers = await User.countDocuments(); // Tổng số người dùng
        const totalPages = Math.ceil(totalUsers / limit); // Tổng số trang

        res.render('admin/users/list', {
            users,
            currentPage: page,
            totalPages
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

//Chi tiết người dùng
router.get('/details/:id', async (req, res) => {
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
            bio: req.body.bio,
            phone_number: req.body.phone_number, // Thêm trường số điện thoại
            date_of_birth: req.body.date_of_birth ? new Date(req.body.date_of_birth) : null, // Thêm trường ngày sinh
            gender: req.body.gender, // Thêm trường giới tính
            address: req.body.address // Thêm trường địa chỉ
        });

        await user.save();
        res.redirect('/admin/users');
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Hiển thị trang chỉnh sửa người dùng
router.get('/edit/:id' ,async (req, res) => {
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
        // Tạo đối tượng cập nhật
        const updates = {
            username: req.body.username,
            email: req.body.email,
            bio: req.body.bio,
            status: req.body.status,
            phone_number: req.body.phone_number,
            date_of_birth: req.body.date_of_birth ? new Date(req.body.date_of_birth) : null,
            gender: req.body.gender,
            address: req.body.address,
            updated_at: Date.now()
        };

        // Nếu có ảnh mới, cập nhật đường dẫn của ảnh
        if (req.file) {
            updates.profile_picture = `uploads/${req.file.filename}`;
        }

        // Kiểm tra nếu mật khẩu mới được nhập, nếu không thì bỏ qua
        if (req.body.password && req.body.password.trim() !== '') {
            updates.password = await bcrypt.hash(req.body.password, saltRounds);
        }

        // Cập nhật người dùng
        const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true });
        if (!user) return res.status(404).send('User not found');

        // Điều hướng đến danh sách người dùng sau khi cập nhật
        res.redirect('/admin/users');
    } catch (error) {
        console.error(error); // In ra lỗi nếu có
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
