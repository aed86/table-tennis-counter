module.exports = function(req, res, next) {
    res.sendValidationError = function(error) {
        var errors = [];
        for (var key in error.errors) {
            errors.push({
                field: key,
                message: error.errors[key].message
            })
        }

        if (res.req.headers['x-requested-with'] == 'XMLHttpRequest') {
            res.status(200).json({
                success: false,
                errors: errors
            });
        } else {
            res.render('error', {error: errors[0].message});
        }
    };

    next();
};