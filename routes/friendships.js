const express = require('express');
const router = express.Router();
const Friendship = require('../models/Friendship');
const User = require('../models/User');
const { format } = require('date-fns');

// Lấy tất cả mối quan hệ bạn bè
router.get('/', async (req, res) => {
    const page = parseInt(req.query.page) || 1; // Trang hiện tại, mặc định là 1
    const limit = 5; // Số lượng dữ liệu mỗi trang
    const skip = (page - 1) * limit; // Tính toán số lượng mục cần bỏ qua
    
    try {
        const friendships = await Friendship.find()
        .populate({
            path: 'user_id',
            select: 'username',
            options: { strictPopulate: false }
        })
        .populate({
            path: 'friend_id',
            select: 'username',
            options: { strictPopulate: false }
        }).skip(skip).limit(limit);
        const totalUsers = await Friendship.countDocuments();
        const totalPages = Math.ceil(totalUsers / limit); // Tổng số trang
        res.render('admin/friendships/list', { 
            friendships,
            currentPage: page,
            totalPages 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

//Chi tiết bạn bè
router.get('/details/:id', async (req, res) => {
    try {
        const friendship = await Friendship.findById(req.params.id)
            .populate('user_id', 'username')
            .populate('friend_id', 'username');

        if (!friendship) return res.status(404).send('Bạn bè không tìm thấy');
        friendship.created_at = format(friendship.created_at, 'dd/MM/yyyy HH:mm:ss');
        res.render('admin/friendships/details', { friendship });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
router.get('/create', async (req, res) => {
    try {
        const users = await User.find({}, 'username');
        res.render('admin/friendships/create', { users });
    } catch (error) {
        // Xử lý lỗi nếu có
        res.status(500).json({ message: error.message });
    }
});

// Tạo mối quan hệ bạn bè mới
router.post('/create', async (req, res) => {
    try {
        const { user_id, friend_id,status,created_at } = req.body;
        if (!user_id || !friend_id) {
            return res.status(400).json({ message: 'Both user_id and friend_id are required' });
        }
        const friendship = new Friendship({ 
            user_id, 
            friend_id,
            status: 'pending',
            created_at: Date.now()
         });
        await friendship.save();

        res.redirect('/admin/friendships');
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.get('/edit/:id', async (req, res) => {
    try {
        const friendship = await Friendship.findById(req.params.id)
            .populate('user_id', 'username')
            .populate('friend_id', 'username');
        if (!friendship) return res.status(404).send('Follow không tìm thấy');
        
        const users = await User.find({}, 'username');
        res.render('admin/friendships/edit', { friendship, users });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Xử lý form cập nhật Follow
router.post('/edit/:id', async (req, res) => {
    try {
        const { user_id, friend_id, status } = req.body;
        if (!user_id || !friend_id) {
            return res.status(400).json({ message: 'Both user_id and following_id are required' });
        }
        
        // Cập nhật đối tượng Follow
        const friendship = await Friendship.findByIdAndUpdate(
            req.params.id,
            { user_id, friend_id, status },
            { new: true }
        );
        
        if (!friendship) return res.status(404).send('friendship không tìm thấy');
        res.redirect('/admin/friendships');
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});



// Hiển thị trang xóa bạn bè
router.get('/delete/:id', async (req, res) => {
    try {
        const friendship = await Friendship.findById(req.params.id)
            .populate('user_id', 'username')
            .populate('friend_id', 'username');
        if (!friendship) return res.status(404).send('Follow không tìm thấy');
        res.render('admin/friendships/delete', { friendship });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// Xóa mối quan hệ bạn bè
router.post('/delete/:id', async (req, res) => {
    try {
        const friendship = await Friendship.findByIdAndDelete(req.params.id);
        if (!friendship) return res.status(404).json({ message: 'Friendship not found' });
        res.redirect('/admin/friendships');
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
