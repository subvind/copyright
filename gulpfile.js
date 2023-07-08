const inomlang = require('inomlang').default

const gulp = require('gulp');
const gulpIf = require('gulp-if');
const browserSync = require('browser-sync').create();
const sass = require('gulp-sass')(require('sass'));
const htmlmin = require('gulp-htmlmin');
const cssmin = require('gulp-cssmin');
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');
const jsImport = require('gulp-js-import');
const sourcemaps = require('gulp-sourcemaps');
const htmlPartial = require('gulp-html-partial');
const clean = require('gulp-clean');
const googleWebFonts = require( 'gulp-google-webfonts' );
const cssbeautify = require('gulp-cssbeautify');
const htmlbeautify = require('gulp-html-beautify')
const fs = require('fs');
const transform = require('gulp-transform');
const rename = require('gulp-rename');
const isProd = process.env.NODE_ENV === 'prod';

var options = { };

const htmlFile = [
  'src/*.html'
]

function html() {
  return gulp.src(htmlFile)
    .pipe(htmlPartial({
      basePath: 'src/assets/partials/',
      tagName: 'partial',
      variablePrefix: '@@' // broken feature
    }))
    .pipe(htmlbeautify())
    .pipe(gulpIf(isProd, htmlmin({
      collapseWhitespace: true
    })))
    .pipe(gulp.dest('public'));
}

function css() {
  return gulp.src('src/assets/sass/terminal.scss')
    .pipe(gulpIf(!isProd, sourcemaps.init()))
    .pipe(sass({
      includePaths: ['node_modules']
    }).on('error', sass.logError))
    .pipe(cssbeautify({
      indent: '  ',
      openbrace: 'separate-line',
      autosemicolon: true
    }))
    .pipe(gulpIf(!isProd, sourcemaps.write()))
    .pipe(gulpIf(isProd, cssmin()))
    .pipe(gulp.dest('public/assets/css/'));
}

function js() {
  return gulp.src('src/assets/js/*.js')
    .pipe(jsImport({
      hideConsole: true
    }))
    // .pipe(concat('all.js'))
    .pipe(gulpIf(isProd, uglify()))
    .pipe(gulp.dest('public/assets/js'));
}

function fonts() {
  return gulp.src('src/assets/fonts/*.{eot,svg,ttf,woff,woff2}')
		.pipe(gulp.dest('public/assets/fonts/'));
}

function fontAwesome() {
  return gulp.src('./node_modules/@fortawesome/**/*')
		.pipe(gulp.dest('public/assets/vendor/'));
}


function serve() {
  browserSync.init({
    open: true,
    notify: false,
    server: './public'
  });
}

function browserSyncReload(done) {
  browserSync.reload();
  done();
}


function watchFiles() {
  gulp.watch('inomlang/**/*.inom', gulp.series(transpiler));
  gulp.watch('src/**/*.html', gulp.series(html, browserSyncReload));
  gulp.watch('src/assets/**/*.scss', gulp.series(css, browserSyncReload));
  gulp.watch('src/assets/**/*.js', gulp.series(js, browserSyncReload));
  gulp.watch('src/assets/**/*.{eot,svg,ttf,woff,woff2}', gulp.series(fonts));
  gulp.watch('src/assets/vendor/**/*.*', gulp.series(fontAwesome));

  return;
}

function del() {
  return gulp.src('public/*', {read: false})
    .pipe(clean());
}

function transpiler() {
  return gulp.src('inomlang/**/*.inom')
    .pipe(transform('utf8', (content) => {
      console.log('inomlang', inomlang)
      const parsedContent = inomlang.transpile(content);
      
      console.log('lexErrors', parsedContent.lexErrors)
      console.log('parseErrors', parsedContent.parseErrors)
      return parsedContent.value
    }))
    .pipe(rename({ extname: '.rs' }))
    .pipe(gulp.dest('machinelang'))
}

exports.css = css;
exports.html = html;
exports.js = js;
exports.fonts = fonts;
exports.fontAwesome = fontAwesome;
exports.del = del;
exports.serve = gulp.parallel(html, css, js, fonts, fontAwesome, watchFiles, serve, transpiler);
exports.default = gulp.series(del, html, css, js, fonts, fontAwesome);
