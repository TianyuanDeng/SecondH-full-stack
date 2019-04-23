var mongoose = require('mongoose');
var router = require('express').Router();
var passport = require('passport');
var auth = require('../auth');

var User = mongoose.model('User');

//Create the registartion route
router.post('/users', function(req, res, next){
  var user = new User();
  
  user.username = req.body.user.username;
  user.email = req.body.user.email;
  user.setPassword(req.body.user.password);
  
  user.save().then(function(){
    return res.json({user: user.toAuthJSON()});
  }).catch(next);
});

//Create login route
router.post('/users/login', function(req, res, next){
  if(!req.body.user.email){
    return res.status(422).json({errors: {email: "can't be blank"}});
  }
  
  if(!req.body.user.password){
    return res.status(422).json({errors: {password: "can't be blank"}});
  }

  passport.authenticate('local', {session: false}, function(err, user, info){
    if(err){ return next(err); }

    if(user){
      user.token = user.generateJWT();
      return res.json({user: user.toAuthJSON()});
    } else {
      return res.status(422).json(info);
    }
  })(req, res, next);
});

//Create an endpoint to get the user's payload from token
router.get('/user', auth.required, function(req, res, next){
  User.findById(req.payload.id).then(function(user){
    if(!user){ return res.sendStatus(401); }

    return res.json({user: user.toAuthJSON()});
  }).catch(next);
});

//Create the update users endpoint
router.put('/user', auth.required, function(req, res, next){
  User.findById(req.payload.id).then(function(user){
    if(!user){ return res.sendStatus(401); }

    // only update fields that were actually passed...
    if(typeof req.body.user.username !== 'undefined'){
      user.username = req.body.user.username;
    }
    if(typeof req.body.user.email !== 'undefined'){
      user.email = req.body.user.email;
    }
    if(typeof req.body.user.bio !== 'undefined'){
      user.bio = req.body.user.bio;
    }
    if(typeof req.body.user.image !== 'undefined'){
      user.image = req.body.user.image;
    }
    if(typeof req.body.user.password !== 'undefined'){
      user.setPassword(req.body.user.password);
    }

    return user.save().then(function(){
      return res.json({user: user.toAuthJSON()});
    });
  }).catch(next);
});

// router.put('/', auth.required, (req, res, next) => {
//   User.findById(req.payload.id).then(user => {
//     if (!user)
//       return res.status(410).json({errors: {user_id: [`${req.payload.id}`, 'gone']}});

//     ['username', 'email', 'bio', 'image', 'password'].forEach(propName => {
//       if (!req.body.user.hasOwnProperty(propName)) return;
//       // 只更新请求体中确实包含的字段
//       if (propName === 'password')
//         return user.setPassword(req.body.user.password);
//       user[propName] = req.body.user[propName];
//     });

//     return user.save().then(() => {
//       return res.json({user: user.toAuthJSON()});
//     });
//   }).catch(next);
// });

module.exports = router;