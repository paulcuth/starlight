/*
 * grunt-starlight
 * https://github.com/paulcuth/starlight
 *
 * Copyright (c) 2015 Paul Cuthbertson
 * Licensed under the MIT license.
 */

'use strict';

var parser = require('luaparse');
var codeGen = require('../lib/code-generator');
var getRuntimeInit = codeGen.getRuntimeInit;
var generateJS = codeGen.generateJS;
var path = require('path');


module.exports = function(grunt) {

  // Please see the Grunt documentation for more information regarding task
  // creation: http://gruntjs.com/creating-tasks

  grunt.registerMultiTask('starlight', 'A Lua -> ES6 transpiler', function() {
    // Merge task-specific and/or target-specific options with these defaults.
    var options = this.options({
      basePath: ''
    });

    var mainFilename = options.main;
    // var output = [];
    var fileCount = 0;
    var firstFilename;

    // Iterate over all specified file groups.
    this.files.forEach(function(f) {
      // Concat specified files.
      var src = f.src.filter(function(filepath) {
        // Warn on and remove invalid source files (if nonull was set).
        if (!grunt.file.exists(filepath)) {
          grunt.log.warn('Source file "' + filepath + '" not found.');
          return false;
        } else {
          return true;
        }
      }).map(function(filepath) {
        var content = grunt.file.read(filepath);
        var modpath = path.relative(options.basePath, filepath);
        modpath = modpath.replace(/\//g, '.').replace(/\.lua$/, '');

        if (!fileCount++) {
          firstFilename = modpath;
        }
        
        return ["\nrawset(package.preload, '", modpath, "', function(...) ", content, " end)\n"].join('');
      }).join('\n');

      if (mainFilename) {
        mainFilename = mainFilename.replace(/\//g, '.').replace(/\.lua$/, '');

      } else {
        mainFilename = firstFilename;
        if (fileCount > 1) {
          console.log("No main file specified, using '" + mainFilename + "'.");
          console.log("To specify the entry point, pass a config object to gulp-starlight with a 'main' property.");
        }
      }

      var start = "require'" + mainFilename + "'\n";
      var ast = parser.parse(src + start);
      var js = generateJS(ast);
      var runtimeInit = getRuntimeInit();
      js = ';(()=>{' + runtimeInit + js + '})();';

      // Write the destination file.
      grunt.file.write(f.dest, js);

      // Print a success message.
      grunt.log.writeln('File "' + f.dest + '" created.');
    });
  });

};
