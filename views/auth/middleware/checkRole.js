const UserRole = require('../../../models/UserRole');

// Middleware kiểm tra phân quyền
const checkRole = (requiredRole) => {
    return async (req, res, next) => {
        try {
            if (!req.session.user) {
                return res.status(401).send('Bạn cần đăng nhập');
            }

            const userRole = await UserRole.findOne()
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

            // Debug thông tin userRole
            console.log('Thông tin phân quyền:', userRole);

            if (!userRole) {
                return res.status(403).send('Bạn không có quyền truy cập');
            }

            if (userRole.role_id.name !== requiredRole) {
                return res.status(403).send('Bạn không có quyền truy cập');
            }

            next();
        } catch (error) {
            console.error('Lỗi kiểm tra phân quyền:', error);
            res.status(500).send('Có lỗi xảy ra');
        }
    };
};

module.exports = checkRole;
