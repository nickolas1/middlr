var gulp = require('gulp');
var g = require('gulp-load-plugins')();
var gulpSync = require('gulp-sync')(gulp);
var mainBowerFiles = require('main-bower-files');
var del = require('del');
var livereload = require('gulp-livereload');
var argv = require('yargs').argv;

const PROD = (argv.production ? true : false);
const VERSION = (argv.projectversion ? argv.projectversion : 'no version');

// define paths
var paths = {
    build: {
        main: './webapp',
        src: './webapp/src',
        css: './webapp/css',
        fonts: './webapp/css/fonts',
        vendor: './webapp/vendor/'
    },
    sources: './webapp-src/**/*.js',
    sass: [
        './webapp-src/**/*.scss'
    ],
    scripts: [
        './webapp-src/**/*.js'
    ],
    html: [
        './webapp-src/**/*.html',
        './webapp-src/**/*.json'
    ],
    index: [
        './webapp-src/index.html'
    ],
    static: [
        './webapp-src/**/*.csv',
        './webapp-src/**/*.svg',
        './webapp-src/**/*.woff',
        './webapp-src/**/*.woff2',
        './webapp-src/**/*.ttf',
        './webapp-src/**/*.png',
        './webapp-src/**/*.gif',
        './webapp-src/**/*.ico',
        './webapp-src/**/*.jpg',
        './webapp-src/**/*.eot'
    ],
    bootstrapFonts: [
        './bower_components/bootstrap-sass/assets/fonts/bootstrap/*',
        './webapp-src/resources/fontello/font/*'
    ],
    fontelloCss: [
        './webapp-src/resources/fontello/css/*.css'
    ]
};

// compile source/sass to build/css
gulp.task('compile-sass', function() {
    return gulp.src(paths.sass)
        .pipe(g.plumber({
        errorHandler: g.notify.onError("Error: <%= error.message %>")
    }))
        .pipe(g.sourcemaps.init())
        .pipe(g.sass({
        outputStyle: 'compressed'
    }))
        .pipe(g.autoprefixer())
        .pipe(g.sourcemaps.write('.'))
//        .pipe(g.gzip())
        .pipe(gulp.dest(paths.build.css))
        .pipe(g.if(!PROD, g.livereload()));
});

// copy static assets from source to build
gulp.task('copy-static', function() {
    return gulp.src(paths.static)
        .pipe(gulp.dest(paths.build.main));
});

// copy raw source files to build directory
gulp.task('copy-src', ['copy-index'], function() {
    return gulp.src(paths.scripts.concat(paths.html))
        .pipe(gulp.dest(paths.build.src));
});

// inject livereload into index
gulp.task('copy-index', function() {
    console.log('index injection livereload: ', !PROD)
    return gulp.src(paths.index)
        .pipe(g.if(!PROD, g.embedlr()))
        .pipe(gulp.dest(paths.build.main));
});

// merge all vendor js and css into a single file called vendor.js
gulp.task('compile-vendor-js', function() {
    var bower = mainBowerFiles();
    var jsFilter = g.filter('**/*.js');
    return gulp.src(bower)
        .pipe(jsFilter)
        .pipe(g.sourcemaps.init())
        .pipe(gulp.dest(paths.build.vendor))
        .pipe(g.concat('vendor.js'))
        .pipe(g.uglify())
        .pipe(g.sourcemaps.write('.'))
//        .pipe(g.gzip())
        .pipe(gulp.dest(paths.build.main))
        .pipe(g.if(!PROD, g.livereload()));
});

// merge all vendor css into a single file called vendor.css
gulp.task('compile-vendor-css', function() {
    var bower = mainBowerFiles().concat(paths.fontelloCss);
    var cssFilter = g.filter(['**/*.css', '**/*.ttf', '**/*.woff']);
    return gulp.src(bower.concat(paths.fontelloCss))
        .pipe(cssFilter)
        .pipe(g.sourcemaps.init())
        .pipe(gulp.dest(paths.build.css))
        .pipe(g.concat('vendor.css'))
        .pipe(g.cssnano())
        .pipe(g.sourcemaps.write('.'))
//        .pipe(g.gzip())
        .pipe(gulp.dest(paths.build.css))
        .pipe(g.if(!PROD, g.livereload()));
});

gulp.task('copy-bootstrap-fonts', function(){
    return gulp.src(paths.bootstrapFonts)
        .pipe(gulp.dest(paths.build.fonts));
});

// transpile the js into a single minified file called 'app.min.js'
// sourcemaps don't seem to be working very well :(
gulp.task('compile-js', function() {
    var entryPath = 'webapp/src/app.js';
    var targetPath = 'webapp/app.min.js';
    var builderConfig = {
        minify: true,
        sourceMaps: true
    }
    return gulp.src(paths.build.src + '/**/*.js')
        .pipe(g.plumber({
            errorHandler: function (err) {
                console.log('plumber caught error in compile-js:' + err);
                this.emit('end');
            }
        }))
        .pipe(g.jspm.buildStatic(entryPath, targetPath, builderConfig))
//        .pipe(g.gzip())
        .pipe(gulp.dest(paths.build.main))
        .pipe(g.if(!PROD, g.livereload()));
});

// remove build directory for fresh build
gulp.task('clean', function() {
    del([
        paths.build.main
    ], {force: true});
});

gulp.task('make-version', function() {
    return g.file('version.txt', VERSION, {src: true})
        .pipe(gulp.dest(paths.build.src));
});

// main build task: copy all files, compile sass, compile js, concat vendor stuff
gulp.task('build', g.sequence('clean',
                              'copy-static',
                              'copy-src',
                              'make-version',
                              ['compile-js',
                               'compile-sass',
                               'copy-bootstrap-fonts',
                               'compile-vendor-js',
                               'compile-vendor-css']
));

var notifyError = function(erroredDir, error) {
    return gulp.src(paths[erroredDir])
        .pipe(g.notify(error));
}

var notifyRecompiled = function(recompiledElement) {
    return gulp.src(paths[recompiledElement])
        .pipe(g.notify('recompiled ' + recompiledElement));
}
gulp.task('notify-recompiled-scripts', function() {
    return notifyRecompiled('scripts');
});
gulp.task('notify-recompiled-html', function() {
    return notifyRecompiled('html');
});
gulp.task('notify-recompiled-sass', function() {
    return notifyRecompiled('sass');
});
gulp.task('notify-recompiled-static', function() {
    return notifyRecompiled('static');
});

// watch task to recompile when changes are saved
gulp.task('watch', function() {
    gulp.watch(paths.sass, gulpSync.sync(['compile-sass', 'notify-recompiled-sass']));
    gulp.watch(paths.scripts, gulpSync.sync(['copy-src', 'compile-js', 'notify-recompiled-scripts']));
    gulp.watch(paths.html, gulpSync.sync(['copy-src', 'copy-static', 'compile-js', 'notify-recompiled-html']));
    gulp.watch(paths.static, gulpSync.sync(['copy-static', 'notify-recompiled-static']));
});

// watches the build directory for changes and browserSyncs them
gulp.task('serve', function() {
    livereload.listen();
});

// default task: fresh build, watch, and serve
gulp.task('default', g.sequence('build', ['watch', 'serve']));
