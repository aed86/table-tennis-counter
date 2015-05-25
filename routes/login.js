var express = require('express');
var router = express.Router();
var mongoose = require('../libs/mongoose');
var UserModel = require('../models/users').UserModel;
var log = require('../libs/log')(module);
var ObjectID = require('mongodb').ObjectID;
var async = require('async');
var AuthError = require('../models/users').AuthError;
var HttpError = require('../error/index').HttpError;

router.get('/login', function (req, res) {
    res.render('login', {
        title: 'Войти'
    });
});

router.post('/login', function (req, res, next) {
    var username = req.body.username;
    var password = req.body.password;

    UserModel.authorize(username, password, function(err, user) {
        if (err) {
            if (err instanceof AuthError) {
                return next(new HttpError(403, err.message));
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
