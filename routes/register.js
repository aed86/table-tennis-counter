var express = require('express');
var router = express.Router();
var mongoose = require('../libs/mongoose');
var UserModel = require('../models/users').UserModel;
var log = require('../libs/log')(module);
var async = require('async');
var RegError = require('../models/users').RegError;
var HttpError = require('../error/index').HttpError;
var ValidError = require('../models/users').ValidError;

router.get('/register', function (req, res) {
    res.render('register', {
        title: 'Регистрация'
    });
});

router.post('/register', function (req, res, next) {
    UserModel.registration(req.body, function(err, user) {
        if (err) {
            if (err instanceof RegError) {
                return next(new HttpError(403, err.message));
            } else if (err instanceof ValidError) {
                return next(new HttpError(200, err.message));
            } else {
                return next(err);
            }
        }

        req.session.user = user.id;
        res.json({
            success: true
        });
    });
});

module.exports = router;
