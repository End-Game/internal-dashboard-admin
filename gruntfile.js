module.exports = function(grunt) {
	grunt.initConfig({
		jshint: {
			files: ['gruntfile.js', 'src/js/EndGameIntranet-admin.js'],
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
				files: ['src/**/*.html', 'src/**/*.css'],
			}
		},
		express: {
			all: {
				options: {
					port: 9000,
					hostname: "0.0.0.0",
					bases: ['src/'],
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
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-express');
	grunt.loadNpmTasks('grunt-open');
	grunt.registerTask('default', ['jshint']);
	grunt.registerTask('server', ['express', 'open', 'watch']);
};
