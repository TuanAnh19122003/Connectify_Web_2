const express = require('express');
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
const { ensureAuthenticated } = require('../views/auth/middleware/middleware');
const checkRole = require('../views/auth/middleware/checkRole');
const Post = require('../models/Post');
const User = require('../models/User');
const Comment = require('../models/Comment');


// Middleware truyền thông tin user vào tất cả các route
router.use((req, res, next) => {
    if (req.session.user) {
        res.locals.user = req.session.user;
    } else {
        res.locals.user = null;
    }
    next();
});

// Sử dụng middleware ensureAuthenticated cho toàn bộ route admin
router.use(ensureAuthenticated);

// Route trang admin
router.get('/', checkRole(['Quản lý']), async (req, res) => {
    try {
        // Lấy số lượng bài đăng và người dùng từ DB
        const postCount = await Post.countDocuments();  // Đảm bảo ở đây là async
        const userCount = await User.countDocuments();  // Đảm bảo ở đây là async
        const commentCount = await Comment.countDocuments();  // Đảm bảo ở đây là async
        // Render giao diện admin với thông tin thống kê
        console.log('Dữ liệu session:', req.session);
        res.render('admin/dashboards/index', { postCount, userCount, commentCount });
    } catch (error) {
        console.error('Lỗi khi lấy thống kê:', error);
        res.status(500).send('Đã có lỗi xảy ra');
    }
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

module.exports = router;
