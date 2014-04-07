var util = require('util');

var methodtracer = module.exports = {};

var _BASE_OBJECT_STRING_RE = /^\s*\[object\s+[^\]]+\]\S*$/;
methodtracer.getParamString1 = function(arg) {
  if (typeof arg === 'function') {
    return '[Function]';
  } else if (typeof arg === 'string') {
    return '"' + arg + '"'; 
  }
  var s = '' + arg;
  if (s.match(_BASE_OBJECT_STRING_RE)) {
    s = util.inspect(arg);
  }
  return s;
};

methodtracer.getParamString = function(args) {
  return args.map(methodtracer.getParamString1).join(', ');
};

// 
// Nop alternatives for when logging is disabled
//

function NopMethodTracer() {
  this.callback = function(cb) {
    return cb;
  };
}

function NopMethodTracerFactory() {
  this.init = function() {
    return new NopMethodTracer();
  };
}

//
// The real deal
//

function MethodTracer(config, methodname /* , params */) {
  this.config = config;
  this.methodcall = config.describeMethod(methodname, Array.prototype.slice.call(arguments).slice(2));
  this.start = Date.now();

  config.log(config.getInMessage(this));
}

MethodTracer.prototype.elapsedMs = function() {
  return Date.now() - this.start;
};

function methodExitOk(mt, returnValues) {
  mt.config.log(mt.config.getOutOkMessage(mt, returnValues));
}

function methodExitError(mt, error) {
  mt.config.log(mt.config.getOutErrorMessage(mt, error));
}

MethodTracer.prototype.result = function(returnValue) {
  methodExitOk(this, [returnValue]);
  return returnValue;
};

MethodTracer.prototype.callback = function(cb) {
  var self = this;
  return function() {
    var args = Array.prototype.slice.call(arguments), error = (args.length > 0 ? args[0] : undefined);
    if (error) {
      methodExitError(self, error);
    } else {
      methodExitOk(self, args.slice(1));
    } 
    if (cb) {
      cb.apply(undefined, args);
    }
  };  
};

function MethodTracerFactory(config) {
  this.init = function(/* methodname, params */) {
    if (!config.isLogEnabledFn || config.isLogEnabledFn()) {
      var args = [ config ].concat(Array.prototype.slice.call(arguments)),
      mt = Object.create(MethodTracer.prototype);
      MethodTracer.apply(mt, args);
      return mt;      
    } else {
      return new NopMethodTracer();
    }
  };
}


methodtracer.create = function(config) {
  if (!config || !config.log) {
    throw new Error("methodtracer: invalid configuration specified");
  }
  config.getInMessage = config.getInMessage || function(mt) {
    return '>>> ' + mt.methodcall;
  };
  config.getOutOkMessage = config.getOutOkMessage || function(mt, args) {
    return '<<< ' + mt.methodcall + ': result=(' + methodtracer.getParamString(args) + ') (' + mt.elapsedMs() + 'ms)';
  };
  config.getOutErrorMessage = config.getOutErrorMessage || function(mt, error) {
    return '<<< ' + mt.methodcall + ': error=(' + methodtracer.getParamString1(error) + ') (' + mt.elapsedMs() + 'ms)';
  };
  config.describeMethod = config.describeMethod || function(methodname, args) {
    return methodname + '(' + methodtracer.getParamString(args) + ')';
  };

  if (process.env.NODE_METHOD_TRACER_DISABLED) {
    return new NopMethodTracerFactory();
  } else {
    return new MethodTracerFactory(config);
  }
};

