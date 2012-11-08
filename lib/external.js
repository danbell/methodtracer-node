var external = module.exports;

external.getLastArg = function(createIfNoCb) {
  return function(args) {
    if (args.length > 0 && args[args.length-1] instanceof Function) {
      return args.length - 1;
    } else if (createIfNoCb) {
      args.push(function() {});
      return args.length - 1;
    }
    return -1;
  };
};

external.getFirstArg = function(createIfNoCb) {
  return function(args) {
    if (args.length > 0 && args[0] instanceof Function) {
      return 0;
    } else if (createIfNoCb) {
      args.unshift(function() {});
      return 0;
    }
    return -1;
  };
};

function wrapCallback(mt, callbackAccessor, args) {
  var index = callbackAccessor(args);
  if (index >= 0) {
    args[index] = mt.callback(args[index]);
  }
}

external.wrap = function(mtfactory, func, options) {
  options = options || {};
  options.name = options.name || func.name || '<anonymous func>';
  options.getCallback = options.getCallback || external.getLastArg(true);

  return function() {
    var args = Array.prototype.slice.call(arguments),
    thisArg = options.thisArg || this,
    mt = mtfactory.init.apply(mtfactory, [ options.name ].concat(args)),
    cb;

    if (options.sync) {
      return mt.result(func.apply(thisArg, args));
    } else {
      wrapCallback(mt, options.getCallback, args);
      func.apply(thisArg, args);
    }      
  };
};
