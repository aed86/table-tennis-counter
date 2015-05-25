var express = require('express');
var router = express.Router();
var log = require('../libs/log')(module);

/**
 * Страница подсчета очков
 */
router.get('/game', function (req, res, next) {
    res.render('game', {});
});

module.exports = router;
