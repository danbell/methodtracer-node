var methodtracer = module.exports,
mt_core = require('./methodtracer'),
mt_log4js = require('./log4js'),
mt_external = require('./external');

methodtracer.getParamString1 = mt_core.getParamString1;
methodtracer.getParamString = mt_core.getParamString;

methodtracer.create = mt_core.create;
methodtracer.createLog4js = mt_log4js.createLog4js;
methodtracer.external = mt_external;
