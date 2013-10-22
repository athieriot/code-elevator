module.exports = function(grunt) {

  grunt.initConfig({
    watch: {
      hapi: {
        files: ['*.js'],
        tasks: ['hapi'],
        options: {
          spawn: false
        }
      }
    },
    hapi: {
      custom_options: {
        options: {
          server: require('path').resolve('./server')
        }
      }
    }
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-hapi');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('server', [
    'hapi',
    'watch'
  ]);
};
