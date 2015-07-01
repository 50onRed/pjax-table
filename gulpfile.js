var gulp = require('gulp');
var bump = require('gulp-bump');
var concat = require('gulp-concat');
var less = require('gulp-less');
var cssmin = require('gulp-cssmin');
var rename = require('gulp-rename');
var header = require('gulp-header');
var handlebars = require('gulp-handlebars');
var wrap = require('gulp-wrap');
var declare = require('gulp-declare');
var jsValidate = require('gulp-jsvalidate');
var uglify = require('gulp-uglify');
var del = require('del');
var runSequence = require('run-sequence');

var pkg = require('./package.json');
var banner = ['/*!',
  ' * PJAX Table v<%= pkg.version %> (<%= pkg.homepage %>)',
  ' * Copyright ' + (new Date()).getFullYear(),
  ' * <%= pkg.author %>',
  ' */\n'
].join('\n');

var output_names = {
  standalone_vendor_js: 'standalone_vendor.js',
  less: 'pjax_table.css',
  lessmin: 'pjax_table.min.css',
  js: 'pjax_table.js'
};

var paths = {
  json: [
    './bower.json', 
    './package.json'
  ],
  js: [
    './src/js/table.js', 
    './src/js/search.js'
  ],
  standalone_vendor_css: [
    './bower_components/fontawesome/css/font-awesome.css'
  ],
  standalone_vendor_fonts: [
    './bower_components/fontawesome/fonts/*'
  ],
  standalone_vendor_js: [
    './bower_components/jquery/dist/jquery.js',
    './bower_components/jquery-pjax/jquery.pjax.js',
    './bower_components/spin.js/spin.js',
    './bower_components/spin.js/jquery.spin.js',
    './bower_components/chance/chance.js',
    './bower_components/handlebars/handlebars.runtime.js'
  ],
  all_less: ['./src/less/**/*.less'],
  less: ['./src/less/table.less'],
  templates: ['./src/templates/*.hbs'],
};

gulp.task('clean', function(cb) {
  del(['dist/**/*', 'standalone/js/vendor/*', 'standalone/js/templates.js'], cb);
});

gulp.task('bump-patch', function(){ return gulp.src(paths.json).pipe(bump()).pipe(gulp.dest('./')); });
gulp.task('bump-minor', function(){ return gulp.src(paths.json).pipe(bump({ type: 'minor' })).pipe(gulp.dest('./')); });
gulp.task('bump-major', function(){ return gulp.src(paths.json).pipe(bump({ type: 'major' })).pipe(gulp.dest('./')); });

gulp.task('templates', function(){
  gulp.src(paths.templates)
    .pipe(handlebars())
    .pipe(wrap('Handlebars.template(<%= contents %>)'))
    .pipe(declare({
      namespace: 'UI.templates',
      noRedeclare: true, // Avoid duplicate declarations
    }))
    .pipe(concat('templates.js'))
    .pipe(gulp.dest('./standalone/js'));
});

gulp.task('standalone_vendor_js', function() {
  return gulp.src(paths.standalone_vendor_js)
    .pipe(concat(output_names.standalone_vendor_js))
    .pipe(gulp.dest('./standalone/js/vendor'));
});

gulp.task('standalone_vendor_css', function() {
  return gulp.src(paths.standalone_vendor_css)
    .pipe(gulp.dest('./standalone/css'));
});

gulp.task('standalone_vendor_fonts', function() {
  return gulp.src(paths.standalone_vendor_fonts)
    .pipe(gulp.dest('./standalone/fonts'));
});

gulp.task('js', function() {
  return gulp.src(paths.js)
    .pipe(jsValidate())
    .pipe(concat(output_names.js))
    .pipe(gulp.dest('./dist/js'));
});

gulp.task('js_min', function() {
  return gulp.src(paths.js)
    .pipe(jsValidate())
    .pipe(concat(output_names.js))
    .pipe(uglify({ preserveComments: 'some' }))
    .pipe(header(banner, { pkg: pkg }))
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest('./dist/js'));
});

gulp.task('less', function() {
  return gulp.src(paths.less)
    .pipe(less({ strictMath: true }))
    .pipe(header(banner, { pkg: pkg }))
    .pipe(rename(output_names.less))
    .pipe(gulp.dest('./dist/css'));
});

gulp.task('lessmin', function() {
  return gulp.src(paths.less)
    .pipe(less({ strictMath: true }))
    .pipe(cssmin({ keepSpecialComments: 1 }))
    .pipe(header(banner, { pkg: pkg }))
    .pipe(rename(output_names.lessmin))
    .pipe(gulp.dest('./dist/css'));
});

gulp.task('less_copy', function() {
  return gulp.src(paths.all_less)
    .pipe(gulp.dest('./dist/less'));
});

gulp.task('default', function(callback){
  runSequence('clean', [
    'js', 
    'js_min',
    'less',
    'lessmin',
    'less_copy',
    'templates', 
    'standalone_vendor_js',
    'standalone_vendor_css',
    'standalone_vendor_fonts'
  ], callback);
});