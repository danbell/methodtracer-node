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
    methodtracer = require('methodtracer').create({ 
        log: function(message, exception) { logger.debug(message, exception); }
    });
    
    function my_method(param1, param2, callback) {
        callback = methodtracer.init('my_method', param1, param2).callback(callback);
        
        // do stuff
        
        callback(null, result);
    }

Output:

    [2012-10-25 10:02:34] [DEBUG] test - >>> my_method("the 1st param", "the 2nd param")
    [2012-10-25 10:02:36] [DEBUG] test - <<< my_method("the 1st param", "the 2nd param"): result=("the result") (2176ms)

For synchronous usage:

    function my_method_sync(param1, param2) {
        mt = methodtracer.init('my_method', param1, param2);
        
        // do stuff
        
        return mt.result('the result');
    }

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