const UserRole = require('../../../models/UserRole');

// Middleware kiểm tra phân quyền
const checkRole = (requiredRoles) => {
    return async (req, res, next) => {
        try {
            if (!req.session.user) {
                return res.redirect('/auth/login');
            }

            // Tìm phân quyền của người dùng đang đăng nhập
            const userRoles = await UserRole.find({ user_id: req.session.user.id })
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

            // Debug thông tin userRoles
            console.log('Thông tin phân quyền:', userRoles);

            if (!userRoles || userRoles.length === 0) {
                return res.status(403).send('Bạn không có quyền truy cập');
            }

            // Kiểm tra xem người dùng có vai trò nào trong danh sách vai trò cần thiết không
            const hasAccess = userRoles.some(userRole => 
                requiredRoles.includes(userRole.role_id.name)
            );

            if (!hasAccess) {
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
