var express = require('express');
var router = express.Router();
var mongoose = require('../libs/mongoose');
var log = require('../libs/log')(module);
var AuthError = require('../models/users').AuthError;
var HttpError = require('../error/index').HttpError;
var Tables = require('../models/tables').Tables;
var ObjectID = require('mongodb').ObjectID;

/**
 * Страница подробной информации об игре
 */
router.get('/game/:id/detail', function (req, res, next) {
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

        res.render('detail', prepareGameData(game));
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
