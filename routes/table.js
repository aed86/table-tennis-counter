var express = require('express');
var router = express.Router();
var log = require('../libs/log')(module);

//mount routes
router.get('/', function (req, res) {
    res.redirect('table');
});

/**
 * Страница таблицы
 */
router.get('/table', function (req, res, next) {
    res.render('table', {});
});

module.exports = router;
