
var gulp = require('gulp'),
    merge = require('merge-stream'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    clean = require('gulp-clean'),
    minifyCss = require('gulp-minify-css'),
    newer = require('gulp-newer'),
    zip = require('gulp-zip');

var path = {
    scripts: ['js/libs/*.js','js/libs/**/*.js','js/content_scripts/*.js','js/content_scripts/**/*.js'],
    backgroundScripts:'js/background_scripts/*.js',
    css:['css/*.css'],
    buildDir:'dist',
    publish:'publish',
    tmp:'tmp'
};

var dist = {
    scripts:'vk-one-click-share.js',
    css:'vk-one-click-share.css',
    background_scripts:'background.js',
    zip:'vk-one-click-share.zip'
};

gulp.task('clean', function () {
    return gulp.src(path.buildDir,{read:false})
        .pipe(clean());
});

gulp.task('scripts-prod', ['clean'], function() {
    var scriptsProd = gulp.src(path.scripts)
        .pipe(uglify({quote_keys:true}))
        .pipe(concat(dist.scripts))
        .pipe(gulp.dest(path.buildDir));
    var backScripts = gulp.src(path.backgroundScripts)
        .pipe(concat(dist.background_scripts))
        .pipe(gulp.dest(path.buildDir));
    return merge(scriptsProd,backScripts);
});

gulp.task('scripts', ['clean'], function() {
    var scriptsDev = gulp.src(path.scripts)
        .pipe(concat(dist.scripts))
        .pipe(gulp.dest(path.buildDir));
    var backScripts = gulp.src(path.backgroundScripts)
        .pipe(concat(dist.background_scripts))
        .pipe(gulp.dest(path.buildDir));
    return merge(scriptsDev,backScripts);
});

gulp.task('css-prod',['clean'],function(){
   return gulp.src(path.css)
       .pipe(concat(dist.css))
       .pipe(minifyCss())
       .pipe(gulp.dest(path.buildDir))
});

gulp.task('css',['clean'],function(){
    return gulp.src(path.css)
        .pipe(concat(dist.css))
        .pipe(gulp.dest(path.buildDir))
});

gulp.task('tempDir',['scripts-prod','css-prod'],function(){
    var manifest = gulp.src('manifest.json')
        .pipe(newer(path.tmp))
        .pipe(gulp.dest(path.tmp));
    var dist = gulp.src(path.buildDir + '/*')
        .pipe(newer(path.tmp +'/' + path.buildDir))
        .pipe(gulp.dest(path.tmp +'/' + path.buildDir));
    return merge(manifest,dist);
});
gulp.task('zip',['tempDir'],function(){
    return gulp.src([path.tmp +'/**/*'])
        .pipe(zip(dist.zip))
        .pipe(gulp.dest(path.publish));
});

gulp.task('zip-finish',['zip'],function(){
   return gulp.src(path.tmp)
       .pipe(clean())
});

gulp.task('prod', ['zip-finish']);
gulp.task('dev', ['scripts','css']);

gulp.task('default', ['prod']);