const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PostSchema = new Schema({
    title: { type: String, default: '' },
    content : { type: String, default: '' },
    AuthorId: { type: Schema.ObjectId, ref: 'Author' },
});

const PostModel = mongoose.model('Post', PostSchema)

PostModel.findAll = async function(datas) {
    let attributs = datas ? datas.attributes : {};
    return PostModel.find().select(attributs).exec();
}


module.exports = PostModel;
