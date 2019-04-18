var mongoose = require('mongoose');

var UserStructure = new mongoose.Schema({
    username: String,
    email: String,
    bio: String,
    image: String,
    hash: String,
    salt: String
}, {timestamps: true});

mongose.model('User', UserStructure);