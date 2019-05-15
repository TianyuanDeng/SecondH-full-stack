var router = require('express').Router();

router.use('/profiles', require('./profiles'));
router.use('/articles', require('./articles'));
router.use('/tags', require('./tags'));

router.use('/', require('./users'));

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
