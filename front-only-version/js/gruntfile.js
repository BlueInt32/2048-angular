﻿module.exports = function (grunt)
{

	require('load-grunt-tasks')(grunt);
	// Project configuration.
	grunt.initConfig({
		jshint: {
			all: ['app/app.js', 'app/directives.js', 'app/gameService.js', '!min.js']
		},
		uglify: {
			dist: {
				files: {
					'min.js'
						: [
							'bower_components/angular/angular.js',
							'bower_components/angular-animate/angular-animate.js',
							'bower_components/angular-cookies/angular-cookies.js',
							'app/gameService.js',
							'app/app.js',
							'app/directives.js'
							]
				}
			}
		},
		cssmin: {
			combine: {
				files: {
					'../Content/css/min.css': ['../Content/css/styles.css']
				}
			}
		},
		watch: {
			js: {
				files: ['**/*.js', '!**/*min.*'],
				tasks: ['jshint', 'uglify'],
				options: { spawn: false}
			},
			min: {
				files: ['../Content/css/**/*.css', '!../Content/css/min.css'],
				tasks: ['cssmin']
			}
		},
		imagemin: {   
			dynamic: {                         // Another target
				files: [{
					expand: true,                  // Enable dynamic expansion
					cwd: '../Content/images/elements/',                   // Src matches are relative to this path
					src: ['*.{png,gif}'],   // Actual patterns to match
					dest: '../Content/images/elements/min',// Destination path prefix
				}]
			},
			options: { spawn: false }
		},

		karma: {
			unit: {
				configFile: 'karma.conf.js'
			}
		}

	});


	grunt.registerTask('default', ['jshint', 'uglify', 'cssmin']);
};