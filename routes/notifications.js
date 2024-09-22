const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const User = require('../models/User');
const { format } = require('date-fns');

// Lấy tất cả thông báo
router.get('/', async (req, res) => {
    const page = parseInt(req.query.page) || 1; // Trang hiện tại, mặc định là 1
    const limit = 5; // Số lượng dữ liệu mỗi trang
    const skip = (page - 1) * limit; // Tính toán số lượng mục cần bỏ qua

    try {
        const notifications = await Notification.find()
            .populate({
                path: 'user_id',
                select: 'username',
                options: { strictPopulate: false }
            }).skip(skip).limit(limit);
            const totalUsers = await Notification.countDocuments();
            const totalPages = Math.ceil(totalUsers / limit); // Tổng số trang

        res.render('admin/notifications/list', { 
            notifications,
            currentPage: page,
            totalPages   
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

//Chi tiết thông báo
router.get('/details/:id', async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id)
            .populate('user_id', 'username');

        if (!notification) return res.status(404).send('Phân quyền không tìm thấy');
        notification.created_at = format(notification.created_at, 'dd/MM/yyyy HH:mm:ss');
        res.render('admin/notifications/details', { notification });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Hiển thị trang tạo phân quyền
router.get('/create', async (req, res) => {
    try {
        // Lấy danh sách tất cả người dùng và vai trò
        const users = await User.find({}, 'username'); 

        // Render trang tạo phân quyền và truyền danh sách người dùng và vai trò vào view
        res.render('admin/notifications/create', { users });
    } catch (error) {
        // Xử lý lỗi nếu có
        res.status(500).json({ message: error.message });
    }
});

router.post('/create', async (req, res) => {
    try {
        const { user_id, message } = req.body;
        const notification = new Notification({ 
            user_id, 
            message, 
            read: false 
        });
        await notification.save();
        res.redirect('/admin/notifications');
    } catch (error) {
        // Xử lý lỗi nếu có
        res.status(400).json({ message: error.message });
    }
});

// Hiển thị trang cập nhật thông báo
router.get('/edit/:id', async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id).populate('user_id', 'username');
        const users = await User.find({}, 'username');

        if (!notification) return res.status(404).json({ message: 'Notification not found' });

        res.render('admin/notifications/edit', { notification, users });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Cập nhật thông báo
router.post('/edit/:id', async (req, res) => {
    try {
        const { user_id, message, read } = req.body;

        const notification = await Notification.findByIdAndUpdate(req.params.id, {
            user_id,
            message,
            read: read === 'true'
        }, { new: true });

        if (!notification) return res.status(404).json({ message: 'Notification not found' });

        res.redirect('/admin/notifications');
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Xóa vai trò
router.get('/delete/:id', async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id)
            .populate('user_id', 'username') 
            if (!notification) return res.status(404).send('Thông báo không tìm thấy');

            res.render('admin/notifications/delete', { notification });
    } catch (err) {
        res.status(500).send(err.message);
    }
});
router.post('/delete/:id', async (req, res) => {
    try {
        const notification = await Notification.findByIdAndDelete(req.params.id);
        if (!notification) return res.status(404).send('Thông báo không tìm thấy');
        res.redirect('/admin/notifications');
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Xóa thông báo
router.delete('/:id', async (req, res) => {
    try {
        const notification = await Notification.findByIdAndDelete(req.params.id);
        if (!notification) return res.status(404).json({ message: 'Notification not found' });
        res.json({ message: 'Notification deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
