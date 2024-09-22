const express = require('express');
const router = express.Router();
const Role = require('../models/Role');

// Lấy tất cả vai trò
router.get('/', async (req, res) => {
    const page = parseInt(req.query.page) || 1; // Trang hiện tại, mặc định là 1
    const limit = 5; // Số lượng dữ liệu mỗi trang
    const skip = (page - 1) * limit; // Tính toán số lượng mục cần bỏ qua

    try {
        const roles = await Role.find()
        .skip(skip).limit(limit);
        const totalUsers = await Role.countDocuments();
        const totalPages = Math.ceil(totalUsers / limit); // Tổng số trang

        res.render('admin/roles/list', { 
            roles,
            currentPage: page,
            totalPages 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
//Chi tiết vai trò
router.get('/details/:id', async (req, res) => {
    try {
      const role = await Role.findById(req.params.id);
      res.render('admin/roles/details', { role });
    } catch (err) {
      res.status(500).send(err.message);
    }
});


// Render form thêm mới
router.get('/create', (req, res) => {
    res.render('admin/roles/create'); // Render file create.ejs
});
// Thêm vai trò mới
router.post('/create', async (req, res) => {
    try {
        const role = new Role({
            name: req.body.name
        });
        await role.save();
        res.redirect('/admin/roles'); // Chuyển hướng về danh sách vai trò
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Lấy vai trò theo ID
// Hiển thị trang chỉnh sửa vai trò
router.get('/edit/:id', async (req, res) => {
    try {
        const role = await Role.findById(req.params.id);
        if (!role) return res.status(404).send('Role not found');
        res.render('admin/roles/edit', { role }); // Render file edit.ejs
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Cập nhật vai trò
router.post('/edit/:id', async (req, res) => {
    try {
        const role = await Role.findByIdAndUpdate(req.params.id, {
            name: req.body.name
        }, { new: true });
        if (!role) return res.status(404).send('Role not found');
        res.redirect('/admin/roles');
    } catch (error) {
        res.status(400).send(error.message);
    }
});

// Xóa vai trò
router.get('/delete/:id', async (req, res) => {
    try {
        const role = await Role.findById(req.params.id);
        if (!role) return res.status(404).send('Role not found');
        res.render('admin/roles/delete', { role }); // Render file edit.ejs
    } catch (err) {
        res.status(500).send(err.message);
    }
  });
  // Xóa người dùng
  router.post('/delete/:id', async (req, res) => {
    try {
        const role = await Role.findByIdAndDelete(req.params.id);
        if (!role) {
            return res.status(404).send('Role not found');
        }
        res.redirect('/admin/roles');
    } catch (err) {
        res.status(500).send(err.message);
    }
  });

//USER -  Người dùng
// Lấy tất cả vai trò
router.get('/', async (req, res) => {
    try {
        const role = await Role.find();
        res.render('/user/pages/index', { role });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
