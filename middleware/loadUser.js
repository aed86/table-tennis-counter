var UserModel = require('../models/users').UserModel;

module.exports = function(req, res, next) {
    if (!req.session.user) return next();

    UserModel.findById(req.session.user, function(err, user) {
       if (err) return next(err);

        req.user = res.locals.user = user;
        next();
    });
};
