
(function (starlight) {
	var T = starlight.runtime.T;
	var _G = starlight.runtime.globalScope;
	var getn = _G.get('table').get('getn');

	function jsToLua (obj) {
		var t, mt;

		mt = new T({

			__index: function (t, key) {
				if (obj === void 0 || obj === null) {
					throw new starlight.runtime.LuaError('attempt to index a nil value');
				}

				if (typeof(key) == 'number') {
					key--;
				}

				var property = obj[key],
					i, children, child;

				// Bind methods to object and convert args and return values
				if (typeof property == 'function' || (property && property.prototype && typeof property.prototype.constructor == 'function')) {	// KLUDGE: Safari reports native constructors as objects, not functions :-s
					var f = function () {
						var args = convertArguments(arguments, luaToJS),
							retval = property.apply(args.shift(), args);

						if (typeof retval == 'object') return jsToLua(retval);
						return [retval];
					};

					// Add static methods, etc
					if (Object.getOwnPropertyNames) {
						children = Object.getOwnPropertyNames(property);

						for (i = 0; child = children[i]; i++) {
							if (child == 'caller' || child == 'callee' || child == 'arguments') continue;	// Avoid issues in strict mode. Fixes moonshine issue #24. 
							f[child] = property[child];
						}
					}

					// Add a new method for instantiating classes
					f.new = function () { 
						var args = convertArguments(arguments, luaToJS),
							argStr,
							obj,
							i, l;

						argStr = (l = args.length)? 'args[0]' : '';
						for (i = 1; i < l; i++) argStr += ',args[' + i + ']';

						obj = eval('new property(' + argStr + ')');
						return jsToLua(obj);
					};

					return f;
				}

				// Recurse down properties
				if (typeof property == 'object') return jsToLua(property);

				// Return primatives as is
				return property;
			},


			__newindex: function (t, key, val) {
				if (typeof(key) == 'number') {
					key++;
				}

				obj[key] = luaToJS(val);
			}

		});

		mt.source = obj;
		t = new T();

		// Return proxy table
		t.metatable = mt;
		return t;
	}




	function luaToJS (val) {
		var mt;

		if (val instanceof T) {
			// If object has been wrapped by jsToLua(), use original object instead
			if ((mt = val.metatable) && mt.source) {
				return mt.source;
			}

			// Else iterate over table
			var isArr = getn(val) > 0,
				result = isArr? [] : {},
				numValues = val.numValues,
				strValues = val.strValues,
				i,
				l = numValues.length;

			for (i = 1; i < l; i++) {
				result[i - 1] = (numValues[i] instanceof T)? luaToJS(numValues[i]) : numValues[i];
			}

			for (i in strValues) {
				if (strValues.hasOwnProperty(i)) {
					result[i] = (val[i] instanceof T)? luaToJS(val[i]) : val[i];
				}
			}
			
			return result;
		}

		return val;
	}




	function convertArguments (arguments, translateFunc) {
		var args = [], i, l;

		for (i = 0, l = arguments.length; i < l; i++) {
			args.push(translateFunc(arguments[i]));
		}

		return args;
	};




	// Create wrapped window API
	var win = jsToLua(window);
	_G.set('window', win);


	// Add extact method
	win.set('extract', function () {
		var val, i;
		var obj = window;

		do {
	    Object.getOwnPropertyNames(obj).forEach(function (key) {

				if (key !== 'print' && key !== 'window' && win[i] !== null) {
					try {
						val = _G.get('window').get(key);
					} catch (e) {
						val = function () {
							throw new starlight.runtime.LuaError('error accessing property: ' + e.message);
						}
					}
					
					_G.set(key, typeof val == 'function' ? val.bind(void 0, window) : val);
				}

   		});
		} while (obj = Object.getPrototypeOf(obj));
	});


})(window.starlight);
