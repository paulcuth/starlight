# Starlight

A Lua to ECMAScript 6 transpiler.

[![Circle CI](https://img.shields.io/circleci/project/paulcuth/starlight/master.svg?label=master)](https://circleci.com/gh/paulcuth/starlight/tree/master) [![Circle CI](https://img.shields.io/circleci/project/paulcuth/starlight/dev.svg?label=dev)](https://circleci.com/gh/paulcuth/starlight/tree/dev) ![Tagged version number](https://img.shields.io/github/tag/paulcuth/starlight.svg?color=brightgreen)



## Getting started
Checkout the repo and install dependencies:
```
git clone git@github.com:paulcuth/starlight.git
cd starlight
npm install
```

### Use in the browser
To use Starlight to parse Lua script tags in the brower, build the browser-lib:
```
grunt browser-lib
```
This will create `dist/bowser-lib/starlight.js` along with example usage in the same folder.


### Use with Grunt
[![NPM version number](https://img.shields.io/npm/v/grunt-starlight.svg?label=grunt)](https://www.npmjs.com/package/grunt-starlight)
To use Starlight to transpile Lua to ES6 as part of your build pipeline, build the plugin:
```
grunt grunt-plugin
```

Build runtime, transpile tests, then run:
```
grunt
```

Tests will also be available to run in the browser at `dist/test/index.html`.

## Get involved
[![Join the chat at https://gitter.im/paulcuth/starlight](https://img.shields.io/badge/gitter-join%20chat-green.svg)](https://gitter.im/paulcuth/starlighte)



## Roadmap
The next features to add:

- [ ] Performance tests
- [ ]Add plug-ins architecture
	- Coroutines (as generators are not a 1:1 map)
- [ ] Customisation of environment and plugins at build-time
	- Selectively add standard libs.
- [ ] Implement missing standard lib functions
	- string.format()
	- string.dump()
	- load()
	- loadfile()

