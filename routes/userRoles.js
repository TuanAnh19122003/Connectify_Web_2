const express = require('express');
const router = express.Router();
const UserRole = require('../models/UserRole');

// Lấy tất cả UserRoles
router.get('/', async (req, res) => {
    try {
        const userRoles = await UserRole.find().populate('user_id').populate('role_id');
        res.json(userRoles);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Tạo UserRole mới
router.post('/', async (req, res) => {
    const userRole = new UserRole({
        user_id: req.body.user_id,
        role_id: req.body.role_id
    });

    try {
        const newUserRole = await userRole.save();
        res.status(201).json(newUserRole);
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

module.exports = router;
