const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const likeSchema = new Schema({
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    post_id: { type: Schema.Types.ObjectId, ref: 'Post' },
    comment_id: { type: Schema.Types.ObjectId, ref: 'Comment' },
    type: { type: String, enum: ['post', 'comment'], required: true }
});

module.exports = mongoose.model('Like', likeSchema);
