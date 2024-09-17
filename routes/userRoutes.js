const express = require('express');
const router = express.Router();
const checkRole = require('../views/auth/middleware/checkRole'); // Cập nhật đường dẫn nếu cần

// Route cho trang admin (chỉ cho Quản lý)
router.get('/admin', checkRole('Quản lý'), (req, res) => {
    res.send('Trang quản lý');
});

// Route cho trang user (chỉ cho Người dùng)
router.get('/user', checkRole('Người dùng'), (req, res) => {
    res.send('Trang người dùng');
});

module.exports = router;
