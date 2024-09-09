const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userRoleSchema = new Schema({
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    role_id: { type: Schema.Types.ObjectId, ref: 'Role', required: true },
    created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('UserRole', userRoleSchema);
