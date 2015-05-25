var express = require('express');
var router = express.Router();
var mongoose = require('../libs/mongoose');
var UserModel = require('../models/users').UserModel;
var log = require('../libs/log')(module);
var ObjectID = require('mongodb').ObjectID;
var async = require('async');
var AuthError = require('../models/users').AuthError;
var HttpError = require('../error/index').HttpError;

router.post('/logout', function (req, res, next) {
    req.session.destroy();
    res.json({
        success: true,
        redirectTo: "/"
    });
});

module.exports = router;
