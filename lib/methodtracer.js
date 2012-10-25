var util = require('util');

var methodtracer = module.exports = {};

var _BASE_OBJECT_STRING_RE = /^\s*\[object [^\]]+\]\S*$/;
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

  config.log(config.logIn(this));
}

MethodTracer.prototype.elapsedMs = function() {
  return Date.now() - this.start;
};

MethodTracer.prototype.result = function(/* returnValues */) {
  this.config.log(this.config.logOutOk(this, Array.prototype.slice.call(arguments)));
};

MethodTracer.prototype.error = function(error) {
  this.config.log(this.config.logOutError(this, error));
};

MethodTracer.prototype.exit = function(error /* , returnValues */) {
  var self = this, args = Array.prototype.slice.call(arguments).slice(1);
  if (error) {
    self.error(error);
  } else {
    self.result.apply(self, args);
  }
};

MethodTracer.prototype.callback = function(cb) {
  var self = this;
  return function() {
    var args = Array.prototype.slice.call(arguments);
    self.exit.apply(self, args);
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
  config.logIn = config.logIn || function(mt) {
    return '>>> ' + mt.methodcall;
  };
  config.logOutOk = config.logOutOk || function(mt, args) {
    return '<<< ' + mt.methodcall + ': result=(' + methodtracer.getParamString(args) + ') (' + mt.elapsedMs() + 'ms)';
  };
  config.logOutError = config.logOutError || function(mt, error) {
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
