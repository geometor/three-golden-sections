(function() {
  
  // This is a template to begin creating a JS libray. Just replace all instances 
  // of `lib` with whatever variable you want to use for reference.

  // Baseline setup
  // --------------

  // Establish the root object, `window` in the browser, or `exports` on the server.
  var root = this;

  // Save the previous value of the `_` variable.
  var previousLib = root.lib;
  
  // Create a safe reference to the lib object for use below.
  var lib = function(obj) {
    if (obj instanceof lib) return obj;
    if (!(this instanceof lib)) return new lib(obj);
    this.libwrapped = obj;
  };
  
  // Export the lib object for **Node.js**, with
  // backwards-compatibility for the old `require()` API. If we're in
  // the browser, add `lib` as a global object.
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = lib;
    }
    exports.lib = lib;
  } else {
    root.lib = lib;
  }
  
  // Current version.
  lib.VERSION = '0.0.0';
  
  /**
  * ALL YOUR CODE IS BELONG HERE
  **/
  
  // AMD registration happens at the end for compatibility with AMD loaders
  // that may not enforce next-turn semantics on modules. Even though general
  // practice for AMD registration is to be anonymous, lib registers
  // as a named module because, like jQuery, it is a base library that is
  // popular enough to be bundled in a third party lib, but not be part of
  // an AMD load request. Those cases could generate an error when an
  // anonymous define() is called outside of a loader request.
  if (typeof define === 'function' && define.amd) {
    define('lib', [], function() {
      return lib;
    });
  }
}.call(this));