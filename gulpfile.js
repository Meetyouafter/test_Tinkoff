const {
  src, dest, watch, parallel, series,
} = require('gulp');
const concat = require('gulp-concat');
const webp = require('gulp-webp');
const newer = require('gulp-newer');
const imagemin = require('gulp-imagemin');
const version = require('gulp-version-number');
const ifPlugin = require('gulp-if');
const svgmin = require('gulp-svgmin');
const svgSprite = require('gulp-svg-sprite');
const include = require('gulp-include');
const ttf2woff2 = require('gulp-ttf2woff2');
const ttf2woff = require('gulp-ttf2woff');
const fonter = require('gulp-fonter');
const clean = require('gulp-clean');
const autoprefixer = require('gulp-autoprefixer');
const uglify = require('gulp-uglify-es').default;
const browserSync = require('browser-sync').create();
const scss = require('gulp-sass')(require('sass'));

const isDev = !process.argv.includes('--build');
const isBuild = process.argv.includes('--build');

// HTML

const html = () => src('app/*.html')
  .pipe(include({
    includePaths: 'app/html',
  }))
  .pipe(ifPlugin(isBuild, version({
    value: '%DT%',
    append: {
      key: '_v',
      cover: 0,
      to: [
        'css',
        'js',
      ],
    },
    output: {
      file: 'app/version.json',
    },
  })))
  .pipe(dest('dist'))
  .pipe(browserSync.stream());

// Styles

const styles = () => src('app/scss/styles.scss', { sourcemaps: isDev })
  .pipe(autoprefixer({
    overrideBrowserslist: ['last 10 version'],
  }))
  .pipe(concat('styles.min.css'))
  .pipe(scss({ outputStyle: 'compressed' }))
  .pipe(dest('dist/css'))
  .pipe(browserSync.stream());

// Scripts

const scripts = () => src('app/js/main.js', { sourcemaps: isDev })
  .pipe(concat('main.min.js'))
  .pipe(uglify())
  .pipe(dest('dist/js'))
  .pipe(browserSync.stream());

// Images

const images = () => src(['app/assets/images/**/*.{jpg, jpeg, png, gif}'])
  .pipe(newer('dist/assets/images'))
  .pipe(webp()) // no ifPlugin because <picture> doesn't show in dev mode
  .pipe(dest('dist/assets/images'))

  .pipe(src('app/assets/images/**/*.{jpg, jpeg, png, gif}'))
  .pipe(newer('dist/assets/images'))
  .pipe(ifPlugin(isBuild, imagemin({
    progressive: true,
    interlaced: true,
    optimizationLevel: 3,
  })))
  .pipe(dest('dist/assets/images'));

// SVG

const svg = () => src(['app/assets/images/**/*.svg'])
  .pipe(ifPlugin(isBuild, svgmin()))
  .pipe(dest('dist/assets/images'));

const sprite = () => src(['app/assets/icons/*.svg'])
  .pipe(svgSprite({
    mode: {
      stack: {
        sprite: '../icons/icons.svg',
        example: true,
      },
    },
  }))
  .pipe(dest('dist/assets/images'));

exports.sprite = sprite;

// Fonts

const fonts = () => src('app/assets/fonts/*.otf', {})
  .pipe(fonter({
    formats: ['ttf'],
  }))
  .pipe(dest('app/assets/fonts'))

  .pipe(src('app/assets/fonts/*.ttf', {}))
  .pipe(ttf2woff())
  .pipe(dest('dist/assets/fonts'))

  .pipe(src('app/assets/fonts/*.ttf', {}))
  .pipe(ttf2woff2())
  .pipe(dest('dist/assets/fonts'));

// Watching

const watching = () => {
  browserSync.init({
    server: {
      baseDir: 'dist/',
    },
  });
  watch(['app/scss/**/*.scss'], styles);
  watch(['app/assets/images/**/*.{jpg, jpeg, png, gif}'], images);
  watch(['app/assets/images/**/*.svg'], svg);
  watch(['app/js/main.js'], scripts);
  watch(['app/*.html', 'app/html/*.html'], html);
  watch(['app/*.html']).on('change', browserSync.reload);
};

// Cleaner

const cleaner = () => src('dist', { allowEmpty: true }).pipe(clean());

// Build app

exports.build = series(
  cleaner,
  parallel(
    styles,
    images,
    fonts,
    html,
    scripts,
    svg,
  ),
);

// Run app

exports.default = series(
  cleaner,
  parallel(
    styles,
    images,
    fonts,
    html,
    scripts,
    svg,
  ),
  watching,
);
