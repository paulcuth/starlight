# Starlight

A Lua to ECMAScript 6 translator.
http://starlight.paulcuth.me.uk

[![Circle CI](https://img.shields.io/circleci/project/paulcuth/starlight/master.svg?label=master)](https://circleci.com/gh/paulcuth/starlight/tree/master) [![Circle CI](https://img.shields.io/circleci/project/paulcuth/starlight/dev.svg?label=dev)](https://circleci.com/gh/paulcuth/starlight/tree/dev) ![Tagged version number](https://img.shields.io/github/tag/paulcuth/starlight.svg?color=brightgreen)


## Using Starlight

For usage and examples please visit the Starlight documentation:
http://starlight.paulcuth.me.uk/docs



## Building Starlight
Checkout the repo and install dependencies:
```
git clone git@github.com:paulcuth/starlight.git
cd starlight
npm install
```

#### Build the browser-lib
To use Starlight to parse Lua script tags in the browser, build the browser-lib:
```
grunt browser-lib
```
This will create `dist/bowser-lib/starlight.js` along with example usage in the same folder.


### Build the Grunt plugin
[![NPM version number](https://img.shields.io/npm/v/grunt-starlight.svg?label=grunt-starlight)](https://www.npmjs.com/package/grunt-starlight)

To use Starlight to translate Lua to ES6 as part of the build pipeline, build the Grunt plugin:
```
grunt grunt-plugin
```
This will create the plugin in the `dist/build-tools/grunt-starlight` directory and also copy it to the project's `node_modules` directory.


## Get involved
[![Join the chat at https://gitter.im/paulcuth/starlight](https://img.shields.io/badge/gitter-join%20chat-green.svg)](https://gitter.im/paulcuth/starlight)

Please feel free to ask anything about the project on the [Gitter channel](https://gitter.im/paulcuth/starlight). Any pull requests for bugfixes, feature suggestions, etc. are gratefully appreciated.

Any work on the parser or the runtime will require a default build. Note that for this to run, you'll need to have the Grunt plugin installed using `grunt grunt-plugin`.
```
grunt
```

