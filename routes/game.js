var express = require('express');
var router = express.Router();
var log = require('../libs/log')(module);
var Tables = require('../models/tables').Tables;
var ObjectID = require('mongodb').ObjectID;

/**
 * Страница подсчета очков
 */
router.get('/game/:id', function (req, res, next) {
    try {
        var id = new ObjectID(req.params.id);
    } catch (e) {
        log.error(e.message);
        return next(404);
    }

    Tables.findById(id, function (err, game) {
        if (err) {
            next(err);
        }

        res.render('game', game);
    });
});

/**
 * Получение данных игры
 */
router.get('/game/:id/json', function (req, res, next) {
    try {
        var id = new ObjectID(req.params.id);
    } catch (e) {
        log.error(e.message);
        return next(404);
    }

    Tables.findById(id, function (err, game) {
        if (err) {
            next(err);
        }

        res.json(game);
    });
});


/**
 * Сохранение игры
 */
router.post('/game/:id/save', function (req, res, next) {
    try {
        var id = new ObjectID(req.params.id);
    } catch (e) {
        log.error(e.message);
        return next(404);
    }

    Tables.findById(id, function (err, table) {
        if (err) {
            next(err);
        }

        var index = 'player' + req.body.player;
        var score = parseInt(req.body.score);
        var point = parseInt(req.body.point);

        table[index].score = score;
        table[index].point = point;

        table.save(function(err, table) {
            if (err) {
                next(err);
            }

            res.json({
                success: true
            })
        });
    });


});

/**
 * Старт игры
 */
router.post('/game/:id/start', function (req, res, next) {
    try {
        var id = new ObjectID(req.params.id);
    } catch (e) {
        log.error(e.message);
        return next(404);
    }

    Tables.findById(id, function (err, table) {
        if (err) {
            next(err);
        }

        if (table.status == res.app.locals.statuses.PENDING_STATUS) {
            table.status = 'InProcess';
            table.save(function (err, table) {
                if (err) {
                    next(err);
                }

                res.json({
                    success: true,
                    message: 'Status has been changed'
                });
            });
        } else {
            res.json({
                success: true,
                message: 'Status has been already changed'
            });
        }
    });


});


module.exports = router;
