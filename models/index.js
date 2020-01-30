'use strict'

const fs = require('fs')
const path = require('path')
const basename = path.basename(__filename)
const env = process.env.NODE_ENV || 'development'
const config = require(__dirname + '/../config/config')[env]
const db = {}
const mongoose = require('mongoose');


mongoose.connect(config.mongo, {useNewUrlParser: true});
const Author = require('../modelsMongo/author.js');
const Post = require('../modelsMongo/post.js');

db['Author'] = Author;
db['Post'] = Post;

db.mongoose = mongoose

module.exports = db
