var gulp        = require('gulp');
var browserSync = require('browser-sync');
var sass        = require('gulp-sass');
var prefix      = require('gulp-autoprefixer');
var cp          = require('child_process');
var pug        = require('gulp-pug');
var plumber     = require('gulp-plumber');
var uglify      = require('gulp-uglify');
var rename      = require('gulp-rename');

var jekyll   = process.platform === 'win32' ? 'jekyll.bat' : 'jekyll';
var messages = {
    jekyllBuild: '<span style="color: grey">Running:</span> $ jekyll build'
};

/**
 * Build the Jekyll Site
 */
gulp.task('jekyll-build', function (done) {
    browserSync.notify(messages.jekyllBuild);
    return cp.spawn( jekyll , ['build'], {stdio: 'inherit'})
        .on('close', done);
});

/**
 * Rebuild Jekyll & do page reload
 */
gulp.task('jekyll-rebuild', ['jekyll-build'], function () {
    browserSync.reload();
});

/**
 * Wait for jekyll-build, then launch the Server
 */
gulp.task('browser-sync', ['sass', 'jekyll-build'], function() {
    browserSync({
        server: {
            baseDir: '_site'
        },
        notify: false
    });
});

/**
 * Compile files from _scss into both _site/css (for live injecting) and site (for future jekyll builds)
 */
gulp.task('sass', function () {
    return gulp.src('assets/css/main.scss')
        .pipe(sass({
            includePaths: ['css'],
            onError: browserSync.notify
        }))
        .pipe(prefix(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true }))
        .pipe(gulp.dest('_site/assets/css'))
        .pipe(browserSync.reload({stream:true}))
        .pipe(gulp.dest('assets/css'));
});

/**
* Scripts js
*/

gulp.task('scripts', function() {
    //console.log('It worked Dude!');
    gulp.src(['assets/js/**/*.js', '!assets/js/**/*.min.js'])
        .pipe(plumber())
        .pipe(rename({suffix: '.min'}))
        .pipe(uglify())
        .pipe(browserSync.reload({stream:true}))
        .pipe(gulp.dest('assets/js'));
});

/**
* Jade with Gulp
**/
gulp.task('pug', function() {
    return gulp.src('_pugfiles/*.pug')
    .pipe(pug())
    .pipe(browserSync.reload({stream:true}))
    .pipe(gulp.dest('_includes'));
});


/**
 * Watch scss files for changes & recompile
 * Watch html/md files, run jekyll & reload BrowserSync
 */
gulp.task('watch', function () {
    gulp.watch('assets/css/**', ['sass']);
    gulp.watch('assets/js/**/*.js', ['scripts']);
    gulp.watch(['index.html', '_layouts/*.html', '_includes/*'], ['jekyll-rebuild']);
    gulp.watch('_pugfiles/*.pug', ['pug']);
});

/**
 * Default task, running just `gulp` will compile the sass,
 * compile the jekyll site, launch BrowserSync & watch files.
 */
gulp.task('default', ['browser-sync', 'watch', 'scripts', 'pug', 'sass']);
