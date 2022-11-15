module.exports = function(grunt, options = {}) {
  // Load the plugins
  require('grunt-contrib-watch')(grunt);
  require('grunt-contrib-handlebars')(grunt);

  grunt.registerTask('done', function() {
    if (typeof options.callback === 'function') {
      options.callback();
    }
  });

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
        files: options.hasNpmScript ? ['**/*.hbs'] : ['**/*.js', '**/*.scss', '**/*.css', '**/*.hbs'],
        tasks: ['handlebars', 'done'],
        options: {
          spawn: false
        }
      }
    }
  });

  grunt.registerTask('build', ['handlebars', 'done']);

  // Default task for development
  grunt.registerTask('default', ['build', 'watch']);
};
