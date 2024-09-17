const express = require('express');
const path = require('path'); 
const User = require('../models/User');
const bcrypt = require('bcrypt');
const multer = require('multer');
const crypto = require('crypto');
require('dotenv').config();


const { redirectIfLoggedIn } = require('../views/auth/middleware/middleware'); 
const router = express.Router();

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
            password : user.password,
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

const nodemailer = require('nodemailer');


const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Hiển thị trang quên mật khẩu
router.get('/forgot-password', (req, res) => {
    res.render('auth/pages/forgot-password', { error: null });
});

// Xử lý yêu cầu quên mật khẩu
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.render('auth/pages/forgot-password', { 
                error: 'Email này không tồn tại trong hệ thống' 
            });
        }

        // Tạo token reset mật khẩu
        const resetToken = crypto.randomBytes(8).toString('hex');
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000; // Token có hiệu lực trong 1 giờ
        await user.save();

        // Gửi email chứa link đặt lại mật khẩu
        const mailOptions = {
            to: user.email,
            from: 'trinhtuananh1312003@gmail.com' , // Thay bằng email của bạn
            subject: 'Đặt lại mật khẩu',
            text: `Bạn nhận được email này vì bạn (hoặc ai đó) đã yêu cầu đặt lại mật khẩu cho tài khoản của bạn.\n\n` +
                `Vui lòng nhấp vào liên kết sau để đặt lại mật khẩu (liên kết có hiệu lực trong 1 giờ):\n\n` +
                `http://${req.headers.host}/auth/reset-password/${resetToken}\n\n` +
                `Nếu bạn không yêu cầu, vui lòng bỏ qua email này.\n`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.log('Error:', error);
            }
            console.log('Email sent:', info.response);
        });

        res.render('auth/pages/forgot-password', { 
            error: 'Email đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra hộp thư của bạn.' 
        });
    } catch (err) {
        console.error('Lỗi trong forgot-password route:', err);
        res.render('auth/pages/forgot-password', { 
            error: 'Có lỗi xảy ra. Vui lòng thử lại sau.' 
        });
    }
});

router.get('/reset-password/:token', async (req, res) => {
    try {
        const user = await User.findOne({
            resetPasswordToken: req.params.token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        console.log('User tìm thấy:', user);

        if (!user) {
            return res.render('auth/pages/reset-password', { 
                error: 'Token đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.' 
            });
        }

        res.render('auth/pages/reset-password', { 
            token: req.params.token,
            error: null
        });
    } catch (err) {
        res.render('auth/pages/reset-password', { 
            error: 'Có lỗi xảy ra. Vui lòng thử lại sau.' 
        });
    }
});

router.post('/reset-password/:token', async (req, res) => {
    const { password } = req.body;
    try {
        const user = await User.findOne({
            resetPasswordToken: req.params.token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.render('auth/pages/reset-password', { 
                error: 'Token đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.' 
            });
        }

        // Cập nhật mật khẩu mới và xóa token
        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();
        res.render('auth/pages/login', { 
            error: 'Mật khẩu của bạn đã được cập nhật thành công. Hãy đăng nhập lại.' 
        });
    } catch (err) {
        res.render('auth/pages/reset-password', { 
            error: 'Có lỗi xảy ra. Vui lòng thử lại sau.' 
        });
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
