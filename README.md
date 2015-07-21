# Starlight
A Lua to ECMAScript 6 transpiler.

---

## Getting started

### Using Grunt
Install dependencies:
```
npm install
```

Build the Grunt plugin:
```
grunt grunt-plugin
npm link dist/build-tools/grunt-starlight
```

Build runtime, transpile tests, then run:
```
grunt
```

Tests will also be available in the browser at `dist/test/index.html`.



### Using Gulp
* There are some async build issues at the moment related to Babel, but the following should build and test all the components of Starlight. *
Install dependencies:
```
npm install
```

Build the Gulp plugin:
```
gulp build-gulp-plugin
```

Build runtime and tests, then run tests:
```
gulp build-node-runtime
gulp build-node-test
gulp test
```


To build the runtime and tests for browser:
```
gulp build-node-runtime
gulp build-browser-runtime
gulp build-node-test
gulp build-test
```

