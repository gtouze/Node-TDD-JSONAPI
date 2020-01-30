const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PostSchema = new Schema({
    firstName: { type: String, default: '' },
    lastName: { type: String, default: '' },
    user: { type: Schema.ObjectId, ref: 'Author' },
});


const PostModel = mongoose.model('Post', PostSchema)

module.exports = PostModel;