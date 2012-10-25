var should = require('should'),
methodtracer = require('../lib/methodtracer');

describe('methodtracer', function() {
  describe('#create', function() {

    it('should raise an exception if not passed a config object', function() {
      (function() {
        methodtracer.create();
      }).should.throwError(/invalid configuration specified/);
    });

    it('should raise an exception if no log method included in the config object', function() {
      (function() {
        methodtracer.create({});
      }).should.throwError(/invalid configuration specified/);
    });

  });

  describe('#create when env.NODE_METHOD_TRACER_DISABLED is set', function() {
    var logged = 0, mt;

    before(function() {
      process.env.NODE_METHOD_TRACER_DISABLED = 1;
      mt = methodtracer.create({ log: function() { logged += 1; } });
    });
    
    it('should not log anything', function(done) {
      (function() {
        var cb = mt.init('testfunction').callback(function(e) {
          logged.should.equal(0);
          done(e);
        });
        process.nextTick(cb);
      })();
    });
    
    after(function() {
      delete process.env.NODE_METHOD_TRACER_DISABLED;
    });
  });

  describe('success exit', function() {

  });

});
