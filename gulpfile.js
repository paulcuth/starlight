
'use strict';


var gulp = require('gulp');
var babel = require('gulp-babel');
var sourcemaps = require('gulp-sourcemaps');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var minifyHTML = require('gulp-minify-html');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');



gulp.task('build-gulp-plugin', function () {
    gulp.src([
        './src/build-tools/common/*.*',
        './src/build-tools/gulp/*.*'
    ]).pipe(babel())
        .pipe(gulp.dest('./dist/build-tools/gulp-starlight'));
});


gulp.task('build-node-runtime', function () {
    gulp.src('src/starlight/**/*.js')
        .pipe(sourcemaps.init())
        .pipe(babel())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('dist/node/'));
});


gulp.task('build-browser-runtime', ['build-node-runtime'], function () {
  var bundler = browserify({
    entries: 'dist/node/index.js',
    debug: true
  });

  bundler.bundle()
    .pipe(source('starlight.js'))
    .pipe(buffer())
    .pipe(uglify())
    .pipe(gulp.dest('./dist/browser/'));
});


gulp.task('build-node-test', function () {
    var starlight = require('./dist/build-tools/gulp-starlight');

    // gulp.src('src/test/test.lua')
    //     .pipe(starlight())

    gulp.src('src/test/lua/**/*.lua')
        .pipe(starlight({
            main: 'test-runner.lua',
            basePath: 'src/test/lua'
        }))

        .pipe(gulp.dest('dist/test'))
        .pipe(babel())
        .pipe(uglify())
        .pipe(concat('test-node.lua.js'))
        .pipe(gulp.dest('dist/test'));

    gulp.src('src/test/index.html')
        .pipe(minifyHTML())
        .pipe(gulp.dest('dist/test'));
});


gulp.task('build-test', ['build-node-test'], function () {
  var bundler = browserify({
    entries: 'dist/test/test-node.lua.js',
    debug: true
  });

  bundler.bundle()
    .pipe(source('test-browser.lua.js'))
    .pipe(buffer())
    .pipe(uglify())
    .pipe(gulp.dest('dist/test'));
});


gulp.task('test', function () {
    global.starlight = { config: { env: { getTimestamp: Date.now.bind(Date) } } };
    require('./dist/node/index.js');
    require('./dist/test/test-node.lua.js');
});        


gulp.task('build-all', ['build-gulp-plugin', 'build-browser-runtime'], function () {
    gulp.tasks['build-test'].fn();
});        



gulp.task('default', ['build-all']);

