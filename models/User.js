const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // Sẽ được mã hóa trước khi lưu
    profile_picture: { type: String },
    bio: { type: String },
    phone_number: { type: String }, // Thêm trường số điện thoại
    date_of_birth: { type: Date }, // Thêm trường ngày sinh
    gender: { type: String, enum: ['male', 'female', 'other'] }, // Thêm trường giới tính
    address: { type: String }, // Thêm trường địa chỉ
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
    status: { type: String, enum: ['active', 'blocked'], default: 'active' },
    resetPasswordToken: String,
    resetPasswordExpires: Date
});

// Middleware để mã hóa mật khẩu trước khi lưu
userSchema.pre('save', async function (next) {
  const user = this;
  if (!user.isModified('password')) return next(); // Nếu mật khẩu không thay đổi, bỏ qua mã hóa

  try {
    const salt = await bcrypt.genSalt(10); // Tạo salt với độ phức tạp là 10
    user.password = await bcrypt.hash(user.password, salt); // Mã hóa mật khẩu
    next();
  } catch (error) {
    next(error);
  }
});

// Phương thức để kiểm tra mật khẩu hợp lệ
userSchema.methods.isValidPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);
