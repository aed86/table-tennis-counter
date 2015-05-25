var express = require('express');
var router = express.Router();
var log = require('../libs/log')(module);
var Tables = require('../models/tables').Tables;

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

router.post('/table/add', function (req, res, next) {
    var table = new Tables({
        player1: {
            name: req.body.player1,
            score: req.body.score1
        },
        player2: {
            name: req.body.player2,
            score: req.body.score2
        }
    });

    table.save(function (err, table, affected) {
        if (err) {
            next(err.message);
        } else {
            res.json({
                id: table.id,
                player1: table.player1,
                player2: table.player2,
                created: table.created
            })
        }
    });
});

module.exports = router;
