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
    var messages = [], mt;

    before(function(done) {
      process.env.NODE_METHOD_TRACER_DISABLED = 1;
      mt = methodtracer.create({ log: function(message) { messages.push(message); } });
      (function() {
        var cb = mt.init('f1').callback(done);
        process.nextTick(cb);
      })();
      delete process.env.NODE_METHOD_TRACER_DISABLED;
    });
    
    it('should not log anything', function() {
      messages.length.should.eql(0);
    });
  });

  describe('success exit', function() {
    var messages = [], mt;

    before(function(done) {
      mt = methodtracer.create({ log: function(message) { messages.push(message); } });
      (function() {
        var cb = mt.init('f1').callback(done);
        setTimeout(function() { cb(null, 'the result') }, 100);
      })();
    });

    it('should log 2 messages', function() {
      messages.length.should.eql(2);
    });

    it('should log an entry message', function() {
      messages[0].should.eql('>>> f1()');
    });

    it('should log an exit message', function() {
      messages[1].should.match(/<<< f1\(\): result=\("the result"\) \([0-9]+ms\)/);
    });
  });

  describe('error exit', function() {
    var messages = [], mt;

    before(function(done) {
      mt = methodtracer.create({ log: function(message) { messages.push(message); } });
      (function() {
        var cb = mt.init('f1').callback(function() { done(null); });
        setTimeout(function() { cb(new Error('the error')) }, 100);
      })();
    });

    it('should log 2 messages', function() {
      messages.length.should.eql(2);
    });

    it('should log an entry message', function() {
      messages[0].should.eql('>>> f1()');
    });

    it('should log an exit message', function() {
      messages[1].should.match(/<<< f1\(\): error=\(Error: the error\) \([0-9]+ms\)/);
    });
  });


});
