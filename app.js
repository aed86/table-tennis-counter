var express = require('express');
var app = express();

var log = require('./libs/log')(module);
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var config = require('./libs/config');
var errorHandler = require('errorhandler');
var HttpError = require("./error/index").HttpError;
var mongoose = require('mongoose');
var _ = require('underscore');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());

// MongoDB session store
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);

// sessionConfig for express & sock.js
var sessionConfig = {
    secret: config.get('session:secret'), // подпись для куков с сессией
    cookie: {
        path: "/",
        maxAge: config.get('session:maxAge'), // 4h max inactivity for session
        httpOnly: true, // hide from attackers
        secure: false
    },
    key: "sid",
    name: config.get('session:name'),
    proxy: config.get('session:proxy'),
    resave: config.get('session:resave'),
    saveUninitialized: true,
    // take connection settings from mongoose
    store: new MongoStore({mongooseConnection: mongoose.connection})
};
app.use(session(sessionConfig));
app.use(express.static(path.join(__dirname, 'public')));

app.use(require('./middleware/sendHttpError'));
app.use(require('./middleware/sendValidationError'));
app.use(require('./middleware/loadUser'));

// set view locals
app.use(function (req, res, next) {
    app.locals.route = req.url;

    app.locals.statuses = {
        'PROCESS_STATUS': 'InProcess',
        'PENDING_STATUS': 'Pending',
        'FINISH_STATUS': 'Finish'
    };

    app.locals.topMenu = [];
    app.locals.rightMenu = [];
    if (req.user) {
        app.locals.rightMenu = app.locals.rightMenu.concat([{
            url: '/logout',
            title: 'Выйти',
            id: 'logoutBtn'
        }]);
    } else {
        app.locals.rightMenu = app.locals.rightMenu.concat([
            {
                url: '/login',
                title: 'Войти'
            },
            {
                url: '/register',
                title: 'Регистрация'
            }
        ]);
    }

    if (!req.session.flashMessage || !_.isArray(req.session.flashMessage)) {
        req.session.flashMessage = [];
    }

    next()
});

// Флеш сообщения
app.use(function(req, res, next) {
    if (req.session.flashMessage.length > 0) {
        app.locals.flashMessage = req.session.flashMessage.pop();
    }

    next()
});

app.use(require('./routes/table'));
app.use(require('./routes/game'));
app.use(require('./routes/login'));
app.use(require('./routes/logout'));
app.use(require('./routes/register'));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    log.error('404 error:' + req.path);
    next(404);
});

app.use(function (err, req, res, next) {
    log.error(err);

    if (typeof err == 'number') { // next(404)
        err = new HttpError(err);
    }

    if (err.name == 'ValidationError') {
        res.sendValidationError(err);
    } else if (err instanceof HttpError) {
        res.sendHttpError(err);
    } else {
        if (app.get('env') == 'development') {
            errorHandler()(err, req, res, next);
        } else {
            err = new HttpError(500);
            res.sendHttpError(err);
        }
    }
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });

        log.error(err.message);
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
