const createError = require('http-errors');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const ejsLayouts = require('express-ejs-layouts');


const indexRouter = require('./routes/index');
const adminRouter = require('./routes/admin');

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

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Sử dụng express-ejs-layouts
app.use(ejsLayouts);
// Cài đặt các layout mặc định cho các route
app.use((req, res, next) => {
  if (req.path.startsWith('/admin')) {
    res.locals.layout = 'admin/layouts/main'; // Layout cho trang quản lý
  } else {
    res.locals.layout = 'user/layouts/main'; // Layout cho trang người dùng
  }
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
