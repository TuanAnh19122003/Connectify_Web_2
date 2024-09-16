// Middleware để kiểm tra nếu người dùng đã đăng nhập
function redirectIfLoggedIn(req, res, next) {
    if (req.session.user) {
        // Nếu người dùng đã đăng nhập, chuyển hướng đến trang chính
        return res.redirect('/admin'); // Hoặc bất kỳ trang nào bạn muốn
    }
    next(); // Nếu chưa đăng nhập, tiếp tục với middleware tiếp theo
}

function ensureAuthenticated(req, res, next) {
    if (req.session.user) {
        return next();
    }
    res.redirect('/auth/login');  // Chuyển hướng đến trang login nếu chưa đăng nhập
}

module.exports = { redirectIfLoggedIn,ensureAuthenticated };
