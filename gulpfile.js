var gulp = require('gulp');
var bump = require('gulp-bump');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var handlebars = require('gulp-handlebars');
var wrap = require('gulp-wrap');
var declare = require('gulp-declare');
var uglify = require('gulp-uglify');
var del = require('del');
var runSequence = require('run-sequence');

var output_names = {
  js: 'fifty_pjax_table.js',
  standalone_vendor_js: 'standalone_vendor.js',
  standalone_js: 'standalone.js'
};

var paths = {
  json: ['./bower.json', './package.json'],
  js: ['./src/js/table.js'],
  standalone_vendor_js: [
    './bower_components/jquery/dist/jquery.js',
    './bower_components/fifty-widget/dist/fisty_widget.js',
    './bower_components/chance/chance.js',
    './bower_components/handlebars/handlebars.runtime.js'
  ],
  standalone_js: [
    './src/js/table_generator.js',
    './src/js/standalone.js'
  ],
  templates: './src/templates/*.hbs'
};

gulp.task('clean', function(cb) {
  del(['dist/js'], cb);
});

gulp.task('bump-patch', function(){ return gulp.src(paths.json).pipe(bump()).pipe(gulp.dest('./')); });
gulp.task('bump-minor', function(){ return gulp.src(paths.json).pipe(bump({ type: 'minor' })).pipe(gulp.dest('./')); });
gulp.task('bump-major', function(){ return gulp.src(paths.json).pipe(bump({ type: 'major' })).pipe(gulp.dest('./')); });

gulp.task('templates', function(){
  gulp.src(paths.templates)
    .pipe(handlebars())
    .pipe(wrap('Handlebars.template(<%= contents %>)'))
    .pipe(declare({
      namespace: 'Fifty.templates',
      noRedeclare: true, // Avoid duplicate declarations
    }))
    .pipe(concat('templates.js'))
    .pipe(gulp.dest('./standalone'));
});

gulp.task('standalone_vendor_js', function() {
  return gulp.src(paths.standalone_vendor_js)
    .pipe(concat(output_names.standalone_vendor_js))
    .pipe(gulp.dest('./standalone'));
});

gulp.task('standalone_js', function() {
  return gulp.src(paths.standalone_js)
    .pipe(concat(output_names.standalone_js))
    .pipe(gulp.dest('./standalone'));
});

gulp.task('js', function() {
  return gulp.src(paths.js)
    .pipe(concat(output_names.js))
    .pipe(gulp.dest('./dist'));
});

gulp.task('js_min', function() {
  return gulp.src(paths.js)
    .pipe(concat(output_names.js))
    .pipe(uglify({ preserveComments: 'some' }))
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest('./dist'));
});

gulp.task('default', function(callback){
  runSequence('clean', ['js', 'js_min', 'templates', 'standalone_vendor_js', 'standalone_js'], callback);
});