# Starlight

[![Join the chat at https://gitter.im/paulcuth/starlight](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/paulcuth/starlight?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
A Lua to ECMAScript 6 transpiler.

---

## Getting started
Install dependencies, then build the Grunt plugin:
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

