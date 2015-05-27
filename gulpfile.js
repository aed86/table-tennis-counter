var gulp = require('gulp');
var browserify = require('browserify');
var vinylSourceStream = require('vinyl-source-stream');
var es = require('event-stream');
var $ = require('gulp-load-plugins')();

var paths = {
    csslibs: [
        'node_modules/animate.css/animate.min.css'
    ],
    html: [
        'http://localhost:3000/table',
        'http://localhost:3000/game',
        'http://localhost:3000/login',
        'http://localhost:3000/detail'
    ]
};

gulp.task('sass', function () {
    return $.rubySass('public/sass', {style: 'expanded'})
        .pipe($.rename({
            suffix: ".min"
        }))
        //.pipe($.uncss({
        //    html: paths.html
        //}))
        .pipe($.autoprefixer())
        .pipe($.cssmin())
        .pipe(gulp.dest('public/dist/css'));
});

gulp.task('csslibs', function () {
    gulp.src(paths.csslibs)
        .pipe($.concat('libs.min.css'))
        //.pipe($.uncss({
        //    html: paths.html
        //}))
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
    var files = [
        'main.js',
        'table.js',
        'game.js'
    ];
    var tasks = files.map(function(entry) {
        return browserify({
            entries: ['public/js/' + entry],
            debug: true
        })
            .bundle()
            .pipe(vinylSourceStream(entry))
            .pipe($.rename({
                extname: '.bundle.js'
            }))
            .pipe(gulp.dest('public/dist/js'));
    });
    return es.merge.apply(null, tasks);
});

gulp.task('watch', function () {
    gulp.watch('public/sass/**/*.sass', ['sass']);
    gulp.watch('public/img/**/*', ['images']);
    gulp.watch('public/js/**/*', ['browserify']);
});

gulp.task('build', ['sass', 'csslibs', 'uglify']);
gulp.task('default', ['watch']);
