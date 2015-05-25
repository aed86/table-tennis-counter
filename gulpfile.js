var gulp = require('gulp');
var browserify = require('browserify');
var vinylSourceStream = require('vinyl-source-stream');
var watchify = require('watchify');
var assign = require('lodash.assign');
var $ = require('gulp-load-plugins')();

var paths = {
    csslibs: [
        'node_modules/animate.css/animate.min.css'
    ]
};

gulp.task('jade', function() {
    gulp.src('views/*.jade')
        .pipe($.jade({
            //pretty: "    "
        }).on('error', function (err) {
            console.log(err);
        }))
        .pipe(gulp.dest(''))
});

gulp.task('sass', [], function () {
    return $.rubySass('public/sass', {style: 'expanded'})
        .pipe($.rename({
            suffix: ".min"
        }))
        .pipe($.uncss({
            html: ['*.html']
        }))
        .pipe($.autoprefixer())
        .pipe($.cssmin())
        .pipe(gulp.dest('public/dist/css'));
});

gulp.task('csslibs', [], function () {
    gulp.src(paths.csslibs)
        .pipe($.concat('libs.min.css'))
        .pipe($.uncss({
            html: ['*.html']
        }))
        .pipe($.autoprefixer())
        .pipe($.cssmin())
        .pipe(gulp.dest('public/dist/css'));
});

gulp.task('cleanImages', function () {
    return gulp.src('public/dist/img', {read: false})
        .pipe($.clean());
});

gulp.task('images', ['cleanImages'], function () {
    return gulp.src('public/img/**/*')
        .pipe($.imagemin({
            progressive: true
        }))
        .pipe(gulp.dest('public/dist/img'));
});

gulp.task('uglify', ['browserify'], function() {
    return gulp.src('public/dist/js/*.js')
        .pipe($.uglify({
            preserveComments: 'some'
        }))
        .pipe(gulp.dest('public/dist/js'));
});

gulp.task('browserify', function() {
    return browserify('public/js/app.js')
        .bundle()
        .pipe(vinylSourceStream('bundle.js'))
        .pipe(gulp.dest('public/dist/js'));
});

var customOpts = {
    entries: ['public/js/app.js'],
    debug: true
};
var opts = assign({}, watchify.args, customOpts);
var b = watchify(browserify(opts));

gulp.task('browserify-watch', browserifybundle);
b.on('update', browserifybundle);

function browserifybundle() {
    return b.bundle()
        .pipe(vinylSourceStream('bundle.js'))
        .pipe(gulp.dest('public/dist/js'));
}

gulp.task('watch', function () {
    //gulp.watch('views/**/*.jade', ['jade']);
    gulp.watch('public/sass/**/*.sass', ['sass']);
    gulp.watch('public/img/**/*', ['images']);
});

gulp.task('build', ['sass', 'csslibs', 'images']);
gulp.task('default', ['watch', 'browserify-watch']);
