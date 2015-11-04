# Starlight

A Lua to ECMAScript 6 transpiler.

[![Circle CI](https://img.shields.io/circleci/project/paulcuth/starlight/master.svg?label=master)](https://circleci.com/gh/paulcuth/starlight/tree/master) [![Circle CI](https://img.shields.io/circleci/project/paulcuth/starlight/dev.svg?label=dev)](https://circleci.com/gh/paulcuth/starlight/tree/dev) ![Tagged version number](https://img.shields.io/github/tag/paulcuth/starlight.svg?color=brightgreen)



## Getting started
Install dependencies, then build the Grunt plugin:  
[![NPM version number](https://img.shields.io/npm/v/grunt-starlight.svg?label=grunt)](https://www.npmjs.com/package/grunt-starlight)
```
npm install
grunt grunt-plugin
npm link dist/build-tools/grunt-starlight
```

Build runtime, transpile tests, then run:
```
grunt
```

Tests will also be available to run in the browser at `dist/test/index.html`.


## Kitchen Sink
The Kitchen Sink edition of Starlight includes:
	- Starlight runtime, 
	- Starlight parser, 
	- DOMAPI 
	- a build of Babel.js

Together these elements will enable you to execute Lua source code from `<script>` tags in the browser. 

Around 85% of the file size of the Kitchen Sink is Babel, hence work is on the roadmap (below) to remove the need for it.

To build it:
```
grunt kitchen-sink
```

You'll then find the built file and example usage in `dist/kitchen-sink`.

## Get involved
[![Join the chat at https://gitter.im/paulcuth/starlight](https://img.shields.io/badge/gitter-join%20chat-green.svg)](https://gitter.im/paulcuth/starlighte)



## Roadmap
The next features to add:

- Performance tests
- Add plug-ins architecture
	- Coroutines (as generators are not a 1:1 map)
	- Lua -> ES5 (remove need for Babel in browser)
- Customisation of environment and plugins at build-time
	- Selectively add standard libs.
- Implement missing standard lib functions
	- string.format()
	- string.dump()
	- load()
	- loadfile()

