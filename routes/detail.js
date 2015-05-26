var express = require('express');
var router = express.Router();
var mongoose = require('../libs/mongoose');
var log = require('../libs/log')(module);
var AuthError = require('../models/users').AuthError;
var HttpError = require('../error/index').HttpError;

router.get('/detail', function (req, res) {
    res.render('detail', {
        title: 'Войти'
    });
});

module.exports = router;
