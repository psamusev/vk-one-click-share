
var gulp = require('gulp'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    clean = require('gulp-clean'),
    minifyCss = require('gulp-minify-css');

var path = {
    scripts: ['js/libs/*.js','js/libs/**/*.js','js/content_scripts/*.js','js/content_scripts/**/*.js'],
    css:['css/*.css'],
    build:'prod'
};

gulp.task('clean', function () {
    return gulp.src(path.build)
        .pipe(clean());
});

gulp.task('scripts-prod', ['clean'], function() {
    return gulp.src(path.scripts)
        .pipe(uglify({quote_keys:true}))
        .pipe(concat('vk-one-click-share.js'))
        .pipe(gulp.dest(path.build));
});

gulp.task('scripts', ['clean'], function() {
    return gulp.src(path.scripts)
        .pipe(concat('vk-one-click-share.js'))
        .pipe(gulp.dest(path.build));
});

gulp.task('css-prod',['clean'],function(){
   return gulp.src(path.css)
       .pipe(concat('vk-one-click-share.css'))
       .pipe(minifyCss())
       .pipe(gulp.dest(path.build))
});

gulp.task('css',['clean'],function(){
    return gulp.src(path.css)
        .pipe(concat('vk-one-click-share.css'))
        .pipe(gulp.dest(path.build))
});

gulp.task('prod', ['scripts-prod','css-prod']);
gulp.task('dev', ['scripts','css']);

gulp.task('default', ['prod']);