const express = require('express');
const router = express.Router();
const UserRole = require('../models/UserRole');
const User = require('../models/User');
const Role = require('../models/Role');

// Lấy tất cả UserRoles
router.get('/', async (req, res) => {
    try {
        const userRoles = await UserRole.find()
            .populate({
                path: 'user_id',
                select: 'username',
                options: { strictPopulate: false }
            })
            .populate({
                path: 'role_id',
                select: 'name',
                options: { strictPopulate: false }
            });

        res.render('admin/userRoles/list', { userRoles });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

//Chi tiết phân quyền
router.get('/details/:id', async (req, res) => {
    try {
        const userRole = await UserRole.findById(req.params.id)
            .populate('user_id', 'username') // Lấy thông tin username từ model User
            .populate('role_id', 'name'); // Lấy thông tin name từ model Role

        if (!userRole) return res.status(404).send('Phân quyền không tìm thấy');

        res.render('admin/userRoles/details', { userRole });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Hiển thị trang tạo phân quyền
router.get('/create', async (req, res) => {
    try {
        // Lấy danh sách tất cả người dùng và vai trò
        const users = await User.find({}, 'username'); // Lấy tất cả người dùng và chỉ lấy trường 'username'
        const roles = await Role.find({}, 'name'); // Lấy tất cả vai trò và chỉ lấy trường 'name'

        // Render trang tạo phân quyền và truyền danh sách người dùng và vai trò vào view
        res.render('admin/userRoles/create', { users, roles });
    } catch (error) {
        // Xử lý lỗi nếu có
        res.status(500).json({ message: error.message });
    }
});
// Xử lý form tạo phân quyền
router.post('/create', async (req, res) => {
    try {
        const { user_id, role_id } = req.body; // Lấy user_id và role_id từ form

        // Tạo một đối tượng phân quyền mới
        const userRole = new UserRole({ user_id, role_id });

        // Lưu đối tượng phân quyền vào cơ sở dữ liệu
        await userRole.save();

        // Chuyển hướng về trang danh sách phân quyền sau khi tạo thành công
        res.redirect('/admin/userRoles');
    } catch (error) {
        // Xử lý lỗi nếu có
        res.status(400).json({ message: error.message });
    }
});

// Hiển thị trang cập nhật phân quyền
router.get('/edit/:id', async (req, res) => {
    try {
        const userRole = await UserRole.findById(req.params.id).populate('user_id').populate('role_id');
        if (!userRole) return res.status(404).send('Phân quyền không tìm thấy');

        const users = await User.find({}, 'username'); // Lấy danh sách tất cả người dùng
        const roles = await Role.find({}, 'name'); // Lấy danh sách tất cả vai trò

        res.render('admin/userRoles/edit', { userRole, users, roles });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// Xử lý cập nhật phân quyền
router.post('/edit/:id', async (req, res) => {
    try {
        const { user_id, role_id } = req.body; // Lấy user_id và role_id từ form

        const userRole = await UserRole.findByIdAndUpdate(req.params.id, { user_id, role_id }, { new: true });
        if (!userRole) return res.status(404).send('Phân quyền không tìm thấy');

        // Chuyển hướng về trang danh sách phân quyền sau khi cập nhật thành công
        res.redirect('/admin/userRoles');
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Xóa UserRole
router.delete('/:id', async (req, res) => {
    try {
        const userRole = await UserRole.findByIdAndDelete(req.params.id);
        if (!userRole) return res.status(404).json({ message: 'UserRole not found' });
        res.json({ message: 'UserRole deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// Xóa vai trò
router.get('/delete/:id', async (req, res) => {
    try {
        const userRole = await UserRole.findById(req.params.id)
            .populate('user_id', 'username') 
            .populate('role_id', 'name'); 
            if (!userRole) return res.status(404).send('Phân quyền không tìm thấy');

            res.render('admin/userRoles/delete', { userRole });
    } catch (err) {
        res.status(500).send(err.message);
    }
});
router.post('/delete/:id', async (req, res) => {
    try {
        const userRole = await UserRole.findByIdAndDelete(req.params.id);
        if (!userRole) return res.status(404).send('Phân quyền không tìm thấy');
        res.redirect('/admin/userRoles');
    } catch (err) {
        res.status(500).send(err.message);
    }
});

module.exports = router;
