
module.exports = function(grunt) {

	grunt.initConfig({
		starlight: {
			test: {
				src: 'src/test/lua/**/*.lua',
				dest: 'dist/test/test.lua.js',
				options: {
					main: 'test-runner.lua',
					basePath: 'src/test/lua'
				}
			}
		},
		uglify: {
			test: {
				src: 'dist/test/test.lua.js',
				dest: 'dist/test/test.lua.js'
			},
			runtime: {
				src: 'dist/browser/starlight.js',
				dest: 'dist/browser/starlight.js'
			}
		},
		babel: {
			'grunt-plugin-common': {
				files: [
					{
						expand: true,
						src: ['*.js'],
						cwd: 'src/build-tools/common/',
						dest: 'dist/build-tools/grunt-starlight/lib/',
						ext: '.js'
					}
				]
			},
			runtime: {
				files: [
					{
						expand: true,
						src: ['**/*.js'],
						cwd: 'src/starlight/',
						dest: 'dist/node/',
						ext: '.js'
					}
				]
			},
			test: {
				src: 'dist/test/test.lua.js',
				dest: 'dist/test/test.lua.js'
			}
		},
		copy: {
			'grunt-plugin': {
				files: [
					{
						expand: true,
						src: ['**/*'],
						cwd: 'src/build-tools/grunt/',
						dest: 'dist/build-tools/grunt-starlight/'
					}
        			
    			],
			},
			test: {
				src: 'src/test/index.html',
				dest: 'dist/test/index.html'
			}
		},
		browserify: {
			runtime: {
				files: {
					'dist/browser/starlight.js': ['dist/node/index.js'],
				}
			},
			test: {
				files: {
					'dist/test/test.lua.js': ['dist/test/test.lua.js'],
				}
			}
		}
	});

	grunt.loadNpmTasks('grunt-starlight');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-babel');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-browserify');

	grunt.registerTask('grunt-plugin', ['copy:grunt-plugin', 'babel:grunt-plugin-common']);
	grunt.registerTask('runtime', ['babel:runtime', 'browserify:runtime', 'uglify:runtime']);
	grunt.registerTask('test', ['starlight:test', 'babel:test', 'browserify:test', 'uglify:test', 'copy:test']);

	grunt.registerTask('run-test', function () {
	    global.starlight = { config: { env: { getTimestamp: Date.now.bind(Date) } } };
	    require('./dist/node/index.js');
    	require('./dist/test/test.lua.js');
	})

	grunt.registerTask('default', ['runtime', 'test', 'run-test']);

};