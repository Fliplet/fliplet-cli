module.exports = function(grunt) {

  // Load the plugins
  require('grunt-contrib-watch')(grunt);
  require('grunt-contrib-handlebars')(grunt);

  // Project configuration
  grunt.initConfig({
    handlebars: {
      dist: {
        options: {
          namespace: 'Fliplet.Widget.Templates',
          processName: function(filePath) {
            const fileName = filePath
              .replace(/^js\//, '')
              .replace(/\.(interface|build)\.hbs$/, '')
              .replace(/\//g, '.');

            return fileName;
          }
        },
        files: {
          'js/interface.templates.js': '**/*.interface.hbs',
          'js/build.templates.js': '**/*.build.hbs'
        }
      }
    },
    watch: {
      handlebars: {
        files: ['**/*.hbs'],
        tasks: ['handlebars'],
        options: {
          spawn: false
        }
      }
    }
  });

  grunt.registerTask('build', ['handlebars']);

  // Default task for development
  grunt.registerTask('default', ['build', 'watch']);
};