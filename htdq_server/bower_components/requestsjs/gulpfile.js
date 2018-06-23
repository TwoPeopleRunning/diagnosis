var gulp    = require('gulp'),
    coffee  = require('gulp-coffee'),
    watch   = require('gulp-watch'),
	sourcemaps = require('gulp-sourcemaps');

// 编译coffee script
gulp.task('coffee', function() {
	gulp.src(['./src/**/*.coffee'])
		.pipe(sourcemaps.init())
		.pipe(coffee({bare:'bare'}))
		.pipe(sourcemaps.write())
		.pipe(gulp.dest('./dist'))
});

gulp.task('html', function(){
	gulp.src('./src/*.html')
		.pipe(gulp.dest('./dist'))
});

gulp.task('watch', function(){
    gulp.watch(['./src/**/*.coffee'], ['coffee']);
    gulp.watch(['./src/*.html'], ['html']);
});


gulp.task('default', ['coffee', 'html', 'watch']);