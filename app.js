const createError = require('http-errors');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const ejsLayouts = require('express-ejs-layouts');
const session = require('express-session');


const indexRouter = require('./routes/index');
const adminRouter = require('./routes/admin');
const authRouter = require('./routes/auth');
const userRoutes = require('./routes/userRoutes');

const app = express();

// Middleware để thiết lập layout
const setLayout = (layout) => {
  return (req, res, next) => {
    res.locals.layout = layout;
    next();
  };
};
const { format } = require('date-fns');

function formatDate(date) {
    return format(new Date(date), 'dd/MM/yyyy HH:mm:ss');
}

// Thêm hàm vào `res.locals` để có thể sử dụng trong EJS
app.use((req, res, next) => {
    res.locals.formatDate = formatDate;
    next();
});

// Kết nối với MongoDB
mongoose.connect('mongodb://0.0.0.0:27017/Connectify_Web');

const db = mongoose.connection;
db.on('error', (error) => console.error(error));
db.once('open', () => console.log('Connected to Database'));

app.use(ejsLayouts);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Cài đặt các layout mặc định cho các route
app.use((req, res, next) => {
  if (req.path.startsWith('/admin')) {
    res.locals.layout = 'admin/layouts/main'; // Layout cho trang quản lý
  } else if (req.path.startsWith('/user')) {
    res.locals.layout = 'user/layouts/main'; // Layout cho trang người dùng
  } else if (req.path.startsWith('/auth')) {
    res.locals.layout = 'auth/layouts/main'; // Không sử dụng layout cho trang đăng nhập và đăng ký
  } else{
    res.locals.layout = 'user/layouts/main';
  }
  next();
});

app.use(session({
  secret: 'Connectify_Web',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24 }  // 1 ngày
}));


// Middleware để tự động truyền session user vào tất cả các view
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/user', indexRouter);
app.use('/admin', adminRouter);
app.use('/auth', authRouter);
app.use('/', userRoutes);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
