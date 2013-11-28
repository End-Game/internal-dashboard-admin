module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		uglify: {
			options: {
				banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
			},
			dist: {
				files: ['app/**/*.js'],
				dest: 'build/<%= pkg.name %>.min.js'
			}
		},
		jshint: {
			files: ['gruntfile.js', 'app/scripts/*.js'],
			options: {
				globals: {
					jQuery: true,
					console: true,
					module: true
				}
			}
		},
		watch: {
			options: {
				livereload: true
			},
			js: {
				files: ['<%= jshint.files %>'],
				tasks: ['jshint']
			},
			html: {
				files: ['app/*.html', 'app/*.css'],
			}
		},
		express: {
			all: {
				options: {
					port: 9000,
					hostname: "0.0.0.0",
					bases: ['app/'],
					livereload: true
				}
			}
		},
		open: {
			all: {
				path: 'http://localhost:<%= express.all.options.port%>'
			}
		}
	});
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-express');
	grunt.loadNpmTasks('grunt-open');
	grunt.registerTask('default', ['jshint', 'uglify']);
	grunt.registerTask('server', ['express', 'open', 'watch']);
};
