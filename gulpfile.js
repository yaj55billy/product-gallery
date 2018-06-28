var gulp = require('gulp');
var jade = require('gulp-jade');
var sass = require('gulp-sass');

var plumber = require('gulp-plumber'); //避免程式出錯時，會讓其他動作不執行

var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer'); 
//autoprefixer 是gulp-postcss裏頭其中一個套件

var babel = require('gulp-babel');
var sourcemaps = require('gulp-sourcemaps');
var concat = require('gulp-concat');

// bower and npm
var mainBowerFiles = require('main-bower-files');

// 套件排序
var order = require("gulp-order");

// css壓縮
var cleanCSS = require('gulp-clean-css');

// js壓縮
var uglify = require('gulp-uglify');

// 判斷是否要壓縮
var minimist = require('minimist');
var gulpif = require('gulp-if');
// >>>>>>>>>>>>>>>>>>>>>> 如果 gulp 就是開發版本
// >>>>>>>>>>>>>>>>>>>>>> 如果 gulp --env production 就是壓縮版本 (正式)

var envOptions = {
    string: 'env',
    default: {env: 'develop'}
}
var argv = require('minimist')(process.argv.slice(2));
var options = minimist(process.argv.slice(2) , envOptions);

console.log(options);

// 任務:編譯sass
gulp.task('scss', function () {

    var plugins = [
        autoprefixer({browsers: ['last 5 versions', '>5%','IE 8']})
    ];
    return gulp.src('./source/scss/**/*.scss')
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(sass({ 
            outputStyle: 'nested',
            includePaths: ['./node_modules/bootstrap/scss']
          }).on('error', sass.logError))
        //編譯完成
        .pipe(postcss(plugins))
        .pipe(gulpif(options.env === 'production' ,cleanCSS()))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('./public/css/'))
});

// babel
gulp.task('babel', function () {
    return gulp.src('./source/js/**/*.js')
        // .pipe(babel())
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(concat('all.js'))
        .pipe(gulpif(options.env === 'production' ,uglify()))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('./public/js/'))
});

// bower
gulp.task('bower', function() {
    return gulp.src(mainBowerFiles({
        "overrides": {
            // "fontawesome": { 
            //     "main": "dist/js/bootstrap.js" 
            // }
        }
    }))
      .pipe(gulp.dest('./.tmp/vendors'));
      cb(err);
  });

gulp.task('vendorJs', ['bower'], function() {
    return gulp.src([
        './.tmp/vendors/**/**.js'
        // './node_modules/bootstrap/dist/js/bootstrap.bundle.min.js'
      ])
        .pipe(order([
            'jquery.js'
          ]))
        .pipe(concat('vendors.js'))
        .pipe(gulpif(options.env === 'production' ,uglify()))
        .pipe(gulp.dest('./public/plugin/'))
});

gulp.task('vendorCss', ['bower'], function() {
    return gulp.src([
        './.tmp/vendors/**/**.css',
        './node_modules/@fortawesome/fontawesome-free/css/all.css'
      ])
        // .pipe(order([
        //     'jquery.js'
        //   ]))
        .pipe(concat('vendors.css'))
        .pipe(gulpif(options.env === 'production' ,uglify()))
        .pipe(gulp.dest('./public/plugin'))
});


gulp.task('copyHTML', function () {
    return gulp.src('./source/**.html')
    .pipe(gulp.dest('./public'))
});

gulp.task('copyImages', function () {
    return gulp.src('./source/images/**/**')
    .pipe(gulp.dest('./public/images/'))
});

gulp.task('copyFont', function () {
    return gulp.src('./source/webfonts/**/**')
    .pipe(gulp.dest('./public/webfonts/'))
});


gulp.task('watch', function () {
    gulp.watch('./source/scss/**/*.scss', ['scss']);
    gulp.watch('./source/js/**/*.js', ['babel']);
    gulp.watch('./source/**.html', ['copyHTML']);
    // gulp.watch('./source/images/**/**', ['copyImages']);
    // gulp.watch('./source/webfonts/**/**', ['copyFont']);
});

//合併
gulp.task('default', [ 'scss','babel','vendorJs','vendorCss','copyHTML','copyImages','copyFont', 'watch'])



