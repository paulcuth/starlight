
module.exports = function(grunt) {
	require('grunt-task-loader')(grunt);

	grunt.initConfig({
		starlight: {
			test: {
				src: 'test/lua/**/*.lua',
				dest: 'dist/test/test.lua.js',
				options: {
					main: 'test-runner.lua',
					basePath: 'test/lua'
				}
			}
		},
		concat: {
			'browser-lib': {
				src: [
					'dist/browser/runtime.js',
					'src/DOMAPI/DOMAPI.js',
					'dist/browser/parser.js'
				],
				dest: 'dist/browser-lib/starlight.js'
			}
		},
		uglify: {
			test: {
				src: 'dist/test/test.lua.js',
				dest: 'dist/test/test.lua.js'
			},
			runtime: {
				src: 'dist/browser/runtime.js',
				dest: 'dist/browser/runtime.js'
			},
			parser: {
				src: 'dist/browser/parser.js',
				dest: 'dist/browser/parser.js'
			},
			babel: {
				src: 'node_modules/babel/node_modules/babel-core/browser.min.js',
				dest: 'dist/browser/babel.js'
			},
			'browser-lib': {
				src: 'dist/browser-lib/starlight.js',
				dest: 'dist/browser-lib/starlight.js'
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
						cwd: 'src/runtime/',
						dest: 'dist/node/',
						ext: '.js'
					}
				]
			},
			test: {
				src: 'dist/test/test.lua.js',
				dest: 'dist/test/test.lua.js'
			},
			parser: {
				files: [
					{
						expand: true,
						src: ['index.js'],
						cwd: 'src/parser/',
						dest: 'dist/node/parser/',
						ext: '.js'
					}
				]
			},
			'parser-codegen': {
				files: [
					{
						expand: true,
						src: ['*.js'],
						cwd: 'src/build-tools/common/',
						dest: 'dist/node/parser/',
						ext: '.js'
					}
				]
			},
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
			'grunt-plugin-module': {
				files: [
					{
						expand: true,
						src: ['**/*'],
						cwd: 'dist/build-tools/grunt-starlight/',
						dest: 'node_modules/grunt-starlight/'
					}
        			
  			],
			},
			test: {
				src: 'test/index.html',
				dest: 'dist/test/index.html'
			},
			'browser-lib': {
				files: {
					'dist/browser-lib/index.html': 'src/browser-lib/index.html',
					'dist/browser-lib/README.md': 'src/browser-lib/README.md'
				}
			}
		},
		browserify: {
			runtime: {
				files: {
					'dist/browser/runtime.js': ['dist/node/index.js'],
				}
			},
			test: {
				files: {
					'dist/test/test.lua.js': ['dist/test/test.lua.js'],
				}
			},
			parser: {
				files: {
					'dist/browser/parser.js': ['dist/node/parser/index.js'],
				}
			}
		}
	});


	grunt.registerTask('grunt-plugin', ['copy:grunt-plugin', 'babel:grunt-plugin-common', 'copy:grunt-plugin-module']);
	grunt.registerTask('runtime', ['babel:runtime', 'browserify:runtime', 'uglify:runtime']);
	grunt.registerTask('test', ['starlight:test', 'babel:test', 'browserify:test', 'uglify:test', 'copy:test']);
	grunt.registerTask('parser', ['babel:parser', 'babel:parser-codegen', 'browserify:parser', 'uglify:parser', 'uglify:babel']);
	grunt.registerTask('browser-lib', ['babel:runtime', 'browserify:runtime', 'babel:parser', 'babel:parser-codegen', 'browserify:parser', 'concat:browser-lib', 'uglify:browser-lib', 'copy:browser-lib']);


	grunt.registerTask('node-test', ['babel:parser', 'babel:parser-codegen', 'babel:runtime', 'starlight:test', 'babel:test', 'run-test']);

	grunt.registerTask('run-test', function () {
	    global.babel = { 
	    	transform: require('./node_modules/babel').transform
	    };
	    global.starlight = { config: { env: { 
	    	getTimestamp: Date.now.bind(Date),
	    	inspect: console.log.bind(console)
	    } } };
	    require('./dist/node/parser/index.js');
	    require('./dist/node/index.js');
    	require('./dist/test/test.lua.js');
	})

	grunt.registerTask('default', ['runtime', 'babel:parser', 'babel:parser-codegen', 'test', 'run-test']);

};