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

        res.render('game', prepareGameData(game));
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

        res.json(prepareGameData(game));
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

        //res.json({
        //    success: true,
        //    data: res.body
        //});
        table.player1.score = req.body.player1.score;
        table.player2.score = req.body.player2.score;
        table.points = req.body.points;
        table.save(function(err, table) {
            if (err) {
                next(err);
            }

            res.json({
                success: true,
                data: table
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

// Подготовка данных для frontend
var prepareGameData = function(game) {

    var gameData = JSON.parse(JSON.stringify(game));
    gameData.id = gameData._id;
    delete gameData.__v;
    delete gameData._id;

    var currentSet = gameData.player1.score + gameData.player2.score;

    if (gameData.points.length < currentSet+1) {
        gameData.points[currentSet] = {
            1: 0,
            2: 0
        };
    }

    console.log(currentSet, gameData.points);
    gameData.player1.point = gameData.points[currentSet][1];
    gameData.player2.point = gameData.points[currentSet][2];

    return gameData;
};

module.exports = router;
