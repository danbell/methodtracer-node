var methodtracer = require('./methodtracer');

var methodtracer_log4js = module.exports;

methodtracer_log4js.createLog4js = function(logger, level) {
  var levelMethodName = level.toString().toLowerCase();
  var config = {
    log: function(message, exception) {
      if (exception) {
        logger[levelMethodName](message, exception);
      } else {
        logger[levelMethodName](message);
      }
    },
    isLogEnabledFn: function() {
      return logger.isLevelEnabled(level);
    }
  };
  return methodtracer.create(config);
};