/*!
 * jQuery JavaScript Library v1.8.3
 * http://jquery.com/
 *
 * Includes Sizzle.js
 * http://sizzlejs.com/
 *
 * Copyright 2012 jQuery Foundation and other contributors
 * Released under the MIT license
 * http://jquery.org/license
 *
 * Date: Tue Nov 13 2012 08:20:33 GMT-0500 (Eastern Standard Time)
 */
(function( window, undefined ) {
var
	// A central reference to the root jQuery(document)
	rootjQuery,

	// The deferred used on DOM ready
	readyList,

	// Use the correct document accordingly with window argument (sandbox)
	document = window.document,
	location = window.location,
	navigator = window.navigator,

	// Map over jQuery in case of overwrite
	_jQuery = window.jQuery,

	// Map over the $ in case of overwrite
	_$ = window.$,

	// Save a reference to some core methods
	core_push = Array.prototype.push,
	core_slice = Array.prototype.slice,
	core_indexOf = Array.prototype.indexOf,
	core_toString = Object.prototype.toString,
	core_hasOwn = Object.prototype.hasOwnProperty,
	core_trim = String.prototype.trim,

	// Define a local copy of jQuery
	jQuery = function( selector, context ) {
		// The jQuery object is actually just the init constructor 'enhanced'
		return new jQuery.fn.init( selector, context, rootjQuery );
	},

	// Used for matching numbers
	core_pnum = /[\-+]?(?:\d*\.|)\d+(?:[eE][\-+]?\d+|)/.source,

	// Used for detecting and trimming whitespace
	core_rnotwhite = /\S/,
	core_rspace = /\s+/,

	// Make sure we trim BOM and NBSP (here's looking at you, Safari 5.0 and IE)
	rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,

	// A simple way to check for HTML strings
	// Prioritize #id over <tag> to avoid XSS via location.hash (#9521)
	rquickExpr = /^(?:[^#<]*(<[\w\W]+>)[^>]*$|#([\w\-]*)$)/,

	// Match a standalone tag
	rsingleTag = /^<(\w+)\s*\/?>(?:<\/\1>|)$/,

	// JSON RegExp
	rvalidchars = /^[\],:{}\s]*$/,
	rvalidbraces = /(?:^|:|,)(?:\s*\[)+/g,
	rvalidescape = /\\(?:["\\\/bfnrt]|u[\da-fA-F]{4})/g,
	rvalidtokens = /"[^"\\\r\n]*"|true|false|null|-?(?:\d\d*\.|)\d+(?:[eE][\-+]?\d+|)/g,

	// Matches dashed string for camelizing
	rmsPrefix = /^-ms-/,
	rdashAlpha = /-([\da-z])/gi,

	// Used by jQuery.camelCase as callback to replace()
	fcamelCase = function( all, letter ) {
		return ( letter + "" ).toUpperCase();
	},

	// The ready event handler and self cleanup method
	DOMContentLoaded = function() {
		if ( document.addEventListener ) {
			document.removeEventListener( "DOMContentLoaded", DOMContentLoaded, false );
			jQuery.ready();
		} else if ( document.readyState === "complete" ) {
			// we're here because readyState === "complete" in oldIE
			// which is good enough for us to call the dom ready!
			document.detachEvent( "onreadystatechange", DOMContentLoaded );
			jQuery.ready();
		}
	},

	// [[Class]] -> type pairs
	class2type = {};

jQuery.fn = jQuery.prototype = {
	constructor: jQuery,
	init: function( selector, context, rootjQuery ) {
		var match, elem, ret, doc;

		// Handle $(""), $(null), $(undefined), $(false)
		if ( !selector ) {
			return this;
		}

		// Handle $(DOMElement)
		if ( selector.nodeType ) {
			this.context = this[0] = selector;
			this.length = 1;
			return this;
		}

		// Handle HTML strings
		if ( typeof selector === "string" ) {
			if ( selector.charAt(0) === "<" && selector.charAt( selector.length - 1 ) === ">" && selector.length >= 3 ) {
				// Assume that strings that start and end with <> are HTML and skip the regex check
				match = [ null, selector, null ];

			} else {
				match = rquickExpr.exec( selector );
			}

			// Match html or make sure no context is specified for #id
			if ( match && (match[1] || !context) ) {

				// HANDLE: $(html) -> $(array)
				if ( match[1] ) {
					context = context instanceof jQuery ? context[0] : context;
					doc = ( context && context.nodeType ? context.ownerDocument || context : document );

					// scripts is true for back-compat
					selector = jQuery.parseHTML( match[1], doc, true );
					if ( rsingleTag.test( match[1] ) && jQuery.isPlainObject( context ) ) {
						this.attr.call( selector, context, true );
					}

					return jQuery.merge( this, selector );

				// HANDLE: $(#id)
				} else {
					elem = document.getElementById( match[2] );

					// Check parentNode to catch when Blackberry 4.6 returns
					// nodes that are no longer in the document #6963
					if ( elem && elem.parentNode ) {
						// Handle the case where IE and Opera return items
						// by name instead of ID
						if ( elem.id !== match[2] ) {
							return rootjQuery.find( selector );
						}

						// Otherwise, we inject the element directly into the jQuery object
						this.length = 1;
						this[0] = elem;
					}

					this.context = document;
					this.selector = selector;
					return this;
				}

			// HANDLE: $(expr, $(...))
			} else if ( !context || context.jquery ) {
				return ( context || rootjQuery ).find( selector );

			// HANDLE: $(expr, context)
			// (which is just equivalent to: $(context).find(expr)
			} else {
				return this.constructor( context ).find( selector );
			}

		// HANDLE: $(function)
		// Shortcut for document ready
		} else if ( jQuery.isFunction( selector ) ) {
			return rootjQuery.ready( selector );
		}

		if ( selector.selector !== undefined ) {
			this.selector = selector.selector;
			this.context = selector.context;
		}

		return jQuery.makeArray( selector, this );
	},

	// Start with an empty selector
	selector: "",

	// The current version of jQuery being used
	jquery: "1.8.3",

	// The default length of a jQuery object is 0
	length: 0,

	// The number of elements contained in the matched element set
	size: function() {
		return this.length;
	},

	toArray: function() {
		return core_slice.call( this );
	},

	// Get the Nth element in the matched element set OR
	// Get the whole matched element set as a clean array
	get: function( num ) {
		return num == null ?

			// Return a 'clean' array
			this.toArray() :

			// Return just the object
			( num < 0 ? this[ this.length + num ] : this[ num ] );
	},

	// Take an array of elements and push it onto the stack
	// (returning the new matched element set)
	pushStack: function( elems, name, selector ) {

		// Build a new jQuery matched element set
		var ret = jQuery.merge( this.constructor(), elems );

		// Add the old object onto the stack (as a reference)
		ret.prevObject = this;

		ret.context = this.context;

		if ( name === "find" ) {
			ret.selector = this.selector + ( this.selector ? " " : "" ) + selector;
		} else if ( name ) {
			ret.selector = this.selector + "." + name + "(" + selector + ")";
		}

		// Return the newly-formed element set
		return ret;
	},

	// Execute a callback for every element in the matched set.
	// (You can seed the arguments with an array of args, but this is
	// only used internally.)
	each: function( callback, args ) {
		return jQuery.each( this, callback, args );
	},

	ready: function( fn ) {
		// Add the callback
		jQuery.ready.promise().done( fn );

		return this;
	},

	eq: function( i ) {
		i = +i;
		return i === -1 ?
			this.slice( i ) :
			this.slice( i, i + 1 );
	},

	first: function() {
		return this.eq( 0 );
	},

	last: function() {
		return this.eq( -1 );
	},

	slice: function() {
		return this.pushStack( core_slice.apply( this, arguments ),
			"slice", core_slice.call(arguments).join(",") );
	},

	map: function( callback ) {
		return this.pushStack( jQuery.map(this, function( elem, i ) {
			return callback.call( elem, i, elem );
		}));
	},

	end: function() {
		return this.prevObject || this.constructor(null);
	},

	// For internal use only.
	// Behaves like an Array's method, not like a jQuery method.
	push: core_push,
	sort: [].sort,
	splice: [].splice
};

// Give the init function the jQuery prototype for later instantiation
jQuery.fn.init.prototype = jQuery.fn;

jQuery.extend = jQuery.fn.extend = function() {
	var options, name, src, copy, copyIsArray, clone,
		target = arguments[0] || {},
		i = 1,
		length = arguments.length,
		deep = false;

	// Handle a deep copy situation
	if ( typeof target === "boolean" ) {
		deep = target;
		target = arguments[1] || {};
		// skip the boolean and the target
		i = 2;
	}

	// Handle case when target is a string or something (possible in deep copy)
	if ( typeof target !== "object" && !jQuery.isFunction(target) ) {
		target = {};
	}

	// extend jQuery itself if only one argument is passed
	if ( length === i ) {
		target = this;
		--i;
	}

	for ( ; i < length; i++ ) {
		// Only deal with non-null/undefined values
		if ( (options = arguments[ i ]) != null ) {
			// Extend the base object
			for ( name in options ) {
				src = target[ name ];
				copy = options[ name ];

				// Prevent never-ending loop
				if ( target === copy ) {
					continue;
				}

				// Recurse if we're merging plain objects or arrays
				if ( deep && copy && ( jQuery.isPlainObject(copy) || (copyIsArray = jQuery.isArray(copy)) ) ) {
					if ( copyIsArray ) {
						copyIsArray = false;
						clone = src && jQuery.isArray(src) ? src : [];

					} else {
						clone = src && jQuery.isPlainObject(src) ? src : {};
					}

					// Never move original objects, clone them
					target[ name ] = jQuery.extend( deep, clone, copy );

				// Don't bring in undefined values
				} else if ( copy !== undefined ) {
					target[ name ] = copy;
				}
			}
		}
	}

	// Return the modified object
	return target;
};

jQuery.extend({
	noConflict: function( deep ) {
		if ( window.$ === jQuery ) {
			window.$ = _$;
		}

		if ( deep && window.jQuery === jQuery ) {
			window.jQuery = _jQuery;
		}

		return jQuery;
	},

	// Is the DOM ready to be used? Set to true once it occurs.
	isReady: false,

	// A counter to track how many items to wait for before
	// the ready event fires. See #6781
	readyWait: 1,

	// Hold (or release) the ready event
	holdReady: function( hold ) {
		if ( hold ) {
			jQuery.readyWait++;
		} else {
			jQuery.ready( true );
		}
	},

	// Handle when the DOM is ready
	ready: function( wait ) {

		// Abort if there are pending holds or we're already ready
		if ( wait === true ? --jQuery.readyWait : jQuery.isReady ) {
			return;
		}

		// Make sure body exists, at least, in case IE gets a little overzealous (ticket #5443).
		if ( !document.body ) {
			return setTimeout( jQuery.ready, 1 );
		}

		// Remember that the DOM is ready
		jQuery.isReady = true;

		// If a normal DOM Ready event fired, decrement, and wait if need be
		if ( wait !== true && --jQuery.readyWait > 0 ) {
			return;
		}

		// If there are functions bound, to execute
		readyList.resolveWith( document, [ jQuery ] );

		// Trigger any bound ready events
		if ( jQuery.fn.trigger ) {
			jQuery( document ).trigger("ready").off("ready");
		}
	},

	// See test/unit/core.js for details concerning isFunction.
	// Since version 1.3, DOM methods and functions like alert
	// aren't supported. They return false on IE (#2968).
	isFunction: function( obj ) {
		return jQuery.type(obj) === "function";
	},

	isArray: Array.isArray || function( obj ) {
		return jQuery.type(obj) === "array";
	},

	isWindow: function( obj ) {
		return obj != null && obj == obj.window;
	},

	isNumeric: function( obj ) {
		return !isNaN( parseFloat(obj) ) && isFinite( obj );
	},

	type: function( obj ) {
		return obj == null ?
			String( obj ) :
			class2type[ core_toString.call(obj) ] || "object";
	},

	isPlainObject: function( obj ) {
		// Must be an Object.
		// Because of IE, we also have to check the presence of the constructor property.
		// Make sure that DOM nodes and window objects don't pass through, as well
		if ( !obj || jQuery.type(obj) !== "object" || obj.nodeType || jQuery.isWindow( obj ) ) {
			return false;
		}

		try {
			// Not own constructor property must be Object
			if ( obj.constructor &&
				!core_hasOwn.call(obj, "constructor") &&
				!core_hasOwn.call(obj.constructor.prototype, "isPrototypeOf") ) {
				return false;
			}
		} catch ( e ) {
			// IE8,9 Will throw exceptions on certain host objects #9897
			return false;
		}

		// Own properties are enumerated firstly, so to speed up,
		// if last one is own, then all properties are own.

		var key;
		for ( key in obj ) {}

		return key === undefined || core_hasOwn.call( obj, key );
	},

	isEmptyObject: function( obj ) {
		var name;
		for ( name in obj ) {
			return false;
		}
		return true;
	},

	error: function( msg ) {
		throw new Error( msg );
	},

	// data: string of html
	// context (optional): If specified, the fragment will be created in this context, defaults to document
	// scripts (optional): If true, will include scripts passed in the html string
	parseHTML: function( data, context, scripts ) {
		var parsed;
		if ( !data || typeof data !== "string" ) {
			return null;
		}
		if ( typeof context === "boolean" ) {
			scripts = context;
			context = 0;
		}
		context = context || document;

		// Single tag
		if ( (parsed = rsingleTag.exec( data )) ) {
			return [ context.createElement( parsed[1] ) ];
		}

		parsed = jQuery.buildFragment( [ data ], context, scripts ? null : [] );
		return jQuery.merge( [],
			(parsed.cacheable ? jQuery.clone( parsed.fragment ) : parsed.fragment).childNodes );
	},

	parseJSON: function( data ) {
		if ( !data || typeof data !== "string") {
			return null;
		}

		// Make sure leading/trailing whitespace is removed (IE can't handle it)
		data = jQuery.trim( data );

		// Attempt to parse using the native JSON parser first
		if ( window.JSON && window.JSON.parse ) {
			return window.JSON.parse( data );
		}

		// Make sure the incoming data is actual JSON
		// Logic borrowed from http://json.org/json2.js
		if ( rvalidchars.test( data.replace( rvalidescape, "@" )
			.replace( rvalidtokens, "]" )
			.replace( rvalidbraces, "")) ) {

			return ( new Function( "return " + data ) )();

		}
		jQuery.error( "Invalid JSON: " + data );
	},

	// Cross-browser xml parsing
	parseXML: function( data ) {
		var xml, tmp;
		if ( !data || typeof data !== "string" ) {
			return null;
		}
		try {
			if ( window.DOMParser ) { // Standard
				tmp = new DOMParser();
				xml = tmp.parseFromString( data , "text/xml" );
			} else { // IE
				xml = new ActiveXObject( "Microsoft.XMLDOM" );
				xml.async = "false";
				xml.loadXML( data );
			}
		} catch( e ) {
			xml = undefined;
		}
		if ( !xml || !xml.documentElement || xml.getElementsByTagName( "parsererror" ).length ) {
			jQuery.error( "Invalid XML: " + data );
		}
		return xml;
	},

	noop: function() {},

	// Evaluates a script in a global context
	// Workarounds based on findings by Jim Driscoll
	// http://weblogs.java.net/blog/driscoll/archive/2009/09/08/eval-javascript-global-context
	globalEval: function( data ) {
		if ( data && core_rnotwhite.test( data ) ) {
			// We use execScript on Internet Explorer
			// We use an anonymous function so that context is window
			// rather than jQuery in Firefox
			( window.execScript || function( data ) {
				window[ "eval" ].call( window, data );
			} )( data );
		}
	},

	// Convert dashed to camelCase; used by the css and data modules
	// Microsoft forgot to hump their vendor prefix (#9572)
	camelCase: function( string ) {
		return string.replace( rmsPrefix, "ms-" ).replace( rdashAlpha, fcamelCase );
	},

	nodeName: function( elem, name ) {
		return elem.nodeName && elem.nodeName.toLowerCase() === name.toLowerCase();
	},

	// args is for internal usage only
	each: function( obj, callback, args ) {
		var name,
			i = 0,
			length = obj.length,
			isObj = length === undefined || jQuery.isFunction( obj );

		if ( args ) {
			if ( isObj ) {
				for ( name in obj ) {
					if ( callback.apply( obj[ name ], args ) === false ) {
						break;
					}
				}
			} else {
				for ( ; i < length; ) {
					if ( callback.apply( obj[ i++ ], args ) === false ) {
						break;
					}
				}
			}

		// A special, fast, case for the most common use of each
		} else {
			if ( isObj ) {
				for ( name in obj ) {
					if ( callback.call( obj[ name ], name, obj[ name ] ) === false ) {
						break;
					}
				}
			} else {
				for ( ; i < length; ) {
					if ( callback.call( obj[ i ], i, obj[ i++ ] ) === false ) {
						break;
					}
				}
			}
		}

		return obj;
	},

	// Use native String.trim function wherever possible
	trim: core_trim && !core_trim.call("\uFEFF\xA0") ?
		function( text ) {
			return text == null ?
				"" :
				core_trim.call( text );
		} :

		// Otherwise use our own trimming functionality
		function( text ) {
			return text == null ?
				"" :
				( text + "" ).replace( rtrim, "" );
		},

	// results is for internal usage only
	makeArray: function( arr, results ) {
		var type,
			ret = results || [];

		if ( arr != null ) {
			// The window, strings (and functions) also have 'length'
			// Tweaked logic slightly to handle Blackberry 4.7 RegExp issues #6930
			type = jQuery.type( arr );

			if ( arr.length == null || type === "string" || type === "function" || type === "regexp" || jQuery.isWindow( arr ) ) {
				core_push.call( ret, arr );
			} else {
				jQuery.merge( ret, arr );
			}
		}

		return ret;
	},

	inArray: function( elem, arr, i ) {
		var len;

		if ( arr ) {
			if ( core_indexOf ) {
				return core_indexOf.call( arr, elem, i );
			}

			len = arr.length;
			i = i ? i < 0 ? Math.max( 0, len + i ) : i : 0;

			for ( ; i < len; i++ ) {
				// Skip accessing in sparse arrays
				if ( i in arr && arr[ i ] === elem ) {
					return i;
				}
			}
		}

		return -1;
	},

	merge: function( first, second ) {
		var l = second.length,
			i = first.length,
			j = 0;

		if ( typeof l === "number" ) {
			for ( ; j < l; j++ ) {
				first[ i++ ] = second[ j ];
			}

		} else {
			while ( second[j] !== undefined ) {
				first[ i++ ] = second[ j++ ];
			}
		}

		first.length = i;

		return first;
	},

	grep: function( elems, callback, inv ) {
		var retVal,
			ret = [],
			i = 0,
			length = elems.length;
		inv = !!inv;

		// Go through the array, only saving the items
		// that pass the validator function
		for ( ; i < length; i++ ) {
			retVal = !!callback( elems[ i ], i );
			if ( inv !== retVal ) {
				ret.push( elems[ i ] );
			}
		}

		return ret;
	},

	// arg is for internal usage only
	map: function( elems, callback, arg ) {
		var value, key,
			ret = [],
			i = 0,
			length = elems.length,
			// jquery objects are treated as arrays
			isArray = elems instanceof jQuery || length !== undefined && typeof length === "number" && ( ( length > 0 && elems[ 0 ] && elems[ length -1 ] ) || length === 0 || jQuery.isArray( elems ) ) ;

		// Go through the array, translating each of the items to their
		if ( isArray ) {
			for ( ; i < length; i++ ) {
				value = callback( elems[ i ], i, arg );

				if ( value != null ) {
					ret[ ret.length ] = value;
				}
			}

		// Go through every key on the object,
		} else {
			for ( key in elems ) {
				value = callback( elems[ key ], key, arg );

				if ( value != null ) {
					ret[ ret.length ] = value;
				}
			}
		}

		// Flatten any nested arrays
		return ret.concat.apply( [], ret );
	},

	// A global GUID counter for objects
	guid: 1,

	// Bind a function to a context, optionally partially applying any
	// arguments.
	proxy: function( fn, context ) {
		var tmp, args, proxy;

		if ( typeof context === "string" ) {
			tmp = fn[ context ];
			context = fn;
			fn = tmp;
		}

		// Quick check to determine if target is callable, in the spec
		// this throws a TypeError, but we will just return undefined.
		if ( !jQuery.isFunction( fn ) ) {
			return undefined;
		}

		// Simulated bind
		args = core_slice.call( arguments, 2 );
		proxy = function() {
			return fn.apply( context, args.concat( core_slice.call( arguments ) ) );
		};

		// Set the guid of unique handler to the same of original handler, so it can be removed
		proxy.guid = fn.guid = fn.guid || jQuery.guid++;

		return proxy;
	},

	// Multifunctional method to get and set values of a collection
	// The value/s can optionally be executed if it's a function
	access: function( elems, fn, key, value, chainable, emptyGet, pass ) {
		var exec,
			bulk = key == null,
			i = 0,
			length = elems.length;

		// Sets many values
		if ( key && typeof key === "object" ) {
			for ( i in key ) {
				jQuery.access( elems, fn, i, key[i], 1, emptyGet, value );
			}
			chainable = 1;

		// Sets one value
		} else if ( value !== undefined ) {
			// Optionally, function values get executed if exec is true
			exec = pass === undefined && jQuery.isFunction( value );

			if ( bulk ) {
				// Bulk operations only iterate when executing function values
				if ( exec ) {
					exec = fn;
					fn = function( elem, key, value ) {
						return exec.call( jQuery( elem ), value );
					};

				// Otherwise they run against the entire set
				} else {
					fn.call( elems, value );
					fn = null;
				}
			}

			if ( fn ) {
				for (; i < length; i++ ) {
					fn( elems[i], key, exec ? value.call( elems[i], i, fn( elems[i], key ) ) : value, pass );
				}
			}

			chainable = 1;
		}

		return chainable ?
			elems :

			// Gets
			bulk ?
				fn.call( elems ) :
				length ? fn( elems[0], key ) : emptyGet;
	},

	now: function() {
		return ( new Date() ).getTime();
	}
});

jQuery.ready.promise = function( obj ) {
	if ( !readyList ) {

		readyList = jQuery.Deferred();

		// Catch cases where $(document).ready() is called after the browser event has already occurred.
		// we once tried to use readyState "interactive" here, but it caused issues like the one
		// discovered by ChrisS here: http://bugs.jquery.com/ticket/12282#comment:15
		if ( document.readyState === "complete" ) {
			// Handle it asynchronously to allow scripts the opportunity to delay ready
			setTimeout( jQuery.ready, 1 );

		// Standards-based browsers support DOMContentLoaded
		} else if ( document.addEventListener ) {
			// Use the handy event callback
			document.addEventListener( "DOMContentLoaded", DOMContentLoaded, false );

			// A fallback to window.onload, that will always work
			window.addEventListener( "load", jQuery.ready, false );

		// If IE event model is used
		} else {
			// Ensure firing before onload, maybe late but safe also for iframes
			document.attachEvent( "onreadystatechange", DOMContentLoaded );

			// A fallback to window.onload, that will always work
			window.attachEvent( "onload", jQuery.ready );

			// If IE and not a frame
			// continually check to see if the document is ready
			var top = false;

			try {
				top = window.frameElement == null && document.documentElement;
			} catch(e) {}

			if ( top && top.doScroll ) {
				(function doScrollCheck() {
					if ( !jQuery.isReady ) {

						try {
							// Use the trick by Diego Perini
							// http://javascript.nwbox.com/IEContentLoaded/
							top.doScroll("left");
						} catch(e) {
							return setTimeout( doScrollCheck, 50 );
						}

						// and execute any waiting functions
						jQuery.ready();
					}
				})();
			}
		}
	}
	return readyList.promise( obj );
};

// Populate the class2type map
jQuery.each("Boolean Number String Function Array Date RegExp Object".split(" "), function(i, name) {
	class2type[ "[object " + name + "]" ] = name.toLowerCase();
});

// All jQuery objects should point back to these
rootjQuery = jQuery(document);
// String to Object options format cache
var optionsCache = {};

// Convert String-formatted options into Object-formatted ones and store in cache
function createOptions( options ) {
	var object = optionsCache[ options ] = {};
	jQuery.each( options.split( core_rspace ), function( _, flag ) {
		object[ flag ] = true;
	});
	return object;
}

/*
 * Create a callback list using the following parameters:
 *
 *	options: an optional list of space-separated options that will change how
 *			the callback list behaves or a more traditional option object
 *
 * By default a callback list will act like an event callback list and can be
 * "fired" multiple times.
 *
 * Possible options:
 *
 *	once:			will ensure the callback list can only be fired once (like a Deferred)
 *
 *	memory:			will keep track of previous values and will call any callback added
 *					after the list has been fired right away with the latest "memorized"
 *					values (like a Deferred)
 *
 *	unique:			will ensure a callback can only be added once (no duplicate in the list)
 *
 *	stopOnFalse:	interrupt callings when a callback returns false
 *
 */
jQuery.Callbacks = function( options ) {

	// Convert options from String-formatted to Object-formatted if needed
	// (we check in cache first)
	options = typeof options === "string" ?
		( optionsCache[ options ] || createOptions( options ) ) :
		jQuery.extend( {}, options );

	var // Last fire value (for non-forgettable lists)
		memory,
		// Flag to know if list was already fired
		fired,
		// Flag to know if list is currently firing
		firing,
		// First callback to fire (used internally by add and fireWith)
		firingStart,
		// End of the loop when firing
		firingLength,
		// Index of currently firing callback (modified by remove if needed)
		firingIndex,
		// Actual callback list
		list = [],
		// Stack of fire calls for repeatable lists
		stack = !options.once && [],
		// Fire callbacks
		fire = function( data ) {
			memory = options.memory && data;
			fired = true;
			firingIndex = firingStart || 0;
			firingStart = 0;
			firingLength = list.length;
			firing = true;
			for ( ; list && firingIndex < firingLength; firingIndex++ ) {
				if ( list[ firingIndex ].apply( data[ 0 ], data[ 1 ] ) === false && options.stopOnFalse ) {
					memory = false; // To prevent further calls using add
					break;
				}
			}
			firing = false;
			if ( list ) {
				if ( stack ) {
					if ( stack.length ) {
						fire( stack.shift() );
					}
				} else if ( memory ) {
					list = [];
				} else {
					self.disable();
				}
			}
		},
		// Actual Callbacks object
		self = {
			// Add a callback or a collection of callbacks to the list
			add: function() {
				if ( list ) {
					// First, we save the current length
					var start = list.length;
					(function add( args ) {
						jQuery.each( args, function( _, arg ) {
							var type = jQuery.type( arg );
							if ( type === "function" ) {
								if ( !options.unique || !self.has( arg ) ) {
									list.push( arg );
								}
							} else if ( arg && arg.length && type !== "string" ) {
								// Inspect recursively
								add( arg );
							}
						});
					})( arguments );
					// Do we need to add the callbacks to the
					// current firing batch?
					if ( firing ) {
						firingLength = list.length;
					// With memory, if we're not firing then
					// we should call right away
					} else if ( memory ) {
						firingStart = start;
						fire( memory );
					}
				}
				return this;
			},
			// Remove a callback from the list
			remove: function() {
				if ( list ) {
					jQuery.each( arguments, function( _, arg ) {
						var index;
						while( ( index = jQuery.inArray( arg, list, index ) ) > -1 ) {
							list.splice( index, 1 );
							// Handle firing indexes
							if ( firing ) {
								if ( index <= firingLength ) {
									firingLength--;
								}
								if ( index <= firingIndex ) {
									firingIndex--;
								}
							}
						}
					});
				}
				return this;
			},
			// Control if a given callback is in the list
			has: function( fn ) {
				return jQuery.inArray( fn, list ) > -1;
			},
			// Remove all callbacks from the list
			empty: function() {
				list = [];
				return this;
			},
			// Have the list do nothing anymore
			disable: function() {
				list = stack = memory = undefined;
				return this;
			},
			// Is it disabled?
			disabled: function() {
				return !list;
			},
			// Lock the list in its current state
			lock: function() {
				stack = undefined;
				if ( !memory ) {
					self.disable();
				}
				return this;
			},
			// Is it locked?
			locked: function() {
				return !stack;
			},
			// Call all callbacks with the given context and arguments
			fireWith: function( context, args ) {
				args = args || [];
				args = [ context, args.slice ? args.slice() : args ];
				if ( list && ( !fired || stack ) ) {
					if ( firing ) {
						stack.push( args );
					} else {
						fire( args );
					}
				}
				return this;
			},
			// Call all the callbacks with the given arguments
			fire: function() {
				self.fireWith( this, arguments );
				return this;
			},
			// To know if the callbacks have already been called at least once
			fired: function() {
				return !!fired;
			}
		};

	return self;
};
jQuery.extend({

	Deferred: function( func ) {
		var tuples = [
				// action, add listener, listener list, final state
				[ "resolve", "done", jQuery.Callbacks("once memory"), "resolved" ],
				[ "reject", "fail", jQuery.Callbacks("once memory"), "rejected" ],
				[ "notify", "progress", jQuery.Callbacks("memory") ]
			],
			state = "pending",
			promise = {
				state: function() {
					return state;
				},
				always: function() {
					deferred.done( arguments ).fail( arguments );
					return this;
				},
				then: function( /* fnDone, fnFail, fnProgress */ ) {
					var fns = arguments;
					return jQuery.Deferred(function( newDefer ) {
						jQuery.each( tuples, function( i, tuple ) {
							var action = tuple[ 0 ],
								fn = fns[ i ];
							// deferred[ done | fail | progress ] for forwarding actions to newDefer
							deferred[ tuple[1] ]( jQuery.isFunction( fn ) ?
								function() {
									var returned = fn.apply( this, arguments );
									if ( returned && jQuery.isFunction( returned.promise ) ) {
										returned.promise()
											.done( newDefer.resolve )
											.fail( newDefer.reject )
											.progress( newDefer.notify );
									} else {
										newDefer[ action + "With" ]( this === deferred ? newDefer : this, [ returned ] );
									}
								} :
								newDefer[ action ]
							);
						});
						fns = null;
					}).promise();
				},
				// Get a promise for this deferred
				// If obj is provided, the promise aspect is added to the object
				promise: function( obj ) {
					return obj != null ? jQuery.extend( obj, promise ) : promise;
				}
			},
			deferred = {};

		// Keep pipe for back-compat
		promise.pipe = promise.then;

		// Add list-specific methods
		jQuery.each( tuples, function( i, tuple ) {
			var list = tuple[ 2 ],
				stateString = tuple[ 3 ];

			// promise[ done | fail | progress ] = list.add
			promise[ tuple[1] ] = list.add;

			// Handle state
			if ( stateString ) {
				list.add(function() {
					// state = [ resolved | rejected ]
					state = stateString;

				// [ reject_list | resolve_list ].disable; progress_list.lock
				}, tuples[ i ^ 1 ][ 2 ].disable, tuples[ 2 ][ 2 ].lock );
			}

			// deferred[ resolve | reject | notify ] = list.fire
			deferred[ tuple[0] ] = list.fire;
			deferred[ tuple[0] + "With" ] = list.fireWith;
		});

		// Make the deferred a promise
		promise.promise( deferred );

		// Call given func if any
		if ( func ) {
			func.call( deferred, deferred );
		}

		// All done!
		return deferred;
	},

	// Deferred helper
	when: function( subordinate /* , ..., subordinateN */ ) {
		var i = 0,
			resolveValues = core_slice.call( arguments ),
			length = resolveValues.length,

			// the count of uncompleted subordinates
			remaining = length !== 1 || ( subordinate && jQuery.isFunction( subordinate.promise ) ) ? length : 0,

			// the master Deferred. If resolveValues consist of only a single Deferred, just use that.
			deferred = remaining === 1 ? subordinate : jQuery.Deferred(),

			// Update function for both resolve and progress values
			updateFunc = function( i, contexts, values ) {
				return function( value ) {
					contexts[ i ] = this;
					values[ i ] = arguments.length > 1 ? core_slice.call( arguments ) : value;
					if( values === progressValues ) {
						deferred.notifyWith( contexts, values );
					} else if ( !( --remaining ) ) {
						deferred.resolveWith( contexts, values );
					}
				};
			},

			progressValues, progressContexts, resolveContexts;

		// add listeners to Deferred subordinates; treat others as resolved
		if ( length > 1 ) {
			progressValues = new Array( length );
			progressContexts = new Array( length );
			resolveContexts = new Array( length );
			for ( ; i < length; i++ ) {
				if ( resolveValues[ i ] && jQuery.isFunction( resolveValues[ i ].promise ) ) {
					resolveValues[ i ].promise()
						.done( updateFunc( i, resolveContexts, resolveValues ) )
						.fail( deferred.reject )
						.progress( updateFunc( i, progressContexts, progressValues ) );
				} else {
					--remaining;
				}
			}
		}

		// if we're not waiting on anything, resolve the master
		if ( !remaining ) {
			deferred.resolveWith( resolveContexts, resolveValues );
		}

		return deferred.promise();
	}
});
jQuery.support = (function() {

	var support,
		all,
		a,
		select,
		opt,
		input,
		fragment,
		eventName,
		i,
		isSupported,
		clickFn,
		div = document.createElement("div");

	// Setup
	div.setAttribute( "className", "t" );
	div.innerHTML = "  <link/><table></table><a href='/a'>a</a><input type='checkbox'/>";

	// Support tests won't run in some limited or non-browser environments
	all = div.getElementsByTagName("*");
	a = div.getElementsByTagName("a")[ 0 ];
	if ( !all || !a || !all.length ) {
		return {};
	}

	// First batch of tests
	select = document.createElement("select");
	opt = select.appendChild( document.createElement("option") );
	input = div.getElementsByTagName("input")[ 0 ];

	a.style.cssText = "top:1px;float:left;opacity:.5";
	support = {
		// IE strips leading whitespace when .innerHTML is used
		leadingWhitespace: ( div.firstChild.nodeType === 3 ),

		// Make sure that tbody elements aren't automatically inserted
		// IE will insert them into empty tables
		tbody: !div.getElementsByTagName("tbody").length,

		// Make sure that link elements get serialized correctly by innerHTML
		// This requires a wrapper element in IE
		htmlSerialize: !!div.getElementsByTagName("link").length,

		// Get the style information from getAttribute
		// (IE uses .cssText instead)
		style: /top/.test( a.getAttribute("style") ),

		// Make sure that URLs aren't manipulated
		// (IE normalizes it by default)
		hrefNormalized: ( a.getAttribute("href") === "/a" ),

		// Make sure that element opacity exists
		// (IE uses filter instead)
		// Use a regex to work around a WebKit issue. See #5145
		opacity: /^0.5/.test( a.style.opacity ),

		// Verify style float existence
		// (IE uses styleFloat instead of cssFloat)
		cssFloat: !!a.style.cssFloat,

		// Make sure that if no value is specified for a checkbox
		// that it defaults to "on".
		// (WebKit defaults to "" instead)
		checkOn: ( input.value === "on" ),

		// Make sure that a selected-by-default option has a working selected property.
		// (WebKit defaults to false instead of true, IE too, if it's in an optgroup)
		optSelected: opt.selected,

		// Test setAttribute on camelCase class. If it works, we need attrFixes when doing get/setAttribute (ie6/7)
		getSetAttribute: div.className !== "t",

		// Tests for enctype support on a form (#6743)
		enctype: !!document.createElement("form").enctype,

		// Makes sure cloning an html5 element does not cause problems
		// Where outerHTML is undefined, this still works
		html5Clone: document.createElement("nav").cloneNode( true ).outerHTML !== "<:nav></:nav>",

		// jQuery.support.boxModel DEPRECATED in 1.8 since we don't support Quirks Mode
		boxModel: ( document.compatMode === "CSS1Compat" ),

		// Will be defined later
		submitBubbles: true,
		changeBubbles: true,
		focusinBubbles: false,
		deleteExpando: true,
		noCloneEvent: true,
		inlineBlockNeedsLayout: false,
		shrinkWrapBlocks: false,
		reliableMarginRight: true,
		boxSizingReliable: true,
		pixelPosition: false
	};

	// Make sure checked status is properly cloned
	input.checked = true;
	support.noCloneChecked = input.cloneNode( true ).checked;

	// Make sure that the options inside disabled selects aren't marked as disabled
	// (WebKit marks them as disabled)
	select.disabled = true;
	support.optDisabled = !opt.disabled;

	// Test to see if it's possible to delete an expando from an element
	// Fails in Internet Explorer
	try {
		delete div.test;
	} catch( e ) {
		support.deleteExpando = false;
	}

	if ( !div.addEventListener && div.attachEvent && div.fireEvent ) {
		div.attachEvent( "onclick", clickFn = function() {
			// Cloning a node shouldn't copy over any
			// bound event handlers (IE does this)
			support.noCloneEvent = false;
		});
		div.cloneNode( true ).fireEvent("onclick");
		div.detachEvent( "onclick", clickFn );
	}

	// Check if a radio maintains its value
	// after being appended to the DOM
	input = document.createElement("input");
	input.value = "t";
	input.setAttribute( "type", "radio" );
	support.radioValue = input.value === "t";

	input.setAttribute( "checked", "checked" );

	// #11217 - WebKit loses check when the name is after the checked attribute
	input.setAttribute( "name", "t" );

	div.appendChild( input );
	fragment = document.createDocumentFragment();
	fragment.appendChild( div.lastChild );

	// WebKit doesn't clone checked state correctly in fragments
	support.checkClone = fragment.cloneNode( true ).cloneNode( true ).lastChild.checked;

	// Check if a disconnected checkbox will retain its checked
	// value of true after appended to the DOM (IE6/7)
	support.appendChecked = input.checked;

	fragment.removeChild( input );
	fragment.appendChild( div );

	// Technique from Juriy Zaytsev
	// http://perfectionkills.com/detecting-event-support-without-browser-sniffing/
	// We only care about the case where non-standard event systems
	// are used, namely in IE. Short-circuiting here helps us to
	// avoid an eval call (in setAttribute) which can cause CSP
	// to go haywire. See: https://developer.mozilla.org/en/Security/CSP
	if ( div.attachEvent ) {
		for ( i in {
			submit: true,
			change: true,
			focusin: true
		}) {
			eventName = "on" + i;
			isSupported = ( eventName in div );
			if ( !isSupported ) {
				div.setAttribute( eventName, "return;" );
				isSupported = ( typeof div[ eventName ] === "function" );
			}
			support[ i + "Bubbles" ] = isSupported;
		}
	}

	// Run tests that need a body at doc ready
	jQuery(function() {
		var container, div, tds, marginDiv,
			divReset = "padding:0;margin:0;border:0;display:block;overflow:hidden;",
			body = document.getElementsByTagName("body")[0];

		if ( !body ) {
			// Return for frameset docs that don't have a body
			return;
		}

		container = document.createElement("div");
		container.style.cssText = "visibility:hidden;border:0;width:0;height:0;position:static;top:0;margin-top:1px";
		body.insertBefore( container, body.firstChild );

		// Construct the test element
		div = document.createElement("div");
		container.appendChild( div );

		// Check if table cells still have offsetWidth/Height when they are set
		// to display:none and there are still other visible table cells in a
		// table row; if so, offsetWidth/Height are not reliable for use when
		// determining if an element has been hidden directly using
		// display:none (it is still safe to use offsets if a parent element is
		// hidden; don safety goggles and see bug #4512 for more information).
		// (only IE 8 fails this test)
		div.innerHTML = "<table><tr><td></td><td>t</td></tr></table>";
		tds = div.getElementsByTagName("td");
		tds[ 0 ].style.cssText = "padding:0;margin:0;border:0;display:none";
		isSupported = ( tds[ 0 ].offsetHeight === 0 );

		tds[ 0 ].style.display = "";
		tds[ 1 ].style.display = "none";

		// Check if empty table cells still have offsetWidth/Height
		// (IE <= 8 fail this test)
		support.reliableHiddenOffsets = isSupported && ( tds[ 0 ].offsetHeight === 0 );

		// Check box-sizing and margin behavior
		div.innerHTML = "";
		div.style.cssText = "box-sizing:border-box;-moz-box-sizing:border-box;-webkit-box-sizing:border-box;padding:1px;border:1px;display:block;width:4px;margin-top:1%;position:absolute;top:1%;";
		support.boxSizing = ( div.offsetWidth === 4 );
		support.doesNotIncludeMarginInBodyOffset = ( body.offsetTop !== 1 );

		// NOTE: To any future maintainer, we've window.getComputedStyle
		// because jsdom on node.js will break without it.
		if ( window.getComputedStyle ) {
			support.pixelPosition = ( window.getComputedStyle( div, null ) || {} ).top !== "1%";
			support.boxSizingReliable = ( window.getComputedStyle( div, null ) || { width: "4px" } ).width === "4px";

			// Check if div with explicit width and no margin-right incorrectly
			// gets computed margin-right based on width of container. For more
			// info see bug #3333
			// Fails in WebKit before Feb 2011 nightlies
			// WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
			marginDiv = document.createElement("div");
			marginDiv.style.cssText = div.style.cssText = divReset;
			marginDiv.style.marginRight = marginDiv.style.width = "0";
			div.style.width = "1px";
			div.appendChild( marginDiv );
			support.reliableMarginRight =
				!parseFloat( ( window.getComputedStyle( marginDiv, null ) || {} ).marginRight );
		}

		if ( typeof div.style.zoom !== "undefined" ) {
			// Check if natively block-level elements act like inline-block
			// elements when setting their display to 'inline' and giving
			// them layout
			// (IE < 8 does this)
			div.innerHTML = "";
			div.style.cssText = divReset + "width:1px;padding:1px;display:inline;zoom:1";
			support.inlineBlockNeedsLayout = ( div.offsetWidth === 3 );

			// Check if elements with layout shrink-wrap their children
			// (IE 6 does this)
			div.style.display = "block";
			div.style.overflow = "visible";
			div.innerHTML = "<div></div>";
			div.firstChild.style.width = "5px";
			support.shrinkWrapBlocks = ( div.offsetWidth !== 3 );

			container.style.zoom = 1;
		}

		// Null elements to avoid leaks in IE
		body.removeChild( container );
		container = div = tds = marginDiv = null;
	});

	// Null elements to avoid leaks in IE
	fragment.removeChild( div );
	all = a = select = opt = input = fragment = div = null;

	return support;
})();
var rbrace = /(?:\{[\s\S]*\}|\[[\s\S]*\])$/,
	rmultiDash = /([A-Z])/g;

jQuery.extend({
	cache: {},

	deletedIds: [],

	// Remove at next major release (1.9/2.0)
	uuid: 0,

	// Unique for each copy of jQuery on the page
	// Non-digits removed to match rinlinejQuery
	expando: "jQuery" + ( jQuery.fn.jquery + Math.random() ).replace( /\D/g, "" ),

	// The following elements throw uncatchable exceptions if you
	// attempt to add expando properties to them.
	noData: {
		"embed": true,
		// Ban all objects except for Flash (which handle expandos)
		"object": "clsid:D27CDB6E-AE6D-11cf-96B8-444553540000",
		"applet": true
	},

	hasData: function( elem ) {
		elem = elem.nodeType ? jQuery.cache[ elem[jQuery.expando] ] : elem[ jQuery.expando ];
		return !!elem && !isEmptyDataObject( elem );
	},

	data: function( elem, name, data, pvt /* Internal Use Only */ ) {
		if ( !jQuery.acceptData( elem ) ) {
			return;
		}

		var thisCache, ret,
			internalKey = jQuery.expando,
			getByName = typeof name === "string",

			// We have to handle DOM nodes and JS objects differently because IE6-7
			// can't GC object references properly across the DOM-JS boundary
			isNode = elem.nodeType,

			// Only DOM nodes need the global jQuery cache; JS object data is
			// attached directly to the object so GC can occur automatically
			cache = isNode ? jQuery.cache : elem,

			// Only defining an ID for JS objects if its cache already exists allows
			// the code to shortcut on the same path as a DOM node with no cache
			id = isNode ? elem[ internalKey ] : elem[ internalKey ] && internalKey;

		// Avoid doing any more work than we need to when trying to get data on an
		// object that has no data at all
		if ( (!id || !cache[id] || (!pvt && !cache[id].data)) && getByName && data === undefined ) {
			return;
		}

		if ( !id ) {
			// Only DOM nodes need a new unique ID for each element since their data
			// ends up in the global cache
			if ( isNode ) {
				elem[ internalKey ] = id = jQuery.deletedIds.pop() || jQuery.guid++;
			} else {
				id = internalKey;
			}
		}

		if ( !cache[ id ] ) {
			cache[ id ] = {};

			// Avoids exposing jQuery metadata on plain JS objects when the object
			// is serialized using JSON.stringify
			if ( !isNode ) {
				cache[ id ].toJSON = jQuery.noop;
			}
		}

		// An object can be passed to jQuery.data instead of a key/value pair; this gets
		// shallow copied over onto the existing cache
		if ( typeof name === "object" || typeof name === "function" ) {
			if ( pvt ) {
				cache[ id ] = jQuery.extend( cache[ id ], name );
			} else {
				cache[ id ].data = jQuery.extend( cache[ id ].data, name );
			}
		}

		thisCache = cache[ id ];

		// jQuery data() is stored in a separate object inside the object's internal data
		// cache in order to avoid key collisions between internal data and user-defined
		// data.
		if ( !pvt ) {
			if ( !thisCache.data ) {
				thisCache.data = {};
			}

			thisCache = thisCache.data;
		}

		if ( data !== undefined ) {
			thisCache[ jQuery.camelCase( name ) ] = data;
		}

		// Check for both converted-to-camel and non-converted data property names
		// If a data property was specified
		if ( getByName ) {

			// First Try to find as-is property data
			ret = thisCache[ name ];

			// Test for null|undefined property data
			if ( ret == null ) {

				// Try to find the camelCased property
				ret = thisCache[ jQuery.camelCase( name ) ];
			}
		} else {
			ret = thisCache;
		}

		return ret;
	},

	removeData: function( elem, name, pvt /* Internal Use Only */ ) {
		if ( !jQuery.acceptData( elem ) ) {
			return;
		}

		var thisCache, i, l,

			isNode = elem.nodeType,

			// See jQuery.data for more information
			cache = isNode ? jQuery.cache : elem,
			id = isNode ? elem[ jQuery.expando ] : jQuery.expando;

		// If there is already no cache entry for this object, there is no
		// purpose in continuing
		if ( !cache[ id ] ) {
			return;
		}

		if ( name ) {

			thisCache = pvt ? cache[ id ] : cache[ id ].data;

			if ( thisCache ) {

				// Support array or space separated string names for data keys
				if ( !jQuery.isArray( name ) ) {

					// try the string as a key before any manipulation
					if ( name in thisCache ) {
						name = [ name ];
					} else {

						// split the camel cased version by spaces unless a key with the spaces exists
						name = jQuery.camelCase( name );
						if ( name in thisCache ) {
							name = [ name ];
						} else {
							name = name.split(" ");
						}
					}
				}

				for ( i = 0, l = name.length; i < l; i++ ) {
					delete thisCache[ name[i] ];
				}

				// If there is no data left in the cache, we want to continue
				// and let the cache object itself get destroyed
				if ( !( pvt ? isEmptyDataObject : jQuery.isEmptyObject )( thisCache ) ) {
					return;
				}
			}
		}

		// See jQuery.data for more information
		if ( !pvt ) {
			delete cache[ id ].data;

			// Don't destroy the parent cache unless the internal data object
			// had been the only thing left in it
			if ( !isEmptyDataObject( cache[ id ] ) ) {
				return;
			}
		}

		// Destroy the cache
		if ( isNode ) {
			jQuery.cleanData( [ elem ], true );

		// Use delete when supported for expandos or `cache` is not a window per isWindow (#10080)
		} else if ( jQuery.support.deleteExpando || cache != cache.window ) {
			delete cache[ id ];

		// When all else fails, null
		} else {
			cache[ id ] = null;
		}
	},

	// For internal use only.
	_data: function( elem, name, data ) {
		return jQuery.data( elem, name, data, true );
	},

	// A method for determining if a DOM node can handle the data expando
	acceptData: function( elem ) {
		var noData = elem.nodeName && jQuery.noData[ elem.nodeName.toLowerCase() ];

		// nodes accept data unless otherwise specified; rejection can be conditional
		return !noData || noData !== true && elem.getAttribute("classid") === noData;
	}
});

jQuery.fn.extend({
	data: function( key, value ) {
		var parts, part, attr, name, l,
			elem = this[0],
			i = 0,
			data = null;

		// Gets all values
		if ( key === undefined ) {
			if ( this.length ) {
				data = jQuery.data( elem );

				if ( elem.nodeType === 1 && !jQuery._data( elem, "parsedAttrs" ) ) {
					attr = elem.attributes;
					for ( l = attr.length; i < l; i++ ) {
						name = attr[i].name;

						if ( !name.indexOf( "data-" ) ) {
							name = jQuery.camelCase( name.substring(5) );

							dataAttr( elem, name, data[ name ] );
						}
					}
					jQuery._data( elem, "parsedAttrs", true );
				}
			}

			return data;
		}

		// Sets multiple values
		if ( typeof key === "object" ) {
			return this.each(function() {
				jQuery.data( this, key );
			});
		}

		parts = key.split( ".", 2 );
		parts[1] = parts[1] ? "." + parts[1] : "";
		part = parts[1] + "!";

		return jQuery.access( this, function( value ) {

			if ( value === undefined ) {
				data = this.triggerHandler( "getData" + part, [ parts[0] ] );

				// Try to fetch any internally stored data first
				if ( data === undefined && elem ) {
					data = jQuery.data( elem, key );
					data = dataAttr( elem, key, data );
				}

				return data === undefined && parts[1] ?
					this.data( parts[0] ) :
					data;
			}

			parts[1] = value;
			this.each(function() {
				var self = jQuery( this );

				self.triggerHandler( "setData" + part, parts );
				jQuery.data( this, key, value );
				self.triggerHandler( "changeData" + part, parts );
			});
		}, null, value, arguments.length > 1, null, false );
	},

	removeData: function( key ) {
		return this.each(function() {
			jQuery.removeData( this, key );
		});
	}
});

function dataAttr( elem, key, data ) {
	// If nothing was found internally, try to fetch any
	// data from the HTML5 data-* attribute
	if ( data === undefined && elem.nodeType === 1 ) {

		var name = "data-" + key.replace( rmultiDash, "-$1" ).toLowerCase();

		data = elem.getAttribute( name );

		if ( typeof data === "string" ) {
			try {
				data = data === "true" ? true :
				data === "false" ? false :
				data === "null" ? null :
				// Only convert to a number if it doesn't change the string
				+data + "" === data ? +data :
				rbrace.test( data ) ? jQuery.parseJSON( data ) :
					data;
			} catch( e ) {}

			// Make sure we set the data so it isn't changed later
			jQuery.data( elem, key, data );

		} else {
			data = undefined;
		}
	}

	return data;
}

// checks a cache object for emptiness
function isEmptyDataObject( obj ) {
	var name;
	for ( name in obj ) {

		// if the public data object is empty, the private is still empty
		if ( name === "data" && jQuery.isEmptyObject( obj[name] ) ) {
			continue;
		}
		if ( name !== "toJSON" ) {
			return false;
		}
	}

	return true;
}
jQuery.extend({
	queue: function( elem, type, data ) {
		var queue;

		if ( elem ) {
			type = ( type || "fx" ) + "queue";
			queue = jQuery._data( elem, type );

			// Speed up dequeue by getting out quickly if this is just a lookup
			if ( data ) {
				if ( !queue || jQuery.isArray(data) ) {
					queue = jQuery._data( elem, type, jQuery.makeArray(data) );
				} else {
					queue.push( data );
				}
			}
			return queue || [];
		}
	},

	dequeue: function( elem, type ) {
		type = type || "fx";

		var queue = jQuery.queue( elem, type ),
			startLength = queue.length,
			fn = queue.shift(),
			hooks = jQuery._queueHooks( elem, type ),
			next = function() {
				jQuery.dequeue( elem, type );
			};

		// If the fx queue is dequeued, always remove the progress sentinel
		if ( fn === "inprogress" ) {
			fn = queue.shift();
			startLength--;
		}

		if ( fn ) {

			// Add a progress sentinel to prevent the fx queue from being
			// automatically dequeued
			if ( type === "fx" ) {
				queue.unshift( "inprogress" );
			}

			// clear up the last queue stop function
			delete hooks.stop;
			fn.call( elem, next, hooks );
		}

		if ( !startLength && hooks ) {
			hooks.empty.fire();
		}
	},

	// not intended for public consumption - generates a queueHooks object, or returns the current one
	_queueHooks: function( elem, type ) {
		var key = type + "queueHooks";
		return jQuery._data( elem, key ) || jQuery._data( elem, key, {
			empty: jQuery.Callbacks("once memory").add(function() {
				jQuery.removeData( elem, type + "queue", true );
				jQuery.removeData( elem, key, true );
			})
		});
	}
});

jQuery.fn.extend({
	queue: function( type, data ) {
		var setter = 2;

		if ( typeof type !== "string" ) {
			data = type;
			type = "fx";
			setter--;
		}

		if ( arguments.length < setter ) {
			return jQuery.queue( this[0], type );
		}

		return data === undefined ?
			this :
			this.each(function() {
				var queue = jQuery.queue( this, type, data );

				// ensure a hooks for this queue
				jQuery._queueHooks( this, type );

				if ( type === "fx" && queue[0] !== "inprogress" ) {
					jQuery.dequeue( this, type );
				}
			});
	},
	dequeue: function( type ) {
		return this.each(function() {
			jQuery.dequeue( this, type );
		});
	},
	// Based off of the plugin by Clint Helfers, with permission.
	// http://blindsignals.com/index.php/2009/07/jquery-delay/
	delay: function( time, type ) {
		time = jQuery.fx ? jQuery.fx.speeds[ time ] || time : time;
		type = type || "fx";

		return this.queue( type, function( next, hooks ) {
			var timeout = setTimeout( next, time );
			hooks.stop = function() {
				clearTimeout( timeout );
			};
		});
	},
	clearQueue: function( type ) {
		return this.queue( type || "fx", [] );
	},
	// Get a promise resolved when queues of a certain type
	// are emptied (fx is the type by default)
	promise: function( type, obj ) {
		var tmp,
			count = 1,
			defer = jQuery.Deferred(),
			elements = this,
			i = this.length,
			resolve = function() {
				if ( !( --count ) ) {
					defer.resolveWith( elements, [ elements ] );
				}
			};

		if ( typeof type !== "string" ) {
			obj = type;
			type = undefined;
		}
		type = type || "fx";

		while( i-- ) {
			tmp = jQuery._data( elements[ i ], type + "queueHooks" );
			if ( tmp && tmp.empty ) {
				count++;
				tmp.empty.add( resolve );
			}
		}
		resolve();
		return defer.promise( obj );
	}
});
var nodeHook, boolHook, fixSpecified,
	rclass = /[\t\r\n]/g,
	rreturn = /\r/g,
	rtype = /^(?:button|input)$/i,
	rfocusable = /^(?:button|input|object|select|textarea)$/i,
	rclickable = /^a(?:rea|)$/i,
	rboolean = /^(?:autofocus|autoplay|async|checked|controls|defer|disabled|hidden|loop|multiple|open|readonly|required|scoped|selected)$/i,
	getSetAttribute = jQuery.support.getSetAttribute;

jQuery.fn.extend({
	attr: function( name, value ) {
		return jQuery.access( this, jQuery.attr, name, value, arguments.length > 1 );
	},

	removeAttr: function( name ) {
		return this.each(function() {
			jQuery.removeAttr( this, name );
		});
	},

	prop: function( name, value ) {
		return jQuery.access( this, jQuery.prop, name, value, arguments.length > 1 );
	},

	removeProp: function( name ) {
		name = jQuery.propFix[ name ] || name;
		return this.each(function() {
			// try/catch handles cases where IE balks (such as removing a property on window)
			try {
				this[ name ] = undefined;
				delete this[ name ];
			} catch( e ) {}
		});
	},

	addClass: function( value ) {
		var classNames, i, l, elem,
			setClass, c, cl;

		if ( jQuery.isFunction( value ) ) {
			return this.each(function( j ) {
				jQuery( this ).addClass( value.call(this, j, this.className) );
			});
		}

		if ( value && typeof value === "string" ) {
			classNames = value.split( core_rspace );

			for ( i = 0, l = this.length; i < l; i++ ) {
				elem = this[ i ];

				if ( elem.nodeType === 1 ) {
					if ( !elem.className && classNames.length === 1 ) {
						elem.className = value;

					} else {
						setClass = " " + elem.className + " ";

						for ( c = 0, cl = classNames.length; c < cl; c++ ) {
							if ( setClass.indexOf( " " + classNames[ c ] + " " ) < 0 ) {
								setClass += classNames[ c ] + " ";
							}
						}
						elem.className = jQuery.trim( setClass );
					}
				}
			}
		}

		return this;
	},

	removeClass: function( value ) {
		var removes, className, elem, c, cl, i, l;

		if ( jQuery.isFunction( value ) ) {
			return this.each(function( j ) {
				jQuery( this ).removeClass( value.call(this, j, this.className) );
			});
		}
		if ( (value && typeof value === "string") || value === undefined ) {
			removes = ( value || "" ).split( core_rspace );

			for ( i = 0, l = this.length; i < l; i++ ) {
				elem = this[ i ];
				if ( elem.nodeType === 1 && elem.className ) {

					className = (" " + elem.className + " ").replace( rclass, " " );

					// loop over each item in the removal list
					for ( c = 0, cl = removes.length; c < cl; c++ ) {
						// Remove until there is nothing to remove,
						while ( className.indexOf(" " + removes[ c ] + " ") >= 0 ) {
							className = className.replace( " " + removes[ c ] + " " , " " );
						}
					}
					elem.className = value ? jQuery.trim( className ) : "";
				}
			}
		}

		return this;
	},

	toggleClass: function( value, stateVal ) {
		var type = typeof value,
			isBool = typeof stateVal === "boolean";

		if ( jQuery.isFunction( value ) ) {
			return this.each(function( i ) {
				jQuery( this ).toggleClass( value.call(this, i, this.className, stateVal), stateVal );
			});
		}

		return this.each(function() {
			if ( type === "string" ) {
				// toggle individual class names
				var className,
					i = 0,
					self = jQuery( this ),
					state = stateVal,
					classNames = value.split( core_rspace );

				while ( (className = classNames[ i++ ]) ) {
					// check each className given, space separated list
					state = isBool ? state : !self.hasClass( className );
					self[ state ? "addClass" : "removeClass" ]( className );
				}

			} else if ( type === "undefined" || type === "boolean" ) {
				if ( this.className ) {
					// store className if set
					jQuery._data( this, "__className__", this.className );
				}

				// toggle whole className
				this.className = this.className || value === false ? "" : jQuery._data( this, "__className__" ) || "";
			}
		});
	},

	hasClass: function( selector ) {
		var className = " " + selector + " ",
			i = 0,
			l = this.length;
		for ( ; i < l; i++ ) {
			if ( this[i].nodeType === 1 && (" " + this[i].className + " ").replace(rclass, " ").indexOf( className ) >= 0 ) {
				return true;
			}
		}

		return false;
	},

	val: function( value ) {
		var hooks, ret, isFunction,
			elem = this[0];

		if ( !arguments.length ) {
			if ( elem ) {
				hooks = jQuery.valHooks[ elem.type ] || jQuery.valHooks[ elem.nodeName.toLowerCase() ];

				if ( hooks && "get" in hooks && (ret = hooks.get( elem, "value" )) !== undefined ) {
					return ret;
				}

				ret = elem.value;

				return typeof ret === "string" ?
					// handle most common string cases
					ret.replace(rreturn, "") :
					// handle cases where value is null/undef or number
					ret == null ? "" : ret;
			}

			return;
		}

		isFunction = jQuery.isFunction( value );

		return this.each(function( i ) {
			var val,
				self = jQuery(this);

			if ( this.nodeType !== 1 ) {
				return;
			}

			if ( isFunction ) {
				val = value.call( this, i, self.val() );
			} else {
				val = value;
			}

			// Treat null/undefined as ""; convert numbers to string
			if ( val == null ) {
				val = "";
			} else if ( typeof val === "number" ) {
				val += "";
			} else if ( jQuery.isArray( val ) ) {
				val = jQuery.map(val, function ( value ) {
					return value == null ? "" : value + "";
				});
			}

			hooks = jQuery.valHooks[ this.type ] || jQuery.valHooks[ this.nodeName.toLowerCase() ];

			// If set returns undefined, fall back to normal setting
			if ( !hooks || !("set" in hooks) || hooks.set( this, val, "value" ) === undefined ) {
				this.value = val;
			}
		});
	}
});

jQuery.extend({
	valHooks: {
		option: {
			get: function( elem ) {
				// attributes.value is undefined in Blackberry 4.7 but
				// uses .value. See #6932
				var val = elem.attributes.value;
				return !val || val.specified ? elem.value : elem.text;
			}
		},
		select: {
			get: function( elem ) {
				var value, option,
					options = elem.options,
					index = elem.selectedIndex,
					one = elem.type === "select-one" || index < 0,
					values = one ? null : [],
					max = one ? index + 1 : options.length,
					i = index < 0 ?
						max :
						one ? index : 0;

				// Loop through all the selected options
				for ( ; i < max; i++ ) {
					option = options[ i ];

					// oldIE doesn't update selected after form reset (#2551)
					if ( ( option.selected || i === index ) &&
							// Don't return options that are disabled or in a disabled optgroup
							( jQuery.support.optDisabled ? !option.disabled : option.getAttribute("disabled") === null ) &&
							( !option.parentNode.disabled || !jQuery.nodeName( option.parentNode, "optgroup" ) ) ) {

						// Get the specific value for the option
						value = jQuery( option ).val();

						// We don't need an array for one selects
						if ( one ) {
							return value;
						}

						// Multi-Selects return an array
						values.push( value );
					}
				}

				return values;
			},

			set: function( elem, value ) {
				var values = jQuery.makeArray( value );

				jQuery(elem).find("option").each(function() {
					this.selected = jQuery.inArray( jQuery(this).val(), values ) >= 0;
				});

				if ( !values.length ) {
					elem.selectedIndex = -1;
				}
				return values;
			}
		}
	},

	// Unused in 1.8, left in so attrFn-stabbers won't die; remove in 1.9
	attrFn: {},

	attr: function( elem, name, value, pass ) {
		var ret, hooks, notxml,
			nType = elem.nodeType;

		// don't get/set attributes on text, comment and attribute nodes
		if ( !elem || nType === 3 || nType === 8 || nType === 2 ) {
			return;
		}

		if ( pass && jQuery.isFunction( jQuery.fn[ name ] ) ) {
			return jQuery( elem )[ name ]( value );
		}

		// Fallback to prop when attributes are not supported
		if ( typeof elem.getAttribute === "undefined" ) {
			return jQuery.prop( elem, name, value );
		}

		notxml = nType !== 1 || !jQuery.isXMLDoc( elem );

		// All attributes are lowercase
		// Grab necessary hook if one is defined
		if ( notxml ) {
			name = name.toLowerCase();
			hooks = jQuery.attrHooks[ name ] || ( rboolean.test( name ) ? boolHook : nodeHook );
		}

		if ( value !== undefined ) {

			if ( value === null ) {
				jQuery.removeAttr( elem, name );
				return;

			} else if ( hooks && "set" in hooks && notxml && (ret = hooks.set( elem, value, name )) !== undefined ) {
				return ret;

			} else {
				elem.setAttribute( name, value + "" );
				return value;
			}

		} else if ( hooks && "get" in hooks && notxml && (ret = hooks.get( elem, name )) !== null ) {
			return ret;

		} else {

			ret = elem.getAttribute( name );

			// Non-existent attributes return null, we normalize to undefined
			return ret === null ?
				undefined :
				ret;
		}
	},

	removeAttr: function( elem, value ) {
		var propName, attrNames, name, isBool,
			i = 0;

		if ( value && elem.nodeType === 1 ) {

			attrNames = value.split( core_rspace );

			for ( ; i < attrNames.length; i++ ) {
				name = attrNames[ i ];

				if ( name ) {
					propName = jQuery.propFix[ name ] || name;
					isBool = rboolean.test( name );

					// See #9699 for explanation of this approach (setting first, then removal)
					// Do not do this for boolean attributes (see #10870)
					if ( !isBool ) {
						jQuery.attr( elem, name, "" );
					}
					elem.removeAttribute( getSetAttribute ? name : propName );

					// Set corresponding property to false for boolean attributes
					if ( isBool && propName in elem ) {
						elem[ propName ] = false;
					}
				}
			}
		}
	},

	attrHooks: {
		type: {
			set: function( elem, value ) {
				// We can't allow the type property to be changed (since it causes problems in IE)
				if ( rtype.test( elem.nodeName ) && elem.parentNode ) {
					jQuery.error( "type property can't be changed" );
				} else if ( !jQuery.support.radioValue && value === "radio" && jQuery.nodeName(elem, "input") ) {
					// Setting the type on a radio button after the value resets the value in IE6-9
					// Reset value to it's default in case type is set after value
					// This is for element creation
					var val = elem.value;
					elem.setAttribute( "type", value );
					if ( val ) {
						elem.value = val;
					}
					return value;
				}
			}
		},
		// Use the value property for back compat
		// Use the nodeHook for button elements in IE6/7 (#1954)
		value: {
			get: function( elem, name ) {
				if ( nodeHook && jQuery.nodeName( elem, "button" ) ) {
					return nodeHook.get( elem, name );
				}
				return name in elem ?
					elem.value :
					null;
			},
			set: function( elem, value, name ) {
				if ( nodeHook && jQuery.nodeName( elem, "button" ) ) {
					return nodeHook.set( elem, value, name );
				}
				// Does not return so that setAttribute is also used
				elem.value = value;
			}
		}
	},

	propFix: {
		tabindex: "tabIndex",
		readonly: "readOnly",
		"for": "htmlFor",
		"class": "className",
		maxlength: "maxLength",
		cellspacing: "cellSpacing",
		cellpadding: "cellPadding",
		rowspan: "rowSpan",
		colspan: "colSpan",
		usemap: "useMap",
		frameborder: "frameBorder",
		contenteditable: "contentEditable"
	},

	prop: function( elem, name, value ) {
		var ret, hooks, notxml,
			nType = elem.nodeType;

		// don't get/set properties on text, comment and attribute nodes
		if ( !elem || nType === 3 || nType === 8 || nType === 2 ) {
			return;
		}

		notxml = nType !== 1 || !jQuery.isXMLDoc( elem );

		if ( notxml ) {
			// Fix name and attach hooks
			name = jQuery.propFix[ name ] || name;
			hooks = jQuery.propHooks[ name ];
		}

		if ( value !== undefined ) {
			if ( hooks && "set" in hooks && (ret = hooks.set( elem, value, name )) !== undefined ) {
				return ret;

			} else {
				return ( elem[ name ] = value );
			}

		} else {
			if ( hooks && "get" in hooks && (ret = hooks.get( elem, name )) !== null ) {
				return ret;

			} else {
				return elem[ name ];
			}
		}
	},

	propHooks: {
		tabIndex: {
			get: function( elem ) {
				// elem.tabIndex doesn't always return the correct value when it hasn't been explicitly set
				// http://fluidproject.org/blog/2008/01/09/getting-setting-and-removing-tabindex-values-with-javascript/
				var attributeNode = elem.getAttributeNode("tabindex");

				return attributeNode && attributeNode.specified ?
					parseInt( attributeNode.value, 10 ) :
					rfocusable.test( elem.nodeName ) || rclickable.test( elem.nodeName ) && elem.href ?
						0 :
						undefined;
			}
		}
	}
});

// Hook for boolean attributes
boolHook = {
	get: function( elem, name ) {
		// Align boolean attributes with corresponding properties
		// Fall back to attribute presence where some booleans are not supported
		var attrNode,
			property = jQuery.prop( elem, name );
		return property === true || typeof property !== "boolean" && ( attrNode = elem.getAttributeNode(name) ) && attrNode.nodeValue !== false ?
			name.toLowerCase() :
			undefined;
	},
	set: function( elem, value, name ) {
		var propName;
		if ( value === false ) {
			// Remove boolean attributes when set to false
			jQuery.removeAttr( elem, name );
		} else {
			// value is true since we know at this point it's type boolean and not false
			// Set boolean attributes to the same name and set the DOM property
			propName = jQuery.propFix[ name ] || name;
			if ( propName in elem ) {
				// Only set the IDL specifically if it already exists on the element
				elem[ propName ] = true;
			}

			elem.setAttribute( name, name.toLowerCase() );
		}
		return name;
	}
};

// IE6/7 do not support getting/setting some attributes with get/setAttribute
if ( !getSetAttribute ) {

	fixSpecified = {
		name: true,
		id: true,
		coords: true
	};

	// Use this for any attribute in IE6/7
	// This fixes almost every IE6/7 issue
	nodeHook = jQuery.valHooks.button = {
		get: function( elem, name ) {
			var ret;
			ret = elem.getAttributeNode( name );
			return ret && ( fixSpecified[ name ] ? ret.value !== "" : ret.specified ) ?
				ret.value :
				undefined;
		},
		set: function( elem, value, name ) {
			// Set the existing or create a new attribute node
			var ret = elem.getAttributeNode( name );
			if ( !ret ) {
				ret = document.createAttribute( name );
				elem.setAttributeNode( ret );
			}
			return ( ret.value = value + "" );
		}
	};

	// Set width and height to auto instead of 0 on empty string( Bug #8150 )
	// This is for removals
	jQuery.each([ "width", "height" ], function( i, name ) {
		jQuery.attrHooks[ name ] = jQuery.extend( jQuery.attrHooks[ name ], {
			set: function( elem, value ) {
				if ( value === "" ) {
					elem.setAttribute( name, "auto" );
					return value;
				}
			}
		});
	});

	// Set contenteditable to false on removals(#10429)
	// Setting to empty string throws an error as an invalid value
	jQuery.attrHooks.contenteditable = {
		get: nodeHook.get,
		set: function( elem, value, name ) {
			if ( value === "" ) {
				value = "false";
			}
			nodeHook.set( elem, value, name );
		}
	};
}


// Some attributes require a special call on IE
if ( !jQuery.support.hrefNormalized ) {
	jQuery.each([ "href", "src", "width", "height" ], function( i, name ) {
		jQuery.attrHooks[ name ] = jQuery.extend( jQuery.attrHooks[ name ], {
			get: function( elem ) {
				var ret = elem.getAttribute( name, 2 );
				return ret === null ? undefined : ret;
			}
		});
	});
}

if ( !jQuery.support.style ) {
	jQuery.attrHooks.style = {
		get: function( elem ) {
			// Return undefined in the case of empty string
			// Normalize to lowercase since IE uppercases css property names
			return elem.style.cssText.toLowerCase() || undefined;
		},
		set: function( elem, value ) {
			return ( elem.style.cssText = value + "" );
		}
	};
}

// Safari mis-reports the default selected property of an option
// Accessing the parent's selectedIndex property fixes it
if ( !jQuery.support.optSelected ) {
	jQuery.propHooks.selected = jQuery.extend( jQuery.propHooks.selected, {
		get: function( elem ) {
			var parent = elem.parentNode;

			if ( parent ) {
				parent.selectedIndex;

				// Make sure that it also works with optgroups, see #5701
				if ( parent.parentNode ) {
					parent.parentNode.selectedIndex;
				}
			}
			return null;
		}
	});
}

// IE6/7 call enctype encoding
if ( !jQuery.support.enctype ) {
	jQuery.propFix.enctype = "encoding";
}

// Radios and checkboxes getter/setter
if ( !jQuery.support.checkOn ) {
	jQuery.each([ "radio", "checkbox" ], function() {
		jQuery.valHooks[ this ] = {
			get: function( elem ) {
				// Handle the case where in Webkit "" is returned instead of "on" if a value isn't specified
				return elem.getAttribute("value") === null ? "on" : elem.value;
			}
		};
	});
}
jQuery.each([ "radio", "checkbox" ], function() {
	jQuery.valHooks[ this ] = jQuery.extend( jQuery.valHooks[ this ], {
		set: function( elem, value ) {
			if ( jQuery.isArray( value ) ) {
				return ( elem.checked = jQuery.inArray( jQuery(elem).val(), value ) >= 0 );
			}
		}
	});
});
var rformElems = /^(?:textarea|input|select)$/i,
	rtypenamespace = /^([^\.]*|)(?:\.(.+)|)$/,
	rhoverHack = /(?:^|\s)hover(\.\S+|)\b/,
	rkeyEvent = /^key/,
	rmouseEvent = /^(?:mouse|contextmenu)|click/,
	rfocusMorph = /^(?:focusinfocus|focusoutblur)$/,
	hoverHack = function( events ) {
		return jQuery.event.special.hover ? events : events.replace( rhoverHack, "mouseenter$1 mouseleave$1" );
	};

/*
 * Helper functions for managing events -- not part of the public interface.
 * Props to Dean Edwards' addEvent library for many of the ideas.
 */
jQuery.event = {

	add: function( elem, types, handler, data, selector ) {

		var elemData, eventHandle, events,
			t, tns, type, namespaces, handleObj,
			handleObjIn, handlers, special;

		// Don't attach events to noData or text/comment nodes (allow plain objects tho)
		if ( elem.nodeType === 3 || elem.nodeType === 8 || !types || !handler || !(elemData = jQuery._data( elem )) ) {
			return;
		}

		// Caller can pass in an object of custom data in lieu of the handler
		if ( handler.handler ) {
			handleObjIn = handler;
			handler = handleObjIn.handler;
			selector = handleObjIn.selector;
		}

		// Make sure that the handler has a unique ID, used to find/remove it later
		if ( !handler.guid ) {
			handler.guid = jQuery.guid++;
		}

		// Init the element's event structure and main handler, if this is the first
		events = elemData.events;
		if ( !events ) {
			elemData.events = events = {};
		}
		eventHandle = elemData.handle;
		if ( !eventHandle ) {
			elemData.handle = eventHandle = function( e ) {
				// Discard the second event of a jQuery.event.trigger() and
				// when an event is called after a page has unloaded
				return typeof jQuery !== "undefined" && (!e || jQuery.event.triggered !== e.type) ?
					jQuery.event.dispatch.apply( eventHandle.elem, arguments ) :
					undefined;
			};
			// Add elem as a property of the handle fn to prevent a memory leak with IE non-native events
			eventHandle.elem = elem;
		}

		// Handle multiple events separated by a space
		// jQuery(...).bind("mouseover mouseout", fn);
		types = jQuery.trim( hoverHack(types) ).split( " " );
		for ( t = 0; t < types.length; t++ ) {

			tns = rtypenamespace.exec( types[t] ) || [];
			type = tns[1];
			namespaces = ( tns[2] || "" ).split( "." ).sort();

			// If event changes its type, use the special event handlers for the changed type
			special = jQuery.event.special[ type ] || {};

			// If selector defined, determine special event api type, otherwise given type
			type = ( selector ? special.delegateType : special.bindType ) || type;

			// Update special based on newly reset type
			special = jQuery.event.special[ type ] || {};

			// handleObj is passed to all event handlers
			handleObj = jQuery.extend({
				type: type,
				origType: tns[1],
				data: data,
				handler: handler,
				guid: handler.guid,
				selector: selector,
				needsContext: selector && jQuery.expr.match.needsContext.test( selector ),
				namespace: namespaces.join(".")
			}, handleObjIn );

			// Init the event handler queue if we're the first
			handlers = events[ type ];
			if ( !handlers ) {
				handlers = events[ type ] = [];
				handlers.delegateCount = 0;

				// Only use addEventListener/attachEvent if the special events handler returns false
				if ( !special.setup || special.setup.call( elem, data, namespaces, eventHandle ) === false ) {
					// Bind the global event handler to the element
					if ( elem.addEventListener ) {
						elem.addEventListener( type, eventHandle, false );

					} else if ( elem.attachEvent ) {
						elem.attachEvent( "on" + type, eventHandle );
					}
				}
			}

			if ( special.add ) {
				special.add.call( elem, handleObj );

				if ( !handleObj.handler.guid ) {
					handleObj.handler.guid = handler.guid;
				}
			}

			// Add to the element's handler list, delegates in front
			if ( selector ) {
				handlers.splice( handlers.delegateCount++, 0, handleObj );
			} else {
				handlers.push( handleObj );
			}

			// Keep track of which events have ever been used, for event optimization
			jQuery.event.global[ type ] = true;
		}

		// Nullify elem to prevent memory leaks in IE
		elem = null;
	},

	global: {},

	// Detach an event or set of events from an element
	remove: function( elem, types, handler, selector, mappedTypes ) {

		var t, tns, type, origType, namespaces, origCount,
			j, events, special, eventType, handleObj,
			elemData = jQuery.hasData( elem ) && jQuery._data( elem );

		if ( !elemData || !(events = elemData.events) ) {
			return;
		}

		// Once for each type.namespace in types; type may be omitted
		types = jQuery.trim( hoverHack( types || "" ) ).split(" ");
		for ( t = 0; t < types.length; t++ ) {
			tns = rtypenamespace.exec( types[t] ) || [];
			type = origType = tns[1];
			namespaces = tns[2];

			// Unbind all events (on this namespace, if provided) for the element
			if ( !type ) {
				for ( type in events ) {
					jQuery.event.remove( elem, type + types[ t ], handler, selector, true );
				}
				continue;
			}

			special = jQuery.event.special[ type ] || {};
			type = ( selector? special.delegateType : special.bindType ) || type;
			eventType = events[ type ] || [];
			origCount = eventType.length;
			namespaces = namespaces ? new RegExp("(^|\\.)" + namespaces.split(".").sort().join("\\.(?:.*\\.|)") + "(\\.|$)") : null;

			// Remove matching events
			for ( j = 0; j < eventType.length; j++ ) {
				handleObj = eventType[ j ];

				if ( ( mappedTypes || origType === handleObj.origType ) &&
					 ( !handler || handler.guid === handleObj.guid ) &&
					 ( !namespaces || namespaces.test( handleObj.namespace ) ) &&
					 ( !selector || selector === handleObj.selector || selector === "**" && handleObj.selector ) ) {
					eventType.splice( j--, 1 );

					if ( handleObj.selector ) {
						eventType.delegateCount--;
					}
					if ( special.remove ) {
						special.remove.call( elem, handleObj );
					}
				}
			}

			// Remove generic event handler if we removed something and no more handlers exist
			// (avoids potential for endless recursion during removal of special event handlers)
			if ( eventType.length === 0 && origCount !== eventType.length ) {
				if ( !special.teardown || special.teardown.call( elem, namespaces, elemData.handle ) === false ) {
					jQuery.removeEvent( elem, type, elemData.handle );
				}

				delete events[ type ];
			}
		}

		// Remove the expando if it's no longer used
		if ( jQuery.isEmptyObject( events ) ) {
			delete elemData.handle;

			// removeData also checks for emptiness and clears the expando if empty
			// so use it instead of delete
			jQuery.removeData( elem, "events", true );
		}
	},

	// Events that are safe to short-circuit if no handlers are attached.
	// Native DOM events should not be added, they may have inline handlers.
	customEvent: {
		"getData": true,
		"setData": true,
		"changeData": true
	},

	trigger: function( event, data, elem, onlyHandlers ) {
		// Don't do events on text and comment nodes
		if ( elem && (elem.nodeType === 3 || elem.nodeType === 8) ) {
			return;
		}

		// Event object or event type
		var cache, exclusive, i, cur, old, ontype, special, handle, eventPath, bubbleType,
			type = event.type || event,
			namespaces = [];

		// focus/blur morphs to focusin/out; ensure we're not firing them right now
		if ( rfocusMorph.test( type + jQuery.event.triggered ) ) {
			return;
		}

		if ( type.indexOf( "!" ) >= 0 ) {
			// Exclusive events trigger only for the exact event (no namespaces)
			type = type.slice(0, -1);
			exclusive = true;
		}

		if ( type.indexOf( "." ) >= 0 ) {
			// Namespaced trigger; create a regexp to match event type in handle()
			namespaces = type.split(".");
			type = namespaces.shift();
			namespaces.sort();
		}

		if ( (!elem || jQuery.event.customEvent[ type ]) && !jQuery.event.global[ type ] ) {
			// No jQuery handlers for this event type, and it can't have inline handlers
			return;
		}

		// Caller can pass in an Event, Object, or just an event type string
		event = typeof event === "object" ?
			// jQuery.Event object
			event[ jQuery.expando ] ? event :
			// Object literal
			new jQuery.Event( type, event ) :
			// Just the event type (string)
			new jQuery.Event( type );

		event.type = type;
		event.isTrigger = true;
		event.exclusive = exclusive;
		event.namespace = namespaces.join( "." );
		event.namespace_re = event.namespace? new RegExp("(^|\\.)" + namespaces.join("\\.(?:.*\\.|)") + "(\\.|$)") : null;
		ontype = type.indexOf( ":" ) < 0 ? "on" + type : "";

		// Handle a global trigger
		if ( !elem ) {

			// TODO: Stop taunting the data cache; remove global events and always attach to document
			cache = jQuery.cache;
			for ( i in cache ) {
				if ( cache[ i ].events && cache[ i ].events[ type ] ) {
					jQuery.event.trigger( event, data, cache[ i ].handle.elem, true );
				}
			}
			return;
		}

		// Clean up the event in case it is being reused
		event.result = undefined;
		if ( !event.target ) {
			event.target = elem;
		}

		// Clone any incoming data and prepend the event, creating the handler arg list
		data = data != null ? jQuery.makeArray( data ) : [];
		data.unshift( event );

		// Allow special events to draw outside the lines
		special = jQuery.event.special[ type ] || {};
		if ( special.trigger && special.trigger.apply( elem, data ) === false ) {
			return;
		}

		// Determine event propagation path in advance, per W3C events spec (#9951)
		// Bubble up to document, then to window; watch for a global ownerDocument var (#9724)
		eventPath = [[ elem, special.bindType || type ]];
		if ( !onlyHandlers && !special.noBubble && !jQuery.isWindow( elem ) ) {

			bubbleType = special.delegateType || type;
			cur = rfocusMorph.test( bubbleType + type ) ? elem : elem.parentNode;
			for ( old = elem; cur; cur = cur.parentNode ) {
				eventPath.push([ cur, bubbleType ]);
				old = cur;
			}

			// Only add window if we got to document (e.g., not plain obj or detached DOM)
			if ( old === (elem.ownerDocument || document) ) {
				eventPath.push([ old.defaultView || old.parentWindow || window, bubbleType ]);
			}
		}

		// Fire handlers on the event path
		for ( i = 0; i < eventPath.length && !event.isPropagationStopped(); i++ ) {

			cur = eventPath[i][0];
			event.type = eventPath[i][1];

			handle = ( jQuery._data( cur, "events" ) || {} )[ event.type ] && jQuery._data( cur, "handle" );
			if ( handle ) {
				handle.apply( cur, data );
			}
			// Note that this is a bare JS function and not a jQuery handler
			handle = ontype && cur[ ontype ];
			if ( handle && jQuery.acceptData( cur ) && handle.apply && handle.apply( cur, data ) === false ) {
				event.preventDefault();
			}
		}
		event.type = type;

		// If nobody prevented the default action, do it now
		if ( !onlyHandlers && !event.isDefaultPrevented() ) {

			if ( (!special._default || special._default.apply( elem.ownerDocument, data ) === false) &&
				!(type === "click" && jQuery.nodeName( elem, "a" )) && jQuery.acceptData( elem ) ) {

				// Call a native DOM method on the target with the same name name as the event.
				// Can't use an .isFunction() check here because IE6/7 fails that test.
				// Don't do default actions on window, that's where global variables be (#6170)
				// IE<9 dies on focus/blur to hidden element (#1486)
				if ( ontype && elem[ type ] && ((type !== "focus" && type !== "blur") || event.target.offsetWidth !== 0) && !jQuery.isWindow( elem ) ) {

					// Don't re-trigger an onFOO event when we call its FOO() method
					old = elem[ ontype ];

					if ( old ) {
						elem[ ontype ] = null;
					}

					// Prevent re-triggering of the same event, since we already bubbled it above
					jQuery.event.triggered = type;
					elem[ type ]();
					jQuery.event.triggered = undefined;

					if ( old ) {
						elem[ ontype ] = old;
					}
				}
			}
		}

		return event.result;
	},

	dispatch: function( event ) {

		// Make a writable jQuery.Event from the native event object
		event = jQuery.event.fix( event || window.event );

		var i, j, cur, ret, selMatch, matched, matches, handleObj, sel, related,
			handlers = ( (jQuery._data( this, "events" ) || {} )[ event.type ] || []),
			delegateCount = handlers.delegateCount,
			args = core_slice.call( arguments ),
			run_all = !event.exclusive && !event.namespace,
			special = jQuery.event.special[ event.type ] || {},
			handlerQueue = [];

		// Use the fix-ed jQuery.Event rather than the (read-only) native event
		args[0] = event;
		event.delegateTarget = this;

		// Call the preDispatch hook for the mapped type, and let it bail if desired
		if ( special.preDispatch && special.preDispatch.call( this, event ) === false ) {
			return;
		}

		// Determine handlers that should run if there are delegated events
		// Avoid non-left-click bubbling in Firefox (#3861)
		if ( delegateCount && !(event.button && event.type === "click") ) {

			for ( cur = event.target; cur != this; cur = cur.parentNode || this ) {

				// Don't process clicks (ONLY) on disabled elements (#6911, #8165, #11382, #11764)
				if ( cur.disabled !== true || event.type !== "click" ) {
					selMatch = {};
					matches = [];
					for ( i = 0; i < delegateCount; i++ ) {
						handleObj = handlers[ i ];
						sel = handleObj.selector;

						if ( selMatch[ sel ] === undefined ) {
							selMatch[ sel ] = handleObj.needsContext ?
								jQuery( sel, this ).index( cur ) >= 0 :
								jQuery.find( sel, this, null, [ cur ] ).length;
						}
						if ( selMatch[ sel ] ) {
							matches.push( handleObj );
						}
					}
					if ( matches.length ) {
						handlerQueue.push({ elem: cur, matches: matches });
					}
				}
			}
		}

		// Add the remaining (directly-bound) handlers
		if ( handlers.length > delegateCount ) {
			handlerQueue.push({ elem: this, matches: handlers.slice( delegateCount ) });
		}

		// Run delegates first; they may want to stop propagation beneath us
		for ( i = 0; i < handlerQueue.length && !event.isPropagationStopped(); i++ ) {
			matched = handlerQueue[ i ];
			event.currentTarget = matched.elem;

			for ( j = 0; j < matched.matches.length && !event.isImmediatePropagationStopped(); j++ ) {
				handleObj = matched.matches[ j ];

				// Triggered event must either 1) be non-exclusive and have no namespace, or
				// 2) have namespace(s) a subset or equal to those in the bound event (both can have no namespace).
				if ( run_all || (!event.namespace && !handleObj.namespace) || event.namespace_re && event.namespace_re.test( handleObj.namespace ) ) {

					event.data = handleObj.data;
					event.handleObj = handleObj;

					ret = ( (jQuery.event.special[ handleObj.origType ] || {}).handle || handleObj.handler )
							.apply( matched.elem, args );

					if ( ret !== undefined ) {
						event.result = ret;
						if ( ret === false ) {
							event.preventDefault();
							event.stopPropagation();
						}
					}
				}
			}
		}

		// Call the postDispatch hook for the mapped type
		if ( special.postDispatch ) {
			special.postDispatch.call( this, event );
		}

		return event.result;
	},

	// Includes some event props shared by KeyEvent and MouseEvent
	// *** attrChange attrName relatedNode srcElement  are not normalized, non-W3C, deprecated, will be removed in 1.8 ***
	props: "attrChange attrName relatedNode srcElement altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" "),

	fixHooks: {},

	keyHooks: {
		props: "char charCode key keyCode".split(" "),
		filter: function( event, original ) {

			// Add which for key events
			if ( event.which == null ) {
				event.which = original.charCode != null ? original.charCode : original.keyCode;
			}

			return event;
		}
	},

	mouseHooks: {
		props: "button buttons clientX clientY fromElement offsetX offsetY pageX pageY screenX screenY toElement".split(" "),
		filter: function( event, original ) {
			var eventDoc, doc, body,
				button = original.button,
				fromElement = original.fromElement;

			// Calculate pageX/Y if missing and clientX/Y available
			if ( event.pageX == null && original.clientX != null ) {
				eventDoc = event.target.ownerDocument || document;
				doc = eventDoc.documentElement;
				body = eventDoc.body;

				event.pageX = original.clientX + ( doc && doc.scrollLeft || body && body.scrollLeft || 0 ) - ( doc && doc.clientLeft || body && body.clientLeft || 0 );
				event.pageY = original.clientY + ( doc && doc.scrollTop  || body && body.scrollTop  || 0 ) - ( doc && doc.clientTop  || body && body.clientTop  || 0 );
			}

			// Add relatedTarget, if necessary
			if ( !event.relatedTarget && fromElement ) {
				event.relatedTarget = fromElement === event.target ? original.toElement : fromElement;
			}

			// Add which for click: 1 === left; 2 === middle; 3 === right
			// Note: button is not normalized, so don't use it
			if ( !event.which && button !== undefined ) {
				event.which = ( button & 1 ? 1 : ( button & 2 ? 3 : ( button & 4 ? 2 : 0 ) ) );
			}

			return event;
		}
	},

	fix: function( event ) {
		if ( event[ jQuery.expando ] ) {
			return event;
		}

		// Create a writable copy of the event object and normalize some properties
		var i, prop,
			originalEvent = event,
			fixHook = jQuery.event.fixHooks[ event.type ] || {},
			copy = fixHook.props ? this.props.concat( fixHook.props ) : this.props;

		event = jQuery.Event( originalEvent );

		for ( i = copy.length; i; ) {
			prop = copy[ --i ];
			event[ prop ] = originalEvent[ prop ];
		}

		// Fix target property, if necessary (#1925, IE 6/7/8 & Safari2)
		if ( !event.target ) {
			event.target = originalEvent.srcElement || document;
		}

		// Target should not be a text node (#504, Safari)
		if ( event.target.nodeType === 3 ) {
			event.target = event.target.parentNode;
		}

		// For mouse/key events, metaKey==false if it's undefined (#3368, #11328; IE6/7/8)
		event.metaKey = !!event.metaKey;

		return fixHook.filter? fixHook.filter( event, originalEvent ) : event;
	},

	special: {
		load: {
			// Prevent triggered image.load events from bubbling to window.load
			noBubble: true
		},

		focus: {
			delegateType: "focusin"
		},
		blur: {
			delegateType: "focusout"
		},

		beforeunload: {
			setup: function( data, namespaces, eventHandle ) {
				// We only want to do this special case on windows
				if ( jQuery.isWindow( this ) ) {
					this.onbeforeunload = eventHandle;
				}
			},

			teardown: function( namespaces, eventHandle ) {
				if ( this.onbeforeunload === eventHandle ) {
					this.onbeforeunload = null;
				}
			}
		}
	},

	simulate: function( type, elem, event, bubble ) {
		// Piggyback on a donor event to simulate a different one.
		// Fake originalEvent to avoid donor's stopPropagation, but if the
		// simulated event prevents default then we do the same on the donor.
		var e = jQuery.extend(
			new jQuery.Event(),
			event,
			{ type: type,
				isSimulated: true,
				originalEvent: {}
			}
		);
		if ( bubble ) {
			jQuery.event.trigger( e, null, elem );
		} else {
			jQuery.event.dispatch.call( elem, e );
		}
		if ( e.isDefaultPrevented() ) {
			event.preventDefault();
		}
	}
};

// Some plugins are using, but it's undocumented/deprecated and will be removed.
// The 1.7 special event interface should provide all the hooks needed now.
jQuery.event.handle = jQuery.event.dispatch;

jQuery.removeEvent = document.removeEventListener ?
	function( elem, type, handle ) {
		if ( elem.removeEventListener ) {
			elem.removeEventListener( type, handle, false );
		}
	} :
	function( elem, type, handle ) {
		var name = "on" + type;

		if ( elem.detachEvent ) {

			// #8545, #7054, preventing memory leaks for custom events in IE6-8
			// detachEvent needed property on element, by name of that event, to properly expose it to GC
			if ( typeof elem[ name ] === "undefined" ) {
				elem[ name ] = null;
			}

			elem.detachEvent( name, handle );
		}
	};

jQuery.Event = function( src, props ) {
	// Allow instantiation without the 'new' keyword
	if ( !(this instanceof jQuery.Event) ) {
		return new jQuery.Event( src, props );
	}

	// Event object
	if ( src && src.type ) {
		this.originalEvent = src;
		this.type = src.type;

		// Events bubbling up the document may have been marked as prevented
		// by a handler lower down the tree; reflect the correct value.
		this.isDefaultPrevented = ( src.defaultPrevented || src.returnValue === false ||
			src.getPreventDefault && src.getPreventDefault() ) ? returnTrue : returnFalse;

	// Event type
	} else {
		this.type = src;
	}

	// Put explicitly provided properties onto the event object
	if ( props ) {
		jQuery.extend( this, props );
	}

	// Create a timestamp if incoming event doesn't have one
	this.timeStamp = src && src.timeStamp || jQuery.now();

	// Mark it as fixed
	this[ jQuery.expando ] = true;
};

function returnFalse() {
	return false;
}
function returnTrue() {
	return true;
}

// jQuery.Event is based on DOM3 Events as specified by the ECMAScript Language Binding
// http://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html
jQuery.Event.prototype = {
	preventDefault: function() {
		this.isDefaultPrevented = returnTrue;

		var e = this.originalEvent;
		if ( !e ) {
			return;
		}

		// if preventDefault exists run it on the original event
		if ( e.preventDefault ) {
			e.preventDefault();

		// otherwise set the returnValue property of the original event to false (IE)
		} else {
			e.returnValue = false;
		}
	},
	stopPropagation: function() {
		this.isPropagationStopped = returnTrue;

		var e = this.originalEvent;
		if ( !e ) {
			return;
		}
		// if stopPropagation exists run it on the original event
		if ( e.stopPropagation ) {
			e.stopPropagation();
		}
		// otherwise set the cancelBubble property of the original event to true (IE)
		e.cancelBubble = true;
	},
	stopImmediatePropagation: function() {
		this.isImmediatePropagationStopped = returnTrue;
		this.stopPropagation();
	},
	isDefaultPrevented: returnFalse,
	isPropagationStopped: returnFalse,
	isImmediatePropagationStopped: returnFalse
};

// Create mouseenter/leave events using mouseover/out and event-time checks
jQuery.each({
	mouseenter: "mouseover",
	mouseleave: "mouseout"
}, function( orig, fix ) {
	jQuery.event.special[ orig ] = {
		delegateType: fix,
		bindType: fix,

		handle: function( event ) {
			var ret,
				target = this,
				related = event.relatedTarget,
				handleObj = event.handleObj,
				selector = handleObj.selector;

			// For mousenter/leave call the handler if related is outside the target.
			// NB: No relatedTarget if the mouse left/entered the browser window
			if ( !related || (related !== target && !jQuery.contains( target, related )) ) {
				event.type = handleObj.origType;
				ret = handleObj.handler.apply( this, arguments );
				event.type = fix;
			}
			return ret;
		}
	};
});

// IE submit delegation
if ( !jQuery.support.submitBubbles ) {

	jQuery.event.special.submit = {
		setup: function() {
			// Only need this for delegated form submit events
			if ( jQuery.nodeName( this, "form" ) ) {
				return false;
			}

			// Lazy-add a submit handler when a descendant form may potentially be submitted
			jQuery.event.add( this, "click._submit keypress._submit", function( e ) {
				// Node name check avoids a VML-related crash in IE (#9807)
				var elem = e.target,
					form = jQuery.nodeName( elem, "input" ) || jQuery.nodeName( elem, "button" ) ? elem.form : undefined;
				if ( form && !jQuery._data( form, "_submit_attached" ) ) {
					jQuery.event.add( form, "submit._submit", function( event ) {
						event._submit_bubble = true;
					});
					jQuery._data( form, "_submit_attached", true );
				}
			});
			// return undefined since we don't need an event listener
		},

		postDispatch: function( event ) {
			// If form was submitted by the user, bubble the event up the tree
			if ( event._submit_bubble ) {
				delete event._submit_bubble;
				if ( this.parentNode && !event.isTrigger ) {
					jQuery.event.simulate( "submit", this.parentNode, event, true );
				}
			}
		},

		teardown: function() {
			// Only need this for delegated form submit events
			if ( jQuery.nodeName( this, "form" ) ) {
				return false;
			}

			// Remove delegated handlers; cleanData eventually reaps submit handlers attached above
			jQuery.event.remove( this, "._submit" );
		}
	};
}

// IE change delegation and checkbox/radio fix
if ( !jQuery.support.changeBubbles ) {

	jQuery.event.special.change = {

		setup: function() {

			if ( rformElems.test( this.nodeName ) ) {
				// IE doesn't fire change on a check/radio until blur; trigger it on click
				// after a propertychange. Eat the blur-change in special.change.handle.
				// This still fires onchange a second time for check/radio after blur.
				if ( this.type === "checkbox" || this.type === "radio" ) {
					jQuery.event.add( this, "propertychange._change", function( event ) {
						if ( event.originalEvent.propertyName === "checked" ) {
							this._just_changed = true;
						}
					});
					jQuery.event.add( this, "click._change", function( event ) {
						if ( this._just_changed && !event.isTrigger ) {
							this._just_changed = false;
						}
						// Allow triggered, simulated change events (#11500)
						jQuery.event.simulate( "change", this, event, true );
					});
				}
				return false;
			}
			// Delegated event; lazy-add a change handler on descendant inputs
			jQuery.event.add( this, "beforeactivate._change", function( e ) {
				var elem = e.target;

				if ( rformElems.test( elem.nodeName ) && !jQuery._data( elem, "_change_attached" ) ) {
					jQuery.event.add( elem, "change._change", function( event ) {
						if ( this.parentNode && !event.isSimulated && !event.isTrigger ) {
							jQuery.event.simulate( "change", this.parentNode, event, true );
						}
					});
					jQuery._data( elem, "_change_attached", true );
				}
			});
		},

		handle: function( event ) {
			var elem = event.target;

			// Swallow native change events from checkbox/radio, we already triggered them above
			if ( this !== elem || event.isSimulated || event.isTrigger || (elem.type !== "radio" && elem.type !== "checkbox") ) {
				return event.handleObj.handler.apply( this, arguments );
			}
		},

		teardown: function() {
			jQuery.event.remove( this, "._change" );

			return !rformElems.test( this.nodeName );
		}
	};
}

// Create "bubbling" focus and blur events
if ( !jQuery.support.focusinBubbles ) {
	jQuery.each({ focus: "focusin", blur: "focusout" }, function( orig, fix ) {

		// Attach a single capturing handler while someone wants focusin/focusout
		var attaches = 0,
			handler = function( event ) {
				jQuery.event.simulate( fix, event.target, jQuery.event.fix( event ), true );
			};

		jQuery.event.special[ fix ] = {
			setup: function() {
				if ( attaches++ === 0 ) {
					document.addEventListener( orig, handler, true );
				}
			},
			teardown: function() {
				if ( --attaches === 0 ) {
					document.removeEventListener( orig, handler, true );
				}
			}
		};
	});
}

jQuery.fn.extend({

	on: function( types, selector, data, fn, /*INTERNAL*/ one ) {
		var origFn, type;

		// Types can be a map of types/handlers
		if ( typeof types === "object" ) {
			// ( types-Object, selector, data )
			if ( typeof selector !== "string" ) { // && selector != null
				// ( types-Object, data )
				data = data || selector;
				selector = undefined;
			}
			for ( type in types ) {
				this.on( type, selector, data, types[ type ], one );
			}
			return this;
		}

		if ( data == null && fn == null ) {
			// ( types, fn )
			fn = selector;
			data = selector = undefined;
		} else if ( fn == null ) {
			if ( typeof selector === "string" ) {
				// ( types, selector, fn )
				fn = data;
				data = undefined;
			} else {
				// ( types, data, fn )
				fn = data;
				data = selector;
				selector = undefined;
			}
		}
		if ( fn === false ) {
			fn = returnFalse;
		} else if ( !fn ) {
			return this;
		}

		if ( one === 1 ) {
			origFn = fn;
			fn = function( event ) {
				// Can use an empty set, since event contains the info
				jQuery().off( event );
				return origFn.apply( this, arguments );
			};
			// Use same guid so caller can remove using origFn
			fn.guid = origFn.guid || ( origFn.guid = jQuery.guid++ );
		}
		return this.each( function() {
			jQuery.event.add( this, types, fn, data, selector );
		});
	},
	one: function( types, selector, data, fn ) {
		return this.on( types, selector, data, fn, 1 );
	},
	off: function( types, selector, fn ) {
		var handleObj, type;
		if ( types && types.preventDefault && types.handleObj ) {
			// ( event )  dispatched jQuery.Event
			handleObj = types.handleObj;
			jQuery( types.delegateTarget ).off(
				handleObj.namespace ? handleObj.origType + "." + handleObj.namespace : handleObj.origType,
				handleObj.selector,
				handleObj.handler
			);
			return this;
		}
		if ( typeof types === "object" ) {
			// ( types-object [, selector] )
			for ( type in types ) {
				this.off( type, selector, types[ type ] );
			}
			return this;
		}
		if ( selector === false || typeof selector === "function" ) {
			// ( types [, fn] )
			fn = selector;
			selector = undefined;
		}
		if ( fn === false ) {
			fn = returnFalse;
		}
		return this.each(function() {
			jQuery.event.remove( this, types, fn, selector );
		});
	},

	bind: function( types, data, fn ) {
		return this.on( types, null, data, fn );
	},
	unbind: function( types, fn ) {
		return this.off( types, null, fn );
	},

	live: function( types, data, fn ) {
		jQuery( this.context ).on( types, this.selector, data, fn );
		return this;
	},
	die: function( types, fn ) {
		jQuery( this.context ).off( types, this.selector || "**", fn );
		return this;
	},

	delegate: function( selector, types, data, fn ) {
		return this.on( types, selector, data, fn );
	},
	undelegate: function( selector, types, fn ) {
		// ( namespace ) or ( selector, types [, fn] )
		return arguments.length === 1 ? this.off( selector, "**" ) : this.off( types, selector || "**", fn );
	},

	trigger: function( type, data ) {
		return this.each(function() {
			jQuery.event.trigger( type, data, this );
		});
	},
	triggerHandler: function( type, data ) {
		if ( this[0] ) {
			return jQuery.event.trigger( type, data, this[0], true );
		}
	},

	toggle: function( fn ) {
		// Save reference to arguments for access in closure
		var args = arguments,
			guid = fn.guid || jQuery.guid++,
			i = 0,
			toggler = function( event ) {
				// Figure out which function to execute
				var lastToggle = ( jQuery._data( this, "lastToggle" + fn.guid ) || 0 ) % i;
				jQuery._data( this, "lastToggle" + fn.guid, lastToggle + 1 );

				// Make sure that clicks stop
				event.preventDefault();

				// and execute the function
				return args[ lastToggle ].apply( this, arguments ) || false;
			};

		// link all the functions, so any of them can unbind this click handler
		toggler.guid = guid;
		while ( i < args.length ) {
			args[ i++ ].guid = guid;
		}

		return this.click( toggler );
	},

	hover: function( fnOver, fnOut ) {
		return this.mouseenter( fnOver ).mouseleave( fnOut || fnOver );
	}
});

jQuery.each( ("blur focus focusin focusout load resize scroll unload click dblclick " +
	"mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
	"change select submit keydown keypress keyup error contextmenu").split(" "), function( i, name ) {

	// Handle event binding
	jQuery.fn[ name ] = function( data, fn ) {
		if ( fn == null ) {
			fn = data;
			data = null;
		}

		return arguments.length > 0 ?
			this.on( name, null, data, fn ) :
			this.trigger( name );
	};

	if ( rkeyEvent.test( name ) ) {
		jQuery.event.fixHooks[ name ] = jQuery.event.keyHooks;
	}

	if ( rmouseEvent.test( name ) ) {
		jQuery.event.fixHooks[ name ] = jQuery.event.mouseHooks;
	}
});
/*!
 * Sizzle CSS Selector Engine
 * Copyright 2012 jQuery Foundation and other contributors
 * Released under the MIT license
 * http://sizzlejs.com/
 */
(function( window, undefined ) {

var cachedruns,
	assertGetIdNotName,
	Expr,
	getText,
	isXML,
	contains,
	compile,
	sortOrder,
	hasDuplicate,
	outermostContext,

	baseHasDuplicate = true,
	strundefined = "undefined",

	expando = ( "sizcache" + Math.random() ).replace( ".", "" ),

	Token = String,
	document = window.document,
	docElem = document.documentElement,
	dirruns = 0,
	done = 0,
	pop = [].pop,
	push = [].push,
	slice = [].slice,
	// Use a stripped-down indexOf if a native one is unavailable
	indexOf = [].indexOf || function( elem ) {
		var i = 0,
			len = this.length;
		for ( ; i < len; i++ ) {
			if ( this[i] === elem ) {
				return i;
			}
		}
		return -1;
	},

	// Augment a function for special use by Sizzle
	markFunction = function( fn, value ) {
		fn[ expando ] = value == null || value;
		return fn;
	},

	createCache = function() {
		var cache = {},
			keys = [];

		return markFunction(function( key, value ) {
			// Only keep the most recent entries
			if ( keys.push( key ) > Expr.cacheLength ) {
				delete cache[ keys.shift() ];
			}

			// Retrieve with (key + " ") to avoid collision with native Object.prototype properties (see Issue #157)
			return (cache[ key + " " ] = value);
		}, cache );
	},

	classCache = createCache(),
	tokenCache = createCache(),
	compilerCache = createCache(),

	// Regex

	// Whitespace characters http://www.w3.org/TR/css3-selectors/#whitespace
	whitespace = "[\\x20\\t\\r\\n\\f]",
	// http://www.w3.org/TR/css3-syntax/#characters
	characterEncoding = "(?:\\\\.|[-\\w]|[^\\x00-\\xa0])+",

	// Loosely modeled on CSS identifier characters
	// An unquoted value should be a CSS identifier (http://www.w3.org/TR/css3-selectors/#attribute-selectors)
	// Proper syntax: http://www.w3.org/TR/CSS21/syndata.html#value-def-identifier
	identifier = characterEncoding.replace( "w", "w#" ),

	// Acceptable operators http://www.w3.org/TR/selectors/#attribute-selectors
	operators = "([*^$|!~]?=)",
	attributes = "\\[" + whitespace + "*(" + characterEncoding + ")" + whitespace +
		"*(?:" + operators + whitespace + "*(?:(['\"])((?:\\\\.|[^\\\\])*?)\\3|(" + identifier + ")|)|)" + whitespace + "*\\]",

	// Prefer arguments not in parens/brackets,
	//   then attribute selectors and non-pseudos (denoted by :),
	//   then anything else
	// These preferences are here to reduce the number of selectors
	//   needing tokenize in the PSEUDO preFilter
	pseudos = ":(" + characterEncoding + ")(?:\\((?:(['\"])((?:\\\\.|[^\\\\])*?)\\2|([^()[\\]]*|(?:(?:" + attributes + ")|[^:]|\\\\.)*|.*))\\)|)",

	// For matchExpr.POS and matchExpr.needsContext
	pos = ":(even|odd|eq|gt|lt|nth|first|last)(?:\\(" + whitespace +
		"*((?:-\\d)?\\d*)" + whitespace + "*\\)|)(?=[^-]|$)",

	// Leading and non-escaped trailing whitespace, capturing some non-whitespace characters preceding the latter
	rtrim = new RegExp( "^" + whitespace + "+|((?:^|[^\\\\])(?:\\\\.)*)" + whitespace + "+$", "g" ),

	rcomma = new RegExp( "^" + whitespace + "*," + whitespace + "*" ),
	rcombinators = new RegExp( "^" + whitespace + "*([\\x20\\t\\r\\n\\f>+~])" + whitespace + "*" ),
	rpseudo = new RegExp( pseudos ),

	// Easily-parseable/retrievable ID or TAG or CLASS selectors
	rquickExpr = /^(?:#([\w\-]+)|(\w+)|\.([\w\-]+))$/,

	rnot = /^:not/,
	rsibling = /[\x20\t\r\n\f]*[+~]/,
	rendsWithNot = /:not\($/,

	rheader = /h\d/i,
	rinputs = /input|select|textarea|button/i,

	rbackslash = /\\(?!\\)/g,

	matchExpr = {
		"ID": new RegExp( "^#(" + characterEncoding + ")" ),
		"CLASS": new RegExp( "^\\.(" + characterEncoding + ")" ),
		"NAME": new RegExp( "^\\[name=['\"]?(" + characterEncoding + ")['\"]?\\]" ),
		"TAG": new RegExp( "^(" + characterEncoding.replace( "w", "w*" ) + ")" ),
		"ATTR": new RegExp( "^" + attributes ),
		"PSEUDO": new RegExp( "^" + pseudos ),
		"POS": new RegExp( pos, "i" ),
		"CHILD": new RegExp( "^:(only|nth|first|last)-child(?:\\(" + whitespace +
			"*(even|odd|(([+-]|)(\\d*)n|)" + whitespace + "*(?:([+-]|)" + whitespace +
			"*(\\d+)|))" + whitespace + "*\\)|)", "i" ),
		// For use in libraries implementing .is()
		"needsContext": new RegExp( "^" + whitespace + "*[>+~]|" + pos, "i" )
	},

	// Support

	// Used for testing something on an element
	assert = function( fn ) {
		var div = document.createElement("div");

		try {
			return fn( div );
		} catch (e) {
			return false;
		} finally {
			// release memory in IE
			div = null;
		}
	},

	// Check if getElementsByTagName("*") returns only elements
	assertTagNameNoComments = assert(function( div ) {
		div.appendChild( document.createComment("") );
		return !div.getElementsByTagName("*").length;
	}),

	// Check if getAttribute returns normalized href attributes
	assertHrefNotNormalized = assert(function( div ) {
		div.innerHTML = "<a href='#'></a>";
		return div.firstChild && typeof div.firstChild.getAttribute !== strundefined &&
			div.firstChild.getAttribute("href") === "#";
	}),

	// Check if attributes should be retrieved by attribute nodes
	assertAttributes = assert(function( div ) {
		div.innerHTML = "<select></select>";
		var type = typeof div.lastChild.getAttribute("multiple");
		// IE8 returns a string for some attributes even when not present
		return type !== "boolean" && type !== "string";
	}),

	// Check if getElementsByClassName can be trusted
	assertUsableClassName = assert(function( div ) {
		// Opera can't find a second classname (in 9.6)
		div.innerHTML = "<div class='hidden e'></div><div class='hidden'></div>";
		if ( !div.getElementsByClassName || !div.getElementsByClassName("e").length ) {
			return false;
		}

		// Safari 3.2 caches class attributes and doesn't catch changes
		div.lastChild.className = "e";
		return div.getElementsByClassName("e").length === 2;
	}),

	// Check if getElementById returns elements by name
	// Check if getElementsByName privileges form controls or returns elements by ID
	assertUsableName = assert(function( div ) {
		// Inject content
		div.id = expando + 0;
		div.innerHTML = "<a name='" + expando + "'></a><div name='" + expando + "'></div>";
		docElem.insertBefore( div, docElem.firstChild );

		// Test
		var pass = document.getElementsByName &&
			// buggy browsers will return fewer than the correct 2
			document.getElementsByName( expando ).length === 2 +
			// buggy browsers will return more than the correct 0
			document.getElementsByName( expando + 0 ).length;
		assertGetIdNotName = !document.getElementById( expando );

		// Cleanup
		docElem.removeChild( div );

		return pass;
	});

// If slice is not available, provide a backup
try {
	slice.call( docElem.childNodes, 0 )[0].nodeType;
} catch ( e ) {
	slice = function( i ) {
		var elem,
			results = [];
		for ( ; (elem = this[i]); i++ ) {
			results.push( elem );
		}
		return results;
	};
}

function Sizzle( selector, context, results, seed ) {
	results = results || [];
	context = context || document;
	var match, elem, xml, m,
		nodeType = context.nodeType;

	if ( !selector || typeof selector !== "string" ) {
		return results;
	}

	if ( nodeType !== 1 && nodeType !== 9 ) {
		return [];
	}

	xml = isXML( context );

	if ( !xml && !seed ) {
		if ( (match = rquickExpr.exec( selector )) ) {
			// Speed-up: Sizzle("#ID")
			if ( (m = match[1]) ) {
				if ( nodeType === 9 ) {
					elem = context.getElementById( m );
					// Check parentNode to catch when Blackberry 4.6 returns
					// nodes that are no longer in the document #6963
					if ( elem && elem.parentNode ) {
						// Handle the case where IE, Opera, and Webkit return items
						// by name instead of ID
						if ( elem.id === m ) {
							results.push( elem );
							return results;
						}
					} else {
						return results;
					}
				} else {
					// Context is not a document
					if ( context.ownerDocument && (elem = context.ownerDocument.getElementById( m )) &&
						contains( context, elem ) && elem.id === m ) {
						results.push( elem );
						return results;
					}
				}

			// Speed-up: Sizzle("TAG")
			} else if ( match[2] ) {
				push.apply( results, slice.call(context.getElementsByTagName( selector ), 0) );
				return results;

			// Speed-up: Sizzle(".CLASS")
			} else if ( (m = match[3]) && assertUsableClassName && context.getElementsByClassName ) {
				push.apply( results, slice.call(context.getElementsByClassName( m ), 0) );
				return results;
			}
		}
	}

	// All others
	return select( selector.replace( rtrim, "$1" ), context, results, seed, xml );
}

Sizzle.matches = function( expr, elements ) {
	return Sizzle( expr, null, null, elements );
};

Sizzle.matchesSelector = function( elem, expr ) {
	return Sizzle( expr, null, null, [ elem ] ).length > 0;
};

// Returns a function to use in pseudos for input types
function createInputPseudo( type ) {
	return function( elem ) {
		var name = elem.nodeName.toLowerCase();
		return name === "input" && elem.type === type;
	};
}

// Returns a function to use in pseudos for buttons
function createButtonPseudo( type ) {
	return function( elem ) {
		var name = elem.nodeName.toLowerCase();
		return (name === "input" || name === "button") && elem.type === type;
	};
}

// Returns a function to use in pseudos for positionals
function createPositionalPseudo( fn ) {
	return markFunction(function( argument ) {
		argument = +argument;
		return markFunction(function( seed, matches ) {
			var j,
				matchIndexes = fn( [], seed.length, argument ),
				i = matchIndexes.length;

			// Match elements found at the specified indexes
			while ( i-- ) {
				if ( seed[ (j = matchIndexes[i]) ] ) {
					seed[j] = !(matches[j] = seed[j]);
				}
			}
		});
	});
}

/**
 * Utility function for retrieving the text value of an array of DOM nodes
 * @param {Array|Element} elem
 */
getText = Sizzle.getText = function( elem ) {
	var node,
		ret = "",
		i = 0,
		nodeType = elem.nodeType;

	if ( nodeType ) {
		if ( nodeType === 1 || nodeType === 9 || nodeType === 11 ) {
			// Use textContent for elements
			// innerText usage removed for consistency of new lines (see #11153)
			if ( typeof elem.textContent === "string" ) {
				return elem.textContent;
			} else {
				// Traverse its children
				for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
					ret += getText( elem );
				}
			}
		} else if ( nodeType === 3 || nodeType === 4 ) {
			return elem.nodeValue;
		}
		// Do not include comment or processing instruction nodes
	} else {

		// If no nodeType, this is expected to be an array
		for ( ; (node = elem[i]); i++ ) {
			// Do not traverse comment nodes
			ret += getText( node );
		}
	}
	return ret;
};

isXML = Sizzle.isXML = function( elem ) {
	// documentElement is verified for cases where it doesn't yet exist
	// (such as loading iframes in IE - #4833)
	var documentElement = elem && (elem.ownerDocument || elem).documentElement;
	return documentElement ? documentElement.nodeName !== "HTML" : false;
};

// Element contains another
contains = Sizzle.contains = docElem.contains ?
	function( a, b ) {
		var adown = a.nodeType === 9 ? a.documentElement : a,
			bup = b && b.parentNode;
		return a === bup || !!( bup && bup.nodeType === 1 && adown.contains && adown.contains(bup) );
	} :
	docElem.compareDocumentPosition ?
	function( a, b ) {
		return b && !!( a.compareDocumentPosition( b ) & 16 );
	} :
	function( a, b ) {
		while ( (b = b.parentNode) ) {
			if ( b === a ) {
				return true;
			}
		}
		return false;
	};

Sizzle.attr = function( elem, name ) {
	var val,
		xml = isXML( elem );

	if ( !xml ) {
		name = name.toLowerCase();
	}
	if ( (val = Expr.attrHandle[ name ]) ) {
		return val( elem );
	}
	if ( xml || assertAttributes ) {
		return elem.getAttribute( name );
	}
	val = elem.getAttributeNode( name );
	return val ?
		typeof elem[ name ] === "boolean" ?
			elem[ name ] ? name : null :
			val.specified ? val.value : null :
		null;
};

Expr = Sizzle.selectors = {

	// Can be adjusted by the user
	cacheLength: 50,

	createPseudo: markFunction,

	match: matchExpr,

	// IE6/7 return a modified href
	attrHandle: assertHrefNotNormalized ?
		{} :
		{
			"href": function( elem ) {
				return elem.getAttribute( "href", 2 );
			},
			"type": function( elem ) {
				return elem.getAttribute("type");
			}
		},

	find: {
		"ID": assertGetIdNotName ?
			function( id, context, xml ) {
				if ( typeof context.getElementById !== strundefined && !xml ) {
					var m = context.getElementById( id );
					// Check parentNode to catch when Blackberry 4.6 returns
					// nodes that are no longer in the document #6963
					return m && m.parentNode ? [m] : [];
				}
			} :
			function( id, context, xml ) {
				if ( typeof context.getElementById !== strundefined && !xml ) {
					var m = context.getElementById( id );

					return m ?
						m.id === id || typeof m.getAttributeNode !== strundefined && m.getAttributeNode("id").value === id ?
							[m] :
							undefined :
						[];
				}
			},

		"TAG": assertTagNameNoComments ?
			function( tag, context ) {
				if ( typeof context.getElementsByTagName !== strundefined ) {
					return context.getElementsByTagName( tag );
				}
			} :
			function( tag, context ) {
				var results = context.getElementsByTagName( tag );

				// Filter out possible comments
				if ( tag === "*" ) {
					var elem,
						tmp = [],
						i = 0;

					for ( ; (elem = results[i]); i++ ) {
						if ( elem.nodeType === 1 ) {
							tmp.push( elem );
						}
					}

					return tmp;
				}
				return results;
			},

		"NAME": assertUsableName && function( tag, context ) {
			if ( typeof context.getElementsByName !== strundefined ) {
				return context.getElementsByName( name );
			}
		},

		"CLASS": assertUsableClassName && function( className, context, xml ) {
			if ( typeof context.getElementsByClassName !== strundefined && !xml ) {
				return context.getElementsByClassName( className );
			}
		}
	},

	relative: {
		">": { dir: "parentNode", first: true },
		" ": { dir: "parentNode" },
		"+": { dir: "previousSibling", first: true },
		"~": { dir: "previousSibling" }
	},

	preFilter: {
		"ATTR": function( match ) {
			match[1] = match[1].replace( rbackslash, "" );

			// Move the given value to match[3] whether quoted or unquoted
			match[3] = ( match[4] || match[5] || "" ).replace( rbackslash, "" );

			if ( match[2] === "~=" ) {
				match[3] = " " + match[3] + " ";
			}

			return match.slice( 0, 4 );
		},

		"CHILD": function( match ) {
			/* matches from matchExpr["CHILD"]
				1 type (only|nth|...)
				2 argument (even|odd|\d*|\d*n([+-]\d+)?|...)
				3 xn-component of xn+y argument ([+-]?\d*n|)
				4 sign of xn-component
				5 x of xn-component
				6 sign of y-component
				7 y of y-component
			*/
			match[1] = match[1].toLowerCase();

			if ( match[1] === "nth" ) {
				// nth-child requires argument
				if ( !match[2] ) {
					Sizzle.error( match[0] );
				}

				// numeric x and y parameters for Expr.filter.CHILD
				// remember that false/true cast respectively to 0/1
				match[3] = +( match[3] ? match[4] + (match[5] || 1) : 2 * ( match[2] === "even" || match[2] === "odd" ) );
				match[4] = +( ( match[6] + match[7] ) || match[2] === "odd" );

			// other types prohibit arguments
			} else if ( match[2] ) {
				Sizzle.error( match[0] );
			}

			return match;
		},

		"PSEUDO": function( match ) {
			var unquoted, excess;
			if ( matchExpr["CHILD"].test( match[0] ) ) {
				return null;
			}

			if ( match[3] ) {
				match[2] = match[3];
			} else if ( (unquoted = match[4]) ) {
				// Only check arguments that contain a pseudo
				if ( rpseudo.test(unquoted) &&
					// Get excess from tokenize (recursively)
					(excess = tokenize( unquoted, true )) &&
					// advance to the next closing parenthesis
					(excess = unquoted.indexOf( ")", unquoted.length - excess ) - unquoted.length) ) {

					// excess is a negative index
					unquoted = unquoted.slice( 0, excess );
					match[0] = match[0].slice( 0, excess );
				}
				match[2] = unquoted;
			}

			// Return only captures needed by the pseudo filter method (type and argument)
			return match.slice( 0, 3 );
		}
	},

	filter: {
		"ID": assertGetIdNotName ?
			function( id ) {
				id = id.replace( rbackslash, "" );
				return function( elem ) {
					return elem.getAttribute("id") === id;
				};
			} :
			function( id ) {
				id = id.replace( rbackslash, "" );
				return function( elem ) {
					var node = typeof elem.getAttributeNode !== strundefined && elem.getAttributeNode("id");
					return node && node.value === id;
				};
			},

		"TAG": function( nodeName ) {
			if ( nodeName === "*" ) {
				return function() { return true; };
			}
			nodeName = nodeName.replace( rbackslash, "" ).toLowerCase();

			return function( elem ) {
				return elem.nodeName && elem.nodeName.toLowerCase() === nodeName;
			};
		},

		"CLASS": function( className ) {
			var pattern = classCache[ expando ][ className + " " ];

			return pattern ||
				(pattern = new RegExp( "(^|" + whitespace + ")" + className + "(" + whitespace + "|$)" )) &&
				classCache( className, function( elem ) {
					return pattern.test( elem.className || (typeof elem.getAttribute !== strundefined && elem.getAttribute("class")) || "" );
				});
		},

		"ATTR": function( name, operator, check ) {
			return function( elem, context ) {
				var result = Sizzle.attr( elem, name );

				if ( result == null ) {
					return operator === "!=";
				}
				if ( !operator ) {
					return true;
				}

				result += "";

				return operator === "=" ? result === check :
					operator === "!=" ? result !== check :
					operator === "^=" ? check && result.indexOf( check ) === 0 :
					operator === "*=" ? check && result.indexOf( check ) > -1 :
					operator === "$=" ? check && result.substr( result.length - check.length ) === check :
					operator === "~=" ? ( " " + result + " " ).indexOf( check ) > -1 :
					operator === "|=" ? result === check || result.substr( 0, check.length + 1 ) === check + "-" :
					false;
			};
		},

		"CHILD": function( type, argument, first, last ) {

			if ( type === "nth" ) {
				return function( elem ) {
					var node, diff,
						parent = elem.parentNode;

					if ( first === 1 && last === 0 ) {
						return true;
					}

					if ( parent ) {
						diff = 0;
						for ( node = parent.firstChild; node; node = node.nextSibling ) {
							if ( node.nodeType === 1 ) {
								diff++;
								if ( elem === node ) {
									break;
								}
							}
						}
					}

					// Incorporate the offset (or cast to NaN), then check against cycle size
					diff -= last;
					return diff === first || ( diff % first === 0 && diff / first >= 0 );
				};
			}

			return function( elem ) {
				var node = elem;

				switch ( type ) {
					case "only":
					case "first":
						while ( (node = node.previousSibling) ) {
							if ( node.nodeType === 1 ) {
								return false;
							}
						}

						if ( type === "first" ) {
							return true;
						}

						node = elem;

						/* falls through */
					case "last":
						while ( (node = node.nextSibling) ) {
							if ( node.nodeType === 1 ) {
								return false;
							}
						}

						return true;
				}
			};
		},

		"PSEUDO": function( pseudo, argument ) {
			// pseudo-class names are case-insensitive
			// http://www.w3.org/TR/selectors/#pseudo-classes
			// Prioritize by case sensitivity in case custom pseudos are added with uppercase letters
			// Remember that setFilters inherits from pseudos
			var args,
				fn = Expr.pseudos[ pseudo ] || Expr.setFilters[ pseudo.toLowerCase() ] ||
					Sizzle.error( "unsupported pseudo: " + pseudo );

			// The user may use createPseudo to indicate that
			// arguments are needed to create the filter function
			// just as Sizzle does
			if ( fn[ expando ] ) {
				return fn( argument );
			}

			// But maintain support for old signatures
			if ( fn.length > 1 ) {
				args = [ pseudo, pseudo, "", argument ];
				return Expr.setFilters.hasOwnProperty( pseudo.toLowerCase() ) ?
					markFunction(function( seed, matches ) {
						var idx,
							matched = fn( seed, argument ),
							i = matched.length;
						while ( i-- ) {
							idx = indexOf.call( seed, matched[i] );
							seed[ idx ] = !( matches[ idx ] = matched[i] );
						}
					}) :
					function( elem ) {
						return fn( elem, 0, args );
					};
			}

			return fn;
		}
	},

	pseudos: {
		"not": markFunction(function( selector ) {
			// Trim the selector passed to compile
			// to avoid treating leading and trailing
			// spaces as combinators
			var input = [],
				results = [],
				matcher = compile( selector.replace( rtrim, "$1" ) );

			return matcher[ expando ] ?
				markFunction(function( seed, matches, context, xml ) {
					var elem,
						unmatched = matcher( seed, null, xml, [] ),
						i = seed.length;

					// Match elements unmatched by `matcher`
					while ( i-- ) {
						if ( (elem = unmatched[i]) ) {
							seed[i] = !(matches[i] = elem);
						}
					}
				}) :
				function( elem, context, xml ) {
					input[0] = elem;
					matcher( input, null, xml, results );
					return !results.pop();
				};
		}),

		"has": markFunction(function( selector ) {
			return function( elem ) {
				return Sizzle( selector, elem ).length > 0;
			};
		}),

		"contains": markFunction(function( text ) {
			return function( elem ) {
				return ( elem.textContent || elem.innerText || getText( elem ) ).indexOf( text ) > -1;
			};
		}),

		"enabled": function( elem ) {
			return elem.disabled === false;
		},

		"disabled": function( elem ) {
			return elem.disabled === true;
		},

		"checked": function( elem ) {
			// In CSS3, :checked should return both checked and selected elements
			// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
			var nodeName = elem.nodeName.toLowerCase();
			return (nodeName === "input" && !!elem.checked) || (nodeName === "option" && !!elem.selected);
		},

		"selected": function( elem ) {
			// Accessing this property makes selected-by-default
			// options in Safari work properly
			if ( elem.parentNode ) {
				elem.parentNode.selectedIndex;
			}

			return elem.selected === true;
		},

		"parent": function( elem ) {
			return !Expr.pseudos["empty"]( elem );
		},

		"empty": function( elem ) {
			// http://www.w3.org/TR/selectors/#empty-pseudo
			// :empty is only affected by element nodes and content nodes(including text(3), cdata(4)),
			//   not comment, processing instructions, or others
			// Thanks to Diego Perini for the nodeName shortcut
			//   Greater than "@" means alpha characters (specifically not starting with "#" or "?")
			var nodeType;
			elem = elem.firstChild;
			while ( elem ) {
				if ( elem.nodeName > "@" || (nodeType = elem.nodeType) === 3 || nodeType === 4 ) {
					return false;
				}
				elem = elem.nextSibling;
			}
			return true;
		},

		"header": function( elem ) {
			return rheader.test( elem.nodeName );
		},

		"text": function( elem ) {
			var type, attr;
			// IE6 and 7 will map elem.type to 'text' for new HTML5 types (search, etc)
			// use getAttribute instead to test this case
			return elem.nodeName.toLowerCase() === "input" &&
				(type = elem.type) === "text" &&
				( (attr = elem.getAttribute("type")) == null || attr.toLowerCase() === type );
		},

		// Input types
		"radio": createInputPseudo("radio"),
		"checkbox": createInputPseudo("checkbox"),
		"file": createInputPseudo("file"),
		"password": createInputPseudo("password"),
		"image": createInputPseudo("image"),

		"submit": createButtonPseudo("submit"),
		"reset": createButtonPseudo("reset"),

		"button": function( elem ) {
			var name = elem.nodeName.toLowerCase();
			return name === "input" && elem.type === "button" || name === "button";
		},

		"input": function( elem ) {
			return rinputs.test( elem.nodeName );
		},

		"focus": function( elem ) {
			var doc = elem.ownerDocument;
			return elem === doc.activeElement && (!doc.hasFocus || doc.hasFocus()) && !!(elem.type || elem.href || ~elem.tabIndex);
		},

		"active": function( elem ) {
			return elem === elem.ownerDocument.activeElement;
		},

		// Positional types
		"first": createPositionalPseudo(function() {
			return [ 0 ];
		}),

		"last": createPositionalPseudo(function( matchIndexes, length ) {
			return [ length - 1 ];
		}),

		"eq": createPositionalPseudo(function( matchIndexes, length, argument ) {
			return [ argument < 0 ? argument + length : argument ];
		}),

		"even": createPositionalPseudo(function( matchIndexes, length ) {
			for ( var i = 0; i < length; i += 2 ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		}),

		"odd": createPositionalPseudo(function( matchIndexes, length ) {
			for ( var i = 1; i < length; i += 2 ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		}),

		"lt": createPositionalPseudo(function( matchIndexes, length, argument ) {
			for ( var i = argument < 0 ? argument + length : argument; --i >= 0; ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		}),

		"gt": createPositionalPseudo(function( matchIndexes, length, argument ) {
			for ( var i = argument < 0 ? argument + length : argument; ++i < length; ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		})
	}
};

function siblingCheck( a, b, ret ) {
	if ( a === b ) {
		return ret;
	}

	var cur = a.nextSibling;

	while ( cur ) {
		if ( cur === b ) {
			return -1;
		}

		cur = cur.nextSibling;
	}

	return 1;
}

sortOrder = docElem.compareDocumentPosition ?
	function( a, b ) {
		if ( a === b ) {
			hasDuplicate = true;
			return 0;
		}

		return ( !a.compareDocumentPosition || !b.compareDocumentPosition ?
			a.compareDocumentPosition :
			a.compareDocumentPosition(b) & 4
		) ? -1 : 1;
	} :
	function( a, b ) {
		// The nodes are identical, we can exit early
		if ( a === b ) {
			hasDuplicate = true;
			return 0;

		// Fallback to using sourceIndex (in IE) if it's available on both nodes
		} else if ( a.sourceIndex && b.sourceIndex ) {
			return a.sourceIndex - b.sourceIndex;
		}

		var al, bl,
			ap = [],
			bp = [],
			aup = a.parentNode,
			bup = b.parentNode,
			cur = aup;

		// If the nodes are siblings (or identical) we can do a quick check
		if ( aup === bup ) {
			return siblingCheck( a, b );

		// If no parents were found then the nodes are disconnected
		} else if ( !aup ) {
			return -1;

		} else if ( !bup ) {
			return 1;
		}

		// Otherwise they're somewhere else in the tree so we need
		// to build up a full list of the parentNodes for comparison
		while ( cur ) {
			ap.unshift( cur );
			cur = cur.parentNode;
		}

		cur = bup;

		while ( cur ) {
			bp.unshift( cur );
			cur = cur.parentNode;
		}

		al = ap.length;
		bl = bp.length;

		// Start walking down the tree looking for a discrepancy
		for ( var i = 0; i < al && i < bl; i++ ) {
			if ( ap[i] !== bp[i] ) {
				return siblingCheck( ap[i], bp[i] );
			}
		}

		// We ended someplace up the tree so do a sibling check
		return i === al ?
			siblingCheck( a, bp[i], -1 ) :
			siblingCheck( ap[i], b, 1 );
	};

// Always assume the presence of duplicates if sort doesn't
// pass them to our comparison function (as in Google Chrome).
[0, 0].sort( sortOrder );
baseHasDuplicate = !hasDuplicate;

// Document sorting and removing duplicates
Sizzle.uniqueSort = function( results ) {
	var elem,
		duplicates = [],
		i = 1,
		j = 0;

	hasDuplicate = baseHasDuplicate;
	results.sort( sortOrder );

	if ( hasDuplicate ) {
		for ( ; (elem = results[i]); i++ ) {
			if ( elem === results[ i - 1 ] ) {
				j = duplicates.push( i );
			}
		}
		while ( j-- ) {
			results.splice( duplicates[ j ], 1 );
		}
	}

	return results;
};

Sizzle.error = function( msg ) {
	throw new Error( "Syntax error, unrecognized expression: " + msg );
};

function tokenize( selector, parseOnly ) {
	var matched, match, tokens, type,
		soFar, groups, preFilters,
		cached = tokenCache[ expando ][ selector + " " ];

	if ( cached ) {
		return parseOnly ? 0 : cached.slice( 0 );
	}

	soFar = selector;
	groups = [];
	preFilters = Expr.preFilter;

	while ( soFar ) {

		// Comma and first run
		if ( !matched || (match = rcomma.exec( soFar )) ) {
			if ( match ) {
				// Don't consume trailing commas as valid
				soFar = soFar.slice( match[0].length ) || soFar;
			}
			groups.push( tokens = [] );
		}

		matched = false;

		// Combinators
		if ( (match = rcombinators.exec( soFar )) ) {
			tokens.push( matched = new Token( match.shift() ) );
			soFar = soFar.slice( matched.length );

			// Cast descendant combinators to space
			matched.type = match[0].replace( rtrim, " " );
		}

		// Filters
		for ( type in Expr.filter ) {
			if ( (match = matchExpr[ type ].exec( soFar )) && (!preFilters[ type ] ||
				(match = preFilters[ type ]( match ))) ) {

				tokens.push( matched = new Token( match.shift() ) );
				soFar = soFar.slice( matched.length );
				matched.type = type;
				matched.matches = match;
			}
		}

		if ( !matched ) {
			break;
		}
	}

	// Return the length of the invalid excess
	// if we're just parsing
	// Otherwise, throw an error or return tokens
	return parseOnly ?
		soFar.length :
		soFar ?
			Sizzle.error( selector ) :
			// Cache the tokens
			tokenCache( selector, groups ).slice( 0 );
}

function addCombinator( matcher, combinator, base ) {
	var dir = combinator.dir,
		checkNonElements = base && combinator.dir === "parentNode",
		doneName = done++;

	return combinator.first ?
		// Check against closest ancestor/preceding element
		function( elem, context, xml ) {
			while ( (elem = elem[ dir ]) ) {
				if ( checkNonElements || elem.nodeType === 1  ) {
					return matcher( elem, context, xml );
				}
			}
		} :

		// Check against all ancestor/preceding elements
		function( elem, context, xml ) {
			// We can't set arbitrary data on XML nodes, so they don't benefit from dir caching
			if ( !xml ) {
				var cache,
					dirkey = dirruns + " " + doneName + " ",
					cachedkey = dirkey + cachedruns;
				while ( (elem = elem[ dir ]) ) {
					if ( checkNonElements || elem.nodeType === 1 ) {
						if ( (cache = elem[ expando ]) === cachedkey ) {
							return elem.sizset;
						} else if ( typeof cache === "string" && cache.indexOf(dirkey) === 0 ) {
							if ( elem.sizset ) {
								return elem;
							}
						} else {
							elem[ expando ] = cachedkey;
							if ( matcher( elem, context, xml ) ) {
								elem.sizset = true;
								return elem;
							}
							elem.sizset = false;
						}
					}
				}
			} else {
				while ( (elem = elem[ dir ]) ) {
					if ( checkNonElements || elem.nodeType === 1 ) {
						if ( matcher( elem, context, xml ) ) {
							return elem;
						}
					}
				}
			}
		};
}

function elementMatcher( matchers ) {
	return matchers.length > 1 ?
		function( elem, context, xml ) {
			var i = matchers.length;
			while ( i-- ) {
				if ( !matchers[i]( elem, context, xml ) ) {
					return false;
				}
			}
			return true;
		} :
		matchers[0];
}

function condense( unmatched, map, filter, context, xml ) {
	var elem,
		newUnmatched = [],
		i = 0,
		len = unmatched.length,
		mapped = map != null;

	for ( ; i < len; i++ ) {
		if ( (elem = unmatched[i]) ) {
			if ( !filter || filter( elem, context, xml ) ) {
				newUnmatched.push( elem );
				if ( mapped ) {
					map.push( i );
				}
			}
		}
	}

	return newUnmatched;
}

function setMatcher( preFilter, selector, matcher, postFilter, postFinder, postSelector ) {
	if ( postFilter && !postFilter[ expando ] ) {
		postFilter = setMatcher( postFilter );
	}
	if ( postFinder && !postFinder[ expando ] ) {
		postFinder = setMatcher( postFinder, postSelector );
	}
	return markFunction(function( seed, results, context, xml ) {
		var temp, i, elem,
			preMap = [],
			postMap = [],
			preexisting = results.length,

			// Get initial elements from seed or context
			elems = seed || multipleContexts( selector || "*", context.nodeType ? [ context ] : context, [] ),

			// Prefilter to get matcher input, preserving a map for seed-results synchronization
			matcherIn = preFilter && ( seed || !selector ) ?
				condense( elems, preMap, preFilter, context, xml ) :
				elems,

			matcherOut = matcher ?
				// If we have a postFinder, or filtered seed, or non-seed postFilter or preexisting results,
				postFinder || ( seed ? preFilter : preexisting || postFilter ) ?

					// ...intermediate processing is necessary
					[] :

					// ...otherwise use results directly
					results :
				matcherIn;

		// Find primary matches
		if ( matcher ) {
			matcher( matcherIn, matcherOut, context, xml );
		}

		// Apply postFilter
		if ( postFilter ) {
			temp = condense( matcherOut, postMap );
			postFilter( temp, [], context, xml );

			// Un-match failing elements by moving them back to matcherIn
			i = temp.length;
			while ( i-- ) {
				if ( (elem = temp[i]) ) {
					matcherOut[ postMap[i] ] = !(matcherIn[ postMap[i] ] = elem);
				}
			}
		}

		if ( seed ) {
			if ( postFinder || preFilter ) {
				if ( postFinder ) {
					// Get the final matcherOut by condensing this intermediate into postFinder contexts
					temp = [];
					i = matcherOut.length;
					while ( i-- ) {
						if ( (elem = matcherOut[i]) ) {
							// Restore matcherIn since elem is not yet a final match
							temp.push( (matcherIn[i] = elem) );
						}
					}
					postFinder( null, (matcherOut = []), temp, xml );
				}

				// Move matched elements from seed to results to keep them synchronized
				i = matcherOut.length;
				while ( i-- ) {
					if ( (elem = matcherOut[i]) &&
						(temp = postFinder ? indexOf.call( seed, elem ) : preMap[i]) > -1 ) {

						seed[temp] = !(results[temp] = elem);
					}
				}
			}

		// Add elements to results, through postFinder if defined
		} else {
			matcherOut = condense(
				matcherOut === results ?
					matcherOut.splice( preexisting, matcherOut.length ) :
					matcherOut
			);
			if ( postFinder ) {
				postFinder( null, results, matcherOut, xml );
			} else {
				push.apply( results, matcherOut );
			}
		}
	});
}

function matcherFromTokens( tokens ) {
	var checkContext, matcher, j,
		len = tokens.length,
		leadingRelative = Expr.relative[ tokens[0].type ],
		implicitRelative = leadingRelative || Expr.relative[" "],
		i = leadingRelative ? 1 : 0,

		// The foundational matcher ensures that elements are reachable from top-level context(s)
		matchContext = addCombinator( function( elem ) {
			return elem === checkContext;
		}, implicitRelative, true ),
		matchAnyContext = addCombinator( function( elem ) {
			return indexOf.call( checkContext, elem ) > -1;
		}, implicitRelative, true ),
		matchers = [ function( elem, context, xml ) {
			return ( !leadingRelative && ( xml || context !== outermostContext ) ) || (
				(checkContext = context).nodeType ?
					matchContext( elem, context, xml ) :
					matchAnyContext( elem, context, xml ) );
		} ];

	for ( ; i < len; i++ ) {
		if ( (matcher = Expr.relative[ tokens[i].type ]) ) {
			matchers = [ addCombinator( elementMatcher( matchers ), matcher ) ];
		} else {
			matcher = Expr.filter[ tokens[i].type ].apply( null, tokens[i].matches );

			// Return special upon seeing a positional matcher
			if ( matcher[ expando ] ) {
				// Find the next relative operator (if any) for proper handling
				j = ++i;
				for ( ; j < len; j++ ) {
					if ( Expr.relative[ tokens[j].type ] ) {
						break;
					}
				}
				return setMatcher(
					i > 1 && elementMatcher( matchers ),
					i > 1 && tokens.slice( 0, i - 1 ).join("").replace( rtrim, "$1" ),
					matcher,
					i < j && matcherFromTokens( tokens.slice( i, j ) ),
					j < len && matcherFromTokens( (tokens = tokens.slice( j )) ),
					j < len && tokens.join("")
				);
			}
			matchers.push( matcher );
		}
	}

	return elementMatcher( matchers );
}

function matcherFromGroupMatchers( elementMatchers, setMatchers ) {
	var bySet = setMatchers.length > 0,
		byElement = elementMatchers.length > 0,
		superMatcher = function( seed, context, xml, results, expandContext ) {
			var elem, j, matcher,
				setMatched = [],
				matchedCount = 0,
				i = "0",
				unmatched = seed && [],
				outermost = expandContext != null,
				contextBackup = outermostContext,
				// We must always have either seed elements or context
				elems = seed || byElement && Expr.find["TAG"]( "*", expandContext && context.parentNode || context ),
				// Nested matchers should use non-integer dirruns
				dirrunsUnique = (dirruns += contextBackup == null ? 1 : Math.E);

			if ( outermost ) {
				outermostContext = context !== document && context;
				cachedruns = superMatcher.el;
			}

			// Add elements passing elementMatchers directly to results
			for ( ; (elem = elems[i]) != null; i++ ) {
				if ( byElement && elem ) {
					for ( j = 0; (matcher = elementMatchers[j]); j++ ) {
						if ( matcher( elem, context, xml ) ) {
							results.push( elem );
							break;
						}
					}
					if ( outermost ) {
						dirruns = dirrunsUnique;
						cachedruns = ++superMatcher.el;
					}
				}

				// Track unmatched elements for set filters
				if ( bySet ) {
					// They will have gone through all possible matchers
					if ( (elem = !matcher && elem) ) {
						matchedCount--;
					}

					// Lengthen the array for every element, matched or not
					if ( seed ) {
						unmatched.push( elem );
					}
				}
			}

			// Apply set filters to unmatched elements
			matchedCount += i;
			if ( bySet && i !== matchedCount ) {
				for ( j = 0; (matcher = setMatchers[j]); j++ ) {
					matcher( unmatched, setMatched, context, xml );
				}

				if ( seed ) {
					// Reintegrate element matches to eliminate the need for sorting
					if ( matchedCount > 0 ) {
						while ( i-- ) {
							if ( !(unmatched[i] || setMatched[i]) ) {
								setMatched[i] = pop.call( results );
							}
						}
					}

					// Discard index placeholder values to get only actual matches
					setMatched = condense( setMatched );
				}

				// Add matches to results
				push.apply( results, setMatched );

				// Seedless set matches succeeding multiple successful matchers stipulate sorting
				if ( outermost && !seed && setMatched.length > 0 &&
					( matchedCount + setMatchers.length ) > 1 ) {

					Sizzle.uniqueSort( results );
				}
			}

			// Override manipulation of globals by nested matchers
			if ( outermost ) {
				dirruns = dirrunsUnique;
				outermostContext = contextBackup;
			}

			return unmatched;
		};

	superMatcher.el = 0;
	return bySet ?
		markFunction( superMatcher ) :
		superMatcher;
}

compile = Sizzle.compile = function( selector, group /* Internal Use Only */ ) {
	var i,
		setMatchers = [],
		elementMatchers = [],
		cached = compilerCache[ expando ][ selector + " " ];

	if ( !cached ) {
		// Generate a function of recursive functions that can be used to check each element
		if ( !group ) {
			group = tokenize( selector );
		}
		i = group.length;
		while ( i-- ) {
			cached = matcherFromTokens( group[i] );
			if ( cached[ expando ] ) {
				setMatchers.push( cached );
			} else {
				elementMatchers.push( cached );
			}
		}

		// Cache the compiled function
		cached = compilerCache( selector, matcherFromGroupMatchers( elementMatchers, setMatchers ) );
	}
	return cached;
};

function multipleContexts( selector, contexts, results ) {
	var i = 0,
		len = contexts.length;
	for ( ; i < len; i++ ) {
		Sizzle( selector, contexts[i], results );
	}
	return results;
}

function select( selector, context, results, seed, xml ) {
	var i, tokens, token, type, find,
		match = tokenize( selector ),
		j = match.length;

	if ( !seed ) {
		// Try to minimize operations if there is only one group
		if ( match.length === 1 ) {

			// Take a shortcut and set the context if the root selector is an ID
			tokens = match[0] = match[0].slice( 0 );
			if ( tokens.length > 2 && (token = tokens[0]).type === "ID" &&
					context.nodeType === 9 && !xml &&
					Expr.relative[ tokens[1].type ] ) {

				context = Expr.find["ID"]( token.matches[0].replace( rbackslash, "" ), context, xml )[0];
				if ( !context ) {
					return results;
				}

				selector = selector.slice( tokens.shift().length );
			}

			// Fetch a seed set for right-to-left matching
			for ( i = matchExpr["POS"].test( selector ) ? -1 : tokens.length - 1; i >= 0; i-- ) {
				token = tokens[i];

				// Abort if we hit a combinator
				if ( Expr.relative[ (type = token.type) ] ) {
					break;
				}
				if ( (find = Expr.find[ type ]) ) {
					// Search, expanding context for leading sibling combinators
					if ( (seed = find(
						token.matches[0].replace( rbackslash, "" ),
						rsibling.test( tokens[0].type ) && context.parentNode || context,
						xml
					)) ) {

						// If seed is empty or no tokens remain, we can return early
						tokens.splice( i, 1 );
						selector = seed.length && tokens.join("");
						if ( !selector ) {
							push.apply( results, slice.call( seed, 0 ) );
							return results;
						}

						break;
					}
				}
			}
		}
	}

	// Compile and execute a filtering function
	// Provide `match` to avoid retokenization if we modified the selector above
	compile( selector, match )(
		seed,
		context,
		xml,
		results,
		rsibling.test( selector )
	);
	return results;
}

if ( document.querySelectorAll ) {
	(function() {
		var disconnectedMatch,
			oldSelect = select,
			rescape = /'|\\/g,
			rattributeQuotes = /\=[\x20\t\r\n\f]*([^'"\]]*)[\x20\t\r\n\f]*\]/g,

			// qSa(:focus) reports false when true (Chrome 21), no need to also add to buggyMatches since matches checks buggyQSA
			// A support test would require too much code (would include document ready)
			rbuggyQSA = [ ":focus" ],

			// matchesSelector(:active) reports false when true (IE9/Opera 11.5)
			// A support test would require too much code (would include document ready)
			// just skip matchesSelector for :active
			rbuggyMatches = [ ":active" ],
			matches = docElem.matchesSelector ||
				docElem.mozMatchesSelector ||
				docElem.webkitMatchesSelector ||
				docElem.oMatchesSelector ||
				docElem.msMatchesSelector;

		// Build QSA regex
		// Regex strategy adopted from Diego Perini
		assert(function( div ) {
			// Select is set to empty string on purpose
			// This is to test IE's treatment of not explictly
			// setting a boolean content attribute,
			// since its presence should be enough
			// http://bugs.jquery.com/ticket/12359
			div.innerHTML = "<select><option selected=''></option></select>";

			// IE8 - Some boolean attributes are not treated correctly
			if ( !div.querySelectorAll("[selected]").length ) {
				rbuggyQSA.push( "\\[" + whitespace + "*(?:checked|disabled|ismap|multiple|readonly|selected|value)" );
			}

			// Webkit/Opera - :checked should return selected option elements
			// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
			// IE8 throws error here (do not put tests after this one)
			if ( !div.querySelectorAll(":checked").length ) {
				rbuggyQSA.push(":checked");
			}
		});

		assert(function( div ) {

			// Opera 10-12/IE9 - ^= $= *= and empty values
			// Should not select anything
			div.innerHTML = "<p test=''></p>";
			if ( div.querySelectorAll("[test^='']").length ) {
				rbuggyQSA.push( "[*^$]=" + whitespace + "*(?:\"\"|'')" );
			}

			// FF 3.5 - :enabled/:disabled and hidden elements (hidden elements are still enabled)
			// IE8 throws error here (do not put tests after this one)
			div.innerHTML = "<input type='hidden'/>";
			if ( !div.querySelectorAll(":enabled").length ) {
				rbuggyQSA.push(":enabled", ":disabled");
			}
		});

		// rbuggyQSA always contains :focus, so no need for a length check
		rbuggyQSA = /* rbuggyQSA.length && */ new RegExp( rbuggyQSA.join("|") );

		select = function( selector, context, results, seed, xml ) {
			// Only use querySelectorAll when not filtering,
			// when this is not xml,
			// and when no QSA bugs apply
			if ( !seed && !xml && !rbuggyQSA.test( selector ) ) {
				var groups, i,
					old = true,
					nid = expando,
					newContext = context,
					newSelector = context.nodeType === 9 && selector;

				// qSA works strangely on Element-rooted queries
				// We can work around this by specifying an extra ID on the root
				// and working up from there (Thanks to Andrew Dupont for the technique)
				// IE 8 doesn't work on object elements
				if ( context.nodeType === 1 && context.nodeName.toLowerCase() !== "object" ) {
					groups = tokenize( selector );

					if ( (old = context.getAttribute("id")) ) {
						nid = old.replace( rescape, "\\$&" );
					} else {
						context.setAttribute( "id", nid );
					}
					nid = "[id='" + nid + "'] ";

					i = groups.length;
					while ( i-- ) {
						groups[i] = nid + groups[i].join("");
					}
					newContext = rsibling.test( selector ) && context.parentNode || context;
					newSelector = groups.join(",");
				}

				if ( newSelector ) {
					try {
						push.apply( results, slice.call( newContext.querySelectorAll(
							newSelector
						), 0 ) );
						return results;
					} catch(qsaError) {
					} finally {
						if ( !old ) {
							context.removeAttribute("id");
						}
					}
				}
			}

			return oldSelect( selector, context, results, seed, xml );
		};

		if ( matches ) {
			assert(function( div ) {
				// Check to see if it's possible to do matchesSelector
				// on a disconnected node (IE 9)
				disconnectedMatch = matches.call( div, "div" );

				// This should fail with an exception
				// Gecko does not error, returns false instead
				try {
					matches.call( div, "[test!='']:sizzle" );
					rbuggyMatches.push( "!=", pseudos );
				} catch ( e ) {}
			});

			// rbuggyMatches always contains :active and :focus, so no need for a length check
			rbuggyMatches = /* rbuggyMatches.length && */ new RegExp( rbuggyMatches.join("|") );

			Sizzle.matchesSelector = function( elem, expr ) {
				// Make sure that attribute selectors are quoted
				expr = expr.replace( rattributeQuotes, "='$1']" );

				// rbuggyMatches always contains :active, so no need for an existence check
				if ( !isXML( elem ) && !rbuggyMatches.test( expr ) && !rbuggyQSA.test( expr ) ) {
					try {
						var ret = matches.call( elem, expr );

						// IE 9's matchesSelector returns false on disconnected nodes
						if ( ret || disconnectedMatch ||
								// As well, disconnected nodes are said to be in a document
								// fragment in IE 9
								elem.document && elem.document.nodeType !== 11 ) {
							return ret;
						}
					} catch(e) {}
				}

				return Sizzle( expr, null, null, [ elem ] ).length > 0;
			};
		}
	})();
}

// Deprecated
Expr.pseudos["nth"] = Expr.pseudos["eq"];

// Back-compat
function setFilters() {}
Expr.filters = setFilters.prototype = Expr.pseudos;
Expr.setFilters = new setFilters();

// Override sizzle attribute retrieval
Sizzle.attr = jQuery.attr;
jQuery.find = Sizzle;
jQuery.expr = Sizzle.selectors;
jQuery.expr[":"] = jQuery.expr.pseudos;
jQuery.unique = Sizzle.uniqueSort;
jQuery.text = Sizzle.getText;
jQuery.isXMLDoc = Sizzle.isXML;
jQuery.contains = Sizzle.contains;


})( window );
var runtil = /Until$/,
	rparentsprev = /^(?:parents|prev(?:Until|All))/,
	isSimple = /^.[^:#\[\.,]*$/,
	rneedsContext = jQuery.expr.match.needsContext,
	// methods guaranteed to produce a unique set when starting from a unique set
	guaranteedUnique = {
		children: true,
		contents: true,
		next: true,
		prev: true
	};

jQuery.fn.extend({
	find: function( selector ) {
		var i, l, length, n, r, ret,
			self = this;

		if ( typeof selector !== "string" ) {
			return jQuery( selector ).filter(function() {
				for ( i = 0, l = self.length; i < l; i++ ) {
					if ( jQuery.contains( self[ i ], this ) ) {
						return true;
					}
				}
			});
		}

		ret = this.pushStack( "", "find", selector );

		for ( i = 0, l = this.length; i < l; i++ ) {
			length = ret.length;
			jQuery.find( selector, this[i], ret );

			if ( i > 0 ) {
				// Make sure that the results are unique
				for ( n = length; n < ret.length; n++ ) {
					for ( r = 0; r < length; r++ ) {
						if ( ret[r] === ret[n] ) {
							ret.splice(n--, 1);
							break;
						}
					}
				}
			}
		}

		return ret;
	},

	has: function( target ) {
		var i,
			targets = jQuery( target, this ),
			len = targets.length;

		return this.filter(function() {
			for ( i = 0; i < len; i++ ) {
				if ( jQuery.contains( this, targets[i] ) ) {
					return true;
				}
			}
		});
	},

	not: function( selector ) {
		return this.pushStack( winnow(this, selector, false), "not", selector);
	},

	filter: function( selector ) {
		return this.pushStack( winnow(this, selector, true), "filter", selector );
	},

	is: function( selector ) {
		return !!selector && (
			typeof selector === "string" ?
				// If this is a positional/relative selector, check membership in the returned set
				// so $("p:first").is("p:last") won't return true for a doc with two "p".
				rneedsContext.test( selector ) ?
					jQuery( selector, this.context ).index( this[0] ) >= 0 :
					jQuery.filter( selector, this ).length > 0 :
				this.filter( selector ).length > 0 );
	},

	closest: function( selectors, context ) {
		var cur,
			i = 0,
			l = this.length,
			ret = [],
			pos = rneedsContext.test( selectors ) || typeof selectors !== "string" ?
				jQuery( selectors, context || this.context ) :
				0;

		for ( ; i < l; i++ ) {
			cur = this[i];

			while ( cur && cur.ownerDocument && cur !== context && cur.nodeType !== 11 ) {
				if ( pos ? pos.index(cur) > -1 : jQuery.find.matchesSelector(cur, selectors) ) {
					ret.push( cur );
					break;
				}
				cur = cur.parentNode;
			}
		}

		ret = ret.length > 1 ? jQuery.unique( ret ) : ret;

		return this.pushStack( ret, "closest", selectors );
	},

	// Determine the position of an element within
	// the matched set of elements
	index: function( elem ) {

		// No argument, return index in parent
		if ( !elem ) {
			return ( this[0] && this[0].parentNode ) ? this.prevAll().length : -1;
		}

		// index in selector
		if ( typeof elem === "string" ) {
			return jQuery.inArray( this[0], jQuery( elem ) );
		}

		// Locate the position of the desired element
		return jQuery.inArray(
			// If it receives a jQuery object, the first element is used
			elem.jquery ? elem[0] : elem, this );
	},

	add: function( selector, context ) {
		var set = typeof selector === "string" ?
				jQuery( selector, context ) :
				jQuery.makeArray( selector && selector.nodeType ? [ selector ] : selector ),
			all = jQuery.merge( this.get(), set );

		return this.pushStack( isDisconnected( set[0] ) || isDisconnected( all[0] ) ?
			all :
			jQuery.unique( all ) );
	},

	addBack: function( selector ) {
		return this.add( selector == null ?
			this.prevObject : this.prevObject.filter(selector)
		);
	}
});

jQuery.fn.andSelf = jQuery.fn.addBack;

// A painfully simple check to see if an element is disconnected
// from a document (should be improved, where feasible).
function isDisconnected( node ) {
	return !node || !node.parentNode || node.parentNode.nodeType === 11;
}

function sibling( cur, dir ) {
	do {
		cur = cur[ dir ];
	} while ( cur && cur.nodeType !== 1 );

	return cur;
}

jQuery.each({
	parent: function( elem ) {
		var parent = elem.parentNode;
		return parent && parent.nodeType !== 11 ? parent : null;
	},
	parents: function( elem ) {
		return jQuery.dir( elem, "parentNode" );
	},
	parentsUntil: function( elem, i, until ) {
		return jQuery.dir( elem, "parentNode", until );
	},
	next: function( elem ) {
		return sibling( elem, "nextSibling" );
	},
	prev: function( elem ) {
		return sibling( elem, "previousSibling" );
	},
	nextAll: function( elem ) {
		return jQuery.dir( elem, "nextSibling" );
	},
	prevAll: function( elem ) {
		return jQuery.dir( elem, "previousSibling" );
	},
	nextUntil: function( elem, i, until ) {
		return jQuery.dir( elem, "nextSibling", until );
	},
	prevUntil: function( elem, i, until ) {
		return jQuery.dir( elem, "previousSibling", until );
	},
	siblings: function( elem ) {
		return jQuery.sibling( ( elem.parentNode || {} ).firstChild, elem );
	},
	children: function( elem ) {
		return jQuery.sibling( elem.firstChild );
	},
	contents: function( elem ) {
		return jQuery.nodeName( elem, "iframe" ) ?
			elem.contentDocument || elem.contentWindow.document :
			jQuery.merge( [], elem.childNodes );
	}
}, function( name, fn ) {
	jQuery.fn[ name ] = function( until, selector ) {
		var ret = jQuery.map( this, fn, until );

		if ( !runtil.test( name ) ) {
			selector = until;
		}

		if ( selector && typeof selector === "string" ) {
			ret = jQuery.filter( selector, ret );
		}

		ret = this.length > 1 && !guaranteedUnique[ name ] ? jQuery.unique( ret ) : ret;

		if ( this.length > 1 && rparentsprev.test( name ) ) {
			ret = ret.reverse();
		}

		return this.pushStack( ret, name, core_slice.call( arguments ).join(",") );
	};
});

jQuery.extend({
	filter: function( expr, elems, not ) {
		if ( not ) {
			expr = ":not(" + expr + ")";
		}

		return elems.length === 1 ?
			jQuery.find.matchesSelector(elems[0], expr) ? [ elems[0] ] : [] :
			jQuery.find.matches(expr, elems);
	},

	dir: function( elem, dir, until ) {
		var matched = [],
			cur = elem[ dir ];

		while ( cur && cur.nodeType !== 9 && (until === undefined || cur.nodeType !== 1 || !jQuery( cur ).is( until )) ) {
			if ( cur.nodeType === 1 ) {
				matched.push( cur );
			}
			cur = cur[dir];
		}
		return matched;
	},

	sibling: function( n, elem ) {
		var r = [];

		for ( ; n; n = n.nextSibling ) {
			if ( n.nodeType === 1 && n !== elem ) {
				r.push( n );
			}
		}

		return r;
	}
});

// Implement the identical functionality for filter and not
function winnow( elements, qualifier, keep ) {

	// Can't pass null or undefined to indexOf in Firefox 4
	// Set to 0 to skip string check
	qualifier = qualifier || 0;

	if ( jQuery.isFunction( qualifier ) ) {
		return jQuery.grep(elements, function( elem, i ) {
			var retVal = !!qualifier.call( elem, i, elem );
			return retVal === keep;
		});

	} else if ( qualifier.nodeType ) {
		return jQuery.grep(elements, function( elem, i ) {
			return ( elem === qualifier ) === keep;
		});

	} else if ( typeof qualifier === "string" ) {
		var filtered = jQuery.grep(elements, function( elem ) {
			return elem.nodeType === 1;
		});

		if ( isSimple.test( qualifier ) ) {
			return jQuery.filter(qualifier, filtered, !keep);
		} else {
			qualifier = jQuery.filter( qualifier, filtered );
		}
	}

	return jQuery.grep(elements, function( elem, i ) {
		return ( jQuery.inArray( elem, qualifier ) >= 0 ) === keep;
	});
}
function createSafeFragment( document ) {
	var list = nodeNames.split( "|" ),
	safeFrag = document.createDocumentFragment();

	if ( safeFrag.createElement ) {
		while ( list.length ) {
			safeFrag.createElement(
				list.pop()
			);
		}
	}
	return safeFrag;
}

var nodeNames = "abbr|article|aside|audio|bdi|canvas|data|datalist|details|figcaption|figure|footer|" +
		"header|hgroup|mark|meter|nav|output|progress|section|summary|time|video",
	rinlinejQuery = / jQuery\d+="(?:null|\d+)"/g,
	rleadingWhitespace = /^\s+/,
	rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi,
	rtagName = /<([\w:]+)/,
	rtbody = /<tbody/i,
	rhtml = /<|&#?\w+;/,
	rnoInnerhtml = /<(?:script|style|link)/i,
	rnocache = /<(?:script|object|embed|option|style)/i,
	rnoshimcache = new RegExp("<(?:" + nodeNames + ")[\\s/>]", "i"),
	rcheckableType = /^(?:checkbox|radio)$/,
	// checked="checked" or checked
	rchecked = /checked\s*(?:[^=]|=\s*.checked.)/i,
	rscriptType = /\/(java|ecma)script/i,
	rcleanScript = /^\s*<!(?:\[CDATA\[|\-\-)|[\]\-]{2}>\s*$/g,
	wrapMap = {
		option: [ 1, "<select multiple='multiple'>", "</select>" ],
		legend: [ 1, "<fieldset>", "</fieldset>" ],
		thead: [ 1, "<table>", "</table>" ],
		tr: [ 2, "<table><tbody>", "</tbody></table>" ],
		td: [ 3, "<table><tbody><tr>", "</tr></tbody></table>" ],
		col: [ 2, "<table><tbody></tbody><colgroup>", "</colgroup></table>" ],
		area: [ 1, "<map>", "</map>" ],
		_default: [ 0, "", "" ]
	},
	safeFragment = createSafeFragment( document ),
	fragmentDiv = safeFragment.appendChild( document.createElement("div") );

wrapMap.optgroup = wrapMap.option;
wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
wrapMap.th = wrapMap.td;

// IE6-8 can't serialize link, script, style, or any html5 (NoScope) tags,
// unless wrapped in a div with non-breaking characters in front of it.
if ( !jQuery.support.htmlSerialize ) {
	wrapMap._default = [ 1, "X<div>", "</div>" ];
}

jQuery.fn.extend({
	text: function( value ) {
		return jQuery.access( this, function( value ) {
			return value === undefined ?
				jQuery.text( this ) :
				this.empty().append( ( this[0] && this[0].ownerDocument || document ).createTextNode( value ) );
		}, null, value, arguments.length );
	},

	wrapAll: function( html ) {
		if ( jQuery.isFunction( html ) ) {
			return this.each(function(i) {
				jQuery(this).wrapAll( html.call(this, i) );
			});
		}

		if ( this[0] ) {
			// The elements to wrap the target around
			var wrap = jQuery( html, this[0].ownerDocument ).eq(0).clone(true);

			if ( this[0].parentNode ) {
				wrap.insertBefore( this[0] );
			}

			wrap.map(function() {
				var elem = this;

				while ( elem.firstChild && elem.firstChild.nodeType === 1 ) {
					elem = elem.firstChild;
				}

				return elem;
			}).append( this );
		}

		return this;
	},

	wrapInner: function( html ) {
		if ( jQuery.isFunction( html ) ) {
			return this.each(function(i) {
				jQuery(this).wrapInner( html.call(this, i) );
			});
		}

		return this.each(function() {
			var self = jQuery( this ),
				contents = self.contents();

			if ( contents.length ) {
				contents.wrapAll( html );

			} else {
				self.append( html );
			}
		});
	},

	wrap: function( html ) {
		var isFunction = jQuery.isFunction( html );

		return this.each(function(i) {
			jQuery( this ).wrapAll( isFunction ? html.call(this, i) : html );
		});
	},

	unwrap: function() {
		return this.parent().each(function() {
			if ( !jQuery.nodeName( this, "body" ) ) {
				jQuery( this ).replaceWith( this.childNodes );
			}
		}).end();
	},

	append: function() {
		return this.domManip(arguments, true, function( elem ) {
			if ( this.nodeType === 1 || this.nodeType === 11 ) {
				this.appendChild( elem );
			}
		});
	},

	prepend: function() {
		return this.domManip(arguments, true, function( elem ) {
			if ( this.nodeType === 1 || this.nodeType === 11 ) {
				this.insertBefore( elem, this.firstChild );
			}
		});
	},

	before: function() {
		if ( !isDisconnected( this[0] ) ) {
			return this.domManip(arguments, false, function( elem ) {
				this.parentNode.insertBefore( elem, this );
			});
		}

		if ( arguments.length ) {
			var set = jQuery.clean( arguments );
			return this.pushStack( jQuery.merge( set, this ), "before", this.selector );
		}
	},

	after: function() {
		if ( !isDisconnected( this[0] ) ) {
			return this.domManip(arguments, false, function( elem ) {
				this.parentNode.insertBefore( elem, this.nextSibling );
			});
		}

		if ( arguments.length ) {
			var set = jQuery.clean( arguments );
			return this.pushStack( jQuery.merge( this, set ), "after", this.selector );
		}
	},

	// keepData is for internal use only--do not document
	remove: function( selector, keepData ) {
		var elem,
			i = 0;

		for ( ; (elem = this[i]) != null; i++ ) {
			if ( !selector || jQuery.filter( selector, [ elem ] ).length ) {
				if ( !keepData && elem.nodeType === 1 ) {
					jQuery.cleanData( elem.getElementsByTagName("*") );
					jQuery.cleanData( [ elem ] );
				}

				if ( elem.parentNode ) {
					elem.parentNode.removeChild( elem );
				}
			}
		}

		return this;
	},

	empty: function() {
		var elem,
			i = 0;

		for ( ; (elem = this[i]) != null; i++ ) {
			// Remove element nodes and prevent memory leaks
			if ( elem.nodeType === 1 ) {
				jQuery.cleanData( elem.getElementsByTagName("*") );
			}

			// Remove any remaining nodes
			while ( elem.firstChild ) {
				elem.removeChild( elem.firstChild );
			}
		}

		return this;
	},

	clone: function( dataAndEvents, deepDataAndEvents ) {
		dataAndEvents = dataAndEvents == null ? false : dataAndEvents;
		deepDataAndEvents = deepDataAndEvents == null ? dataAndEvents : deepDataAndEvents;

		return this.map( function () {
			return jQuery.clone( this, dataAndEvents, deepDataAndEvents );
		});
	},

	html: function( value ) {
		return jQuery.access( this, function( value ) {
			var elem = this[0] || {},
				i = 0,
				l = this.length;

			if ( value === undefined ) {
				return elem.nodeType === 1 ?
					elem.innerHTML.replace( rinlinejQuery, "" ) :
					undefined;
			}

			// See if we can take a shortcut and just use innerHTML
			if ( typeof value === "string" && !rnoInnerhtml.test( value ) &&
				( jQuery.support.htmlSerialize || !rnoshimcache.test( value )  ) &&
				( jQuery.support.leadingWhitespace || !rleadingWhitespace.test( value ) ) &&
				!wrapMap[ ( rtagName.exec( value ) || ["", ""] )[1].toLowerCase() ] ) {

				value = value.replace( rxhtmlTag, "<$1></$2>" );

				try {
					for (; i < l; i++ ) {
						// Remove element nodes and prevent memory leaks
						elem = this[i] || {};
						if ( elem.nodeType === 1 ) {
							jQuery.cleanData( elem.getElementsByTagName( "*" ) );
							elem.innerHTML = value;
						}
					}

					elem = 0;

				// If using innerHTML throws an exception, use the fallback method
				} catch(e) {}
			}

			if ( elem ) {
				this.empty().append( value );
			}
		}, null, value, arguments.length );
	},

	replaceWith: function( value ) {
		if ( !isDisconnected( this[0] ) ) {
			// Make sure that the elements are removed from the DOM before they are inserted
			// this can help fix replacing a parent with child elements
			if ( jQuery.isFunction( value ) ) {
				return this.each(function(i) {
					var self = jQuery(this), old = self.html();
					self.replaceWith( value.call( this, i, old ) );
				});
			}

			if ( typeof value !== "string" ) {
				value = jQuery( value ).detach();
			}

			return this.each(function() {
				var next = this.nextSibling,
					parent = this.parentNode;

				jQuery( this ).remove();

				if ( next ) {
					jQuery(next).before( value );
				} else {
					jQuery(parent).append( value );
				}
			});
		}

		return this.length ?
			this.pushStack( jQuery(jQuery.isFunction(value) ? value() : value), "replaceWith", value ) :
			this;
	},

	detach: function( selector ) {
		return this.remove( selector, true );
	},

	domManip: function( args, table, callback ) {

		// Flatten any nested arrays
		args = [].concat.apply( [], args );

		var results, first, fragment, iNoClone,
			i = 0,
			value = args[0],
			scripts = [],
			l = this.length;

		// We can't cloneNode fragments that contain checked, in WebKit
		if ( !jQuery.support.checkClone && l > 1 && typeof value === "string" && rchecked.test( value ) ) {
			return this.each(function() {
				jQuery(this).domManip( args, table, callback );
			});
		}

		if ( jQuery.isFunction(value) ) {
			return this.each(function(i) {
				var self = jQuery(this);
				args[0] = value.call( this, i, table ? self.html() : undefined );
				self.domManip( args, table, callback );
			});
		}

		if ( this[0] ) {
			results = jQuery.buildFragment( args, this, scripts );
			fragment = results.fragment;
			first = fragment.firstChild;

			if ( fragment.childNodes.length === 1 ) {
				fragment = first;
			}

			if ( first ) {
				table = table && jQuery.nodeName( first, "tr" );

				// Use the original fragment for the last item instead of the first because it can end up
				// being emptied incorrectly in certain situations (#8070).
				// Fragments from the fragment cache must always be cloned and never used in place.
				for ( iNoClone = results.cacheable || l - 1; i < l; i++ ) {
					callback.call(
						table && jQuery.nodeName( this[i], "table" ) ?
							findOrAppend( this[i], "tbody" ) :
							this[i],
						i === iNoClone ?
							fragment :
							jQuery.clone( fragment, true, true )
					);
				}
			}

			// Fix #11809: Avoid leaking memory
			fragment = first = null;

			if ( scripts.length ) {
				jQuery.each( scripts, function( i, elem ) {
					if ( elem.src ) {
						if ( jQuery.ajax ) {
							jQuery.ajax({
								url: elem.src,
								type: "GET",
								dataType: "script",
								async: false,
								global: false,
								"throws": true
							});
						} else {
							jQuery.error("no ajax");
						}
					} else {
						jQuery.globalEval( ( elem.text || elem.textContent || elem.innerHTML || "" ).replace( rcleanScript, "" ) );
					}

					if ( elem.parentNode ) {
						elem.parentNode.removeChild( elem );
					}
				});
			}
		}

		return this;
	}
});

function findOrAppend( elem, tag ) {
	return elem.getElementsByTagName( tag )[0] || elem.appendChild( elem.ownerDocument.createElement( tag ) );
}

function cloneCopyEvent( src, dest ) {

	if ( dest.nodeType !== 1 || !jQuery.hasData( src ) ) {
		return;
	}

	var type, i, l,
		oldData = jQuery._data( src ),
		curData = jQuery._data( dest, oldData ),
		events = oldData.events;

	if ( events ) {
		delete curData.handle;
		curData.events = {};

		for ( type in events ) {
			for ( i = 0, l = events[ type ].length; i < l; i++ ) {
				jQuery.event.add( dest, type, events[ type ][ i ] );
			}
		}
	}

	// make the cloned public data object a copy from the original
	if ( curData.data ) {
		curData.data = jQuery.extend( {}, curData.data );
	}
}

function cloneFixAttributes( src, dest ) {
	var nodeName;

	// We do not need to do anything for non-Elements
	if ( dest.nodeType !== 1 ) {
		return;
	}

	// clearAttributes removes the attributes, which we don't want,
	// but also removes the attachEvent events, which we *do* want
	if ( dest.clearAttributes ) {
		dest.clearAttributes();
	}

	// mergeAttributes, in contrast, only merges back on the
	// original attributes, not the events
	if ( dest.mergeAttributes ) {
		dest.mergeAttributes( src );
	}

	nodeName = dest.nodeName.toLowerCase();

	if ( nodeName === "object" ) {
		// IE6-10 improperly clones children of object elements using classid.
		// IE10 throws NoModificationAllowedError if parent is null, #12132.
		if ( dest.parentNode ) {
			dest.outerHTML = src.outerHTML;
		}

		// This path appears unavoidable for IE9. When cloning an object
		// element in IE9, the outerHTML strategy above is not sufficient.
		// If the src has innerHTML and the destination does not,
		// copy the src.innerHTML into the dest.innerHTML. #10324
		if ( jQuery.support.html5Clone && (src.innerHTML && !jQuery.trim(dest.innerHTML)) ) {
			dest.innerHTML = src.innerHTML;
		}

	} else if ( nodeName === "input" && rcheckableType.test( src.type ) ) {
		// IE6-8 fails to persist the checked state of a cloned checkbox
		// or radio button. Worse, IE6-7 fail to give the cloned element
		// a checked appearance if the defaultChecked value isn't also set

		dest.defaultChecked = dest.checked = src.checked;

		// IE6-7 get confused and end up setting the value of a cloned
		// checkbox/radio button to an empty string instead of "on"
		if ( dest.value !== src.value ) {
			dest.value = src.value;
		}

	// IE6-8 fails to return the selected option to the default selected
	// state when cloning options
	} else if ( nodeName === "option" ) {
		dest.selected = src.defaultSelected;

	// IE6-8 fails to set the defaultValue to the correct value when
	// cloning other types of input fields
	} else if ( nodeName === "input" || nodeName === "textarea" ) {
		dest.defaultValue = src.defaultValue;

	// IE blanks contents when cloning scripts
	} else if ( nodeName === "script" && dest.text !== src.text ) {
		dest.text = src.text;
	}

	// Event data gets referenced instead of copied if the expando
	// gets copied too
	dest.removeAttribute( jQuery.expando );
}

jQuery.buildFragment = function( args, context, scripts ) {
	var fragment, cacheable, cachehit,
		first = args[ 0 ];

	// Set context from what may come in as undefined or a jQuery collection or a node
	// Updated to fix #12266 where accessing context[0] could throw an exception in IE9/10 &
	// also doubles as fix for #8950 where plain objects caused createDocumentFragment exception
	context = context || document;
	context = !context.nodeType && context[0] || context;
	context = context.ownerDocument || context;

	// Only cache "small" (1/2 KB) HTML strings that are associated with the main document
	// Cloning options loses the selected state, so don't cache them
	// IE 6 doesn't like it when you put <object> or <embed> elements in a fragment
	// Also, WebKit does not clone 'checked' attributes on cloneNode, so don't cache
	// Lastly, IE6,7,8 will not correctly reuse cached fragments that were created from unknown elems #10501
	if ( args.length === 1 && typeof first === "string" && first.length < 512 && context === document &&
		first.charAt(0) === "<" && !rnocache.test( first ) &&
		(jQuery.support.checkClone || !rchecked.test( first )) &&
		(jQuery.support.html5Clone || !rnoshimcache.test( first )) ) {

		// Mark cacheable and look for a hit
		cacheable = true;
		fragment = jQuery.fragments[ first ];
		cachehit = fragment !== undefined;
	}

	if ( !fragment ) {
		fragment = context.createDocumentFragment();
		jQuery.clean( args, context, fragment, scripts );

		// Update the cache, but only store false
		// unless this is a second parsing of the same content
		if ( cacheable ) {
			jQuery.fragments[ first ] = cachehit && fragment;
		}
	}

	return { fragment: fragment, cacheable: cacheable };
};

jQuery.fragments = {};

jQuery.each({
	appendTo: "append",
	prependTo: "prepend",
	insertBefore: "before",
	insertAfter: "after",
	replaceAll: "replaceWith"
}, function( name, original ) {
	jQuery.fn[ name ] = function( selector ) {
		var elems,
			i = 0,
			ret = [],
			insert = jQuery( selector ),
			l = insert.length,
			parent = this.length === 1 && this[0].parentNode;

		if ( (parent == null || parent && parent.nodeType === 11 && parent.childNodes.length === 1) && l === 1 ) {
			insert[ original ]( this[0] );
			return this;
		} else {
			for ( ; i < l; i++ ) {
				elems = ( i > 0 ? this.clone(true) : this ).get();
				jQuery( insert[i] )[ original ]( elems );
				ret = ret.concat( elems );
			}

			return this.pushStack( ret, name, insert.selector );
		}
	};
});

function getAll( elem ) {
	if ( typeof elem.getElementsByTagName !== "undefined" ) {
		return elem.getElementsByTagName( "*" );

	} else if ( typeof elem.querySelectorAll !== "undefined" ) {
		return elem.querySelectorAll( "*" );

	} else {
		return [];
	}
}

// Used in clean, fixes the defaultChecked property
function fixDefaultChecked( elem ) {
	if ( rcheckableType.test( elem.type ) ) {
		elem.defaultChecked = elem.checked;
	}
}

jQuery.extend({
	clone: function( elem, dataAndEvents, deepDataAndEvents ) {
		var srcElements,
			destElements,
			i,
			clone;

		if ( jQuery.support.html5Clone || jQuery.isXMLDoc(elem) || !rnoshimcache.test( "<" + elem.nodeName + ">" ) ) {
			clone = elem.cloneNode( true );

		// IE<=8 does not properly clone detached, unknown element nodes
		} else {
			fragmentDiv.innerHTML = elem.outerHTML;
			fragmentDiv.removeChild( clone = fragmentDiv.firstChild );
		}

		if ( (!jQuery.support.noCloneEvent || !jQuery.support.noCloneChecked) &&
				(elem.nodeType === 1 || elem.nodeType === 11) && !jQuery.isXMLDoc(elem) ) {
			// IE copies events bound via attachEvent when using cloneNode.
			// Calling detachEvent on the clone will also remove the events
			// from the original. In order to get around this, we use some
			// proprietary methods to clear the events. Thanks to MooTools
			// guys for this hotness.

			cloneFixAttributes( elem, clone );

			// Using Sizzle here is crazy slow, so we use getElementsByTagName instead
			srcElements = getAll( elem );
			destElements = getAll( clone );

			// Weird iteration because IE will replace the length property
			// with an element if you are cloning the body and one of the
			// elements on the page has a name or id of "length"
			for ( i = 0; srcElements[i]; ++i ) {
				// Ensure that the destination node is not null; Fixes #9587
				if ( destElements[i] ) {
					cloneFixAttributes( srcElements[i], destElements[i] );
				}
			}
		}

		// Copy the events from the original to the clone
		if ( dataAndEvents ) {
			cloneCopyEvent( elem, clone );

			if ( deepDataAndEvents ) {
				srcElements = getAll( elem );
				destElements = getAll( clone );

				for ( i = 0; srcElements[i]; ++i ) {
					cloneCopyEvent( srcElements[i], destElements[i] );
				}
			}
		}

		srcElements = destElements = null;

		// Return the cloned set
		return clone;
	},

	clean: function( elems, context, fragment, scripts ) {
		var i, j, elem, tag, wrap, depth, div, hasBody, tbody, len, handleScript, jsTags,
			safe = context === document && safeFragment,
			ret = [];

		// Ensure that context is a document
		if ( !context || typeof context.createDocumentFragment === "undefined" ) {
			context = document;
		}

		// Use the already-created safe fragment if context permits
		for ( i = 0; (elem = elems[i]) != null; i++ ) {
			if ( typeof elem === "number" ) {
				elem += "";
			}

			if ( !elem ) {
				continue;
			}

			// Convert html string into DOM nodes
			if ( typeof elem === "string" ) {
				if ( !rhtml.test( elem ) ) {
					elem = context.createTextNode( elem );
				} else {
					// Ensure a safe container in which to render the html
					safe = safe || createSafeFragment( context );
					div = context.createElement("div");
					safe.appendChild( div );

					// Fix "XHTML"-style tags in all browsers
					elem = elem.replace(rxhtmlTag, "<$1></$2>");

					// Go to html and back, then peel off extra wrappers
					tag = ( rtagName.exec( elem ) || ["", ""] )[1].toLowerCase();
					wrap = wrapMap[ tag ] || wrapMap._default;
					depth = wrap[0];
					div.innerHTML = wrap[1] + elem + wrap[2];

					// Move to the right depth
					while ( depth-- ) {
						div = div.lastChild;
					}

					// Remove IE's autoinserted <tbody> from table fragments
					if ( !jQuery.support.tbody ) {

						// String was a <table>, *may* have spurious <tbody>
						hasBody = rtbody.test(elem);
							tbody = tag === "table" && !hasBody ?
								div.firstChild && div.firstChild.childNodes :

								// String was a bare <thead> or <tfoot>
								wrap[1] === "<table>" && !hasBody ?
									div.childNodes :
									[];

						for ( j = tbody.length - 1; j >= 0 ; --j ) {
							if ( jQuery.nodeName( tbody[ j ], "tbody" ) && !tbody[ j ].childNodes.length ) {
								tbody[ j ].parentNode.removeChild( tbody[ j ] );
							}
						}
					}

					// IE completely kills leading whitespace when innerHTML is used
					if ( !jQuery.support.leadingWhitespace && rleadingWhitespace.test( elem ) ) {
						div.insertBefore( context.createTextNode( rleadingWhitespace.exec(elem)[0] ), div.firstChild );
					}

					elem = div.childNodes;

					// Take out of fragment container (we need a fresh div each time)
					div.parentNode.removeChild( div );
				}
			}

			if ( elem.nodeType ) {
				ret.push( elem );
			} else {
				jQuery.merge( ret, elem );
			}
		}

		// Fix #11356: Clear elements from safeFragment
		if ( div ) {
			elem = div = safe = null;
		}

		// Reset defaultChecked for any radios and checkboxes
		// about to be appended to the DOM in IE 6/7 (#8060)
		if ( !jQuery.support.appendChecked ) {
			for ( i = 0; (elem = ret[i]) != null; i++ ) {
				if ( jQuery.nodeName( elem, "input" ) ) {
					fixDefaultChecked( elem );
				} else if ( typeof elem.getElementsByTagName !== "undefined" ) {
					jQuery.grep( elem.getElementsByTagName("input"), fixDefaultChecked );
				}
			}
		}

		// Append elements to a provided document fragment
		if ( fragment ) {
			// Special handling of each script element
			handleScript = function( elem ) {
				// Check if we consider it executable
				if ( !elem.type || rscriptType.test( elem.type ) ) {
					// Detach the script and store it in the scripts array (if provided) or the fragment
					// Return truthy to indicate that it has been handled
					return scripts ?
						scripts.push( elem.parentNode ? elem.parentNode.removeChild( elem ) : elem ) :
						fragment.appendChild( elem );
				}
			};

			for ( i = 0; (elem = ret[i]) != null; i++ ) {
				// Check if we're done after handling an executable script
				if ( !( jQuery.nodeName( elem, "script" ) && handleScript( elem ) ) ) {
					// Append to fragment and handle embedded scripts
					fragment.appendChild( elem );
					if ( typeof elem.getElementsByTagName !== "undefined" ) {
						// handleScript alters the DOM, so use jQuery.merge to ensure snapshot iteration
						jsTags = jQuery.grep( jQuery.merge( [], elem.getElementsByTagName("script") ), handleScript );

						// Splice the scripts into ret after their former ancestor and advance our index beyond them
						ret.splice.apply( ret, [i + 1, 0].concat( jsTags ) );
						i += jsTags.length;
					}
				}
			}
		}

		return ret;
	},

	cleanData: function( elems, /* internal */ acceptData ) {
		var data, id, elem, type,
			i = 0,
			internalKey = jQuery.expando,
			cache = jQuery.cache,
			deleteExpando = jQuery.support.deleteExpando,
			special = jQuery.event.special;

		for ( ; (elem = elems[i]) != null; i++ ) {

			if ( acceptData || jQuery.acceptData( elem ) ) {

				id = elem[ internalKey ];
				data = id && cache[ id ];

				if ( data ) {
					if ( data.events ) {
						for ( type in data.events ) {
							if ( special[ type ] ) {
								jQuery.event.remove( elem, type );

							// This is a shortcut to avoid jQuery.event.remove's overhead
							} else {
								jQuery.removeEvent( elem, type, data.handle );
							}
						}
					}

					// Remove cache only if it was not already removed by jQuery.event.remove
					if ( cache[ id ] ) {

						delete cache[ id ];

						// IE does not allow us to delete expando properties from nodes,
						// nor does it have a removeAttribute function on Document nodes;
						// we must handle all of these cases
						if ( deleteExpando ) {
							delete elem[ internalKey ];

						} else if ( elem.removeAttribute ) {
							elem.removeAttribute( internalKey );

						} else {
							elem[ internalKey ] = null;
						}

						jQuery.deletedIds.push( id );
					}
				}
			}
		}
	}
});
// Limit scope pollution from any deprecated API
(function() {

var matched, browser;

// Use of jQuery.browser is frowned upon.
// More details: http://api.jquery.com/jQuery.browser
// jQuery.uaMatch maintained for back-compat
jQuery.uaMatch = function( ua ) {
	ua = ua.toLowerCase();

	var match = /(chrome)[ \/]([\w.]+)/.exec( ua ) ||
		/(webkit)[ \/]([\w.]+)/.exec( ua ) ||
		/(opera)(?:.*version|)[ \/]([\w.]+)/.exec( ua ) ||
		/(msie) ([\w.]+)/.exec( ua ) ||
		ua.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec( ua ) ||
		[];

	return {
		browser: match[ 1 ] || "",
		version: match[ 2 ] || "0"
	};
};

matched = jQuery.uaMatch( navigator.userAgent );
browser = {};

if ( matched.browser ) {
	browser[ matched.browser ] = true;
	browser.version = matched.version;
}

// Chrome is Webkit, but Webkit is also Safari.
if ( browser.chrome ) {
	browser.webkit = true;
} else if ( browser.webkit ) {
	browser.safari = true;
}

jQuery.browser = browser;

jQuery.sub = function() {
	function jQuerySub( selector, context ) {
		return new jQuerySub.fn.init( selector, context );
	}
	jQuery.extend( true, jQuerySub, this );
	jQuerySub.superclass = this;
	jQuerySub.fn = jQuerySub.prototype = this();
	jQuerySub.fn.constructor = jQuerySub;
	jQuerySub.sub = this.sub;
	jQuerySub.fn.init = function init( selector, context ) {
		if ( context && context instanceof jQuery && !(context instanceof jQuerySub) ) {
			context = jQuerySub( context );
		}

		return jQuery.fn.init.call( this, selector, context, rootjQuerySub );
	};
	jQuerySub.fn.init.prototype = jQuerySub.fn;
	var rootjQuerySub = jQuerySub(document);
	return jQuerySub;
};

})();
var curCSS, iframe, iframeDoc,
	ralpha = /alpha\([^)]*\)/i,
	ropacity = /opacity=([^)]*)/,
	rposition = /^(top|right|bottom|left)$/,
	// swappable if display is none or starts with table except "table", "table-cell", or "table-caption"
	// see here for display values: https://developer.mozilla.org/en-US/docs/CSS/display
	rdisplayswap = /^(none|table(?!-c[ea]).+)/,
	rmargin = /^margin/,
	rnumsplit = new RegExp( "^(" + core_pnum + ")(.*)$", "i" ),
	rnumnonpx = new RegExp( "^(" + core_pnum + ")(?!px)[a-z%]+$", "i" ),
	rrelNum = new RegExp( "^([-+])=(" + core_pnum + ")", "i" ),
	elemdisplay = { BODY: "block" },

	cssShow = { position: "absolute", visibility: "hidden", display: "block" },
	cssNormalTransform = {
		letterSpacing: 0,
		fontWeight: 400
	},

	cssExpand = [ "Top", "Right", "Bottom", "Left" ],
	cssPrefixes = [ "Webkit", "O", "Moz", "ms" ],

	eventsToggle = jQuery.fn.toggle;

// return a css property mapped to a potentially vendor prefixed property
function vendorPropName( style, name ) {

	// shortcut for names that are not vendor prefixed
	if ( name in style ) {
		return name;
	}

	// check for vendor prefixed names
	var capName = name.charAt(0).toUpperCase() + name.slice(1),
		origName = name,
		i = cssPrefixes.length;

	while ( i-- ) {
		name = cssPrefixes[ i ] + capName;
		if ( name in style ) {
			return name;
		}
	}

	return origName;
}

function isHidden( elem, el ) {
	elem = el || elem;
	return jQuery.css( elem, "display" ) === "none" || !jQuery.contains( elem.ownerDocument, elem );
}

function showHide( elements, show ) {
	var elem, display,
		values = [],
		index = 0,
		length = elements.length;

	for ( ; index < length; index++ ) {
		elem = elements[ index ];
		if ( !elem.style ) {
			continue;
		}
		values[ index ] = jQuery._data( elem, "olddisplay" );
		if ( show ) {
			// Reset the inline display of this element to learn if it is
			// being hidden by cascaded rules or not
			if ( !values[ index ] && elem.style.display === "none" ) {
				elem.style.display = "";
			}

			// Set elements which have been overridden with display: none
			// in a stylesheet to whatever the default browser style is
			// for such an element
			if ( elem.style.display === "" && isHidden( elem ) ) {
				values[ index ] = jQuery._data( elem, "olddisplay", css_defaultDisplay(elem.nodeName) );
			}
		} else {
			display = curCSS( elem, "display" );

			if ( !values[ index ] && display !== "none" ) {
				jQuery._data( elem, "olddisplay", display );
			}
		}
	}

	// Set the display of most of the elements in a second loop
	// to avoid the constant reflow
	for ( index = 0; index < length; index++ ) {
		elem = elements[ index ];
		if ( !elem.style ) {
			continue;
		}
		if ( !show || elem.style.display === "none" || elem.style.display === "" ) {
			elem.style.display = show ? values[ index ] || "" : "none";
		}
	}

	return elements;
}

jQuery.fn.extend({
	css: function( name, value ) {
		return jQuery.access( this, function( elem, name, value ) {
			return value !== undefined ?
				jQuery.style( elem, name, value ) :
				jQuery.css( elem, name );
		}, name, value, arguments.length > 1 );
	},
	show: function() {
		return showHide( this, true );
	},
	hide: function() {
		return showHide( this );
	},
	toggle: function( state, fn2 ) {
		var bool = typeof state === "boolean";

		if ( jQuery.isFunction( state ) && jQuery.isFunction( fn2 ) ) {
			return eventsToggle.apply( this, arguments );
		}

		return this.each(function() {
			if ( bool ? state : isHidden( this ) ) {
				jQuery( this ).show();
			} else {
				jQuery( this ).hide();
			}
		});
	}
});

jQuery.extend({
	// Add in style property hooks for overriding the default
	// behavior of getting and setting a style property
	cssHooks: {
		opacity: {
			get: function( elem, computed ) {
				if ( computed ) {
					// We should always get a number back from opacity
					var ret = curCSS( elem, "opacity" );
					return ret === "" ? "1" : ret;

				}
			}
		}
	},

	// Exclude the following css properties to add px
	cssNumber: {
		"fillOpacity": true,
		"fontWeight": true,
		"lineHeight": true,
		"opacity": true,
		"orphans": true,
		"widows": true,
		"zIndex": true,
		"zoom": true
	},

	// Add in properties whose names you wish to fix before
	// setting or getting the value
	cssProps: {
		// normalize float css property
		"float": jQuery.support.cssFloat ? "cssFloat" : "styleFloat"
	},

	// Get and set the style property on a DOM Node
	style: function( elem, name, value, extra ) {
		// Don't set styles on text and comment nodes
		if ( !elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style ) {
			return;
		}

		// Make sure that we're working with the right name
		var ret, type, hooks,
			origName = jQuery.camelCase( name ),
			style = elem.style;

		name = jQuery.cssProps[ origName ] || ( jQuery.cssProps[ origName ] = vendorPropName( style, origName ) );

		// gets hook for the prefixed version
		// followed by the unprefixed version
		hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

		// Check if we're setting a value
		if ( value !== undefined ) {
			type = typeof value;

			// convert relative number strings (+= or -=) to relative numbers. #7345
			if ( type === "string" && (ret = rrelNum.exec( value )) ) {
				value = ( ret[1] + 1 ) * ret[2] + parseFloat( jQuery.css( elem, name ) );
				// Fixes bug #9237
				type = "number";
			}

			// Make sure that NaN and null values aren't set. See: #7116
			if ( value == null || type === "number" && isNaN( value ) ) {
				return;
			}

			// If a number was passed in, add 'px' to the (except for certain CSS properties)
			if ( type === "number" && !jQuery.cssNumber[ origName ] ) {
				value += "px";
			}

			// If a hook was provided, use that value, otherwise just set the specified value
			if ( !hooks || !("set" in hooks) || (value = hooks.set( elem, value, extra )) !== undefined ) {
				// Wrapped to prevent IE from throwing errors when 'invalid' values are provided
				// Fixes bug #5509
				try {
					style[ name ] = value;
				} catch(e) {}
			}

		} else {
			// If a hook was provided get the non-computed value from there
			if ( hooks && "get" in hooks && (ret = hooks.get( elem, false, extra )) !== undefined ) {
				return ret;
			}

			// Otherwise just get the value from the style object
			return style[ name ];
		}
	},

	css: function( elem, name, numeric, extra ) {
		var val, num, hooks,
			origName = jQuery.camelCase( name );

		// Make sure that we're working with the right name
		name = jQuery.cssProps[ origName ] || ( jQuery.cssProps[ origName ] = vendorPropName( elem.style, origName ) );

		// gets hook for the prefixed version
		// followed by the unprefixed version
		hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

		// If a hook was provided get the computed value from there
		if ( hooks && "get" in hooks ) {
			val = hooks.get( elem, true, extra );
		}

		// Otherwise, if a way to get the computed value exists, use that
		if ( val === undefined ) {
			val = curCSS( elem, name );
		}

		//convert "normal" to computed value
		if ( val === "normal" && name in cssNormalTransform ) {
			val = cssNormalTransform[ name ];
		}

		// Return, converting to number if forced or a qualifier was provided and val looks numeric
		if ( numeric || extra !== undefined ) {
			num = parseFloat( val );
			return numeric || jQuery.isNumeric( num ) ? num || 0 : val;
		}
		return val;
	},

	// A method for quickly swapping in/out CSS properties to get correct calculations
	swap: function( elem, options, callback ) {
		var ret, name,
			old = {};

		// Remember the old values, and insert the new ones
		for ( name in options ) {
			old[ name ] = elem.style[ name ];
			elem.style[ name ] = options[ name ];
		}

		ret = callback.call( elem );

		// Revert the old values
		for ( name in options ) {
			elem.style[ name ] = old[ name ];
		}

		return ret;
	}
});

// NOTE: To any future maintainer, we've window.getComputedStyle
// because jsdom on node.js will break without it.
if ( window.getComputedStyle ) {
	curCSS = function( elem, name ) {
		var ret, width, minWidth, maxWidth,
			computed = window.getComputedStyle( elem, null ),
			style = elem.style;

		if ( computed ) {

			// getPropertyValue is only needed for .css('filter') in IE9, see #12537
			ret = computed.getPropertyValue( name ) || computed[ name ];

			if ( ret === "" && !jQuery.contains( elem.ownerDocument, elem ) ) {
				ret = jQuery.style( elem, name );
			}

			// A tribute to the "awesome hack by Dean Edwards"
			// Chrome < 17 and Safari 5.0 uses "computed value" instead of "used value" for margin-right
			// Safari 5.1.7 (at least) returns percentage for a larger set of values, but width seems to be reliably pixels
			// this is against the CSSOM draft spec: http://dev.w3.org/csswg/cssom/#resolved-values
			if ( rnumnonpx.test( ret ) && rmargin.test( name ) ) {
				width = style.width;
				minWidth = style.minWidth;
				maxWidth = style.maxWidth;

				style.minWidth = style.maxWidth = style.width = ret;
				ret = computed.width;

				style.width = width;
				style.minWidth = minWidth;
				style.maxWidth = maxWidth;
			}
		}

		return ret;
	};
} else if ( document.documentElement.currentStyle ) {
	curCSS = function( elem, name ) {
		var left, rsLeft,
			ret = elem.currentStyle && elem.currentStyle[ name ],
			style = elem.style;

		// Avoid setting ret to empty string here
		// so we don't default to auto
		if ( ret == null && style && style[ name ] ) {
			ret = style[ name ];
		}

		// From the awesome hack by Dean Edwards
		// http://erik.eae.net/archives/2007/07/27/18.54.15/#comment-102291

		// If we're not dealing with a regular pixel number
		// but a number that has a weird ending, we need to convert it to pixels
		// but not position css attributes, as those are proportional to the parent element instead
		// and we can't measure the parent instead because it might trigger a "stacking dolls" problem
		if ( rnumnonpx.test( ret ) && !rposition.test( name ) ) {

			// Remember the original values
			left = style.left;
			rsLeft = elem.runtimeStyle && elem.runtimeStyle.left;

			// Put in the new values to get a computed value out
			if ( rsLeft ) {
				elem.runtimeStyle.left = elem.currentStyle.left;
			}
			style.left = name === "fontSize" ? "1em" : ret;
			ret = style.pixelLeft + "px";

			// Revert the changed values
			style.left = left;
			if ( rsLeft ) {
				elem.runtimeStyle.left = rsLeft;
			}
		}

		return ret === "" ? "auto" : ret;
	};
}

function setPositiveNumber( elem, value, subtract ) {
	var matches = rnumsplit.exec( value );
	return matches ?
			Math.max( 0, matches[ 1 ] - ( subtract || 0 ) ) + ( matches[ 2 ] || "px" ) :
			value;
}

function augmentWidthOrHeight( elem, name, extra, isBorderBox ) {
	var i = extra === ( isBorderBox ? "border" : "content" ) ?
		// If we already have the right measurement, avoid augmentation
		4 :
		// Otherwise initialize for horizontal or vertical properties
		name === "width" ? 1 : 0,

		val = 0;

	for ( ; i < 4; i += 2 ) {
		// both box models exclude margin, so add it if we want it
		if ( extra === "margin" ) {
			// we use jQuery.css instead of curCSS here
			// because of the reliableMarginRight CSS hook!
			val += jQuery.css( elem, extra + cssExpand[ i ], true );
		}

		// From this point on we use curCSS for maximum performance (relevant in animations)
		if ( isBorderBox ) {
			// border-box includes padding, so remove it if we want content
			if ( extra === "content" ) {
				val -= parseFloat( curCSS( elem, "padding" + cssExpand[ i ] ) ) || 0;
			}

			// at this point, extra isn't border nor margin, so remove border
			if ( extra !== "margin" ) {
				val -= parseFloat( curCSS( elem, "border" + cssExpand[ i ] + "Width" ) ) || 0;
			}
		} else {
			// at this point, extra isn't content, so add padding
			val += parseFloat( curCSS( elem, "padding" + cssExpand[ i ] ) ) || 0;

			// at this point, extra isn't content nor padding, so add border
			if ( extra !== "padding" ) {
				val += parseFloat( curCSS( elem, "border" + cssExpand[ i ] + "Width" ) ) || 0;
			}
		}
	}

	return val;
}

function getWidthOrHeight( elem, name, extra ) {

	// Start with offset property, which is equivalent to the border-box value
	var val = name === "width" ? elem.offsetWidth : elem.offsetHeight,
		valueIsBorderBox = true,
		isBorderBox = jQuery.support.boxSizing && jQuery.css( elem, "boxSizing" ) === "border-box";

	// some non-html elements return undefined for offsetWidth, so check for null/undefined
	// svg - https://bugzilla.mozilla.org/show_bug.cgi?id=649285
	// MathML - https://bugzilla.mozilla.org/show_bug.cgi?id=491668
	if ( val <= 0 || val == null ) {
		// Fall back to computed then uncomputed css if necessary
		val = curCSS( elem, name );
		if ( val < 0 || val == null ) {
			val = elem.style[ name ];
		}

		// Computed unit is not pixels. Stop here and return.
		if ( rnumnonpx.test(val) ) {
			return val;
		}

		// we need the check for style in case a browser which returns unreliable values
		// for getComputedStyle silently falls back to the reliable elem.style
		valueIsBorderBox = isBorderBox && ( jQuery.support.boxSizingReliable || val === elem.style[ name ] );

		// Normalize "", auto, and prepare for extra
		val = parseFloat( val ) || 0;
	}

	// use the active box-sizing model to add/subtract irrelevant styles
	return ( val +
		augmentWidthOrHeight(
			elem,
			name,
			extra || ( isBorderBox ? "border" : "content" ),
			valueIsBorderBox
		)
	) + "px";
}


// Try to determine the default display value of an element
function css_defaultDisplay( nodeName ) {
	if ( elemdisplay[ nodeName ] ) {
		return elemdisplay[ nodeName ];
	}

	var elem = jQuery( "<" + nodeName + ">" ).appendTo( document.body ),
		display = elem.css("display");
	elem.remove();

	// If the simple way fails,
	// get element's real default display by attaching it to a temp iframe
	if ( display === "none" || display === "" ) {
		// Use the already-created iframe if possible
		iframe = document.body.appendChild(
			iframe || jQuery.extend( document.createElement("iframe"), {
				frameBorder: 0,
				width: 0,
				height: 0
			})
		);

		// Create a cacheable copy of the iframe document on first call.
		// IE and Opera will allow us to reuse the iframeDoc without re-writing the fake HTML
		// document to it; WebKit & Firefox won't allow reusing the iframe document.
		if ( !iframeDoc || !iframe.createElement ) {
			iframeDoc = ( iframe.contentWindow || iframe.contentDocument ).document;
			iframeDoc.write("<!doctype html><html><body>");
			iframeDoc.close();
		}

		elem = iframeDoc.body.appendChild( iframeDoc.createElement(nodeName) );

		display = curCSS( elem, "display" );
		document.body.removeChild( iframe );
	}

	// Store the correct default display
	elemdisplay[ nodeName ] = display;

	return display;
}

jQuery.each([ "height", "width" ], function( i, name ) {
	jQuery.cssHooks[ name ] = {
		get: function( elem, computed, extra ) {
			if ( computed ) {
				// certain elements can have dimension info if we invisibly show them
				// however, it must have a current display style that would benefit from this
				if ( elem.offsetWidth === 0 && rdisplayswap.test( curCSS( elem, "display" ) ) ) {
					return jQuery.swap( elem, cssShow, function() {
						return getWidthOrHeight( elem, name, extra );
					});
				} else {
					return getWidthOrHeight( elem, name, extra );
				}
			}
		},

		set: function( elem, value, extra ) {
			return setPositiveNumber( elem, value, extra ?
				augmentWidthOrHeight(
					elem,
					name,
					extra,
					jQuery.support.boxSizing && jQuery.css( elem, "boxSizing" ) === "border-box"
				) : 0
			);
		}
	};
});

if ( !jQuery.support.opacity ) {
	jQuery.cssHooks.opacity = {
		get: function( elem, computed ) {
			// IE uses filters for opacity
			return ropacity.test( (computed && elem.currentStyle ? elem.currentStyle.filter : elem.style.filter) || "" ) ?
				( 0.01 * parseFloat( RegExp.$1 ) ) + "" :
				computed ? "1" : "";
		},

		set: function( elem, value ) {
			var style = elem.style,
				currentStyle = elem.currentStyle,
				opacity = jQuery.isNumeric( value ) ? "alpha(opacity=" + value * 100 + ")" : "",
				filter = currentStyle && currentStyle.filter || style.filter || "";

			// IE has trouble with opacity if it does not have layout
			// Force it by setting the zoom level
			style.zoom = 1;

			// if setting opacity to 1, and no other filters exist - attempt to remove filter attribute #6652
			if ( value >= 1 && jQuery.trim( filter.replace( ralpha, "" ) ) === "" &&
				style.removeAttribute ) {

				// Setting style.filter to null, "" & " " still leave "filter:" in the cssText
				// if "filter:" is present at all, clearType is disabled, we want to avoid this
				// style.removeAttribute is IE Only, but so apparently is this code path...
				style.removeAttribute( "filter" );

				// if there there is no filter style applied in a css rule, we are done
				if ( currentStyle && !currentStyle.filter ) {
					return;
				}
			}

			// otherwise, set new filter values
			style.filter = ralpha.test( filter ) ?
				filter.replace( ralpha, opacity ) :
				filter + " " + opacity;
		}
	};
}

// These hooks cannot be added until DOM ready because the support test
// for it is not run until after DOM ready
jQuery(function() {
	if ( !jQuery.support.reliableMarginRight ) {
		jQuery.cssHooks.marginRight = {
			get: function( elem, computed ) {
				// WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
				// Work around by temporarily setting element display to inline-block
				return jQuery.swap( elem, { "display": "inline-block" }, function() {
					if ( computed ) {
						return curCSS( elem, "marginRight" );
					}
				});
			}
		};
	}

	// Webkit bug: https://bugs.webkit.org/show_bug.cgi?id=29084
	// getComputedStyle returns percent when specified for top/left/bottom/right
	// rather than make the css module depend on the offset module, we just check for it here
	if ( !jQuery.support.pixelPosition && jQuery.fn.position ) {
		jQuery.each( [ "top", "left" ], function( i, prop ) {
			jQuery.cssHooks[ prop ] = {
				get: function( elem, computed ) {
					if ( computed ) {
						var ret = curCSS( elem, prop );
						// if curCSS returns percentage, fallback to offset
						return rnumnonpx.test( ret ) ? jQuery( elem ).position()[ prop ] + "px" : ret;
					}
				}
			};
		});
	}

});

if ( jQuery.expr && jQuery.expr.filters ) {
	jQuery.expr.filters.hidden = function( elem ) {
		return ( elem.offsetWidth === 0 && elem.offsetHeight === 0 ) || (!jQuery.support.reliableHiddenOffsets && ((elem.style && elem.style.display) || curCSS( elem, "display" )) === "none");
	};

	jQuery.expr.filters.visible = function( elem ) {
		return !jQuery.expr.filters.hidden( elem );
	};
}

// These hooks are used by animate to expand properties
jQuery.each({
	margin: "",
	padding: "",
	border: "Width"
}, function( prefix, suffix ) {
	jQuery.cssHooks[ prefix + suffix ] = {
		expand: function( value ) {
			var i,

				// assumes a single number if not a string
				parts = typeof value === "string" ? value.split(" ") : [ value ],
				expanded = {};

			for ( i = 0; i < 4; i++ ) {
				expanded[ prefix + cssExpand[ i ] + suffix ] =
					parts[ i ] || parts[ i - 2 ] || parts[ 0 ];
			}

			return expanded;
		}
	};

	if ( !rmargin.test( prefix ) ) {
		jQuery.cssHooks[ prefix + suffix ].set = setPositiveNumber;
	}
});
var r20 = /%20/g,
	rbracket = /\[\]$/,
	rCRLF = /\r?\n/g,
	rinput = /^(?:color|date|datetime|datetime-local|email|hidden|month|number|password|range|search|tel|text|time|url|week)$/i,
	rselectTextarea = /^(?:select|textarea)/i;

jQuery.fn.extend({
	serialize: function() {
		return jQuery.param( this.serializeArray() );
	},
	serializeArray: function() {
		return this.map(function(){
			return this.elements ? jQuery.makeArray( this.elements ) : this;
		})
		.filter(function(){
			return this.name && !this.disabled &&
				( this.checked || rselectTextarea.test( this.nodeName ) ||
					rinput.test( this.type ) );
		})
		.map(function( i, elem ){
			var val = jQuery( this ).val();

			return val == null ?
				null :
				jQuery.isArray( val ) ?
					jQuery.map( val, function( val, i ){
						return { name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
					}) :
					{ name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
		}).get();
	}
});

//Serialize an array of form elements or a set of
//key/values into a query string
jQuery.param = function( a, traditional ) {
	var prefix,
		s = [],
		add = function( key, value ) {
			// If value is a function, invoke it and return its value
			value = jQuery.isFunction( value ) ? value() : ( value == null ? "" : value );
			s[ s.length ] = encodeURIComponent( key ) + "=" + encodeURIComponent( value );
		};

	// Set traditional to true for jQuery <= 1.3.2 behavior.
	if ( traditional === undefined ) {
		traditional = jQuery.ajaxSettings && jQuery.ajaxSettings.traditional;
	}

	// If an array was passed in, assume that it is an array of form elements.
	if ( jQuery.isArray( a ) || ( a.jquery && !jQuery.isPlainObject( a ) ) ) {
		// Serialize the form elements
		jQuery.each( a, function() {
			add( this.name, this.value );
		});

	} else {
		// If traditional, encode the "old" way (the way 1.3.2 or older
		// did it), otherwise encode params recursively.
		for ( prefix in a ) {
			buildParams( prefix, a[ prefix ], traditional, add );
		}
	}

	// Return the resulting serialization
	return s.join( "&" ).replace( r20, "+" );
};

function buildParams( prefix, obj, traditional, add ) {
	var name;

	if ( jQuery.isArray( obj ) ) {
		// Serialize array item.
		jQuery.each( obj, function( i, v ) {
			if ( traditional || rbracket.test( prefix ) ) {
				// Treat each array item as a scalar.
				add( prefix, v );

			} else {
				// If array item is non-scalar (array or object), encode its
				// numeric index to resolve deserialization ambiguity issues.
				// Note that rack (as of 1.0.0) can't currently deserialize
				// nested arrays properly, and attempting to do so may cause
				// a server error. Possible fixes are to modify rack's
				// deserialization algorithm or to provide an option or flag
				// to force array serialization to be shallow.
				buildParams( prefix + "[" + ( typeof v === "object" ? i : "" ) + "]", v, traditional, add );
			}
		});

	} else if ( !traditional && jQuery.type( obj ) === "object" ) {
		// Serialize object item.
		for ( name in obj ) {
			buildParams( prefix + "[" + name + "]", obj[ name ], traditional, add );
		}

	} else {
		// Serialize scalar item.
		add( prefix, obj );
	}
}
var
	// Document location
	ajaxLocParts,
	ajaxLocation,

	rhash = /#.*$/,
	rheaders = /^(.*?):[ \t]*([^\r\n]*)\r?$/mg, // IE leaves an \r character at EOL
	// #7653, #8125, #8152: local protocol detection
	rlocalProtocol = /^(?:about|app|app\-storage|.+\-extension|file|res|widget):$/,
	rnoContent = /^(?:GET|HEAD)$/,
	rprotocol = /^\/\//,
	rquery = /\?/,
	rscript = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
	rts = /([?&])_=[^&]*/,
	rurl = /^([\w\+\.\-]+:)(?:\/\/([^\/?#:]*)(?::(\d+)|)|)/,

	// Keep a copy of the old load method
	_load = jQuery.fn.load,

	/* Prefilters
	 * 1) They are useful to introduce custom dataTypes (see ajax/jsonp.js for an example)
	 * 2) These are called:
	 *    - BEFORE asking for a transport
	 *    - AFTER param serialization (s.data is a string if s.processData is true)
	 * 3) key is the dataType
	 * 4) the catchall symbol "*" can be used
	 * 5) execution will start with transport dataType and THEN continue down to "*" if needed
	 */
	prefilters = {},

	/* Transports bindings
	 * 1) key is the dataType
	 * 2) the catchall symbol "*" can be used
	 * 3) selection will start with transport dataType and THEN go to "*" if needed
	 */
	transports = {},

	// Avoid comment-prolog char sequence (#10098); must appease lint and evade compression
	allTypes = ["*/"] + ["*"];

// #8138, IE may throw an exception when accessing
// a field from window.location if document.domain has been set
try {
	ajaxLocation = location.href;
} catch( e ) {
	// Use the href attribute of an A element
	// since IE will modify it given document.location
	ajaxLocation = document.createElement( "a" );
	ajaxLocation.href = "";
	ajaxLocation = ajaxLocation.href;
}

// Segment location into parts
ajaxLocParts = rurl.exec( ajaxLocation.toLowerCase() ) || [];

// Base "constructor" for jQuery.ajaxPrefilter and jQuery.ajaxTransport
function addToPrefiltersOrTransports( structure ) {

	// dataTypeExpression is optional and defaults to "*"
	return function( dataTypeExpression, func ) {

		if ( typeof dataTypeExpression !== "string" ) {
			func = dataTypeExpression;
			dataTypeExpression = "*";
		}

		var dataType, list, placeBefore,
			dataTypes = dataTypeExpression.toLowerCase().split( core_rspace ),
			i = 0,
			length = dataTypes.length;

		if ( jQuery.isFunction( func ) ) {
			// For each dataType in the dataTypeExpression
			for ( ; i < length; i++ ) {
				dataType = dataTypes[ i ];
				// We control if we're asked to add before
				// any existing element
				placeBefore = /^\+/.test( dataType );
				if ( placeBefore ) {
					dataType = dataType.substr( 1 ) || "*";
				}
				list = structure[ dataType ] = structure[ dataType ] || [];
				// then we add to the structure accordingly
				list[ placeBefore ? "unshift" : "push" ]( func );
			}
		}
	};
}

// Base inspection function for prefilters and transports
function inspectPrefiltersOrTransports( structure, options, originalOptions, jqXHR,
		dataType /* internal */, inspected /* internal */ ) {

	dataType = dataType || options.dataTypes[ 0 ];
	inspected = inspected || {};

	inspected[ dataType ] = true;

	var selection,
		list = structure[ dataType ],
		i = 0,
		length = list ? list.length : 0,
		executeOnly = ( structure === prefilters );

	for ( ; i < length && ( executeOnly || !selection ); i++ ) {
		selection = list[ i ]( options, originalOptions, jqXHR );
		// If we got redirected to another dataType
		// we try there if executing only and not done already
		if ( typeof selection === "string" ) {
			if ( !executeOnly || inspected[ selection ] ) {
				selection = undefined;
			} else {
				options.dataTypes.unshift( selection );
				selection = inspectPrefiltersOrTransports(
						structure, options, originalOptions, jqXHR, selection, inspected );
			}
		}
	}
	// If we're only executing or nothing was selected
	// we try the catchall dataType if not done already
	if ( ( executeOnly || !selection ) && !inspected[ "*" ] ) {
		selection = inspectPrefiltersOrTransports(
				structure, options, originalOptions, jqXHR, "*", inspected );
	}
	// unnecessary when only executing (prefilters)
	// but it'll be ignored by the caller in that case
	return selection;
}

// A special extend for ajax options
// that takes "flat" options (not to be deep extended)
// Fixes #9887
function ajaxExtend( target, src ) {
	var key, deep,
		flatOptions = jQuery.ajaxSettings.flatOptions || {};
	for ( key in src ) {
		if ( src[ key ] !== undefined ) {
			( flatOptions[ key ] ? target : ( deep || ( deep = {} ) ) )[ key ] = src[ key ];
		}
	}
	if ( deep ) {
		jQuery.extend( true, target, deep );
	}
}

jQuery.fn.load = function( url, params, callback ) {
	if ( typeof url !== "string" && _load ) {
		return _load.apply( this, arguments );
	}

	// Don't do a request if no elements are being requested
	if ( !this.length ) {
		return this;
	}

	var selector, type, response,
		self = this,
		off = url.indexOf(" ");

	if ( off >= 0 ) {
		selector = url.slice( off, url.length );
		url = url.slice( 0, off );
	}

	// If it's a function
	if ( jQuery.isFunction( params ) ) {

		// We assume that it's the callback
		callback = params;
		params = undefined;

	// Otherwise, build a param string
	} else if ( params && typeof params === "object" ) {
		type = "POST";
	}

	// Request the remote document
	jQuery.ajax({
		url: url,

		// if "type" variable is undefined, then "GET" method will be used
		type: type,
		dataType: "html",
		data: params,
		complete: function( jqXHR, status ) {
			if ( callback ) {
				self.each( callback, response || [ jqXHR.responseText, status, jqXHR ] );
			}
		}
	}).done(function( responseText ) {

		// Save response for use in complete callback
		response = arguments;

		// See if a selector was specified
		self.html( selector ?

			// Create a dummy div to hold the results
			jQuery("<div>")

				// inject the contents of the document in, removing the scripts
				// to avoid any 'Permission Denied' errors in IE
				.append( responseText.replace( rscript, "" ) )

				// Locate the specified elements
				.find( selector ) :

			// If not, just inject the full result
			responseText );

	});

	return this;
};

// Attach a bunch of functions for handling common AJAX events
jQuery.each( "ajaxStart ajaxStop ajaxComplete ajaxError ajaxSuccess ajaxSend".split( " " ), function( i, o ){
	jQuery.fn[ o ] = function( f ){
		return this.on( o, f );
	};
});

jQuery.each( [ "get", "post" ], function( i, method ) {
	jQuery[ method ] = function( url, data, callback, type ) {
		// shift arguments if data argument was omitted
		if ( jQuery.isFunction( data ) ) {
			type = type || callback;
			callback = data;
			data = undefined;
		}

		return jQuery.ajax({
			type: method,
			url: url,
			data: data,
			success: callback,
			dataType: type
		});
	};
});

jQuery.extend({

	getScript: function( url, callback ) {
		return jQuery.get( url, undefined, callback, "script" );
	},

	getJSON: function( url, data, callback ) {
		return jQuery.get( url, data, callback, "json" );
	},

	// Creates a full fledged settings object into target
	// with both ajaxSettings and settings fields.
	// If target is omitted, writes into ajaxSettings.
	ajaxSetup: function( target, settings ) {
		if ( settings ) {
			// Building a settings object
			ajaxExtend( target, jQuery.ajaxSettings );
		} else {
			// Extending ajaxSettings
			settings = target;
			target = jQuery.ajaxSettings;
		}
		ajaxExtend( target, settings );
		return target;
	},

	ajaxSettings: {
		url: ajaxLocation,
		isLocal: rlocalProtocol.test( ajaxLocParts[ 1 ] ),
		global: true,
		type: "GET",
		contentType: "application/x-www-form-urlencoded; charset=UTF-8",
		processData: true,
		async: true,
		/*
		timeout: 0,
		data: null,
		dataType: null,
		username: null,
		password: null,
		cache: null,
		throws: false,
		traditional: false,
		headers: {},
		*/

		accepts: {
			xml: "application/xml, text/xml",
			html: "text/html",
			text: "text/plain",
			json: "application/json, text/javascript",
			"*": allTypes
		},

		contents: {
			xml: /xml/,
			html: /html/,
			json: /json/
		},

		responseFields: {
			xml: "responseXML",
			text: "responseText"
		},

		// List of data converters
		// 1) key format is "source_type destination_type" (a single space in-between)
		// 2) the catchall symbol "*" can be used for source_type
		converters: {

			// Convert anything to text
			"* text": window.String,

			// Text to html (true = no transformation)
			"text html": true,

			// Evaluate text as a json expression
			"text json": jQuery.parseJSON,

			// Parse text as xml
			"text xml": jQuery.parseXML
		},

		// For options that shouldn't be deep extended:
		// you can add your own custom options here if
		// and when you create one that shouldn't be
		// deep extended (see ajaxExtend)
		flatOptions: {
			context: true,
			url: true
		}
	},

	ajaxPrefilter: addToPrefiltersOrTransports( prefilters ),
	ajaxTransport: addToPrefiltersOrTransports( transports ),

	// Main method
	ajax: function( url, options ) {

		// If url is an object, simulate pre-1.5 signature
		if ( typeof url === "object" ) {
			options = url;
			url = undefined;
		}

		// Force options to be an object
		options = options || {};

		var // ifModified key
			ifModifiedKey,
			// Response headers
			responseHeadersString,
			responseHeaders,
			// transport
			transport,
			// timeout handle
			timeoutTimer,
			// Cross-domain detection vars
			parts,
			// To know if global events are to be dispatched
			fireGlobals,
			// Loop variable
			i,
			// Create the final options object
			s = jQuery.ajaxSetup( {}, options ),
			// Callbacks context
			callbackContext = s.context || s,
			// Context for global events
			// It's the callbackContext if one was provided in the options
			// and if it's a DOM node or a jQuery collection
			globalEventContext = callbackContext !== s &&
				( callbackContext.nodeType || callbackContext instanceof jQuery ) ?
						jQuery( callbackContext ) : jQuery.event,
			// Deferreds
			deferred = jQuery.Deferred(),
			completeDeferred = jQuery.Callbacks( "once memory" ),
			// Status-dependent callbacks
			statusCode = s.statusCode || {},
			// Headers (they are sent all at once)
			requestHeaders = {},
			requestHeadersNames = {},
			// The jqXHR state
			state = 0,
			// Default abort message
			strAbort = "canceled",
			// Fake xhr
			jqXHR = {

				readyState: 0,

				// Caches the header
				setRequestHeader: function( name, value ) {
					if ( !state ) {
						var lname = name.toLowerCase();
						name = requestHeadersNames[ lname ] = requestHeadersNames[ lname ] || name;
						requestHeaders[ name ] = value;
					}
					return this;
				},

				// Raw string
				getAllResponseHeaders: function() {
					return state === 2 ? responseHeadersString : null;
				},

				// Builds headers hashtable if needed
				getResponseHeader: function( key ) {
					var match;
					if ( state === 2 ) {
						if ( !responseHeaders ) {
							responseHeaders = {};
							while( ( match = rheaders.exec( responseHeadersString ) ) ) {
								responseHeaders[ match[1].toLowerCase() ] = match[ 2 ];
							}
						}
						match = responseHeaders[ key.toLowerCase() ];
					}
					return match === undefined ? null : match;
				},

				// Overrides response content-type header
				overrideMimeType: function( type ) {
					if ( !state ) {
						s.mimeType = type;
					}
					return this;
				},

				// Cancel the request
				abort: function( statusText ) {
					statusText = statusText || strAbort;
					if ( transport ) {
						transport.abort( statusText );
					}
					done( 0, statusText );
					return this;
				}
			};

		// Callback for when everything is done
		// It is defined here because jslint complains if it is declared
		// at the end of the function (which would be more logical and readable)
		function done( status, nativeStatusText, responses, headers ) {
			var isSuccess, success, error, response, modified,
				statusText = nativeStatusText;

			// Called once
			if ( state === 2 ) {
				return;
			}

			// State is "done" now
			state = 2;

			// Clear timeout if it exists
			if ( timeoutTimer ) {
				clearTimeout( timeoutTimer );
			}

			// Dereference transport for early garbage collection
			// (no matter how long the jqXHR object will be used)
			transport = undefined;

			// Cache response headers
			responseHeadersString = headers || "";

			// Set readyState
			jqXHR.readyState = status > 0 ? 4 : 0;

			// Get response data
			if ( responses ) {
				response = ajaxHandleResponses( s, jqXHR, responses );
			}

			// If successful, handle type chaining
			if ( status >= 200 && status < 300 || status === 304 ) {

				// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
				if ( s.ifModified ) {

					modified = jqXHR.getResponseHeader("Last-Modified");
					if ( modified ) {
						jQuery.lastModified[ ifModifiedKey ] = modified;
					}
					modified = jqXHR.getResponseHeader("Etag");
					if ( modified ) {
						jQuery.etag[ ifModifiedKey ] = modified;
					}
				}

				// If not modified
				if ( status === 304 ) {

					statusText = "notmodified";
					isSuccess = true;

				// If we have data
				} else {

					isSuccess = ajaxConvert( s, response );
					statusText = isSuccess.state;
					success = isSuccess.data;
					error = isSuccess.error;
					isSuccess = !error;
				}
			} else {
				// We extract error from statusText
				// then normalize statusText and status for non-aborts
				error = statusText;
				if ( !statusText || status ) {
					statusText = "error";
					if ( status < 0 ) {
						status = 0;
					}
				}
			}

			// Set data for the fake xhr object
			jqXHR.status = status;
			jqXHR.statusText = ( nativeStatusText || statusText ) + "";

			// Success/Error
			if ( isSuccess ) {
				deferred.resolveWith( callbackContext, [ success, statusText, jqXHR ] );
			} else {
				deferred.rejectWith( callbackContext, [ jqXHR, statusText, error ] );
			}

			// Status-dependent callbacks
			jqXHR.statusCode( statusCode );
			statusCode = undefined;

			if ( fireGlobals ) {
				globalEventContext.trigger( "ajax" + ( isSuccess ? "Success" : "Error" ),
						[ jqXHR, s, isSuccess ? success : error ] );
			}

			// Complete
			completeDeferred.fireWith( callbackContext, [ jqXHR, statusText ] );

			if ( fireGlobals ) {
				globalEventContext.trigger( "ajaxComplete", [ jqXHR, s ] );
				// Handle the global AJAX counter
				if ( !( --jQuery.active ) ) {
					jQuery.event.trigger( "ajaxStop" );
				}
			}
		}

		// Attach deferreds
		deferred.promise( jqXHR );
		jqXHR.success = jqXHR.done;
		jqXHR.error = jqXHR.fail;
		jqXHR.complete = completeDeferred.add;

		// Status-dependent callbacks
		jqXHR.statusCode = function( map ) {
			if ( map ) {
				var tmp;
				if ( state < 2 ) {
					for ( tmp in map ) {
						statusCode[ tmp ] = [ statusCode[tmp], map[tmp] ];
					}
				} else {
					tmp = map[ jqXHR.status ];
					jqXHR.always( tmp );
				}
			}
			return this;
		};

		// Remove hash character (#7531: and string promotion)
		// Add protocol if not provided (#5866: IE7 issue with protocol-less urls)
		// We also use the url parameter if available
		s.url = ( ( url || s.url ) + "" ).replace( rhash, "" ).replace( rprotocol, ajaxLocParts[ 1 ] + "//" );

		// Extract dataTypes list
		s.dataTypes = jQuery.trim( s.dataType || "*" ).toLowerCase().split( core_rspace );

		// A cross-domain request is in order when we have a protocol:host:port mismatch
		if ( s.crossDomain == null ) {
			parts = rurl.exec( s.url.toLowerCase() );
			s.crossDomain = !!( parts &&
				( parts[ 1 ] !== ajaxLocParts[ 1 ] || parts[ 2 ] !== ajaxLocParts[ 2 ] ||
					( parts[ 3 ] || ( parts[ 1 ] === "http:" ? 80 : 443 ) ) !=
						( ajaxLocParts[ 3 ] || ( ajaxLocParts[ 1 ] === "http:" ? 80 : 443 ) ) )
			);
		}

		// Convert data if not already a string
		if ( s.data && s.processData && typeof s.data !== "string" ) {
			s.data = jQuery.param( s.data, s.traditional );
		}

		// Apply prefilters
		inspectPrefiltersOrTransports( prefilters, s, options, jqXHR );

		// If request was aborted inside a prefilter, stop there
		if ( state === 2 ) {
			return jqXHR;
		}

		// We can fire global events as of now if asked to
		fireGlobals = s.global;

		// Uppercase the type
		s.type = s.type.toUpperCase();

		// Determine if request has content
		s.hasContent = !rnoContent.test( s.type );

		// Watch for a new set of requests
		if ( fireGlobals && jQuery.active++ === 0 ) {
			jQuery.event.trigger( "ajaxStart" );
		}

		// More options handling for requests with no content
		if ( !s.hasContent ) {

			// If data is available, append data to url
			if ( s.data ) {
				s.url += ( rquery.test( s.url ) ? "&" : "?" ) + s.data;
				// #9682: remove data so that it's not used in an eventual retry
				delete s.data;
			}

			// Get ifModifiedKey before adding the anti-cache parameter
			ifModifiedKey = s.url;

			// Add anti-cache in url if needed
			if ( s.cache === false ) {

				var ts = jQuery.now(),
					// try replacing _= if it is there
					ret = s.url.replace( rts, "$1_=" + ts );

				// if nothing was replaced, add timestamp to the end
				s.url = ret + ( ( ret === s.url ) ? ( rquery.test( s.url ) ? "&" : "?" ) + "_=" + ts : "" );
			}
		}

		// Set the correct header, if data is being sent
		if ( s.data && s.hasContent && s.contentType !== false || options.contentType ) {
			jqXHR.setRequestHeader( "Content-Type", s.contentType );
		}

		// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
		if ( s.ifModified ) {
			ifModifiedKey = ifModifiedKey || s.url;
			if ( jQuery.lastModified[ ifModifiedKey ] ) {
				jqXHR.setRequestHeader( "If-Modified-Since", jQuery.lastModified[ ifModifiedKey ] );
			}
			if ( jQuery.etag[ ifModifiedKey ] ) {
				jqXHR.setRequestHeader( "If-None-Match", jQuery.etag[ ifModifiedKey ] );
			}
		}

		// Set the Accepts header for the server, depending on the dataType
		jqXHR.setRequestHeader(
			"Accept",
			s.dataTypes[ 0 ] && s.accepts[ s.dataTypes[0] ] ?
				s.accepts[ s.dataTypes[0] ] + ( s.dataTypes[ 0 ] !== "*" ? ", " + allTypes + "; q=0.01" : "" ) :
				s.accepts[ "*" ]
		);

		// Check for headers option
		for ( i in s.headers ) {
			jqXHR.setRequestHeader( i, s.headers[ i ] );
		}

		// Allow custom headers/mimetypes and early abort
		if ( s.beforeSend && ( s.beforeSend.call( callbackContext, jqXHR, s ) === false || state === 2 ) ) {
				// Abort if not done already and return
				return jqXHR.abort();

		}

		// aborting is no longer a cancellation
		strAbort = "abort";

		// Install callbacks on deferreds
		for ( i in { success: 1, error: 1, complete: 1 } ) {
			jqXHR[ i ]( s[ i ] );
		}

		// Get transport
		transport = inspectPrefiltersOrTransports( transports, s, options, jqXHR );

		// If no transport, we auto-abort
		if ( !transport ) {
			done( -1, "No Transport" );
		} else {
			jqXHR.readyState = 1;
			// Send global event
			if ( fireGlobals ) {
				globalEventContext.trigger( "ajaxSend", [ jqXHR, s ] );
			}
			// Timeout
			if ( s.async && s.timeout > 0 ) {
				timeoutTimer = setTimeout( function(){
					jqXHR.abort( "timeout" );
				}, s.timeout );
			}

			try {
				state = 1;
				transport.send( requestHeaders, done );
			} catch (e) {
				// Propagate exception as error if not done
				if ( state < 2 ) {
					done( -1, e );
				// Simply rethrow otherwise
				} else {
					throw e;
				}
			}
		}

		return jqXHR;
	},

	// Counter for holding the number of active queries
	active: 0,

	// Last-Modified header cache for next request
	lastModified: {},
	etag: {}

});

/* Handles responses to an ajax request:
 * - sets all responseXXX fields accordingly
 * - finds the right dataType (mediates between content-type and expected dataType)
 * - returns the corresponding response
 */
function ajaxHandleResponses( s, jqXHR, responses ) {

	var ct, type, finalDataType, firstDataType,
		contents = s.contents,
		dataTypes = s.dataTypes,
		responseFields = s.responseFields;

	// Fill responseXXX fields
	for ( type in responseFields ) {
		if ( type in responses ) {
			jqXHR[ responseFields[type] ] = responses[ type ];
		}
	}

	// Remove auto dataType and get content-type in the process
	while( dataTypes[ 0 ] === "*" ) {
		dataTypes.shift();
		if ( ct === undefined ) {
			ct = s.mimeType || jqXHR.getResponseHeader( "content-type" );
		}
	}

	// Check if we're dealing with a known content-type
	if ( ct ) {
		for ( type in contents ) {
			if ( contents[ type ] && contents[ type ].test( ct ) ) {
				dataTypes.unshift( type );
				break;
			}
		}
	}

	// Check to see if we have a response for the expected dataType
	if ( dataTypes[ 0 ] in responses ) {
		finalDataType = dataTypes[ 0 ];
	} else {
		// Try convertible dataTypes
		for ( type in responses ) {
			if ( !dataTypes[ 0 ] || s.converters[ type + " " + dataTypes[0] ] ) {
				finalDataType = type;
				break;
			}
			if ( !firstDataType ) {
				firstDataType = type;
			}
		}
		// Or just use first one
		finalDataType = finalDataType || firstDataType;
	}

	// If we found a dataType
	// We add the dataType to the list if needed
	// and return the corresponding response
	if ( finalDataType ) {
		if ( finalDataType !== dataTypes[ 0 ] ) {
			dataTypes.unshift( finalDataType );
		}
		return responses[ finalDataType ];
	}
}

// Chain conversions given the request and the original response
function ajaxConvert( s, response ) {

	var conv, conv2, current, tmp,
		// Work with a copy of dataTypes in case we need to modify it for conversion
		dataTypes = s.dataTypes.slice(),
		prev = dataTypes[ 0 ],
		converters = {},
		i = 0;

	// Apply the dataFilter if provided
	if ( s.dataFilter ) {
		response = s.dataFilter( response, s.dataType );
	}

	// Create converters map with lowercased keys
	if ( dataTypes[ 1 ] ) {
		for ( conv in s.converters ) {
			converters[ conv.toLowerCase() ] = s.converters[ conv ];
		}
	}

	// Convert to each sequential dataType, tolerating list modification
	for ( ; (current = dataTypes[++i]); ) {

		// There's only work to do if current dataType is non-auto
		if ( current !== "*" ) {

			// Convert response if prev dataType is non-auto and differs from current
			if ( prev !== "*" && prev !== current ) {

				// Seek a direct converter
				conv = converters[ prev + " " + current ] || converters[ "* " + current ];

				// If none found, seek a pair
				if ( !conv ) {
					for ( conv2 in converters ) {

						// If conv2 outputs current
						tmp = conv2.split(" ");
						if ( tmp[ 1 ] === current ) {

							// If prev can be converted to accepted input
							conv = converters[ prev + " " + tmp[ 0 ] ] ||
								converters[ "* " + tmp[ 0 ] ];
							if ( conv ) {
								// Condense equivalence converters
								if ( conv === true ) {
									conv = converters[ conv2 ];

								// Otherwise, insert the intermediate dataType
								} else if ( converters[ conv2 ] !== true ) {
									current = tmp[ 0 ];
									dataTypes.splice( i--, 0, current );
								}

								break;
							}
						}
					}
				}

				// Apply converter (if not an equivalence)
				if ( conv !== true ) {

					// Unless errors are allowed to bubble, catch and return them
					if ( conv && s["throws"] ) {
						response = conv( response );
					} else {
						try {
							response = conv( response );
						} catch ( e ) {
							return { state: "parsererror", error: conv ? e : "No conversion from " + prev + " to " + current };
						}
					}
				}
			}

			// Update prev for next iteration
			prev = current;
		}
	}

	return { state: "success", data: response };
}
var oldCallbacks = [],
	rquestion = /\?/,
	rjsonp = /(=)\?(?=&|$)|\?\?/,
	nonce = jQuery.now();

// Default jsonp settings
jQuery.ajaxSetup({
	jsonp: "callback",
	jsonpCallback: function() {
		var callback = oldCallbacks.pop() || ( jQuery.expando + "_" + ( nonce++ ) );
		this[ callback ] = true;
		return callback;
	}
});

// Detect, normalize options and install callbacks for jsonp requests
jQuery.ajaxPrefilter( "json jsonp", function( s, originalSettings, jqXHR ) {

	var callbackName, overwritten, responseContainer,
		data = s.data,
		url = s.url,
		hasCallback = s.jsonp !== false,
		replaceInUrl = hasCallback && rjsonp.test( url ),
		replaceInData = hasCallback && !replaceInUrl && typeof data === "string" &&
			!( s.contentType || "" ).indexOf("application/x-www-form-urlencoded") &&
			rjsonp.test( data );

	// Handle iff the expected data type is "jsonp" or we have a parameter to set
	if ( s.dataTypes[ 0 ] === "jsonp" || replaceInUrl || replaceInData ) {

		// Get callback name, remembering preexisting value associated with it
		callbackName = s.jsonpCallback = jQuery.isFunction( s.jsonpCallback ) ?
			s.jsonpCallback() :
			s.jsonpCallback;
		overwritten = window[ callbackName ];

		// Insert callback into url or form data
		if ( replaceInUrl ) {
			s.url = url.replace( rjsonp, "$1" + callbackName );
		} else if ( replaceInData ) {
			s.data = data.replace( rjsonp, "$1" + callbackName );
		} else if ( hasCallback ) {
			s.url += ( rquestion.test( url ) ? "&" : "?" ) + s.jsonp + "=" + callbackName;
		}

		// Use data converter to retrieve json after script execution
		s.converters["script json"] = function() {
			if ( !responseContainer ) {
				jQuery.error( callbackName + " was not called" );
			}
			return responseContainer[ 0 ];
		};

		// force json dataType
		s.dataTypes[ 0 ] = "json";

		// Install callback
		window[ callbackName ] = function() {
			responseContainer = arguments;
		};

		// Clean-up function (fires after converters)
		jqXHR.always(function() {
			// Restore preexisting value
			window[ callbackName ] = overwritten;

			// Save back as free
			if ( s[ callbackName ] ) {
				// make sure that re-using the options doesn't screw things around
				s.jsonpCallback = originalSettings.jsonpCallback;

				// save the callback name for future use
				oldCallbacks.push( callbackName );
			}

			// Call if it was a function and we have a response
			if ( responseContainer && jQuery.isFunction( overwritten ) ) {
				overwritten( responseContainer[ 0 ] );
			}

			responseContainer = overwritten = undefined;
		});

		// Delegate to script
		return "script";
	}
});
// Install script dataType
jQuery.ajaxSetup({
	accepts: {
		script: "text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"
	},
	contents: {
		script: /javascript|ecmascript/
	},
	converters: {
		"text script": function( text ) {
			jQuery.globalEval( text );
			return text;
		}
	}
});

// Handle cache's special case and global
jQuery.ajaxPrefilter( "script", function( s ) {
	if ( s.cache === undefined ) {
		s.cache = false;
	}
	if ( s.crossDomain ) {
		s.type = "GET";
		s.global = false;
	}
});

// Bind script tag hack transport
jQuery.ajaxTransport( "script", function(s) {

	// This transport only deals with cross domain requests
	if ( s.crossDomain ) {

		var script,
			head = document.head || document.getElementsByTagName( "head" )[0] || document.documentElement;

		return {

			send: function( _, callback ) {

				script = document.createElement( "script" );

				script.async = "async";

				if ( s.scriptCharset ) {
					script.charset = s.scriptCharset;
				}

				script.src = s.url;

				// Attach handlers for all browsers
				script.onload = script.onreadystatechange = function( _, isAbort ) {

					if ( isAbort || !script.readyState || /loaded|complete/.test( script.readyState ) ) {

						// Handle memory leak in IE
						script.onload = script.onreadystatechange = null;

						// Remove the script
						if ( head && script.parentNode ) {
							head.removeChild( script );
						}

						// Dereference the script
						script = undefined;

						// Callback if not abort
						if ( !isAbort ) {
							callback( 200, "success" );
						}
					}
				};
				// Use insertBefore instead of appendChild  to circumvent an IE6 bug.
				// This arises when a base node is used (#2709 and #4378).
				head.insertBefore( script, head.firstChild );
			},

			abort: function() {
				if ( script ) {
					script.onload( 0, 1 );
				}
			}
		};
	}
});
var xhrCallbacks,
	// #5280: Internet Explorer will keep connections alive if we don't abort on unload
	xhrOnUnloadAbort = window.ActiveXObject ? function() {
		// Abort all pending requests
		for ( var key in xhrCallbacks ) {
			xhrCallbacks[ key ]( 0, 1 );
		}
	} : false,
	xhrId = 0;

// Functions to create xhrs
function createStandardXHR() {
	try {
		return new window.XMLHttpRequest();
	} catch( e ) {}
}

function createActiveXHR() {
	try {
		return new window.ActiveXObject( "Microsoft.XMLHTTP" );
	} catch( e ) {}
}

// Create the request object
// (This is still attached to ajaxSettings for backward compatibility)
jQuery.ajaxSettings.xhr = window.ActiveXObject ?
	/* Microsoft failed to properly
	 * implement the XMLHttpRequest in IE7 (can't request local files),
	 * so we use the ActiveXObject when it is available
	 * Additionally XMLHttpRequest can be disabled in IE7/IE8 so
	 * we need a fallback.
	 */
	function() {
		return !this.isLocal && createStandardXHR() || createActiveXHR();
	} :
	// For all other browsers, use the standard XMLHttpRequest object
	createStandardXHR;

// Determine support properties
(function( xhr ) {
	jQuery.extend( jQuery.support, {
		ajax: !!xhr,
		cors: !!xhr && ( "withCredentials" in xhr )
	});
})( jQuery.ajaxSettings.xhr() );

// Create transport if the browser can provide an xhr
if ( jQuery.support.ajax ) {

	jQuery.ajaxTransport(function( s ) {
		// Cross domain only allowed if supported through XMLHttpRequest
		if ( !s.crossDomain || jQuery.support.cors ) {

			var callback;

			return {
				send: function( headers, complete ) {

					// Get a new xhr
					var handle, i,
						xhr = s.xhr();

					// Open the socket
					// Passing null username, generates a login popup on Opera (#2865)
					if ( s.username ) {
						xhr.open( s.type, s.url, s.async, s.username, s.password );
					} else {
						xhr.open( s.type, s.url, s.async );
					}

					// Apply custom fields if provided
					if ( s.xhrFields ) {
						for ( i in s.xhrFields ) {
							xhr[ i ] = s.xhrFields[ i ];
						}
					}

					// Override mime type if needed
					if ( s.mimeType && xhr.overrideMimeType ) {
						xhr.overrideMimeType( s.mimeType );
					}

					// X-Requested-With header
					// For cross-domain requests, seeing as conditions for a preflight are
					// akin to a jigsaw puzzle, we simply never set it to be sure.
					// (it can always be set on a per-request basis or even using ajaxSetup)
					// For same-domain requests, won't change header if already provided.
					if ( !s.crossDomain && !headers["X-Requested-With"] ) {
						headers[ "X-Requested-With" ] = "XMLHttpRequest";
					}

					// Need an extra try/catch for cross domain requests in Firefox 3
					try {
						for ( i in headers ) {
							xhr.setRequestHeader( i, headers[ i ] );
						}
					} catch( _ ) {}

					// Do send the request
					// This may raise an exception which is actually
					// handled in jQuery.ajax (so no try/catch here)
					xhr.send( ( s.hasContent && s.data ) || null );

					// Listener
					callback = function( _, isAbort ) {

						var status,
							statusText,
							responseHeaders,
							responses,
							xml;

						// Firefox throws exceptions when accessing properties
						// of an xhr when a network error occurred
						// http://helpful.knobs-dials.com/index.php/Component_returned_failure_code:_0x80040111_(NS_ERROR_NOT_AVAILABLE)
						try {

							// Was never called and is aborted or complete
							if ( callback && ( isAbort || xhr.readyState === 4 ) ) {

								// Only called once
								callback = undefined;

								// Do not keep as active anymore
								if ( handle ) {
									xhr.onreadystatechange = jQuery.noop;
									if ( xhrOnUnloadAbort ) {
										delete xhrCallbacks[ handle ];
									}
								}

								// If it's an abort
								if ( isAbort ) {
									// Abort it manually if needed
									if ( xhr.readyState !== 4 ) {
										xhr.abort();
									}
								} else {
									status = xhr.status;
									responseHeaders = xhr.getAllResponseHeaders();
									responses = {};
									xml = xhr.responseXML;

									// Construct response list
									if ( xml && xml.documentElement /* #4958 */ ) {
										responses.xml = xml;
									}

									// When requesting binary data, IE6-9 will throw an exception
									// on any attempt to access responseText (#11426)
									try {
										responses.text = xhr.responseText;
									} catch( e ) {
									}

									// Firefox throws an exception when accessing
									// statusText for faulty cross-domain requests
									try {
										statusText = xhr.statusText;
									} catch( e ) {
										// We normalize with Webkit giving an empty statusText
										statusText = "";
									}

									// Filter status for non standard behaviors

									// If the request is local and we have data: assume a success
									// (success with no data won't get notified, that's the best we
									// can do given current implementations)
									if ( !status && s.isLocal && !s.crossDomain ) {
										status = responses.text ? 200 : 404;
									// IE - #1450: sometimes returns 1223 when it should be 204
									} else if ( status === 1223 ) {
										status = 204;
									}
								}
							}
						} catch( firefoxAccessException ) {
							if ( !isAbort ) {
								complete( -1, firefoxAccessException );
							}
						}

						// Call complete if needed
						if ( responses ) {
							complete( status, statusText, responses, responseHeaders );
						}
					};

					if ( !s.async ) {
						// if we're in sync mode we fire the callback
						callback();
					} else if ( xhr.readyState === 4 ) {
						// (IE6 & IE7) if it's in cache and has been
						// retrieved directly we need to fire the callback
						setTimeout( callback, 0 );
					} else {
						handle = ++xhrId;
						if ( xhrOnUnloadAbort ) {
							// Create the active xhrs callbacks list if needed
							// and attach the unload handler
							if ( !xhrCallbacks ) {
								xhrCallbacks = {};
								jQuery( window ).unload( xhrOnUnloadAbort );
							}
							// Add to list of active xhrs callbacks
							xhrCallbacks[ handle ] = callback;
						}
						xhr.onreadystatechange = callback;
					}
				},

				abort: function() {
					if ( callback ) {
						callback(0,1);
					}
				}
			};
		}
	});
}
var fxNow, timerId,
	rfxtypes = /^(?:toggle|show|hide)$/,
	rfxnum = new RegExp( "^(?:([-+])=|)(" + core_pnum + ")([a-z%]*)$", "i" ),
	rrun = /queueHooks$/,
	animationPrefilters = [ defaultPrefilter ],
	tweeners = {
		"*": [function( prop, value ) {
			var end, unit,
				tween = this.createTween( prop, value ),
				parts = rfxnum.exec( value ),
				target = tween.cur(),
				start = +target || 0,
				scale = 1,
				maxIterations = 20;

			if ( parts ) {
				end = +parts[2];
				unit = parts[3] || ( jQuery.cssNumber[ prop ] ? "" : "px" );

				// We need to compute starting value
				if ( unit !== "px" && start ) {
					// Iteratively approximate from a nonzero starting point
					// Prefer the current property, because this process will be trivial if it uses the same units
					// Fallback to end or a simple constant
					start = jQuery.css( tween.elem, prop, true ) || end || 1;

					do {
						// If previous iteration zeroed out, double until we get *something*
						// Use a string for doubling factor so we don't accidentally see scale as unchanged below
						scale = scale || ".5";

						// Adjust and apply
						start = start / scale;
						jQuery.style( tween.elem, prop, start + unit );

					// Update scale, tolerating zero or NaN from tween.cur()
					// And breaking the loop if scale is unchanged or perfect, or if we've just had enough
					} while ( scale !== (scale = tween.cur() / target) && scale !== 1 && --maxIterations );
				}

				tween.unit = unit;
				tween.start = start;
				// If a +=/-= token was provided, we're doing a relative animation
				tween.end = parts[1] ? start + ( parts[1] + 1 ) * end : end;
			}
			return tween;
		}]
	};

// Animations created synchronously will run synchronously
function createFxNow() {
	setTimeout(function() {
		fxNow = undefined;
	}, 0 );
	return ( fxNow = jQuery.now() );
}

function createTweens( animation, props ) {
	jQuery.each( props, function( prop, value ) {
		var collection = ( tweeners[ prop ] || [] ).concat( tweeners[ "*" ] ),
			index = 0,
			length = collection.length;
		for ( ; index < length; index++ ) {
			if ( collection[ index ].call( animation, prop, value ) ) {

				// we're done with this property
				return;
			}
		}
	});
}

function Animation( elem, properties, options ) {
	var result,
		index = 0,
		tweenerIndex = 0,
		length = animationPrefilters.length,
		deferred = jQuery.Deferred().always( function() {
			// don't match elem in the :animated selector
			delete tick.elem;
		}),
		tick = function() {
			var currentTime = fxNow || createFxNow(),
				remaining = Math.max( 0, animation.startTime + animation.duration - currentTime ),
				// archaic crash bug won't allow us to use 1 - ( 0.5 || 0 ) (#12497)
				temp = remaining / animation.duration || 0,
				percent = 1 - temp,
				index = 0,
				length = animation.tweens.length;

			for ( ; index < length ; index++ ) {
				animation.tweens[ index ].run( percent );
			}

			deferred.notifyWith( elem, [ animation, percent, remaining ]);

			if ( percent < 1 && length ) {
				return remaining;
			} else {
				deferred.resolveWith( elem, [ animation ] );
				return false;
			}
		},
		animation = deferred.promise({
			elem: elem,
			props: jQuery.extend( {}, properties ),
			opts: jQuery.extend( true, { specialEasing: {} }, options ),
			originalProperties: properties,
			originalOptions: options,
			startTime: fxNow || createFxNow(),
			duration: options.duration,
			tweens: [],
			createTween: function( prop, end, easing ) {
				var tween = jQuery.Tween( elem, animation.opts, prop, end,
						animation.opts.specialEasing[ prop ] || animation.opts.easing );
				animation.tweens.push( tween );
				return tween;
			},
			stop: function( gotoEnd ) {
				var index = 0,
					// if we are going to the end, we want to run all the tweens
					// otherwise we skip this part
					length = gotoEnd ? animation.tweens.length : 0;

				for ( ; index < length ; index++ ) {
					animation.tweens[ index ].run( 1 );
				}

				// resolve when we played the last frame
				// otherwise, reject
				if ( gotoEnd ) {
					deferred.resolveWith( elem, [ animation, gotoEnd ] );
				} else {
					deferred.rejectWith( elem, [ animation, gotoEnd ] );
				}
				return this;
			}
		}),
		props = animation.props;

	propFilter( props, animation.opts.specialEasing );

	for ( ; index < length ; index++ ) {
		result = animationPrefilters[ index ].call( animation, elem, props, animation.opts );
		if ( result ) {
			return result;
		}
	}

	createTweens( animation, props );

	if ( jQuery.isFunction( animation.opts.start ) ) {
		animation.opts.start.call( elem, animation );
	}

	jQuery.fx.timer(
		jQuery.extend( tick, {
			anim: animation,
			queue: animation.opts.queue,
			elem: elem
		})
	);

	// attach callbacks from options
	return animation.progress( animation.opts.progress )
		.done( animation.opts.done, animation.opts.complete )
		.fail( animation.opts.fail )
		.always( animation.opts.always );
}

function propFilter( props, specialEasing ) {
	var index, name, easing, value, hooks;

	// camelCase, specialEasing and expand cssHook pass
	for ( index in props ) {
		name = jQuery.camelCase( index );
		easing = specialEasing[ name ];
		value = props[ index ];
		if ( jQuery.isArray( value ) ) {
			easing = value[ 1 ];
			value = props[ index ] = value[ 0 ];
		}

		if ( index !== name ) {
			props[ name ] = value;
			delete props[ index ];
		}

		hooks = jQuery.cssHooks[ name ];
		if ( hooks && "expand" in hooks ) {
			value = hooks.expand( value );
			delete props[ name ];

			// not quite $.extend, this wont overwrite keys already present.
			// also - reusing 'index' from above because we have the correct "name"
			for ( index in value ) {
				if ( !( index in props ) ) {
					props[ index ] = value[ index ];
					specialEasing[ index ] = easing;
				}
			}
		} else {
			specialEasing[ name ] = easing;
		}
	}
}

jQuery.Animation = jQuery.extend( Animation, {

	tweener: function( props, callback ) {
		if ( jQuery.isFunction( props ) ) {
			callback = props;
			props = [ "*" ];
		} else {
			props = props.split(" ");
		}

		var prop,
			index = 0,
			length = props.length;

		for ( ; index < length ; index++ ) {
			prop = props[ index ];
			tweeners[ prop ] = tweeners[ prop ] || [];
			tweeners[ prop ].unshift( callback );
		}
	},

	prefilter: function( callback, prepend ) {
		if ( prepend ) {
			animationPrefilters.unshift( callback );
		} else {
			animationPrefilters.push( callback );
		}
	}
});

function defaultPrefilter( elem, props, opts ) {
	var index, prop, value, length, dataShow, toggle, tween, hooks, oldfire,
		anim = this,
		style = elem.style,
		orig = {},
		handled = [],
		hidden = elem.nodeType && isHidden( elem );

	// handle queue: false promises
	if ( !opts.queue ) {
		hooks = jQuery._queueHooks( elem, "fx" );
		if ( hooks.unqueued == null ) {
			hooks.unqueued = 0;
			oldfire = hooks.empty.fire;
			hooks.empty.fire = function() {
				if ( !hooks.unqueued ) {
					oldfire();
				}
			};
		}
		hooks.unqueued++;

		anim.always(function() {
			// doing this makes sure that the complete handler will be called
			// before this completes
			anim.always(function() {
				hooks.unqueued--;
				if ( !jQuery.queue( elem, "fx" ).length ) {
					hooks.empty.fire();
				}
			});
		});
	}

	// height/width overflow pass
	if ( elem.nodeType === 1 && ( "height" in props || "width" in props ) ) {
		// Make sure that nothing sneaks out
		// Record all 3 overflow attributes because IE does not
		// change the overflow attribute when overflowX and
		// overflowY are set to the same value
		opts.overflow = [ style.overflow, style.overflowX, style.overflowY ];

		// Set display property to inline-block for height/width
		// animations on inline elements that are having width/height animated
		if ( jQuery.css( elem, "display" ) === "inline" &&
				jQuery.css( elem, "float" ) === "none" ) {

			// inline-level elements accept inline-block;
			// block-level elements need to be inline with layout
			if ( !jQuery.support.inlineBlockNeedsLayout || css_defaultDisplay( elem.nodeName ) === "inline" ) {
				style.display = "inline-block";

			} else {
				style.zoom = 1;
			}
		}
	}

	if ( opts.overflow ) {
		style.overflow = "hidden";
		if ( !jQuery.support.shrinkWrapBlocks ) {
			anim.done(function() {
				style.overflow = opts.overflow[ 0 ];
				style.overflowX = opts.overflow[ 1 ];
				style.overflowY = opts.overflow[ 2 ];
			});
		}
	}


	// show/hide pass
	for ( index in props ) {
		value = props[ index ];
		if ( rfxtypes.exec( value ) ) {
			delete props[ index ];
			toggle = toggle || value === "toggle";
			if ( value === ( hidden ? "hide" : "show" ) ) {
				continue;
			}
			handled.push( index );
		}
	}

	length = handled.length;
	if ( length ) {
		dataShow = jQuery._data( elem, "fxshow" ) || jQuery._data( elem, "fxshow", {} );
		if ( "hidden" in dataShow ) {
			hidden = dataShow.hidden;
		}

		// store state if its toggle - enables .stop().toggle() to "reverse"
		if ( toggle ) {
			dataShow.hidden = !hidden;
		}
		if ( hidden ) {
			jQuery( elem ).show();
		} else {
			anim.done(function() {
				jQuery( elem ).hide();
			});
		}
		anim.done(function() {
			var prop;
			jQuery.removeData( elem, "fxshow", true );
			for ( prop in orig ) {
				jQuery.style( elem, prop, orig[ prop ] );
			}
		});
		for ( index = 0 ; index < length ; index++ ) {
			prop = handled[ index ];
			tween = anim.createTween( prop, hidden ? dataShow[ prop ] : 0 );
			orig[ prop ] = dataShow[ prop ] || jQuery.style( elem, prop );

			if ( !( prop in dataShow ) ) {
				dataShow[ prop ] = tween.start;
				if ( hidden ) {
					tween.end = tween.start;
					tween.start = prop === "width" || prop === "height" ? 1 : 0;
				}
			}
		}
	}
}

function Tween( elem, options, prop, end, easing ) {
	return new Tween.prototype.init( elem, options, prop, end, easing );
}
jQuery.Tween = Tween;

Tween.prototype = {
	constructor: Tween,
	init: function( elem, options, prop, end, easing, unit ) {
		this.elem = elem;
		this.prop = prop;
		this.easing = easing || "swing";
		this.options = options;
		this.start = this.now = this.cur();
		this.end = end;
		this.unit = unit || ( jQuery.cssNumber[ prop ] ? "" : "px" );
	},
	cur: function() {
		var hooks = Tween.propHooks[ this.prop ];

		return hooks && hooks.get ?
			hooks.get( this ) :
			Tween.propHooks._default.get( this );
	},
	run: function( percent ) {
		var eased,
			hooks = Tween.propHooks[ this.prop ];

		if ( this.options.duration ) {
			this.pos = eased = jQuery.easing[ this.easing ](
				percent, this.options.duration * percent, 0, 1, this.options.duration
			);
		} else {
			this.pos = eased = percent;
		}
		this.now = ( this.end - this.start ) * eased + this.start;

		if ( this.options.step ) {
			this.options.step.call( this.elem, this.now, this );
		}

		if ( hooks && hooks.set ) {
			hooks.set( this );
		} else {
			Tween.propHooks._default.set( this );
		}
		return this;
	}
};

Tween.prototype.init.prototype = Tween.prototype;

Tween.propHooks = {
	_default: {
		get: function( tween ) {
			var result;

			if ( tween.elem[ tween.prop ] != null &&
				(!tween.elem.style || tween.elem.style[ tween.prop ] == null) ) {
				return tween.elem[ tween.prop ];
			}

			// passing any value as a 4th parameter to .css will automatically
			// attempt a parseFloat and fallback to a string if the parse fails
			// so, simple values such as "10px" are parsed to Float.
			// complex values such as "rotate(1rad)" are returned as is.
			result = jQuery.css( tween.elem, tween.prop, false, "" );
			// Empty strings, null, undefined and "auto" are converted to 0.
			return !result || result === "auto" ? 0 : result;
		},
		set: function( tween ) {
			// use step hook for back compat - use cssHook if its there - use .style if its
			// available and use plain properties where available
			if ( jQuery.fx.step[ tween.prop ] ) {
				jQuery.fx.step[ tween.prop ]( tween );
			} else if ( tween.elem.style && ( tween.elem.style[ jQuery.cssProps[ tween.prop ] ] != null || jQuery.cssHooks[ tween.prop ] ) ) {
				jQuery.style( tween.elem, tween.prop, tween.now + tween.unit );
			} else {
				tween.elem[ tween.prop ] = tween.now;
			}
		}
	}
};

// Remove in 2.0 - this supports IE8's panic based approach
// to setting things on disconnected nodes

Tween.propHooks.scrollTop = Tween.propHooks.scrollLeft = {
	set: function( tween ) {
		if ( tween.elem.nodeType && tween.elem.parentNode ) {
			tween.elem[ tween.prop ] = tween.now;
		}
	}
};

jQuery.each([ "toggle", "show", "hide" ], function( i, name ) {
	var cssFn = jQuery.fn[ name ];
	jQuery.fn[ name ] = function( speed, easing, callback ) {
		return speed == null || typeof speed === "boolean" ||
			// special check for .toggle( handler, handler, ... )
			( !i && jQuery.isFunction( speed ) && jQuery.isFunction( easing ) ) ?
			cssFn.apply( this, arguments ) :
			this.animate( genFx( name, true ), speed, easing, callback );
	};
});

jQuery.fn.extend({
	fadeTo: function( speed, to, easing, callback ) {

		// show any hidden elements after setting opacity to 0
		return this.filter( isHidden ).css( "opacity", 0 ).show()

			// animate to the value specified
			.end().animate({ opacity: to }, speed, easing, callback );
	},
	animate: function( prop, speed, easing, callback ) {
		var empty = jQuery.isEmptyObject( prop ),
			optall = jQuery.speed( speed, easing, callback ),
			doAnimation = function() {
				// Operate on a copy of prop so per-property easing won't be lost
				var anim = Animation( this, jQuery.extend( {}, prop ), optall );

				// Empty animations resolve immediately
				if ( empty ) {
					anim.stop( true );
				}
			};

		return empty || optall.queue === false ?
			this.each( doAnimation ) :
			this.queue( optall.queue, doAnimation );
	},
	stop: function( type, clearQueue, gotoEnd ) {
		var stopQueue = function( hooks ) {
			var stop = hooks.stop;
			delete hooks.stop;
			stop( gotoEnd );
		};

		if ( typeof type !== "string" ) {
			gotoEnd = clearQueue;
			clearQueue = type;
			type = undefined;
		}
		if ( clearQueue && type !== false ) {
			this.queue( type || "fx", [] );
		}

		return this.each(function() {
			var dequeue = true,
				index = type != null && type + "queueHooks",
				timers = jQuery.timers,
				data = jQuery._data( this );

			if ( index ) {
				if ( data[ index ] && data[ index ].stop ) {
					stopQueue( data[ index ] );
				}
			} else {
				for ( index in data ) {
					if ( data[ index ] && data[ index ].stop && rrun.test( index ) ) {
						stopQueue( data[ index ] );
					}
				}
			}

			for ( index = timers.length; index--; ) {
				if ( timers[ index ].elem === this && (type == null || timers[ index ].queue === type) ) {
					timers[ index ].anim.stop( gotoEnd );
					dequeue = false;
					timers.splice( index, 1 );
				}
			}

			// start the next in the queue if the last step wasn't forced
			// timers currently will call their complete callbacks, which will dequeue
			// but only if they were gotoEnd
			if ( dequeue || !gotoEnd ) {
				jQuery.dequeue( this, type );
			}
		});
	}
});

// Generate parameters to create a standard animation
function genFx( type, includeWidth ) {
	var which,
		attrs = { height: type },
		i = 0;

	// if we include width, step value is 1 to do all cssExpand values,
	// if we don't include width, step value is 2 to skip over Left and Right
	includeWidth = includeWidth? 1 : 0;
	for( ; i < 4 ; i += 2 - includeWidth ) {
		which = cssExpand[ i ];
		attrs[ "margin" + which ] = attrs[ "padding" + which ] = type;
	}

	if ( includeWidth ) {
		attrs.opacity = attrs.width = type;
	}

	return attrs;
}

// Generate shortcuts for custom animations
jQuery.each({
	slideDown: genFx("show"),
	slideUp: genFx("hide"),
	slideToggle: genFx("toggle"),
	fadeIn: { opacity: "show" },
	fadeOut: { opacity: "hide" },
	fadeToggle: { opacity: "toggle" }
}, function( name, props ) {
	jQuery.fn[ name ] = function( speed, easing, callback ) {
		return this.animate( props, speed, easing, callback );
	};
});

jQuery.speed = function( speed, easing, fn ) {
	var opt = speed && typeof speed === "object" ? jQuery.extend( {}, speed ) : {
		complete: fn || !fn && easing ||
			jQuery.isFunction( speed ) && speed,
		duration: speed,
		easing: fn && easing || easing && !jQuery.isFunction( easing ) && easing
	};

	opt.duration = jQuery.fx.off ? 0 : typeof opt.duration === "number" ? opt.duration :
		opt.duration in jQuery.fx.speeds ? jQuery.fx.speeds[ opt.duration ] : jQuery.fx.speeds._default;

	// normalize opt.queue - true/undefined/null -> "fx"
	if ( opt.queue == null || opt.queue === true ) {
		opt.queue = "fx";
	}

	// Queueing
	opt.old = opt.complete;

	opt.complete = function() {
		if ( jQuery.isFunction( opt.old ) ) {
			opt.old.call( this );
		}

		if ( opt.queue ) {
			jQuery.dequeue( this, opt.queue );
		}
	};

	return opt;
};

jQuery.easing = {
	linear: function( p ) {
		return p;
	},
	swing: function( p ) {
		return 0.5 - Math.cos( p*Math.PI ) / 2;
	}
};

jQuery.timers = [];
jQuery.fx = Tween.prototype.init;
jQuery.fx.tick = function() {
	var timer,
		timers = jQuery.timers,
		i = 0;

	fxNow = jQuery.now();

	for ( ; i < timers.length; i++ ) {
		timer = timers[ i ];
		// Checks the timer has not already been removed
		if ( !timer() && timers[ i ] === timer ) {
			timers.splice( i--, 1 );
		}
	}

	if ( !timers.length ) {
		jQuery.fx.stop();
	}
	fxNow = undefined;
};

jQuery.fx.timer = function( timer ) {
	if ( timer() && jQuery.timers.push( timer ) && !timerId ) {
		timerId = setInterval( jQuery.fx.tick, jQuery.fx.interval );
	}
};

jQuery.fx.interval = 13;

jQuery.fx.stop = function() {
	clearInterval( timerId );
	timerId = null;
};

jQuery.fx.speeds = {
	slow: 600,
	fast: 200,
	// Default speed
	_default: 400
};

// Back Compat <1.8 extension point
jQuery.fx.step = {};

if ( jQuery.expr && jQuery.expr.filters ) {
	jQuery.expr.filters.animated = function( elem ) {
		return jQuery.grep(jQuery.timers, function( fn ) {
			return elem === fn.elem;
		}).length;
	};
}
var rroot = /^(?:body|html)$/i;

jQuery.fn.offset = function( options ) {
	if ( arguments.length ) {
		return options === undefined ?
			this :
			this.each(function( i ) {
				jQuery.offset.setOffset( this, options, i );
			});
	}

	var docElem, body, win, clientTop, clientLeft, scrollTop, scrollLeft,
		box = { top: 0, left: 0 },
		elem = this[ 0 ],
		doc = elem && elem.ownerDocument;

	if ( !doc ) {
		return;
	}

	if ( (body = doc.body) === elem ) {
		return jQuery.offset.bodyOffset( elem );
	}

	docElem = doc.documentElement;

	// Make sure it's not a disconnected DOM node
	if ( !jQuery.contains( docElem, elem ) ) {
		return box;
	}

	// If we don't have gBCR, just use 0,0 rather than error
	// BlackBerry 5, iOS 3 (original iPhone)
	if ( typeof elem.getBoundingClientRect !== "undefined" ) {
		box = elem.getBoundingClientRect();
	}
	win = getWindow( doc );
	clientTop  = docElem.clientTop  || body.clientTop  || 0;
	clientLeft = docElem.clientLeft || body.clientLeft || 0;
	scrollTop  = win.pageYOffset || docElem.scrollTop;
	scrollLeft = win.pageXOffset || docElem.scrollLeft;
	return {
		top: box.top  + scrollTop  - clientTop,
		left: box.left + scrollLeft - clientLeft
	};
};

jQuery.offset = {

	bodyOffset: function( body ) {
		var top = body.offsetTop,
			left = body.offsetLeft;

		if ( jQuery.support.doesNotIncludeMarginInBodyOffset ) {
			top  += parseFloat( jQuery.css(body, "marginTop") ) || 0;
			left += parseFloat( jQuery.css(body, "marginLeft") ) || 0;
		}

		return { top: top, left: left };
	},

	setOffset: function( elem, options, i ) {
		var position = jQuery.css( elem, "position" );

		// set position first, in-case top/left are set even on static elem
		if ( position === "static" ) {
			elem.style.position = "relative";
		}

		var curElem = jQuery( elem ),
			curOffset = curElem.offset(),
			curCSSTop = jQuery.css( elem, "top" ),
			curCSSLeft = jQuery.css( elem, "left" ),
			calculatePosition = ( position === "absolute" || position === "fixed" ) && jQuery.inArray("auto", [curCSSTop, curCSSLeft]) > -1,
			props = {}, curPosition = {}, curTop, curLeft;

		// need to be able to calculate position if either top or left is auto and position is either absolute or fixed
		if ( calculatePosition ) {
			curPosition = curElem.position();
			curTop = curPosition.top;
			curLeft = curPosition.left;
		} else {
			curTop = parseFloat( curCSSTop ) || 0;
			curLeft = parseFloat( curCSSLeft ) || 0;
		}

		if ( jQuery.isFunction( options ) ) {
			options = options.call( elem, i, curOffset );
		}

		if ( options.top != null ) {
			props.top = ( options.top - curOffset.top ) + curTop;
		}
		if ( options.left != null ) {
			props.left = ( options.left - curOffset.left ) + curLeft;
		}

		if ( "using" in options ) {
			options.using.call( elem, props );
		} else {
			curElem.css( props );
		}
	}
};


jQuery.fn.extend({

	position: function() {
		if ( !this[0] ) {
			return;
		}

		var elem = this[0],

		// Get *real* offsetParent
		offsetParent = this.offsetParent(),

		// Get correct offsets
		offset       = this.offset(),
		parentOffset = rroot.test(offsetParent[0].nodeName) ? { top: 0, left: 0 } : offsetParent.offset();

		// Subtract element margins
		// note: when an element has margin: auto the offsetLeft and marginLeft
		// are the same in Safari causing offset.left to incorrectly be 0
		offset.top  -= parseFloat( jQuery.css(elem, "marginTop") ) || 0;
		offset.left -= parseFloat( jQuery.css(elem, "marginLeft") ) || 0;

		// Add offsetParent borders
		parentOffset.top  += parseFloat( jQuery.css(offsetParent[0], "borderTopWidth") ) || 0;
		parentOffset.left += parseFloat( jQuery.css(offsetParent[0], "borderLeftWidth") ) || 0;

		// Subtract the two offsets
		return {
			top:  offset.top  - parentOffset.top,
			left: offset.left - parentOffset.left
		};
	},

	offsetParent: function() {
		return this.map(function() {
			var offsetParent = this.offsetParent || document.body;
			while ( offsetParent && (!rroot.test(offsetParent.nodeName) && jQuery.css(offsetParent, "position") === "static") ) {
				offsetParent = offsetParent.offsetParent;
			}
			return offsetParent || document.body;
		});
	}
});


// Create scrollLeft and scrollTop methods
jQuery.each( {scrollLeft: "pageXOffset", scrollTop: "pageYOffset"}, function( method, prop ) {
	var top = /Y/.test( prop );

	jQuery.fn[ method ] = function( val ) {
		return jQuery.access( this, function( elem, method, val ) {
			var win = getWindow( elem );

			if ( val === undefined ) {
				return win ? (prop in win) ? win[ prop ] :
					win.document.documentElement[ method ] :
					elem[ method ];
			}

			if ( win ) {
				win.scrollTo(
					!top ? val : jQuery( win ).scrollLeft(),
					 top ? val : jQuery( win ).scrollTop()
				);

			} else {
				elem[ method ] = val;
			}
		}, method, val, arguments.length, null );
	};
});

function getWindow( elem ) {
	return jQuery.isWindow( elem ) ?
		elem :
		elem.nodeType === 9 ?
			elem.defaultView || elem.parentWindow :
			false;
}
// Create innerHeight, innerWidth, height, width, outerHeight and outerWidth methods
jQuery.each( { Height: "height", Width: "width" }, function( name, type ) {
	jQuery.each( { padding: "inner" + name, content: type, "": "outer" + name }, function( defaultExtra, funcName ) {
		// margin is only for outerHeight, outerWidth
		jQuery.fn[ funcName ] = function( margin, value ) {
			var chainable = arguments.length && ( defaultExtra || typeof margin !== "boolean" ),
				extra = defaultExtra || ( margin === true || value === true ? "margin" : "border" );

			return jQuery.access( this, function( elem, type, value ) {
				var doc;

				if ( jQuery.isWindow( elem ) ) {
					// As of 5/8/2012 this will yield incorrect results for Mobile Safari, but there
					// isn't a whole lot we can do. See pull request at this URL for discussion:
					// https://github.com/jquery/jquery/pull/764
					return elem.document.documentElement[ "client" + name ];
				}

				// Get document width or height
				if ( elem.nodeType === 9 ) {
					doc = elem.documentElement;

					// Either scroll[Width/Height] or offset[Width/Height] or client[Width/Height], whichever is greatest
					// unfortunately, this causes bug #3838 in IE6/8 only, but there is currently no good, small way to fix it.
					return Math.max(
						elem.body[ "scroll" + name ], doc[ "scroll" + name ],
						elem.body[ "offset" + name ], doc[ "offset" + name ],
						doc[ "client" + name ]
					);
				}

				return value === undefined ?
					// Get width or height on the element, requesting but not forcing parseFloat
					jQuery.css( elem, type, value, extra ) :

					// Set width or height on the element
					jQuery.style( elem, type, value, extra );
			}, type, chainable ? margin : undefined, chainable, null );
		};
	});
});
// Expose jQuery to the global object
window.jQuery = window.$ = jQuery;

// Expose jQuery as an AMD module, but only for AMD loaders that
// understand the issues with loading multiple versions of jQuery
// in a page that all might call define(). The loader will indicate
// they have special allowances for multiple jQuery versions by
// specifying define.amd.jQuery = true. Register as a named module,
// since jQuery can be concatenated with other files that may use define,
// but not use a proper concatenation script that understands anonymous
// AMD modules. A named AMD is safest and most robust way to register.
// Lowercase jquery is used because AMD module names are derived from
// file names, and jQuery is normally delivered in a lowercase file name.
// Do this after creating the global so that if an AMD module wants to call
// noConflict to hide this version of jQuery, it will work.
if ( typeof define === "function" && define.amd && define.amd.jQuery ) {
	define( "jquery", [], function () { return jQuery; } );
}

})( window );

/*! jQuery UI - v1.9.2 - 2018-05-25
* http://jqueryui.com
* Includes: jquery.ui.core.js, jquery.ui.widget.js, jquery.ui.mouse.js, jquery.ui.position.js, jquery.ui.autocomplete.js, jquery.ui.menu.js, jquery.ui.slider.js
* Copyright jQuery Foundation and other contributors; Licensed MIT */

(function(t,e){function i(e,i){var n,o,a,r=e.nodeName.toLowerCase();return"area"===r?(n=e.parentNode,o=n.name,e.href&&o&&"map"===n.nodeName.toLowerCase()?(a=t("img[usemap=#"+o+"]")[0],!!a&&s(a)):!1):(/input|select|textarea|button|object/.test(r)?!e.disabled:"a"===r?e.href||i:i)&&s(e)}function s(e){return t.expr.filters.visible(e)&&!t(e).parents().andSelf().filter(function(){return"hidden"===t.css(this,"visibility")}).length}var n=0,o=/^ui-id-\d+$/;t.ui=t.ui||{},t.ui.version||(t.extend(t.ui,{version:"1.9.2",keyCode:{BACKSPACE:8,COMMA:188,DELETE:46,DOWN:40,END:35,ENTER:13,ESCAPE:27,HOME:36,LEFT:37,NUMPAD_ADD:107,NUMPAD_DECIMAL:110,NUMPAD_DIVIDE:111,NUMPAD_ENTER:108,NUMPAD_MULTIPLY:106,NUMPAD_SUBTRACT:109,PAGE_DOWN:34,PAGE_UP:33,PERIOD:190,RIGHT:39,SPACE:32,TAB:9,UP:38}}),t.fn.extend({_focus:t.fn.focus,focus:function(e,i){return"number"==typeof e?this.each(function(){var s=this;setTimeout(function(){t(s).focus(),i&&i.call(s)},e)}):this._focus.apply(this,arguments)},scrollParent:function(){var e;return e=t.ui.ie&&/(static|relative)/.test(this.css("position"))||/absolute/.test(this.css("position"))?this.parents().filter(function(){return/(relative|absolute|fixed)/.test(t.css(this,"position"))&&/(auto|scroll)/.test(t.css(this,"overflow")+t.css(this,"overflow-y")+t.css(this,"overflow-x"))}).eq(0):this.parents().filter(function(){return/(auto|scroll)/.test(t.css(this,"overflow")+t.css(this,"overflow-y")+t.css(this,"overflow-x"))}).eq(0),/fixed/.test(this.css("position"))||!e.length?t(document):e},zIndex:function(i){if(i!==e)return this.css("zIndex",i);if(this.length)for(var s,n,o=t(this[0]);o.length&&o[0]!==document;){if(s=o.css("position"),("absolute"===s||"relative"===s||"fixed"===s)&&(n=parseInt(o.css("zIndex"),10),!isNaN(n)&&0!==n))return n;o=o.parent()}return 0},uniqueId:function(){return this.each(function(){this.id||(this.id="ui-id-"+ ++n)})},removeUniqueId:function(){return this.each(function(){o.test(this.id)&&t(this).removeAttr("id")})}}),t.extend(t.expr[":"],{data:t.expr.createPseudo?t.expr.createPseudo(function(e){return function(i){return!!t.data(i,e)}}):function(e,i,s){return!!t.data(e,s[3])},focusable:function(e){return i(e,!isNaN(t.attr(e,"tabindex")))},tabbable:function(e){var s=t.attr(e,"tabindex"),n=isNaN(s);return(n||s>=0)&&i(e,!n)}}),t(function(){var e=document.body,i=e.appendChild(i=document.createElement("div"));i.offsetHeight,t.extend(i.style,{minHeight:"100px",height:"auto",padding:0,borderWidth:0}),t.support.minHeight=100===i.offsetHeight,t.support.selectstart="onselectstart"in i,e.removeChild(i).style.display="none"}),t("<a>").outerWidth(1).jquery||t.each(["Width","Height"],function(i,s){function n(e,i,s,n){return t.each(o,function(){i-=parseFloat(t.css(e,"padding"+this))||0,s&&(i-=parseFloat(t.css(e,"border"+this+"Width"))||0),n&&(i-=parseFloat(t.css(e,"margin"+this))||0)}),i}var o="Width"===s?["Left","Right"]:["Top","Bottom"],a=s.toLowerCase(),r={innerWidth:t.fn.innerWidth,innerHeight:t.fn.innerHeight,outerWidth:t.fn.outerWidth,outerHeight:t.fn.outerHeight};t.fn["inner"+s]=function(i){return i===e?r["inner"+s].call(this):this.each(function(){t(this).css(a,n(this,i)+"px")})},t.fn["outer"+s]=function(e,i){return"number"!=typeof e?r["outer"+s].call(this,e):this.each(function(){t(this).css(a,n(this,e,!0,i)+"px")})}}),t("<a>").data("a-b","a").removeData("a-b").data("a-b")&&(t.fn.removeData=function(e){return function(i){return arguments.length?e.call(this,t.camelCase(i)):e.call(this)}}(t.fn.removeData)),function(){var e=/msie ([\w.]+)/.exec(navigator.userAgent.toLowerCase())||[];t.ui.ie=e.length?!0:!1,t.ui.ie6=6===parseFloat(e[1],10)}(),t.fn.extend({disableSelection:function(){return this.bind((t.support.selectstart?"selectstart":"mousedown")+".ui-disableSelection",function(t){t.preventDefault()})},enableSelection:function(){return this.unbind(".ui-disableSelection")}}),t.extend(t.ui,{plugin:{add:function(e,i,s){var n,o=t.ui[e].prototype;for(n in s)o.plugins[n]=o.plugins[n]||[],o.plugins[n].push([i,s[n]])},call:function(t,e,i){var s,n=t.plugins[e];if(n&&t.element[0].parentNode&&11!==t.element[0].parentNode.nodeType)for(s=0;n.length>s;s++)t.options[n[s][0]]&&n[s][1].apply(t.element,i)}},contains:t.contains,hasScroll:function(e,i){if("hidden"===t(e).css("overflow"))return!1;var s=i&&"left"===i?"scrollLeft":"scrollTop",n=!1;return e[s]>0?!0:(e[s]=1,n=e[s]>0,e[s]=0,n)},isOverAxis:function(t,e,i){return t>e&&e+i>t},isOver:function(e,i,s,n,o,a){return t.ui.isOverAxis(e,s,o)&&t.ui.isOverAxis(i,n,a)}}))})(jQuery);(function(t,e){var i=0,s=Array.prototype.slice,n=t.cleanData;t.cleanData=function(e){for(var i,s=0;null!=(i=e[s]);s++)try{t(i).triggerHandler("remove")}catch(o){}n(e)},t.widget=function(i,s,n){var o,a,r,h,l=i.split(".")[0];i=i.split(".")[1],o=l+"-"+i,n||(n=s,s=t.Widget),t.expr[":"][o.toLowerCase()]=function(e){return!!t.data(e,o)},t[l]=t[l]||{},a=t[l][i],r=t[l][i]=function(t,i){return this._createWidget?(arguments.length&&this._createWidget(t,i),e):new r(t,i)},t.extend(r,a,{version:n.version,_proto:t.extend({},n),_childConstructors:[]}),h=new s,h.options=t.widget.extend({},h.options),t.each(n,function(e,i){t.isFunction(i)&&(n[e]=function(){var t=function(){return s.prototype[e].apply(this,arguments)},n=function(t){return s.prototype[e].apply(this,t)};return function(){var e,s=this._super,o=this._superApply;return this._super=t,this._superApply=n,e=i.apply(this,arguments),this._super=s,this._superApply=o,e}}())}),r.prototype=t.widget.extend(h,{widgetEventPrefix:a?h.widgetEventPrefix:i},n,{constructor:r,namespace:l,widgetName:i,widgetBaseClass:o,widgetFullName:o}),a?(t.each(a._childConstructors,function(e,i){var s=i.prototype;t.widget(s.namespace+"."+s.widgetName,r,i._proto)}),delete a._childConstructors):s._childConstructors.push(r),t.widget.bridge(i,r)},t.widget.extend=function(i){for(var n,o,a=s.call(arguments,1),r=0,h=a.length;h>r;r++)for(n in a[r])o=a[r][n],a[r].hasOwnProperty(n)&&o!==e&&(i[n]=t.isPlainObject(o)?t.isPlainObject(i[n])?t.widget.extend({},i[n],o):t.widget.extend({},o):o);return i},t.widget.bridge=function(i,n){var o=n.prototype.widgetFullName||i;t.fn[i]=function(a){var r="string"==typeof a,h=s.call(arguments,1),l=this;return a=!r&&h.length?t.widget.extend.apply(null,[a].concat(h)):a,r?this.each(function(){var s,n=t.data(this,o);return n?t.isFunction(n[a])&&"_"!==a.charAt(0)?(s=n[a].apply(n,h),s!==n&&s!==e?(l=s&&s.jquery?l.pushStack(s.get()):s,!1):e):t.error("no such method '"+a+"' for "+i+" widget instance"):t.error("cannot call methods on "+i+" prior to initialization; "+"attempted to call method '"+a+"'")}):this.each(function(){var e=t.data(this,o);e?e.option(a||{})._init():t.data(this,o,new n(a,this))}),l}},t.Widget=function(){},t.Widget._childConstructors=[],t.Widget.prototype={widgetName:"widget",widgetEventPrefix:"",defaultElement:"<div>",options:{disabled:!1,create:null},_createWidget:function(e,s){s=t(s||this.defaultElement||this)[0],this.element=t(s),this.uuid=i++,this.eventNamespace="."+this.widgetName+this.uuid,this.options=t.widget.extend({},this.options,this._getCreateOptions(),e),this.bindings=t(),this.hoverable=t(),this.focusable=t(),s!==this&&(t.data(s,this.widgetName,this),t.data(s,this.widgetFullName,this),this._on(!0,this.element,{remove:function(t){t.target===s&&this.destroy()}}),this.document=t(s.style?s.ownerDocument:s.document||s),this.window=t(this.document[0].defaultView||this.document[0].parentWindow)),this._create(),this._trigger("create",null,this._getCreateEventData()),this._init()},_getCreateOptions:t.noop,_getCreateEventData:t.noop,_create:t.noop,_init:t.noop,destroy:function(){this._destroy(),this.element.unbind(this.eventNamespace).removeData(this.widgetName).removeData(this.widgetFullName).removeData(t.camelCase(this.widgetFullName)),this.widget().unbind(this.eventNamespace).removeAttr("aria-disabled").removeClass(this.widgetFullName+"-disabled "+"ui-state-disabled"),this.bindings.unbind(this.eventNamespace),this.hoverable.removeClass("ui-state-hover"),this.focusable.removeClass("ui-state-focus")},_destroy:t.noop,widget:function(){return this.element},option:function(i,s){var n,o,a,r=i;if(0===arguments.length)return t.widget.extend({},this.options);if("string"==typeof i)if(r={},n=i.split("."),i=n.shift(),n.length){for(o=r[i]=t.widget.extend({},this.options[i]),a=0;n.length-1>a;a++)o[n[a]]=o[n[a]]||{},o=o[n[a]];if(i=n.pop(),s===e)return o[i]===e?null:o[i];o[i]=s}else{if(s===e)return this.options[i]===e?null:this.options[i];r[i]=s}return this._setOptions(r),this},_setOptions:function(t){var e;for(e in t)this._setOption(e,t[e]);return this},_setOption:function(t,e){return this.options[t]=e,"disabled"===t&&(this.widget().toggleClass(this.widgetFullName+"-disabled ui-state-disabled",!!e).attr("aria-disabled",e),this.hoverable.removeClass("ui-state-hover"),this.focusable.removeClass("ui-state-focus")),this},enable:function(){return this._setOption("disabled",!1)},disable:function(){return this._setOption("disabled",!0)},_on:function(i,s,n){var o,a=this;"boolean"!=typeof i&&(n=s,s=i,i=!1),n?(s=o=t(s),this.bindings=this.bindings.add(s)):(n=s,s=this.element,o=this.widget()),t.each(n,function(n,r){function h(){return i||a.options.disabled!==!0&&!t(this).hasClass("ui-state-disabled")?("string"==typeof r?a[r]:r).apply(a,arguments):e}"string"!=typeof r&&(h.guid=r.guid=r.guid||h.guid||t.guid++);var l=n.match(/^(\w+)\s*(.*)$/),c=l[1]+a.eventNamespace,u=l[2];u?o.delegate(u,c,h):s.bind(c,h)})},_off:function(t,e){e=(e||"").split(" ").join(this.eventNamespace+" ")+this.eventNamespace,t.unbind(e).undelegate(e)},_delay:function(t,e){function i(){return("string"==typeof t?s[t]:t).apply(s,arguments)}var s=this;return setTimeout(i,e||0)},_hoverable:function(e){this.hoverable=this.hoverable.add(e),this._on(e,{mouseenter:function(e){t(e.currentTarget).addClass("ui-state-hover")},mouseleave:function(e){t(e.currentTarget).removeClass("ui-state-hover")}})},_focusable:function(e){this.focusable=this.focusable.add(e),this._on(e,{focusin:function(e){t(e.currentTarget).addClass("ui-state-focus")},focusout:function(e){t(e.currentTarget).removeClass("ui-state-focus")}})},_trigger:function(e,i,s){var n,o,a=this.options[e];if(s=s||{},i=t.Event(i),i.type=(e===this.widgetEventPrefix?e:this.widgetEventPrefix+e).toLowerCase(),i.target=this.element[0],o=i.originalEvent)for(n in o)n in i||(i[n]=o[n]);return this.element.trigger(i,s),!(t.isFunction(a)&&a.apply(this.element[0],[i].concat(s))===!1||i.isDefaultPrevented())}},t.each({show:"fadeIn",hide:"fadeOut"},function(e,i){t.Widget.prototype["_"+e]=function(s,n,o){"string"==typeof n&&(n={effect:n});var a,r=n?n===!0||"number"==typeof n?i:n.effect||i:e;n=n||{},"number"==typeof n&&(n={duration:n}),a=!t.isEmptyObject(n),n.complete=o,n.delay&&s.delay(n.delay),a&&t.effects&&(t.effects.effect[r]||t.uiBackCompat!==!1&&t.effects[r])?s[e](n):r!==e&&s[r]?s[r](n.duration,n.easing,o):s.queue(function(i){t(this)[e](),o&&o.call(s[0]),i()})}}),t.uiBackCompat!==!1&&(t.Widget.prototype._getCreateOptions=function(){return t.metadata&&t.metadata.get(this.element[0])[this.widgetName]})})(jQuery);(function(t){var e=!1;t(document).mouseup(function(){e=!1}),t.widget("ui.mouse",{version:"1.9.2",options:{cancel:"input,textarea,button,select,option",distance:1,delay:0},_mouseInit:function(){var e=this;this.element.bind("mousedown."+this.widgetName,function(t){return e._mouseDown(t)}).bind("click."+this.widgetName,function(i){return!0===t.data(i.target,e.widgetName+".preventClickEvent")?(t.removeData(i.target,e.widgetName+".preventClickEvent"),i.stopImmediatePropagation(),!1):undefined}),this.started=!1},_mouseDestroy:function(){this.element.unbind("."+this.widgetName),this._mouseMoveDelegate&&t(document).unbind("mousemove."+this.widgetName,this._mouseMoveDelegate).unbind("mouseup."+this.widgetName,this._mouseUpDelegate)},_mouseDown:function(i){if(!e){this._mouseStarted&&this._mouseUp(i),this._mouseDownEvent=i;var s=this,n=1===i.which,o="string"==typeof this.options.cancel&&i.target.nodeName?t(i.target).closest(this.options.cancel).length:!1;return n&&!o&&this._mouseCapture(i)?(this.mouseDelayMet=!this.options.delay,this.mouseDelayMet||(this._mouseDelayTimer=setTimeout(function(){s.mouseDelayMet=!0},this.options.delay)),this._mouseDistanceMet(i)&&this._mouseDelayMet(i)&&(this._mouseStarted=this._mouseStart(i)!==!1,!this._mouseStarted)?(i.preventDefault(),!0):(!0===t.data(i.target,this.widgetName+".preventClickEvent")&&t.removeData(i.target,this.widgetName+".preventClickEvent"),this._mouseMoveDelegate=function(t){return s._mouseMove(t)},this._mouseUpDelegate=function(t){return s._mouseUp(t)},t(document).bind("mousemove."+this.widgetName,this._mouseMoveDelegate).bind("mouseup."+this.widgetName,this._mouseUpDelegate),i.preventDefault(),e=!0,!0)):!0}},_mouseMove:function(e){return!t.ui.ie||document.documentMode>=9||e.button?this._mouseStarted?(this._mouseDrag(e),e.preventDefault()):(this._mouseDistanceMet(e)&&this._mouseDelayMet(e)&&(this._mouseStarted=this._mouseStart(this._mouseDownEvent,e)!==!1,this._mouseStarted?this._mouseDrag(e):this._mouseUp(e)),!this._mouseStarted):this._mouseUp(e)},_mouseUp:function(e){return t(document).unbind("mousemove."+this.widgetName,this._mouseMoveDelegate).unbind("mouseup."+this.widgetName,this._mouseUpDelegate),this._mouseStarted&&(this._mouseStarted=!1,e.target===this._mouseDownEvent.target&&t.data(e.target,this.widgetName+".preventClickEvent",!0),this._mouseStop(e)),!1},_mouseDistanceMet:function(t){return Math.max(Math.abs(this._mouseDownEvent.pageX-t.pageX),Math.abs(this._mouseDownEvent.pageY-t.pageY))>=this.options.distance},_mouseDelayMet:function(){return this.mouseDelayMet},_mouseStart:function(){},_mouseDrag:function(){},_mouseStop:function(){},_mouseCapture:function(){return!0}})})(jQuery);(function(t,e){function i(t,e,i){return[parseInt(t[0],10)*(d.test(t[0])?e/100:1),parseInt(t[1],10)*(d.test(t[1])?i/100:1)]}function s(e,i){return parseInt(t.css(e,i),10)||0}t.ui=t.ui||{};var n,o=Math.max,a=Math.abs,r=Math.round,h=/left|center|right/,l=/top|center|bottom/,c=/[\+\-]\d+%?/,u=/^\w+/,d=/%$/,p=t.fn.position;t.position={scrollbarWidth:function(){if(n!==e)return n;var i,s,o=t("<div style='display:block;width:50px;height:50px;overflow:hidden;'><div style='height:100px;width:auto;'></div></div>"),a=o.children()[0];return t("body").append(o),i=a.offsetWidth,o.css("overflow","scroll"),s=a.offsetWidth,i===s&&(s=o[0].clientWidth),o.remove(),n=i-s},getScrollInfo:function(e){var i=e.isWindow?"":e.element.css("overflow-x"),s=e.isWindow?"":e.element.css("overflow-y"),n="scroll"===i||"auto"===i&&e.width<e.element[0].scrollWidth,o="scroll"===s||"auto"===s&&e.height<e.element[0].scrollHeight;return{width:n?t.position.scrollbarWidth():0,height:o?t.position.scrollbarWidth():0}},getWithinInfo:function(e){var i=t(e||window),s=t.isWindow(i[0]);return{element:i,isWindow:s,offset:i.offset()||{left:0,top:0},scrollLeft:i.scrollLeft(),scrollTop:i.scrollTop(),width:s?i.width():i.outerWidth(),height:s?i.height():i.outerHeight()}}},t.fn.position=function(e){if(!e||!e.of)return p.apply(this,arguments);e=t.extend({},e);var n,d,f,m,g,v=t(e.of),_=t.position.getWithinInfo(e.within),b=t.position.getScrollInfo(_),y=v[0],w=(e.collision||"flip").split(" "),x={};return 9===y.nodeType?(d=v.width(),f=v.height(),m={top:0,left:0}):t.isWindow(y)?(d=v.width(),f=v.height(),m={top:v.scrollTop(),left:v.scrollLeft()}):y.preventDefault?(e.at="left top",d=f=0,m={top:y.pageY,left:y.pageX}):(d=v.outerWidth(),f=v.outerHeight(),m=v.offset()),g=t.extend({},m),t.each(["my","at"],function(){var t,i,s=(e[this]||"").split(" ");1===s.length&&(s=h.test(s[0])?s.concat(["center"]):l.test(s[0])?["center"].concat(s):["center","center"]),s[0]=h.test(s[0])?s[0]:"center",s[1]=l.test(s[1])?s[1]:"center",t=c.exec(s[0]),i=c.exec(s[1]),x[this]=[t?t[0]:0,i?i[0]:0],e[this]=[u.exec(s[0])[0],u.exec(s[1])[0]]}),1===w.length&&(w[1]=w[0]),"right"===e.at[0]?g.left+=d:"center"===e.at[0]&&(g.left+=d/2),"bottom"===e.at[1]?g.top+=f:"center"===e.at[1]&&(g.top+=f/2),n=i(x.at,d,f),g.left+=n[0],g.top+=n[1],this.each(function(){var h,l,c=t(this),u=c.outerWidth(),p=c.outerHeight(),y=s(this,"marginLeft"),k=s(this,"marginTop"),D=u+y+s(this,"marginRight")+b.width,C=p+k+s(this,"marginBottom")+b.height,T=t.extend({},g),M=i(x.my,c.outerWidth(),c.outerHeight());"right"===e.my[0]?T.left-=u:"center"===e.my[0]&&(T.left-=u/2),"bottom"===e.my[1]?T.top-=p:"center"===e.my[1]&&(T.top-=p/2),T.left+=M[0],T.top+=M[1],t.support.offsetFractions||(T.left=r(T.left),T.top=r(T.top)),h={marginLeft:y,marginTop:k},t.each(["left","top"],function(i,s){t.ui.position[w[i]]&&t.ui.position[w[i]][s](T,{targetWidth:d,targetHeight:f,elemWidth:u,elemHeight:p,collisionPosition:h,collisionWidth:D,collisionHeight:C,offset:[n[0]+M[0],n[1]+M[1]],my:e.my,at:e.at,within:_,elem:c})}),t.fn.bgiframe&&c.bgiframe(),e.using&&(l=function(t){var i=m.left-T.left,s=i+d-u,n=m.top-T.top,r=n+f-p,h={target:{element:v,left:m.left,top:m.top,width:d,height:f},element:{element:c,left:T.left,top:T.top,width:u,height:p},horizontal:0>s?"left":i>0?"right":"center",vertical:0>r?"top":n>0?"bottom":"middle"};u>d&&d>a(i+s)&&(h.horizontal="center"),p>f&&f>a(n+r)&&(h.vertical="middle"),h.important=o(a(i),a(s))>o(a(n),a(r))?"horizontal":"vertical",e.using.call(this,t,h)}),c.offset(t.extend(T,{using:l}))})},t.ui.position={fit:{left:function(t,e){var i,s=e.within,n=s.isWindow?s.scrollLeft:s.offset.left,a=s.width,r=t.left-e.collisionPosition.marginLeft,h=n-r,l=r+e.collisionWidth-a-n;e.collisionWidth>a?h>0&&0>=l?(i=t.left+h+e.collisionWidth-a-n,t.left+=h-i):t.left=l>0&&0>=h?n:h>l?n+a-e.collisionWidth:n:h>0?t.left+=h:l>0?t.left-=l:t.left=o(t.left-r,t.left)},top:function(t,e){var i,s=e.within,n=s.isWindow?s.scrollTop:s.offset.top,a=e.within.height,r=t.top-e.collisionPosition.marginTop,h=n-r,l=r+e.collisionHeight-a-n;e.collisionHeight>a?h>0&&0>=l?(i=t.top+h+e.collisionHeight-a-n,t.top+=h-i):t.top=l>0&&0>=h?n:h>l?n+a-e.collisionHeight:n:h>0?t.top+=h:l>0?t.top-=l:t.top=o(t.top-r,t.top)}},flip:{left:function(t,e){var i,s,n=e.within,o=n.offset.left+n.scrollLeft,r=n.width,h=n.isWindow?n.scrollLeft:n.offset.left,l=t.left-e.collisionPosition.marginLeft,c=l-h,u=l+e.collisionWidth-r-h,d="left"===e.my[0]?-e.elemWidth:"right"===e.my[0]?e.elemWidth:0,p="left"===e.at[0]?e.targetWidth:"right"===e.at[0]?-e.targetWidth:0,f=-2*e.offset[0];0>c?(i=t.left+d+p+f+e.collisionWidth-r-o,(0>i||a(c)>i)&&(t.left+=d+p+f)):u>0&&(s=t.left-e.collisionPosition.marginLeft+d+p+f-h,(s>0||u>a(s))&&(t.left+=d+p+f))},top:function(t,e){var i,s,n=e.within,o=n.offset.top+n.scrollTop,r=n.height,h=n.isWindow?n.scrollTop:n.offset.top,l=t.top-e.collisionPosition.marginTop,c=l-h,u=l+e.collisionHeight-r-h,d="top"===e.my[1],p=d?-e.elemHeight:"bottom"===e.my[1]?e.elemHeight:0,f="top"===e.at[1]?e.targetHeight:"bottom"===e.at[1]?-e.targetHeight:0,m=-2*e.offset[1];0>c?(s=t.top+p+f+m+e.collisionHeight-r-o,t.top+p+f+m>c&&(0>s||a(c)>s)&&(t.top+=p+f+m)):u>0&&(i=t.top-e.collisionPosition.marginTop+p+f+m-h,t.top+p+f+m>u&&(i>0||u>a(i))&&(t.top+=p+f+m))}},flipfit:{left:function(){t.ui.position.flip.left.apply(this,arguments),t.ui.position.fit.left.apply(this,arguments)},top:function(){t.ui.position.flip.top.apply(this,arguments),t.ui.position.fit.top.apply(this,arguments)}}},function(){var e,i,s,n,o,a=document.getElementsByTagName("body")[0],r=document.createElement("div");e=document.createElement(a?"div":"body"),s={visibility:"hidden",width:0,height:0,border:0,margin:0,background:"none"},a&&t.extend(s,{position:"absolute",left:"-1000px",top:"-1000px"});for(o in s)e.style[o]=s[o];e.appendChild(r),i=a||document.documentElement,i.insertBefore(e,i.firstChild),r.style.cssText="position: absolute; left: 10.7432222px;",n=t(r).offset().left,t.support.offsetFractions=n>10&&11>n,e.innerHTML="",i.removeChild(e)}(),t.uiBackCompat!==!1&&function(t){var i=t.fn.position;t.fn.position=function(s){if(!s||!s.offset)return i.call(this,s);var n=s.offset.split(" "),o=s.at.split(" ");return 1===n.length&&(n[1]=n[0]),/^\d/.test(n[0])&&(n[0]="+"+n[0]),/^\d/.test(n[1])&&(n[1]="+"+n[1]),1===o.length&&(/left|center|right/.test(o[0])?o[1]="center":(o[1]=o[0],o[0]="center")),i.call(this,t.extend(s,{at:o[0]+n[0]+" "+o[1]+n[1],offset:e}))}}(jQuery)})(jQuery);(function(t){var e=0;t.widget("ui.autocomplete",{version:"1.9.2",defaultElement:"<input>",options:{appendTo:"body",autoFocus:!1,delay:300,minLength:1,position:{my:"left top",at:"left bottom",collision:"none"},source:null,change:null,close:null,focus:null,open:null,response:null,search:null,select:null},pending:0,_create:function(){var e,i,s;this.isMultiLine=this._isMultiLine(),this.valueMethod=this.element[this.element.is("input,textarea")?"val":"text"],this.isNewMenu=!0,this.element.addClass("ui-autocomplete-input").attr("autocomplete","off"),this._on(this.element,{keydown:function(n){if(this.element.prop("readOnly"))return e=!0,s=!0,i=!0,undefined;e=!1,s=!1,i=!1;var o=t.ui.keyCode;switch(n.keyCode){case o.PAGE_UP:e=!0,this._move("previousPage",n);break;case o.PAGE_DOWN:e=!0,this._move("nextPage",n);break;case o.UP:e=!0,this._keyEvent("previous",n);break;case o.DOWN:e=!0,this._keyEvent("next",n);break;case o.ENTER:case o.NUMPAD_ENTER:this.menu.active&&(e=!0,n.preventDefault(),this.menu.select(n));break;case o.TAB:this.menu.active&&this.menu.select(n);break;case o.ESCAPE:this.menu.element.is(":visible")&&(this._value(this.term),this.close(n),n.preventDefault());break;default:i=!0,this._searchTimeout(n)}},keypress:function(s){if(e)return e=!1,s.preventDefault(),undefined;if(!i){var n=t.ui.keyCode;switch(s.keyCode){case n.PAGE_UP:this._move("previousPage",s);break;case n.PAGE_DOWN:this._move("nextPage",s);break;case n.UP:this._keyEvent("previous",s);break;case n.DOWN:this._keyEvent("next",s)}}},input:function(t){return s?(s=!1,t.preventDefault(),undefined):(this._searchTimeout(t),undefined)},focus:function(){this.selectedItem=null,this.previous=this._value()},blur:function(t){return this.cancelBlur?(delete this.cancelBlur,undefined):(clearTimeout(this.searching),this.close(t),this._change(t),undefined)}}),this._initSource(),this.menu=t("<ul>").addClass("ui-autocomplete").appendTo(this.document.find(this.options.appendTo||"body")[0]).menu({input:t(),role:null}).zIndex(this.element.zIndex()+1).hide().data("menu"),this._on(this.menu.element,{mousedown:function(e){e.preventDefault(),this.cancelBlur=!0,this._delay(function(){delete this.cancelBlur});var i=this.menu.element[0];t(e.target).closest(".ui-menu-item").length||this._delay(function(){var e=this;this.document.one("mousedown",function(s){s.target===e.element[0]||s.target===i||t.contains(i,s.target)||e.close()})})},menufocus:function(e,i){if(this.isNewMenu&&(this.isNewMenu=!1,e.originalEvent&&/^mouse/.test(e.originalEvent.type)))return this.menu.blur(),this.document.one("mousemove",function(){t(e.target).trigger(e.originalEvent)}),undefined;var s=i.item.data("ui-autocomplete-item")||i.item.data("item.autocomplete");!1!==this._trigger("focus",e,{item:s})?e.originalEvent&&/^key/.test(e.originalEvent.type)&&this._value(s.value):this.liveRegion.text(s.value)},menuselect:function(t,e){var i=e.item.data("ui-autocomplete-item")||e.item.data("item.autocomplete"),s=this.previous;this.element[0]!==this.document[0].activeElement&&(this.element.focus(),this.previous=s,this._delay(function(){this.previous=s,this.selectedItem=i})),!1!==this._trigger("select",t,{item:i})&&this._value(i.value),this.term=this._value(),this.close(t),this.selectedItem=i}}),this.liveRegion=t("<span>",{role:"status","aria-live":"polite"}).addClass("ui-helper-hidden-accessible").insertAfter(this.element),t.fn.bgiframe&&this.menu.element.bgiframe(),this._on(this.window,{beforeunload:function(){this.element.removeAttr("autocomplete")}})},_destroy:function(){clearTimeout(this.searching),this.element.removeClass("ui-autocomplete-input").removeAttr("autocomplete"),this.menu.element.remove(),this.liveRegion.remove()},_setOption:function(t,e){this._super(t,e),"source"===t&&this._initSource(),"appendTo"===t&&this.menu.element.appendTo(this.document.find(e||"body")[0]),"disabled"===t&&e&&this.xhr&&this.xhr.abort()},_isMultiLine:function(){return this.element.is("textarea")?!0:this.element.is("input")?!1:this.element.prop("isContentEditable")},_initSource:function(){var e,i,s=this;t.isArray(this.options.source)?(e=this.options.source,this.source=function(i,s){s(t.ui.autocomplete.filter(e,i.term))}):"string"==typeof this.options.source?(i=this.options.source,this.source=function(e,n){s.xhr&&s.xhr.abort(),s.xhr=t.ajax({url:i,data:e,dataType:"json",success:function(t){n(t)},error:function(){n([])}})}):this.source=this.options.source},_searchTimeout:function(t){clearTimeout(this.searching),this.searching=this._delay(function(){this.term!==this._value()&&(this.selectedItem=null,this.search(null,t))},this.options.delay)},search:function(t,e){return t=null!=t?t:this._value(),this.term=this._value(),t.length<this.options.minLength?this.close(e):this._trigger("search",e)!==!1?this._search(t):undefined},_search:function(t){this.pending++,this.element.addClass("ui-autocomplete-loading"),this.cancelSearch=!1,this.source({term:t},this._response())},_response:function(){var t=this,i=++e;return function(s){i===e&&t.__response(s),t.pending--,t.pending||t.element.removeClass("ui-autocomplete-loading")}},__response:function(t){t&&(t=this._normalize(t)),this._trigger("response",null,{content:t}),!this.options.disabled&&t&&t.length&&!this.cancelSearch?(this._suggest(t),this._trigger("open")):this._close()},close:function(t){this.cancelSearch=!0,this._close(t)},_close:function(t){this.menu.element.is(":visible")&&(this.menu.element.hide(),this.menu.blur(),this.isNewMenu=!0,this._trigger("close",t))},_change:function(t){this.previous!==this._value()&&this._trigger("change",t,{item:this.selectedItem})},_normalize:function(e){return e.length&&e[0].label&&e[0].value?e:t.map(e,function(e){return"string"==typeof e?{label:e,value:e}:t.extend({label:e.label||e.value,value:e.value||e.label},e)})},_suggest:function(e){var i=this.menu.element.empty().zIndex(this.element.zIndex()+1);this._renderMenu(i,e),this.menu.refresh(),i.show(),this._resizeMenu(),i.position(t.extend({of:this.element},this.options.position)),this.options.autoFocus&&this.menu.next()},_resizeMenu:function(){var t=this.menu.element;t.outerWidth(Math.max(t.width("").outerWidth()+1,this.element.outerWidth()))},_renderMenu:function(e,i){var s=this;t.each(i,function(t,i){s._renderItemData(e,i)})},_renderItemData:function(t,e){return this._renderItem(t,e).data("ui-autocomplete-item",e)},_renderItem:function(e,i){return t("<li>").append(t("<a>").text(i.label)).appendTo(e)},_move:function(t,e){return this.menu.element.is(":visible")?this.menu.isFirstItem()&&/^previous/.test(t)||this.menu.isLastItem()&&/^next/.test(t)?(this._value(this.term),this.menu.blur(),undefined):(this.menu[t](e),undefined):(this.search(null,e),undefined)},widget:function(){return this.menu.element},_value:function(){return this.valueMethod.apply(this.element,arguments)},_keyEvent:function(t,e){(!this.isMultiLine||this.menu.element.is(":visible"))&&(this._move(t,e),e.preventDefault())}}),t.extend(t.ui.autocomplete,{escapeRegex:function(t){return t.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g,"\\$&")},filter:function(e,i){var s=RegExp(t.ui.autocomplete.escapeRegex(i),"i");return t.grep(e,function(t){return s.test(t.label||t.value||t)})}}),t.widget("ui.autocomplete",t.ui.autocomplete,{options:{messages:{noResults:"No search results.",results:function(t){return t+(t>1?" results are":" result is")+" available, use up and down arrow keys to navigate."}}},__response:function(t){var e;this._superApply(arguments),this.options.disabled||this.cancelSearch||(e=t&&t.length?this.options.messages.results(t.length):this.options.messages.noResults,this.liveRegion.text(e))}})})(jQuery);(function(t){var e=!1;t.widget("ui.menu",{version:"1.9.2",defaultElement:"<ul>",delay:300,options:{icons:{submenu:"ui-icon-carat-1-e"},menus:"ul",position:{my:"left top",at:"right top"},role:"menu",blur:null,focus:null,select:null},_create:function(){this.activeMenu=this.element,this.element.uniqueId().addClass("ui-menu ui-widget ui-widget-content ui-corner-all").toggleClass("ui-menu-icons",!!this.element.find(".ui-icon").length).attr({role:this.options.role,tabIndex:0}).bind("click"+this.eventNamespace,t.proxy(function(t){this.options.disabled&&t.preventDefault()},this)),this.options.disabled&&this.element.addClass("ui-state-disabled").attr("aria-disabled","true"),this._on({"mousedown .ui-menu-item > a":function(t){t.preventDefault()},"click .ui-state-disabled > a":function(t){t.preventDefault()},"click .ui-menu-item:has(a)":function(i){var s=t(i.target).closest(".ui-menu-item");!e&&s.not(".ui-state-disabled").length&&(e=!0,this.select(i),s.has(".ui-menu").length?this.expand(i):this.element.is(":focus")||(this.element.trigger("focus",[!0]),this.active&&1===this.active.parents(".ui-menu").length&&clearTimeout(this.timer)))},"mouseenter .ui-menu-item":function(e){var i=t(e.currentTarget);i.siblings().children(".ui-state-active").removeClass("ui-state-active"),this.focus(e,i)},mouseleave:"collapseAll","mouseleave .ui-menu":"collapseAll",focus:function(t,e){var i=this.active||this.element.children(".ui-menu-item").eq(0);e||this.focus(t,i)},blur:function(e){this._delay(function(){t.contains(this.element[0],this.document[0].activeElement)||this.collapseAll(e)})},keydown:"_keydown"}),this.refresh(),this._on(this.document,{click:function(i){t(i.target).closest(".ui-menu").length||this.collapseAll(i),e=!1}})},_destroy:function(){this.element.removeAttr("aria-activedescendant").find(".ui-menu").andSelf().removeClass("ui-menu ui-widget ui-widget-content ui-corner-all ui-menu-icons").removeAttr("role").removeAttr("tabIndex").removeAttr("aria-labelledby").removeAttr("aria-expanded").removeAttr("aria-hidden").removeAttr("aria-disabled").removeUniqueId().show(),this.element.find(".ui-menu-item").removeClass("ui-menu-item").removeAttr("role").removeAttr("aria-disabled").children("a").removeUniqueId().removeClass("ui-corner-all ui-state-hover").removeAttr("tabIndex").removeAttr("role").removeAttr("aria-haspopup").children().each(function(){var e=t(this);e.data("ui-menu-submenu-carat")&&e.remove()}),this.element.find(".ui-menu-divider").removeClass("ui-menu-divider ui-widget-content")},_keydown:function(e){function i(t){return t.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g,"\\$&")}var s,n,o,a,r,h=!0;switch(e.keyCode){case t.ui.keyCode.PAGE_UP:this.previousPage(e);break;case t.ui.keyCode.PAGE_DOWN:this.nextPage(e);break;case t.ui.keyCode.HOME:this._move("first","first",e);break;case t.ui.keyCode.END:this._move("last","last",e);break;case t.ui.keyCode.UP:this.previous(e);break;case t.ui.keyCode.DOWN:this.next(e);break;case t.ui.keyCode.LEFT:this.collapse(e);break;case t.ui.keyCode.RIGHT:this.active&&!this.active.is(".ui-state-disabled")&&this.expand(e);break;case t.ui.keyCode.ENTER:case t.ui.keyCode.SPACE:this._activate(e);break;case t.ui.keyCode.ESCAPE:this.collapse(e);break;default:h=!1,n=this.previousFilter||"",o=String.fromCharCode(e.keyCode),a=!1,clearTimeout(this.filterTimer),o===n?a=!0:o=n+o,r=RegExp("^"+i(o),"i"),s=this.activeMenu.children(".ui-menu-item").filter(function(){return r.test(t(this).children("a").text())}),s=a&&-1!==s.index(this.active.next())?this.active.nextAll(".ui-menu-item"):s,s.length||(o=String.fromCharCode(e.keyCode),r=RegExp("^"+i(o),"i"),s=this.activeMenu.children(".ui-menu-item").filter(function(){return r.test(t(this).children("a").text())})),s.length?(this.focus(e,s),s.length>1?(this.previousFilter=o,this.filterTimer=this._delay(function(){delete this.previousFilter},1e3)):delete this.previousFilter):delete this.previousFilter}h&&e.preventDefault()},_activate:function(t){this.active.is(".ui-state-disabled")||(this.active.children("a[aria-haspopup='true']").length?this.expand(t):this.select(t))},refresh:function(){var e,i=this.options.icons.submenu,s=this.element.find(this.options.menus);s.filter(":not(.ui-menu)").addClass("ui-menu ui-widget ui-widget-content ui-corner-all").hide().attr({role:this.options.role,"aria-hidden":"true","aria-expanded":"false"}).each(function(){var e=t(this),s=e.prev("a"),n=t("<span>").addClass("ui-menu-icon ui-icon "+i).data("ui-menu-submenu-carat",!0);s.attr("aria-haspopup","true").prepend(n),e.attr("aria-labelledby",s.attr("id"))}),e=s.add(this.element),e.children(":not(.ui-menu-item):has(a)").addClass("ui-menu-item").attr("role","presentation").children("a").uniqueId().addClass("ui-corner-all").attr({tabIndex:-1,role:this._itemRole()}),e.children(":not(.ui-menu-item)").each(function(){var e=t(this);/[^\-—–\s]/.test(e.text())||e.addClass("ui-widget-content ui-menu-divider")}),e.children(".ui-state-disabled").attr("aria-disabled","true"),this.active&&!t.contains(this.element[0],this.active[0])&&this.blur()},_itemRole:function(){return{menu:"menuitem",listbox:"option"}[this.options.role]},focus:function(t,e){var i,s;this.blur(t,t&&"focus"===t.type),this._scrollIntoView(e),this.active=e.first(),s=this.active.children("a").addClass("ui-state-focus"),this.options.role&&this.element.attr("aria-activedescendant",s.attr("id")),this.active.parent().closest(".ui-menu-item").children("a:first").addClass("ui-state-active"),t&&"keydown"===t.type?this._close():this.timer=this._delay(function(){this._close()},this.delay),i=e.children(".ui-menu"),i.length&&/^mouse/.test(t.type)&&this._startOpening(i),this.activeMenu=e.parent(),this._trigger("focus",t,{item:e})},_scrollIntoView:function(e){var i,s,n,o,a,r;this._hasScroll()&&(i=parseFloat(t.css(this.activeMenu[0],"borderTopWidth"))||0,s=parseFloat(t.css(this.activeMenu[0],"paddingTop"))||0,n=e.offset().top-this.activeMenu.offset().top-i-s,o=this.activeMenu.scrollTop(),a=this.activeMenu.height(),r=e.height(),0>n?this.activeMenu.scrollTop(o+n):n+r>a&&this.activeMenu.scrollTop(o+n-a+r))},blur:function(t,e){e||clearTimeout(this.timer),this.active&&(this.active.children("a").removeClass("ui-state-focus"),this.active=null,this._trigger("blur",t,{item:this.active}))},_startOpening:function(t){clearTimeout(this.timer),"true"===t.attr("aria-hidden")&&(this.timer=this._delay(function(){this._close(),this._open(t)},this.delay))},_open:function(e){var i=t.extend({of:this.active},this.options.position);clearTimeout(this.timer),this.element.find(".ui-menu").not(e.parents(".ui-menu")).hide().attr("aria-hidden","true"),e.show().removeAttr("aria-hidden").attr("aria-expanded","true").position(i)},collapseAll:function(e,i){clearTimeout(this.timer),this.timer=this._delay(function(){var s=i?this.element:t(e&&e.target).closest(this.element.find(".ui-menu"));s.length||(s=this.element),this._close(s),this.blur(e),this.activeMenu=s},this.delay)},_close:function(t){t||(t=this.active?this.active.parent():this.element),t.find(".ui-menu").hide().attr("aria-hidden","true").attr("aria-expanded","false").end().find("a.ui-state-active").removeClass("ui-state-active")},collapse:function(t){var e=this.active&&this.active.parent().closest(".ui-menu-item",this.element);e&&e.length&&(this._close(),this.focus(t,e))},expand:function(t){var e=this.active&&this.active.children(".ui-menu ").children(".ui-menu-item").first();e&&e.length&&(this._open(e.parent()),this._delay(function(){this.focus(t,e)}))},next:function(t){this._move("next","first",t)},previous:function(t){this._move("prev","last",t)},isFirstItem:function(){return this.active&&!this.active.prevAll(".ui-menu-item").length},isLastItem:function(){return this.active&&!this.active.nextAll(".ui-menu-item").length},_move:function(t,e,i){var s;this.active&&(s="first"===t||"last"===t?this.active["first"===t?"prevAll":"nextAll"](".ui-menu-item").eq(-1):this.active[t+"All"](".ui-menu-item").eq(0)),s&&s.length&&this.active||(s=this.activeMenu.children(".ui-menu-item")[e]()),this.focus(i,s)},nextPage:function(e){var i,s,n;return this.active?(this.isLastItem()||(this._hasScroll()?(s=this.active.offset().top,n=this.element.height(),this.active.nextAll(".ui-menu-item").each(function(){return i=t(this),0>i.offset().top-s-n}),this.focus(e,i)):this.focus(e,this.activeMenu.children(".ui-menu-item")[this.active?"last":"first"]())),undefined):(this.next(e),undefined)},previousPage:function(e){var i,s,n;return this.active?(this.isFirstItem()||(this._hasScroll()?(s=this.active.offset().top,n=this.element.height(),this.active.prevAll(".ui-menu-item").each(function(){return i=t(this),i.offset().top-s+n>0}),this.focus(e,i)):this.focus(e,this.activeMenu.children(".ui-menu-item").first())),undefined):(this.next(e),undefined)},_hasScroll:function(){return this.element.outerHeight()<this.element.prop("scrollHeight")},select:function(e){this.active=this.active||t(e.target).closest(".ui-menu-item");var i={item:this.active};this.active.has(".ui-menu").length||this.collapseAll(e,!0),this._trigger("select",e,i)}})})(jQuery);(function(t){var e=5;t.widget("ui.slider",t.ui.mouse,{version:"1.9.2",widgetEventPrefix:"slide",options:{animate:!1,distance:0,max:100,min:0,orientation:"horizontal",range:!1,step:1,value:0,values:null},_create:function(){var i,s,n=this.options,o=this.element.find(".ui-slider-handle").addClass("ui-state-default ui-corner-all"),a="<a class='ui-slider-handle ui-state-default ui-corner-all' href='#'></a>",r=[];for(this._keySliding=!1,this._mouseSliding=!1,this._animateOff=!0,this._handleIndex=null,this._detectOrientation(),this._mouseInit(),this.element.addClass("ui-slider ui-slider-"+this.orientation+" ui-widget"+" ui-widget-content"+" ui-corner-all"+(n.disabled?" ui-slider-disabled ui-disabled":"")),this.range=t([]),n.range&&(n.range===!0&&(n.values||(n.values=[this._valueMin(),this._valueMin()]),n.values.length&&2!==n.values.length&&(n.values=[n.values[0],n.values[0]])),this.range=t("<div></div>").appendTo(this.element).addClass("ui-slider-range ui-widget-header"+("min"===n.range||"max"===n.range?" ui-slider-range-"+n.range:""))),s=n.values&&n.values.length||1,i=o.length;s>i;i++)r.push(a);this.handles=o.add(t(r.join("")).appendTo(this.element)),this.handle=this.handles.eq(0),this.handles.add(this.range).filter("a").click(function(t){t.preventDefault()}).mouseenter(function(){n.disabled||t(this).addClass("ui-state-hover")}).mouseleave(function(){t(this).removeClass("ui-state-hover")}).focus(function(){n.disabled?t(this).blur():(t(".ui-slider .ui-state-focus").removeClass("ui-state-focus"),t(this).addClass("ui-state-focus"))}).blur(function(){t(this).removeClass("ui-state-focus")}),this.handles.each(function(e){t(this).data("ui-slider-handle-index",e)}),this._on(this.handles,{keydown:function(i){var s,n,o,a,r=t(i.target).data("ui-slider-handle-index");switch(i.keyCode){case t.ui.keyCode.HOME:case t.ui.keyCode.END:case t.ui.keyCode.PAGE_UP:case t.ui.keyCode.PAGE_DOWN:case t.ui.keyCode.UP:case t.ui.keyCode.RIGHT:case t.ui.keyCode.DOWN:case t.ui.keyCode.LEFT:if(i.preventDefault(),!this._keySliding&&(this._keySliding=!0,t(i.target).addClass("ui-state-active"),s=this._start(i,r),s===!1))return}switch(a=this.options.step,n=o=this.options.values&&this.options.values.length?this.values(r):this.value(),i.keyCode){case t.ui.keyCode.HOME:o=this._valueMin();break;case t.ui.keyCode.END:o=this._valueMax();break;case t.ui.keyCode.PAGE_UP:o=this._trimAlignValue(n+(this._valueMax()-this._valueMin())/e);break;case t.ui.keyCode.PAGE_DOWN:o=this._trimAlignValue(n-(this._valueMax()-this._valueMin())/e);break;case t.ui.keyCode.UP:case t.ui.keyCode.RIGHT:if(n===this._valueMax())return;o=this._trimAlignValue(n+a);break;case t.ui.keyCode.DOWN:case t.ui.keyCode.LEFT:if(n===this._valueMin())return;o=this._trimAlignValue(n-a)}this._slide(i,r,o)},keyup:function(e){var i=t(e.target).data("ui-slider-handle-index");this._keySliding&&(this._keySliding=!1,this._stop(e,i),this._change(e,i),t(e.target).removeClass("ui-state-active"))}}),this._refreshValue(),this._animateOff=!1},_destroy:function(){this.handles.remove(),this.range.remove(),this.element.removeClass("ui-slider ui-slider-horizontal ui-slider-vertical ui-slider-disabled ui-widget ui-widget-content ui-corner-all"),this._mouseDestroy()},_mouseCapture:function(e){var i,s,n,o,a,r,h,l,c=this,u=this.options;return u.disabled?!1:(this.elementSize={width:this.element.outerWidth(),height:this.element.outerHeight()},this.elementOffset=this.element.offset(),i={x:e.pageX,y:e.pageY},s=this._normValueFromMouse(i),n=this._valueMax()-this._valueMin()+1,this.handles.each(function(e){var i=Math.abs(s-c.values(e));n>i&&(n=i,o=t(this),a=e)}),u.range===!0&&this.values(1)===u.min&&(a+=1,o=t(this.handles[a])),r=this._start(e,a),r===!1?!1:(this._mouseSliding=!0,this._handleIndex=a,o.addClass("ui-state-active").focus(),h=o.offset(),l=!t(e.target).parents().andSelf().is(".ui-slider-handle"),this._clickOffset=l?{left:0,top:0}:{left:e.pageX-h.left-o.width()/2,top:e.pageY-h.top-o.height()/2-(parseInt(o.css("borderTopWidth"),10)||0)-(parseInt(o.css("borderBottomWidth"),10)||0)+(parseInt(o.css("marginTop"),10)||0)},this.handles.hasClass("ui-state-hover")||this._slide(e,a,s),this._animateOff=!0,!0))},_mouseStart:function(){return!0},_mouseDrag:function(t){var e={x:t.pageX,y:t.pageY},i=this._normValueFromMouse(e);return this._slide(t,this._handleIndex,i),!1},_mouseStop:function(t){return this.handles.removeClass("ui-state-active"),this._mouseSliding=!1,this._stop(t,this._handleIndex),this._change(t,this._handleIndex),this._handleIndex=null,this._clickOffset=null,this._animateOff=!1,!1},_detectOrientation:function(){this.orientation="vertical"===this.options.orientation?"vertical":"horizontal"},_normValueFromMouse:function(t){var e,i,s,n,o;return"horizontal"===this.orientation?(e=this.elementSize.width,i=t.x-this.elementOffset.left-(this._clickOffset?this._clickOffset.left:0)):(e=this.elementSize.height,i=t.y-this.elementOffset.top-(this._clickOffset?this._clickOffset.top:0)),s=i/e,s>1&&(s=1),0>s&&(s=0),"vertical"===this.orientation&&(s=1-s),n=this._valueMax()-this._valueMin(),o=this._valueMin()+s*n,this._trimAlignValue(o)},_start:function(t,e){var i={handle:this.handles[e],value:this.value()};return this.options.values&&this.options.values.length&&(i.value=this.values(e),i.values=this.values()),this._trigger("start",t,i)},_slide:function(t,e,i){var s,n,o;this.options.values&&this.options.values.length?(s=this.values(e?0:1),2===this.options.values.length&&this.options.range===!0&&(0===e&&i>s||1===e&&s>i)&&(i=s),i!==this.values(e)&&(n=this.values(),n[e]=i,o=this._trigger("slide",t,{handle:this.handles[e],value:i,values:n}),s=this.values(e?0:1),o!==!1&&this.values(e,i,!0))):i!==this.value()&&(o=this._trigger("slide",t,{handle:this.handles[e],value:i}),o!==!1&&this.value(i))},_stop:function(t,e){var i={handle:this.handles[e],value:this.value()};this.options.values&&this.options.values.length&&(i.value=this.values(e),i.values=this.values()),this._trigger("stop",t,i)},_change:function(t,e){if(!this._keySliding&&!this._mouseSliding){var i={handle:this.handles[e],value:this.value()};this.options.values&&this.options.values.length&&(i.value=this.values(e),i.values=this.values()),this._trigger("change",t,i)}},value:function(t){return arguments.length?(this.options.value=this._trimAlignValue(t),this._refreshValue(),this._change(null,0),undefined):this._value()},values:function(e,i){var s,n,o;if(arguments.length>1)return this.options.values[e]=this._trimAlignValue(i),this._refreshValue(),this._change(null,e),undefined;if(!arguments.length)return this._values();if(!t.isArray(arguments[0]))return this.options.values&&this.options.values.length?this._values(e):this.value();for(s=this.options.values,n=arguments[0],o=0;s.length>o;o+=1)s[o]=this._trimAlignValue(n[o]),this._change(null,o);this._refreshValue()},_setOption:function(e,i){var s,n=0;switch(t.isArray(this.options.values)&&(n=this.options.values.length),t.Widget.prototype._setOption.apply(this,arguments),e){case"disabled":i?(this.handles.filter(".ui-state-focus").blur(),this.handles.removeClass("ui-state-hover"),this.handles.prop("disabled",!0),this.element.addClass("ui-disabled")):(this.handles.prop("disabled",!1),this.element.removeClass("ui-disabled"));break;case"orientation":this._detectOrientation(),this.element.removeClass("ui-slider-horizontal ui-slider-vertical").addClass("ui-slider-"+this.orientation),this._refreshValue();break;case"value":this._animateOff=!0,this._refreshValue(),this._change(null,0),this._animateOff=!1;break;case"values":for(this._animateOff=!0,this._refreshValue(),s=0;n>s;s+=1)this._change(null,s);this._animateOff=!1;break;case"min":case"max":this._animateOff=!0,this._refreshValue(),this._animateOff=!1}},_value:function(){var t=this.options.value;return t=this._trimAlignValue(t)},_values:function(t){var e,i,s;if(arguments.length)return e=this.options.values[t],e=this._trimAlignValue(e);for(i=this.options.values.slice(),s=0;i.length>s;s+=1)i[s]=this._trimAlignValue(i[s]);return i},_trimAlignValue:function(t){if(this._valueMin()>=t)return this._valueMin();if(t>=this._valueMax())return this._valueMax();var e=this.options.step>0?this.options.step:1,i=(t-this._valueMin())%e,s=t-i;return 2*Math.abs(i)>=e&&(s+=i>0?e:-e),parseFloat(s.toFixed(5))},_valueMin:function(){return this.options.min},_valueMax:function(){return this.options.max},_refreshValue:function(){var e,i,s,n,o,a=this.options.range,r=this.options,h=this,l=this._animateOff?!1:r.animate,c={};this.options.values&&this.options.values.length?this.handles.each(function(s){i=100*((h.values(s)-h._valueMin())/(h._valueMax()-h._valueMin())),c["horizontal"===h.orientation?"left":"bottom"]=i+"%",t(this).stop(1,1)[l?"animate":"css"](c,r.animate),h.options.range===!0&&("horizontal"===h.orientation?(0===s&&h.range.stop(1,1)[l?"animate":"css"]({left:i+"%"},r.animate),1===s&&h.range[l?"animate":"css"]({width:i-e+"%"},{queue:!1,duration:r.animate})):(0===s&&h.range.stop(1,1)[l?"animate":"css"]({bottom:i+"%"},r.animate),1===s&&h.range[l?"animate":"css"]({height:i-e+"%"},{queue:!1,duration:r.animate}))),e=i}):(s=this.value(),n=this._valueMin(),o=this._valueMax(),i=o!==n?100*((s-n)/(o-n)):0,c["horizontal"===this.orientation?"left":"bottom"]=i+"%",this.handle.stop(1,1)[l?"animate":"css"](c,r.animate),"min"===a&&"horizontal"===this.orientation&&this.range.stop(1,1)[l?"animate":"css"]({width:i+"%"},r.animate),"max"===a&&"horizontal"===this.orientation&&this.range[l?"animate":"css"]({width:100-i+"%"},{queue:!1,duration:r.animate}),"min"===a&&"vertical"===this.orientation&&this.range.stop(1,1)[l?"animate":"css"]({height:i+"%"},r.animate),"max"===a&&"vertical"===this.orientation&&this.range[l?"animate":"css"]({height:100-i+"%"},{queue:!1,duration:r.animate}))}})})(jQuery);
//     Underscore.js 1.3.0
//     (c) 2009-2012 Jeremy Ashkenas, DocumentCloud Inc.
//     Underscore is freely distributable under the MIT license.
//     Portions of Underscore are inspired or borrowed from Prototype,
//     Oliver Steele's Functional, and John Resig's Micro-Templating.
//     For all details and documentation:
//     http://documentcloud.github.com/underscore

(function() {

  // Baseline setup
  // --------------

  // Establish the root object, `window` in the browser, or `global` on the server.
  var root = this;

  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;

  // Establish the object that gets returned to break out of a loop iteration.
  var breaker = {};

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var slice            = ArrayProto.slice,
      unshift          = ArrayProto.unshift,
      toString         = ObjProto.toString,
      hasOwnProperty   = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var
    nativeForEach      = ArrayProto.forEach,
    nativeMap          = ArrayProto.map,
    nativeReduce       = ArrayProto.reduce,
    nativeReduceRight  = ArrayProto.reduceRight,
    nativeFilter       = ArrayProto.filter,
    nativeEvery        = ArrayProto.every,
    nativeSome         = ArrayProto.some,
    nativeIndexOf      = ArrayProto.indexOf,
    nativeLastIndexOf  = ArrayProto.lastIndexOf,
    nativeIsArray      = Array.isArray,
    nativeKeys         = Object.keys,
    nativeBind         = FuncProto.bind;

  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) { return new wrapper(obj); };

  // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for the old `require()` API. If we're in
  // the browser, add `_` as a global object via a string identifier,
  // for Closure Compiler "advanced" mode.
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root['_'] = _;
  }

  // Current version.
  _.VERSION = '1.3.0';

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles objects with the built-in `forEach`, arrays, and raw objects.
  // Delegates to **ECMAScript 5**'s native `forEach` if available.
  var each = _.each = _.forEach = function(obj, iterator, context) {
    if (obj == null) return;
    if (nativeForEach && obj.forEach === nativeForEach) {
      obj.forEach(iterator, context);
    } else if (obj.length === +obj.length) {
      for (var i = 0, l = obj.length; i < l; i++) {
        if (i in obj && iterator.call(context, obj[i], i, obj) === breaker) return;
      }
    } else {
      for (var key in obj) {
        if (hasOwnProperty.call(obj, key)) {
          if (iterator.call(context, obj[key], key, obj) === breaker) return;
        }
      }
    }
  };

  // Return the results of applying the iterator to each element.
  // Delegates to **ECMAScript 5**'s native `map` if available.
  _.map = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context);
    each(obj, function(value, index, list) {
      results[results.length] = iterator.call(context, value, index, list);
    });
    if (obj.length === +obj.length) results.length = obj.length;
    return results;
  };

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`. Delegates to **ECMAScript 5**'s native `reduce` if available.
  _.reduce = _.foldl = _.inject = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduce && obj.reduce === nativeReduce) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduce(iterator, memo) : obj.reduce(iterator);
    }
    each(obj, function(value, index, list) {
      if (!initial) {
        memo = value;
        initial = true;
      } else {
        memo = iterator.call(context, memo, value, index, list);
      }
    });
    if (!initial) throw new TypeError('Reduce of empty array with no initial value');
    return memo;
  };

  // The right-associative version of reduce, also known as `foldr`.
  // Delegates to **ECMAScript 5**'s native `reduceRight` if available.
  _.reduceRight = _.foldr = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduceRight && obj.reduceRight === nativeReduceRight) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduceRight(iterator, memo) : obj.reduceRight(iterator);
    }
    var reversed = _.toArray(obj).reverse();
    if (context && !initial) iterator = _.bind(iterator, context);
    return initial ? _.reduce(reversed, iterator, memo, context) : _.reduce(reversed, iterator);
  };

  // Return the first value which passes a truth test. Aliased as `detect`.
  _.find = _.detect = function(obj, iterator, context) {
    var result;
    any(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) {
        result = value;
        return true;
      }
    });
    return result;
  };

  // Return all the elements that pass a truth test.
  // Delegates to **ECMAScript 5**'s native `filter` if available.
  // Aliased as `select`.
  _.filter = _.select = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeFilter && obj.filter === nativeFilter) return obj.filter(iterator, context);
    each(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) results[results.length] = value;
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    each(obj, function(value, index, list) {
      if (!iterator.call(context, value, index, list)) results[results.length] = value;
    });
    return results;
  };

  // Determine whether all of the elements match a truth test.
  // Delegates to **ECMAScript 5**'s native `every` if available.
  // Aliased as `all`.
  _.every = _.all = function(obj, iterator, context) {
    var result = true;
    if (obj == null) return result;
    if (nativeEvery && obj.every === nativeEvery) return obj.every(iterator, context);
    each(obj, function(value, index, list) {
      if (!(result = result && iterator.call(context, value, index, list))) return breaker;
    });
    return result;
  };

  // Determine if at least one element in the object matches a truth test.
  // Delegates to **ECMAScript 5**'s native `some` if available.
  // Aliased as `any`.
  var any = _.some = _.any = function(obj, iterator, context) {
    iterator || (iterator = _.identity);
    var result = false;
    if (obj == null) return result;
    if (nativeSome && obj.some === nativeSome) return obj.some(iterator, context);
    each(obj, function(value, index, list) {
      if (result || (result = iterator.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };

  // Determine if a given value is included in the array or object using `===`.
  // Aliased as `contains`.
  _.include = _.contains = function(obj, target) {
    var found = false;
    if (obj == null) return found;
    if (nativeIndexOf && obj.indexOf === nativeIndexOf) return obj.indexOf(target) != -1;
    found = any(obj, function(value) {
      return value === target;
    });
    return found;
  };

  // Invoke a method (with arguments) on every item in a collection.
  _.invoke = function(obj, method) {
    var args = slice.call(arguments, 2);
    return _.map(obj, function(value) {
      return (_.isFunction(method) ? method || value : value[method]).apply(value, args);
    });
  };

  // Convenience version of a common use case of `map`: fetching a property.
  _.pluck = function(obj, key) {
    return _.map(obj, function(value){ return value[key]; });
  };

  // Return the maximum element or (element-based computation).
  _.max = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj)) return Math.max.apply(Math, obj);
    if (!iterator && _.isEmpty(obj)) return -Infinity;
    var result = {computed : -Infinity};
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed >= result.computed && (result = {value : value, computed : computed});
    });
    return result.value;
  };

  // Return the minimum element (or element-based computation).
  _.min = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj)) return Math.min.apply(Math, obj);
    if (!iterator && _.isEmpty(obj)) return Infinity;
    var result = {computed : Infinity};
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed < result.computed && (result = {value : value, computed : computed});
    });
    return result.value;
  };

  // Shuffle an array.
  _.shuffle = function(obj) {
    var shuffled = [], rand;
    each(obj, function(value, index, list) {
      if (index == 0) {
        shuffled[0] = value;
      } else {
        rand = Math.floor(Math.random() * (index + 1));
        shuffled[index] = shuffled[rand];
        shuffled[rand] = value;
      }
    });
    return shuffled;
  };

  // Sort the object's values by a criterion produced by an iterator.
  _.sortBy = function(obj, iterator, context) {
    return _.pluck(_.map(obj, function(value, index, list) {
      return {
        value : value,
        criteria : iterator.call(context, value, index, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria, b = right.criteria;
      return a < b ? -1 : a > b ? 1 : 0;
    }), 'value');
  };

  // Groups the object's values by a criterion. Pass either a string attribute
  // to group by, or a function that returns the criterion.
  _.groupBy = function(obj, val) {
    var result = {};
    var iterator = _.isFunction(val) ? val : function(obj) { return obj[val]; };
    each(obj, function(value, index) {
      var key = iterator(value, index);
      (result[key] || (result[key] = [])).push(value);
    });
    return result;
  };

  // Use a comparator function to figure out at what index an object should
  // be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iterator) {
    iterator || (iterator = _.identity);
    var low = 0, high = array.length;
    while (low < high) {
      var mid = (low + high) >> 1;
      iterator(array[mid]) < iterator(obj) ? low = mid + 1 : high = mid;
    }
    return low;
  };

  // Safely convert anything iterable into a real, live array.
  _.toArray = function(iterable) {
    if (!iterable)                return [];
    if (iterable.toArray)         return iterable.toArray();
    if (_.isArray(iterable))      return slice.call(iterable);
    if (_.isArguments(iterable))  return slice.call(iterable);
    return _.values(iterable);
  };

  // Return the number of elements in an object.
  _.size = function(obj) {
    return _.toArray(obj).length;
  };

  // Array Functions
  // ---------------

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head`. The **guard** check allows it to work
  // with `_.map`.
  _.first = _.head = function(array, n, guard) {
    return (n != null) && !guard ? slice.call(array, 0, n) : array[0];
  };

  // Returns everything but the last entry of the array. Especcialy useful on
  // the arguments object. Passing **n** will return all the values in
  // the array, excluding the last N. The **guard** check allows it to work with
  // `_.map`.
  _.initial = function(array, n, guard) {
    return slice.call(array, 0, array.length - ((n == null) || guard ? 1 : n));
  };

  // Get the last element of an array. Passing **n** will return the last N
  // values in the array. The **guard** check allows it to work with `_.map`.
  _.last = function(array, n, guard) {
    if ((n != null) && !guard) {
      return slice.call(array, Math.max(array.length - n, 0));
    } else {
      return array[array.length - 1];
    }
  };

  // Returns everything but the first entry of the array. Aliased as `tail`.
  // Especially useful on the arguments object. Passing an **index** will return
  // the rest of the values in the array from that index onward. The **guard**
  // check allows it to work with `_.map`.
  _.rest = _.tail = function(array, index, guard) {
    return slice.call(array, (index == null) || guard ? 1 : index);
  };

  // Trim out all falsy values from an array.
  _.compact = function(array) {
    return _.filter(array, function(value){ return !!value; });
  };

  // Return a completely flattened version of an array.
  _.flatten = function(array, shallow) {
    return _.reduce(array, function(memo, value) {
      if (_.isArray(value)) return memo.concat(shallow ? value : _.flatten(value));
      memo[memo.length] = value;
      return memo;
    }, []);
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = function(array) {
    return _.difference(array, slice.call(arguments, 1));
  };

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // Aliased as `unique`.
  _.uniq = _.unique = function(array, isSorted, iterator) {
    var initial = iterator ? _.map(array, iterator) : array;
    var result = [];
    _.reduce(initial, function(memo, el, i) {
      if (0 == i || (isSorted === true ? _.last(memo) != el : !_.include(memo, el))) {
        memo[memo.length] = el;
        result[result.length] = array[i];
      }
      return memo;
    }, []);
    return result;
  };

  // Produce an array that contains the union: each distinct element from all of
  // the passed-in arrays.
  _.union = function() {
    return _.uniq(_.flatten(arguments, true));
  };

  // Produce an array that contains every item shared between all the
  // passed-in arrays. (Aliased as "intersect" for back-compat.)
  _.intersection = _.intersect = function(array) {
    var rest = slice.call(arguments, 1);
    return _.filter(_.uniq(array), function(item) {
      return _.every(rest, function(other) {
        return _.indexOf(other, item) >= 0;
      });
    });
  };

  // Take the difference between one array and a number of other arrays.
  // Only the elements present in just the first array will remain.
  _.difference = function(array) {
    var rest = _.flatten(slice.call(arguments, 1));
    return _.filter(array, function(value){ return !_.include(rest, value); });
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = function() {
    var args = slice.call(arguments);
    var length = _.max(_.pluck(args, 'length'));
    var results = new Array(length);
    for (var i = 0; i < length; i++) results[i] = _.pluck(args, "" + i);
    return results;
  };

  // If the browser doesn't supply us with indexOf (I'm looking at you, **MSIE**),
  // we need this function. Return the position of the first occurrence of an
  // item in an array, or -1 if the item is not included in the array.
  // Delegates to **ECMAScript 5**'s native `indexOf` if available.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  _.indexOf = function(array, item, isSorted) {
    if (array == null) return -1;
    var i, l;
    if (isSorted) {
      i = _.sortedIndex(array, item);
      return array[i] === item ? i : -1;
    }
    if (nativeIndexOf && array.indexOf === nativeIndexOf) return array.indexOf(item);
    for (i = 0, l = array.length; i < l; i++) if (i in array && array[i] === item) return i;
    return -1;
  };

  // Delegates to **ECMAScript 5**'s native `lastIndexOf` if available.
  _.lastIndexOf = function(array, item) {
    if (array == null) return -1;
    if (nativeLastIndexOf && array.lastIndexOf === nativeLastIndexOf) return array.lastIndexOf(item);
    var i = array.length;
    while (i--) if (i in array && array[i] === item) return i;
    return -1;
  };

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  _.range = function(start, stop, step) {
    if (arguments.length <= 1) {
      stop = start || 0;
      start = 0;
    }
    step = arguments[2] || 1;

    var len = Math.max(Math.ceil((stop - start) / step), 0);
    var idx = 0;
    var range = new Array(len);

    while(idx < len) {
      range[idx++] = start;
      start += step;
    }

    return range;
  };

  // Function (ahem) Functions
  // ------------------

  // Reusable constructor function for prototype setting.
  var ctor = function(){};

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Binding with arguments is also known as `curry`.
  // Delegates to **ECMAScript 5**'s native `Function.bind` if available.
  // We check for `func.bind` first, to fail fast when `func` is undefined.
  _.bind = function bind(func, context) {
    var bound, args;
    if (func.bind === nativeBind && nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    if (!_.isFunction(func)) throw new TypeError;
    args = slice.call(arguments, 2);
    return bound = function() {
      if (!(this instanceof bound)) return func.apply(context, args.concat(slice.call(arguments)));
      ctor.prototype = func.prototype;
      var self = new ctor;
      var result = func.apply(self, args.concat(slice.call(arguments)));
      if (Object(result) === result) return result;
      return self;
    };
  };

  // Bind all of an object's methods to that object. Useful for ensuring that
  // all callbacks defined on an object belong to it.
  _.bindAll = function(obj) {
    var funcs = slice.call(arguments, 1);
    if (funcs.length == 0) funcs = _.functions(obj);
    each(funcs, function(f) { obj[f] = _.bind(obj[f], obj); });
    return obj;
  };

  // Memoize an expensive function by storing its results.
  _.memoize = function(func, hasher) {
    var memo = {};
    hasher || (hasher = _.identity);
    return function() {
      var key = hasher.apply(this, arguments);
      return hasOwnProperty.call(memo, key) ? memo[key] : (memo[key] = func.apply(this, arguments));
    };
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = function(func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function(){ return func.apply(func, args); }, wait);
  };

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = function(func) {
    return _.delay.apply(_, [func, 1].concat(slice.call(arguments, 1)));
  };

  // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time.
  _.throttle = function(func, wait) {
    var context, args, timeout, throttling, more;
    var whenDone = _.debounce(function(){ more = throttling = false; }, wait);
    return function() {
      context = this; args = arguments;
      var later = function() {
        timeout = null;
        if (more) func.apply(context, args);
        whenDone();
      };
      if (!timeout) timeout = setTimeout(later, wait);
      if (throttling) {
        more = true;
      } else {
        func.apply(context, args);
      }
      whenDone();
      throttling = true;
    };
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds.
  _.debounce = function(func, wait) {
    var timeout;
    return function() {
      var context = this, args = arguments;
      var later = function() {
        timeout = null;
        func.apply(context, args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  _.once = function(func) {
    var ran = false, memo;
    return function() {
      if (ran) return memo;
      ran = true;
      return memo = func.apply(this, arguments);
    };
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function(func, wrapper) {
    return function() {
      var args = [func].concat(slice.call(arguments, 0));
      return wrapper.apply(this, args);
    };
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _.compose = function() {
    var funcs = arguments;
    return function() {
      var args = arguments;
      for (var i = funcs.length - 1; i >= 0; i--) {
        args = [funcs[i].apply(this, args)];
      }
      return args[0];
    };
  };

  // Returns a function that will only be executed after being called N times.
  _.after = function(times, func) {
    if (times <= 0) return func();
    return function() {
      if (--times < 1) { return func.apply(this, arguments); }
    };
  };

  // Object Functions
  // ----------------

  // Retrieve the names of an object's properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`
  _.keys = nativeKeys || function(obj) {
    if (obj !== Object(obj)) throw new TypeError('Invalid object');
    var keys = [];
    for (var key in obj) if (hasOwnProperty.call(obj, key)) keys[keys.length] = key;
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    return _.map(obj, _.identity);
  };

  // Return a sorted list of the function names available on the object.
  // Aliased as `methods`
  _.functions = _.methods = function(obj) {
    var names = [];
    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      for (var prop in source) {
        if (source[prop] !== void 0) obj[prop] = source[prop];
      }
    });
    return obj;
  };

  // Fill in a given object with default properties.
  _.defaults = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      for (var prop in source) {
        if (obj[prop] == null) obj[prop] = source[prop];
      }
    });
    return obj;
  };

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function(obj) {
    if (!_.isObject(obj)) return obj;
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };

  // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  _.tap = function(obj, interceptor) {
    interceptor(obj);
    return obj;
  };

  // Internal recursive comparison function.
  function eq(a, b, stack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the Harmony `egal` proposal: http://wiki.ecmascript.org/doku.php?id=harmony:egal.
    if (a === b) return a !== 0 || 1 / a == 1 / b;
    // A strict comparison is necessary because `null == undefined`.
    if (a == null || b == null) return a === b;
    // Unwrap any wrapped objects.
    if (a._chain) a = a._wrapped;
    if (b._chain) b = b._wrapped;
    // Invoke a custom `isEqual` method if one is provided.
    if (a.isEqual && _.isFunction(a.isEqual)) return a.isEqual(b);
    if (b.isEqual && _.isFunction(b.isEqual)) return b.isEqual(a);
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className != toString.call(b)) return false;
    switch (className) {
      // Strings, numbers, dates, and booleans are compared by value.
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return a == String(b);
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive. An `egal` comparison is performed for
        // other numeric values.
        return a != +a ? b != +b : (a == 0 ? 1 / a == 1 / b : a == +b);
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a == +b;
      // RegExps are compared by their source patterns and flags.
      case '[object RegExp]':
        return a.source == b.source &&
               a.global == b.global &&
               a.multiline == b.multiline &&
               a.ignoreCase == b.ignoreCase;
    }
    if (typeof a != 'object' || typeof b != 'object') return false;
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
    var length = stack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (stack[length] == a) return true;
    }
    // Add the first object to the stack of traversed objects.
    stack.push(a);
    var size = 0, result = true;
    // Recursively compare objects and arrays.
    if (className == '[object Array]') {
      // Compare array lengths to determine if a deep comparison is necessary.
      size = a.length;
      result = size == b.length;
      if (result) {
        // Deep compare the contents, ignoring non-numeric properties.
        while (size--) {
          // Ensure commutative equality for sparse arrays.
          if (!(result = size in a == size in b && eq(a[size], b[size], stack))) break;
        }
      }
    } else {
      // Objects with different constructors are not equivalent.
      if ('constructor' in a != 'constructor' in b || a.constructor != b.constructor) return false;
      // Deep compare objects.
      for (var key in a) {
        if (hasOwnProperty.call(a, key)) {
          // Count the expected number of properties.
          size++;
          // Deep compare each member.
          if (!(result = hasOwnProperty.call(b, key) && eq(a[key], b[key], stack))) break;
        }
      }
      // Ensure that both objects contain the same number of properties.
      if (result) {
        for (key in b) {
          if (hasOwnProperty.call(b, key) && !(size--)) break;
        }
        result = !size;
      }
    }
    // Remove the first object from the stack of traversed objects.
    stack.pop();
    return result;
  }

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function(a, b) {
    return eq(a, b, []);
  };

  // Is a given array, string, or object empty?
  // An "empty" object has no enumerable own-properties.
  _.isEmpty = function(obj) {
    if (_.isArray(obj) || _.isString(obj)) return obj.length === 0;
    for (var key in obj) if (hasOwnProperty.call(obj, key)) return false;
    return true;
  };

  // Is a given value a DOM element?
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType == 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) == '[object Array]';
  };

  // Is a given variable an object?
  _.isObject = function(obj) {
    return obj === Object(obj);
  };

  // Is a given variable an arguments object?
  _.isArguments = function(obj) {
    return toString.call(obj) == '[object Arguments]';
  };
  if (!_.isArguments(arguments)) {
    _.isArguments = function(obj) {
      return !!(obj && hasOwnProperty.call(obj, 'callee'));
    };
  }

  // Is a given value a function?
  _.isFunction = function(obj) {
    return toString.call(obj) == '[object Function]';
  };

  // Is a given value a string?
  _.isString = function(obj) {
    return toString.call(obj) == '[object String]';
  };

  // Is a given value a number?
  _.isNumber = function(obj) {
    return toString.call(obj) == '[object Number]';
  };

  // Is the given value `NaN`?
  _.isNaN = function(obj) {
    // `NaN` is the only value for which `===` is not reflexive.
    return obj !== obj;
  };

  // Is a given value a boolean?
  _.isBoolean = function(obj) {
    return obj === true || obj === false || toString.call(obj) == '[object Boolean]';
  };

  // Is a given value a date?
  _.isDate = function(obj) {
    return toString.call(obj) == '[object Date]';
  };

  // Is the given value a regular expression?
  _.isRegExp = function(obj) {
    return toString.call(obj) == '[object RegExp]';
  };

  // Is a given value equal to null?
  _.isNull = function(obj) {
    return obj === null;
  };

  // Is a given variable undefined?
  _.isUndefined = function(obj) {
    return obj === void 0;
  };

  // Utility Functions
  // -----------------

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iterators.
  _.identity = function(value) {
    return value;
  };

  // Run a function **n** times.
  _.times = function (n, iterator, context) {
    for (var i = 0; i < n; i++) iterator.call(context, i);
  };

  // Escape a string for HTML interpolation.
  _.escape = function(string) {
    return (''+string).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;');
  };

  // Add your own custom functions to the Underscore object, ensuring that
  // they're correctly added to the OOP wrapper as well.
  _.mixin = function(obj) {
    each(_.functions(obj), function(name){
      addToWrapper(name, _[name] = obj[name]);
    });
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = idCounter++;
    return prefix ? prefix + id : id;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    evaluate    : /<%([\s\S]+?)%>/g,
    interpolate : /<%=([\s\S]+?)%>/g,
    escape      : /<%-([\s\S]+?)%>/g
  };

  // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.
  var noMatch = /.^/;

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  _.template = function(str, data) {
    var c  = _.templateSettings;
    var tmpl = 'var __p=[],print=function(){__p.push.apply(__p,arguments);};' +
      'with(obj||{}){__p.push(\'' +
      str.replace(/\\/g, '\\\\')
         .replace(/'/g, "\\'")
         .replace(c.escape || noMatch, function(match, code) {
           return "',_.escape(" + code.replace(/\\'/g, "'") + "),'";
         })
         .replace(c.interpolate || noMatch, function(match, code) {
           return "'," + code.replace(/\\'/g, "'") + ",'";
         })
         .replace(c.evaluate || noMatch, function(match, code) {
           return "');" + code.replace(/\\'/g, "'")
                              .replace(/[\r\n\t]/g, ' ')
                              .replace(/\\\\/g, '\\') + ";__p.push('";
         })
         .replace(/\r/g, '\\r')
         .replace(/\n/g, '\\n')
         .replace(/\t/g, '\\t')
         + "');}return __p.join('');";
    var func = new Function('obj', '_', tmpl);
    if (data) return func(data, _);
    return function(data) {
      return func.call(this, data, _);
    };
  };

  // Add a "chain" function, which will delegate to the wrapper.
  _.chain = function(obj) {
    return _(obj).chain();
  };

  // The OOP Wrapper
  // ---------------

  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.
  var wrapper = function(obj) { this._wrapped = obj; };

  // Expose `wrapper.prototype` as `_.prototype`
  _.prototype = wrapper.prototype;

  // Helper function to continue chaining intermediate results.
  var result = function(obj, chain) {
    return chain ? _(obj).chain() : obj;
  };

  // A method to easily add functions to the OOP wrapper.
  var addToWrapper = function(name, func) {
    wrapper.prototype[name] = function() {
      var args = slice.call(arguments);
      unshift.call(args, this._wrapped);
      return result(func.apply(_, args), this._chain);
    };
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    wrapper.prototype[name] = function() {
      var wrapped = this._wrapped;
      method.apply(wrapped, arguments);
      var length = wrapped.length;
      if ((name == 'shift' || name == 'splice') && length === 0) delete wrapped[0];
      return result(wrapped, this._chain);
    };
  });

  // Add all accessor Array functions to the wrapper.
  each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    wrapper.prototype[name] = function() {
      return result(method.apply(this._wrapped, arguments), this._chain);
    };
  });

  // Start chaining a wrapped Underscore object.
  wrapper.prototype.chain = function() {
    this._chain = true;
    return this;
  };

  // Extracts the result from a wrapped and chained object.
  wrapper.prototype.value = function() {
    return this._wrapped;
  };

}).call(this);

/*! sprintf.js | Copyright (c) 2007-2013 Alexandru Marasteanu <hello at alexei dot ro> | 3 clause BSD license */
// Lightly modified for use with i18n library by Nathan Stitt
//   Exceptions were removed and replaced with logged warnings.
//   noConflict mode was introduced

(function(ctx) {
  var log = ( ctx.console && ctx.console.warn ) ? ctx.console.warn : function(){};

  var previousSprintf = ctx.sprintf;

  var sprintf = function() {
    if (!sprintf.cache.hasOwnProperty(arguments[0])) {
      sprintf.cache[arguments[0]] = sprintf.parse(arguments[0]);
    }
    return sprintf.format.call(null, sprintf.cache[arguments[0]], arguments);
  };

  sprintf.noConflict = function() {
    ctx.sprintf = previousSprintf;
    return this;
  };

  sprintf.format = function(parse_tree, argv) {
    var cursor = 1, tree_length = parse_tree.length, node_type = '', arg, output = [], i, k, match, pad, pad_character, pad_length;
    for (i = 0; i < tree_length; i++) {
      node_type = get_type(parse_tree[i]);
      if (node_type === 'string') {
        output.push(parse_tree[i]);
      }
      else if (node_type === 'array') {
        match = parse_tree[i]; // convenience purposes only
        if (match[2]) { // keyword argument
          arg = argv[cursor];
          for (k = 0; k < match[2].length; k++) {
            if (!arg.hasOwnProperty(match[2][k])) {
              log(sprintf('[sprintf] property "%s" does not exist', match[2][k]));
            }
            arg = arg[match[2][k]];
          }
        }
        else if (match[1]) { // positional argument (explicit)
          arg = argv[match[1]];
        }
        else { // positional argument (implicit)
          arg = argv[cursor++];
        }

        if (/[^s]/.test(match[8]) && (get_type(arg) != 'number')) {
          log('[sprintf] expecting number but was non-numeric');
        }
        switch (match[8]) {
        case 'b': arg = arg.toString(2); break;
        case 'c': arg = String.fromCharCode(arg); break;
        case 'd': arg = parseInt(arg, 10); break;
        case 'e': arg = match[7] ? arg.toExponential(match[7]) : arg.toExponential(); break;
        case 'f': arg = match[7] ? parseFloat(arg).toFixed(match[7]) : parseFloat(arg); break;
        case 'o': arg = arg.toString(8); break;
        case 's': arg = ((arg = String(arg)) && match[7] ? arg.substring(0, match[7]) : arg); break;
        case 'u': arg = arg >>> 0; break;
        case 'x': arg = arg.toString(16); break;
        case 'X': arg = arg.toString(16).toUpperCase(); break;
        }
        arg = (/[def]/.test(match[8]) && match[3] && arg >= 0 ? '+'+ arg : arg);
        pad_character = match[4] ? match[4] == '0' ? '0' : match[4].charAt(1) : ' ';
        pad_length = match[6] - String(arg).length;
        pad = match[6] ? str_repeat(pad_character, pad_length) : '';
        output.push(match[5] ? arg + pad : pad + arg);
      }
    }
    return output.join('');
  };

  sprintf.cache = {};

  sprintf.parse = function(fmt) {
    var _fmt = fmt, match = [], parse_tree = [], arg_names = 0;
    while (_fmt) {
      if ((match = /^[^\x25]+/.exec(_fmt)) !== null) {
        parse_tree.push(match[0]);
      }
      else if ((match = /^\x25{2}/.exec(_fmt)) !== null) {
        parse_tree.push('%');
      }
      else if ((match = /^\x25(?:([1-9]\d*)\$|\(([^\)]+)\))?(\+)?(0|'[^$])?(-)?(\d+)?(?:\.(\d+))?([b-fosuxX])/.exec(_fmt)) !== null){
        if (match[2]) {
          arg_names |= 1;
          var field_list = [], replacement_field = match[2], field_match = [];
          if ((field_match = /^([a-z_][a-z_\d]*)/i.exec(replacement_field)) !== null) {
            field_list.push(field_match[1]);
            while ((replacement_field = replacement_field.substring(field_match[0].length)) !== '') {
              if ((field_match = /^\.([a-z_][a-z_\d]*)/i.exec(replacement_field)) !== null) {
                field_list.push(field_match[1]);
              }
              else if ((field_match = /^\[(\d+)\]/.exec(replacement_field)) !== null) {
                field_list.push(field_match[1]);
              }
              else {
                log('[sprintf] error: ' + fmt );
              }
            }
          }
          else {
            log('[sprintf] error: ' + fmt );
          }
          match[2] = field_list;
        }
        else {
          arg_names |= 2;
        }
        if (arg_names === 3) {
          log('[sprintf] mixing positional and named placeholders is not (yet) supported');
        }
        parse_tree.push(match);
      }
      else {
        log('[sprintf] error: ' + fmt );
      }
      _fmt = _fmt.substring(match[0].length);
    }
    return parse_tree;
  };

  sprintf.with_array = function(fmt, argv ) {
    var _argv = argv.slice(0);
    _argv.splice(0, 0, fmt);
    return sprintf.apply(null, _argv);
  };

  /**
   * helpers
   */
  function get_type(variable) {
    return Object.prototype.toString.call(variable).slice(8, -1).toLowerCase();
  }

  function str_repeat(input, multiplier) {
    for (var output = []; multiplier > 0; output[--multiplier] = input) {/* do nothing */}
    return output.join('');
  }

  /**
   * export to either browser or node.js
   */
  ctx.sprintf = sprintf;

})(typeof exports != "undefined" ? exports : window);

(function(){
  // When the next click or keypress happens, anywhere on the screen, hide the
  // element. 'clickable' makes the element and its contents clickable without
  // hiding. The 'onHide' callback runs when the hide fires, and has a chance
  // to cancel it.  
  jQuery.fn.autohide = function(options) {
    var me = this;
    options = DV._.extend({clickable : null, onHide : null}, options || {});
    me._autoignore = true;
    setTimeout(function(){ delete me._autoignore; }, 0);

    if (!me._autohider) {
      me.forceHide = function(e) {
        if (!e && options.onHide) options.onHide();
        me.hide();

        DV.jQuery(document).unbind('click', me._autohider);
        DV.jQuery(document).unbind('keypress', me._autohider);
        me._autohider = null;
        me.forceHide = null;
      };
      me._autohider = function(e) {        
        if (me._autoignore) return;
        if (options.clickable && (me[0] == e.target || DV._.include(DV.jQuery(e.target).parents(), me[0]))) return;
        if (options.onHide && !options.onHide(e)) return;
        me.forceHide(e);
      };
      DV.jQuery(document).bind('click', this._autohider);
      DV.jQuery(document).bind('keypress', this._autohider);
    }
  };
 
  jQuery.fn.acceptInput = function(options) {
    var config = { 
      delay:                  1000,
      callback:               null,
      className:              'acceptInput',
      initialStateClassName:  'acceptInput-awaitingActivity',
      typingStateClassName:   'acceptInput-acceptingInput',
      inputClassName:         'acceptInput-textField'
    };

    if (options){
      DV.jQuery.extend(config, options);
    }
    this.editTimer = null;
      
    this.deny = function(){
      this.parent().addClass('stopAcceptingInput');
    };
    
    this.allow = function(){
      this.parent().removeClass('stopAcceptingInput');
    };      

    
    this.each(function(i,el){
      // element-specific code here
      if(DV.jQuery(el).parent().hasClass(config.initialStateClassName)){
        return true;
      }
      el = DV.jQuery(el);
      
      var elWrapped = el.wrap('<span class="'+config.initialStateClassName+'"></span>');
      elWrapped     = elWrapped.parent();
      
      var inputElement = DV.jQuery('<input type="text" class="'+config.inputClassName+'" style="display:none;" />').appendTo(elWrapped);
      
      inputElement.bind('blur',function(){
      
        elWrapped.addClass(config.initialStateClassName).removeClass(config.typingStateClassName);
        inputElement.hide();
        el.show();
               
      });


      inputElement.bind('keyup',function(){
        var val = inputElement.attr('value');
        el.text(val);
        if(config.changeCallBack){
          DV.jQuery.fn.acceptInput.editTimer = setTimeout(config.changeCallBack,500);
        }
      });
      
      inputElement.bind('keydown',function(){
        if(DV.jQuery.fn.acceptInput.editTimer){
          clearTimeout(DV.jQuery.fn.acceptInput.editTimer);
        }
      });

      elWrapped.bind('click', function(){
        if(elWrapped.hasClass('stopAcceptingInput')) return;
        if(elWrapped.hasClass(config.initialStateClassName)){
          
          var autoHider = function(){
            elWrapped.addClass(config.initialStateClassName).removeClass(config.typingStateClassName);
          };

          DV.jQuery(inputElement).autohide({ clickable: true, onHide: DV.jQuery.proxy(autoHider,this) });
          
          el.hide();
          inputElement.attr('value',el.text()).show()[0].focus();
          inputElement[0].select();
          elWrapped.addClass(config.typingStateClassName).removeClass(config.initialStateClassName);
                    
        }
      });
    });
       
    return this;

  };

}).call(this);

(function($) {
  
  $.fn.placeholder = function(opts) {
    var defaults = {
      message: '...',
      className: 'placeholder',
      clearClassName: 'show_cancel_search'
    };
    var options = $.extend({}, defaults, opts);
    
    var setPlaceholder = function($input) {
      $input.val($input.attr('placeholder') || options.message);
      $input.addClass(options.className);
    };
    
    return this.each(function() {
      var $this = $(this);

      if ($this.attr('type') == 'search') return;
      
      $this.bind('blur', function() {
        if ($this.val() == '') {
          setPlaceholder($this);
        }
      }).bind('focus', function() {
        if ($this.val() == ($this.attr('placeholder') || options.message)) {
          $this.val('');
        }
        $this.removeClass(options.className);
      }).bind('keyup', function() {
        var searchVal = $this.val();
        if (searchVal != '' && searchVal != options.message) {
          $this.parent().addClass(options.clearClassName);
        } else {
          $this.parent().removeClass(options.clearClassName);
        }
      });
      DV._.defer(function(){
        $this.keyup().blur();
      });
    });
    
  };
  
})(jQuery);
// Fake out console.log for safety, if it doesn't exist.
window.console || (window.console = {});
console.log    || (console.log = _.identity);

// Create the DV namespaces.
window.DV   = window.DV   || {};
DV.jQuery   = jQuery.noConflict(true);
DV._        = _.noConflict(); // preserve a safe reference for the viewer
_           = DV._; // make sure that _ is defined in the global namespace for now.
DV.viewers  = DV.viewers  || {};
DV.model    = DV.model    || {};

//External link definitions
DV.img_slice_link = '/api/imagecrop';


DV.AnnotationView = function(highlViewRef, annoModel){
    this.highlight   = highlViewRef;
    this.model       = annoModel;
};

// Render an Annotation model to HTML
// Receives an argHash with external data about the highlight container/context
DV.AnnotationView.prototype.render = function(argHash){
    var pageModel = this.highlight.viewer.models.pages;

    argHash.imageWidth          = pageModel.width;
    argHash.imageHeight         = Math.round(pageModel.height * pageModel.zoomFactor());
    argHash.author              = this.model.get('author') || "";
    argHash.author_organization = this.model.get('author_organization') || "";
    argHash.image               = pageModel.imageURL(this.highlight.page.pageNumber - 1);
    argHash.imageTop            = argHash.top + 6;
    argHash.owns_note           = this.model.get('owns_note');
    argHash.title               = this.model.get('title');
    argHash.text                = this.model.get('text');

    var returnHTML = JST['DV/views/annotation'](argHash);
    if( this.highlight.viewer.schema.recommendations ){
        $('.DV-annotationTitleInput', this.highlight.highlightEl).autocomplete({source: this.highlight.viewer.schema.recommendations});
    }

    return returnHTML;
},


// Show edit controls
DV.AnnotationView.prototype.showEdit = function() {
    if( this.highlight.viewer.$('.DV-annotationTitleInput', this.highlight.highlightEl).val() ) {
        this.highlight.viewer.$('.DV-annotationTextArea', this.highlight.highlightEl).focus();
    }else{
        this.highlight.viewer.$('.DV-annotationTitleInput', this.highlight.highlightEl).focus();
    }
};


//Return whether the anno info has changed from what's in the model
DV.AnnotationView.prototype.hasChanged = function() {
    var compareTitle = this.model.get('title') == null ? "" : this.model.get('title');
    var compareText = this.model.get('text') == null ? "" : this.model.get('text');
    return this.highlight.highlightEl.hasClass('DV-editing') && (this.highlight.highlightEl.find('.DV-annotationTitleInput ').val() != compareTitle || this.highlight.highlightEl.find('.DV-annotationTextArea').val() != compareText);
};


DV.DragReporter = function(viewer, toWatch, dispatcher, argHash) {
  this.viewer         = viewer;
  this.dragClassName  = 'DV-dragging';
  this.sensitivityY   = 1.0;
  this.sensitivityX   = 1.0;
  this.oldPageY       = 0;

  DV._.extend(this, argHash);

  this.dispatcher             = dispatcher;
  this.toWatch                = this.viewer.$(toWatch);
  this.boundReporter          = DV._.bind(this.mouseMoveReporter,this);
  this.boundMouseUpReporter   = DV._.bind(this.mouseUpReporter,this);
  this.boundMouseDownReporter = DV._.bind(this.mouseDownReporter,this);

  this.setBinding();
};

DV.DragReporter.prototype.shouldIgnore = function(e) {
  if (!this.ignoreSelector) return false;
  var el = this.viewer.$(e.target);
  return el.parents().is(this.ignoreSelector) || el.is(this.ignoreSelector);
};

DV.DragReporter.prototype.mouseUpReporter     = function(e){
  if (this.shouldIgnore(e)) return true;
  e.preventDefault();
  clearInterval(this.updateTimer);
  this.stop();
};

DV.DragReporter.prototype.oldPositionUpdater   = function(){
  this.oldPageY = this.pageY;
};

DV.DragReporter.prototype.stop         = function(){
  this.toWatch.removeClass(this.dragClassName);
  this.toWatch.unbind('mousemove');
};

DV.DragReporter.prototype.setBinding         = function(){
  this.toWatch.mouseup(this.boundMouseUpReporter);
  this.toWatch.mousedown(this.boundMouseDownReporter);
};

DV.DragReporter.prototype.unBind           = function(){
  this.toWatch.unbind('mouseup',this.boundMouseUpReporter);
  this.toWatch.unbind('mousedown',this.boundMouseDownReporter);
};

DV.DragReporter.prototype.destroy           = function(){
  this.unBind();
  this.toWatch = null;
};

DV.DragReporter.prototype.mouseDownReporter   = function(e){
   if (this.shouldIgnore(e)) return true;
  e.preventDefault();
  this.pageY    = e.pageY;
  this.pageX    = e.pageX;
  this.oldPageY = e.pageY;

  this.updateTimer = setInterval(DV._.bind(this.oldPositionUpdater,this),1200);

  this.toWatch.addClass(this.dragClassName);
  this.toWatch.mousemove(this.boundReporter);
};

DV.DragReporter.prototype.mouseMoveReporter     = function(e){
  if (this.shouldIgnore(e)) return true;
  e.preventDefault();
  var deltaX      = Math.round(this.sensitivityX * (this.pageX - e.pageX));
  var deltaY      = Math.round(this.sensitivityY * (this.pageY - e.pageY));
  var directionX  = (deltaX > 0) ? 'right' : 'left';
  var directionY  = (deltaY > 0) ? 'down' : 'up';
  this.pageY      = e.pageY;
  this.pageX      = e.pageX;
  if (deltaY === 0 && deltaX === 0) return;
  this.dispatcher({ event: e, deltaX: deltaX, deltaY: deltaY, directionX: directionX, directionY: directionY });
};

DV.Elements = function(viewer){
  this._viewer = viewer;
  var elements = DV.Schema.elements;
  for (var i=0, elemCount=elements.length; i < elemCount; i++) {
    this.getElement(elements[i]);
  }
};

// Get and store an element reference
DV.Elements.prototype.getElement = function(elementQuery,force){
  this[elementQuery.name] = this._viewer.$(elementQuery.query);
};

DV.GraphView = function(highlViewRef, graphModel){
    this.highlight   = highlViewRef;
    this.model       = graphModel;
};


// Receives an argHash with external data about the highlight container/context
DV.GraphView.prototype.render = function(argHash){
    argHash.graph_json = _.escape(JSON.stringify(this.model.get('graph_json')));
    argHash.owns_note = this.model.get('owns_note');

    var returnHTML = JST['DV/views/graph'](argHash);
    return returnHTML;
},


DV.GraphView.prototype.showEdit = function(){
    this.highlight.model.get('image_link') ? this.showGraphEditor() :  this.processImage();
},


DV.GraphView.prototype.initWPD = function(){
    //If wpd loaded, run init -- if not, it's already loading, so wait and try again
    if(typeof(wpd) != 'undefined'){
        wpd.iframe_api.setParentMsgFunction(this.highlight.viewer.wpd_api.receiveMessage.bind(this.highlight.viewer.wpd_api));
        wpd.initApp(true, this.highlight.model.get('image_link'), this.model.get('graph_json'), $(this.highlight.highlightEl).find('#graph_frame'), !this.model.get('owns_note'));
    }else{
        //If not loaded, try again in 1 second
        setTimeout(this.initWPD.bind(this), 1000);
    }
};


DV.GraphView.prototype.setWPDJSON = function(json){
    this.highlight.highlightEl.find('.DV-graphData').val(json);
};


//Show WPD
DV.GraphView.prototype.showGraphEditor = function(){
    var _thisView = this;
    var frame = this.highlight.highlightEl.find('#graph_frame')[0];
    this.highlight.viewer.wpd_api.setActiveAnnoView(this);

    //Grab height of image being sent to WPD, use it to set height of anno window
    var _width, _height;
    $("<img/>").attr("src", _thisView.highlight.model.get('image_link')).load(function() {
        var frame_height = this.height > 475 ? this.height : 475;
        $(frame).height(frame_height);

        if( !DV.WPD_loaded ){
            //If WPD JS isn't loaded, load and initialize
            var script = document.createElement('script');
            script.src = '/viewer/WPD/combined-compiled.js';
            script.onload = function(){
                $(frame).html(JST['WPD/wpd']);
                _thisView.initWPD();
            }
            document.body.appendChild(script);
            DV.WPD_loaded = true;
        }else {
            $(frame).html(JST['WPD/wpd']);
            _thisView.initWPD();
        }
    });
};


//Provide loading message and generate cropped image based on annotation selection
DV.GraphView.prototype.processImage = function(){
    var _thisView = this;
    this.highlight.highlightEl.find('#graph_frame').html(JST['DV/views/generatingImage']);

    //Convert anno parameters to ratios for image crop
    var pageModel               = this.highlight.viewer.models.pages;
    var imageWidth              = pageModel.width;
    var imageHeight             = Math.round(pageModel.height * pageModel.zoomFactor());

    var img_json = {};
    img_json['x_ratio'] = this.highlight.model.get('x1') / imageWidth;
    img_json['y_ratio'] = this.highlight.model.get('y1') / imageHeight;
    img_json['w_ratio'] = (this.highlight.model.get('x2') - this.highlight.model.get('x1')) / imageWidth;
    img_json['h_ratio'] = (this.highlight.model.get('y2') - this.highlight.model.get('y1')) / imageHeight;

    //Determine name of large image
    var image_url = this.highlight.page.getPageImageURL();
    img_json['img_name'] = image_url.substring(0, image_url.lastIndexOf("-")) + '-large' + image_url.substring(image_url.lastIndexOf("."), image_url.length);
    img_json['img_name']= img_json['img_name'].substring(0, img_json['img_name'].lastIndexOf("?") );

    DV.jQuery.ajax({
        url: DV.img_slice_link,
        type: 'POST',
        data: img_json,
        dataType: 'json',
        success: function(resp){
            _thisView.highlight.model.set({image_link: resp.filename});
            _thisView.showGraphEditor();
        },
        failure: function(){
            alert('Image generation failed!');
        }
    });
};


//Return whether the graph info has changed from what's in the model
DV.GraphView.prototype.hasChanged = function() {
    var compareJSON = this.model.get('graph_json') == null ? "" : JSON.stringify(this.model.get('graph_json'));
    return this.highlight.highlightEl.hasClass('DV-editing') && (_.unescape(this.highlight.highlightEl.find('.DV-graphData').val()) != compareJSON);
};
DV.HighlightView = function(highl, page, active, edit){
    this.LEFT_MARGIN      = 25;
    this.SCROLLBAR_WIDTH  = 25;
    this.page         = page;
    this.viewer       = this.page.set.viewer;
    this.model        = highl;
    this.position     = { top: highl.get('x1'), left: highl.get('x1') };
    this.dimensions   = { width: (highl.get('x1')+highl.get('x2')), height: (highl.get('y1')+highl.get('y2')) };
    this.showWindowX  = 0;
    this.highlightEl  = null;
    this.state        = 'collapsed';
    this.active       = active;
    this.showConfirm  = false;

    if (highl.get('access') == 'public')         this.accessClass = 'DV-accessPublic';
    else if (highl.get('access') =='exclusive')  this.accessClass = 'DV-accessExclusive';
    else if (highl.get('access') =='private')    this.accessClass = 'DV-accessPrivate';

    this.renderedHTML = DV.jQuery(this.render());

    this.remove();
    this.add();

    if(this.active){
        this.viewer.helpers.setActiveHighlightLimits(this);
        this.viewer.events.resetTracker();
        this.active = null;
        this.show({active: true, edit: edit});
        if (edit) this.showEdit();
    }
};

// Render an highlight model to HTML, calculating all of the dimensions
// and offsets, and running a template function.
DV.HighlightView.prototype.render = function(){
    var documentModel             = this.viewer.models.document;
    var pageModel                 = this.viewer.models.pages;
    var zoom                      = pageModel.zoomFactor();
    var x1, x2, y1, y2;


    var highlHash = {
        id                      : this.model.get('id'),
        options                 : this.viewer.options,
        accessClass             : this.accessClass,
        approvedClass           : '',
        leftMargin              : 0,
        showWindowMarginLeft    : this.showWindowX
    };
    var windowWidth = $('.DV-pages').width() - this.SCROLLBAR_WIDTH;

    y1                          = Math.round(this.model.get('y1') * zoom);
    y2                          = Math.round(this.model.get('y2') * zoom);
    if (x1 < this.LEFT_MARGIN) x1 = this.LEFT_MARGIN;
    x1                          = Math.round(this.model.get('x1') * zoom);
    x2                          = Math.round(this.model.get('x2') * zoom);

    highlHash.top                   = y1 - 5;
    highlHash.width                 = pageModel.width > $('.DV-paper').width() ? ($('.DV-paper').width() - this.LEFT_MARGIN - 5) : pageModel.width;

    //If page wider than window, fit anno edit to window
    if( pageModel.width > windowWidth ){
        //If larger than total page, back up so that right edge is on right edge of page, otherwise start on left edge of highlight
        this.showWindowX = (x1+windowWidth) > pageModel.width ? pageModel.width - windowWidth : x1;
        highlHash.width = this.showWindowX + windowWidth - this.LEFT_MARGIN;
        highlHash.excerptTopMarginLeft = x1 - this.showWindowX;
    }else{
        //Else, fit to page
        this.showWindowX = 0;
        highlHash.width = pageModel.width;
        highlHash.excerptTopMarginLeft = x1;
    }
    highlHash.excerptWidth            = ((x2 - x1) - 8) > 2 ? ((x2 - x1) - 8) : 2;
    highlHash.excerptMarginLeft       = x1 - 2;
    highlHash.excerptHeight           = y2 - y1;
    highlHash.tabTop                  = (y1 < 35 ? 35 - y1 : 0) + 8;

    var approvalState = this.model.getApprovalState();
    if(approvalState == 1){ highlHash.approvedClass = ' DV-semi-approved'; }
    if(approvalState == 2){ highlHash.approvedClass = ' DV-approved'; }

    highlHash.currentContent = this.model.get('displayIndex') + 1;
    highlHash.contentCount = this.model.getContentCount();

    //Generate inner content
    this.content = this.model.getCurrentHighlightContent();
    if( this.content.type == 'graph'){
        this.innerView = new DV.GraphView(this, this.content.content);
        var contentHash = {accessClass: highlHash.accessClass};
    }else{
        this.innerView = new DV.AnnotationView(this, this.content.content);
        var contentHash = {
            accessClass         : highlHash.accessClass,
            excerptHeight       : highlHash.excerptHeight,
            excerptMarginLeft   : highlHash.excerptMarginLeft,
            excerptTopMarginLeft: highlHash.excerptTopMarginLeft,
            excerptWidth        : highlHash.excerptWidth,
            showConfirm         : this.showConfirm,
            showWindowMarginLeft: highlHash.showWindowMarginLeft,
            top                 : highlHash.top
        };
    }
    highlHash.innerHTML = this.innerView.render(contentHash);

    return  JST['DV/views/highlight'](highlHash);
},


// Add highlight to page
DV.HighlightView.prototype.add = function(){
    this.highlightEl = this.renderedHTML.appendTo(this.page.highlightContainerEl);
};


// Remove the highlight from the page
DV.HighlightView.prototype.remove = function(){
    if(this.highlightEl){ this.highlightEl.remove(); }
};


// Redraw the HTML for this highlight
//active: Whether to make the refreshed highlight active (optional)
DV.HighlightView.prototype.refresh = function(active, edit, callbacks) {
    this.renderedHTML = DV.jQuery(this.render());
    this.remove();
    this.add();
    if(active != false){ this.show({callbacks: callbacks ? callbacks : false, edit: edit}); }else{ this.hide(true); }
};


// Jump to next highlight
DV.HighlightView.prototype.next = function(){
    this.hide.preventRemovalOfCoverClass = true;
    this.model.set({displayIndex: this.model.get('displayIndex') + 1});
    this.viewer.fireSelectCallbacks(this.model.assembleContentForDC());
};

// Jump to previous highlight
DV.HighlightView.prototype.previous = function(){
    this.hide.preventRemovalOfCoverClass = true;
    this.model.set({displayIndex: this.model.get('displayIndex') - 1});
    this.viewer.fireSelectCallbacks(this.model.assembleContentForDC());
};

// Show highlight
DV.HighlightView.prototype.show = function(argHash) {
    if (this.viewer.activeHighlight && this.viewer.activeHighlight.id != this.model.get('id')) {
        this.viewer.activeHighlight.hide();
    }

    this.viewer.highlightToLoadId = null;
    this.viewer.elements.window.addClass('DV-coverVisible');

    this.highlightEl.find('div.DV-highlightBG').css({display: 'block', opacity: 1});
    this.highlightEl.addClass('DV-activeHighlight');

    this.viewer.activeHighlight = this;

    //Display/hide nav as needed based on current content displayed
    var contentCount = this.model.getContentCount();
    if( contentCount > 1 ){
        //If there is more than one piece of content..
        if( this.content.type == 'annotation' ){
            //Annotation: show if not editing
            (argHash && argHash.edit) ? this.highlightEl.find('.DV-pagination').addClass('DV-hideNav') : this.highlightEl.find('.DV-pagination').removeClass('DV-hideNav');
        }else if( this.content.type == 'graph' ){
            //Graph: always show
            this.highlightEl.find('.DV-pagination').removeClass('DV-hideNav')
        }
    }else{
        this.highlightEl.find('.DV-pagination').addClass('DV-hideNav');
    }

    // Enable highlight tracking to ensure the active state hides on scroll
    this.viewer.helpers.addObserver('trackHighlight');
    this.viewer.helpers.setActiveHighlightInNav(this.model.get('id'));
    this.active = true;
    this.page.pageEl.parent('.DV-set').addClass('DV-activePage');

    if ( argHash && argHash.edit || this.content.type == 'graph' ) {
        this.showEdit();
    }

    //Scroll into view (horizontally)
    $('.DV-pages').scrollLeft(this.showWindowX);

    //Fire callbacks if requested
    if(argHash && argHash.callbacks){ this.viewer.fireSelectCallbacks(this.model.assembleContentForDC()); }
};


//Process a request to hide an highlight; prompt user if necessary; call success if not user-cancelled
DV.HighlightView.prototype.requestHide = function(forceOverlayHide, success){
     _thisView = this;

    //If editing and data has changed, ask for confirmation before hiding
    var isEditing = this.highlightEl.hasClass('DV-editing');
    var hasChanged = this.innerView.hasChanged();

    if( isEditing && hasChanged ){
        var _highl_view = this;
        $('#noSaveDialog').dialog({
            modal: true,
            dialogClass: 'dv-dialog',
            height: 100,
            buttons: [
                {
                    text: "OK",
                    click: function() {
                    _highl_view.hide(forceOverlayHide);
                    success.call();
                    $(this).dialog( "close" );
                    }
                },
                {
                    text: "Cancel",
                    click: function() { $(this).dialog( "close" ); }
                }
            ]
        });
    }else{
        this.hide(forceOverlayHide);
        success.call();
    }
};


// Hide highlight
DV.HighlightView.prototype.hide = function(forceOverlayHide){
    var pageNumber = parseInt(this.viewer.elements.currentPage.text(),10);

    this.highlightEl.find('div.DV-highlightBG').css({ opacity: 0, display: 'none' });

    var isEditing = this.highlightEl.hasClass('DV-editing');

    this.highlightEl.removeClass('DV-editing DV-activeHighlight');
    if(forceOverlayHide === true){
        this.viewer.elements.window.removeClass('DV-coverVisible');
    }
    if(this.hide.preventRemovalOfCoverClass === false || !this.hide.preventRemovalOfCoverClass){
        this.viewer.elements.window.removeClass('DV-coverVisible');
        this.hide.preventRemovalOfCoverClass = false;
    }

    //If unsaved, just remove completely
    if(this.viewer.activeHighlight && this.content.content.unsaved  && this.model.getContentCount() <= 1){ this.remove(); }

    this.setCloneConfirm(false);

    // stop tracking this highlight
    this.active                                = false;
    this.viewer.activeHighlight                = null;
    this.viewer.events.trackHighlight.h        = null;
    this.viewer.events.trackHighlight.id       = null;
    this.viewer.events.trackHighlight.combined = null;
    this.viewer.pageSet.setActiveHighlight(null);
    this.viewer.helpers.removeObserver('trackHighlight');
    this.viewer.helpers.setActiveHighlightInNav();
    this.page.pageEl.parent('.DV-set').removeClass('DV-activePage');
    this.removeConnector(true);
};


// Toggle highlight
DV.HighlightView.prototype.toggle = function(argHash){
    if (this.viewer.activeHighlight && (this.viewer.activeHighlight != this)){
        this.viewer.activeHighlight.hide();
    }

    this.highlightEl.toggleClass('DV-activeHighlight');
    if(this.active == true){
        this.hide(true);
    }else{
        this.show();
    }
};


// Show hover highlight state
DV.HighlightView.prototype.drawConnector = function(){
    if(this.active != true){
        this.viewer.elements.window.addClass('DV-highlightActivated');
        this.highlightEl.addClass('DV-highlightHover');
    }
};


// Remove hover highlight state
DV.HighlightView.prototype.removeConnector = function(force){
    if(this.active != true){
        this.viewer.elements.window.removeClass('DV-highlightActivated');
        this.highlightEl.removeClass('DV-highlightHover');
    }
};


// Show edit controls
DV.HighlightView.prototype.showEdit = function() {
    this.highlightEl.addClass('DV-editing');
    this.innerView.showEdit();
};


// Set whether clone confirm button should show
DV.HighlightView.prototype.setCloneConfirm = function(setTo){
    this.showConfirm = setTo;
    this.showConfirm ? this.highlightEl.find('.DV-cloneConfirm').css('visibility', 'visible') : this.highlightEl.find('.DV-cloneConfirm').css('visibility','hidden');
}

// Handles JavaScript history management and callbacks. To use, register a
// regexp that matches the history hash with its corresponding callback:
//
//     dc.history.register(/^#search/, controller.runSearch);
//
// And then you can save arbitrary history fragments.
//
//     dc.history.save('search/freedom/p3');
//
// Initialize history with an empty set of handlers.
// Bind to the HTML5 'onhashchange' callback, if it exists. Otherwise,
// start polling the window location.
DV.History = function(viewer) {
  this.viewer = viewer;

  // Ensure we don't accidentally bind to history twice.
  DV.History.count++;

  // The interval at which the window location is polled.
  this.URL_CHECK_INTERVAL = 500;

  // We need to use an iFrame to save history if we're in an old version of IE.
  this.USE_IFRAME = DV.jQuery.browser.msie && DV.jQuery.browser.version < 8;

  // The ordered list of history handlers matchers and callbacks.
  this.handlers = [];
  this.defaultCallback = null;

  // The current recorded window.location.hash.
  this.hash = window.location.hash;

  DV._.bindAll(this, 'checkURL');
  if (DV.History.count > 1) return;

  // Wait until the window loads.
  DV.jQuery(DV._.bind(function() {
    if (this.USE_IFRAME) this.iframe = DV.jQuery('<iframe src="javascript:0"/>').hide().appendTo('body')[0].contentWindow;
    if ('onhashchange' in window) {
      window.onhashchange = this.checkURL;
    } else {
      setInterval(this.checkURL, this.URL_CHECK_INTERVAL);
    }
  }, this));
};

DV.History.count = 0;

DV.History.prototype = {

  // Register a history handler. Pass a regular expression that can be used to
  // match your URLs, and the callback to be invoked with the remainder of the
  // hash, when matched.
  register : function(matcher, callback) {
    this.handlers.push({matcher : matcher, callback : callback});
  },

  // Save a moment into browser history. Make sure you've registered a handler
  // for it. You're responsible for pre-escaping the URL fragment.
  save : function(hash) {
    if (DV.History.count > 1) return;
    window.location.hash = this.hash = (hash ? '#' + hash : '');
    if (this.USE_IFRAME && (this.iframe && (this.hash != this.iframe.location.hash))) {
      this.iframe.document.open().close();
      this.iframe.location.hash = this.hash;
    }
  },

  // Check the current URL hash against the recorded one, firing callbacks.
  checkURL : function() {
    if (DV.History.count > 1) return;
    try {
      var current = (this.USE_IFRAME ? this.iframe : window).location.hash;
    } catch (err) {
      // IE iframe madness.
    }
    if (!current ||
      current == this.hash ||
      '#' + current == this.hash ||
      current == decodeURIComponent(this.hash)) return false;
    if (this.USE_IFRAME) window.location.hash = current;
    this.loadURL(true);
  },

  // Load the history callback associated with the current page fragment. On
  // pages that support history, this method should be called at page load,
  // after all the history callbacks have been registered.
  // executeCallbacks must be passed as true, otherwise true/false will returned based on positive route matches.
  loadURL : function(executeCallbacks) {
    var hash = this.hash = window.location.hash;

    // go through matches in reverse order so that oldest rules are executed last
    for(var i = this.handlers.length-1; i >= 0; i--){
      var match = hash.match(this.handlers[i].matcher);
      if (match) {
        if(executeCallbacks === true){
          this.handlers[i].callback.apply(this.handlers[i].callback,match.slice(1,match.length));
        }
        return true;
      }
    }
    if(this.defaultCallback != null && executeCallbacks === true){
      this.defaultCallback();
    }else{
      return false;
    }
  }

};

// A tiny js library to perform string substitution for translation

// This is intended to be the simplest thing that could possibly work
// We'll build up from there as needs arise
//
// Uses the concept of translations packs
// which are JS Modules with the following form:

// var simple_pack = {
//   code: 'eng',
//   namespace: 'main',
//   nplurals: 2,
//   pluralizer: function(n){
//     return n ? 1 : 0;
//   },
//   strings: {
//     "not_found_project":"This project (%s) does not contain any documents.",
//     "no_reviewer_on_document":[
//       "The document %2$s does not have a reviewer",
//       "There are %d reviewers on document %s."
//     ]
//   }
// };
//
// Each pack is assigned:
//   A namespace.  This is the area where it will be utilized, i.e. WS for WorkSpace, DV for Document Viewer.
//   This is needed to accomodate loading multiple translation objects in the same page,
//   such as when the Viewer is embedded into the workspace
//
//   A language code.  The ISO 639-3 code that it corresponds to.
//
//   A pluralizer function.  This is takes a number and returns the index of the string that should be used.
//   Concept originated with gettext: http://www.gnu.org/software/gettext/manual/gettext.html#Plural-forms

// Example Usage:

// var encoding = new I18n( { namespace: 'main', language: 'spa', fallback: 'eng' } );
// _.t = encoding.translate

// This could also come before the object creation
// I18n.load( simple_pack );

// using the above pack as an example:

// _.t('not_found_project','TestingOnly')
// returns: "This project (TestingOnly) does not contain any documents."
//
// _.t('no_reviewer_on_document',2,'GoodDoc')
// would return: "There are 2 reviewers on document GoodDoc."
// but _.t('no_reviewer_on_document',1,'GoodDoc')
// would return: "The document GoodDoc does not have a reviewer."


// Special care has been taken to allow differing orders of initialization.  In some cases the library may be initialized
// before the packs are loaded, or it may be initalized and then the language codes changed later.


(function(root,undefined) {
  var _ = root._, jQuery = root.jQuery;

  var previousI18n = root.I18n;

  // There can be only one!
  if ( ! _.isUndefined( root.I18n ) )
    return;

  var LOG;
  if ( root.console ){
    LOG=window.console;
  } else {
    LOG = {
      warn: jQuery.noop, error: jQuery.noop
    };
  }

  // stores all available language
  // packs
  var ALL_PACKS = {};
  // keeps references to all i18n instances that are created.
  // This way they can all be contacted for reconfiguration when additional packs are loaded
  var ALL_INSTANCES = [];

  function I18n( options ){
    this.codes    = {};
    this.sprintf = root.sprintf.noConflict();
    this.reconfigure( options );
    this.translate = _.bind( this.translate, this );
    ALL_INSTANCES.push(this);
  };

  I18n.noConflict = function(){
    root.I18n = previousI18n;
    return this;
  };

  // static method.  Stores packs for
  // later use by individual translators
  I18n.load = function( pack ){
    if ( ALL_PACKS[ pack.namespace ] )
      ALL_PACKS[ pack.namespace ].push( pack );
    else
      ALL_PACKS[ pack.namespace ] = [ pack ];

    _.each( ALL_INSTANCES, function(lib){
      lib.reconfigure();
    });
    return true;
  };

  // private(ish) method to set either the
  // language or fallback code
  I18n.prototype._set = function( type, code ){
    if ( ! code ) {
      code = root.DC_LANGUAGE_CODES ? root.DC_LANGUAGE_CODES[ type ] : 'eng';
    }
    this.codes[ type ] = code;
    this[ type ] = this.packForCode( code );
    return this[ type ];
  };

  // reconfigure the language and fallback in use
  I18n.prototype.reconfigure = function( options ){
    if (_.isUndefined(options)){
      options=this.options;
    } else {
      this.options = options;
    }
    if ( ALL_PACKS[options.namespace] ){
      this.packs = ALL_PACKS[options.namespace];
    }

    if ( options.language ){
      var pack = this._set( 'language', options.language );
      if ( pack && _.isFunction( pack['initialize'] ) ) {
        pack.initialize();
      }
    }
    if ( options.fallback )
      this._set( 'fallback', options.fallback );
  };


  I18n.prototype.packForCode = function( code ){
    return _.detect( this.packs, function( pack ){
      return pack.code == code;
    });
  };


  // our raison d'etre.
  // Looks up a translation string for a given key
  // and applies pluralization & sprintf substitions to it
  I18n.prototype.translate = function( key, args ){

    var match, pack;
    pack = this.language;
    if ( ! pack || ! ( match = pack.strings[ key ] ) ){
      LOG.warn( '[i18n] lookup for ' + key + ' in \'' +
                ( pack ? pack.code : this.options.language + ' (missing)' ) +
                '\' failed.' );
      pack = this.fallback;
      if ( ! pack || ! ( match = pack.strings[ key ] ) ){
        LOG.error( '[i18n] lookup for ' + key + ' failed in all languages' );
        return key;  // something is better than nothing (perhaps?)
      }
    };

    // if the match is an array then perform an additional lookup
    // using the pluralization lookup rules from the pack
    if ( _.isArray( match ) ){
      match = match[ pack.pluralizer( _.isUndefined(args) ? 1 : args ) ];
    }

    return this.sprintf.with_array( match, _.toArray( arguments ).slice(1) );

  };

  // export ourselves
  root.I18n = I18n;

})(this);

// // page

DV.Page = function(viewer, argHash){
    this.viewer           = viewer;

    this.index            = argHash.index;
    for(var key in argHash) this[key] = argHash[key];
    this.el               = this.viewer.$(this.el);
    this.parent           = this.el.parent();
    this.pageNumberEl     = this.el.find('span.DV-pageNumber');
    this.pageInsertEl     = this.el.find('.DV-pageNoteInsert');
    this.removedOverlayEl = this.el.find('.DV-overlay');
    this.pageImageEl      = this.getPageImage();

    this.pageEl           = this.el.find('div.DV-page');
    this.highlightContainerEl = this.el.find('div.DV-highlights');
    this.coverEl          = this.el.find('div.DV-cover');
    this.loadTimer        = null;
    this.hasLayerPage     = false;
    this.hasLayerRegional = false;
    this.imgSource        = null;


    this.offset           = null;
    this.pageNumber       = argHash.pageNumber ? argHash.pageNumber : null;
    this.zoom             = 1;
    this.highlights      = [];

    // optimizations
    var m = this.viewer.models;
    this.model_document     = m.document;
    this.model_pages        = m.pages;
    this.model_highlights  = m.highlights;
    this.model_chapters     = m.chapters;
};

// Set the image reference for the page for future updates
DV.Page.prototype.setPageImage = function(){
    this.pageImageEl = this.getPageImage();
};

// get page image to update
DV.Page.prototype.getPageImage = function(){
    return this.el.find('img.DV-pageImage');
};

// get image URL of current page
DV.Page.prototype.getPageImageURL = function(){
    return this.model_pages.imageURL(this.index);
};

// Get the offset for the page at its current index
DV.Page.prototype.getOffset = function(){
    return this.model_document.offsets[this.index];
};

DV.Page.prototype.getPageNoteHeight = function() {
    return this.model_pages.pageNoteHeights[this.index];
};

// Draw the current page and its associated layers/highlights
// Will stop if page index appears the same or force boolean is passed
DV.Page.prototype.draw = function(argHash) {
    // Return immeditately if we don't need to redraw the page.
    if(this.index === argHash.index && !argHash.force && this.imgSource == this.model_pages.imageURL(this.index)){ return; }

    this.index = (argHash.force === true) ? this.index : argHash.index;
    var _types = [];
    var source = this.getPageImageURL();

    // Set the page number as a class, for page-dependent elements.
    this.el[0].className = this.el[0].className.replace(/\s*DV-page-\d+/, '') + ' DV-page-' + (this.index + 1);

    if (this.imgSource != source) {
      this.imgSource = source;
      this.loadImage();
    }
    this.sizeImage();
    this.position();

    // Only draw highlights if page number has changed or the
    // forceHighlightRedraw flag is true.
    if(this.pageNumber != this.index+1 || argHash.forceHighlightRedraw === true){
        //If the removed page has the active highlight, hide/cancel it
        if( this.viewer.activeHighlight && (this.pageNumber == this.viewer.activeHighlight.model.page) ){
            this.viewer.activeHighlight.hide();
        }

        for(var i = 0; i < this.highlights.length;i++){
            this.highlights[i].remove();
            delete this.highlights[i];
        }
        this.highlights = [];

        // if there are highlights for this page, it will proceed and attempt to draw
        var byPage = this.viewer.schema.data.highlightsByPage[this.index];
        if (byPage) {
            // Loop through all highlights and add to page
            for (var i=0; i < byPage.length; i++) {
                var highl = byPage[i];

                if(highl.id === this.viewer.highlightToLoadId){
                    var active = true;
                    if (highl.id === this.viewer.highlightToLoadEdit) argHash.edit = true;
                    if (this.viewer.openingHighlightFromHash) {
                        this.viewer.helpers.jump(this.index, (anno.top || 0) - 37);
                        this.viewer.openingHighlightFromHash = false;
                    }
                }else{
                    var active = false;
                }

                var newHighlight = this.createHighlight(highl, active, argHash.edit);

                this.highlights.push(newHighlight);
            }
        }

        //this.pageInsertEl.toggleClass('visible', !this.hasLayerPage);
        this.renderMeta({ pageNumber: this.index+1 });

        // Draw remove overlay if page is removed.
        this.drawRemoveOverlay();
    }
};


DV.Page.prototype.drawRemoveOverlay = function() {
    this.removedOverlayEl.toggleClass('visible', !!this.viewer.models.removedPages[this.index+1]);
};


// Position Y coordinate of this page in the view based on current offset in the Document model
DV.Page.prototype.position = function(argHash){
    this.el.css({ top: this.model_document.offsets[this.index] });
    this.offset  = this.getOffset();
};


// Render the page meta, currently only the page number
DV.Page.prototype.renderMeta = function(argHash){
    this.pageNumberEl.text( DV.t('pg') + ' ' + argHash.pageNumber );
    this.pageNumber = argHash.pageNumber;
};


// Load the actual image
DV.Page.prototype.loadImage = function(argHash) {
    if(this.loadTimer){
        clearTimeout(this.loadTimer);
        delete this.loadTimer;
    }

    this.el.removeClass('DV-loaded').addClass('DV-loading');

    // On image load, update the height for the page and initiate drawImage method to resize accordingly
    var pageModel       = this.model_pages;
    var preloader       = DV.jQuery(new Image);
    var me              = this;

    var lazyImageLoader = function(){
        if(me.loadTimer){
            clearTimeout(me.loadTimer);
            delete me.loadTimer;
        }

        preloader.bind('load readystatechange',function(e) {
            if(this.complete || (this.readyState == 'complete' && e.type == 'readystatechange')){
                if (preloader != me._currentLoader) return;
                pageModel.updateHeight(preloader[0], me.index);
                me.drawImage(preloader[0].src);
                clearTimeout(me.loadTimer);
                delete me.loadTimer;
            }
        });

        var src = me.model_pages.imageURL(me.index);
        me._currentLoader = preloader;
        preloader[0].src = src;
    };

    this.loadTimer = setTimeout(lazyImageLoader, 150);
    this.viewer.pageSet.redraw(null, true);
};


DV.Page.prototype.sizeImage = function() {
    var width = this.model_pages.width;
    var height = this.model_pages.getPageHeight(this.index);

    // Resize the cover.
    this.coverEl.css({width: width, height: height});

    // Resize the image.
    this.pageImageEl.css({width: width, height: height});

    // Resize the page container.
    this.el.css({height: height, width: width});

    // Resize the page.
    this.pageEl.css({height: height, width: width});
};


// draw the image and update surrounding image containers with the right size
DV.Page.prototype.drawImage = function(imageURL) {
    var imageHeight = this.model_pages.getPageHeight(this.index);
    // var imageUrl = this.model_pages.imageURL(this.index);
    if(imageURL == this.pageImageEl.attr('src') && imageHeight == this.pageImageEl.attr('height')) {
        // already scaled and drawn
        this.el.addClass('DV-loaded').removeClass('DV-loading');
        return;
    }

    // Replace the image completely because of some funky loading bugs we were having
    this.pageImageEl.replaceWith('<img width="'+this.model_pages.width+'" height="'+imageHeight+'" class="DV-pageImage" src="'+imageURL+'" />');
    // Update element reference
    this.setPageImage();

    this.sizeImage();

    // Update the status of the image load
    this.el.addClass('DV-loaded').removeClass('DV-loading');
};


//Create Highlight
DV.Page.prototype.createHighlight = function(highl, active, edit) {
    return new DV.HighlightView(highl, this, active, edit);
};


//Create new highlight and add it to existing highlight list
DV.Page.prototype.addHighlight = function(highl){
    var newHighl = this.createHighlight(highl, false, true);
    var insertIndex = DV._.sortedIndex(this.highlights, newHighl, function(highl){
        return highl.position.top;
    });
    this.highlights.splice(insertIndex, 0, newHighl);
};


//Remove highlight from highlight list
DV.Page.prototype.removeHighlight = function(highl){
    var removeHighl = this.findHighlightView(highl.id);
    if(removeHighl) {
        removeHighl.remove();
        this.highlights = DV._.without(this.highlights, removeHighl);
        this.viewer.elements.window.removeClass('DV-coverVisible');
    }
};


//Refresh highlight
//active: Whether to make the refreshed highlight active (optional)
//edit: Whether to put refreshed highlight in edit view (optional)
DV.Page.prototype.refreshHighlight = function(highl, active, edit){
    var refreshHighl = this.findHighlightView(highl.id);
    refreshHighl.refresh(active, edit);
};


// Check page's highlights in schema and add any missing ones
DV.Page.prototype.syncHighlights = function() {
    var byPage = this.viewer.schema.data.highlightsByPage[this.index];
    if (byPage) {
        // Loop through all highlights and splice in any additions
        for (var i=0; i < byPage.length; i++) {
            var anno = byPage[i];

            if( i >= this.highlights.length || (anno.id != this.highlights[i].id) ) {
                var newAnno = this.createHighlight(anno, false, true);
                this.highlights.splice(i, 0, newAnno);
            }
        }
    }
};


//Find highlight view on page by highlight ID
DV.Page.prototype.findHighlightView = function(highlID){
    return _.find(this.highlights, function (listHighl) { return listHighl.model.id == highlID; });
}

// PageSet is a pseudo-presenter/view which manages and paints
// pages into a viewer's main display.
//
// PageSet creates three page objects, two of which are on screen
// at any one time.  The third is then updated off screen when
// the display is scrolled.
//
// PageSet is also manages zooming.
DV.PageSet = function(viewer){
    this.currentPage  = null;
    this.pages        = {};
    this.viewer       = viewer;
    this.zoomText();
};

//Return reference to page requested by sequential page #
DV.PageSet.prototype.getPageByNumber = function(pageNum){
    for(var i=0; i < 3; i++){
        if(this.pages['p' + i].pageNumber == pageNum){ return this.pages['p' + i]; }
    }
    return null;
};

// used to call the same method with the same params against all page instances
DV.PageSet.prototype.execute = function(action,params){
    this.pages.each(function(pageInstance){
        pageInstance[action].apply(pageInstance,params);
    });
};

// build the basic page presentation layer
DV.PageSet.prototype.buildPages = function(options) {
    options = options || {};
    var pages = this.getPages();

    DV._.each(pages, function(page){
        page.set  = this;

        // TODO: Make more explicit, this is sloppy
        this.pages[page.label] = new DV.Page(this.viewer, page);

        if (page.currentPage == true) { this.currentPage = this.pages[page.label]; }
    }, this);
};

// used to generate references for the build action
DV.PageSet.prototype.getPages = function(){
    var _pages = [];

    this.viewer.elements.sets.each(function(_index,el){
        var currentPage = (_index == 0) ? true : false;
        _pages.push({ label: 'p'+_index, el: el, index: _index, pageNumber: _index+1, currentPage: currentPage });
    });

    return _pages;
};

// basic reflow to ensure zoomlevel is right, pages are in the right place and highlight limits are correct
DV.PageSet.prototype.reflowPages = function() {
    this.viewer.models.pages.resize();
    this.viewer.helpers.setActiveHighlightLimits();
    this.redraw(false, true);
};

// reflow the pages without causing the container to resize or highlights to redraw
DV.PageSet.prototype.simpleReflowPages = function(){
    this.viewer.helpers.setActiveHighlightLimits();
    this.redraw(false, false);
};

// hide any active highlights and call success if not user-cancelled
DV.PageSet.prototype.cleanUp = function(success){
    var _me = this;
    var activeHighl = _me.viewer.activeHighlight;
    if(activeHighl){
        activeHighl.requestHide(true, function() {
            //Clean up mid-edit state and hide
            var content = activeHighl.content;

            var anno = content.content;
            if (anno.unsaved) {
                var highl = activeHighl.model;
                var contentRef = (content.type == 'annotation') ? {anno_id: anno.server_id} : {graph_id: anno.server_id};
                if( _me.viewer.schema.removeHighlightContent(highl, contentRef) ){
                    _me.viewer.schema.removeHighlight(highl);
                    _me.removeHighlight(highl);
                }else{
                    highl.displayIndex = 0;
                    _me.refreshHighlight(highl, false, false);
                }
            }else{
                _me.refreshHighlight(activeHighl.model, false, false);
            }

            activeHighl.hide(true);
            _me.viewer.fireCancelCallbacks(anno);
            if(success){ success.call(); }
        });
    }else{
        if(success){ success.call(); }
    }
};

DV.PageSet.prototype.zoom = function(argHash){
    if (this.viewer.models.document.zoomLevel === argHash.zoomLevel) return;

    var currentPage  = this.viewer.models.document.currentIndex();
    var oldOffset    = this.viewer.models.document.offsets[currentPage];
    var scrollPos    = this.viewer.elements.window.scrollTop();

    this.viewer.models.document.zoom(argHash.zoomLevel);

    var diff = (parseInt(scrollPos, 10)>parseInt(oldOffset, 10)) ? scrollPos - oldOffset : oldOffset - scrollPos;

    var diffPercentage = diff / this.viewer.models.pages.height;

    this.reflowPages();
    this.zoomText();

    if (this.viewer.state === 'ViewThumbnails') {
        this.viewer.thumbnails.setZoom(argHash.zoomLevel);
        this.viewer.thumbnails.lazyloadThumbnails();
    }

    if(this.viewer.activeHighlight != null){
        // FIXME:

        var args = {
            index: this.viewer.models.document.currentIndex(),
            top: this.viewer.activeHighlight.top,
            id: this.viewer.activeHighlight.id
        };
        this.viewer.activeHighlight = null;

        this.showHighlight(args);
        this.viewer.helpers.setActiveHighlightLimits(this.viewer.activeHighlight);
    }else{
        var _offset      = Math.round(this.viewer.models.pages.height * diffPercentage);
        this.viewer.helpers.jump(this.viewer.models.document.currentIndex(),_offset);
    }
};

// Zoom the text container.
DV.PageSet.prototype.zoomText = function() {
    var padding = this.viewer.models.pages.getPadding();
    var width   = this.viewer.models.pages.zoomLevel;
    this.viewer.$('.DV-textContents').width(width - padding);
    this.viewer.$('.DV-textPage').width(width);
    this.viewer.elements.collection.css({'width' : width + padding});
};

// draw the pages
DV.PageSet.prototype.draw = function(pageCollection){
    for(var i = 0, pageCollectionLength = pageCollection.length; i < pageCollectionLength;i++){
        var page = this.pages[pageCollection[i].label];
        if (page) page.draw({ index: pageCollection[i].index, pageNumber: pageCollection[i].index+1});
    }
};

DV.PageSet.prototype.redraw = function(stopResetOfPosition, redrawHighlights) {
    var _this = this;
    this.cleanUp(function(){
        if (_this.pages['p0']) _this.pages['p0'].draw({ force: true, forceHighlightRedraw : redrawHighlights });
        if (_this.pages['p1']) _this.pages['p1'].draw({ force: true, forceHighlightRedraw : redrawHighlights });
        if (_this.pages['p2']) _this.pages['p2'].draw({ force: true, forceHighlightRedraw : redrawHighlights });

        if(redrawHighlights && this.viewer.activeHighlight){
            _this.viewer.helpers.jump(_this.viewer.activeHighlight.page.index,_this.viewer.activeHighlight.position.top - 37);
        }
    });
};

//Add highlight to its page. Takes in standard (schema) hash
DV.PageSet.prototype.addHighlight = function(highl){
    this.getPageByNumber(highl.page).addHighlight(highl);
};

//Remove highlight from its page. Takes in standard (schema) anno hash
DV.PageSet.prototype.removeHighlight = function(highl){
    //If page is visible, send remove request to it
    var page = this.getPageByNumber(highl.page);
    if(page){ page.removeHighlight(highl); }
};

//Refresh highlight display. Takes in standard (schema) anno hash
//active: Whether to make the refreshed highlight active (optional)
//edit: Whether to put the refreshed highlight in edit mode (optional)
DV.PageSet.prototype.refreshHighlight = function(highl, active, edit){
    //If page is visible, send refresh request to it
    var page = this.getPageByNumber(highl.page);
    if(page){ page.refreshHighlight(highl, active, edit); }
};

// set the highlight to load ahead of time
DV.PageSet.prototype.setActiveHighlight = function(highlightId, edit){
    this.viewer.highlightToLoadId   = highlightId;
    this.viewer.highlightToLoadEdit = edit ? highlightId : null;
};

// a funky fucking mess to jump to the highlight that is active
//argHash: highlight_id, either anno_id or graph_id
DV.PageSet.prototype.showHighlight = function(argHash, showHash){
    showHash = showHash || {};

    // if state is ViewHighlight, jump to the appropriate position in the view
    // else
    // hide active highlights and locate the position of the next highlight
    // NOTE: This needs work
    if(this.viewer.state === 'ViewHighlight'){
        var offset = this.viewer.$('.DV-allHighlights div[rel=aid-'+argHash.id+']')[0].offsetTop;
        this.viewer.elements.window.scrollTop(offset+10,'fast');
        this.viewer.helpers.setActiveHighlightInNav(argHash.highlight_id);
        this.viewer.activeHighlightId = argHash.highlight_id;
    }else{
        this.viewer.helpers.removeObserver('trackHighlight');
        this.viewer.activeHighlightId = null;
        if(this.viewer.activeHighlight != null){
            this.viewer.activeHighlight.hide();
        }
        this.setActiveHighlight(argHash.highlight_id, showHash.edit);

        var offset = argHash.top - 36;

        for(var i = 0; i <= 2; i++){
            if (this.pages['p' + i]) {
                for(var n = 0; n < this.pages['p'+i].highlights.length; n++){
                    if(this.pages['p'+i].highlights[n].model.id === argHash.highlight_id){
                        this.viewer.helpers.jump(this.pages['p'+i].highlights[n].model.page - 1, offset);
                        this.pages['p'+i].highlights[n].refresh(showHash.active, showHash.edit, showHash.callbacks);
                        return;
                    }
                }
            }
        }

        //If not found in page set, jump to
        var highl = this.viewer.schema.getHighlight(argHash.highlight_id);
        this.viewer.helpers.jump((highl.page - 1),offset);
    }
};

// Create a thumbnails view for a given viewer, using a URL template, and
// the number of pages in the document.
DV.Thumbnails = function(viewer){
  this.currentIndex    = 0;
  this.zoomLevel       = null;
  this.scrollTimer     = null;
  this.imageUrl        = viewer.schema.document.resources.page.image.replace(/\{size\}/, 'small');
  this.pageCount       = viewer.schema.document.pages;
  this.viewer          = viewer;
  this.resizeId        = parseInt(DV._.uniqueId());
  this.sizes           = {
    "0": {w: 60, h: 75},
    "1": {w: 90, h: 112},
    "2": {w: 120, h: 150},
    "3": {w: 150, h: 188},
    "4": {w: 180, h: 225}
  };
  DV._.bindAll(this, 'lazyloadThumbnails', 'loadThumbnails');
};

// Render the Thumbnails from scratch.
DV.Thumbnails.prototype.render = function() {
  this.el = this.viewer.$('.DV-thumbnails');
  this.getCurrentIndex();
  this.getZoom();
  this.buildThumbnails(1, this.pageCount);
  this.setZoom();
  this.viewer.elements.window.unbind('scroll.thumbnails').bind('scroll.thumbnails', this.lazyloadThumbnails);
  var resizeEvent = 'resize.thumbnails-' + this.resizeId;
  DV.jQuery(window).unbind(resizeEvent).bind(resizeEvent, this.lazyloadThumbnails);
};

DV.Thumbnails.prototype.buildThumbnails = function(startPage, endPage) {
  if (startPage == 1) this.el.empty();
  var thumbnailsHTML = JST['DV/views/thumbnails']({
    page      : startPage,
    endPage   : endPage,
    zoom      : this.zoomLevel,
    imageUrl  : this.imageUrl
  });
  this.el.html(this.el.html() + thumbnailsHTML);
  this.highlightCurrentPage();
  DV._.defer(this.loadThumbnails);
};

DV.Thumbnails.prototype.getCurrentIndex = function() {
  this.currentIndex = this.viewer.models.document.currentIndex();
};

DV.Thumbnails.prototype.highlightCurrentPage = function() {
  this.currentIndex = this.viewer.models.document.currentIndex();
  this.viewer.$('.DV-thumbnail.DV-selected').removeClass('DV-selected');

  var currentThumbnail = this.viewer.$('.DV-thumbnail:eq('+this.currentIndex+')');
  if (currentThumbnail.length) {
    currentThumbnail.addClass('DV-selected');
    var pages = this.viewer.$('.DV-pages');
    pages.scrollTop(pages.scrollTop() + currentThumbnail.position().top - 12);
  }
};

// Set the appropriate zoomLevel class for the thumbnails, estimating
// height change.
DV.Thumbnails.prototype.setZoom = function(zoom) {
  this.getZoom(zoom);
  var size = this.sizes[this.zoomLevel];
  this.viewer.$('.DV-hasHeight').each(function(i) {
    var ratio = size.w / this.width;
    DV.jQuery(this).css({height: this.height * ratio});
  });
  this.viewer.$('.DV-hasWidth').each(function(i) {
    var ratio = size.h / this.height;
    var thisEl = DV.jQuery(this);
    thisEl.add(thisEl.prev('.DV-thumbnail-shadow')).css({width: this.width * ratio});
  });
  this.el[0].className = this.el[0].className.replace(/DV-zoom-\d\s*/, '');
  this.el.addClass('DV-zoom-' + this.zoomLevel);
};

// The thumbnails (unfortunately) have their own notion of the current zoom
// level -- specified from 0 - 4.
DV.Thumbnails.prototype.getZoom = function(zoom) {
  if (zoom != null) {
    return this.zoomLevel = DV._.indexOf(this.viewer.models.document.ZOOM_RANGES, zoom);
  } else {
    return this.zoomLevel = this.viewer.slider.slider('value');
  }
};

// After a thumbnail has been loaded, we know its height.
DV.Thumbnails.prototype.setImageSize = function(image, imageEl) {
  var size = this.sizes[this.zoomLevel];
  var ratio = size.w / image.width;
  var newHeight = image.height * ratio;
  if (Math.abs(size.h - newHeight) > 10 || (/DV-has/).test(imageEl[0].className)) {
    if (newHeight < size.h) {
      imageEl.addClass('DV-hasHeight').css({height: newHeight});
    } else {
      var heightRatio = newHeight / size.h;
      var newWidth = size.w / heightRatio;
      imageEl.add(imageEl.prev('.DV-thumbnail-shadow')).addClass('DV-hasWidth').css({width: newWidth});
    }
  }
  imageEl.attr({src: image.src});
};

// Only attempt to load the current viewport's worth of thumbnails if we've
// been sitting still for at least 1/10th of a second.
DV.Thumbnails.prototype.lazyloadThumbnails = function() {
  if (this.viewer.state != 'ViewThumbnails') return;
  if (this.scrollTimer) clearTimeout(this.scrollTimer);
  this.scrollTimer = setTimeout(this.loadThumbnails, 100);
};

// Load the currently visible thumbnails, as determined by the size and position
// of the viewport.
DV.Thumbnails.prototype.loadThumbnails = function() {
  var viewer           = this.viewer;
  var width            = viewer.$('.DV-thumbnails').width();
  var height           = viewer.elements.window.height();
  var scrollTop        = viewer.elements.window.scrollTop();
  var scrollBottom     = scrollTop + height;
  var first            = viewer.$('.DV-thumbnail:first-child');
  var firstHeight      = first.outerHeight(true);
  var firstWidth       = first.outerWidth(true);

  // Determine the top and bottom page.
  var thumbnailsPerRow = Math.floor(width / firstWidth);
  var startPage        = Math.floor(scrollTop / firstHeight * thumbnailsPerRow);
  var endPage          = Math.ceil(scrollBottom / firstHeight * thumbnailsPerRow);

  // Round to the nearest whole row (startPage and endPage are indexes, not
  // page numbers).
  startPage            -= (startPage % thumbnailsPerRow) + 1;
  endPage              += thumbnailsPerRow - (endPage % thumbnailsPerRow);

  this.loadImages(startPage, endPage);
};

// Load all of the images within a range of visible thumbnails.
DV.Thumbnails.prototype.loadImages = function(startPage, endPage) {
  var self = this;
  var viewer = this.viewer;
  var gt = startPage > 0 ? ':gt(' + startPage + ')' : '';
  var lt = endPage <= this.pageCount ? ':lt(' + endPage + ')' : '';
  viewer.$('.DV-thumbnail' + lt + gt).each(function(i) {
    var el = viewer.$(this);
    if (!el.attr('src')) {
      var imageEl = viewer.$('.DV-thumbnail-image', el);
      var image = new Image();
      DV.jQuery(image).bind('load', DV._.bind(self.setImageSize, self, image, imageEl))
                      .attr({src: imageEl.attr('data-src')});
    }
  });
};

// A tiny object to perform string substitution for translation
// No pluralization or anything fancier

// The simplest thing that could possibly work

// Initialize with an object containing
// language codes for keys and key->string for value
// i.e.
// {
//   'en': {
//     doc: 'Document',
//     annot: 'Highlight'
//   },{
//     'zh': {
//       doc:'文件'
//       annot: '註解'
//     }
//   }
//  }

(function(root,undefined) {

  var _ = root._;

  Translations = function( options ){
    this.aliases      = options.aliases || [];
    this.viewer       = options.viewer;
    this.locale       = this.viewer.schema.document.display_language || 'eng';
    options = root.DC_LANGUAGE_CODES ? root.DC_LANGUAGE_CODES : { language: this.locale, fallback: 'eng' };
    options.namespace = 'DV';
    // only initialize the i18n lib once
    // then put it into nonConflict
    if ( root.DV.I18n ){
      this.i18n = root.DV.I18n;
    } else {
      this.i18n = new I18n( options );
      root.DV.t = this.i18n.translate;
      root.DV.I18n = I18n.noConflict();
    }
  };



  // Aliases
  // we get strings like zh-cn and en-GB back from various browsers
  // We need to normalize that to a language set (where appropriate)
  //
  // since case differs between IE and chrome/firefox, the language
  // is converted to lowercase before the alias is evaluated
  //
  // an alias can be either a regex, string, or function
  // Examples:
  // { 'zh': 'zh-sg' }  // will use the zh language set for detected 'zh-sg'
  // { 'zh': ['zh-sg', 'zh-cn'] }  // use zh for both Singapore and PRC
  // { 'zh': new Regex('zh-\w{2}') }  // match anything that starts with zh-
  // { 'zh' function(lang){ return lang=='zh-cn' } } // same as the first example

  // accepts an array of aliases
  Translations.prototype.setAliases = function( aliases ){
    this.aliases = aliases || [];
    return this;
  };

  var evalAlias=function( alias, detected ){
    return ( ( _.isString(alias) && alias === detected ) ||
             ( _.isArray(alias) && -1 != alias.indexOf(detected) ) ||
             ( _.isRegExp(alias) && detected.match(alias) ) ||
             ( _.isFunction(alias) && true == alias.call( detected ) )
           );
  };

  // Sniffs the browser's navigator.language || navigator.userLanguage
  // converts it to lowercase and runs through each of the aliases
  // Sets the locale to the first matching alias
  Translations.prototype.detectLocale = function(){
    var lang = ( navigator.language || navigator.userLanguage || '' ).toLowerCase();
    for (var i = 0, l = this.aliases.length; i < l; i++) {
      var alias = this.aliases[i];
      for (var key in alias) {
        if ( alias.hasOwnProperty(key) && true === evalAlias( alias[key], lang ) ){
          lang = key;
          break;
        }
      }
    }

    if ( this.i18n.packForCode( lang ) )
      this.setLocale( lang );

    return this.locale;
  };


  Translations.prototype.setLocale = function( code ){

    if ( this.i18n.packForCode( code ) ){
      this.renderWithLocale( code );
    } else {

      var me  = this,
          url = this.viewer.schema.data.translationsURL.
            replace(/\{language\}/, code ).
            replace(/\{realm\}/, 'viewer' ) + '.json';

      root.DV.jQuery.ajax( {
        url: url,
        dataType: 'jsonp',
        success: function( translation ){
          this.i18n.load( translation );
          me.renderWithLocale( code );
        }
      } );
    }
    return this;
  };

  Translations.prototype.renderWithLocale = function( code ){
    // FIXME - The this.viewer.open('InitialLoad') call used to work, but now doesn't?
    // if ( this.locale != code ){
    //   this.locale = code;
    //   this.i18n.set('default', code );
    //   this.viewer.open('InitialLoad');
    // }
  };



})(this);

window.I18n.load({
    namespace: 'DV',
    code: 'eng',
    nplurals: 2,
    pluralizer: function(n){
        return (n != 1) ? 1 : 0;
    },

    strings: {
        "add_note_instructions":"Highlight a portion of the page, or click between pages to create a note.",
        "add_public_note":"Add a Public Note",
        "add_public_note_warn":"Public notes are visible to everyone who views this document.",
        "add_private_note":"Add a Private Note",
        "add_private_note_warn":"No one apart from you is ever allowed to view your private notes.",
        "annotated_by":"Annotated by: %s",
        "annotation_title":"Highlight Title",
        "cancel":"Cancel",
        "click_add_page_note":"Click to Add a Page Note",
        "clone":"Clone",
        "CLOSE":"CLOSE",
        "container_not_found":"Document Viewer container element not found:",
        "contents":"Contents",
        "contributed_by":"Contributed by",
        "delete":"Delete",
        "description":"Notes",
        "dl_as_pdf":"Download this document as a PDF",
        "document":"Document",
        "document_tools":"Document Tools",
        "draft":"Draft",
        "draft_note_visible":"This draft is only visible to you and collaborators.",
        "edit_data":"Edit Data",
        "expand":"Expand",
        "finish":"Finish",
        "for":"for",
        "graph_empty": "Graph setup is not complete.  Please finish graph setup before saving.",
        "install_chrome_frame":"Or, if you'd like to continue using Internet Explorer 6, you can %sinstall Google Chrome Frame%s.",
        "link_to_note":"Link to this note",
        "loading":"Loading",
        "log_in":"Log In",
        "log_out":"Log Out",
        "logged_in_as":"Logged in as %s",
        "must_upgrade":"To use the Document Viewer you need to upgrade your browser:",
        "next":"Next",
        "next_note":"Next Highlight",
        "no_title_error": "Please enter a title for the annotation.",
        "note":["Note","Notes"],
        "note_by":"Note by %s",
        "of":"of",
        "organizations_documents":"Documents belonging to %s",
        "original_document_pdf":"Original Document (PDF)",
        "page":["Page","Pages"],
        "pg":"p.",
        "previous":"Previous",
        "previous_note":"Previous Highlight",
        "print_document_help":"To print the document, click the \"Original Document\" link to open the original PDF. At this time it is not possible to print the document with highlights.",
        "print_notes":"Print Notes","private_note":"Private note",
        "private_note_visible":"This private note is only visible to you.",
        "publish":"Publish",
        "related_article":"Related Article",
        "reviewer":"Reviewer",
        "save":"Save",
        "save_as_draft":"Save as Draft",
        "search":"Search",
        "text":"Text",
        "toggle_description":"Toggle Description",
        "untitled_note":"Untitled Note",
        "view_fullscreen":"View Document in Fullscreen",
        "x_collaborators":["One Collaborator","%d Collaborators"],
        "x_documents":["%d Document","%d Documents"],
        "x_notes":["%d Note","%d Notes"],
        "x_pages":["%d Page","%d Pages"],
        "zoom":"Zoom"
    }
});

window.I18n.load({
  namespace: 'DV',
  code: 'rus',
  nplurals: 3,
  initialize: function(){
    if ( window.dc && window.dc.inflector ){
      window.dc.inflector.possessivize = function(string){ return string; };
    }
  },
  pluralizer: function(n){
    return (n%10==1 && n%100!=11 ? 0 : n%10>=2 && n%10<=4 && (n%100<10 || n%100>=20) ? 1 : 2);
  },
  strings: {"CLOSE":"\u0417\u0410\u041a\u0420\u042b\u0422\u042c","add_note_instructions":"\u0412\u044b\u0434\u0435\u043b\u0438\u0442\u0435 \u0447\u0430\u0441\u0442\u044c \u0434\u043e\u043a\u0443\u043c\u0435\u043d\u0442\u0430 \u0438\u043b\u0438 \u0449\u0435\u043b\u043a\u043d\u0438\u0442\u0435 \u043d\u0430 \u043f\u0440\u043e\u0441\u0442\u0440\u0430\u043d\u0441\u0442\u0432\u0435 \u043c\u0435\u0436\u0434\u0443 \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u0430\u043c\u0438, \u0447\u0442\u043e\u0431\u044b \u0441\u043e\u0437\u0434\u0430\u0442\u044c \u0437\u0430\u043c\u0435\u0442\u043a\u0443","add_private_note":"\u0414\u043e\u0431\u0430\u0432\u0438\u0442\u044c \u043f\u0443\u0431\u043b\u0438\u0447\u043d\u0443\u044e \u0437\u0430\u043c\u0435\u0442\u043a\u0443","add_private_note_warn":"\u0412\u0430\u0448\u0438 \u043f\u0440\u0438\u0432\u0430\u0442\u043d\u044b\u0435 \u0437\u0430\u043c\u0435\u0442\u043a\u0438 \u0432\u0438\u0434\u043d\u044b \u0442\u043e\u043b\u044c\u043a\u043e \u0432\u0430\u043c \u0438 \u043d\u0438\u043a\u043e\u043c\u0443 \u043a\u0440\u043e\u043c\u0435 \u0432\u0430\u0441.","add_public_note":"\u0414\u043e\u0431\u0430\u0432\u0438\u0442\u044c \u043f\u0443\u0431\u043b\u0438\u0447\u043d\u0443\u044e \u0437\u0430\u043c\u0435\u0442\u043a\u0443","add_public_note_warn":"\u041f\u0443\u0431\u043b\u0438\u0447\u043d\u044b\u0435 \u0437\u0430\u043c\u0435\u0442\u043a\u0438 \u0431\u0443\u0434\u0443\u0442 \u0432\u0438\u0434\u043d\u044b \u0432\u0441\u0435\u043c, \u043a\u0442\u043e \u0443\u0432\u0438\u0434\u0438\u0442 \u044d\u0442\u043e\u0442 \u0434\u043e\u043a\u0443\u043c\u0435\u043d\u0442","annotated_by":"\u0410\u0432\u0442\u043e\u0440 \u0437\u0430\u043c\u0435\u0442\u043a\u0438: %s","annotation_title":"\u041d\u0430\u0437\u0432\u0430\u043d\u0438\u0435 \u0437\u0430\u043c\u0435\u0442\u043a\u0438","cancel":"\u041e\u0442\u043c\u0435\u043d\u0430","click_add_page_note":"\u0429\u0435\u043b\u043a\u043d\u0438\u0442\u0435, \u0447\u0442\u043e\u0431\u044b \u0434\u043e\u0431\u0430\u0432\u0438\u0442\u044c \u0437\u0430\u043c\u0435\u0442\u043a\u0443","container_not_found":"\u042d\u043b\u0435\u043c\u0435\u043d\u0442 \u0432 \u043e\u043a\u043d\u0435 \u043f\u0440\u043e\u0441\u043c\u043e\u0442\u0440\u0430 \u0434\u043e\u043a\u0443\u043c\u0435\u043d\u0442\u043e\u0432 \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d:","contents":"\u0421\u043e\u0434\u0435\u0440\u0436\u0430\u043d\u0438\u0435","contributed_by":"\u0414\u043e\u0431\u0430\u0432\u043b\u0435\u043d\u043e","delete":"\u0423\u0434\u0430\u043b\u0438\u0442\u044c","description":"\u041e\u043f\u0438\u0441\u0430\u043d\u0438\u0435","dl_as_pdf":"\u0421\u043a\u0430\u0447\u0430\u0442\u044c \u044d\u0442\u043e\u0442 \u0434\u043e\u043a\u0443\u043c\u0435\u043d\u0442 \u0432 \u0432\u0438\u0434\u0435 PDF","document":["\u0414\u043e\u043a\u0443\u043c\u0435\u043d\u0442","\u0414\u043e\u043a\u0443\u043c\u0435\u043d\u0442\u044b"],"document_tools":"\u0418\u043d\u0441\u0442\u0440\u0443\u043c\u0435\u043d\u0442\u044b","draft":"\u0427\u0435\u0440\u043d\u043e\u0432\u0438\u043a","draft_note_visible":"\u042d\u0442\u043e\u0442 \u0447\u0435\u0440\u043d\u043e\u0432\u0438\u043a \u0434\u043e\u0441\u0442\u0443\u043f\u0435\u043d \u0442\u043e\u043b\u044c\u043a\u043e \u0432\u0430\u043c \u0438 \u043f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u0442\u0435\u043b\u044f\u043c, \u043a\u043e\u0442\u043e\u0440\u044b\u0445 \u0432\u044b \u0430\u0432\u0442\u043e\u0440\u0438\u0437\u043e\u0432\u0430\u043b\u0438","edit_data":"\u0420\u0435\u0434\u0430\u043a\u0442\u0438\u0440\u043e\u0432\u0430\u0442\u044c","expand":"\u041d\u0430 \u0432\u0441\u0435 \u043e\u043a\u043d\u043e","finish":"\u0413\u043e\u0442\u043e\u0432\u043e","for":"\u0434\u043b\u044f","install_chrome_frame":"\u0418\u043b\u0438, \u0435\u0441\u043b\u0438 \u0432\u044b \u0432\u0441\u0435 \u0442\u0430\u043a\u0438 \u0445\u043e\u0442\u0438\u0442\u0435 \u0434\u0430\u043b\u044c\u0448\u0435 \u0438\u0441\u043f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u0442\u044c Internet Explorer 6, \u0432\u044b \u043c\u043e\u0436\u0435\u0442\u0435 %s\u0443\u0441\u0442\u0430\u043d\u043e\u0432\u0438\u0442\u044c Google Chrome Frame%s.","link_to_note":"\u0421\u0441\u044b\u043b\u043a\u0430 \u043d\u0430 \u044d\u0442\u0443 \u0437\u0430\u043c\u0435\u0442\u043a\u0443","loading":"\u0417\u0430\u0433\u0440\u0443\u0437\u043a\u0430","log_in":"\u0412\u043e\u0439\u0442\u0438","log_out":"\u0412\u044b\u0439\u0442\u0438","logged_in_as":"\u0412\u044b \u0432\u043e\u0448\u043b\u0438 \u043a\u0430\u043a %s","must_upgrade":"\u0427\u0442\u043e\u0431\u044b \u0438\u0441\u043f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u0442\u044c \u043e\u043a\u043e\u0448\u043a\u043e \u043f\u0440\u043e\u0441\u043c\u043e\u0442\u0440\u0430 \u0434\u043e\u043a\u0443\u043c\u0435\u043d\u0442\u043e\u0432, \u0432\u0430\u043c \u043d\u0443\u0436\u043d\u043e \u043e\u0431\u043d\u043e\u0432\u0438\u0442\u044c \u0431\u0440\u0430\u0443\u0437\u0435\u0440:","next":"\u0414\u0430\u043b\u0435\u0435","next_note":"\u0421\u043b\u0435\u0434\u0443\u044e\u0449\u0430\u044f \u0437\u0430\u043c\u0435\u0442\u043a\u0430","note":["\u0417\u0430\u043c\u0435\u0442\u043a\u0430","\u0417\u0430\u043c\u0435\u0442\u043a\u0438"],"note_by":"\u0417\u0430\u043c\u0435\u0442\u043a\u0443 \u043e\u0441\u0442\u0430\u0432\u0438\u043b %s","of":"\u0438\u0437","organizations_documents":"\u0414\u043e\u043a\u0443\u043c\u0435\u043d\u0442\u044b %s","original_document_pdf":"\u041e\u0440\u0438\u0433\u0438\u043d\u0430\u043b \u0434\u043e\u043a\u0443\u043c\u0435\u043d\u0442\u0430 (PDF)","page":["\u0441\u0442\u0440\u0430\u043d\u0438\u0446\u0430","\u0441\u0442\u0440\u0430\u043d\u0438\u0446\u044b"],"pg":"\u0441.","previous":"\u041d\u0430\u0437\u0430\u0434","previous_note":"\u041f\u0440\u0435\u0434\u044b\u0434\u0443\u0449\u0430\u044f \u0437\u0430\u043c\u0435\u0442\u043a\u0430","print_document_help":"\u0427\u0442\u043e\u0431\u044b \u0440\u0430\u0441\u043f\u0435\u0447\u0430\u0442\u0430\u0442\u044c \u0434\u043e\u043a\u0443\u043c\u0435\u043d\u0442, \u043d\u0430\u0436\u043c\u0438\u0442\u0435 \u043d\u0430 \u0441\u0441\u044b\u043b\u043a\u0435 \"\u041e\u0440\u0438\u0433\u0438\u043d\u0430\u043b \u0434\u043e\u043a\u0443\u043c\u0435\u043d\u0442\u0430\" - \u0431\u0443\u0434\u0435\u0442 \u043e\u0442\u043a\u0440\u044b\u0442 \u0434\u043e\u043a\u0443\u043c\u0435\u043d\u0442 PDF. \u0418\u043c\u0435\u0439\u0442\u0435 \u0432\u0432\u0438\u0434\u0443, \u0447\u0442\u043e \u0432 \u0442\u0430\u043a\u043e\u043c \u0432\u0438\u0434\u0435 \u043d\u0430\u043f\u0435\u0447\u0430\u0442\u0430\u0442\u044c \u0437\u0430\u043c\u0435\u0442\u043a\u0438 \u0431\u0443\u0434\u0435\u0442 \u043d\u0435\u043b\u044c\u0437\u044f.","print_notes":"\u041d\u0430\u043f\u0435\u0447\u0430\u0442\u0430\u0442\u044c \u0437\u0430\u043c\u0435\u0442\u043a\u0438","private_note":"\u041f\u0440\u0438\u0432\u0430\u0442\u043d\u0430\u044f \u0437\u0430\u043c\u0435\u0442\u043a\u0430","private_note_visible":"\u042d\u0442\u0430 \u043f\u0440\u0438\u0432\u0430\u0442\u043d\u0430\u044f \u0437\u0430\u043c\u0435\u0442\u043a\u0430 \u0432\u0438\u0434\u043d\u0430 \u0442\u043e\u043b\u044c\u043a\u043e \u0432\u0430\u043c","publish":"\u041e\u043f\u0443\u0431\u043b\u0438\u043a\u043e\u0432\u0430\u0442\u044c","related_article":"\u0421\u0432\u044f\u0437\u0430\u043d\u043d\u044b\u0435 \u0441\u0442\u0430\u0442\u044c\u0438","reviewer":"\u0420\u0435\u0446\u0435\u043d\u0437\u0435\u043d\u0442","save":"\u0421\u043e\u0445\u0440\u0430\u043d\u0438\u0442\u044c","save_as_draft":"\u0421\u043e\u0445\u0440\u0430\u043d\u0438\u0442\u044c \u0447\u0435\u0440\u043d\u043e\u0432\u0438\u043a","search":"\u041f\u043e\u0438\u0441\u043a","text":"\u0422\u0435\u043a\u0441\u0442","untitled_note":"\u0417\u0430\u043c\u0435\u0442\u043a\u0430 \u0431\u0435\u0437 \u043d\u0430\u0437\u0432\u0430\u043d\u0438\u044f","view_fullscreen":"\u041e\u0442\u043a\u0440\u044b\u0442\u044c \u0434\u043e\u043a\u0443\u043c\u0435\u043d\u0442 \u043d\u0430 \u0432\u0435\u0441\u044c \u044d\u043a\u0440\u0430\u043d","x_collaborators":["\u041e\u0434\u0438\u043d \u0430\u0432\u0442\u043e\u0440\u0438\u0437\u043e\u0432\u0430\u043d\u043d\u044b\u0439 \u043f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u0442\u0435\u043b\u044c","%d \u0410\u0432\u0442\u043e\u0440\u0438\u0437\u043e\u0432\u0430\u043d\u043d\u044b\u0445 \u043f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u0442\u0435\u043b\u0435\u0439"],"x_documents":["%d \u0434\u043e\u043a\u0443\u043c\u0435\u043d\u0442","%d \u0434\u043e\u043a\u0443\u043c\u0435\u043d\u0442\u0430","%d \u0434\u043e\u043a\u0443\u043c\u0435\u043d\u0442\u043e\u0432"],"x_notes":["%d \u0417\u0430\u043c\u0435\u0442\u043a\u0430","%d \u0417\u0430\u043c\u0435\u0442\u043a\u0438"],"x_pages":["%d \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u0430","%d \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u044b","%d \u0441\u0442\u0440\u0430\u043d\u0438\u0446"],"zoom":"\u041c\u0430\u0441\u0448\u0442\u0430\u0431"}

});

window.I18n.load({
  namespace: 'DV',
  code: 'spa',
  nplurals: 2,
  pluralizer: function(n){
    return (n != 1) ? 1 : 0;
  },

  strings: {"CLOSE":"CERRAR","add_note_instructions":"Destacar una parte de la p\u00e1gina, o hacer clic entre p\u00e1ginas para crear una nota.","add_private_note":"A\u00f1adir una nota privada.","add_private_note_warn":"Nadie m\u00e1s que t\u00fa jamas podr\u00e1 ver tus notas privadas.","add_public_note":"A\u00f1adir una Nota P\u00fablica","add_public_note_warn":"Notas P\u00fablicas son visibles para todos los que vean este documento.","annotated_by":"Anotado por: %s","annotation_title":"T\u00edtulo de Anotaci\u00f3n","cancel":"Cancelar","click_add_page_note":"Haz clic para a\u00f1adir una Nota","container_not_found":"Document Viewer container element not found:","contents":"Contenidos","contributed_by":"Contribuido por","delete":"Borrar","description":"Descripci\u00f3n","dl_as_pdf":"Descargar este documento en PDF","document":["Documento","Documentos"],"document_tools":"Herramientas","draft":"Borrador","draft_note_visible":"Esta nota en borrador s\u00f3lo la pueden ver t\u00fa y tus colaboradores.","edit_data":"Editar datos","expand":"Expandir","finish":"Acabados","for":"para","install_chrome_frame":"O, si quieres continuar usando Internet Explorer 6, puedes %sinstalar Google Chrome Frame%s.","link_to_note":"Crear enlace a esta nota","loading":"Cargando","log_in":"Iniciar sesi\u00f3n\n","log_out":"Terminar la sesi\u00f3n","logged_in_as":"Conectado como %s","must_upgrade":"Necesitas actualizar tu navegador para usar el marco de inspectar los documentos:","next":"Pr\u00f3ximo","next_note":"Pr\u00f3xima Anotaci\u00f3n","note":["Nota","Notas"],"note_by":"Nota por %s","of":"de","organizations_documents":"Documentos de %s","original_document_pdf":"Documento Original (PDF)","page":["P\u00e1gina","P\u00e1ginas"],"pg":"p.","previous":"Previa","previous_note":"Previa Anotaci\u00f3n","print_document_help":"Para imprimir el documento, haz clic en el enlace \"Documento Original\" para abrir el PDF original. Por ahora, no es posible imprimir el documento con sus anotaciones.","print_notes":"Imprimir Notas","private_note":"Nota privada","private_note_visible":"This private note is only visible to you.","publish":"Publicar","related_article":"Art\u00edculo Relacionado","reviewer":"Revisor","save":"Guardar","save_as_draft":"Guardar como borrador","search":"Buscar","text":"Texto","toggle_description":"Mostrar Descripci\u00f3n","untitled_note":"Nota sin T\u00edtulo","view_fullscreen":"Ver Documento en Pantall Completa","x_collaborators":["Un Colaborador","%d Colaboradores"],"x_documents":["%d Documento","%d Documentos"],"x_notes":["Una Nota","%d Notas"],"x_pages":["Una P\u00e1gina","%d P\u00e1ginas"],"zoom":"Tama\u00f1o"}

});

window.I18n.load({
  namespace: 'DV',
  code: 'ukr',
  nplurals: 3,
  initialize: function(){
    if ( window.dc && window.dc.inflector ){
      window.dc.inflector.possessivize = function(string){ return string; };
    }
  },
  pluralizer: function(n){
    return (n%10==1 && n%100!=11 ? 0 : n%10>=2 && n%10<=4 && (n%100<10 || n%100>=20) ? 1 : 2);
  },
  strings: {"CLOSE":"\u0417\u0410\u041a\u0420\u0418\u0422\u0418","add_note_instructions":"\u0412\u0438\u0434\u0456\u043b\u0438\u0442\u044c \u0447\u0430\u0441\u0442\u0438\u043d\u0443 \u0441\u0442\u043e\u0440\u0456\u043d\u043a\u0438 \u0430\u0431\u043e \u043a\u043b\u0430\u0446\u043d\u0456\u0442\u044c \u043d\u0430 \u0437\u043e\u043d\u0443 \u043c\u0456\u0436 \u0441\u0442\u043e\u0440\u0456\u043d\u043a\u0430\u043c\u0438, \u0449\u043e\u0431 \u0441\u0442\u0432\u043e\u0440\u0438\u0442\u0438 \u043d\u043e\u0432\u0443 \u043d\u043e\u0442\u0430\u0442\u043a\u0443","add_private_note":"\u0414\u043e\u0434\u0430\u0442\u0438 \u043f\u0440\u0438\u0432\u0430\u0442\u043d\u0443 \u043d\u043e\u0442\u0430\u0442\u043a\u0443","add_private_note_warn":"\u0412\u0430\u0448\u0456 \u043f\u0440\u0438\u0432\u0430\u0442\u043d\u0456 \u043d\u043e\u0442\u0430\u0442\u043a\u0438 \u043c\u043e\u0436\u0435\u0442\u0435 \u0431\u0430\u0447\u0438\u0442\u0438 \u0442\u0456\u043b\u044c\u043a\u0438 \u0432\u0438 \u0456 \u043d\u0456\u0445\u0442\u043e \u043a\u0440\u0456\u043c \u0432\u0430\u0441.","add_public_note":"\u0414\u043e\u0434\u0430\u0442\u0438 \u043f\u0443\u0431\u043b\u0456\u0447\u043d\u0443 \u043d\u043e\u0442\u0430\u0442\u043a\u0443","add_public_note_warn":"\u041f\u0443\u0431\u043b\u0456\u0447\u043d\u0456 \u043d\u043e\u0442\u0430\u0442\u043a\u0438 \u0431\u0443\u0434\u0435 \u0432\u0438\u0434\u043d\u043e \u0432\u0441\u0456\u043c, \u0445\u0442\u043e \u043f\u043e\u0431\u0430\u0447\u0438\u0442\u044c \u0446\u0438\u0439 \u0434\u043e\u043a\u0443\u043c\u0435\u043d\u0442","annotated_by":"\u0410\u0432\u0442\u043e\u0440 \u043d\u043e\u0442\u0430\u0442\u043a\u0438: %s","annotation_title":"\u041d\u0430\u0437\u0432\u0430 \u043d\u043e\u0442\u0430\u0442\u043a\u0438","cancel":"\u0421\u043a\u0430\u0441\u0443\u0432\u0430\u0442\u0438","click_add_page_note":"\u041a\u043b\u0430\u0446\u043d\u0456\u0442\u044c, \u0449\u043e\u0431 \u0434\u043e\u0434\u0430\u0442\u0438 \u043d\u043e\u0442\u0430\u0442\u043a\u0443","container_not_found":"\u0415\u043b\u0435\u043c\u0435\u043d\u0442 \u0443 \u0432\u0456\u043a\u043e\u043d\u0446\u0456  \u043f\u0435\u0440\u0435\u0433\u043b\u044f\u0434\u0443 \u0434\u043e\u043a\u0443\u043c\u0435\u043d\u0442\u0456\u0432 \u043d\u0435 \u0437\u043d\u0430\u0439\u0434\u0435\u043d\u0438\u0439:","contents":"\u0417\u043c\u0456\u0441\u0442","contributed_by":"\u0414\u043e\u0434\u0430\u043d\u043e","delete":"\u0412\u0438\u0434\u0430\u043b\u0438\u0442\u0438","description":"\u041e\u043f\u0438\u0441","dl_as_pdf":"\u0417\u0430\u0432\u0430\u043d\u0442\u0430\u0436\u0438\u0442\u0438 \u0446\u0435\u0439 \u0434\u043e\u043a\u0443\u043c\u0435\u043d\u0442 \u0443 \u0432\u0438\u0433\u043b\u044f\u0434\u0456 PDF","document":["\u0414\u043e\u043a\u0443\u043c\u0435\u043d\u0442","\u0414\u043e\u043a\u0443\u043c\u0435\u043d\u0442\u0438"],"document_tools":"\u0406\u043d\u0441\u0442\u0440\u0443\u043c\u0435\u043d\u0442\u0438","draft":"\u0427\u0435\u0440\u043d\u0435\u0442\u043a\u0430","draft_note_visible":"\u0426\u044f \u0447\u0435\u0440\u043d\u0435\u0442\u043a\u0430 \u0434\u043e\u0441\u0442\u0443\u043f\u043d\u0430 \u0442\u0456\u043b\u044c\u043a\u0438 \u0432\u0430\u043c \u0442\u0430 \u043a\u043e\u0440\u0438\u0441\u0442\u0443\u0432\u0430\u0447\u0430\u043c, \u044f\u043a\u0438\u0445 \u0432\u0438 \u0430\u0432\u0442\u043e\u0440\u0438\u0437\u0443\u0432\u0430\u043b\u0438","edit_data":"\u0420\u0435\u0434\u0430\u0433\u0443\u0432\u0430\u0442\u0438","expand":"\u041d\u0430 \u0432\u0441\u0435 \u0432\u0456\u043a\u043d\u043e","finish":"\u0413\u043e\u0442\u043e\u0432\u043e","for":"\u0434\u043b\u044f","install_chrome_frame":"\u0410\u0431\u043e, \u044f\u043a\u0449\u043e \u0436 \u0432\u0438 \u0445\u043e\u0447\u0435\u0442\u0435 \u0456 \u0434\u0430\u043b\u0456 \u0432\u0438\u043a\u043e\u0440\u0438\u0441\u0442\u043e\u0432\u0443\u0432\u0430\u0442\u0438 Internet Explorer 6, \u0432\u0438 \u043c\u043e\u0436\u0435\u0442\u0435 %s\u0432\u0441\u0442\u0430\u043d\u043e\u0432\u0438\u0442\u0438 Google Chrome Frame%s.","link_to_note":"\u041f\u043e\u0441\u0438\u043b\u0430\u043d\u043d\u044f \u043d\u0430 \u0446\u044e \u043d\u043e\u0442\u0430\u0442\u043a\u0443","loading":"\u0417\u0430\u0432\u0430\u043d\u0442\u0430\u0436\u0435\u043d\u043d\u044f","log_in":"\u0412\u0432\u0456\u0439\u0442\u0438","log_out":"\u0412\u0438\u0439\u0442\u0438","logged_in_as":"\u0412\u0438 \u0443\u0432\u0456\u0439\u0448\u043b\u0438 \u044f\u043a  %s","must_upgrade":"\u0429\u043e\u0431 \u0432\u0438\u043a\u043e\u0440\u0438\u0441\u0442\u043e\u0432\u0443\u0432\u0430\u0442\u0438 \u0432\u0456\u043a\u043d\u043e \u043f\u0435\u0440\u0435\u0433\u043b\u044f\u0434\u0443 \u0434\u043e\u043a\u0443\u043c\u0435\u043d\u0442\u0456\u0432 , \u0432\u0430\u043c \u043f\u043e\u0442\u0440\u0456\u0431\u043d\u043e \u043e\u043d\u043e\u0432\u0438\u0442\u0438 \u0431\u0440\u0430\u0443\u0437\u0435\u0440:","next":"\u0414\u0430\u043b\u0456","next_note":"\u041d\u0430\u0441\u0442\u0443\u043f\u043d\u0430 \u043d\u043e\u0442\u0430\u0442\u043a\u0430","note":["\u041d\u043e\u0442\u0430\u0442\u043a\u0430","\u041d\u043e\u0442\u0430\u0442\u043a\u0438"],"note_by":"\u041d\u043e\u0442\u0430\u0442\u043a\u0443 \u0437\u0430\u043b\u0438\u0448\u0438\u0432 %s","of":"\u0437","organizations_documents":"\u0414\u043e\u043a\u0443\u043c\u0435\u043d\u0442\u0438 %s","original_document_pdf":"\u041e\u0440\u0438\u0433\u0456\u043d\u0430\u043b \u0434\u043e\u043a\u0443\u043c\u0435\u043d\u0442\u0443 (PDF)","page":["\u0441\u0442\u043e\u0440\u0456\u043d\u043a\u0430","\u0441\u0442\u043e\u0440\u0456\u043d\u043a\u0438"],"pg":"\u0441.","previous":"\u041d\u0430\u0437\u0430\u0434","previous_note":"\u041f\u043e\u043f\u0435\u0440\u0435\u0434\u043d\u044f \u0437\u0430\u043c\u0456\u0442\u043a\u0430","print_document_help":"\u0429\u043e\u0431 \u0440\u043e\u0437\u0434\u0440\u0443\u043a\u0443\u0432\u0430\u0442\u0438 \u0434\u043e\u043a\u0443\u043c\u0435\u043d\u0442, \u043d\u0430\u0442\u0438\u0441\u043d\u0456\u0442\u044c \u043d\u0430 \u043f\u043e\u0441\u0438\u043b\u0430\u043d\u043d\u0456 \"\u041e\u0440\u0438\u0433\u0456\u043d\u0430\u043b \u0434\u043e\u043a\u0443\u043c\u0435\u043d\u0442\u0443\" - \u0431\u0443\u0434\u0435 \u0432\u0456\u0434\u043a\u0440\u0438\u0442\u043e \u0434\u043e\u043a\u0443\u043c\u0435\u043d\u0442 PDF. \u041c\u0430\u0439\u0442\u0435 \u043d\u0430 \u0443\u0432\u0430\u0437\u0456 , \u0449\u043e \u0432 \u0442\u0430\u043a\u043e\u043c\u0443 \u0432\u0438\u0433\u043b\u044f\u0434\u0456 \u043d\u0430\u0434\u0440\u0443\u043a\u0443\u0432\u0430\u0442\u0438 \u0437\u0430\u043c\u0456\u0442\u043a\u0438 \u0431\u0443\u0434\u0435 \u043d\u0435 \u043c\u043e\u0436\u043d\u0430.","print_notes":"\u041d\u0430\u0434\u0440\u0443\u043a\u0443\u0432\u0430\u0442\u0438 \u043d\u043e\u0442\u0430\u0442\u043a\u0438","private_note":"\u041f\u0440\u0438\u0432\u0430\u0442\u043d\u0430 \u043d\u043e\u0442\u0430\u0442\u043a\u0430","private_note_visible":"\u0426\u044e \u043f\u0440\u0438\u0432\u0430\u0442\u043d\u0443 \u043d\u043e\u0442\u0430\u0442\u043a\u0443 \u043c\u043e\u0436\u0435\u0442\u0435 \u0431\u0430\u0447\u0438\u0442\u0438 \u0442\u0456\u043b\u044c\u043a\u0438 \u0432\u0438 ","publish":"\u041e\u043f\u0443\u0431\u043b\u0456\u043a\u0443\u0432\u0430\u0442\u0438","related_article":"\u041f\u043e\u0432'\u044f\u0437\u0430\u043d\u0456 \u0441\u0442\u0430\u0442\u0442\u0456","reviewer":"\u0420\u0435\u0446\u0435\u043d\u0437\u0435\u043d\u0442","save":"\u0417\u0431\u0435\u0440\u0435\u0433\u0442\u0438","save_as_draft":"\u0417\u0431\u0435\u0440\u0435\u0433\u0442\u0438 \u0447\u0435\u0440\u043d\u0435\u0442\u043a\u0443","search":"\u041f\u043e\u0448\u0443\u043a","text":"\u0422\u0435\u043a\u0441\u0442","untitled_note":"\u041d\u043e\u0442\u0430\u0442\u043a\u0430 \u0431\u0435\u0437 \u043d\u0430\u0437\u0432\u0438","view_fullscreen":"\u0412\u0456\u0434\u043a\u0440\u0438\u0442\u0438 \u0434\u043e\u043a\u0443\u043c\u0435\u043d\u0442 \u043d\u0430 \u0432\u0435\u0441\u044c \u0435\u043a\u0440\u0430\u043d","x_collaborators":["\u041e\u0434\u0438\u043d \u0430\u0432\u0442\u043e\u0440\u0438\u0437\u043e\u0432\u0430\u043d\u0438\u0439 \u043a\u043e\u0440\u0438\u0441\u0442\u0443\u0432\u0430\u0447","%d \u0410\u0432\u0442\u043e\u0440\u0438\u0437\u043e\u0432\u0430\u043d\u0438\u0445 \u043a\u043e\u0440\u0438\u0441\u0442\u0443\u0432\u0430\u0447\u0456\u0432"],"x_documents":["%d \u0434\u043e\u043a\u0443\u043c\u0435\u043d\u0442","%d \u0434\u043e\u043a\u0443\u043c\u0435\u043d\u0442\u0430","%d \u0434\u043e\u043a\u0443\u043c\u0435\u043d\u0442\u0456\u0432"],"x_notes":["%d \u041d\u043e\u0442\u0430\u0442\u043a\u0430","%d \u041d\u043e\u0442\u0430\u0442\u043a\u0438"],"x_pages":["%d \u0441\u0442\u043e\u0440\u0456\u043d\u043a\u0430","%d \u0441\u0442\u043e\u0440\u0456\u043d\u043a\u0438","%d \u0441\u0442\u043e\u0440\u0456\u043d\u043e\u043a"],"zoom":"\u041c\u0430\u0441\u0448\u0442\u0430\u0431"}

});

DV.Schema = function() {
    this.models       = {};
    this.views        = {};
    this.states       = {};
    this.helpers      = {};
    this.events       = {};
    this.elements     = {};
    this.text         = {};
    this.recommendations = null;
    this.data         = {
        zoomLevel               : 700,
        pageWidthPadding        : 20,
        additionalPaddingOnPage : 30,
        state                   : { page: { previous: 0, current: 0, next: 1 } }
    };
};

// Imports the document's JSON representation into the DV.Schema form that
// the models expect.
DV.Schema.prototype.importCanonicalDocument = function(json, view_only) {
    // Ensure that IDs start with 1 as the lowest id.
    DV._.uniqueId();
    // Ensure at least empty arrays for sections.
    json.sections               = DV._.sortBy(json.sections || [], function(sec){ return sec.page; });
    json.highlights             = json.highlights || [];
    json.canonicalURL           = json.canonical_url;
    this.document               = DV.jQuery.extend(true, {}, json);
    // Everything after this line is for back-compatibility.
    this.data.title             = json.title;
    this.data.totalPages        = !view_only ? json.pages : 1;
    this.data.totalHighlights   = json.highlights.length;
    this.data.sections          = json.sections;
    this.data.chapters          = [];
    this.data.highlightsById   = {};
    this.data.highlightsByPage = [];
    this.data.translationsURL   = json.resources.translations_url;
    DV._.each(json.highlights, DV.jQuery.proxy(this.loadHighlight, this));
};

// Load an highlight into the Schema, starting from the canonical format.
DV.Schema.prototype.loadHighlight = function(highl) {
    //Only load highlights with locations already set
    if(highl.location) {
        (!highl.id) ? highl.id = this.getUniqueID() : highl.server_id = highl.id;
        var hiModel = new DV.HighlightModel(highl);
        var idx = hiModel.get('page') - 1;
        this.data.highlightsById[hiModel.id] = hiModel;
        var page = this.data.highlightsByPage[idx] = this.data.highlightsByPage[idx] || [];
        //Generate sort by top of highlight
        var insertionIndex = DV._.sortedIndex(page, hiModel, function (h) {
            return h.get('y1');
        });

        page.splice(insertionIndex, 0, hiModel);
    }
    return hiModel;
};


//Set reference to active content: hash should contain highlight_id and either anno_id or graph_id to set as active
DV.Schema.prototype.setActiveContent = function(highlightInfo) {
    var highl = this.findHighlight({id: highlightInfo.highlight_id});
    if( "anno_id" in highlightInfo ){
        highl.displayIndex = highl.annotations.findIndex(function(anno){ return anno.server_id == highlightInfo.anno_id; });
      }else if( "graph_id" in highlightInfo ){
        highl.displayIndex = highl.graphs.findIndex(function(graph){ return graph.server_id == highlightInfo.graph_id; }) + highl.annotations.length;
    }
};


//Update an highlight-group's approval status and return it
DV.Schema.prototype.markApproval = function(highl_id, content_id, content_type, approval){
    var matchedHighl = this.getHighlight(highl_id);

    //Update content approval
    var content = ( content_type == 'annotation' ) ? matchedHighl.annotations : matchedHighl.graphs;
    for(var i=0; i < content.length; i++){
        if( content[i].get('id') == content_id ){ content[i].set({'approved': approval}) ; }
    }

    return matchedHighl;
};


//Add blank highlight content
DV.Schema.prototype.addHighlightContent = function(highl, new_content){
    if( new_content.type == 'annotation' ){
        var annoHash = {};
        if(new_content.id){
            annoHash.id         = new_content.id;
            annoHash.server_id  = new_content.id;
            annoHash.unsaved    = (new_content.text && new_content.text != '' && new_content.title && new_content.title != '') ? false : true;
        }
        if(new_content.group_id) annoHash.group_id = new_content.group_id;
        if(new_content.title) annoHash.title = new_content.title;
        if(new_content.text) annoHash.text = new_content.text;

        highl.addAnnotation(annoHash);
        highl.set({displayIndex: highl.annotations.length - 1});
    }else if( new_content.type == 'graph' ) {
        var graphHash = {};
        if(new_content.id){
            graphHash.id         = new_content.id;
            graphHash.server_id  = new_content.id;
            graphHash.unsaved    = (new_content.graph_json && new_content.graph_json != '') ? false : true;
        }
        if(new_content.graph_json) annoHash.graph_json = new_content.graph_json;
        if(new_content.group_id) graphHash.group_id = new_content.group_id;
        if(new_content.image_link) annoHash.image_link = new_content.image_link;

        highl.addGraph(graphHash);
        highl.set({displayIndex: highl.annotations.length + highl.graphs.length - 1});
    }
}

//Remove highlight-content relationship; if last one, remove total highlight.  Return true if all content is fully removed, false otherwise
DV.Schema.prototype.removeHighlightContent = function(highl, highlightInfo){
    if( "anno_id" in highlightInfo ){
        highl.removeAnnotation(highlightInfo.anno_id);
    }else if( "graph_id" in highlightInfo ){
        highl.removeGraph(highlightInfo.graph_id);
    }

    var noContent = (!highl.annotations || highl.annotations.length < 1) && (!highl.graphs || highl.graphs.length < 1);
    if(noContent) this.removeHighlight(highl);

    return noContent;
};

//Remove graph highlight
DV.Schema.prototype.removeHighlight = function(highl){
    var i = highl.page - 1;
    this.data.highlightsByPage[i] = DV._.without(this.data.highlightsByPage[i], highl);
    delete this.data.highlightsById[highl.id];
    return true;
};


//Reload highlight schema
DV.Schema.prototype.reloadHighlights = function(highls) {
    this.data.highlightsById = {};
    this.data.highlightsByPage = {};
    DV._.each(highls, DV.jQuery.proxy(this.loadHighlight, this));
};


//Match highlight data passed in with an existing highlight
DV.Schema.prototype.findHighlight = function(highl) {
    var highls = null;
    //Try ID first
    if(highl.id) { highls = _.find(this.data.highlightsById, function (listHighl) { return listHighl.server_id == highl.id; }); }
    //If no ID match, and image data exists, match on highlight image
    if(!highls && highl.location){ highls = _.find(this.data.highlightsById, function (listHighl) { return listHighl.location == highl.location; }); }

    return highls;
};


//Update highlight and one content item with data from client
//highlightInfo: standard DV/DC communication structure:
// {type:(annotation/graph), content:(highlight/content data flattened), updateAll: whether to update matching items as well}
DV.Schema.prototype.syncHighlight = function(highlightInfo) {
    var _me = this;
    var contentType = highlightInfo.type;
    var content = highlightInfo.content;
    var updateAll = highlightInfo.updateAll;

    //Try to find highlight based on ID.  If no luck, find highlight with no ID that matches location
    var highl = _.filter(this.data.highlightsById, function(listHighl){ return listHighl.server_id == content.highlight_id; });
    if(highl.length == 0){
        highl = _.filter(this.data.highlightsById, function(listHighl){ return listHighl.server_id == null && listHighl.location == content.location; });
        if(highl.length != 0){
            highl = highl[0];

            //Update highlight ID and associated refs
            highl.set({server_id: content.highlight_id});
            _me.data.highlightsById[highl.server_id] = _me.data.highlightsById[highl.id];
            delete _me.data.highlightsById[highl.id];
            highl.set({id: highl.server_id});
        }
    }else{
        highl = highl[0];
    }

    //If the content passed is an annotation..
    if( contentType == 'annotation' ){
        //Match anno.  If no luck, find anno with no ID and set that one
        var anno = highl.findAnnotation(content.id);
        if(!anno){
            anno = highl.findAnnotation(null);
            anno.set({id: content.id, server_id: content.id});
        }

        //If requested, update all with same title/text
        if(updateAll){
            annos = _.filter(highl.annotations, function(listAnno){ return listAnno.title == anno.title && listAnno.text == anno.text; });
            DV._.each(annos, function(listAnno){
                listAnno.set({
                    text:       content.content,
                    title:      content.title,
                    unsaved:    false
                });
            });
        }else{
            anno.set({
                group_id:   content.group_id,
                text:       content.content,
                title:      content.title,
                unsaved:    false
            });
        }
    }

    //If graph..
    if( contentType == 'graph' ){
        //Match anno.  If no luck, find anno with no ID and set that one
        var graph = highl.findGraph(content.id);
        if(!graph){
            graph = highl.findGraph(null);
            graph.set({id: content.id, server_id: content.id});
        }
        graph.set({
            graph_json: content.graph_json,
            group_id:   content.group_id,
            unsaved:    false
        })
    }
};


// Returns the list of highlights on a given page.
DV.Schema.prototype.getHighlightsByPage = function(_index){
    return this.schemaData.highlightsByPage[_index];
};


// Get an highlight by id, with backwards compatibility for argument hashes.
DV.Schema.prototype.getHighlight = function(identifier) {
    if (identifier.id) return this.data.highlightsById[identifier.id];
    if (identifier.index && !identifier.id) throw new Error('looked up an highlight without an id'); // TRANSLATE ??
    return this.data.highlightsById[identifier];
};


DV.Schema.prototype.getFirstHighlight = function(){
    var byPage = this.data.highlightsByPage;
    for(var i=0; i < byPage.length; i++){
        if( byPage[i] != null && byPage[i].length > 0 ){ return byPage[i][0]; }
    }

    return null;
};


DV.Schema.prototype.getLastHighlight = function(){
    var byPage = this.data.highlightsByPage;
    for(var i=byPage.length - 1; i >= 0; i--){
        if( byPage[i] != null && byPage[i].length > 0 ){ return byPage[i][byPage.length - 1]; }
    }

    return null;
};


DV.Schema.prototype.getNextHighlight = function(currentId) {
    var anno = this.data.highlightsById[currentId];
    if( anno.groupIndex < anno.groupCount ){
        //If there are more group associations in anno, advance association counter and return this anno
        anno.groupIndex++;
        return anno;
    }else{
        //Else, set this index back to 1
        anno.groupIndex = 1;

        var pid = anno.page - 1;
        var byPage = this.data.highlightsByPage;
        if( byPage[pid][byPage[pid].length - 1] == anno ){
            //If this is last anno on its page, find next page with anno.. if hit end of document, return first anno
            for(var i=(pid + 1); i < byPage.length; i++){
                if( byPage[i].length > 0 ) { return byPage[i][0]; }
            }
            return this.getFirstHighlight();
        }else{
            var nextAnno = null;
            for(var i = byPage[pid].length - 1; i >= 0; i--){
                if( byPage[pid][i] == anno ){ return nextAnno; }
                nextAnno = byPage[pid][i];
            }
        }
    }
};


DV.Schema.prototype.getPreviousHighlight = function(currentId) {
    var anno = this.data.highlightsById[currentId];
    if (anno.groupIndex != 1) {
        //If there are more group associations in anno, reduce association counter and return this anno
        anno.groupIndex--;
        return anno;
    } else {
        var returnAnno = null;
        var pid = anno.page - 1;
        var byPage = this.data.highlightsByPage;
        if (byPage[pid][0] == anno) {
            //If this is first anno on its page, find first prev page with anno.. if hit end of document, return last anno
            for (var i = (pid - 1); i >= 0; i--) {
                if (byPage[i].length > 0) {
                    returnAnno = byPage[i][byPage[i].length - 1];
                    break;
                }
            }
            if (returnAnno == null) {
                returnAnno = this.getLastHighlight();
            }
        } else {
            var prevAnno = null;
            for (var i = 0; i < byPage[pid].length; i++) {
                if (byPage[pid][i] == anno) {
                    returnAnno = prevAnno;
                    break;
                }
                prevAnno = byPage[pid][i];
            }
        }

        returnAnno.groupIndex = returnAnno.groupCount;
        return returnAnno;
    }
};


DV.Schema.prototype.setRecommendations = function(recArray){
    this.recommendations = recArray;
};


DV.Schema.prototype.getUniqueID = function(){
    var id = parseInt(DV._.uniqueId());
    while(this.data.highlightsById[id]){
        id = parseInt(DV._.uniqueId());
    }

    return id;
}
// We cache DOM references to improve speed and reduce DOM queries
DV.Schema.elements =
[
  { name: 'browserDocument',    query: document },
  { name: 'browserWindow',      query: window },
  { name: 'header',             query: 'div.DV-header'},
  { name: 'viewer',             query: 'div.DV-docViewer'},
  { name: 'window',             query: 'div.DV-pages'},
  { name: 'sets',               query: 'div.DV-set'},
  { name: 'pages',              query: 'div.DV-page'},
  { name: 'metas',              query: 'div.DV-pageMeta'},
  { name: 'bar',                query: 'div.DV-bar'},
  { name: 'currentPage',        query: 'span.DV-currentPage'},
  { name: 'well',               query: 'div.DV-well'},
  { name: 'collection',         query: 'div.DV-pageCollection'},
  //{ name: 'highlights',        query: 'div.DV-allHighlights'},
  { name: 'navigation',         query: 'div.DV-navigation' },
  //{ name: 'chaptersContainer',  query: 'div.DV-chaptersContainer' },
  { name: 'searchInput',        query: 'input.DV-searchInput' },
  { name: 'textCurrentPage',    query: 'span.DV-textCurrentPage' },
  { name: 'coverPages',         query: 'div.DV-cover' },
  { name: 'fullscreen',         query: 'div.DV-fullscreen' }
];
DV.AnnotationModel = function(argHash){
    //Set defaults
    this.access = 'public';
    this.account_id = null;
    this.approved = false;
    this.group_id = null;
    this.id = null;
    this.match_id = null;
    this.owns_note = true;
    this.server_id = null;
    this.text = '';
    this.title = '';
    this.unsaved = argHash.id ? false : true;

    //Assign initial values
    this.set(argHash);
};


DV.AnnotationModel.prototype.get = function(property){
    return this[property];
};


//Supported params: displayIndex, id, location, server_id
DV.AnnotationModel.prototype.set = function(argHash){
    DV._.each(argHash, DV.jQuery.proxy(function(element, index){
        //Whitelist parameters
        if(['access','account_id','approved','group_id','id','match_id','owns_note','server_id','text','title','unsaved'].indexOf(index) >= 0){
            this[index] = element;
        }

        //Special cases
        if(index == 'id') this.server_id = element;
        if(index == 'content') this.text = element ? element : '';
        if((index == 'title' || index == 'text') && !(element)) this[index] = '';
    }, this));
};


//Assemble content structure for DC consumption
DV.AnnotationModel.prototype.assembleContentForDC = function(){
    return {
        access: this.access,
        account_id: this.account_id,
        content: this.text,
        group_id: this.group_id,
        id: this.id,
        match_id: this.match_id,
        title: this.title,
        server_id: this.server_id,
        unsaved: this.unsaved
    };
};

DV.model.Chapters = function(viewer) {
  this.viewer = viewer;
  this.loadChapters();
};

DV.model.Chapters.prototype = {

  // Load (or reload) the chapter model from the schema's defined sections.
  loadChapters : function() {
    var sections = this.viewer.schema.data.sections;
    var chapters = this.chapters = this.viewer.schema.data.chapters = [];
    DV._.each(sections, function(sec){ sec.id || (sec.id = parseInt( DV._.uniqueId())); });
    var sectionIndex = 0;
    for (var i = 0, l = this.viewer.schema.data.totalPages; i < l; i++) {
      var section = sections[sectionIndex];
      var nextSection = sections[sectionIndex + 1];
      if (nextSection && (i >= (nextSection.page - 1))) {
        sectionIndex += 1;
        section = nextSection;
      }
      if (section && !(section.page > i + 1)) chapters[i] = section.id;
    }
  },

  getChapterId: function(index){
    return this.chapters[index];
  },

  getChapterPosition: function(chapterId){
    for(var i = 0,len=this.chapters.length; i < len; i++){
      if(this.chapters[i] === chapterId){
        return i;
      }
    }
  }
};

DV.model.Document = function(viewer){
  this.viewer                    = viewer;

  this.currentPageIndex          = 0;
  this.offsets                   = [];
  this.baseHeightsPortion        = [];
  this.baseHeightsPortionOffsets = [];
  this.paddedOffsets             = [];
  this.originalPageText          = {};
  this.totalDocumentHeight       = 0;
  this.totalPages                = 0;
  this.additionalPaddingOnPage   = 0;
  this.ZOOM_RANGES               = [500, 700, 900, 1200, 1400];

  var data                       = this.viewer.schema.data;

  this.state                     = data.state;
  this.baseImageURL              = data.baseImageURL;
  this.canonicalURL              = data.canonicalURL;
  this.additionalPaddingOnPage   = data.additionalPaddingOnPage;
  this.pageWidthPadding          = data.pageWidthPadding;
  this.totalPages                = data.totalPages;
  
  this.onPageChangeCallbacks = [];

  var zoom = this.zoomLevel = this.viewer.options.zoom || data.zoomLevel;
  if (zoom == 'auto') this.zoomLevel = data.zoomLevel;

  // The zoom level cannot go over the maximum image width.
  var maxZoom = DV._.last(this.ZOOM_RANGES);
  if (this.zoomLevel > maxZoom) this.zoomLevel = maxZoom;

  if( this.viewer.options.view_only ){
    this.view_only_anno = data.highlightsById[0];
  }
};

DV.model.Document.prototype = {

  setPageIndex : function(index) {
    this.currentPageIndex = index;
    this.viewer.elements.currentPage.text(this.currentPage());
    DV._.each(this.onPageChangeCallbacks, function(c) { c(); });
    return index;
  },
  currentPage : function() {
    return this.currentPageIndex + 1;
  },
  currentIndex : function() {
    return this.currentPageIndex;
  },
  nextPage : function() {
    var nextIndex = this.currentIndex() + 1;
    if (nextIndex >= this.totalPages) return this.currentIndex();
    return this.setPageIndex(nextIndex);
  },
  previousPage : function() {
    var previousIndex = this.currentIndex() - 1;
    if (previousIndex < 0) return this.currentIndex();
    return this.setPageIndex(previousIndex);
  },
  zoom: function(zoomLevel,force){
    if(this.zoomLevel != zoomLevel || force === true){
      this.zoomLevel   = zoomLevel;
      this.viewer.models.pages.resize(this.zoomLevel);
      this.viewer.pageSet.redraw();
      this.computeOffsets();
    }
  },

  computeOffsets: function() {
    var totalDocHeight   = 0;
    var adjustedOffset   = 0;
    var len              = this.totalPages;
    var diff             = 0;
    var scrollPos        = this.viewer.elements.window[0].scrollTop;

    for(var i = 0; i < len; i++) {
      var pageHeight     = this.viewer.models.pages.getPageHeight(i);
      var previousOffset = this.offsets[i] || 0;
      var h              = this.offsets[i] = adjustedOffset + totalDocHeight;

      if((previousOffset !== h) && (h < scrollPos)) {
        var delta = h - previousOffset - diff;
        scrollPos += delta;
        diff += delta;
      }

      this.baseHeightsPortion[i]        = Math.round((pageHeight + this.additionalPaddingOnPage) / 3);
      this.baseHeightsPortionOffsets[i] = (i == 0) ? 0 : h - this.baseHeightsPortion[i];

      totalDocHeight                    += (pageHeight + this.additionalPaddingOnPage);
    }

    // Add the sum of the page note heights to the total document height.
    totalDocHeight += adjustedOffset;

    // artificially set the scrollbar height
    if(totalDocHeight != this.totalDocumentHeight){
      diff = (this.totalDocumentHeight != 0) ? diff : totalDocHeight - this.totalDocumentHeight;
      this.viewer.helpers.setDocHeight(totalDocHeight,diff);
      this.totalDocumentHeight = totalDocHeight;
    }
  },

  getOffset: function(_index){
    return this.offsets[_index];
  },

  resetRemovedPages: function() {
    this.viewer.models.removedPages = {};
  },

  addPageToRemovedPages: function(page) {
    this.viewer.models.removedPages[page] = true;
  },

  removePageFromRemovedPages: function(page) {
    this.viewer.models.removedPages[page] = false;
  },

  redrawPages: function() {
    DV._.each(this.viewer.pageSet.pages, function(page) {
      page.drawRemoveOverlay();
    });
    if (this.viewer.thumbnails) {
      this.viewer.thumbnails.render();
    }
  },

  redrawReorderedPages: function() {
    if (this.viewer.thumbnails) {
      this.viewer.thumbnails.render();
    }
  }

};

DV.GraphModel = function(argHash){
    //Set defaults
    this.access = 'public';
    this.account_id = null;
    this.approved = false;
    this.graph_json = null;
    this.group_id = null;
    this.id = null;
    this.owns_note = true;
    this.server_id = null;
    this.unsaved = argHash.id ? false : true;

    //Assign initial values
    this.set(argHash);
};


DV.GraphModel.prototype.get = function(property){
    return this[property];
};


//Supported params: displayIndex, id, location, server_id
DV.GraphModel.prototype.set = function(argHash){
    DV._.each(argHash, DV.jQuery.proxy(function(element, index){
        //Whitelist parameters
        if(['access','account_id','approved','graph_json','group_id','id','owns_note','server_id','unsaved'].indexOf(index) >= 0){
            this[index] = element;
        }

        //Special cases
        if(index == 'id') this.server_id = element;
        if(index == 'graph_json' && element) this.graph_json = JSON.parse(element);
    }, this));
};


//Assemble content structure for DC consumption
DV.GraphModel.prototype.assembleContentForDC = function(){
    return {
        access: this.access,
        account_id: this.account_id,
        graph_json: this.graph_json,
        group_id: this.group_id,
        id: this.id,
        server_id: this.server_id,
        unsaved: this.unsaved
    };
};

DV.HighlightModel = function(argHash){
    //Set defaults
    this.annotations = [];
    this.graphs = [];

    this.displayIndex = 0;
    this.document_id = null;
    this.id = null;
    this.image_link = null;
    this.location = null;
    this.page = 0;
    this.server_id = null;
    this.x1 = null;
    this.x2 = null;
    this.y1 = null;
    this.y2 = null;

    //Assign initial values
    this.set(argHash);

    //Add content
    DV._.each(argHash.annotations, this.addAnnotation, this);
    DV._.each(argHash.graphs, this.addGraph, this);
};


DV.HighlightModel.prototype.get = function(property){
    return this[property];
};


DV.HighlightModel.prototype.set = function(argHash){
    DV._.each(argHash, DV.jQuery.proxy(function(element, index){
        //If in whitelist, set param
        if(['displayIndex','document_id','id','image_link','location','page','server_id','x1','x2','y1','y2'].indexOf(index) >= 0){
            this[index] = element;
        }

        //Special case logic
        if(index == 'location'){
            var loc = DV.jQuery.map(element.split(','), function (n, i) {
                return parseInt(n, 10);
            });
            this.y1 = loc[0];
            this.x2 = loc[1];
            this.y2 = loc[2];
            this.x1 = loc[3];
        }
    }, this));
};


DV.HighlightModel.prototype.addAnnotation = function(anno){
    this.annotations.push(new DV.AnnotationModel(anno));
};


DV.HighlightModel.prototype.addGraph = function(graph){
    this.graphs.push(new DV.GraphModel(graph));
};


DV.HighlightModel.prototype.removeAnnotation = function(anno_id){
    this.annotations.splice(this.annotations.findIndex(function(anno){ return anno.server_id == anno_id; }), 1);
    this.displayIndex = 0;
};


DV.HighlightModel.prototype.removeGraph = function(graph_id){
    this.graphs.splice(this.graphs.findIndex(function(graph){ return graph.server_id == graph_id; }), 1);
    this.displayIndex = 0;
}


//Return first (should be only) anno matching ID
DV.HighlightModel.prototype.findAnnotation = function(id){
    var annos = _.filter(this.annotations, function(listAnno){ return listAnno.server_id == id; });
    return annos ? annos[0] : null;
};


//Return first (should be only) graph matching ID
DV.HighlightModel.prototype.findGraph = function(id){
    var graphs = _.filter(this.graphs, function(listGraph){ return listGraph.server_id == id; });
    return graphs ? graphs[0] : null;
};


//Return current content for highlight and what type it is
DV.HighlightModel.prototype.getCurrentHighlightContent = function(){
    if(this.displayIndex >= this.annotations.length){
        return {type: 'graph', content: this.graphs[this.displayIndex - this.annotations.length]};
    }else{
        return {type: 'annotation', content: this.annotations[this.displayIndex]};
    }
};


//Return total count of content in highlight
DV.HighlightModel.prototype.getContentCount = function(){
    var annos = this.annotations ? this.annotations.length : 0;
    var graphs = this.graphs ? this.graphs.length : 0;
    return annos + graphs;
};


//Assemble content structure for DC consumption
DV.HighlightModel.prototype.assembleContentForDC = function(){
    var currentContent = this.getCurrentHighlightContent();
    var dcContent = {};
    dcContent.type = currentContent.type;
    dcContent.content = currentContent.content.assembleContentForDC();
    dcContent.content.document_id = this.document_id;
    dcContent.content.highlight_id = this.server_id;
    dcContent.content.image_link = this.image_link;
    dcContent.content.location = this.location;
    dcContent.content.page_number = this.page;

    //Return whether multiple title/content duos are represented in this highlight
    var other_data = _.filter(this.annotations, function(listAnno){
        return listAnno.title != dcContent.content.title || listAnno.text != dcContent.content.content;
    });
    dcContent.content.multiple_anno_data = other_data.length > 0 ? true : false;


    return dcContent;
};


//Find approval state of overall highlight based on highlight-group relationship statuses.
//Returns: 0 = unapproved, 1 = semi-approved, 2 = approved
DV.HighlightModel.prototype.getApprovalState = function(){
    var approval_state = 0;
    var all_approved = true;

    DV._.each(this.annotations, function(anno){ (anno.approved)? approval_state = 1 : all_approved = false; });
    DV._.each(this.graphs, function(graph){ (graph.approved)? approval_state = 1 : all_approved = false; });

    return (all_approved) ? 2: approval_state;
};


//Returns true if current content is duplicated in highlight; false otherwise
DV.HighlightModel.prototype.isCurrentContentDuplicated = function(){
    var currentContent = this.getCurrentHighlightContent().content;
    var dupes = _.filter(this.annotations, function(listAnno){
        return listAnno.id != currentContent.id && listAnno.title == currentContent.title && listAnno.text == currentContent.text;
    });
    return (dupes.length > 0);
}

// The Pages model represents the set of pages in the document, containing the
// image sources for each page, and the page proportions.
DV.model.Pages = function(viewer) {
  this.viewer     = viewer;

  // Rolling average page height.
  this.averageHeight   = 0;

  // Real page note heights.
  this.pageNoteHeights = [];

  // In pixels.
  this.NORMAL_WIDTH      = 700;
  this.NORMAL_HEIGHT     = 906;

  // For viewing page text.
  this.DEFAULT_PADDING = 100;

  // Embed reduces padding.
  this.REDUCED_PADDING = 44;

  // Mini padding, when < 500 px wide.
  this.MINI_PADDING    = 18;

  this.zoomLevel  = this.viewer.models.document.zoomLevel;
  this.imageWidth  = 0;
  this.imageHeight = 0;
  this.width      = Math.round(this.zoomLevel);
  this.height     = Math.round(this.width * (this.NORMAL_HEIGHT/this.NORMAL_WIDTH));
  this.numPagesLoaded = 0;
};

DV.model.Pages.prototype = {

  // Get the complete image URL for a particular page.
  imageURL: function(index) {
    var url  = this.viewer.schema.document.resources.page.image;
    var size = this.zoomLevel > this.NORMAL_WIDTH ? 'large' : 'normal';
    var pageNumber = index + 1;
    if (this.viewer.schema.document.resources.page.zeropad) pageNumber = this.zeroPad(pageNumber, 5);
    url = url.replace(/\{size\}/, size);
    url = url.replace(/\{page\}/, pageNumber);
    return url;
  },

  zeroPad : function(num, count) {
    var string = num.toString();
    while (string.length < count) string = '0' + string;
    return string;
  },

  // Return the appropriate padding for the size of the viewer.
  getPadding: function() {
    if (this.viewer.options.mini) {
      return this.MINI_PADDING;
    } else if (this.viewer.options.zoom == 'auto') {
      return this.REDUCED_PADDING;
    } else {
      return this.DEFAULT_PADDING;
    }
  },

  // The zoom factor is the ratio of the current page width to the baseline width.
  zoomFactor : function() {
    return this.zoomLevel / this.NORMAL_WIDTH;
  },

  // Resize or zoom the pages width and height.
  resize : function(zoomLevel) {
    var padding = this.viewer.models.pages.DEFAULT_PADDING;

    if (zoomLevel) {
      if (zoomLevel == this.zoomLevel) return;
      this.zoomLevel      = zoomLevel || this.zoomLevel;
      this.width          = Math.round(this.zoomLevel);
      this.height         = Math.round(this.width * (this.imageHeight/this.imageWidth));
    }

    this.viewer.elements.sets.width(this.zoomLevel);
    this.viewer.elements.collection.css({width : this.width + padding });
    this.viewer.$('.DV-textContents').css({'font-size' : this.zoomLevel * 0.02 + 'px'});
  },

  // Update the height for a page, when its real image has loaded.
  updateHeight: function(image, pageIndex) {
    this.imageWidth = image.width;
    this.imageHeight = image.height;

    this.height = this.width * (this.imageHeight/this.imageWidth);

    this.viewer.models.document.computeOffsets();
    this.viewer.pageSet.simpleReflowPages();
  },

  // get the real page height
  getPageHeight: function(pageIndex) {
    return this.height;
  }

};

// This manages events for different states activated through DV interface actions like clicks, mouseovers, etc.
DV.Schema.events = {
  // Change zoom level and causes a reflow and redraw of pages.
  zoom: function(level){
    var viewer = this.viewer;
    var continuation = function() {
      viewer.pageSet.zoom({ zoomLevel: level });
      var ranges = viewer.models.document.ZOOM_RANGES;
      viewer.dragReporter.sensitivity = ranges[ranges.length-1] == level ? 1.5 : 1;
      viewer.notifyChangedState();
      return true;
    };
    viewer.confirmStateChange ? viewer.confirmStateChange(continuation) : continuation();
  },

  // Draw (or redraw) the visible pages on the screen.
  drawPages: function() {
    if (this.viewer.state != 'ViewDocument') return;
    var doc           = this.models.document;
    var win           = this.elements.window[0];
    var offsets       = doc.baseHeightsPortionOffsets;
    var scrollPos     = this.viewer.scrollPosition = win.scrollTop;
    var midpoint      = scrollPos + (this.viewer.$(win).height() / 3);
    var currentPage   = DV._.sortedIndex(offsets, scrollPos);
    var middlePage    = DV._.sortedIndex(offsets, midpoint);
    if (offsets[currentPage] == scrollPos) currentPage++ && middlePage++;
    var pageIds       = this.helpers.sortPages(middlePage - 1);
    var total         = doc.totalPages;
    if (doc.currentPage() != currentPage) doc.setPageIndex(currentPage - 1);
    this.drawPageAt(pageIds, middlePage - 1);
  },

  // Draw the page at the given index.
  drawPageAt : function(pageIds, index) {
    if( !this.viewer.options.view_only ) {
      //Standard view
      var first = index == 0;
      var last = index == this.models.document.totalPages - 1;
      if (first) index += 1;
      var pages = [
        {label: pageIds[0], index: index - 1},
        {label: pageIds[1], index: index},
        {label: pageIds[2], index: index + 1}
      ];
      if (last) pages.pop();
      pages[first ? 0 : pages.length - 1].currentPage = true;
    }else{
      //View only (only one page from doc is shown)
      var pages = [{label: "p0", index: this.viewer.view_only_page - 1}]
    }
    this.viewer.pageSet.draw(pages);
  },

  check: function(){
    var viewer = this.viewer;
    if(viewer.busy === false){
      viewer.busy = true;
      for(var i = 0; i < this.viewer.observers.length; i++){
        this[viewer.observers[i]].call(this);
      }
      viewer.busy = false;
    }
  },

  loadText: function(pageIndex,afterLoad){

    pageIndex = (!pageIndex) ? this.models.document.currentIndex() : parseInt(pageIndex,10);
    this._previousTextIndex = pageIndex;

    var me = this;

    var processText = function(text) {

      var pageNumber = parseInt(pageIndex,10)+1;
      me.viewer.$('.DV-textContents').replaceWith('<pre class="DV-textContents">' + text + '</pre>');
      me.elements.currentPage.text(pageNumber);
      me.elements.textCurrentPage.text('p. '+(pageNumber));
      me.models.document.setPageIndex(pageIndex);

      if (me.viewer.openEditor == 'editText' &&
          !(pageNumber in me.models.document.originalPageText)) {
        me.models.document.originalPageText[pageNumber] = text;
      }
      if (me.viewer.openEditor == 'editText') {
        me.viewer.$('.DV-textContents').attr('contentEditable', true).addClass('DV-editing');
      }

      if(afterLoad) afterLoad.call(me.helpers);
    };

    if (me.viewer.schema.text[pageIndex]) {
      return processText(me.viewer.schema.text[pageIndex]);
    }

    var handleResponse = DV.jQuery.proxy(function(response) {
      processText(me.viewer.schema.text[pageIndex] = response);
    }, this);

    this.viewer.$('.DV-textContents').text('');

    var textURI = me.viewer.schema.document.resources.page.text.replace('{page}', pageIndex + 1);
    var crossDomain = this.helpers.isCrossDomain(textURI);
    if (crossDomain) textURI += '?callback=?';
    DV.jQuery[crossDomain ? 'getJSON' : 'get'](textURI, {}, handleResponse);
  },

  resetTracker: function(){
    this.viewer.activeHighlight = null;
    this.trackHighlight.combined     = null;
    this.trackHighlight.h            = null;
  },
  trackHighlight: function(){
    var viewer          = this.viewer;
    var helpers         = this.helpers;
    var scrollPosition  = this.elements.window[0].scrollTop;

    if(viewer.activeHighlight){
      var highlightView  = viewer.activeHighlight;
      var trackHighlight = this.trackHighlight;


      if(trackHighlight.id != highlightView.model.id){
        trackHighlight.id = highlightView.model.id;
        helpers.setActiveHighlightLimits(highlightView);
      }
      if(!viewer.activeHighlight.highlightEl.hasClass('DV-editing') &&
         (scrollPosition > (trackHighlight.h) || scrollPosition < trackHighlight.combined)) {
        highlightView.hide(true);
        viewer.pageSet.setActiveHighlight(null);
        viewer.activeHighlight   = null;
        trackHighlight.h         = null;
        trackHighlight.id        = null;
        trackHighlight.combined  = null;
      }
    }else{
      viewer.pageSet.setActiveHighlight(null);
      viewer.activeHighlight   = null;
      trackHighlight.h         = null;
      trackHighlight.id        = null;
      trackHighlight.combined  = null;
      helpers.removeObserver('trackHighlight');
    }
  }
};
DV.Schema.events.ViewDocument = {
  next: function(){
    var nextPage = this.models.document.nextPage();
    this.helpers.jump(nextPage);

    // this.viewer.history.save('document/p'+(nextPage+1));
  },
  previous: function(e){
    var previousPage = this.models.document.previousPage();
    this.helpers.jump(previousPage);

    // this.viewer.history.save('document/p'+(previousPage+1));
  },
  search: function(e){
    e.preventDefault();

    this.viewer.open('ViewSearch');
    return false;
  }
}
DV.Schema.events.ViewHighlight = {
  next: function(e){
    var viewer              = this.viewer;
    var activeHighlightId  = viewer.activeHighlightId;
    var nextHighlight      = (activeHighlightId === null) ?
        viewer.schema.getFirstHighlight() : viewer.schema.getNextHighlight(activeHighlightId);

    if (!nextHighlight){
      return false;
    }

    viewer.pageSet.showHighlight(nextHighlight);
    this.helpers.setHighlightPosition(nextHighlight.position);


  },
  previous: function(e){
    var viewer              = this.viewer;
    var activeHighlightId  = viewer.activeHighlightId;

    var previousHighlight = (!activeHighlightId) ?
    viewer.schema.getFirstHighlight() : viewer.schema.getPreviousHighlight(activeHighlightId);
    if (!previousHighlight){
      return false;
    }

    viewer.pageSet.showHighlight(previousHighlight);
    this.helpers.setHighlightPosition(previousHighlight.position);


  },
  search: function(e){
    e.preventDefault();
    this.viewer.open('ViewSearch');

    return false;
  }
};
DV.Schema.events.ViewSearch = {
  next: function(e){
    var nextPage = this.models.document.nextPage();
    this.loadText(nextPage);

    this.viewer.open('ViewText');
  },
  previous: function(e){
    var previousPage = this.models.document.previousPage();
    this.loadText(previousPage);

    this.viewer.open('ViewText');
  },
  search: function(e){
    e.preventDefault();
    this.helpers.getSearchResponse(this.elements.searchInput.val());

    return false;
  }
};
DV.Schema.events.ViewText = {
  next: function(e){
    var nextPage = this.models.document.nextPage();
    this.loadText(nextPage);
  },
  previous: function(e){
    var previousPage = this.models.document.previousPage();
    this.loadText(previousPage);
  },
  search: function(e){
    e.preventDefault();
    this.viewer.open('ViewSearch');

    return false;
  }
};
DV.Schema.events.ViewThumbnails = {
  next: function(){
    var nextPage = this.models.document.nextPage();
    this.helpers.jump(nextPage);
  },
  previous: function(e){
    var previousPage = this.models.document.previousPage();
    this.helpers.jump(previousPage);
  },
  search: function(e){
    e.preventDefault();

    this.viewer.open('ViewSearch');
    return false;
  }
};
DV._.extend(DV.Schema.events, {

  // #document/p[pageID]
  handleHashChangeViewDocumentPage: function(page){
    var pageIndex = parseInt(page,10) - 1;
    if(this.viewer.state === 'ViewDocument'){
      this.viewer.pageSet.cleanUp();
      this.helpers.jump(pageIndex);
    }else{
      this.models.document.setPageIndex(pageIndex);
      this.viewer.open('ViewDocument');
    }
  },

  // #p[pageID]
  handleHashChangeLegacyViewDocumentPage: function(page){
    var pageIndex   = parseInt(page,10) - 1;
    this.handleHashChangeViewDocumentPage(page);
  },

  // #document/p[pageID]/a[highlightID]
  handleHashChangeViewDocumentHighlight: function(page,highlight){
    var pageIndex   = parseInt(page,10) - 1;
    var highlight  = parseInt(highlight,10);

    if(this.viewer.state === 'ViewDocument'){
      this.viewer.pageSet.showHighlight(this.viewer.schema.data.highlightsById[highlight]);
    }else{
      this.models.document.setPageIndex(pageIndex);
      this.viewer.pageSet.setActiveHighlight(highlight);
      this.viewer.openingHighlightFromHash = true;
      this.viewer.open('ViewDocument');
    }
  },

  // #highlight/a[highlightID]
  handleHashChangeViewHighlightHighlight: function(highlight){
    var highlight  = parseInt(highlight,10);
    var viewer = this.viewer;

    if(viewer.state === 'ViewHighlight'){
      viewer.pageSet.showHighlight(this.viewer.schema.data.highlightsById[highlight]);
    }else{
      viewer.activeHighlightId = highlight;
      this.viewer.open('ViewHighlight');
    }
  },

  // Default route if all else fails
  handleHashChangeDefault: function(){
    this.viewer.pageSet.cleanUp();
    this.models.document.setPageIndex(0);

    if(this.viewer.state === 'ViewDocument'){
      this.helpers.jump(0);
      // this.viewer.history.save('document/p1');
    }else{
      this.viewer.open('ViewDocument');
    }
  },

  // #text/p[pageID]
  handleHashChangeViewText: function(page){
    var pageIndex = parseInt(page,10) - 1;
    if(this.viewer.state === 'ViewText'){
      this.events.loadText(pageIndex);
    }else{
      this.models.document.setPageIndex(pageIndex);
      this.viewer.open('ViewText');
    }
  },

  handleHashChangeViewPages: function() {
    if (this.viewer.state == 'ViewThumbnails') return;
    this.viewer.open('ViewThumbnails');
  },

  // #search/[searchString]
  handleHashChangeViewSearchRequest: function(page,query){
    var pageIndex = parseInt(page,10) - 1;
    this.elements.searchInput.val(decodeURIComponent(query));

    if(this.viewer.state !== 'ViewSearch'){
      this.models.document.setPageIndex(pageIndex);
    }
    this.viewer.open('ViewSearch');
  },

  // #entity/p[pageID]/[searchString]/[offset]:[length]
  handleHashChangeViewEntity: function(page, name, offset, length) {
    page = parseInt(page,10) - 1;
    name = decodeURIComponent(name);
    this.elements.searchInput.val(name);
    this.models.document.setPageIndex(page);
    this.states.ViewEntity(name, parseInt(offset, 10), parseInt(length, 10));
  }
});

DV._.extend(DV.Schema.events, {
  handleNavigation: function(e){
    var el          = this.viewer.$(e.target);
    var triggerEl   = el.closest('.DV-trigger');
    var noteEl      = el.closest('.DV-highlightMarker');
    var chapterEl   = el.closest('.DV-chapter');
    if (!triggerEl.length) return;

    if (el.hasClass('DV-expander')) {
      return chapterEl.toggleClass('DV-collapsed');

    }else if (noteEl.length) {
      var aid         = noteEl[0].id.replace('DV-highlightMarker-','');
      var highlight  = this.viewer.schema.getHighlight(aid);
      var pageNumber  = parseInt(highlight.index,10)+1;

      if(this.viewer.state === 'ViewText'){
        this.loadText(highlight.index);

        // this.viewer.history.save('text/p'+pageNumber);
      }else{
        if (this.viewer.state === 'ViewThumbnails') {
          this.viewer.open('ViewDocument');
        }
        this.viewer.pageSet.showHighlight(highlight);
      }

    } else if (chapterEl.length) {
      // its a header, take it to the page
      chapterEl.removeClass('DV-collapsed');
      var cid           = parseInt(chapterEl[0].id.replace('DV-chapter-',''), 10);
      var chapterIndex  = parseInt(this.models.chapters.getChapterPosition(cid),10);
      var pageNumber    = parseInt(chapterIndex,10)+1;

      if(this.viewer.state === 'ViewText'){
        this.loadText(chapterIndex);
        // this.viewer.history.save('text/p'+pageNumber);
      }else if(this.viewer.state === 'ViewDocument' ||
               this.viewer.state === 'ViewThumbnails'){
        this.helpers.jump(chapterIndex);
        // this.viewer.history.save('document/p'+pageNumber);
        if (this.viewer.state === 'ViewThumbnails') {
          this.viewer.open('ViewDocument');
        }
      }else{
        return false;
      }

    }else{
      return false;
    }
  }
});
DV.Schema.helpers = {

    HOST_EXTRACTOR : (/https?:\/\/([^\/]+)\//),

    highlightClassName: '.DV-highlight',

    // Bind all events for the docviewer
    // live/delegate are the preferred methods of event attachment
    bindEvents: function(context){
      var boundZoom = this.events.compile('zoom');
      var doc       = context.models.document;
      var value     = DV._.indexOf(doc.ZOOM_RANGES, doc.zoomLevel);
      var viewer    = this.viewer;
      viewer.slider = viewer.$('.DV-zoomBox').slider({
        step: 1,
        min: 0,
        max: 4,
        value: value,
        slide: function(el,d){
          boundZoom(context.models.document.ZOOM_RANGES[parseInt(d.value, 10)]);
        },
        change: function(el,d){
          boundZoom(context.models.document.ZOOM_RANGES[parseInt(d.value, 10)]);
        }
      });

      // next/previous
      var history         = viewer.history;
      var compiled        = viewer.compiled;
      compiled.next       = this.events.compile('next');
      compiled.previous   = this.events.compile('previous');


      var states = context.states;
      viewer.$('.DV-navControls').delegate('span.DV-next','click', compiled.next);
      viewer.$('.DV-navControls').delegate('span.DV-previous','click', compiled.previous);

      viewer.$('.DV-highlightView').delegate('.DV-trigger','click',function(e){
        e.preventDefault();
        context.open('ViewHighlight');
      });
      viewer.$('.DV-documentView').delegate('.DV-trigger','click',function(e){
        // history.save('document/p'+context.models.document.currentPage());
        context.open('ViewDocument');
      });
      viewer.$('.DV-thumbnailsView').delegate('.DV-trigger','click',function(e){
        context.open('ViewThumbnails');
      });
      viewer.$('.DV-textView').delegate('.DV-trigger','click',function(e){
        context.open('ViewText');
      });

      viewer.$('form.DV-searchDocument').submit(this.events.compile('search'));
      viewer.$('.DV-searchBar').delegate('.DV-closeSearch','click',function(e){
        e.preventDefault();
        context.open('ViewText');
      });
      viewer.$('.DV-searchBox').delegate('.DV-searchInput-cancel', 'click', DV.jQuery.proxy(this.clearSearch, this));

      viewer.$('.DV-searchResults').delegate('span.DV-resultPrevious','click', DV.jQuery.proxy(this.highlightPreviousMatch, this));

      viewer.$('.DV-searchResults').delegate('span.DV-resultNext','click', DV.jQuery.proxy(this.highlightNextMatch, this));

      // Prevent navigation elements from being selectable when clicked.
      viewer.$('.DV-trigger').bind('selectstart', function(){ return false; });

      this.elements.viewer.delegate('.DV-fullscreen', 'click', DV._.bind(this.openFullScreen, this));

      var boundToggle  = DV.jQuery.proxy(this.highlightBridgeToggle, this);
      var collection   = this.elements.collection;

      collection.delegate('.DV-highlightTab','click', boundToggle);
      collection.delegate('.DV-highlightRegion','click', DV.jQuery.proxy(this.highlightBridgeSelected, this));
      collection.delegate('.DV-highlightNext','click', DV.jQuery.proxy(this.highlightBridgeNext, this));
      collection.delegate('.DV-highlightPrevious','click', DV.jQuery.proxy(this.highlightBridgePrevious, this));
      collection.delegate('.DV-showEdit','click', DV.jQuery.proxy(this.showHighlightEdit, this));
      collection.delegate('.DV-cancelEdit','click', DV.jQuery.proxy(this.cancelHighlightEdit, this));
      collection.delegate('.DV-saveAnnotation','click', DV.jQuery.proxy(this.saveHighlight, this));
      collection.delegate('.DV-cloneConfirm', 'click', DV.jQuery.proxy(this.cloneConfirm, this));
      collection.delegate('.DV-pageNumber', 'click', DV._.bind(this.permalinkPage, this, 'document'));
      collection.delegate('.DV-textCurrentPage', 'click', DV._.bind(this.permalinkPage, this, 'text'));
      collection.delegate('.DV-annotationTitle', 'click', DV._.bind(this.permalinkHighlight, this));
      collection.delegate('.DV-permalink', 'click', DV._.bind(this.permalinkHighlight, this));

      // Thumbnails
      viewer.$('.DV-thumbnails').delegate('.DV-thumbnail-page', 'click', function(e) {
        var $thumbnail = viewer.$(e.currentTarget);
        if (!viewer.openEditor) {
          var pageIndex = $thumbnail.closest('.DV-thumbnail').attr('data-pageNumber') - 1;
          viewer.models.document.setPageIndex(pageIndex);
          viewer.open('ViewDocument');
          // viewer.history.save('document/p'+pageNumber);
        }
      });

      // Handle iPad / iPhone scroll events...
      DV._.bindAll(this, 'touchStart', 'touchMove', 'touchEnd');
      this.elements.window[0].ontouchstart  = this.touchStart;
      this.elements.window[0].ontouchmove   = this.touchMove;
      this.elements.window[0].ontouchend    = this.touchEnd;
      this.elements.well[0].ontouchstart    = this.touchStart;
      this.elements.well[0].ontouchmove     = this.touchMove;
      this.elements.well[0].ontouchend      = this.touchEnd;

      viewer.$('.DV-descriptionToggle').live('click',function(e){
        e.preventDefault();
        e.stopPropagation();

        viewer.$('.DV-descriptionText').toggle();
        viewer.$('.DV-descriptionToggle').toggleClass('DV-showDescription');
      });

      var cleanUp = DV.jQuery.proxy(viewer.pageSet.cleanUp, viewer.pageSet);

      this.elements.window.live('mousedown',
        function(e){
          var el = viewer.$(e.target);
          if (el.parents().is('.DV-highlight') || el.is('.DV-highlight')) return true;
          if(context.elements.window.hasClass('DV-coverVisible')){
            if((el.width() - parseInt(e.clientX,10)) >= 15){
              cleanUp();
            }
          }
        }
      );

      var docId = viewer.schema.document.id;

      if(DV.jQuery.browser.msie == true){
        this.elements.browserDocument.bind('focus.' + docId, DV.jQuery.proxy(this.focusWindow,this));
        this.elements.browserDocument.bind('focusout.' + docId, DV.jQuery.proxy(this.focusOut,this));
      }else{
        this.elements.browserWindow.bind('focus.' + docId, DV.jQuery.proxy(this.focusWindow,this));
        this.elements.browserWindow.bind('blur.' + docId, DV.jQuery.proxy(this.blurWindow,this));
      }

      // When the document is scrolled, even in the background, resume polling.
      this.elements.window.bind('scroll.' + docId, DV.jQuery.proxy(this.focusWindow, this));

      this.elements.coverPages.live('mousedown', function(e){ cleanUp.call(); });

      viewer.acceptInput = this.elements.currentPage.acceptInput({ changeCallBack: DV.jQuery.proxy(this.acceptInputCallBack,this) });

    },

    // Unbind jQuery events that have been bound to objects outside of the viewer.
    unbindEvents: function() {
      var viewer = this.viewer;
      var docId = viewer.schema.document.id;
      if(DV.jQuery.browser.msie == true){
        this.elements.browserDocument.unbind('focus.' + docId);
        this.elements.browserDocument.unbind('focusout.' + docId);
      }else{
        viewer.helpers.elements.browserWindow.unbind('focus.' + docId);
        viewer.helpers.elements.browserWindow.unbind('blur.' + docId);
      }
      viewer.helpers.elements.browserWindow.unbind('scroll.' + docId);
      DV._.each(viewer.observers, function(obs){ viewer.helpers.removeObserver(obs); });
    },

    // We're entering the Notes tab -- make sure that there are no data-src
    // attributes remaining.
    ensureHighlightImages : function() {
      this.viewer.$(".DV-img[data-src]").each(function() {
        var el = DV.jQuery(this);
        el.attr('src', el.attr('data-src'));
      });
    },

    startCheckTimer: function(){
      var _t = this.viewer;
      var _check = function(){
        _t.events.check();
      };
      this.viewer.checkTimer = setInterval(_check,100);
    },

    stopCheckTimer: function(){
      clearInterval(this.viewer.checkTimer);
    },

    blurWindow: function(){
      if(this.viewer.isFocus === true){
        this.viewer.isFocus = false;
        // pause draw timer
        this.stopCheckTimer();
      }else{
        return;
      }
    },

    focusOut: function(){
      if(this.viewer.activeElement != document.activeElement){
        this.viewer.activeElement = document.activeElement;
        this.viewer.isFocus = true;
      }else{
        // pause draw timer
        this.viewer.isFocus = false;
        this.viewer.helpers.stopCheckTimer();
        return;
      }
    },

    focusWindow: function(){
      if(this.viewer.isFocus === true){
        return;
      }else{
        this.viewer.isFocus = true;
        // restart draw timer
        this.startCheckTimer();
      }
    },

    touchStart : function(e) {
      e.stopPropagation();
      e.preventDefault();
      var touch = e.changedTouches[0];
      this._moved  = false;
      this._touchX = touch.pageX;
      this._touchY = touch.pageY;
    },

    touchMove : function(e) {
      var el    = e.currentTarget;
      var touch = e.changedTouches[0];
      var xDiff = this._touchX - touch.pageX;
      var yDiff = this._touchY - touch.pageY;
      el.scrollLeft += xDiff;
      el.scrollTop  += yDiff;
      this._touchX  -= xDiff;
      this._touchY  -= yDiff;
      if (yDiff != 0 || xDiff != 0) this._moved = true;
    },

    touchEnd : function(e) {
      if (!this._moved) {
        var touch     = e.changedTouches[0];
        var target    = touch.target;
        var fakeClick = document.createEvent('MouseEvent');
        while (target.nodeType !== 1) target = target.parentNode;
        fakeClick.initMouseEvent('click', true, true, touch.view, 1,
          touch.screenX, touch.screenY, touch.clientX, touch.clientY,
          false, false, false, false, 0, null);
        target.dispatchEvent(fakeClick);
      }
      this._moved = false;
    },

    // Click to open a page's permalink.
    permalinkPage : function(mode, e) {
      if (mode == 'text') {
        var number  = this.viewer.models.document.currentPage();
      } else {
        var pageId  = this.viewer.$(e.target).closest('.DV-set').attr('data-id');
        var page    = this.viewer.pageSet.pages[pageId];
        var number  = page.pageNumber;
        this.jump(page.index);
      }
      this.viewer.history.save(mode + '/p' + number);
    },

    // Click to open an highlight's permalink.
    permalinkHighlight : function(e) {
      var id   = this.viewer.$(e.target).closest('.DV-highlight').attr('data-id');
      var anno = this.viewer.schema.getHighlight(id);
      var sid  = anno.server_id || anno.id;
      if (this.viewer.state == 'ViewDocument') {
        this.viewer.pageSet.showHighlight(anno);
        this.viewer.history.save('document/p' + anno.pageNumber + '/a' + sid);
      } else {
        this.viewer.history.save('highlight/a' + sid);
      }
    },

    setDocHeight:   function(height,diff) {
      this.elements.bar.css('height', height);
      this.elements.window[0].scrollTop += diff;
    },

    getWindowDimensions: function(){
      var d = {
        height: window.innerHeight ? window.innerHeight : this.elements.browserWindow.height(),
        width: this.elements.browserWindow.width()
      };
      return d;
    },

    // Is the given URL on a remote domain?
    isCrossDomain : function(url) {
      var match = url.match(this.HOST_EXTRACTOR);
      return match && (match[1] != window.location.host);
    },

    resetScrollState: function(){
      this.elements.window.scrollTop(0);
    },

    gotoPage: function(e){
      e.preventDefault();
      var aid           = this.viewer.$(e.target).parents('.DV-highlight').attr('rel').replace('aid-','');
      var highlight    = this.viewer.schema.getHighlight(aid);
      var viewer        = this.viewer;

      if(viewer.state !== 'ViewDocument'){
        this.models.document.setPageIndex(highlight.index);
        viewer.open('ViewDocument');
        // this.viewer.history.save('document/p'+(parseInt(highlight.index,10)+1));
      }
    },

    openFullScreen : function() {
      var doc = this.viewer.schema.document;
      var url = doc.canonicalURL.replace(/#\S+$/,"");
      var currentPage = this.models.document.currentPage();

      // construct url fragment based on current viewer state
      switch (this.viewer.state) {
        case 'ViewHighlight':
          url += '#highlight/a' + this.viewer.activeHighlightId; // default to the top of the highlights page.
          break;
        case 'ViewDocument':
          url += '#document/p' + currentPage;
          break;
        case 'ViewSearch':
          url += '#search/p' + currentPage + '/' + encodeURIComponent(this.elements.searchInput.val());
          break;
        case 'ViewText':
          url += '#text/p' + currentPage;
          break;
        case 'ViewThumbnails':
          url += '#pages/p' + currentPage; // need to set up a route to catch this.
          break;
      }
      window.open(url, "documentviewer", "toolbar=no,resizable=yes,scrollbars=no,status=no");
    },

    // Determine the correct DOM page ordering for a given page index.
    sortPages : function(pageIndex) {
      if (pageIndex == 0 || pageIndex % 3 == 1) return ['p0', 'p1', 'p2'];
      if (pageIndex % 3 == 2)                   return ['p1', 'p2', 'p0'];
      if (pageIndex % 3 == 0)                   return ['p2', 'p0', 'p1'];
    },

    addObserver: function(observerName){
      this.removeObserver(observerName);
      this.viewer.observers.push(observerName);
    },

    removeObserver: function(observerName){
      var observers = this.viewer.observers;
      for(var i = 0,len=observers.length;i<len;i++){
        if(observerName === observers[i]){
          observers.splice(i,1);
        }
      }
    },

    toggleContent: function(toggleClassName){
      this.elements.viewer.removeClass('DV-viewText DV-viewSearch DV-viewDocument DV-ViewHighlights DV-viewThumbnails').addClass('DV-'+toggleClassName);
    },

    jump: function(pageIndex, modifier, forceRedraw){
      modifier = (modifier) ? parseInt(modifier, 10) : 0;
      var position = this.models.document.getOffset(parseInt(pageIndex, 10)) + modifier;
      this.elements.window[0].scrollTop = position;
      this.models.document.setPageIndex(pageIndex);
      if (forceRedraw) this.viewer.pageSet.redraw(true);
      if (this.viewer.state === 'ViewThumbnails') {
        this.viewer.thumbnails.highlightCurrentPage();
      }
    },

    shift: function(argHash){
      var windowEl        = this.elements.window;
      var scrollTopShift  = windowEl.scrollTop() + argHash.deltaY;
      var scrollLeftShift  = windowEl.scrollLeft() + argHash.deltaX;

      windowEl.scrollTop(scrollTopShift);
      windowEl.scrollLeft(scrollLeftShift);
    },

    getAppState: function(){
      var docModel = this.models.document;
      var currentPage = (docModel.currentIndex() == 0) ? 1 : docModel.currentPage();

      return { page: currentPage, zoom: docModel.zoomLevel, view: this.viewer.state };
    },

    constructPages: function(){
      var pages = [];
      var totalPagesToCreate = (this.viewer.schema.data.totalPages < 3) ? this.viewer.schema.data.totalPages : 3;

      var height = this.models.pages.height;
      for (var i = 0; i < totalPagesToCreate; i++) {
        pages.push(JST['DV/views/pages']({ pageNumber: i+1, pageIndex: i , pageImageSource: null, baseHeight: height }));
      }

      return pages.join('');
    },

    // Position the viewer on the page. For a full screen viewer, this means
    // absolute from the current y offset to the bottom of the viewport.
    positionViewer : function() {
      var offset = this.elements.viewer.position();
      this.elements.viewer.css({position: 'absolute', top: offset.top, bottom: 0, left: offset.left, right: offset.left});
    },

    unsupportedBrowser : function() {
      var browser = DV.jQuery.browser;
      if (!(browser.msie && parseFloat(browser.version, 10) <= 6.0)) return false;
      DV.jQuery(this.viewer.options.container).html(JST['DV/views/unsupported']({viewer : this.viewer}));
      return true;
    },

    registerHashChangeEvents: function(){
      var events  = this.events;
      var history = this.viewer.history;

      // Default route
      history.defaultCallback = DV._.bind(events.handleHashChangeDefault,this.events);

      // Handle page loading
      history.register(/document\/p(\d*)$/, DV._.bind(events.handleHashChangeViewDocumentPage,this.events));
      // Legacy NYT stuff
      history.register(/p(\d*)$/, DV._.bind(events.handleHashChangeLegacyViewDocumentPage,this.events));
      history.register(/p=(\d*)$/, DV._.bind(events.handleHashChangeLegacyViewDocumentPage,this.events));

      // Handle highlight loading in document view
      history.register(/document\/p(\d*)\/a(\d*)$/, DV._.bind(events.handleHashChangeViewDocumentHighlight,this.events));

      // Handle highlight loading in highlight view
      history.register(/highlight\/a(\d*)$/, DV._.bind(events.handleHashChangeViewHighlightHighlight,this.events));

      // Handle loading of the pages view
      history.register(/pages$/, DV._.bind(events.handleHashChangeViewPages, events));

      // Handle page loading in text view
      history.register(/text\/p(\d*)$/, DV._.bind(events.handleHashChangeViewText,this.events));

      // Handle entity display requests.
      history.register(/entity\/p(\d*)\/(.*)\/(\d+):(\d+)$/, DV._.bind(events.handleHashChangeViewEntity,this.events));

      // Handle search requests
      history.register(/search\/p(\d*)\/(.*)$/, DV._.bind(events.handleHashChangeViewSearchRequest,this.events));
    },

    // Sets up the zoom slider to match the appropriate for the specified
    // initial zoom level, and real document page sizes.
    autoZoomPage: function() {
      var windowWidth = this.elements.window.outerWidth(true);
      var zoom;
      if (this.viewer.options.zoom == 'auto') {
        zoom = Math.min(700, windowWidth - (this.viewer.models.pages.getPadding() * 2));
      } else {
        zoom = this.viewer.options.zoom;
      }

      // Setup ranges for auto-width zooming
      // A document's zoom slider scales depending on the size of the viewer
      // and the default zoom level
      var ranges = [];
      if (zoom <= 500) {
        var medium   = 700;
        var smallest = zoom;
        var small    = (smallest + medium) / 2; // avg between medium and smallest
        ranges = [smallest, small, medium, 1200, 1400];
      } else if (zoom <= 750) {
        var small    = zoom;
        var smallest = 0.66*small;
        var medium   = ((1400 - 700) / 3) + small; // ???
        var large    = ((1400 - 700) / 3)*2 + small;
        ranges = [smallest, small, medium, large, 1400];
      } else if (750 < zoom && zoom <= 850){
        var small    = 700;
        var largest  = 1400;
        var medium   = zoom;
        var smallest = 0.66*medium;
        var large    = ((largest - medium) / 2) + medium; // midpoint between medium and largest
        ranges = [smallest, small, medium, large, largest];
      } else if (850 < zoom && zoom < 1400){
        var large    = zoom;
        var smallest = 0.66*large;
        var small    = 700;
        var medium   = ((large - small) / 2) + small; // midpoint between large and small
        ranges = [smallest, small, medium, large, 1400];
      } else if (zoom >= 1000) {
        zoom = 1000;
        ranges = this.viewer.models.document.ZOOM_RANGES;
      }

      this.viewer.models.document.ZOOM_RANGES = ranges;
      this.viewer.slider.slider({'value': parseInt(DV._.indexOf(ranges, zoom), 10)});
      this.events.zoom(zoom);
    },

    handleInitialState: function(){
      var initialRouteMatch = this.viewer.history.loadURL(true);
      if(!initialRouteMatch) {
        var opts = this.viewer.options;
        this.viewer.open('ViewDocument');
        if (opts.note) {
          this.viewer.pageSet.showHighlight(this.viewer.schema.data.highlightsById[opts.note]);
        } else if (opts.page) {
          this.jump(opts.page - 1);
        }
      }
    },

  initializeLanguage: function(){
    if ( ! this.translations ){
      this.translations = new Translations( {
        viewer       : this.viewer,
        aliases      : DV.Schema.helpers.TranslationAliases,
        autoDetect   : true
      });
    }
  }

};

 // Renders the navigation sidebar for chapters and highlights.
DV._.extend(DV.Schema.helpers, {

  showHighlights : function() {
    if (this.viewer.options.showHighlights === false) return false;
    return DV._.size(this.viewer.schema.data.highlightsById) > 0;
  },

  renderViewer: function(){
    var doc         = this.viewer.schema.document;
    var pagesHTML   = this.constructPages();
    var description = (doc.description) ? doc.description : null;
    var storyURL = doc.resources.related_article;

    var headerHTML  = JST['DV/views/header']({
      options     : this.viewer.options,
      id          : doc.id,
      story_url   : storyURL,
      title       : doc.title || ''
    });
    var footerHTML = JST['DV/views/footer']({options : this.viewer.options});

    var pdfURL = doc.resources.pdf;
    pdfURL = pdfURL && this.viewer.options.pdf !== false ? '<a target="_blank" href="' + pdfURL + '">' + DV.t('original_document_pdf') + ' &raquo;</a>' : '';

    var contribs = doc.contributor && doc.contributor_organization &&
                   ('' + doc.contributor + ', '+ doc.contributor_organization);

    var showHighlights = this.showHighlights();
    var printNotesURL = (showHighlights) && doc.resources.print_highlights;

    var viewerOptions = {
      options : this.viewer.options,
      pages: pagesHTML,
      header: headerHTML,
      footer: footerHTML,
      pdf_url: pdfURL,
      contributors: contribs,
      story_url: storyURL,
      print_notes_url: printNotesURL,
      descriptionContainer: JST['DV/views/descriptionContainer']({ description: description}),
      autoZoom: this.viewer.options.zoom == 'auto',
      mini: false
    };

    var width  = this.viewer.options.width;
    var height = this.viewer.options.height;
    if (width && height) {
      if (width < 500) {
        this.viewer.options.mini = true;
        viewerOptions.mini = true;
      }
      DV.jQuery(this.viewer.options.container).css({
        position: 'relative',
        width: this.viewer.options.width,
        height: this.viewer.options.height
      });
    }

    var container = this.viewer.options.container;
    var containerEl = DV.jQuery(container);
    if (!containerEl.length) throw "Document Viewer container element not found: " + container; // TRANSLATE?
    if( this.viewer.options.layout == 'vertical' ){ containerEl.html(JST['DV/views/viewerVertical'](viewerOptions)); }
    else{ containerEl.html(JST['DV/views/viewerHorizontal'](viewerOptions)); }
  },

  // If there is no description, no navigation, and no sections, tighten up
  // the sidebar.
  displayNavigation : function() {
    var doc = this.viewer.schema.document;
    var missing = (!doc.description && !DV._.size(this.viewer.schema.data.highlightsById) && !this.viewer.schema.data.sections.length);
    this.viewer.$('.DV-supplemental').toggleClass('DV-noNavigation', missing);
  },

  renderSpecificPageCss : function() {
    var classes = [];
    for (var i = 1, l = this.models.document.totalPages; i <= l; i++) {
      classes.push('.DV-page-' + i + ' .DV-pageSpecific-' + i);
    }
    var css = classes.join(', ') + ' { display: block; }';
    var stylesheet = '<style type="text/css" media="all">\n' + css +'\n</style>';
    DV.jQuery("head").append(stylesheet);
  },

  renderNavigation : function() {
    var me = this;
    var chapterViews = [], bolds = [], expandIcons = [], expanded = [], navigationExpander = JST['DV/views/navigationExpander']({}),nav=[],notes = [],chapters = [];
    var boldsId = this.viewer.models.boldsId || (this.viewer.models.boldsId = parseInt(DV._.uniqueId()));

    /* ---------------------------------------------------- start the nav helper methods */
    var getAnnotionsByRange = function(rangeStart, rangeEnd){
      var highlights = [];
      for(var i = rangeStart, len = rangeEnd; i < len; i++){
        if(notes[i]){
          highlights.push(notes[i]);
          nav[i] = '';
        }
      }
      return highlights.join('');
    };

    var createChapter = function(chapter){
      var selectionRule = "#DV-selectedChapter-" + chapter.id + " #DV-chapter-" + chapter.id;

      bolds.push(selectionRule+" .DV-navChapterTitle");
      return (JST['DV/views/chapterNav'](chapter));
    };

    var createNavHighlights = function(highlightIndex){
      var renderedHighlights = [];
      var highlights = me.viewer.schema.data.highlightsByPage[highlightIndex];

      for (var j=0; j<highlights.length; j++) {
        var highlight = highlights[j];
        renderedHighlights.push(JST['DV/views/highlightNav'](highlight));
        bolds.push("#DV-selectedHighlight-" + highlight.id + " #DV-highlightMarker-" + highlight.id + " .DV-navHighlightTitle");
      }
      return renderedHighlights.join('');
    };
    /* ---------------------------------------------------- end the nav helper methods */

    if (this.showHighlights()) {
      for(var i = 0,len = this.models.document.totalPages; i < len;i++){
        if(this.viewer.schema.data.highlightsByPage[i]){
          nav[i]   = createNavHighlights(i);
          notes[i] = nav[i];
        }
      }
    }

    var sections = this.viewer.schema.data.sections;
    if (sections.length) {
      for (var i = 0; i < sections.length; i++) {
        var section        = sections[i];
        var nextSection    = sections[i + 1];
        section.id         = section.id || parseInt(DV._.uniqueId());
        section.pageNumber = section.page;
        section.endPage    = nextSection ? nextSection.page - 1 : this.viewer.schema.data.totalPages;
        var highlights    = getAnnotionsByRange(section.pageNumber - 1, section.endPage);

        if(highlights != '') {
          section.navigationExpander       = navigationExpander;
          section.navigationExpanderClass  = 'DV-hasChildren';
          section.noteViews                = highlights;
          nav[section.pageNumber - 1]      = createChapter(section);
        } else {
          section.navigationExpanderClass  = 'DV-noChildren';
          section.noteViews                = '';
          section.navigationExpander       = '';
          nav[section.pageNumber - 1]      = createChapter(section);
        }
      }
    }

    // insert and observe the nav
    var navigationView = nav.join('');

    var chaptersContainer = this.viewer.$('div.DV-chaptersContainer');
    chaptersContainer.html(navigationView);
    chaptersContainer.unbind('click').bind('click',this.events.compile('handleNavigation'));
    this.viewer.schema.data.sections.length || DV._.size(this.viewer.schema.data.highlightsById) ?
       chaptersContainer.show() : chaptersContainer.hide();
    this.displayNavigation();

    DV.jQuery('#DV-navigationBolds-' + boldsId, DV.jQuery("head")).remove();
    var boldsContents = bolds.join(", ") + ' { font-weight:bold; color:#000 !important; }';
    var navStylesheet = '<style id="DV-navigationBolds-' + boldsId + '" type="text/css" media="screen,print">\n' + boldsContents +'\n</style>';
    DV.jQuery("head").append(navStylesheet);
    chaptersContainer = null;
  },

  // Hide or show all of the components on the page that may or may not be
  // present, depending on what the document provides.
  renderComponents : function() {
    // Hide the overflow of the body, unless we're positioned.
    var containerEl = DV.jQuery(this.viewer.options.container);
    var position = containerEl.css('position');
    if (position != 'relative' && position != 'absolute' && !this.viewer.options.fixedSize) {
      //DV.jQuery("html, body").css({overflow : 'hidden'});
      // Hide the border, if we're a full-screen viewer in the body tag.
      if (containerEl.offset().top == 0) {
        this.viewer.elements.viewer.css({border: 0});
      }
    }

    // Hide and show navigation flags:
    var showHighlights = this.showHighlights();
    var showPages       = this.models.document.totalPages > 1;
    var showSearch      = (this.viewer.options.search !== false) &&
                          (this.viewer.options.text !== false) &&
                          (!this.viewer.options.width || this.viewer.options.width >= 540);
    var noFooter = (!showHighlights && !showPages && !showSearch && !this.viewer.options.sidebar);


    // Hide highlights, if there are none:
    var $highlightsView = this.viewer.$('.DV-highlightView');
    $highlightsView[showHighlights ? 'show' : 'hide']();

    // Hide the text tab, if it's disabled.
    if (showSearch) {
      this.elements.viewer.addClass('DV-searchable');
      this.viewer.$('input.DV-searchInput', containerEl).placeholder({
        message: 'Search',
        clearClassName: 'DV-searchInput-show-search-cancel'
      });
    } else {
      this.viewer.$('.DV-textView').hide();
    }

    // Hide the Pages tab if there is only 1 page in the document.
    if (!showPages) {
      this.viewer.$('.DV-thumbnailsView').hide();
    }

    // Hide the Documents tab if it's the only tab left.
    if (!showHighlights && !showPages && !showSearch) {
      this.viewer.$('.DV-views').hide();
    }

    this.viewer.api.roundTabCorners();

    // Hide the entire sidebar, if there are no highlights or sections.
    //var showChapters = this.models.chapters.chapters.length > 0;

    // Remove and re-render the nav controls.
    // Don't show the nav controls if there's no sidebar, and it's a one-page doc.
    this.viewer.$('.DV-navControls').remove();
    if (showPages || this.viewer.options.sidebar) {
      var navControls = JST['DV/views/navControls']({
        totalPages: this.viewer.schema.data.totalPages,
        totalHighlights: this.viewer.schema.data.totalHighlights
      });
      this.viewer.$('.DV-navControlsContainer').html(navControls);
    }
    this.viewer.$('.DV-fullscreenControl').remove();
    if (this.viewer.schema.document.canonicalURL) {
      var fullscreenControl = JST['DV/views/fullscreenControl']({});
      if (noFooter) {
        this.viewer.$('.DV-collapsibleControls').prepend(fullscreenControl);
        this.elements.viewer.addClass('DV-hideFooter');
      } else {
        this.viewer.$('.DV-fullscreenContainer').html(fullscreenControl);
      }
    }

    if (this.viewer.options.sidebar) {
      this.viewer.$('.DV-sidebar').show();
    }

    // Check if the zoom is showing, and if not, shorten the width of search
    DV._.defer(DV._.bind(function() {
      if ((this.elements.viewer.width() <= 700) && (showHighlights || showPages || showSearch)) {
        this.viewer.$('.DV-controls').addClass('DV-narrowControls');
      }
    }, this));

    // Set the currentPage element reference.
    this.elements.currentPage = this.viewer.$('span.DV-currentPage');
    this.models.document.setPageIndex(this.models.document.currentIndex());
  },

  // Reset the view state to a baseline, when transitioning between views.
  reset : function() {
    this.resetNavigationState();
    this.cleanUpSearch();
    this.viewer.pageSet.cleanUp();
    this.removeObserver('drawPages');
    this.viewer.dragReporter.unBind();
    this.elements.window.scrollTop(0);
  }

});

//#####################
//# Helpers for event handling
//#####################

DV._.extend(DV.Schema.helpers,{
    getViewFromEvent : function(e) {
        return this.getHighlightObject(this.viewer.$(e.target).closest(this.highlightClassName));
    },


    showHighlightEdit : function(e) {
        var highl = this.getViewFromEvent(e);
        highl.show({edit: true});
    },


    cancelHighlightEdit : function(e) {
        this.viewer.pageSet.cleanUp();
    },


    saveHighlight : function(e) {
        var highl = this.getViewFromEvent(e);
        if (!highl.model) return;

        var content = highl.model.getCurrentHighlightContent();
        content.type == 'graph' ? this.saveGraph(highl) : this.prepareForPointSave(highl);
    },


    cloneConfirm : function(e) {
        var highl = this.getViewFromEvent(e);
        if (!highl.model) return;

        this.viewer.fireCloneCallbacks(highl.model.assembleContentForDC());
    },


    saveGraph : function(highl){
        var graphData = this.viewer.$('.DV-graphData', highl.highlightEl).val();

        //Error checking
        if (graphData.length == 0) {
            this.viewer.$('.DV-errorMsg', highl.highlightEl).html(DV.t('graph_empty'));
            return;
        }

        var content = highl.model.assembleContentForDC();
        content.content.graph_json = this.viewer.$('.DV-graphData', highl.highlightEl).val();

        highl.highlightEl.removeClass('DV-editing');
        this.viewer.fireSaveCallbacks(content);
    },


    prepareForPointSave : function(highl){
        var _this = this;

        //Error checking
        if ($.trim(this.viewer.$('.DV-annotationTitleInput', highl.highlightEl).val()).length == 0) {
            this.viewer.$('.DV-annotationTitleInput', highl.highlightEl).addClass('error');
            this.viewer.$('.DV-errorMsg', highl.highlightEl).html(DV.t('no_title_error'));
            return;
        }

        //If multiple copies of annotation on highlight, find out if all should be updated
        if( highl.model.isCurrentContentDuplicated() ){
            $('#dupeAlert').dialog({
                modal: true,
                dialogClass: 'dv-dialog',
                height: 100,
                buttons: [
                    {
                        text: "Yes",
                        click: function() {
                            _this.saveDataPoint(highl, true);
                            $(this).dialog( "close" );
                        }
                    },
                    {
                        text: "No",
                        click: function() {
                            _this.saveDataPoint(highl, false);
                            $(this).dialog( "close" );
                        }
                    }
                ]
            });
        }else{
            //If no duplicates, just save normally
            _this.saveDataPoint(highl, false);
        }


    },


    saveDataPoint: function(highl, updateAll){
        var postToDC = highl.model.assembleContentForDC();
        postToDC.content.access                 = 'public';
        postToDC.content.author                 = postToDC.content.author || dc.account.name;
        postToDC.content.author_organization    = postToDC.content.author_organization || (dc.account.isReal && dc.account.organization.name);
        postToDC.content.content                = this.viewer.$('.DV-annotationTextArea', highl.highlightEl).val();
        postToDC.content.title                  = this.viewer.$('.DV-annotationTitleInput', highl.highlightEl).val();
        postToDC.content.unsaved                = false;
        postToDC.content.updateAll              = updateAll;

        this.viewer.fireSaveCallbacks(postToDC);
    }
});

DV._.extend(DV.Schema.helpers, {
    // Set of bridges to access highlight methods

    getHighlightModel : function(annoEl) {
        var annoId = parseInt(annoEl.attr('data-id').match(/\d+/), 10);
        return this.viewer.schema.getHighlight(annoId);
    },

    // Return the highlight Object that connects with the element in the DOM
    getHighlightObject: function(highlight){
        var highlight    = this.viewer.$(highlight);
        var highlightId  = highlight.attr('id').replace(/DV\-highlight\-|DV\-listHighlight\-/,'');
        var pageId       = highlight.closest('div.DV-set').attr('data-id');

        for(var i = 0; (highlightObject = this.viewer.pageSet.pages[pageId].highlights[i]); i++){
            if(highlightObject.model.id == highlightId){
                // cleanup
                highlight = null;
                return highlightObject;
            }
        }

        return false;
    },

    // Toggle
    highlightBridgeToggle: function(e){
        e.preventDefault();
        var highlightObject = this.getHighlightObject(this.viewer.$(e.target).closest(this.highlightClassName));
        highlightObject.toggle();
    },

    // Show highlight
    highlightBridgeSelected: function(e){
        e.preventDefault();
        var highlightObject = this.getHighlightObject(this.viewer.$(e.target).closest(this.highlightClassName));
        this.viewer.fireSelectCallbacks(highlightObject.model.assembleContentForDC());
    },

    // Hide highlight
    highlightBridgeHide: function(e){
        e.preventDefault();
        var highlightObject = this.getHighlightObject(this.viewer.$(e.target).closest(this.highlightClassName));
        highlightObject.hide(true);
    },

    // Jump to the next highlight
    highlightBridgeNext: function(e){
        e.preventDefault();
        var highlightObject = this.getHighlightObject(this.viewer.$(e.target).closest(this.highlightClassName));
        highlightObject.next();
    },

    // Jump to the previous highlight
    highlightBridgePrevious: function(e){
        e.preventDefault();
        var highlightObject = this.getHighlightObject(this.viewer.$(e.target).closest(this.highlightClassName));
        highlightObject.previous();
    },

    // Update currentpage text to indicate current highlight
    setHighlightPosition: function(_position){
        this.elements.currentPage.text(_position);
    },

    // Update active highlight limits
    setActiveHighlightLimits: function(highlight){
        var highlight = (highlight) ? highlight : this.viewer.activeHighlight;

        if(!highlight || highlight == null){ return; }

        var elements  = this.elements;
        var aPage     = highlight.page;
        var aEl       = highlight.highlightEl;
        var aPosTop   = highlight.position.top * this.models.pages.zoomFactor();
        var _trackHighlight = this.events.trackHighlight;

        if(highlight.type === 'page'){
            _trackHighlight.h          = aEl.outerHeight()+aPage.getOffset();
            _trackHighlight.combined   = (aPage.getOffset()) - elements.window.height();
        }else{
            _trackHighlight.h          = aEl.height()+aPosTop-20+aPage.getOffset()+aPage.getPageNoteHeight();
            _trackHighlight.combined   = (aPosTop-20+aPage.getOffset()+aPage.getPageNoteHeight()) - elements.window.height();
        }
    }
});
DV._.extend(DV.Schema.helpers, {
  resetNavigationState: function(){
    var elements = this.elements;

    if (elements.navigation.length) elements.navigation[0].id = '';
  },
  setActiveChapter: function(chapterId){
    if (chapterId) this.elements.chaptersContainer.attr('id','DV-selectedChapter-'+chapterId);
  },
  setActiveHighlightInNav: function(highlightId){
    if(highlightId != null){
      this.elements.navigation.attr('id','DV-selectedHighlight-'+highlightId);
    }else{
      this.elements.navigation.attr('id','');
    }
  }
});

DV._.extend(DV.Schema.helpers, {
  getSearchResponse: function(query){
    var handleResponse = DV.jQuery.proxy(function(response){
      this.viewer.searchResponse = response;
      var hasResults = (response.results.length > 0) ? true : false;

      var text = hasResults ? 'of '+response.results.length + ' ' : ' ';
      this.viewer.$('span.DV-totalSearchResult').text(text);
      this.viewer.$('span.DV-searchQuery').text(response.query);
      if (hasResults) {
        // this.viewer.history.save('search/p'+response.results[0]+'/'+response.query);
        var currentPage = this.viewer.models.document.currentPage();
        var page = (DV._.include(response.results, currentPage)) ? currentPage : response.results[0];
        this.events.loadText(page - 1, this.highlightSearchResponses);
      } else {
        this.highlightSearchResponses();
      }
    }, this);

    var failResponse = function() {
      this.viewer.$('.DV-currentSearchResult').text('Search is not available at this time');
      this.viewer.$('span.DV-searchQuery').text(query);
      this.viewer.$('.DV-searchResults').addClass('DV-noResults');
    };

    var searchURI = this.viewer.schema.document.resources.search.replace('{query}', encodeURIComponent(query));
    if (this.viewer.helpers.isCrossDomain(searchURI)) searchURI += '&callback=?';
    DV.jQuery.ajax({url : searchURI, dataType : 'json', success : handleResponse, error : failResponse});
  },
  acceptInputCallBack: function(){
    var pageIndex = parseInt(this.elements.currentPage.text(),10) - 1;
    // sanitize input

    pageIndex       = (pageIndex === '') ? 0 : pageIndex;
    pageIndex       = (pageIndex < 0) ? 0 : pageIndex;
    pageIndex       = (pageIndex+1 > this.models.document.totalPages) ? this.models.document.totalPages-1 : pageIndex;
    var pageNumber  = pageIndex+1;

    this.elements.currentPage.text(pageNumber);
    this.viewer.$('.DV-pageNumberContainer input').val(pageNumber);

    if(this.viewer.state === 'ViewDocument' ||
       this.viewer.state === 'ViewThumbnails'){
      // this.viewer.history.save('document/p'+pageNumber);
      this.jump(pageIndex);
    }else if(this.viewer.state === 'ViewText'){
      // this.viewer.history.save('text/p'+pageNumber);
      this.events.loadText(pageIndex);
    }

  },
  highlightSearchResponses: function(){
    var viewer    = this.viewer;
    var response  = viewer.searchResponse;

    if(!response) return false;

    var results         = response.results;
    var currentResultEl = this.viewer.$('.DV-currentSearchResult');

    if (results.length == 0){
      currentResultEl.text('No Results');
      this.viewer.$('.DV-searchResults').addClass('DV-noResults');
    }else{
      this.viewer.$('.DV-searchResults').removeClass('DV-noResults');
    }
    for(var i = 0; i < response.results.length; i++){
      if(this.models.document.currentPage() === response.results[i]){
        currentResultEl.text('Page ' + (i+1) + ' ');
        break;
      }
    }

    // Replaces spaces in query with `\s+` to match newlines in textContent,
    // escape regex char contents (like "()"), and only match on word boundaries.
    var boundary          = '(\\b|\\B)';
    var query             = boundary + '('+response.query.replace(/[-[\]{}()*+?.,\\^$|#]/g, "\\$&").replace(/\s+/g, '\\s+')+')' + boundary;
    var textContent       = this.viewer.$('.DV-textContents');
    var currentPageText   = textContent.text();
    var pattern           = new RegExp(query,"ig");
    var replacement       = currentPageText.replace(pattern,'$1<span class="DV-searchMatch">$2</span>$3');

    textContent.html(replacement);

    var highlightIndex = (viewer.toHighLight) ? viewer.toHighLight : 0;
    this.highlightMatch(highlightIndex);

    // cleanup
    currentResultEl = null;
    textContent     = null;

  },
  // Highlight a single instance of an entity on the page. Make sure to
  // convert into proper UTF8 before trying to get the entity length, and
  // then back into UTF16 again.
  highlightEntity: function(offset, length) {
    this.viewer.$('.DV-searchResults').addClass('DV-noResults');
    var textContent = this.viewer.$('.DV-textContents');
    var text        = textContent.text();
    var pre         = text.substr(0, offset);
    var entity      = text.substr(offset, length);
    var post        = text.substr(offset + length);
    text            = [pre, '<span class="DV-searchMatch">', entity, '</span>', post].join('');
    textContent.html(text);
    this.highlightMatch(0);
  },

  highlightMatch: function(index){
    var highlightsOnThisPage   = this.viewer.$('.DV-textContents span.DV-searchMatch');
    if (highlightsOnThisPage.length == 0) return false;
    var currentPageIndex    = this.getCurrentSearchPageIndex();
    var toHighLight         = this.viewer.toHighLight;

    if(toHighLight){
      if(toHighLight !== false){
        if(toHighLight === 'last'){
          index = highlightsOnThisPage.length - 1;
        }else if(toHighLight === 'first'){
          index = 0;
        }else{
          index = toHighLight;
        }
      }
      toHighLight = false;
    }
    var searchResponse = this.viewer.searchResponse;
    if (searchResponse) {
      if(index === (highlightsOnThisPage.length)){

        if(searchResponse.results.length === currentPageIndex+1){
          return;
        }
        toHighLight = 'first';
        this.events.loadText(searchResponse.results[currentPageIndex + 1] - 1,this.highlightSearchResponses);

        return;
      }else if(index === -1){
        if(currentPageIndex-1 < 0){
          return  false;
        }
        toHighLight = 'last';
        this.events.loadText(searchResponse.results[currentPageIndex - 1] - 1,this.highlightSearchResponses);

        return;
      }
      highlightsOnThisPage.removeClass('DV-highlightedMatch');
    }

    var match = this.viewer.$('.DV-textContents span.DV-searchMatch:eq('+index+')');
    match.addClass('DV-highlightedMatch');

    this.elements.window[0].scrollTop = match.position().top - 50;
    if (searchResponse) searchResponse.highlighted = index;

    // cleanup
    highlightsOnThisPage = null;
    match = null;
  },
  getCurrentSearchPageIndex: function(){
    var searchResponse = this.viewer.searchResponse;
    if(!searchResponse) {
      return false;
    }
    var docModel = this.models.document;
    for(var i = 0,len = searchResponse.results.length; i<len;i++){
      if(searchResponse.results[i] === docModel.currentPage()){
        return i;
      }
    }
  },
  highlightPreviousMatch: function(e){
    e.preventDefault();
    this.highlightMatch(this.viewer.searchResponse.highlighted-1);
  },
  highlightNextMatch: function(e){
    e.preventDefault(e);
    this.highlightMatch(this.viewer.searchResponse.highlighted+1);
  },

  clearSearch: function(e) {
    this.elements.searchInput.val('').keyup().focus();
  },

  showEntity: function(name, offset, length) {
    this.viewer.$('span.DV-totalSearchResult').text('');
    this.viewer.$('span.DV-searchQuery').text(name);
    this.viewer.$('span.DV-currentSearchResult').text("Searching");
    this.events.loadText(this.models.document.currentIndex(), DV._.bind(this.viewer.helpers.highlightEntity, this.viewer.helpers, offset, length));
  },
  cleanUpSearch: function(){
    var viewer            = this.viewer;
    viewer.searchResponse = null;
    viewer.toHighLight    = null;
    if (this.elements) this.elements.searchInput.keyup().blur();
  }

});
DV.Schema.helpers.TranslationAliases = [
  { de: 'en-us' }


];

/*
  Usage:  Use as a singleton.  Set the anno view that is currently being displayed with WPD in it,
  and send/receive messages as necessary
 */

DV.WPD_API = function(){
  this.current_anno_view = null;
};

DV.WPD_API.prototype.setActiveAnnoView = function(currentView){
  this.current_anno_view = currentView;
};

DV.WPD_API.prototype.sendMessage = function(message){
  wpd.iframe_api.receiveMessage(message);
};

//Take message passed and translate into proper function calls
DV.WPD_API.prototype.receiveMessage = function(message) {
  switch(message.name) {
    case 'exportJSON': {
      //Receive graph data JSON
      //data: graph data JSON
      this.current_anno_view.setWPDJSON(message.data);
      break;
    }
    case 'dataChange': {
      //Update highlight to reflect that WPD data has changed
      this.current_anno_view.updateDataStatus(false);
      break;
    }

    default: {
      alert('Error: WPD API call not recognized');
    }
  }
};


DV.Schema.states = {

  InitialLoad: function(){
    // First setup the language
    this.helpers.initializeLanguage()

    // If we're in an unsupported browser ... bail.
    if (this.helpers.unsupportedBrowser()) return;

    // Insert the Document Viewer HTML into the DOM.
    this.helpers.renderViewer();

    // Assign element references.
    this.events.elements = this.helpers.elements = this.elements = new DV.Elements(this);

    // Render included components, and hide unused portions of the UI.
    this.helpers.renderComponents();

    // Render chapters and notes navigation:
    this.helpers.renderNavigation();

    // Render CSS rules for showing/hiding specific pages:
    this.helpers.renderSpecificPageCss();

    // Instantiate pageset and build accordingly
    this.pageSet = new DV.PageSet(this);
    this.pageSet.buildPages();

    // BindEvents
    this.helpers.bindEvents(this);

    this.helpers.positionViewer();
    this.models.document.computeOffsets();
    this.helpers.addObserver('drawPages');
    this.helpers.registerHashChangeEvents();
    this.dragReporter = new DV.DragReporter(this, '.DV-pageCollection',DV.jQuery.proxy(this.helpers.shift, this), { ignoreSelector: '.DV-highlightContent' });
    this.helpers.startCheckTimer();
    this.helpers.handleInitialState();
    DV._.defer(DV._.bind(this.helpers.autoZoomPage, this.helpers));
  },

  ViewHighlight: function(){
    this.helpers.reset(); // in construction.js
    this.helpers.ensureHighlightImages();
    this.activeHighlightId = null;
    this.acceptInput.deny();
    // Nudge IE to force the highlights to repaint.
    if (DV.jQuery.browser.msie) {
      this.elements.highlights.css({zoom : 0});
      this.elements.highlights.css({zoom : 1});
    }

    this.helpers.toggleContent('ViewHighlights');
    this.compiled.next();
    return true;
  },

  ViewDocument: function(){
    this.helpers.reset();
    this.helpers.addObserver('drawPages');
    this.dragReporter.setBinding();
    this.elements.window.mouseleave(DV.jQuery.proxy(this.dragReporter.stop, this.dragReporter));
    this.acceptInput.allow();

    this.helpers.toggleContent('viewDocument');

    this.helpers.jump(this.models.document.currentIndex());
    return true;
  },

  ViewEntity: function(name, offset, length) {
    this.helpers.reset();
    this.helpers.toggleContent('viewSearch');
    this.helpers.showEntity(name, offset, length);
  },

  ViewSearch: function(){
    this.helpers.reset();

    if(this.elements.searchInput.val() == '') {
      this.elements.searchInput.val(searchRequest);
    } else {
      var searchRequest = this.elements.searchInput.val();
    }

    this.helpers.getSearchResponse(searchRequest);
    this.acceptInput.deny();

    this.helpers.toggleContent('viewSearch');

    return true;
  },

  ViewText: function(){
    this.helpers.reset();
    this.acceptInput.allow();
    this.pageSet.zoomText();
    this.helpers.toggleContent('viewText');
    this.events.loadText();
    return true;
  },

  ViewThumbnails: function() {
    this.helpers.reset();
    this.helpers.toggleContent('viewThumbnails');
    this.thumbnails = new DV.Thumbnails(this);
    this.thumbnails.render();
    return true;
  }

};

// The API references it's viewer.
DV.Api = function(viewer) {
  this.viewer = viewer;
};

// Set up the API class.
DV.Api.prototype = {

  // Return the current page of the document.
  currentPage : function() {
    return this.viewer.models.document.currentPage();
  },

  // Set the current page of the document.
  setCurrentPage : function(page) {
    this.viewer.helpers.jump(page - 1);
  },

  // Register a callback for when the page is changed.
  onPageChange : function(callback) {
    this.viewer.models.document.onPageChangeCallbacks.push(callback);
  },

  // Return the page number for one of the three physical page DOM elements, by id:
  getPageNumberForId : function(id) {
    var page = this.viewer.pageSet.pages[id];
    return page.index + 1;
  },

  // Get the document's canonical schema
  getSchema : function() {
    return this.viewer.schema.document;
  },

  // Get the document's canonical ID.
  getId : function() {
    return this.viewer.schema.document.id;
  },

  // Get the document's numerical ID.
  getModelId : function() {
    return parseInt(this.getId(), 10);
  },

  // Return the current zoom factor of the document relative to the base zoom.
  relativeZoom : function() {
    return this.viewer.models.pages.zoomFactor();
  },

  // Return the total number of pages in the document.
  numberOfPages : function() {
    return this.viewer.models.document.totalPages;
  },

  // Return the name of the contributor, if available.
  getContributor : function() {
    return this.viewer.schema.document.contributor;
  },

  // Return the name of the contributing organization, if available.
  getContributorOrganization : function() {
    return this.viewer.schema.document.contributor_organization;
  },

  // Change the documents' sections, re-rendering the navigation. "sections"
  // should be an array of sections in the canonical format:
  // {title: "Chapter 1", pages: "1-12"}
  setSections : function(sections) {
    sections = DV._.sortBy(sections, function(s){ return s.page; });
    this.viewer.schema.data.sections = sections;
    this.viewer.models.chapters.loadChapters();
    this.redraw();
  },

  // Get a list of every section in the document.
  getSections : function() {
    return DV._.clone(this.viewer.schema.data.sections || []);
  },

  // Get the document's description.
  getDescription : function() {
    return this.viewer.schema.document.description;
  },

  // Set the document's description and update the sidebar.
  setDescription : function(desc) {
    this.viewer.schema.document.description = desc;
    this.viewer.$('.DV-description').remove();
    this.viewer.$('.DV-navigation').prepend(JST['DV/views/descriptionContainer']({description: desc}));
    this.viewer.helpers.displayNavigation();
  },

  // Get the document's related article url.
  getRelatedArticle : function() {
    return this.viewer.schema.document.resources.related_article;
  },

  // Set the document's related article url.
  setRelatedArticle : function(url) {
    this.viewer.schema.document.resources.related_article = url;
    this.viewer.$('.DV-storyLink a').attr({href : url});
    this.viewer.$('.DV-storyLink').toggle(!!url);
  },

  // Get the document's published url.
  getPublishedUrl : function() {
    return this.viewer.schema.document.resources.published_url;
  },

  // Set the document's published url.
  setPublishedUrl : function(url) {
    this.viewer.schema.document.resources.published_url = url;
  },

  // Get the document's title.
  getTitle : function() {
    return this.viewer.schema.document.title;
  },

  // Set the document's title.
  setTitle : function(title) {
    this.viewer.schema.document.title = title;
    document.title = title;
  },

  getSource : function() {
    return this.viewer.schema.document.source;
  },

  setSource : function(source) {
    this.viewer.schema.document.source = source;
  },

  getPageText : function(pageNumber) {
    return this.viewer.schema.text[pageNumber - 1];
  },

  // Set the page text for the given page of a document in the local cache.
  setPageText : function(text, pageNumber) {
    this.viewer.schema.text[pageNumber - 1] = text;
  },

  // Reset all modified page text to the original values from the server cache.
  resetPageText : function(overwriteOriginal) {
    var self = this;
    var pageText = this.viewer.schema.text;
    if (overwriteOriginal) {
      this.viewer.models.document.originalPageText = {};
    } else {
      DV._.each(this.viewer.models.document.originalPageText, function(originalPageText, pageNumber) {
        pageNumber = parseInt(pageNumber, 10);
        if (originalPageText != pageText[pageNumber-1]) {
          self.setPageText(originalPageText, pageNumber);
          if (pageNumber == self.currentPage()) {
            self.viewer.events.loadText();
          }
        }
      });
    }
    if (this.viewer.openEditor == 'editText') {
      this.viewer.$('.DV-textContents').attr('contentEditable', true).addClass('DV-editing');
    }
  },

  getHighlightsByPageIndex : function(idx) {
    return this.viewer.schema.getHighlightsByPage(idx);
  },

  getHighlight : function(aid) {
    return this.viewer.schema.getHighlight(aid);
  },

  // Add a new highlight to the document, prefilled to any extent.
  addHighlight : function(highl) {
    highl = this.viewer.schema.loadHighlight(highl);
    this.viewer.pageSet.addHighlight(highl);
    var highlightHash = {highlight_id: highl.id};
    ('annotations' in highl && highl.annotations.length > 0) ? highlightHash['anno_id'] = highl.annotations[0].server_id : highlightHash['graph_id'] = highl.graphs[0].server_id;
    this.viewer.pageSet.showHighlight(highlightHash, {active: true, edit : true});
    return highl;
  },

  //Add more content to existing highlight
  addContentToHighlight: function(highlightId, new_content, showEdit){
      highl = this.viewer.schema.findHighlight({id: highlightId });
      this.viewer.schema.addHighlightContent(highl, new_content);
      this.viewer.pageSet.refreshHighlight(highl, true, showEdit);
  },

  // Find highlight and make it the active one
  selectHighlight: function(highlightInfo, showEdit, callbacks) {
      this.viewer.schema.setActiveContent(highlightInfo);
      this.viewer.pageSet.showHighlight(highlightInfo, {active: true, edit : showEdit, callbacks: callbacks});
  },

  // Remove highlight/group relationship (and highlight if no relationships left)
  deleteHighlight: function(highlightInfo) {
      highl = this.viewer.schema.findHighlight({id: highlightInfo.highlight_id });

      if ( this.viewer.schema.removeHighlightContent(highl, highlightInfo) ) {
        this.viewer.pageSet.removeHighlight(highl);
      }else{
        this.viewer.pageSet.refreshHighlight(highl, false, false);
      }
  },

  //Set autocomplete recommendations
  setRecommendations: function(recArray) {
    this.viewer.schema.setRecommendations(recArray);
  },

  //Populate highlight(s) with updated data from DC client
  syncHighlights: function(highlightInfo) {
      var _this = this;
      _this.viewer.schema.syncHighlight(highlightInfo);
      this.viewer.activeHighlight.highlightEl.removeClass('DV-editing');
      this.viewer.pageSet.refreshHighlight(this.viewer.activeHighlight.model, true, false);
  },

  //Request current highlight to display/hide clone confirm buttons
  requestCloneConfirm: function(setTo) {
      this.viewer.activeHighlight.setCloneConfirm(setTo);
  },

  //Reload current highlights store with passed in highlights
  reloadHighlights: function(annos){
      this.viewer.schema.reloadHighlights(annos);
      this.viewer.pageSet.redraw(true, true);
  },

  // Register a callback for when an highlight is saved.
  onHighlightSave : function(callback) {
    this.viewer.saveCallbacks.push(callback);
  },

  // Register a callback for when an highlight is deleted.
  onHighlightDelete : function(callback) {
    this.viewer.deleteCallbacks.push(callback);
  },

  // Register a callback for when an highlight is deleted.
  onHighlightSelect : function(callback) {
    this.viewer.selectCallbacks.push(callback);
  },

  // Register a callback for when annotating is cancelled.
  onHighlightCancel : function(callback) {
    this.viewer.cancelCallbacks.push(callback);
  },

  // Register a callback for when a clone is confirmed.
  onCloneConfirm : function(callback) {
      this.viewer.cloneCallbacks.push(callback);
  },

  setConfirmStateChange : function(callback) {
    this.viewer.confirmStateChange = callback;
  },

  onChangeState : function(callback) {
    this.viewer.onStateChangeCallbacks.push(callback);
  },

  getState : function() {
    return this.viewer.state;
  },

  // set the state. This takes "ViewDocument," "ViewThumbnails", "ViewText"
  setState : function(state) {
    this.viewer.open(state);
  },

  resetRemovedPages : function() {
    this.viewer.models.document.resetRemovedPages();
  },

  addPageToRemovedPages : function(page) {
    this.viewer.models.document.addPageToRemovedPages(page);
  },

  removePageFromRemovedPages : function(page) {
    this.viewer.models.document.removePageFromRemovedPages(page);
  },

  resetReorderedPages : function() {
    this.viewer.models.document.redrawReorderedPages();
  },

  reorderPages : function(pageOrder, options) {
    var model = this.getModelId();
    this.viewer.models.document.reorderPages(model, pageOrder, options);
  },

  // Request the loading of an external JS file.
  loadJS : function(url, callback) {
    DV.jQuery.getScript(url, callback);
  },

  // Set first/last styles for tabs.
  roundTabCorners : function() {
    var tabs = this.viewer.$('.DV-views > div:visible');
    tabs.first().addClass('DV-first');
    tabs.last().addClass('DV-last');
  },

  // Register hooks into DV's hash history
  registerHashListener : function(matcher, callback) {
    this.viewer.history.register(matcher, callback);
  },

  // Clobber DV's existing history hooks
  clearHashListeners : function() {
    this.viewer.history.defaultCallback = null;
    this.viewer.history.handlers = [];
  },

  // Unload the viewer.
  unload: function(viewer) {
    this.viewer.helpers.unbindEvents();
    DV.jQuery('.DV-docViewer', this.viewer.options.container).remove();
    this.viewer.helpers.stopCheckTimer();
    delete DV.viewers[this.viewer.schema.document.id];
  },

  //Request to abandon current active highlight (hide or remove); call success if request succeeds (i.e. not user cancelled)
  cleanUp: function(success) {
    this.viewer.pageSet.cleanUp(success);
  },


  //Activate/deactivate 'approved' view for anno (temporary, data does not update)
  markApproval: function(highl_id, content_id, content_type, approval) {
      var anno = this.viewer.schema.markApproval(highl_id, content_id, content_type, approval);
      this.viewer.pageSet.refreshHighlight(anno, false);
  },

  // ---------------------- Enter/Leave Edit Modes -----------------------------

  enterRemovePagesMode : function() {
    this.viewer.openEditor = 'removePages';
  },

  leaveRemovePagesMode : function() {
    this.viewer.openEditor = null;
  },

  enterAddPagesMode : function() {
    this.viewer.openEditor = 'addPages';
  },

  leaveAddPagesMode : function() {
    this.viewer.openEditor = null;
  },

  enterReplacePagesMode : function() {
    this.viewer.openEditor = 'replacePages';
  },

  leaveReplacePagesMode : function() {
    this.viewer.openEditor = null;
  },

  enterReorderPagesMode : function() {
    this.viewer.openEditor = 'reorderPages';
    this.viewer.elements.viewer.addClass('DV-reorderPages');
  },

  leaveReorderPagesMode : function() {
    this.resetReorderedPages();
    this.viewer.openEditor = null;
    this.viewer.elements.viewer.removeClass('DV-reorderPages');
  },

  enterEditPageTextMode : function() {
    this.viewer.openEditor = 'editText';
    this.viewer.events.loadText();
  },

  leaveEditPageTextMode : function() {
    this.viewer.openEditor = null;
    this.resetPageText();
  }

};

DV.DocumentViewer = function(options) {
  this.options        = options;
  this.window         = window;
  this.$              = this.jQuery;
  this.schema         = new DV.Schema();
  this.api            = new DV.Api(this);
  this.wpd_api        = new DV.WPD_API();
  this.history        = new DV.History(this);

  // Build the data models
  this.models     = this.schema.models;
  this.events     = DV._.extend({}, DV.Schema.events);
  this.helpers    = DV._.extend({}, DV.Schema.helpers);
  this.states     = DV._.extend({}, DV.Schema.states);

  // state values
  this.isFocus            = true;
  this.openEditor         = null;
  this.confirmStateChange = null;
  this.activeElement      = null;
  this.observers          = [];
  this.windowDimensions   = {};
  this.scrollPosition     = null;
  this.checkTimer         = {};
  this.busy               = false;
  this.highlightToLoadId = null;
  this.dragReporter       = null;
  this.compiled           = {};
  this.tracker            = {};

  this.onStateChangeCallbacks   = [];
  this.saveCallbacks            = [];
  this.deleteCallbacks          = [];
  this.selectCallbacks          = [];
  this.cancelCallbacks          = [];
  this.cloneCallbacks           = [];

  this.events     = DV._.extend(this.events, {
    viewer      : this,
    states      : this.states,
    elements    : this.elements,
    helpers     : this.helpers,
    models      : this.models,
    // this allows us to bind events to call the method corresponding to the current state
    compile     : function(){
      var a           = this.viewer;
      var methodName  = arguments[0];
      return function(){
        if(!a.events[a.state][methodName]){
          a.events[methodName].apply(a.events,arguments);
        }else{
          a.events[a.state][methodName].apply(a.events,arguments);
        }
      };
    }
  });

  this.helpers  = DV._.extend(this.helpers, {
    viewer      : this,
    states      : this.states,
    elements    : this.elements,
    events      : this.events,
    models      : this.models
  });

  this.states   = DV._.extend(this.states, {
    viewer      : this,
    helpers     : this.helpers,
    elements    : this.elements,
    events      : this.events,
    models      : this.models
  });
};

DV.DocumentViewer.prototype.loadModels = function() {
  this.models.document     = new DV.model.Document(this);
  this.models.pages        = new DV.model.Pages(this);
  this.models.removedPages = {};
};

// Transition to a given state ... unless we're already in it.
DV.DocumentViewer.prototype.open = function(state) {
  if (this.state == state) return;
  var continuation = DV._.bind(function() {
    this.state = state;
    this.states[state].apply(this, arguments);
    this.slapIE();
    this.notifyChangedState();
    return true;
  }, this);
  this.confirmStateChange ? this.confirmStateChange(continuation) : continuation();
};

DV.DocumentViewer.prototype.slapIE = function() {
  DV.jQuery(this.options.container).css({zoom: 0.99}).css({zoom: 1});
};

DV.DocumentViewer.prototype.notifyChangedState = function() {
  DV._.each(this.onStateChangeCallbacks, function(c) { c(); });
};

DV.DocumentViewer.prototype.fireCloneCallbacks  = function(highl_content) {
    DV._.each(this.cloneCallbacks, function(c){ c(highl_content); });
};

DV.DocumentViewer.prototype.fireSaveCallbacks  = function(highl_content) {
  DV._.each(this.saveCallbacks, function(c){ c(highl_content); });
};

DV.DocumentViewer.prototype.fireDeleteCallbacks = function(highl_content) {
  DV._.each(this.deleteCallbacks, function(c){ c(highl_content); });
};

DV.DocumentViewer.prototype.fireSelectCallbacks = function(highl_content) {
  DV._.each(this.selectCallbacks, function(c){ c(highl_content); });
};

DV.DocumentViewer.prototype.fireCancelCallbacks = function(highl_content) {
  DV._.each(this.cancelCallbacks, function (c) { c(highl_content); });
};

// Record a hit on this document viewer.
DV.DocumentViewer.prototype.recordHit = function(hitUrl) {
  var loc = window.location;
  var url = loc.protocol + '//' + loc.host + loc.pathname;
  if (url.match(/^file:/)) return false;
  url = url.replace(/[\/]+$/, '');
  var id   = parseInt(this.api.getId(), 10);
  var key  = encodeURIComponent('document:' + id + ':' + url);
  DV.jQuery(document.body).append('<img class="DV-pixelping" alt="" width="1" height="1" src="' + hitUrl + '?key=' + key + '" />');
};

// jQuery object, scoped to this viewer's container.
DV.DocumentViewer.prototype.jQuery = function(selector, context) {
  context = context || this.options.container;
  return DV.jQuery.call(DV.jQuery, selector, context);
};

// The origin function, kicking off the entire documentViewer render.
DV.load = function(documentRep, options) {
  options = options || {};
  var id  = documentRep.id || documentRep.match(/([^\/]+)(\.js|\.json)$/)[1];
  if ('showSidebar' in options) options.sidebar = options.showSidebar;
  if ('view_only' in options) options.view_only = options.view_only;
  var defaults = {
    container : document.body,
    zoom      : 'auto',
    sidebar   : true,
    view_only : false
  };
  options            = DV._.extend({}, defaults, options);
  options.fixedSize  = !!(options.width || options.height);
  var viewer         = new DV.DocumentViewer(options);
  DV.viewers[id]     = viewer;
  // Once we have the JSON representation in-hand, finish loading the viewer.
  var continueLoad = DV.loadJSON = function(json) {
    var viewer = DV.viewers[json.id];
    viewer.schema.importCanonicalDocument(json, options.view_only);
    viewer.loadModels();

    //If view-only, determine page to show
    if( options.view_only ){ viewer.view_only_page = json.highlights[0].page; }

    DV.jQuery(function() {
      viewer.open('InitialLoad');
      if (options.afterLoad) options.afterLoad(viewer);
      if (DV.afterLoad) DV.afterLoad(viewer);
      if (DV.recordHit) viewer.recordHit(DV.recordHit);
    });
  };

  // If we've been passed the JSON directly, we can go ahead,
  // otherwise make a JSONP request to fetch it.
  var jsonLoad = function() {
    if (DV._.isString(documentRep)) {
      if (documentRep.match(/\.js$/)) {
        DV.jQuery.getScript(documentRep);
      } else {
        var crossDomain = viewer.helpers.isCrossDomain(documentRep);
        if (crossDomain) documentRep = documentRep + '?callback=?';
        DV.jQuery.getJSON(documentRep, continueLoad);
      }
    } else {
      continueLoad(documentRep);
    }
  };

  // If we're being asked the fetch the templates, load them remotely before
  // continuing.
  if (options.templates) {
    DV.jQuery.getScript(options.templates, jsonLoad);
  } else {
    jsonLoad();
  }

  return viewer;
};

// If the document viewer has been loaded dynamically, allow the external
// script to specify the onLoad behavior.
if (DV.onload) DV._.defer(DV.onload);

(function(){
window.JST = window.JST || {};

window.JST['DV/views/annotation'] = DV._.template('  <div class="DV-highlightExcerpt" style="height:<%= excerptHeight %>px;">\n    <div class="DV-highlightExcerptImageTop" style="height:<%= excerptHeight %>px; width:<%= excerptWidth %>px;left:<%= excerptTopMarginLeft %>px;">\n\n      <img class="DV-img" src="<%= image %>" style="left:<%= -(excerptMarginLeft + 1) %>px; top:-<%= imageTop %>px;" width="<%= imageWidth %>" />\n\n    </div>\n    <div class="DV-highlightExcerptImage" style="height:<%= excerptHeight %>px;">\n      <img class="DV-img" src="<%= image %>" style="left:<%= -(showWindowMarginLeft) %>px; top:-<%= imageTop %>px;" width="<%= imageWidth %>" />\n    </div>\n  </div>\n\n  <div class="DV-annotationHeader DV-clearfix">\n        <div class="DV-annotationTitle DV-editHidden"><%- title %></div>\n        <input class="DV-annotationTitleInput DV-editVisible" type="text" placeholder="<%= DV.t(\'annotation_title\') %>" value="<%- title.replace(/"/g, \'&quot;\') %>" />\n        <div class="DV-errorMsg"></div>\n        <div class="<%if(owns_note){%>DV-showEdit<%}%> DV-editHidden <%= accessClass %>"></div>\n  </div>\n\n  <div class="DV-annotationBody DV-editHidden">\n    <%- text %>\n  </div>\n  <textarea class="DV-annotationTextArea DV-editVisible"><%- text %></textarea>\n\n  <div class="DV-annotationMeta <%= accessClass %>">\n    <% if (author) { %>\n      <div class="DV-annotationAuthor DV-interface DV-editHidden">\n        <%= DV.t(\'note_by\', author ) %><% if (author_organization) { %>, <i><%= author_organization %></i><% } %>\n      </div>\n    <% } %>\n    <div class="minibutton DV-cloneConfirm float_right" style="visibility:<%if(showConfirm){%>visible<%}else{%>hidden<%}%>"><%= DV.t(\'clone\') %></div>\n\n    <div class="DV-annotationEditControls DV-editVisible">\n      <div class="DV-clearfix">\n        <div class="minibutton default DV-saveAnnotation float_right"><%= DV.t(\'save\') %></div>\n        <div class="minibutton DV-cancelEdit float_right"><%= DV.t(\'cancel\') %></div>\n      </div>\n    </div>\n  </div>');
window.JST['DV/views/chapterNav'] = DV._.template('<div id="DV-chapter-<%= id %>" class="DV-chapter <%= navigationExpanderClass %>">\n  <div class="DV-first">\n    <%= navigationExpander %>\n    <span class="DV-trigger">\n      <span class="DV-navChapterTitle"><%= title %></span>&nbsp;<span class="DV-navPageNumber"><%= DV.t(\'pg\') %>&nbsp;<%= pageNumber %></span>\n    </span>\n  </div>\n  <%= noteViews %>\n</div>');
window.JST['DV/views/descriptionContainer'] = DV._.template('<% if (description) { %>\n  <div class="DV-description">\n    <div class="DV-descriptionHead">\n      <span class="DV-descriptionToggle DV-showDescription DV-trigger"><%= DV.t(\'toggle_description\') %></span>\n      <%= DV.t(\'description\') %>\n    </div>\n    <div class="DV-descriptionText"><%= description %></div>\n  </div>\n<% } %>\n');
window.JST['DV/views/footer'] = DV._.template('<% if (!options.sidebar) { %>\n  <div class="DV-footer">\n    <div class="DV-fullscreenContainer"></div>\n    <div class="DV-navControlsContainer"></div>\n  </div>\n<% } %>');
window.JST['DV/views/fullscreenControl'] = DV._.template('<div class="DV-fullscreen" title="<%= DV.t(\'view_fullscreen\') %>"></div>\n');
window.JST['DV/views/generatingImage'] = DV._.template('<div id="generating_img_notice">Generating Image...</div>');
window.JST['DV/views/graph'] = DV._.template('  <div>\n    <input class="DV-graphData" type="hidden" value="<%=graph_json%>"/>\n    <div id="graph_frame"></div>\n  </div>\n  <div class="DV-annotationMeta <%= accessClass %>">\n    <div class="DV-annotationEditControls DV-editVisible">\n      <%if(owns_note){%>\n      <div class="DV-clearfix">\n        <div class="DV-errorMsg float_left"></div>\n        <div class="minibutton default DV-saveAnnotation float_right"><%= DV.t(\'save\') %></div>\n        <div class="minibutton DV-cancelEdit float_right"><%= DV.t(\'cancel\') %></div>\n        <div class="float_right DV-data_error"></div>\n      </div>\n      <%}%>\n    </div>\n  </div>\n');
window.JST['DV/views/header'] = DV._.template('<div class="DV-header">\n  <div class="DV-headerHat" class="DV-clearfix">\n    <div class="DV-branding">\n      <% if (story_url) { %>\n        <span class="DV-storyLink"><%= story_url %></span>\n      <% } %>\n    </div>\n    <div class="DV-title">\n      <%= title %>\n    </div>\n  </div>\n</div>\n\n<div id="noSaveDialog">You will lose your changes.  Continue?</div>\n\n<div id="dupeAlert">This annotation has duplicates.  Update all with your changes?</div>\n');
window.JST['DV/views/highlight'] = DV._.template('<div class="DV-highlight <%= accessClass %> DV-ownsHighlight" style="top:<%= top %>px; width:<%= width %>px; margin-left: <%=leftMargin%>px;" id="DV-highlight-<%= id %>" data-id="<%= id %>">\n\n  <div class="DV-highlightTab" style="top:<%= tabTop %>px;">\n    <div class="DV-highlightClose DV-trigger">\n    </div>\n  </div>\n\n  <div class="DV-highlightRegion <%= approvedClass %>" style="margin-left:<%= excerptMarginLeft - 4 %>px; height:<%= excerptHeight %>px; width:<%= excerptWidth - 1 %>px;">\n    <div class="<%= accessClass %>">\n      <div class="DV-highlightEdge DV-highlightEdgeTop"></div>\n      <div class="DV-highlightEdge DV-highlightEdgeRight"></div>\n      <div class="DV-highlightEdge DV-highlightEdgeBottom"></div>\n      <div class="DV-highlightEdge DV-highlightEdgeLeft"></div>\n      <div class="DV-highlightCorner DV-highlightCornerTopLeft"></div>\n      <div class="DV-highlightCorner DV-highlightCornerTopRight"></div>\n      <div class="DV-highlightCorner DV-highlightCornerBottomLeft"></div>\n      <div class="DV-highlightCorner DV-highlightCornerBottomRight"></div>\n    </div>\n    <!--<div class="DV-highlightRegionExclusive"></div>-->\n  </div>\n\n  <div class="DV-highlightContent" style="margin-left: <%= showWindowMarginLeft %>px;">\n    <div class="DV-pagination DV-hideNav">\n      <% if( contentCount > 1 ){ %>\n          <% if( currentContent != 1 ) { %><span class="DV-trigger DV-highlightPrevious" title="<%= DV.t(\'previous_note\') %>"><%= DV.t(\'previous\') %></span><% } %>\n          <span class="DV-groupCount">(<%=currentContent%> of <%=contentCount%>)</span>\n          <% if( currentContent != contentCount ){ %><span class="DV-trigger DV-highlightNext" title="<%= DV.t(\'next_note\') %>"><%= DV.t(\'next\') %></span><% } %>\n      <% } %>\n    </div>\n    <%= innerHTML %>\n  </div>\n</div>\n');
window.JST['DV/views/highlightNav'] = DV._.template('<div class="DV-highlightMarker" id="DV-highlightMarker-<%= id %>">\n  <span class="DV-trigger">\n    <span class="DV-navHighlightTitle">Highlight <%= id %></span>&nbsp;<span class="DV-navPageNumber"><%= DV.t(\'pg\') %> <%= page %></span>\n  </span>\n</div>');
window.JST['DV/views/navControls'] = DV._.template('<div class="DV-navControls DV-clearfix">\n  <span class="DV-trigger DV-previous">&laquo;</span>\n  <div class="DV-clearfix DV-pageNumberContainer">\n    <span class="DV-currentPagePrefix"><%= DV.t(\'page\') %></span>\n    <span class="DV-currentHighlightPrefix"><%= DV.t(\'note\') %>&nbsp;</span>\n    <span class="DV-currentPage">1</span>\n    <span class="DV-currentPageSuffix"><%= DV.t(\'of\') %>&nbsp;\n      <span class="DV-totalPages"><%= totalPages %></span>\n      <span class="DV-totalHighlights"><%= totalHighlights %></span>\n    </span>\n  </div>\n  <span class="DV-trigger DV-next">&raquo;</span>\n</div>');
window.JST['DV/views/navigationExpander'] = DV._.template('<span class="DV-trigger DV-expander"><%= DV.t(\'expand\') %></span>');
window.JST['DV/views/pageAnnotation'] = DV._.template('<div class="DV-highlight DV-pageNote <%= orderClass %> <%= accessClass %> <% if (owns_note) { %>DV-ownsHighlight<% } %>" style="top:<%= top %>px;" id="DV-highlight-<%= id %>" data-id="<%= id %>">\n  <div class="DV-highlightTab">\n    <div class="DV-highlightClose DV-trigger"><%= DV.t(\'pg\') %> <%= pageNumber %></div>\n  </div>\n\n  <div class="DV-highlightContent">\n    <!-- Header -->\n    <div class="DV-annotationHeader DV-clearfix">\n      <div class="DV-pagination DV-editHidden">\n        <span class="DV-trigger DV-highlightPrevious" title="<%= DV.t(\'previous_note\') %>"><%= DV.t(\'previous\') %></span>\n        <span class="DV-trigger DV-highlightNext" title="<%= DV.t(\'next_note\') %>"><%= DV.t(\'next\') %></span>\n      </div>\n      <div class="DV-annotationGoto DV-editHidden"><div class="DV-trigger"><%= DV.t(\'pg\') %><%= pageNumber %></div></div>\n      <div class="DV-annotationTitle DV-editHidden"><%= title %></div>\n      <input class="DV-annotationTitleInput DV-editVisible" type="text" placeholder="<%= DV.t(\'annotation_title\') %>" value="<%= title.replace(/"/g, \'&quot;\') %>" />\n      <% if (access == \'exclusive\') { %>\n        <div class="DV-highlightDraftLabel DV-editHidden DV-interface"><%= DV.t(\'draft\') %></div>\n      <% } else if (access == \'private\') { %>\n        <div class="DV-privateLock DV-editHidden" title="<%= DV.t(\'private_note\',2) %>"></div>\n      <% } %>\n      <span class="DV-permalink DV-editHidden" title="<%= DV.t(\'link_to_note\') %>"></span>\n      <div class="DV-showEdit DV-editHidden <%= accessClass %>"></div>\n    </div>\n\n    <div class="DV-annotationBody DV-editHidden">\n      <%= text %>\n    </div>\n    <textarea class="DV-annotationTextArea DV-editVisible" style="width: <%= bWidth %>px;"><%= text %></textarea>\n\n    <div class="DV-annotationMeta <%= accessClass %>">\n      <% if (author) { %>\n        <div class="DV-annotationAuthor DV-interface DV-editHidden">\n          <%= DV.t(\'note_by\', author ) %><% if (author_organization) { %>, <i><%= author_organization %></i><% } %>\n        </div>\n      <% } %>\n      <% if (access == \'exclusive\') { %>\n        <div class="DV-highlightWarning DV-interface DV-editHidden">\n          <%= DV.t(\'draft_note_visible\') %>\n        </div>\n      <% } else if (access == \'private\') { %>\n        <div class="DV-highlightWarning DV-interface DV-editHidden">\n          <%= DV.t(\'private_note_visible\') %>\n        </div>\n      <% } %>\n      <div class="DV-annotationEditControls DV-editVisible">\n        <div class="DV-clearfix">\n          <div class="minibutton warn DV-deleteHighlight float_left"><%= DV.t(\'delete\') %></div>\n          <div class="minibutton default DV-saveAnnotation float_right">\n            <% if (access == \'exclusive\') { %>\n              <%= DV.t(\'publish\') %>\n            <% } else { %>\n              <%= DV.t(\'save\') %>\n            <% } %>\n          </div>\n          <% if (access == \'public\' || access == \'exclusive\') { %>\n            <div class="minibutton DV-saveAnnotationDraft float_right"><%= DV.t(\'save_as_draft\') %></div>\n          <% } %>\n          <div class="minibutton DV-cancelEdit float_right"><%= DV.t(\'cancel\') %></div>\n        </div>\n      </div>\n    </div>\n  </div>\n</div>\n');
window.JST['DV/views/pages'] = DV._.template('<div class="DV-set p<%= pageIndex %>" data-id="p<%= pageIndex %>" style="top:0;left:0px;height:893px;width:700px;">\n  <div class="DV-overlay"></div>\n  <div class="DV-pageNoteInsert" title="<%= DV.t(\'click_add_page_note\') %>">\n    <div class="DV-highlightTab">\n      <div class="DV-highlightClose"></div>\n    </div>\n    <div class="DV-highlightDivider"></div>\n  </div>\n  <div class="DV-pageMeta"><span class="DV-pageNumber"><%= DV.t(\'pg\') %> <%= pageNumber %></span></div>\n  <div class="DV-highlights"></div>\n  <div class="DV-page" style="height:863px;width:700px;">\n    <span class="DV-loading-top"><%= DV.t(\'loading\') %></span>\n    <span class="DV-loading-bottom"><%= DV.t(\'loading\') %></span>\n    <div class="DV-cover"></div>\n    <img class="DV-pageImage" <%= pageImageSource ? \'src="\' + pageImageSource + \'"\' : \'\' %> height="863" />\n  </div>\n</div>');
window.JST['DV/views/thumbnails'] = DV._.template('<% for (; page <= endPage; page++) { %>\n  <% var url = imageUrl.replace(/\{page\}/, page) ; %>\n  <div class="DV-thumbnail" id="DV-thumbnail-<%= page %>" data-pageNumber="<%= page %>">\n    <div class="DV-overlay">\n      <div class=\'DV-caret\'></div>\n    </div>\n    <div class="DV-thumbnail-page">\n      <div class="DV-thumbnail-select">\n        <div class="DV-thumbnail-shadow"></div>\n        <img class="DV-thumbnail-image" data-src="<%= url %>" />\n      </div>\n      <div class="DV-pageNumber DV-pageMeta"><span class="DV-pageNumberText"><span class="DV-pageNumberTextUnderline"><%= DV.t(\'pg\') %> <%= page %></span></span></div>\n    </div>\n  </div>\n<% } %>\n');
window.JST['DV/views/unsupported'] = DV._.template('<div class="DV-unsupported">\n  <div class="DV-intro">\n    <% if (viewer.schema.document.resources && viewer.schema.document.resources.pdf) { %>\n      <a href="<%= viewer.schema.document.resources.pdf %>"><%= DV.t(\'dl_as_pdf\') %></a>\n    <% } %>\n    <br />\n    <br />\n    <%= DV.t(\'must_upgrade\') %>\n  </div>\n  <div class="DV-browsers">\n    <div class="DV-browser">\n      <a href="http://www.google.com/chrome">\n        <div class="DV-image DV-chrome"> </div>Chrome\n      </a>\n    </div>\n    <div class="DV-browser">\n      <a href="http://www.apple.com/safari/download/">\n        <div class="DV-image DV-safari"> </div>Safari\n      </a>\n    </div>\n    <div class="DV-browser">\n      <a href="http://www.mozilla.com/en-US/firefox/firefox.html">\n        <div class="DV-image DV-firefox"> </div>Firefox\n      </a>\n    </div>\n    <br style="clear:both;" />\n  </div>\n  <div class="DV-after">\n    <%= DV.t(\'install_chrome_frame\', \'<br/><a href="http://www.google.com/chromeframe">\',\'</a>\') %>\n  </div>\n</div>\n');
window.JST['DV/views/viewerHorizontal'] = DV._.template('<!--[if lte IE 8]><div class="DV-docViewer DV-clearfix DV-viewDocument DV-ie <% if (autoZoom) { %>DV-autoZoom<% } %> <% if (mini) { %>DV-mini<% } %> <% if (!options.sidebar) { %>DV-hideSidebar<% } else { %>DV-hideFooter<% } %>"><![endif]-->\n<!--[if (!IE)|(gte IE 9)]><!--><div class="DV-docViewer DV-clearfix DV-viewDocument <% if (autoZoom) { %>DV-autoZoom<% } %> <% if (mini) { %>DV-mini<% } %> <% if (!options.sidebar) { %>DV-hideSidebar<% } else { %>DV-hideFooter<% } %>"><!-- <![endif]-->\n  \n  <div class="DV-docViewerWrapper">\n  \n    <%= header %>\n    <div class="DV-docViewer-Container">\n    \n      <div class="DV-searchBarWrapper">\n        <div class="DV-searchBar">\n          <span class="DV-trigger DV-closeSearch"><%= DV.t(\'CLOSE\') %></span>\n          <div class="DV-searchPagination DV-foundResult">\n            <div class="DV-searchResults">\n              <span class="DV-resultPrevious DV-trigger"><%= DV.t(\'previous\') %></span>\n              <span class="DV-currentSearchResult"></span>\n              <span class="DV-totalSearchResult"></span>\n              <span><% DV.t(\'for\') %> &ldquo;<span class="DV-searchQuery"></span>&rdquo;</span>\n              <span class="DV-resultNext DV-trigger"><%= DV.t(\'next\') %></span>\n            </div>\n          </div>\n        </div>\n      </div>\n    \n      <div class="DV-pages horizontal <% if (!options.sidebar) { %>DV-hide-sidebar<% } %>">\n        <div class="DV-paper">\n          <div class="DV-zoomControls">\n            <span class="DV-zoomLabel"><%= DV.t(\'zoom\') %></span>\n            <div class="DV-zoomBox"></div>\n          </div>\n          <div class="DV-thumbnails"></div>\n          <div class="DV-pageCollection">\n            <div class="DV-bar" style=""></div>\n            <div class="DV-allHighlights">\n            </div>\n            <div class="DV-text">\n              <div class="DV-textSearch DV-clearfix">\n          \n              </div>\n              <div class="DV-textPage">\n                <span class="DV-textCurrentPage"></span>\n                <pre class="DV-textContents"></pre>\n              </div>\n            </div>\n            <%= pages %>\n          </div>\n        </div>\n      </div>\n    \n      <div width="265px" class="DV-sidebar <% if (!options.sidebar) { %>DV-hide<% } %>" style="display:none;">\n        <div class="DV-well horizontal">\n\n        </div>\n      </div>\n    </div>\n    \n    <%= footer %>\n    \n  </div>\n\n</div>\n');
window.JST['DV/views/viewerVertical'] = DV._.template('<!--[if lte IE 8]><div class="DV-docViewer DV-clearfix DV-viewDocument DV-ie <% if (autoZoom) { %>DV-autoZoom<% } %> <% if (mini) { %>DV-mini<% } %> <% if (!options.sidebar) { %>DV-hideSidebar<% } else { %>DV-hideFooter<% } %>"><![endif]-->\n<!--[if (!IE)|(gte IE 9)]><!--><div class="DV-docViewer DV-clearfix DV-viewDocument <% if (autoZoom) { %>DV-autoZoom<% } %> <% if (mini) { %>DV-mini<% } %> <% if (!options.sidebar) { %>DV-hideSidebar<% } else { %>DV-hideFooter<% } %>"><!-- <![endif]-->\n  \n  <div class="DV-docViewerWrapper">\n  \n    <%= header %>\n    <div class="DV-docViewer-Container">\n    \n      <div class="DV-searchBarWrapper">\n        <div class="DV-searchBar">\n          <span class="DV-trigger DV-closeSearch"><%= DV.t(\'CLOSE\') %></span>\n          <div class="DV-searchPagination DV-foundResult">\n            <div class="DV-searchResults">\n              <span class="DV-resultPrevious DV-trigger"><%= DV.t(\'previous\') %></span>\n              <span class="DV-currentSearchResult"></span>\n              <span class="DV-totalSearchResult"></span>\n              <span><% DV.t(\'for\') %> &ldquo;<span class="DV-searchQuery"></span>&rdquo;</span>\n              <span class="DV-resultNext DV-trigger"><%= DV.t(\'next\') %></span>\n            </div>\n          </div>\n        </div>\n      </div>\n    \n      <div class="DV-pages vertical <% if (!options.sidebar) { %>DV-hide-sidebar<% } %>">\n        <div class="DV-paper">\n          <div class="DV-zoomControls">\n            <span class="DV-zoomLabel"><%= DV.t(\'zoom\') %></span>\n            <div class="DV-zoomBox"></div>\n          </div>\n          <div class="DV-thumbnails"></div>\n          <div class="DV-pageCollection">\n            <div class="DV-bar" style=""></div>\n            <div class="DV-allHighlights">\n            </div>\n            <div class="DV-text">\n              <div class="DV-textSearch DV-clearfix">\n          \n              </div>\n              <div class="DV-textPage">\n                <span class="DV-textCurrentPage"></span>\n                <pre class="DV-textContents"></pre>\n              </div>\n            </div>\n            <%= pages %>\n          </div>\n        </div>\n      </div>\n    \n      <div class="DV-sidebar <% if (!options.sidebar) { %>DV-hide<% } %>" style="display:none;">\n        <div class="DV-well vertical"></div>\n      </div>\n    </div>\n    \n    <%= footer %>\n    \n  </div>\n\n</div>\n');
window.JST['WPD/wpd'] = DV._.template('<!DOCTYPE html>\n<html>\n<!-- \n	WebPlotDigitizer - http://arohatgi.info/WebPlotDigitizer\n\n	Copyright 2010-2016 Ankit Rohatgi <ankitrohatgi@hotmail.com>\n\n	This file is part of WebPlotDigitizer.\n\n    WebPlotDigitizer is free software: you can redistribute it and/or modify\n    it under the terms of the GNU General Public License as published by\n    the Free Software Foundation, either version 3 of the License, or\n    (at your option) any later version.\n\n    WebPlotDigitizer is distributed in the hope that it will be useful,\n    but WITHOUT ANY WARRANTY; without even the implied warranty of\n    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the\n    GNU General Public License for more details.\n\n    You should have received a copy of the GNU General Public License\n    along with WebPlotDigitizer.  If not, see <http://www.gnu.org/licenses/>.\n-->\n\n<head>\n<meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/> \n<meta name="Description" content="WebPlotDigitizer v3.10 - Web based tool to extract numerical data from plots and graph images."/>\n<meta name="Keywords" content="Plot, Digitizer, WebPlotDigitizer, Ankit Rohatgi, Extract Data, Convert Plots, XY, Polar, Ternary, Map, HTML5"/>\n<meta name="Author" content="Ankit Rohatgi"/>\n<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate"/>\n<meta http-equiv="Pragma" content="no-cache"/>\n<meta http-equiv="Expires" content="0"/>\n<title>WebPlotDigitizer - Copyright 2010-2016 Ankit Rohatgi</title>\n\n\n\n</head>\n\n<body>\n\n<div id="loadingCurtain" style="position: absolute; top: 0px; left: 0px; z-index: 100; width: 100%; height: 100%; background-color: white;">\nLoading application, please wait...\n<br/>\n<br/>\nProblems loading? Make sure you have a recent version of Google Chrome, Firefox, Safari or Internet Explorer 11 installed.\n</div>\n\n<div id="allContainer">\n    <!-- toolbar + graphics -->\n    <div id="mainContainer">\n        <div id="topContainer">\n            <div id="menuButtonsContainer"><div class="wpd-menu">\n    <div class="wpd-menu-header">File</div>\n    <div class="wpd-menu-dropdown">\n        <ul>\n            <li id="wpd-filemenu-loadimage" onclick="wpd.popup.show(\'loadNewImage\');">Load Image</li>\n            <li id="wpd-filemenu-capture" onclick="wpd.webcamCapture.start();">Webcam Capture</li>\n            <li id="wpd-filemenu-runscript" onclick="wpd.scriptInjector.start();">Run Script</li>\n            <li id="wpd-filemenu-saveimage" onclick="wpd.graphicsWidget.saveImage();">Save Image</li>\n            <li id="wpd-filemenu-exportdata" onclick="wpd.saveResume.save();">Export JSON</li>\n            <li id="wpd-filemenu-import" onclick="wpd.saveResume.load();">Import JSON</li>\n        </ul>\n    </div>\n</div>\n<!--\n<div class="wpd-menu">\n    <div class="wpd-menu-header">Image</div>\n    <div class="wpd-menu-dropdown">\n        <ul>\n            <li>Restore Image</li>\n            <li>Crop</li>\n            <li>Rotate</li>\n            <li>Resize</li>\n            <li>Grayscale</li>\n            <li>Threshold</li>\n        </ul>\n    </div>\n</div>\n-->\n<div class="wpd-menu">\n    <div class="wpd-menu-header">Axes</div>\n    <div class="wpd-menu-dropdown">\n        <ul>\n            <li id="wpd-axesmenu-defineaxes" onclick="wpd.alignAxes.editAlignment();">Calibrate Axes</li>\n            <li id="wpd-axesmenu-grid" onclick="wpd.gridDetection.start();">Remove Grid</li>\n            <!-- <li id="wpd-axesmenu-perspective" onclick="wpd.perspective.start();">Perspective Transformation</li> -->\n            <li id="wpd-axesmenu-tranformation-equations" onclick="wpd.transformationEquations.show();">Transformation Equations</li>\n        </ul>\n    </div>\n</div>\n<div class="wpd-menu">\n    <div class="wpd-menu-header">Data</div>\n    <div class="wpd-menu-dropdown">\n        <ul>\n            <li id="wpd-datamenu-acquire" onclick="wpd.acquireData.load();">Acquire Data</li>\n            <li id="wpd-datamenu-manage" onclick="wpd.dataSeriesManagement.manage();">Manage Datasets</li>\n        </ul>\n    </div>\n</div>\n<div class="wpd-menu">\n    <div class="wpd-menu-header">Measure</div>\n    <div class="wpd-menu-dropdown">\n        <ul>\n            <li id="wpd-analyzemenu-distance" onclick="wpd.measurement.start(wpd.measurementModes.distance);">Distances</li>\n            <li id="wpd-analyzemenu-angles" onclick="wpd.measurement.start(wpd.measurementModes.angle);">Angles</li>\n            <!-- <li id="wpd-analyzemenu-open-path" onclick="wpd.measurement.start(wpd.measurementModes.openPath);">Path Length</li> -->\n            <!-- <li id="wpd-analyzemenu-closed-path" onclick="wpd.measurement.start(wpd.measurementModes.closedPath);">Area &amp; Circumference</li> -->\n        </ul>\n    </div>\n</div>\n<div class="wpd-menu">\n    <div class="wpd-menu-header">Help</div>\n    <div class="wpd-menu-dropdown">\n        <ul>\n            <li id="wpd-helpmenu-about" onclick="wpd.popup.show(\'helpWindow\');">About WebPlotDigitizer</li>\n            <li id="wpd-helpmenu-tutorial"><a href="http://arohatgi.info/WebPlotDigitizer/tutorial.html" target="_blank">Tutorials</a></li>\n            <li id="wpd-helpmenu-manual"><a href="http://arohatgi.info/WebPlotDigitizer/userManual.pdf" target="_blank">User Manual</a></li>\n            <li id="wpd-helpmenu-github"><a href="https://github.com/ankitrohatgi/WebPlotDigitizer" target="_blank">GitHub Page</a></li>\n            <li id="wpd-helpmenu-issues"><a href="https://github.com/ankitrohatgi/WebPlotDigitizer/issues" target="_blank">Report Issues</a></li>\n            <li id="wpd-helpmenu-donate"><a href="https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=CVFJGV5SNEV9J&lc=US&item_name=WebPlotDigitizer&currency_code=USD&bn=PP%2dDonationsBF%3abtn_donateCC_LG%2egif%3aNonHosted" target="_blank">Donate (PayPal)</a></li>\n        </ul>\n    </div>\n</div>\n</div>\n\n           \n            <div id="topToolbarContainer">\n                <!-- controls that show on top -->\n                <div style="position:relative;"> \n                    <!-- Extra toolbars go here -->\n                    <!-- Erase Toolbar -->\n<div id="eraseToolbar" class="toolbar" style="width:350px;">\n<p><input type="button" id="clearMaskBtn" value="Erase All" style="width:80px;" onclick="wpd.dataMask.clearMask();"/>\nStroke Width <input type="range" id="eraseThickness" min="1" max="150" value="20" style="width:100px;"></p>\n</div>\n\n<!-- Paint Toolbar -->\n<div id="paintToolbar" class="toolbar" style="width:350px;">\n<p>Stroke Width <input type="range" id="paintThickness" min="1" max="150" value="20" style="width:100px;"></p>\n</div>\n\n<!-- Adjust Points Toolbar -->\n<div id="adjustDataPointsToolbar" class="toolbar" style="width:350px;">\n<p><input type="button" value="View Keyboard Shortcuts" onclick="wpd.popup.show(\'adjust-data-points-keyboard-shortcuts-window\');"/></p>\n</div> \n                </div>\n            </div>\n\n             <div style="display:inline-block; position: absolute; top: 5px; right: 290px;" >\n                <button type="button" title="Zoom in" onclick="wpd.graphicsWidget.zoomIn();" style="border:none; min-width:20px;">+</button>\n                <button type="button" title="Zoom out" onclick="wpd.graphicsWidget.zoomOut();" style="border:none; min-width:20px;">-</button>\n                <button type="button" title="View actual size" onclick="wpd.graphicsWidget.zoom100perc();" style="border:none;min-width:20px;">100%</button>\n                <button type="button" title="Fit to graphics area" onclick="wpd.graphicsWidget.zoomFit();" style="border:none;min-width:20px;">Fit</button>\n                <button title="Toggle extended crosshair" onclick="wpd.graphicsWidget.toggleExtendedCrosshairBtn();" style="border:none;min-width:20px;background-image: url(\'/viewer/WPD/images/crosshair.png\'); background-repeat: no-repeat; background-position: center;" id="extended-crosshair-btn">&nbsp;</button>\n            </div>\n\n        </div>\n\n        <div id="graphicsContainer">\n            <!-- the main canvas goes here -->\n            <div id="canvasDiv" style="position:relative;">\n                <canvas id="mainCanvas" class="canvasLayers" style="z-index:1;"></canvas>\n                <canvas id="dataCanvas" class="canvasLayers" style="z-index:2;"></canvas>\n                <canvas id="drawCanvas" class="canvasLayers" style="z-index:3;"></canvas>\n                <canvas id="hoverCanvas" class="canvasLayers" style="z-index:4;"></canvas>\n                <canvas id="topCanvas" class="canvasLayers" style="z-index:5;"></canvas>\n            </div>\n        </div>\n    </div>\n\n    <!-- sidebar + zoom -->\n    <div id="sidebarContainer">\n        <!-- zoom window goes here -->\n        <div style="position:relative;" id="zoomDiv">\n            <canvas id="zoomCanvas" class="zoomLayers" width=250 height=250 style="position:relative; top: 0px; left: 0px; z-index:1;"></canvas>\n            <canvas id="zoomCrossHair" class="zoomLayers" width=250 height=250 style="position:absolute; top: 0px; left: 0px; z-index:2; background:transparent;"></canvas>\n            <div id="cursorPosition" style="position:relative;">\n            [<span id="mousePosition"></span>]\n            </div>\n        </div>\n\n        <div id="zoom-settings-container"><input type="button" id="zoom-settings-button" title="Change zoom settings" value="⚙" onclick="wpd.zoomView.showSettingsWindow();"/></div>\n        \n        <div style="position:relative;" id="sidebarControlsContainer">\n            <!-- side bars go here -->\n            <!-- axes calibration -->\n<div id="axes-calibration-sidebar" class="sidebar">\n<p class="sidebar-title">Axes Calibration</p>\n<p>Click points to select and use cursor keys to adjust positions. Use Shift+Arrow for faster movement. Click complete when finished.</p>\n<p align="center"><input type="button" value="Complete!" style="width: 120px;" onclick="wpd.alignAxes.getCornerValues();"/></p>\n</div>\n\n<!-- manual mode -->\n<div id="acquireDataSidebar" class="sidebar">\n<p class="sidebar-title">Manual Mode <input type="button" value="Automatic Mode" style="width: 125px;" onclick="wpd.autoExtraction.start();"></p>\n<hr/>\n<p>Dataset <select id="manual-sidebar-dataset-list" onchange="wpd.acquireData.changeDataset(this);" style="width:160px;"></select></p>\n<hr/>\n<p>\n    <input type="button" value="Add Point (A)" onclick="wpd.acquireData.manualSelection();" style="width:115px;" id="manual-select-button">\n    <input type="button" value="Adjust Point (S)" onClick="wpd.acquireData.adjustPoints();" style="width: 115px;" id="manual-adjust-button">\n</p>\n<div class="vertical-spacer"></div>\n<p>\n    <input type="button" value="Delete Point (D)" onclick="wpd.acquireData.deletePoint();" style="width: 115px;" id="delete-point-button">\n    <input id="clearAllBtn" type="button" value="Clear Points" onCLick="wpd.acquireData.clearAll();" style="width: 115px;">\n</p>\n<div class="vertical-spacer"></div>\n<p>\n    <input type="button" value="Edit Labels (E)" id="edit-data-labels" onclick="wpd.acquireData.editLabels();" style="display: none; width: 115px;">\n    <input type="button" value="View Data" id="saveBtn" onclick="wpd.dataTable.showTable();" style="width:115px;">\n</p>\n<div class="vertical-spacer"></div>\n<p>Data Points: <span class="data-point-counter">0</span></p>\n</div>\n\n<!-- edit image -->\n<div id="editImageToolbar" class="sidebar">\n<p align="center"><b>Edit Image</b></p>\n<p align="center"><input type="button" value="H. Flip" style="width: 75px;" onclick="hflip();"><input type="button" value="V. Flip" style="width: 75px;" onClick="vflip();"></p>\n<p align="center"><input type="button" value="Crop" style="width: 150px;" onclick="cropPlot();"></p>\n<p align="center"><input type="button" value="Restore" style="width: 150px;" onclick="restoreOriginalImage();"></p>\n<p align="center"><input type="button" value="Save .PNG" style="width: 150px;" onclick="savePNG();"></p>\n</div>\n\n<!-- automatic mode -->\n<div id="auto-extraction-sidebar" class="sidebar">\n<p class="sidebar-title">Automatic Mode <input type="button" value="Manual Mode" style="width:110px;" onclick="wpd.acquireData.load();"/></p>\n<hr/>\n<p>Dataset <select id="automatic-sidebar-dataset-list" onchange="wpd.acquireData.changeDataset(this);" style="width:160px;"></select></p>\n<hr/>\n<p>Mask <input type="button" value="Box" style="width:50px;" onclick="wpd.dataMask.markBox();" id="box-mask"><input type="button" value="Pen" style="width:45px;" onClick="wpd.dataMask.markPen();" id="pen-mask"><input type="button" value="Erase" style="width:50px;" onClick="wpd.dataMask.eraseMarks();" id="erase-mask"><input type="button" value="View" style="width:40px;" onclick="wpd.dataMask.viewMask();" id="view-mask"/></p>\n<hr/>\n<p>Color <select id="color-detection-mode-select" onchange="wpd.colorPicker.changeDetectionMode();"><option value="fg">Foreground Color</option><option value="bg">Background Color</option></select><input type="button" id="color-button" value=" " onclick="wpd.colorPicker.startPicker();" style="width: 25px;" title="Click to change color"/></p>\n<p>Distance <td><td><input type="text" size="3" id="color-distance-value" onchange="wpd.colorPicker.changeColorDistance();"/>\n<input type="button" value="Filter Colors" onclick="wpd.colorPicker.testColorDetection();" style="width: 90px;"></p>\n<hr/>\n<p>Algorithm\n<select id="auto-extract-algo-name" onchange="wpd.algoManager.applyAlgoSelection();"></select>\n</p>\n<div id="algo-parameter-container" style="margin-left: 10px; margin-top: 5px;"></div>\n<div class="vertical-spacer"></div>\n<p style="margin-top: 5px;">\n    <input type="button" value="Run" style="width:40px;" onclick="wpd.algoManager.run();"/>\n    <input type="button" value="Clear Points" style="width:95px;" onclick="wpd.acquireData.clearAll();"/>\n    <input type="button" value="View Data" style="width:80px;" onclick="wpd.dataTable.showTable();"/>\n</p>\n<hr/>\n<p>Data Points: <span class="data-point-counter">0</span></p>\n</div>\n\n<!-- distance measurement -->\n<div id="measure-distances-sidebar" class="sidebar">\n<p class="sidebar-title">Measure Distances</p>\n<p>\n    <input type="button" value="Add Pair (A)" style="width: 115px;" id="add-pair-button" onclick="wpd.measurement.addItem();"/>\n    <input type="button" value="Delete Pair (D)" style="width: 115px;" id="delete-pair-button" onclick="wpd.measurement.deleteItem();"/> \n</p>\n<div class="vertical-spacer"></div>\n<p>\n    <input type="button" value="Clear All" style="width: 115px;" id="clear-all-pairs-button" onclick="wpd.measurement.clearAll();"/>\n    <input type="button" value="View Data" style="width: 115px;" id="view-measurement-data-button" onclick="wpd.dataTable.showDistanceData();"/>\n</p>\n</div>\n\n<!-- angle measurement -->\n<div id="measure-angles-sidebar" class="sidebar">\n<p class="sidebar-title">Measure Angles</p>\n<p>\n    <input type="button" value="Add Angle (A)" style="width: 115px;" id="add-angle-button" onclick="wpd.measurement.addItem();"/>\n    <input type="button" value="Delete Angle (D)" style="width: 115px;" id="delete-angle-button" onclick="wpd.measurement.deleteItem();"/>\n</p>\n<div class="vertical-spacer"></div>\n<p>\n    <input type="button" value="Clear All" style="width: 115px;" onclick="wpd.measurement.clearAll();"/>\n    <input type="button" value="View Data" style="width: 115px;" onclick="wpd.dataTable.showAngleData();"/>\n</p>\n</div>\n\n<!-- open path measurement -->\n<div id="measure-open-path-sidebar" class="sidebar">\n<p class="sidebar-title">Measure Path</p>\n<p>\n    <input type="button" value="Add Path (A)" style="width: 115px;" id="add-open-path-button" onclick="wpd.measurement.addItem();"/>\n    <input type="button" value="Delete Path (D)" style="width: 115px;" id="delete-open-path-button" onclick="wpd.measurement.deleteItem();"/>\n</p>\n<div class="vertical-spacer"></div>\n<p>\n    <input type="button" value="Clear All" style="width: 115px;" onclick="wpd.measurement.clearAll();"/>\n    <input type="button" value="View Data" style="width: 115px;" onclick="wpd.dataTable.showOpenPathData();"/>\n</p>\n</div>\n\n<!-- closed path measurement -->\n<div id="measure-closed-path-sidebar" class="sidebar">\n<p class="sidebar-title">Measure Closed Path</p>\n<p>\n    <input type="button" value="Add Path (A)" style="width: 115px;" id="add-closed-path-button" onclick="wpd.measurement.addItem();"/>\n    <input type="button" value="Delete Path (D)" style="width: 115px;" id="delete-closed-path-button" onclick="wpd.measurement.deleteItem();"/>\n</p>\n<div class="vertical-spacer"></div>\n<p>\n    <input type="button" value="Clear All" style="width: 115px;" onclick="wpd.measurement.clearAll();"/>\n    <input type="button" value="View Data" style="width: 115px;" onclick="wpd.dataTable.showClosedPathData();"/>\n</p>\n</div>\n\n<!-- grid detection -->\n<div id="grid-detection-sidebar" class="sidebar">\n<p class="sidebar-title">Detect Grid</p>\n<p>\n    Mask\n    <input type="button" value="Box" style="width: 60px;" id="grid-mask-box" onclick="wpd.gridDetection.markBox();"/>\n    <input type="button" value="Clear" style="width: 60px;" id="grid-mask-clear" onclick="wpd.gridDetection.clearMask();"/>\n    <input type="button" value="View"  style="width: 60px;" id="grid-mask-view" onclick="wpd.gridDetection.viewMask();"/>\n</p>\n<hr/>\n<p>\n    Color\n    <input type="button" value="Pick" style="width: 60px;" id="grid-color-picker-button" onclick="wpd.gridDetection.startColorPicker();"/>\n    <input type="text" value="10" style="width: 60px;" id="grid-color-distance" onchange="wpd.gridDetection.changeColorDistance();"/>\n    <input type="button" value="Test" style="width: 60px;" id="grid-color-test" onclick="wpd.gridDetection.testColor();"/>\n</p>\n<p align="center"><input type="checkbox" id="grid-background-mode" checked onchange="wpd.gridDetection.changeBackgroundMode();"/> Background Mode</p>\n<hr/>\n<table>\n    <tr><td align="right">Horizontal </td><td><input type="checkbox" id="grid-horiz-enable" checked/></td></tr>\n    <tr><td align="right">X% </td><td>&nbsp; <input type="text" value="80" id="grid-horiz-perc" style="width: 40px;"/></td></tr>\n    <tr><td align="right">Vertical </td><td><input type="checkbox" id="grid-vert-enable" checked/></td></tr>\n    <tr><td align="right">Y% </td><td>&nbsp; <input type="text" value="80" id="grid-vert-perc" style="width: 40px;"/></td></tr>\n</table>\n<hr/>\n<p align="center">\n    <input type="button" value="Detect" style="width: 100px;" onclick="wpd.gridDetection.run();"/>\n    &nbsp;\n    <input type="button" value="Reset" style="width: 100px;" onclick="wpd.gridDetection.reset();"/>\n</p>\n</div>\n        </div>\n\n    </div>\n</div>\n\n<!-- popup windows go here -->\n    <!-- Background curtain for popups -->\n	<div id="shadow" style="width:100%; height:100%; background-color: rgba(0,0,0,0.3); position:absolute; top:0px; left:0px; z-index:50; visibility:hidden;">\n	</div>\n\n    <!-- Load Image -->\n	<div id="loadNewImage" class="popup" style="width: 400px;">\n	<div class="popupheading">Load Image File</div>\n	<p>&nbsp;</p>\n	<p align="center"><input type="file" id="fileLoadBox"/></p>\n	<p>&nbsp;</p>\n	<p align="center">\n        <input type="button" value="Load" onclick="wpd.graphicsWidget.load();"/>\n        <input type="button" value="Cancel" onclick="wpd.popup.close(\'loadNewImage\');"/>\n    </p>\n	</div>\n\n    <!-- Zoom Settings -->\n    <div id="zoom-settings-popup" class="popup" style="width: 300px;">\n    <div class="popupheading">Magnified View Settings</div>\n    <p>&nbsp;</p>\n    <center>\n    <table>\n    <tr><td><p>Magnification: </p></td><td><p><input type="text" id="zoom-magnification-value" size="3"/> Times</p></td></tr>\n    <tr>\n        <td><p>Crosshair Color: </p></td>\n        <td><p>\n        <select id="zoom-crosshair-color-value">\n            <option value="black">Black</option>\n            <option value="red">Red</option>\n            <option value="yellow">Yellow</option>\n        </select>\n        </td>\n    </tr>\n    </table>\n    </center>\n    <p>&nbsp;</p>\n    <p align="center"><input type="button" value="Apply" onclick="wpd.zoomView.applySettings();"/> <input type="button" value="Cancel" onclick="wpd.popup.close(\'zoom-settings-popup\');"/></p>\n    </div>\n\n    <!-- Run Script -->\n    <div id="runScriptPopup" class="popup" style="width: 500px;">\n    <div class="popupheading">Run Script</div>\n    <p>&nbsp;</p>\n    <p align="center">Load a Javascript file to further extend the capabilities of WebPlotDigitizer. For examples, visit the <a href="http://github.com/ankitrohatgi/WebPlotDigitizer-Examples" target="_blank">WebPlotDigitizer-Examples repository</a>.</p>\n    <p>&nbsp;</p>\n    <p align="center"><input type="file" id="runScriptFileInput"/></p>\n    <p>&nbsp;</p>\n    <p align="center"><input type="button" value="Run" onclick="wpd.scriptInjector.load();"/> <input type="button" value="Cancel" onclick="wpd.scriptInjector.cancel();"/></p>\n    </div>\n\n    <!-- Webcam Capture -->\n    <div id="webcamCapture" class="popup" style="width: 650px;">\n    <div class="popupheading">Webcam Capture</div>\n    <p>&nbsp;</p>\n    <p align="center"><video id="webcamVideo" autoplay="true" height="350"></video></p>\n    <p align="center"><input type="button" value="Capture" onclick="wpd.webcamCapture.capture();"/> <input type="button" value="Cancel" onclick="wpd.webcamCapture.cancel();"/></p>\n    </div>\n\n    <!-- Generic Message Popup -->\n    <div id="messagePopup" class="popup" style="width: 400px;">\n    <div id="message-popup-heading" class="popupheading"></div>\n    <p>&nbsp;</p>\n    <p align="center" id="message-popup-text"></p>\n    <p>&nbsp;</p>\n    <p align="center"><input type="button" value="OK" onclick="wpd.messagePopup.close()"/></p>\n    </div>\n\n    <!-- Generic Ok/Cancel Popup -->\n    <div id="okCancelPopup" class="popup" style="width: 400px;">\n    <div id="ok-cancel-popup-heading" class="popupheading"></div>\n    <p>&nbsp;</p>\n    <p align="center" id="ok-cancel-popup-text"></p>\n    <p>&nbsp;</p>\n    <p align="center"><input type="button" value="OK" onclick="wpd.okCancelPopup.ok()"/> <input type="button" value="Cancel" onclick="wpd.okCancelPopup.cancel()"/></p>\n    </div>\n\n    <!-- Choose axes type -->\n	<div id="axesList" class="popup" style="width: 400px;">\n	<div class="popupheading">Choose Plot Type</div>\n	<p>&nbsp;</p>\n	<center>\n	<table>\n	<tr><td align="left"><label><input type="radio" name="plotlisting" id="r_xy" checked> 2D (X-Y) Plot</label></td></tr>\n	<tr><td align="left"><label><input type="radio" name="plotlisting" id="r_bar"> 2D Bar Plot</label></td></tr>\n	<tr><td align="left"><label><input type="radio" name="plotlisting" id="r_polar"> Polar Diagram</label></td></tr>\n	<tr><td align="left"><label><input type="radio" name="plotlisting" id="r_ternary"> Ternary Diagram</label></td></tr>\n	<tr><td align="left"><label><input type="radio" name="plotlisting" id="r_map"> Map With Scale Bar</label></td></tr>\n	<tr><td align="left"><label><input type="radio" name="plotlisting" id="r_image"> Image</label></td></tr>\n	</table>\n	</center>\n	<p>&nbsp;</p>\n	<p align="center"><input type="button" value="Align Axes" onclick="wpd.alignAxes.start();">&nbsp;<input type="button" value="Cancel" onClick="wpd.popup.close(\'axesList\');"></p>\n	</div>\n\n    <!-- XY Alignment -->\n	<div id="xyAlignment" class="popup" style="width: 400px;">\n	<div class="popupheading">X and Y Axes Calibration</div>\n	<p>&nbsp;</p>\n	<p align="center">Enter X-values of the two points clicked on X-axis and Y-values of the two points clicked on Y-axes</p>\n	<center>\n	<table padding="10">\n		<tr>\n            <td></td>\n			<td align="center" valign="bottom">Point 1</td>\n			<td align="center" valign="bottom" width="80">Point 2</td>\n			<td align="center" valign="bottom" width="82">Log Scale</td>\n		</tr>\n	    <tr>\n            <td align="center">X-Axis:</td>\n	        <td align="center"><input type="text" size="8" id="xmin" value="0" /></td>\n	        <td align="center"><input type="text" size="8" id="xmax" value="1" /></td>\n	        <td align="center"><input type="checkbox" id="xlog"></td>\n	    </tr>\n	    <tr>\n            <td align="center">Y-Axis:</td>\n	        <td align="center"><input type="text" size="8" id="ymin" value="0" /></td>\n	        <td align="center"><input type="text" size="8" id="ymax" value="1" /></td>\n	        <td align="center"><input type="checkbox" id="ylog" /></td>\n	    </tr>\n	</table>\n	<p align="center" class="footnote">*For dates, use yyyy/mm/dd format (e.g. 2013/10/23 or 2013/10). For exponents, enter values as 1e-3 for 10^-3.</p>\n	<p>&nbsp;</p>\n	<p align="center"><input type="button" id="xybtn" value="OK" onclick="wpd.alignAxes.align();" /></p>\n	</center>\n	</div>\n\n    <!-- Bar Alignment -->\n    <div id="barAlignment" class="popup" style="width: 400px;">\n    <div class="popupheading">Bar Chart Calibration</div>\n    <p align="center">Enter the values at the two points selected on the continuous axes along the bars</p>\n    <center>\n    <table padding="10">\n        <tr>\n            <td align="center" valign="bottom">Point 1</td>\n            <td align="center" valign="bottom" width="80">Point 2</td>\n            <td align="center" valign="Log Scale" width="80">Log Scale</td>\n        </tr>\n        <tr>\n            <td align="center"><input type="text" size="8" id="bar-axes-p1" value="0" /></td>\n            <td align="center"><input type="text" size="8" id="bar-axes-p2" value="1" /></td>\n            <td align="center"><input type="checkbox" id="bar-axes-log-scale"/></td>\n        </tr>\n    </table>\n    </center>\n    <p>&nbsp;</p>\n    <p align="center"><input type="button" value="OK" onclick="wpd.alignAxes.align();"/></p>\n    </div>\n\n    <!-- Map Alignment -->\n	<div id="mapAlignment" class="popup" style="width: 200px;">\n	<div class="popupheading">Scale Size</div>\n	<p>&nbsp;</p>\n	<p align="center"><input type="text" size="6" id="scaleLength" value="1"> <input type="text" size="6" id="scaleUnits" value="Units"/></p>\n	<p>&nbsp;</p>\n	<p align="center"><input type="button" id="xybtn" value="OK" onclick="wpd.alignAxes.align();"></p>\n	</div>\n\n    <!-- Polar Alignment -->\n	<div id="polarAlignment" class="popup" style="width: 400px;">\n    <div class="popupheading">Align Polar Axes</div>\n    <center>\n    <table padding="15">\n        <tr>\n            <td>&nbsp;</td>\n            <td align="center"><b>Point 1</b></td>\n            <td align="center"><b>Point 2</b></td>\n            <td align="center"><b>Log Scale</b></td>\n        </tr>\n        <tr>\n            <td>R: </td>\n            <td align="center"><input type="text" size="6" id="polar-r1" value="1"/></td>\n            <td align="center"><input type="text" size="6" id="polar-r2" value="1"/></td>\n            <td align="center"><input type="checkbox" id="polar-log-scale"/></td>\n        </tr>\n        <tr>\n            <td>Θ: </td>\n            <td align="center"><input type="text" size="6" id="polar-theta1" value="1"/></td>\n            <td align="center"><input type="text" size="6" id="polar-theta2" value="1"/></td>\n            <td align="center">&nbsp;</td>\n        </tr>\n    </table>\n    </center>\n	<p align="center"><label><input type="radio" id="polar-degrees" name="angleUnits" checked> Degrees</label> <label><input type="radio" id="polar-radians" name="angleUnits"> Radians</p></label>\n	<p align="center"><input type="checkbox" id="polar-clockwise"> Clockwise</p>\n    <br/>\n	<p align="center"><input type="button" value="OK" onclick="wpd.alignAxes.align();"></p>\n	</div>\n\n    <!-- Ternary Alignment -->\n	<div id="ternaryAlignment" class="popup">\n	<div class="popupheading">Select Range of Variables</div>\n	<p>&nbsp;</p>\n	<p align="center">Axes Orientation</p>\n	<center>\n	<table>\n	  <tr><td><img src="/viewer/WPD/images/ternarynormal.png" width="200"></td><td><img src="/viewer/WPD/images/ternaryreverse.png" width="200"></td></tr>\n	  <tr><td><p align="center"><input type="radio" name="ternaryOrientation" id="ternarynormal" checked> Normal</p></td><td><p align="center"><input type="radio" name="ternaryOrientation" id="ternaryreverse"> Reverse</p></td></tr>\n	</table>\n	</center>\n	<p align="center">Range of Variables</p>\n	<center>\n	<table><tr><td><p align="center"><input type="radio" id="range0to1" name="ternaryRange" checked> 0 to 1&nbsp;&nbsp;</p></td><td><p align="center">&nbsp;&nbsp;<input type="radio" id="range0to100" name="ternaryRange"> 0 to 100</p></td></tr></table>\n	</center>\n	<p>&nbsp;</p>\n	<p align="center"><input type="button" value="OK" onclick="wpd.alignAxes.align();"></p>\n	</div>\n\n    <!-- View Data -->\n	<div id="csvWindow" class="popup" style="height: 430px;">\n	<div class="popupheading">Acquired Data</div>\n    <table>\n    <tr>\n    <td>\n    <!-- left panel -->\n    <span id="data-table-dataset-control"><p>Dataset: <select id="data-table-dataset-list" onchange="wpd.dataTable.changeDataset();"></select></p></span>\n    <p align="center">Variables: <span id="dataVariables"></span></p>\n	<p align="center"><textarea id="digitizedDataTable" style="width: 460px; height: 250px;" readonly></textarea></p>\n	<p align="center">\n		<input type="button" value="Select All" onclick="wpd.dataTable.selectAll();"/>\n        <!--<input type="button" value="Download .CSV" onclick="wpd.dataTable.generateCSV();"/>\n		<input type="button" value="Graph in Plotly*" onclick="wpd.dataTable.exportToPlotly();"/>-->\n		<input type="button" value="Close" onclick="wpd.popup.close(\'csvWindow\');"/>\n	</p>\n    </td>\n    <td valign="top" style="width:180px;">\n    <!-- data side controls -->\n    <p><b>Sort</b></p>\n    <p class="leftIndent">Sort by: <select id="data-sort-variables" onchange="wpd.dataTable.reSort();"></select></p>\n    <p class="leftIndent">Order:\n		<select id="data-sort-order" onchange="wpd.dataTable.reSort();">\n			<option value="ascending">Ascending</option>\n			<option value="descending">Descending</option>\n		</select>\n	</p>\n    <hr/>\n    <p><b>Format</b></p>\n	<p class="leftIndent">\n		<span id="data-date-formatting-container">\n		Date Formatting:\n        <span id="data-date-formatting"></span>\n		</span>\n	</p>\n    <p class="leftIndent">Number Formatting:</p>\n    <p>Digits: <input type="text" value="5" size="2" id="data-number-format-digits"/>\n        <select id="data-number-format-style">\n            <option value="ignore">Ignore</option>\n            <option value="fixed">Fixed</option>\n            <option value="precision">Precision</option>\n            <option value="exponential">Exponential</option>\n        </select>\n    </p>\n    <p>Column Separator: <input type="text" value=", " size="2" id="data-number-format-separator"/></p>\n	<p align="right"><input type="button" value="Format" onclick="wpd.dataTable.reSort();"/></p>\n    </td>\n    </tr>\n    </table>\n	</div>\n\n    <!-- XY Axes Calibration Instructions -->\n	<div id="xyAxesInfo" class="popup" style="width:400px;">\n	<div class="popupheading">Align X-Y Axes</div>\n	<p>&nbsp;</p>\n	<p align="center"><img src="/viewer/WPD/images/xyaxes.png" /></p>\n	<p align="center">Click four known points on the axes in the <font color="red">order shown in red</font>. Two on the X axis (X1, X2) and two on the Y axis (Y1, Y2).</p>\n	<p>&nbsp;</p>\n	<p align="center"><input type="button" value="Proceed" onclick="wpd.xyCalibration.pickCorners();" /></p>\n	</div>\n\n    <!-- Bar Chart Axes Calibration Intructions -->\n    <div id="barAxesInfo" class="popup" style="width:650px;">\n    <div class="popupheading">Align Bar Chart Axes</div>\n    <p>&nbsp;</p>\n    <p align="center"><img src="/viewer/WPD/images/barchart.png" /></p>\n    <p align="center">Click on two known points (P1, P2) on the continuous axes along the bars</p>\n    <p>&nbsp;</p>\n    <p align="center"><input type="button" value="Proceed" onclick="wpd.barCalibration.pickCorners();" /></p>\n    </div>\n\n    <!-- Map Axes Calibration Instructions -->\n	<div id="mapAxesInfo" class="popup" style="width: 350px;">\n	<div class="popupheading">Align Map To Scale Bar</div>\n	<p>&nbsp;</p>\n	<p align="center"><img src="/viewer/WPD/images/map.png" /></p>\n	<p align="center">Click on the two ends of the scale bar on the map.</p>\n	<p>&nbsp;</p>\n	<p align="center"><input type="button" value="Proceed" onclick="wpd.mapCalibration.pickCorners();"></p>\n	</div>\n\n    <!-- Polar Axes Calibration Instructions -->\n	<div id="polarAxesInfo" class="popup" style="width: 350px;">\n	<div class="popupheading">Align Polar Axes</div>\n	<p>&nbsp;</p>\n	<p align="center"><img src="/viewer/WPD/images/polaraxes.png" /></p>\n	<p align="center">Click on the center, followed by two known points.</p>\n	<p>&nbsp;</p>\n	<p align="center"><input type="button" value="Proceed" onclick="wpd.polarCalibration.pickCorners();"></p>\n	</div>\n\n    <!-- Ternary Axes Calibration Instructions -->\n	<div id="ternaryAxesInfo" class="popup" style="width: 350px;">\n	<div class="popupheading">Align Ternary Axes</div>\n	<p>&nbsp;</p>\n	<p align="center"><img src="/viewer/WPD/images/ternaryaxes.png" /></p>\n	<p align="center">Click on the three corners in the order shown above.</p>\n	<p>&nbsp;</p>\n	<p align="center"><input type="button" value="Proceed" onclick="wpd.ternaryCalibration.pickCorners();"></p>\n	</div>\n\n    <!-- About WPD -->\n	<div id="helpWindow" class="popup" style="width: 600px;">\n	<div class="popupheading">WebPlotDigitizer - Web Based Plot Digitizer</div>\n	<p>&nbsp;</p>\n    <p align="center">Version 3.10</p>\n	<p align="center">This program is distributed under the <a href="https://www.gnu.org/licenses/gpl-3.0-standalone.html" target="_blank">GNU General Public License Version 3</a>.</p>\n	<p align="center">Copyright 2010-2016 Ankit Rohatgi &lt;ankitrohatgi@hotmail.com&gt;</p>\n	<p align="center"><a href="http://arohatgi.info/WebPlotDigitizer" target="website">http://arohatgi.info/WebPlotDigitizer</a></p>\n	<p>&nbsp;</p>\n	<p align="center"><input type="button" value="Close" onclick="wpd.popup.close(\'helpWindow\');"></p>\n	</div>\n\n    <!-- Color Selection -->\n    <div id="color-selection-widget" class="popup" style="width:400px;">\n	<div id="color-selection-title" class="popupheading">Specify Color</div>\n	<p align="center">&nbsp;</p>\n    <div style="text-align:center;"><div id="color-selection-selected-color-box" class="largeColorBox"></div></div>\n	<p align="center">&nbsp;</p>\n	<p align="center">R:<input type="text" value="255" id="color-selection-red" size="3">&nbsp;\n	G:<input type="text" id="color-selection-green" value="255" size="3">&nbsp; B:<input type="text" id="color-selection-blue" value="255" size="3">\n	 <input type="button" value="Color Picker" onclick="wpd.colorSelectionWidget.pickColor();"></p>\n	<p align="center">&nbsp;</p>\n    <p>Dominant Colors: <div id="color-selection-options" style="text-align:center;"></div></p>\n    <p>&nbsp;</p>\n	<p align="center"><input type="button" value="Done" onclick="wpd.colorSelectionWidget.setColor();"></p>\n	</div>\n\n\n    <!-- Manage Data Series -->\n    <div id="manage-data-series-window" class="popup" style="width:425px;">\n    <div class="popupheading">Manage Datasets</div>\n    <p>&nbsp;</p>\n    <center>\n    <table name="data_series_info">\n    <!--<tr>\n        <td align="right">Selected Dataset: </td><td> &nbsp;<select id="manage-data-series-list" style="width:200px;" onchange="wpd.dataSeriesManagement.changeSelectedSeries();"><option>Default Dataset</option></select></td>\n    </tr>\n    <tr><td>&nbsp;</td><td>&nbsp;</td></tr>-->\n    <tr>\n        <td align="right">Dataset Name: </td><td> &nbsp;\n        <input type="text" id="manage-data-series-name" onblur="wpd.dataSeriesManagement.editSeriesName();" onchange="wpd.dataSeriesManagement.editSeriesName();"/>\n        <input type="button" value="Change" onclick="wpd.dataSeriesManagement.editSeriesName();"/></td>\n    </tr>\n    <tr>\n        <td align="right">Data Points: </td><td> &nbsp;<span id="manage-data-series-point-count">0</span></td>\n    </tr>\n    <tr><td>&nbsp;</td><td>&nbsp;</td></tr>\n    <tr><td colspan="2"><table name="point_field_table"><tbody></tbody></table></td></tr>\n    </table>\n    <input type="button" value="Add Field" onclick="wpd.dataSeriesManagement.addField(null);"/>\n    </center>\n    <p>&nbsp;</p>\n    <p align="center">\n        <input type="button" value="View Data" onclick="wpd.dataSeriesManagement.viewData();"/>\n        <input type="button" value="Close" onclick="wpd.dataSeriesManagement.validateAndClose();"/>\n    </p>\n    </div>\n\n\n    <!-- Get Extra Variable Data -->\n    <div id="extra-variable-prompt" class="popup" style="width:425px;">\n        <div class="popupheading">Extra Variables</div>\n        <p>&nbsp;</p>\n        <center>\n            <input type="hidden" id="pointData"/>\n            <table name="extra_var_table"><tbody></tbody></table></td>\n        </center>\n        <p>&nbsp;</p>\n        <p align="center">\n            <input type="button" value="Close" onclick="wpd.dataSeriesManagement.activeDataSeries.validateExtraAndClose();"/>\n        </p>\n    </div>\n\n\n    <!-- Axes Transformation Equations -->\n    <div id="axes-transformation-equations-window" class="popup" style="width:600px;">\n    <div class="popupheading">Transformation Equations</div>\n    <p>The following relationships are being used to convert image pixels to data:</p>\n    <div id="axes-transformation-equation-list"></div>\n    <p>&nbsp;</p>\n    <p align="center"><input type="button" value="Close" onclick="wpd.popup.close(\'axes-transformation-equations-window\');"/></p>\n    </div>\n\n    <!-- Export JSON -->\n    <div id="export-json-window" class="popup" style="width:500px;">\n    <div class="popupheading">Export JSON</div>\n    <p>This JSON file contains the axes calibration and the digitized data points from this plot. This file can be imported later to resume work or reuse the calibration in another plot.</p>\n    <p>&nbsp;</p>\n    <p align="center">\n        <input type="button" value="Download" onclick="wpd.saveResume.download();"/>\n        <input type="button" value="Close" onclick="wpd.popup.close(\'export-json-window\');"/>\n    </p>\n    </div>\n\n    <!-- Import JSON -->\n    <div id="import-json-window" class="popup" style="width:500px;">\n    <div class="popupheading">Import JSON</div>\n    <p>Specify a previously exported JSON file to load here. Note that this will clear any unsaved data points in the current plot.</p>\n    <p>&nbsp;</p>\n    <p align="center">JSON File: <input type="file" id="import-json-file"/></p>\n    <p>&nbsp;</p>\n    <p align="center">\n        <input type="button" value="Import" onclick="wpd.saveResume.read();"/>\n        <input type="button" value="Cancel" onclick="wpd.popup.close(\'import-json-window\');"/>\n    </p>\n    </div>\n\n    <!-- Adjust Data Points Keyboard Shortcuts -->\n    <div id="adjust-data-points-keyboard-shortcuts-window" class="popup" style="width:400px;">\n    <div class="popupheading">Keyboard Shortcuts</div>\n    <p>Click to select a data point. The following keys can then be used to the adjust the position:</p>\n    <center>\n    <table cellspacing="5" border="0">\n    <tr><td align="right">Cursor (Arrows) -</td><td>Move up/down/right/left</td></tr>\n    <tr><td align="right">Shift + Cursor -</td><td>Faster rate of movement</td></tr>\n    <tr><td align="right">Q -</td><td>Select next point</td></tr>\n    <tr><td align="right">W -</td><td>Select previous point</td></tr>\n    <tr><td align="right">Del/Backspace -</td><td>Delete point</td></tr>\n    <tr><td align="right">E -</td><td>Edit label (Bar Chart)</td></tr>\n    </table>\n    </center>\n    <p>&nbsp;</p>\n    <p align="center"><input type="button" value="Close" onclick="wpd.popup.close(\'adjust-data-points-keyboard-shortcuts-window\');"/></p>\n    </div>\n\n    <!-- Data point label editor -->\n    <div id="data-point-label-editor" class="popup" style="width:280px;">\n    <div class="popupheading">Edit Label</div>\n    <p>&nbsp;</p>\n    <p align="center">Label: <input type="text" value="Data Point" id="data-point-label-field" onkeydown="wpd.dataPointLabelEditor.keydown(event);"/></p>\n    <p>&nbsp;</p>\n    <p align="center">\n        <input type="button" value="OK" onclick="wpd.dataPointLabelEditor.ok();"/>\n        <input type="button" value="Cancel" onclick="wpd.dataPointLabelEditor.cancel();"/>\n    </p>\n    </div>\n\n    <!-- Perspective Transform Instructions -->\n    <div id="perspective-info" class="popup" style="width:500px;">\n    <div class="popupheading">Perspective Transformation</div>\n    <p align="center"><img src="/viewer/WPD/images/perspective.png" width="350"></p>\n    <br/>\n    <p align="center">Click on four corners of the region to be transformed as shown.</p>\n    <br/>\n    <p align="center">\n        <input type="button" value="OK" onclick="wpd.perspective.pickCorners();"/>\n        <input type="button" value="Cancel" onclick="wpd.popup.close(\'perspective-info\');"/>\n    </p>\n    </div>\n\n    <!-- Edit or Reset Calibration Dialog -->\n    <div id="edit-or-reset-calibration-popup" class="popup" style="width:500px;">\n    <div class="popupheading">Edit Existing Calibration?</div>\n    <br/>\n    <p align="center">Do you wish to tweak existing axes calibration or select a new axes type?</p>\n    <br/>\n    <p align="center">\n        <input type="button" value="Edit Calibration" onclick="wpd.alignAxes.reloadCalibrationForEditing();"/>\n\n        <input type="button" value="Change Axes Type" onclick="wpd.popup.close(\'edit-or-reset-calibration-popup\');wpd.popup.show(\'axesList\');"/>\n\n        <input type="button" value="Cancel" onclick="wpd.popup.close(\'edit-or-reset-calibration-popup\');"/>\n    </p>\n    </div>\n\n<!-- strings for translation -->\n<div class="i18n-string" id="i18n-string-wpd">WebPlotDigitizer</div>\n<div class="i18n-string" id="i18n-string-unstable-version-warning">Unstable version warning!</div>\n<div class="i18n-string" id="i18n-string-unstable-version-warning-text">You are using a beta version of WebPlotDigitizer. There may be some issues with the software that are expected.</div>\n<div class="i18n-string" id="i18n-string-import-json">Import JSON</div>\n<div class="i18n-string" id="i18n-string-json-data-loaded">JSON data has been loaded!</div>\n<div class="i18n-string" id="i18n-string-calibration-invalid-inputs">Invalid Inputs</div>\n<div class="i18n-string" id="i18n-string-calibration-enter-valid">Please enter valid values for calibration.</div>\n<div class="i18n-string" id="i18n-string-acquire-data">Acquire Data</div>\n<div class="i18n-string" id="i18n-string-acquire-data-calibration">Please calibrate the axes before acquiring data.</div>\n<div class="i18n-string" id="i18n-string-clear-data-points">Clear data points?</div>\n<div class="i18n-string" id="i18n-string-clear-data-points-text">This will delete all data points from this dataset</div>\n<div class="i18n-string" id="i18n-string-webcam-capture">Webcam Capture</div>\n<div class="i18n-string" id="i18n-string-webcam-capture-text">Your browser does not support webcam capture using HTML5 APIs. A recent version of Google Chrome is recommended.</div>\n<div class="i18n-string" id="i18n-string-transformation-eqns">Transformation Equations</div>\n<div class="i18n-string" id="i18n-string-transformation-eqns-text">Transformation equations are available only after axes have been calibrated.</div>\n<div class="i18n-string" id="i18n-string-unsupported">Unsupported Feature!</div>\n<div class="i18n-string" id="i18n-string-unsupported-text">This feature has not been implemented in the current version. This may be available in a future release.</div>\n<div class="i18n-string" id="i18n-string-processing">Processing</div>\n<div class="i18n-string" id="i18n-string-invalid-file">ERROR: Invalid File!</div>\n<div class="i18n-string" id="i18n-string-invalid-file-text">Please load a valid image file. Common image formats such as JPG, PNG, BMP, GIF etc. should work. PDF or Word documents are not accepted.</div>\n<div class="i18n-string" id="i18n-string-raw">Raw</div>\n<div class="i18n-string" id="i18n-string-nearest-neighbor">Nearest Neighbor</div>\n<div class="i18n-string" id="i18n-string-manage-datasets">Manage Datasets</div>\n<div class="i18n-string" id="i18n-string-manage-datasets-text">Please calibrate the axes before managing datasets.</div>\n<div class="i18n-string" id="i18n-string-can-not-delete-dataset">Can Not Delete!</div>\n<div class="i18n-string" id="i18n-string-can-not-delete-dataset-text">You can not delete this dataset as at least one dataset is required.</div>\n<div class="i18n-string" id="i18n-string-delete-dataset">Delete Dataset</div>\n<div class="i18n-string" id="i18n-string-delete-dataset-text">You can not delete this dataset as at least one dataset is required.</div>\n<div class="i18n-string" id="i18n-string-averaging-window">Averaging Window</div>\n<div class="i18n-string" id="i18n-string-x-step-with-interpolation">X Step w/ Interpolation</div>\n<div class="i18n-string" id="i18n-string-x-step">X Step</div>\n<div class="i18n-string" id="i18n-string-blob-detector">Blob Detector</div>\n<div class="i18n-string" id="i18n-string-bar-extraction">Bar Extraction</div>\n<div class="i18n-string" id="i18n-string-histogram">Histogram</div>\n<div class="i18n-string" id="i18n-string-specify-foreground-color">Specify Plot (Foreground) Color</div>\n<div class="i18n-string" id="i18n-string-specify-background-color">Specify Background Color</div>\n<div class="i18n-string" id="i18n-string-existing-data">Data Already Exists</div>\n<div class="i18n-string" id="i18n-string-existing-data-text">You have existing points which don\'t contain your new variable. For consistent data, clear the existing points. Would you like to clear your existing points now?</div>\n\n\n\n\n</body>\n</html>');
})();