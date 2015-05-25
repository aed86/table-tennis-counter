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
    Tables.find().sort({'created': '-1'}).exec(function(err, data) {
        if (err) {
            res.statusCode(200);
            log.debug('Error get carrier');
        } else {
            res.render('table', {
                data: data
            });
        }
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

router.delete('/table/:id', function (req, res, next) {
    try {
        var id = new ObjectID(req.params.id);
    } catch (e) {
        log.error(e.message);
        return next(404);
    }

    Tables.findById(id, function (err, table) {
        if (err) return next(err);

        if (!table) {
            res.json({
                message: "Record not found.",
                success: true
            });
        } else {
            table.remove(function (err) {
                if (err) throw err;

                res.json({
                    message: "Ok",
                    success: true
                });
            });
        }
    });
});

module.exports = router;
