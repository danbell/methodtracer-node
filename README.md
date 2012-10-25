



    var logger = ...,
    methodtracer = require('methodtracer').create({ 
        log: function(message, exception) { logger.debug(message, exception); }
    });
    
    function my_method(param1, param2, callback) {
        callback = methodtracer.init('my_method', param1, param2).callback(callback);
        
        // do stuff
        
        callback(null, result);
    }

