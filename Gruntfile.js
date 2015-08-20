
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
		concat: {
			'kitchen-sink': {
				src: [
					'dist/browser/starlight.js',
					'src/DOMAPI/DOMAPI.js',
					'node_modules/babel/node_modules/babel-core/browser.min.js',
					'dist/browser/parser.js'
				],
				dest: 'dist/kitchen-sink/starlight.js'
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
			},
			parser: {
				src: 'dist/browser/parser.js',
				dest: 'dist/browser/parser.js'
			},
			babel: {
				src: 'node_modules/babel/node_modules/babel-core/browser.min.js',
				dest: 'dist/browser/babel.js'
			},
			'kitchen-sink': {
				src: 'dist/kitchen-sink/starlight.js',
				dest: 'dist/kitchen-sink/starlight.js'
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
			test: {
				src: 'src/test/index.html',
				dest: 'dist/test/index.html'
			},
			'kitchen-sink': {
				files: {
					'dist/kitchen-sink/index.html': 'src/kitchen-sink/example.html',
					'dist/kitchen-sink/README.md': 'src/kitchen-sink/README.md'
				}
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
			},
			parser: {
				files: {
					'dist/browser/parser.js': ['dist/node/parser/index.js'],
				}
			}
		}
	});

	grunt.loadNpmTasks('grunt-starlight');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-babel');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-browserify');

	grunt.registerTask('grunt-plugin', ['copy:grunt-plugin', 'babel:grunt-plugin-common']);
	grunt.registerTask('runtime', ['babel:runtime', 'browserify:runtime', 'uglify:runtime']);
	grunt.registerTask('test', ['starlight:test', 'babel:test', 'browserify:test', 'uglify:test', 'copy:test']);
	grunt.registerTask('parser', ['babel:parser', 'babel:parser-codegen', 'browserify:parser', 'uglify:parser', 'uglify:babel']);
	grunt.registerTask('kitchen-sink', ['babel:runtime', 'browserify:runtime', 'babel:parser', 'babel:parser-codegen', 'browserify:parser', 'concat:kitchen-sink', 'uglify:kitchen-sink', 'copy:kitchen-sink']);

	grunt.registerTask('run-test', function () {
	    global.babel = { 
	    	transform: require('./node_modules/babel').transform
	    };
	    global.starlight = { config: { env: { getTimestamp: Date.now.bind(Date) } } };
	    require('./dist/node/parser/index.js');
	    require('./dist/node/index.js');
    	require('./dist/test/test.lua.js');
	})

	grunt.registerTask('default', ['runtime', 'babel:parser', 'babel:parser-codegen', 'test', 'run-test']);

};