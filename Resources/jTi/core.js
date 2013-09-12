var documentElement = [],
//element cache
elementDOMCache = {},
//event cache
eventCache = {};

(function(root, undefined) {

	// Map over jQuery in case of overwrite
	var _jTi = root.jTi,

	// Map over the $ in case of overwrite
	_$ = root.$,

	// [[Class]] -> type pairs
	class2type = {},

	// List of deleted data cache ids, so we can reuse them
	core_deletedIds = [],

	// Save a reference to some core methods
	core_concat = core_deletedIds.concat, core_push = core_deletedIds.push, core_slice = core_deletedIds.slice, core_indexOf = core_deletedIds.indexOf, core_toString = class2type.toString, core_hasOwn = class2type.hasOwnProperty, core_trim = ''.trim,

	//Instance of core framework
	jTi = function(selector, context) {
		return new jTi.fn.init(selector, context);
	},

	// Used for matching numbers
	core_pnum = /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source,

	// Used for splitting on whitespace
	core_rnotwhite = /\S+/g,

	// A simple way to check for HTML strings
	// Prioritize #id over <tag> to avoid XSS via location.hash (#9521)
	// Strict HTML recognition (#11290: must start with <)
	//rquickExpr = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]*))$/,
	rquickExpr = /^(?:#([\w-]*))$/,

	// Match a standalone tag
	rsingleTag = /^<(\w+)\s*\/?>(?:<\/\1>|)$/,

	// Matches dashed string for camelizing
	rmsPrefix = /^-ms-/, rdashAlpha = /-([\da-z])/gi,

	// Used by jTi.camelCase as callback to replace()
	fcamelCase = function(all, letter) {
		return letter.toUpperCase();
	};

	jTi.fn = jTi.prototype = {
		version : 1.0,
		constructor : jTi,
		selector : '',
		length : 0,
		init : function(selector, context) {
			var match, elem;
			if (!selector) {
				return this;
			}
			if ( typeof selector === "string") {
				match = rquickExpr.exec(selector);
				if (match && match[1]) {
					if (elementDOMCache.hasOwnProperty(match[1])) {
						elem = elementDOMCache[match[1]].DOM;
						this.length = 1;
						this[0] = elem;
					}
					this.selector = selector;
					this.context = documentElement;
					return this;
				} else if (!context) {
					this.context = documentElement;
					return this.constructor(documentElement).find(selector);

					// HANDLE: $(expr, context)
					// (which is just equivalent to: $(context).find(expr)
				} else {
					this.context = context;
					return this.constructor(context).find(selector);
				}
			} else if (jTi.isDOM(selector)) {
				this[0] = selector;
				this.length = 1;
				this.selector = '#' + selector.id;
				this.context = selector;
				return this;
			}

			if (selector.selector !== undefined) {
				this.selector = selector.selector;
				this.context = selector.context;
			}
			return jTi.makeArray(selector, this);
		},
		toArray : function() {
			return [].slice.call(this);
		},
		toEnumerable : function() {
			// return jTi.toEnumerable(this, function(e) {
			// return jTi(e);
			// });
			return jTi.toEnumerable(this);
		},
		get : function(num) {
			return num == null ?

			// Return a 'clean' array
			this.toArray() :

			// Return just the object
			(num < 0 ? this[this.length + num] : this[num] );
		},
		size : function() {
			return this.length;
		},
		// Take an array of elements and push it onto the stack
		// (returning the new matched element set)
		pushStack : function(elems) {

			// Build a new jQuery matched element set
			var ret = jTi.merge(this.constructor(), elems);

			// Add the old object onto the stack (as a reference)
			ret.prevObject = this;

			// Return the newly-formed element set
			return ret;
		},

		// Execute a callback for every element in the matched set.
		// (You can seed the arguments with an array of args, but this is
		// only used internally.)
		each : function(callback, args) {
			return jTi.each(this, callback, args);
		},

		slice : function() {
			return this.pushStack(core_slice.apply(this, arguments));
		},

		first : function() {
			return this.eq(0);
		},

		last : function() {
			return this.eq(-1);
		},

		eq : function(i) {
			var len = this.length, j = +i + (i < 0 ? len : 0 );
			return this.pushStack(j >= 0 && j < len ? [this[j]] : []);
		},

		map : function(callback) {
			return this.pushStack(jTi.map(this, function(elem, i) {
				return callback.call(elem, i, elem);
			}));
		},

		end : function() {
			return this.prevObject || this.constructor(null);
		},

		// For internal use only.
		// Behaves like an Array's method, not like a jQuery method.
		push : core_push,
		indexOf : core_indexOf,
		sort : [].sort,
		splice : [].splice
	};
	jTi.fn.init.prototype = jTi.fn;

	jTi.extend = jTi.fn.extend = function() {
		var options, name, src, copy, copyIsArray, clone, target = arguments[0] || {}, i = 1, length = arguments.length, deep = false;

		// Handle a deep copy situation
		if ( typeof target === "boolean") {
			deep = target;
			target = arguments[1] || {};
			// skip the boolean and the target
			i = 2;
		}

		// Handle case when target is a string or something (possible in deep copy)
		if ( typeof target !== "object" && ! jTi.isFunction(target)) {
			target = {};
		}

		// extend jTi itself if only one argument is passed
		if (length === i) {
			target = this;
			--i;
		}

		for (; i < length; i++) {
			// Only deal with non-null/undefined values
			if (( options = arguments[i]) != null) {
				// Extend the base object
				for (name in options ) {
					src = target[name];
					copy = options[name];

					// Prevent never-ending loop
					if (target === copy) {
						continue;
					}

					// Recurse if we're merging plain objects or arrays
					if (deep && copy && (jTi.isPlainObject(copy) || ( copyIsArray = jTi.isArray(copy)) )) {
						if (copyIsArray) {
							copyIsArray = false;
							clone = src && jTi.isArray(src) ? src : [];

						} else {
							clone = src && jTi.isPlainObject(src) ? src : {};
						}

						// Never move original objects, clone them
						target[name] = jTi.extend(deep, clone, copy);

						// Don't bring in undefined values
					} else if (copy !== undefined) {
						target[name] = copy;
					}
				}
			}
		}

		// Return the modified object
		return target;
	};

	jTi.extend({
		noConflict : function(deep) {
			if (root.$ === jTi) {
				root.$ = _$;
			}

			if (deep && root.jTi === jTi) {
				root.jTi = _jTi;
			}

			return jTi;
		},

		type : function(obj) {
			if (obj == null) {
				return String(obj);
			}
			// Support: Safari <= 5.1 (functionish RegExp)
			return typeof obj === "object" || typeof obj === "function" ? class2type[ core_toString.call(obj)] || "object" : typeof obj;
		},

		isAndroid : function() {
			return Ti.Platform.name === 'android';
		},
		
		isFunction : function(obj) {
			return jTi.type(obj) === "function";
		},

		isArray : Array.isArray,

		isWindow : function(obj) {
			return obj && obj['xtype'] === 'window' && jTi.inArray(obj, documentElement);
		},
		isDOM : function(obj) {
			return obj && typeof obj['id'] === "string" && elementDOMCache.hasOwnProperty(obj['id']);
		},
		isNumeric : function(obj) {
			return !isNaN(parseFloat(obj)) && isFinite(obj);
		},
		isPlainObject : function(obj) {
			// Not plain objects:
			// - Any object or value whose internal [[Class]] property is not "[object Object]"
			// - DOM nodes
			// - window
			if (jTi.type(obj) !== "object" || jTi.isDOM(obj)) {
				return false;
			}

			// Support: Firefox <20
			// The try/catch suppresses exceptions thrown when attempting to access
			// the "constructor" property of certain host objects, ie. |window.location|
			// https://bugzilla.mozilla.org/show_bug.cgi?id=814622
			try {
				if (obj.constructor && ! core_hasOwn.call(obj.constructor.prototype, "isPrototypeOf")) {
					return false;
				}
			} catch ( e ) {
				return false;
			}

			// If the function hasn't returned already, we're confident that
			// |obj| is a plain object, created by {} or constructed with new Object
			return true;
		},

		isEmptyObject : function(obj) {
			var name;
			for (name in obj ) {
				return false;
			}
			return true;
		},

		error : function(msg) {
			throw new Error(msg);
		},

		camelCase : function(string) {
			return string.replace(rmsPrefix, "ms-").replace(rdashAlpha, fcamelCase);
		},

		nodeName : function(elem, name) {
			return elem.xtype && elem.xtype.toLowerCase() === name.toLowerCase();
		},

		nodePath : function(elem) {
			return elementDOMCache[jTi.isDOM(elem) ? elem.id : elem].Path;
		},

		// args is for internal usage only
		each : function(obj, callback, args) {
			var value, i = 0, length = obj.length, isArray = isArraylike(obj);

			if (args) {
				if (isArray) {
					for (; i < length; i++) {
						value = callback.apply(obj[i], args);

						if (value === false) {
							break;
						}
					}
				} else {
					for (i in obj ) {
						value = callback.apply(obj[i], args);

						if (value === false) {
							break;
						}
					}
				}

				// A special, fast, case for the most common use of each
			} else {
				if (isArray) {
					for (; i < length; i++) {
						value = callback.call(obj[i], i, obj[i]);

						if (value === false) {
							break;
						}
					}
				} else {
					for (i in obj ) {
						value = callback.call(obj[i], i, obj[i]);

						if (value === false) {
							break;
						}
					}
				}
			}

			return obj;
		},

		trim : function(text) {
			return text == null ? "" : core_trim.call(text);
		},

		// results is for internal usage only
		makeArray : function(arr, results) {
			var ret = results || [];

			if (arr != null) {
				if (isArraylike(Object(arr))) {
					jTi.merge(ret, typeof arr === "string" ? [arr] : arr);
				} else {
					core_push.call(ret, arr);
				}
			}

			return ret;
		},

		inArray : function(elem, arr, i) {
			return arr == null ? -1 : core_indexOf.call(arr, elem, i);
		},

		merge : function(first, second) {
			var l = second.length, i = first.length, j = 0;

			if ( typeof l === "number") {
				for (; j < l; j++) {
					first[i++] = second[j];
				}
			} else {
				while (second[j] !== undefined) {
					first[i++] = second[j++];
				}
			}

			first.length = i;

			return first;
		},

		grep : function(elems, callback, inv) {
			var retVal, ret = [], i = 0, length = elems.length;
			inv = !!inv;

			// Go through the array, only saving the items
			// that pass the validator function
			for (; i < length; i++) {
				retVal = !!callback(elems[i], i);
				if (inv !== retVal) {
					ret.push(elems[i]);
				}
			}

			return ret;
		},

		// arg is for internal usage only
		map : function(elems, callback, arg) {
			var value, i = 0, length = elems.length, isArray = isArraylike(elems), ret = [];

			// Go through the array, translating each of the items to their
			if (isArray) {
				for (; i < length; i++) {
					value = callback(elems[i], i, arg);

					if (value != null) {
						ret[ret.length] = value;
					}
				}

				// Go through every key on the object,
			} else {
				for (i in elems ) {
					value = callback(elems[i], i, arg);

					if (value != null) {
						ret[ret.length] = value;
					}
				}
			}

			// Flatten any nested arrays
			return core_concat.apply([], ret);
		},

		// Multifunctional method to get and set values of a collection
		// The value/s can optionally be executed if it's a function
		access : function(elems, fn, key, value, chainable, emptyGet, raw) {
			var i = 0, length = elems.length, bulk = key == null;

			// Sets many values
			if ( typeof key === 'object') {
				chainable = true;
				for (i in key ) {
					jTi.access(elems, fn, i, key[i], true, emptyGet, raw);
				}

				// Sets one value
			} else if (value !== undefined) {
				chainable = true;

				if (!jTi.isFunction(value)) {
					raw = true;
				}

				if (bulk) {
					// Bulk operations run against the entire set
					if (raw) {
						fn.call(elems, value);
						fn = null;

						// ...except when executing function values
					} else {
						bulk = fn;
						fn = function(elem, key, value) {
							return bulk.call(jTi(elem), value);
						};
					}
				}

				if (fn) {
					for (; i < length; i++) {
						fn(elems[i], key, raw ? value : value.call(elems[i], i, fn(elems[i], key)));
					}
				}
			}

			return chainable ? elems :

			// Gets
			bulk ? fn.call(elems) : length ? fn(elems[0], key) : emptyGet;
		},

		now : Date.now,

		// A method for quickly swapping in/out CSS properties to get correct calculations.
		// Note: this method belongs to the css module but it's needed here for the support module.
		// If support gets modularized, this method should be moved back to the css module.
		swap : function(elem, options, callback, args) {
			var ret, name, old = {};

			// Remember the old values, and insert the new ones
			for (name in options ) {
				old[name] = elem.style[name];
				elem.style[name] = options[name];
			}

			ret = callback.apply(elem, args || []);

			// Revert the old values
			for (name in options ) {
				elem.style[name] = old[name];
			}

			return ret;
		},
		toEnumerable : function(elem, predicate) {
			/// <summary>each contains elements. to Enumerable current context.</summary>
			// if ( elem instanceof jTi) {
			// elem = elem.toArray();
			// }
			var enumerable = root.Enumerable.from(elem);
			if (jTi.isFunction(predicate)) {
				return enumerable.select(predicate);
			} else {
				return enumerable;
			}
		},
		fixFolder : function() {
			var args = arguments, i = 0, path = '';
			for (; i < args.length; i++) {
				path += args[i];
				if (i < args.length - 1 && args[i].substring(args[i].length - 1, args[i].length) != '/') {
					path += '/';
				}
			}
			return path;
		}
	});

	// Populate the class2type map
	jTi.each("Boolean Number String Function Array Date RegExp Object Error".split(" "), function(i, name) {
		class2type["[object " + name + "]"] = name.toLowerCase();
	});

	function isArraylike(obj) {
		var length = obj.length, type = jTi.type(obj);

		if (jTi.isWindow(obj) || jTi.isDOM(obj)) {
			return false;
		}

		if ( obj instanceof jTi && length) {
			return true;
		}

		return type === "array" || type !== "function" && (length === 0 || typeof length === "number" && length > 0 && (length - 1 ) in obj );
	}

	// module export
	if ( typeof define === 'function' && define.amd) {// AMD
		define("$", [], function() {
			return jTi;
		});
		define("jTi", [], function() {
			return jTi;
		});
	} else if ( typeof module !== 'undefined' && module.exports) {// Node
		module.exports = jTi;
	} else {
		root.$ = root.jTi = jTi;
	}
})(this);
