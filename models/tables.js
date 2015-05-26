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
            type: Number,
            default: 0
        },
        point: {
            type: Number,
            default: 0
        }
    },
    player2: {
        name: {
            type: String,
            required: true
        },
        score: {
            type: Number,
            default: 0
        },
        point: {
            type: Number,
            default: 0
        }
    },
    status: {
        type: String,
        default: 'Pending'
    },
    created: {
        type: Date,
        default: Date.now
    }
});

exports.Tables = mongoose.model('Tables', Tables);