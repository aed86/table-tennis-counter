var mongoose = require('mongoose');
var config = require('./config');

mongoose.connect(config.get('mongoose:uri'), config.get('mongoose:options'));
var db = mongoose.connection;

db.on('error', function(err) {
    console.log('Connection error:', err.message);
});
db.once('open', function callback() {
    console.log('Connection success');
});

module.exports = mongoose;

// Connect to mongodb
//var mongoose = require('mongoose');
//mongoose.connect('mongodb://localhost/nodejs', function(err) {
//    if (err) {
//        log.debug('Connection error', err);
//    } else {
//        log.info('Connection success');
//    }
//});