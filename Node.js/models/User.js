var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var crypto = require('crypto');
var jwt = require('jsonwebtoken');
var secret = require('../config').secret;

/*-------------------USER----------------------*/
var UserSchema = new mongoose.Schema({
    username: {type: String, lowercase: true, unique: true, required: [true, "can't be blank"], index: true},
    email:  {type: String, lowercase: true, unique: true, required: [true, "can't be blank"], match: [/\S+@\S+\.\S+/, 'is invalid'], index: true},
    bio: String,
    image: String,
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Article' }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    hash: String,
    salt: String
}, {timestamps: true});

UserSchema.plugin(uniqueValidator, {message: "is already taken."});

/*-------------------PASSWORD----------------------*/
UserSchema.methods.setPassword = function(password){
    this.salt = crypto.randomBytes(16).toString('hex');
    this.hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
  };

UserSchema.methods.validPassword = function(password) {
    var hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
    return this.hash === hash;
};

/*-------------------Favorite----------------------*/
UserSchema.methods.favorite = function(id){
  if(this.favorites.indexOf(id) === -1){
    this.favorites = this.favorite.concat(id);
  }

  return this.save();
};

//Unfavorite
UserSchema.methods.unfavorite = function(id){
  this.favorites.remove( id );
  return this.save();
};

//Check favorited or not
UserSchema.methods.isFavorite = function(id){
  return this.favorites.some(function(favoriteId){
    return favoriteId.toString() === id.toString();
  });
};

/*-------------------generate a JWT----------------------*/
UserSchema.methods.generateJWT = function() {
    var today = new Date();
    var exp = new Date(today);
    exp.setDate(today.getDate() + 60);
  
    return jwt.sign({
      id: this._id,
      username: this.username,
      exp: parseInt(exp.getTime() / 1000),
    }, secret);
  };

//-------Get JSON from user------------ 
UserSchema.methods.toAuthJSON = function() {
    return {
        username: this.username,
        email: this.email,
        token: this.generateJWT(),
        bio: this.bio,
        image: this.image
    };
};

/*-------Return User Public Profile Data-------*/
UserSchema.methods.toProfileJSONFor = function(user){
  return {
    username: this.username,
    bio: this.bio,
    image: this.image || 'https://missouri.edu/images/template/mu-logo-48-stroked.svg',
    following: user ? user.isFollowing(this._id) : false
  };
};

// Follow
UserSchema.methods.follow = function(id){
  if(this.following.indexOf(id) === -1){
    this.following.push(id);
  }

  return this.save();
};

UserSchema.methods.unfollow = function(id){
  this.following.remove(id);
  return this.save();
};

UserSchema.methods.isFollowing = function(id){
  return this.following.some(function(followId){
    return followId.toString() === id.toString();
  });
};

//为了使用schema定义，我们需要转换为model
mongoose.model('User', UserSchema);