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
    res.render('table', {
        data: [
            {
                "id": 923456,
                "player1": "Brant Lloyd",
                "player2": "Knox Ambrose",
                "score": "0:0"

            },
            {
                "id": 923457,
                "player1": "Rosy Stacie",
                "player2": "Rebecca Tracey",
                "score": "0:0"
            },
            {
                "id": 923458,
                "player1": "Marion Arlo",
                "player2": "Garland Marty",
                "score": "0:0"
            }
        ]
    });
});

module.exports = router;
