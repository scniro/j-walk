var gulp = require('gulp');
var mocha = require('gulp-mocha');
var gutil = require('gulp-util');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');

gulp.task('test', function(){
    return gulp.src('test.js')
        .pipe(mocha({ reporter: 'list' }))
        .on('error', gutil.log);
});

gulp.task('build', function(){
    return gulp.src('j-walk.js')
        .pipe(uglify())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest('.'));
});
