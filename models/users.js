var crypto = require('crypto');
var async = require('async');
var util = require('util');
var HttpError = require('../error/index').HttpError;
var log = require('../libs/log')(module);

var mongoose = require('../libs/mongoose'),
    Schema = mongoose.Schema;

var schema = new Schema({
    username: {
        type: String,
        unique: true,
    },
    name: {
        type: String,
    },
    hashedPassword: {
        type: String,
    },
    salt: {
        type: String,
        required: true
    },
    created: {
        type: Date,
        default: Date.now
    }
});

schema.methods.encryptPassword = function (password) {
    return crypto.createHmac('sha1', this.salt).update(password).digest('hex');
};

schema.path('username').validate(function (v) {
    return v.length >= 3 && v.length <= 24;
}, 'Логин должен содержать от 3 до 24 символов');

schema.path('name').validate(function (v) {
    return v.length > 0;
}, 'Имя не должно быть пустым');

schema.path('hashedPassword').validate(function (v) {
    if (this._plainPassword.length < 6) {
        this.invalidate('password', 'Пароль должен быть не меньше 6 символов');
    }

    if (!this._confirmPassword || this._plainPassword !== this._confirmPassword) {
        this.invalidate('confirmPassword', 'Пароли не совпадают');
    }

    //if (this.isNew && !this._plainPassword) {
    //    this.invalidate('password', 'required');
    //}

    return true;

}, 'err');

schema.virtual('confirmPassword')
    .set(function (confirmPassword) {
        this._confirmPassword = confirmPassword;
    })
    .get(function () {
        return this._confirmPassword;
    });

schema.virtual('password')
    .set(function (password) {
        this._plainPassword = password;
        this.salt = Math.random() + '';
        this.hashedPassword = this.encryptPassword(password);
    })
    .get(function () {
        return this._plainPassword;
    });

schema.methods.checkPassword = function (password) {
    return this.encryptPassword(password) === this.hashedPassword;
};

schema.methods.getPublicFields = function () {
    return {
        name: this.name,
        username: this.username,
        created: this.created,
        id: this.id
    };
};

schema.statics.authorize = function (username, password, callback) {
    var UserModel = this;
    async.waterfall([
        function (callback) {
            UserModel.findOne({username: username}).exec(callback);
        },
        function (user, callback) {
            if (user) {
                if (user.checkPassword(password)) {
                    callback(null, user);
                } else {
                    callback(new AuthError('Логин или пароль неверен.'))
                }
            } else {
                callback(new AuthError('Логин или пароль неверен.'))
            }
        }
    ], callback);
};


schema.statics.registration = function (userinfo, callback) {
    var UserModel = this;
    async.waterfall([
        function (callback) {
            UserModel.findOne({
                username: userinfo.username
            }).exec(callback);
        },
        function (user, callback) {
            if (user) {
                callback(new RegError('Такой логин уже занят'));
            } else {
                //Save new user
                var userData = {
                    username: userinfo.username,
                    password: userinfo.password,
                    name: userinfo.name,
                    confirmPassword: userinfo.confirmPassword
                };

                user = new UserModel(userData);

                user.save(function (err, user, affected) {
                    if (err) err = new ValidError('Ошибка валидации', err);
                    callback(err, user);
                });
            }
        }
    ], callback);
};

exports.UserModel = mongoose.model('User', schema);

// Ошибка авторизации
function AuthError(message) {
    Error.apply(this, arguments);
    Error.captureStackTrace(this, HttpError);

    this.message = message;
}

util.inherits(AuthError, Error);

AuthError.prototype.name = 'AuthError';

exports.AuthError = AuthError;

// Ошибка Регистрации
function RegError(message) {
    Error.apply(this, arguments);
    Error.captureStackTrace(this, HttpError);

    this.message = message;
}

util.inherits(RegError, Error);

RegError.prototype.name = 'RegError';

exports.RegError = RegError;


// Ошибка Валидации
function ValidError(message, error) {

    if (error && Object.keys(error.errors).length > 0) {
        var messages = {};

        for (var key in error.errors) {
            messages[key] = {
                field: key,
                message: error.errors[key].message
            }
        }
    } else {
        messages = message;
    }

    Error.apply(this, arguments);
    Error.captureStackTrace(this, HttpError);

    this.message = messages;
}

util.inherits(ValidError, Error);

ValidError.prototype.name = 'ValidError';

exports.ValidError = ValidError;