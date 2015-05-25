/**
 * Модель записи таблицы
 * @type {mongoose|exports|module.exports}
 */

var mongoose = require('../libs/mongoose'),
    Schema = mongoose.Schema;

var Tables = new Schema({
    player1: {
        name: {
            type: String,
            required: true
        },
        score: {
            type: String,
            default: 0
        }
    },
    player2: {
        name: {
            type: String,
            required: true
        },
        score: {
            type: String,
            default: 0
        }
    },
    created: {
        type: Date,
        default: Date.now
    }
});

exports.Tables = mongoose.model('Tables', Tables);