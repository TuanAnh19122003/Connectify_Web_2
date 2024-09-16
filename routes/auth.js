const express = require('express');
const path = require('path'); 
const User = require('../models/User');
const bcrypt = require('bcrypt');
const multer = require('multer');
const { redirectIfLoggedIn } = require('../views/auth/middleware/middleware'); 
const router = express.Router();

const saltRounds = 10; // Bạn có thể điều chỉnh số vòng salt

// Hiển thị trang đăng nhập
router.get('/login',redirectIfLoggedIn,(req, res) => {
    res.render('auth/pages/login');
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.render('auth/pages/login', {
                error: 'Tài khoản không tồn tại',
                email
            });
        }

        // In ra mật khẩu đã mã hóa từ database và mật khẩu người dùng nhập
        console.log('Mật khẩu người dùng nhập:', password);
        console.log('Mật khẩu đã mã hóa từ database:', user.password);

        const isMatch = await bcrypt.compare(password, user.password);

        console.log('Mật khẩu hợp lệ:', isMatch);

        if (!isMatch) {
            return res.render('auth/pages/login', {
                error: 'Mật khẩu không đúng',
                email
            });
        }

        req.session.user = {
            id: user._id,
            email: user.email,
            name: user.username,
            profile_picture: user.profile_picture
        };

        res.redirect('/admin');
    } catch (err) {
        res.status(500).render('auth/pages/login', { 
            error: 'Có lỗi xảy ra, vui lòng thử lại sau' 
        });
    }
});


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Tạo tên duy nhất cho ảnh
    }
});

const upload = multer({ storage: storage });


// Hiển thị trang đăng ký
router.get('/register', (req, res) => {
    res.render('auth/pages/register', { 
        error: null, // Có thể thêm thông báo lỗi nếu có
        username: '', 
        email: '', 
        profile_picture: '', 
    });
});

router.post('/register', upload.single('profile_picture'), async (req, res) => {
    const { username, email, password } = req.body;
    const profile_picture = req.file ? 'uploads/' + req.file.filename : '';

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.render('auth/pages/register', {
                error: 'Tài khoản đã tồn tại với email này',
                username,
                email
            });
        }
        const user = new User({
            username,
            email,
            password,  // Đảm bảo rằng bạn lưu chuỗi đã mã hóa
            profile_picture,
        });
        
        console.log('Mật khẩu đã mã hóa (lưu vào DB):', user.password);
        await user.save();
        res.redirect('/auth/login');
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});



// Route xử lý đăng xuất
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ message: err.message });
        }
        res.redirect('/auth/login');  // Chuyển hướng về trang login
    });
});


module.exports = router;
