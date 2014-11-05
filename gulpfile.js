var gulp = require('gulp');
var bump = require('gulp-bump');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var del = require('del');
var runSequence = require('run-sequence');

var output_names = {
  js: 'fifty_pjax_table.js'
};
var paths = {
  json: ['./bower.json', './package.json'],
  js: ['./src/pjax_table.js']
};

gulp.task('clean', function(cb) {
  del(['dist/js'], cb);
});

gulp.task('bump-patch', function(){ return gulp.src(paths.json).pipe(bump()).pipe(gulp.dest('./')); });
gulp.task('bump-minor', function(){ return gulp.src(paths.json).pipe(bump({ type: 'minor' })).pipe(gulp.dest('./')); });
gulp.task('bump-major', function(){ return gulp.src(paths.json).pipe(bump({ type: 'major' })).pipe(gulp.dest('./')); });

gulp.task('standalone', function() {
  return gulp.src(paths.js)
    .pipe(concat('dist/fifty_pjax_table.js'))
    .pipe(uglify({ preserveComments: 'some' }))
    .pipe(gulp.dest('.'));
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
  runSequence('clean', ['js', 'js_min'], callback);
});