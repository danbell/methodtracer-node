# methodtracer-node

This is a utility for logging function entry and exit. It will log to your 
favourite logger a message on function entry and a message on function exit. The 
function exit message indicates success or failure and the duration of time 
spent in the function.

## installation

npm install methodtracer

## usage

For standard asynchronous usage:

    var logger = ...,
    mt = require('methodtracer').create({ 
        log: function(message, exception) { logger.debug(message, exception); }
    });
    
    function my_method(param1, param2, callback) {
        callback = mt.init('my_method', param1, param2).callback(callback);
        
        // do stuff
        
        callback(null, result);
    }

Output:

    [2012-10-25 10:02:34] [DEBUG] test - >>> my_method("the 1st param", "the 2nd param")
    [2012-10-25 10:02:36] [DEBUG] test - <<< my_method("the 1st param", "the 2nd param"): result=("the result") (2176ms)

For synchronous usage:

    function my_method_sync(param1, param2) {
        var mts = mt.init('my_method', param1, param2);
        
        // do stuff
        
        return mts.result('the result');
    }

### External or thirdparty functions

Sometimes we may want to trace calls to an external or thirdparty function, which we can't modify to put the 
methodtracer code into. In this case, we use the methodtracer.external.wrap() method.

For asynchronous usage:

    var methodtracer = require('methodtracer'),
    mt = methodtracer.create(...);

    function my_thirdparty_func(a, b, cb) { ... } // external function to be traced

    var my_thirdparty_func_traced = methodtracer.external.wrap(mt, my_thirdparty_func);

    my_thirdparty_func_traced(1, 2, function(error, result) { ... });

An options object may also be passed as the third parameter to the methodtracer.external.wrap() method:

    {
      thisArg: null, // optional "this" to be set when calling the external method
      name: null,    // optional function name to be used
      getCallback: null, // optional method to call to retrieve callback from argument list
                         // see methodtracer.external.getLastArg or 
                         // methodtracer.external.getFirstArg
      sync: false // optional boolean which specifies if method is synchronous/asynchronous
    }

For synchronous usage:

    var methodtracer = require('methodtracer'),
    mt = methodtracer.create(...);

    function my_thirdparty_func(a, b) { ... }

    var my_thirdparty_func_traced = methodtracer.external.wrap(mt, my_thirdparty_func, { sync: true });

    var result = my_thirdparty_func_traced(1, 2);
    

### disabling

All method tracing can be disabled by setting the environment variable NODE_METHOD_TRACER_DISABLED to a value.

## configuration

The methodtracer.create method takes a configuration object:

    { log: function(message, exception) { ... },
      isLogEnabledFn: function() { return true/false; },
      getInMessage: function(mt) { return " ... "; },
      getOutOkMessage: function(mt, args) { return " ... "; },
      getOutErrorMessage: function(mt, error) { return " ... "; }
    }
    
of which only the "log" function is required.

### log4js

If you are using log4js for logging, then you can use the methodtracer.createLog4js 
method to create the methodtracer:

    var log4js = require('log4js'),
    logger = log4js.getLogger('the-category'),
    methodtracer = require('methodtracer').createLog4js(logger, log4js.levels.DEBUG);