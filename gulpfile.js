const gulp = require('gulp');
const browserSync = require('browser-sync');
const nodemon = require('gulp-nodemon');

gulp.task('nodemon', cb => {
  let started = false;
  return nodemon({
    script: './server/main.js',
    watch: ['./server/**/*.js', './server/**/*.css']
  }).on('start', () => {
    if (!started) {
      cb();
      started = true;
    }
  });
});

gulp.task(
  'browser-sync',
  gulp.series('nodemon', () => {
    browserSync.init(null, {
      browser: "/opt/firefox/firefox-bin",
      proxy: 'http://localhost:3000',
      files: ['client/**/*.*', '!client/config.js'],
      port: 5000
    });
  })
);

gulp.task('default', gulp.parallel('browser-sync'));