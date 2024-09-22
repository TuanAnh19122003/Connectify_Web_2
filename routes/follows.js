const express = require('express');
const router = express.Router();
const Follow = require('../models/Follow');
const User = require('../models/User');
const path = require('path');
const { format } = require('date-fns');

// Lấy tất cả theo dõi
router.get('/', async (req, res) => {
    const page = parseInt(req.query.page) || 1; // Trang hiện tại, mặc định là 1
    const limit = 5; // Số lượng dữ liệu mỗi trang
    const skip = (page - 1) * limit; // Tính toán số lượng mục cần bỏ qua
    try {
        const follows = await Follow.find()
            .populate({
                path: 'follower_id',
                select: 'username',
                options: { strictPopulate: false }
            })
            .populate({
                path: 'following_id',
                select: 'username',
                options: { strictPopulate: false }
            }).skip(skip).limit(limit);
            const totalUsers = await Follow.countDocuments();
            const totalPages = Math.ceil(totalUsers / limit); // Tổng số trang

        res.render('admin/follows/list', { 
            follows,
            currentPage: page,
            totalPages 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

//Chi tiết phân quyền
router.get('/details/:id', async (req, res) => {
    try {
        const follow = await Follow.findById(req.params.id)
            .populate('follower_id', 'username')
            .populate('following_id', 'username');

        if (!follow) return res.status(404).send('Phân quyền không tìm thấy');
        follow.created_at = format(follow.created_at, 'dd/MM/yyyy HH:mm:ss');
        res.render('admin/follows/details', { follow });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// Tạo theo dõi mới
router.get('/create', async (req, res) => {
    try {
        const users = await User.find({}, 'username');
        res.render('admin/follows/create', { users });
    } catch (error) {
        // Xử lý lỗi nếu có
        res.status(500).json({ message: error.message });
    }
});
// Xử lý form tạo follow
router.post('/create', async (req, res) => {
    try {
        const { follower_id, following_id } = req.body;
        if (!follower_id || !following_id) {
            return res.status(400).json({ message: 'Both follower_id and following_id are required' });
        }
        // Tạo một đối tượng phân quyền mới
        const follow = new Follow({ follower_id, following_id });
        // Lưu đối tượng phân quyền vào cơ sở dữ liệu
        await follow.save();
        // Chuyển hướng về trang danh sách phân quyền sau khi tạo thành công
        res.redirect('/admin/follows');
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Hiển thị trang cập nhật Follow
router.get('/edit/:id', async (req, res) => {
    try {
        const follow = await Follow.findById(req.params.id)
            .populate('follower_id', 'username')
            .populate('following_id', 'username');
        if (!follow) return res.status(404).send('Follow không tìm thấy');
        
        const users = await User.find({}, 'username');
        res.render('admin/follows/edit', { follow, users });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Xử lý form cập nhật Follow
router.post('/edit/:id', async (req, res) => {
    try {
        const { follower_id, following_id } = req.body;
        if (!follower_id || !following_id) {
            return res.status(400).json({ message: 'Both follower_id and following_id are required' });
        }
        
        // Cập nhật đối tượng Follow
        const follow = await Follow.findByIdAndUpdate(
            req.params.id,
            { follower_id, following_id },
            { new: true }
        );
        
        if (!follow) return res.status(404).send('Follow không tìm thấy');
        res.redirect('/admin/follows');
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});


// Hiển thị trang xóa Follow
router.get('/delete/:id', async (req, res) => {
    try {
        const follow = await Follow.findById(req.params.id)
            .populate('follower_id', 'username')
            .populate('following_id', 'username');
        if (!follow) return res.status(404).send('Follow không tìm thấy');
        res.render('admin/follows/delete', { follow });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// Xử lý yêu cầu xóa Follow
router.post('/delete/:id', async (req, res) => {
    try {
        const follow = await Follow.findByIdAndDelete(req.params.id);
        if (!follow) return res.status(404).send('Follow không tìm thấy');
        res.redirect('/admin/follows');
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


module.exports = router;
