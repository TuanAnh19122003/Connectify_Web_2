const express = require('express');
const { format } = require('date-fns'); // Nếu bạn đang sử dụng date-fns
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

router.get('/', checkRole('Người dùng'), (req, res) => {
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

router.get('/about/:id', async (req, res) => {
    console.log('Requested User ID:', req.params.id); // Kiểm tra ID được yêu cầu
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).send('User not found');

        // Định dạng ngày tháng nếu cần
        user.created_at = user.created_at ? format(new Date(user.created_at), 'dd/MM/yyyy HH:mm:ss') : 'N/A';
        user.date_of_birth = user.date_of_birth ? format(new Date(user.date_of_birth), 'dd/MM/yyyy') : 'N/A';

        res.render('user/pages/about', { user, loggedInUser: req.session.user }); // Truyền thông tin người dùng đã đăng nhập
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    }
});


module.exports = router;
