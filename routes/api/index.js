var router = require('express').Router();

router.use('/', require('./users'));

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

//middleware function for router to handle validation errors from Mognoose
router.use(function(err, req, res, next){
    if(err.name === 'ValidationError'){
        return res.status(422).json({
            errors: Object.keys(err.errors).reduce(function(errors, key){
                errors[key] = err.errors[key].message;
                
                return errors;
            }, {})
        });
    }
            
    return next(err);
});

module.exports = router;
