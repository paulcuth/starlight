
'use strict';


var gulp = require('gulp');
var babel = require('gulp-babel');
var sourcemaps = require('gulp-sourcemaps');
var concat = require('gulp-concat');


gulp.task('build-gulp-plugin', function () {
    gulp.src([
        './src/build-tools/common/*.*',
        './src/build-tools/gulp/*.*'
    ]).pipe(babel())
        .pipe(gulp.dest('./dist/build-tools/gulp-starlight'));
});




gulp.task('build', function () {
    return gulp.src('src/starlight.js')
        .pipe(babel())
        .pipe(gulp.dest('dist'));
});
 
gulp.task('compile-example', function () {
    return gulp.src('src/example/example-es6.js')
        .pipe(babel())
        .pipe(concat('example.js'))
        .pipe(gulp.dest('dist'));
});

gulp.task('copy-example', function () {
    return gulp.src('src/example/index.html')
        .pipe(gulp.dest('dist'));
});


gulp.task('example', function () {
    var starlight = require('./dist/build-tools/gulp-starlight');
    gulp.src('src/example/example.lua')
        .pipe(starlight())
        .pipe(concat('example.lua.js'))
        .pipe(gulp.dest('dist/example'));
    gulp.src('src/example/index.html')
        .pipe(gulp.dest('dist/example'));
    gulp.src('src/starlight.js')
        .pipe(babel())
        .pipe(concat('starlight.js'))
        .pipe(gulp.dest('dist/example'));
});


gulp.task('test', function () {
    var starlight = require('./dist/build-tools/gulp-starlight');

    // Starlight ENV: Transpile and copy
    gulp.src('src/starlight/**/*.js')
        .pipe(sourcemaps.init())
        .pipe(babel())
        // .pipe(concat('starlight.js'))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('dist/test/starlight'));

    // Test script: Translate and copy
    gulp.src('src/test/test.lua')
        .pipe(starlight())
        .pipe(babel())
        .pipe(concat('test.lua.js'))
        .pipe(gulp.dest('dist/test'));

    // setTimeout(function () {
    //     require('./dist/test/test.lua');
    // }, 100);
        
});


// var translate = function () {

// 	function bufferContents (file) {
// 		var lua = hamletParser.parse(file.contents.toString()),
// 			luaFile = file.clone();

// 		if (luaFile.path.substr(-3) == '.js') luaFile.path = luaFile.path.substr(0, luaFile.path.length - 3);
// 		luaFile.path += '.lua';
// 		luaFile.contents = new Buffer(lua);

// 		this.emit('data', luaFile);
// 	}

// 	function endStream () {
// 		this.emit('end');
// 	}

// 	return through(bufferContents, endStream);
// };




// gulp.task('build', function () {
// 	var files = [
// 		'./src/runtime/core/init.lua',
// 		'./src/runtime/core/types/Object.lua',
// 		'./src/runtime/core/types/Function.lua',
// 		'./src/runtime/core/abstracts.lua',
// 		'./src/runtime/core/lang.lua',
// 		'./src/runtime/core/env/global.lua',
// 		'./src/runtime/core/env/Object.lua',
// 		'./src/runtime/core/env/Function.lua',
// 		'./src/runtime/core/env/Error.lua',
// 		'./src/runtime/core/env/RangeError.lua',
// 		'./src/runtime/core/env/ReferenceError.lua',
// 		'./src/runtime/core/env/TypeError.lua',
// 		'./src/runtime/core/env/Array.lua',
// 		'./src/runtime/core/env/Number.lua',
// 		'./src/runtime/core/env/String.lua',
// 		'./src/runtime/core/env/Boolean.lua',
// 		'./src/runtime/core/env/Math.lua',
// 		'./src/runtime/core/env/Date.lua',
// 		'./src/runtime/core/env/RegExp.lua',
// 		'./src/runtime/node/console.lua',
// 		'./src/runtime/core/cli.lua'
// 	];

// 	return gulp.src(files)
// 		.pipe(concat('hamlet.lua'))
// 		.pipe(gulp.dest('./out'));
// });






gulp.task('default', ['build', 'compile-example', 'copy-example']);

