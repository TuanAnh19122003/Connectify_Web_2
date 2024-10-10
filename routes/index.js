const express = require('express');
const { format } = require('date-fns'); // Nếu bạn đang sử dụng date-fns
const multer = require('multer');
const router = express.Router();

const usersRouter = require('./users');
const postsRouter = require('./posts');
const commentsRouter = require('./comments');
const likesRouter = require('./likes');
const friendshipsRouter = require('./friendships');
const messagesRouter = require('./messages');
const notificationsRouter = require('./notifications');
const followsRouter = require('./follows');
const rolesRouter = require('./roles');
const userRolesRouter = require('./userRoles');
const checkRole = require('../views/auth/middleware/checkRole');


// Middleware truyền thông tin user vào tất cả các route
router.use((req, res, next) => {
    if (req.session.user) {
        res.locals.user = req.session.user;
    } else {
        res.locals.user = null;
    }
    next();
});

router.get('/', checkRole(['Quản lý', 'Người dùng']), (req, res) => {
    console.log('Dữ liệu session:', req.session);
    res.render('user/pages/index', { content: 'Home' });
});


// Đảm bảo rằng bạn sử dụng Router đúng cách với các middleware hợp lệ
router.use('/users', usersRouter);
router.use('/posts', postsRouter);
router.use('/comments', commentsRouter);
router.use('/likes', likesRouter);
router.use('/friendships', friendshipsRouter);
router.use('/messages', messagesRouter);
router.use('/notifications', notificationsRouter);
router.use('/follows', followsRouter);
router.use('/roles', rolesRouter);
router.use('/userRoles', userRolesRouter);

const User = require('../models/User');
const Friendship = require('../models/Friendship');
const Post = require('../models/Post');

router.get('/about/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).send('User not found');

        // Định dạng ngày tháng nếu cần
        user.created_at = user.created_at ? format(new Date(user.created_at), 'dd/MM/yyyy HH:mm:ss') : 'N/A';
        user.date_of_birth = user.date_of_birth ? format(new Date(user.date_of_birth), 'dd/MM/yyyy') : 'N/A';

        const posts = await Post.find({ user_id: req.session.user.id }).sort({ created_at: -1 }); // Sắp xếp theo thời gian tạo

        res.render('user/pages/about', { user, posts, loggedInUser: req.session.user }); // Truyền thông tin người dùng đã đăng nhập
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    }
});


// Lấy danh sách bạn bè
router.get('/friends', async (req, res) => {
    try {
        if (!req.session.user) {
            return res.redirect('/auth/login');
        }

        // console.log('User ID:', req.session.user.id); // Kiểm tra ID người dùng

        const friendships = await Friendship.find({ user_id: req.session.user.id, status: 'accepted' })
            .populate('friend_id', 'username profile_picture');

        res.json(friendships);
    } catch (error) {
        console.error('Lỗi khi lấy danh sách bạn bè:', error);
        res.status(500).send('Có lỗi xảy ra');
    }
});

// Lấy danh sách bài đăng của bạn bè
router.get('/friends-posts', async (req, res) => {
    try {
        if (!req.session.user) {
            return res.redirect('/auth/login');
        }

        console.log('User ID:', req.session.user.id);

        // Lấy danh sách bạn bè
        const friendships = await Friendship.find({ user_id: req.session.user.id, status: 'accepted' })
            .populate('friend_id', 'username profile_picture');

        // Lấy danh sách ID bạn bè
        const friendIds = friendships.map(friendship => friendship.friend_id._id);

        // Tìm các bài đăng của bạn bè
        const posts = await Post.find({ user_id: { $in: friendIds } }).sort({ created_at: -1 }).populate('user_id', 'username profile_picture');

        // Trả về danh sách bài đăng của bạn bè
        res.json(posts);
    } catch (error) {
        console.error('Lỗi khi lấy bài đăng của bạn bè:', error);
        res.status(500).send('Có lỗi xảy ra');
    }
});


module.exports = router;
