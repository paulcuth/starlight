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

### Parse and run Lua in the browser
#### Build the lib
To use Starlight to parse Lua script tags in the brower, build the browser-lib:
```
grunt browser-lib
```
This will create `dist/bowser-lib/starlight.js` along with example usage in the same folder.

#### Basic use
If your target browsers don't support ES6 natively, you'll need to include Babel parser along with the Starlight browser-lib:
```html
<script src="//cdnjs.cloudflare.com/ajax/libs/babel-core/5.8.34/browser.min.js"></script>
<script src="./starlight.js" data-run-script-tags></script>
```

Notice the `data-run-script-tags` attribute on the Starlight `<script>` tag? That tells the browser-lib to find, parse and execute any other `<script>` tags with `type="application/x-lua"`.

So then just include your Lua in the page, like so:
```js
<script type="application/x-lua">
  print 'Hello Web'
</script>
```
#### Interacting with the DOM
The JavaScript `window` object is available with the same name, but be aware `window` ~= `_G`. You need to access all DOM properties through the `window` table, for example:
```lua
<script type="application/x-lua">
  window:alert 'hello'
  window.document:createElement 'div'
  window.navigator.geolocation:getCurrentPosition(successCallback, failCallback)
</script>
```

If you really want to access the properties of `window` in the global namespace, you can call `window.extract()`.
```lua
<script type="application/x-lua">
  window.extract()

  alert 'hello'
  document:createElement 'div'
  navigator.geolocation:getCurrentPosition(successCallback, failCallback)
</script>
```

Make sure you always use the colon syntax to call methods on the DOM, as in the examples above.


### Translate Lua files to ES6 in your Grunt build
[![NPM version number](https://img.shields.io/npm/v/grunt-starlight.svg?label=grunt-starlight)](https://www.npmjs.com/package/grunt-starlight)

To use Starlight to translate Lua to ES6 as part of your build pipeline, first install the plugin:
```
npm install grunt-starlight
```

Then, in your `Gruntfile`:
```
grunt.initConfig({
  starlight: {
    'hello-world': {
      src: 'src/lua/hello-world.lua',
      dest: 'dist/js/hello-world.lua.js',
    }
  }
});
```

You can also build many Lua files into a single JavaScript file, like the following example for building Starlight's own tests. Remember to set which file will execute first using `options.main`.
```
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
  }
});
```


## Get involved
[![Join the chat at https://gitter.im/paulcuth/starlight](https://img.shields.io/badge/gitter-join%20chat-green.svg)](https://gitter.im/paulcuth/starlight)

Please feel free to ask anything about the project on the [Gitter channel](https://gitter.im/paulcuth/starlight). Any pull requests for bugfixes, feature suggestions, etc. are gratefully appreciated.

If you're working on the Grunt plugin, you'll need to build that using:
```
grunt grunt-plugin
```

Any work on the parser or the runtime will require a default build. Note that for this to run, you'll need to have the Grunt plugin installed using `grunt grunt-plugin`.
```
grunt
```




## Roadmap
The next features to add:

- [ ] Performance tests
- [ ] Add plug-ins architecture
	- Coroutines (as generators are not a 1:1 map)
- [ ] Customisation of environment and plugins at build-time
	- Selectively add standard libs.
- [ ] Implement missing standard lib functions
	- string.format()
	- string.dump()
	- load()
	- loadfile()

