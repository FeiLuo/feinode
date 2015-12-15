module.exports = function(grunt) {
  'use strict';

  // Project configuration.
  var configFile = grunt.file.readJSON('./grunt/config.json', { encoding: 'utf8' });
  grunt.initConfig({
    pkg: configFile,
    port: 3030,
    banner: '/**\n' +
    ' * Fei Demo v<%= pkg.version %>\n' +
    ' * Copyright 2015 <%= pkg.author %>\n' +
    ' * Licensed under the <%= pkg.license %> license\n' +
    ' */',
    jqueryValidate: configFile.config.jqueryValidate.join('\n'),
    jqueryVersionValidate: configFile.config.jqueryVersionValidate.join('\n'),

    // clean folders
    clean: {
      dist: 'dist',
      docs: 'docs/dist'
    },

    // Validate files with JSHint
    //
    jshint: {
      options: {
        jshintrc: 'public/.jshintrc'
      },
      grunt: {
        options: {
          jshintrc: 'grunt/.jshintrc'
        },
        src: ['Gruntfile.js', 'grunt/*.js']
      },
      core: {
        src: 'public/*.js'
      },
      docs: {
        src:'docs/public/*.js'
      },
      test: {
        options: {
          jshintrc: 'tests/unit/.jshintrc'
        },
        src: 'tests/unit/*.js'
      },
      assets: {
        src: [
          'docs/assets/public/src/*.js',
          'docs/assets/public/*.js',
          '!docs/assets/public/*.min.js'
        ]
      }
    },

    // checking JavaScript Code Style with jscs.
    jscs: {
      options: {
        config: 'public/.jscsrc'
      },
      grunt: {
        src: '<%= jshint.grunt.src %>'
      },
      core: {
        src: '<%= jshint.core.src %>'
      },
      test: {
        src: '<%= jshint.test.src %>'
      },
      assets: {
        options: {
          requireCamelCaseOrUpperCaseIdentifiers: null
        },
        src: '<%= jshint.assets.src %>'
      }
    },

    // Concatenate files
    concat: {
      options: {
        banner: '<%= banner %>\n<%= jqueryValidate %>\n<%= jqueryVersionValidate %>',
        stripBanners: false
      },
      core: {
        src: [
          'public/main.js'
        ],
        dest: 'dist/public/<%= pkg.name %>.js'
      }
    },

    // Minify files with UglifyJS
    uglify: {
      options: {
        banner: '<%= banner %>\n',
        preserveComments: 'some'
      },
      build: {
        src: '<%= concat.core.dest %>',
        dest: 'dist/public/<%= pkg.name %>.min.js'
      }
    },

    // Automated cross-browser JavaScript testing made easy
    testee: {
      local: {
        options: {
          reporter: 'Spec',
          browsers: ['chrome', 'firefox', 'safari']
        },
        src: ['tests/test.html']
      },
      spec: {
        options: {
          reporter: 'Spec'
        },
        src: ['tests/test.html']
      },
      ci: {
        options: {
          reporter: 'XUnit'
        },
        src: ['tests/test.html']
      }
    },

    // Compile LESS files to CSS
    less: {
      compile: {
        options: {
          strictMath: true,
          sourceMap: true,
          outputSourceFiles: true,
          sourceMapURL: '<%= pkg.name %>.css.map',
          sourceMapFilename: 'dist/css/<%= pkg.name %>.css.map'
        },
        src: 'less/bootstrap.less',
        dest: 'dist/css/<%= pkg.name %>.css'
      }
    },

    // Compress CSS files
    cssmin: {
      options: {
        compatibility: 'ie8',
        keepSpecialComments: '*',
        advanced: false
      },
      minify: {
        src: 'dist/css/<%= pkg.name %>.css',
        dest: 'dist/css/<%= pkg.name %>.min.css'
      }
    },

    // grunt-banner: Adds a simple banner to files
    usebanner: {
      options: {
        position: 'top',
        banner: '<%= banner %>',
        linebreak: true
      },
      files: {
        src: 'dist/css/*.css'
      }
    },

    // CSS coding style formatter
    csscomb: {
      options: {
        config: 'less/.csscomb.json'
      },
      dist: {
        expand: true,
        cwd: 'dist/css/',
        src: ['*.css', '!*.min.css'],
        dest: 'dist/css/'
      }
    },

    // prefixing css using rework
    css_prefix: {
      thirdparty: {
        options: {
          prefix: 'fei-'
        },
        files: {
          'dist/css/<%= pkg.name %>.css': ['dist/css/<%= pkg.name %>.css']
        }
      }
    },

    copy: {
      fonts: {
        expand: true,
        src: 'fonts/*',
        dest: 'dist/'
      },
      "dist-css-to-docs": {
        src: 'dist/css/<%= pkg.name %>.min.css',
        dest: 'docs/'
      },
      "images-to-docs": {
        src: 'images/*',
        dest: 'docs/dist/'
      },
      "fonts-to-docs": {
        expand: true,
        src: 'fonts/*',
        dest: 'docs/dist/'
      },
      "js-to-docs": {
        src: 'dist/public/<%= pkg.name %>.js',
        dest: 'docs/'
      }
    },

    open: {
      dev: {
        url: 'http://localhost:<%= port %>',
        options: {
          delay: 500
        }
      }
    },

    exec: {
      pull: 'npm install',
      docs: './node_modules/.bin/kss-node --config kss-config.json',
      npmUpdate: {
        command: 'npm update'
      },
      run: 'node server.js'
    }
  });


  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-csslint');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-css-prefix');
  grunt.loadNpmTasks('grunt-csscomb');
  grunt.loadNpmTasks('grunt-exec');
  grunt.loadNpmTasks('grunt-banner');
  grunt.loadNpmTasks('grunt-open');
  grunt.loadNpmTasks('grunt-jscs');
  grunt.loadNpmTasks('testee');

  // Default task(s).
  grunt.registerTask('default', ['uglify']);
  grunt.registerTask('test:local', ['validate-js', 'testee:local']);
  grunt.registerTask('test:spec', ['validate-js', 'compile-less', 'testee:spec']);
  grunt.registerTask('test:ci', ['validate-js', 'compile-less', 'testee:ci']);
  grunt.registerTask('validate-js', ['jshint:core', 'jshint:test', 'jscs:core', 'jscs:test']);
  grunt.registerTask('compile-less', ['less:compile', 'csscomb:dist', 'css_prefix', 'cssmin:minify', 'usebanner', 'csslint:dist']);
  grunt.registerTask('compile-js', ['concat', 'uglify']);
  grunt.registerTask('compile', ['validate-js', 'clean:dist', 'compile-less', 'compile-js', 'copy:images', 'copy:fonts', 'docs']);
  grunt.registerTask('pull', ['exec:pull']);
  grunt.registerTask('docs', ['clean:docs', 'copy:fonts-to-docs', 'copy:dist-css-to-docs', 'copy:images-to-docs', 'copy:js-to-docs', 'exec:docs']);
  grunt.registerTask('run', ['open:dev', 'exec:run']);
};