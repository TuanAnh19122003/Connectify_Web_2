const express = require('express');
const { format } = require('date-fns');
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
const Like = require('../models/Like')
const Comment = require('../models/Comment');
const Message = require('../models/Message');

router.get('/about/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).send('User not found');

        // Định dạng ngày tháng nếu cần
        user.created_at = user.created_at ? format(new Date(user.created_at), 'dd/MM/yyyy HH:mm:ss') : 'N/A';
        user.date_of_birth = user.date_of_birth ? format(new Date(user.date_of_birth), 'dd/MM/yyyy') : 'N/A';

        const posts = await Post.find({ user_id: req.session.user.id }).sort({ created_at: -1 }); // Sắp xếp theo thời gian tạo
        const comments = await Comment.find({ user_id: user._id }).populate('user_id', 'username profile_picture'); // Lấy bình luận của người dùng

        res.render('user/pages/about', { user, posts, comments, format, loggedInUser: req.session.user }); // Truyền thông tin người dùng đã đăng nhập
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

        // console.log('User ID:', req.session.user.id);

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

router.get('/post/:id', async (req, res) => {
    try {
        const postId = req.params.id; // Lấy ID bài đăng từ URL
        const post = await Post.findById(postId).populate('user_id', 'username profile_picture'); // Lấy bài đăng và thông tin người dùng

        if (!post) {
            return res.status(404).send('Post not found');
        }

        // Lấy bình luận của bài đăng
        const comments = await Comment.find({ post_id: postId }).populate('user_id', 'username profile_picture'); // Populating user info for comments

        res.render('user/pages/about', { post, comments }); // Render trang bài đăng với bài viết và bình luận
    } catch (error) {
        console.error('Error fetching post:', error);
        res.status(500).send('Đã có lỗi xảy ra khi lấy bài đăng.');
    }
});
// Xử lý cập nhật bài đăng
router.post('/edit-post/:id', async (req, res) => {
    try {
        const { title, content } = req.body;
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.redirect('/user');
        }

        // Chỉ cho phép người dùng chỉnh sửa bài đăng của chính họ
        if (post.user_id.toString() !== req.session.user.id) {
            return res.redirect('/user');
        }

        post.title = title;
        post.content = content;
        await post.save();
        
        res.redirect('/user/about/' + req.session.user.id);
    } catch (error) {
        console.error(error);
        res.redirect('/user');
    }
});



router.post('/post/:id/comment', async (req, res) => {
    try {
        const postId = req.params.id; // Lấy ID của bài đăng từ URL
        const userId = req.session.user.id; // Lấy ID người dùng từ session
        const content = req.body.comment; // Lấy nội dung bình luận từ body của request

        console.log('Post ID:', postId);
        console.log('User ID:', userId);
        console.log('Comment Content:', content);

        // Tạo đối tượng bình luận
        const comment = new Comment({
            user_id: userId,
            post_id: postId,
            content: content,
            created_at: new Date() 
        });

        // Lưu bình luận vào cơ sở dữ liệu
        await comment.save();

        await Post.findByIdAndUpdate(postId, { $push: { comments: comment._id } }); 

        res.redirect('back'); 
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).send('Đã có lỗi xảy ra khi thêm bình luận.');
    }
});

router.get('/post-comment/:id', async (req, res) => {
    try {
        const postId = req.params.id; // Lấy ID bài đăng từ URL
        const post = await Post.findById(postId).populate('user_id', 'username profile_picture'); // Lấy bài đăng và thông tin người dùng

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });  // Trả về JSON khi bài đăng không tồn tại
        }

        // Lấy bình luận của bài đăng
        const comments = await Comment.find({ post_id: postId }).populate('user_id', 'username profile_picture'); // Populating user info for comments

        res.json({ post, comments }); // Trả về dữ liệu JSON với bài đăng và bình luận
    } catch (error) {
        console.error('Error fetching post:', error);
        res.status(500).json({ error: 'Đã có lỗi xảy ra khi lấy bài đăng.' });  // Trả về JSON khi có lỗi
    }
});


// API lấy tin nhắn giữa hai người dùng
router.get('/messages/:userId/:friendId', async (req, res) => {
    try {
        const { userId, friendId } = req.params;
        const messages = await Message.find({
            $or: [
                { sender_id: userId, receiver_id: friendId },
                { sender_id: friendId, receiver_id: userId }
            ]
        }).sort({ created_at: 1 }); // Sắp xếp theo thời gian tạo

        res.json(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: 'Error fetching messages' });
    }
});

// GET form chỉnh sửa thông tin người dùng
router.get('/edit-profile', async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/auth/login');
    }
    try {
        const user = await User.findById(req.session.user.id);
        res.render('user/pages/edit-profile', { user });
    } catch (error) {
        console.error('Error fetching user data:', error);
        res.status(500).send('Error fetching user data.');
    }
});

// POST cập nhật thông tin người dùng
router.post('/edit-profile', async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/auth/login');
    }
    try {
        const updatedData = {
            bio: req.body.bio,
            date_of_birth: req.body.date_of_birth,
            phone_number: req.body.phone_number,
            gender: req.body.gender,
            address: req.body.address,
            occupation: req.body.occupation,
        };

        await User.findByIdAndUpdate(req.session.user.id, updatedData);
        req.session.user = { ...req.session.user, ...updatedData }; // Cập nhật lại session
        res.redirect('/user/about/' + req.session.user.id);
    } catch (error) {
        console.error('Error updating user profile:', error);
        res.status(500).send('Error updating user profile.');
    }
});



module.exports = router;
