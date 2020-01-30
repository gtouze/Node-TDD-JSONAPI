const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AuthorSchema = new Schema({
    firstName: { type: String, default: '' },
    lastName: { type: String, default: '' }
});

const AuthorModel =  mongoose.model('Author', AuthorSchema)
AuthorModel.create = async function(datas) {
     let author = new AuthorModel({
         firstName: datas.firstName,
         lastName: datas.lastName,
     })
     return author.save()
}
AuthorModel.findAll = async function(datas) {
    let attributs = datas ? datas.attributes : {};
    return AuthorModel.find().select(attributs).exec();
}

module.exports = AuthorModel;
