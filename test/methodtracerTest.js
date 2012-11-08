var should = require('should'),
methodtracer = require('../lib/index');

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

  describe('no logging when logging is not enabled', function() {
    var messages = [], mt;

    before(function(done) {
      mt = methodtracer.create({ log: function(message) { messages.push(message); }, isLogEnabledFn: function() { return false; } });
      (function() {
        var cb = mt.init('f1').callback(done);
        process.nextTick(function() { cb(null, 'the result'); });
      })();
    });

    it('should not log anything', function() {
      messages.length.should.eql(0);
    });
  });

  describe('alternative message generation methods', function() {
    var messages = [], mt;

    before(function(done) {
      mt = methodtracer.create( { log: function(message) { messages.push(message); },
                                  getInMessage: function(mt) { return 'IN: ' + mt.methodcall; },
                                  getOutOkMessage: function(mt, args) { return 'OUT: ' + mt.methodcall; } });
      (function() {
        var cb = mt.init('f1').callback(done);
        process.nextTick(cb);
      })();
    });

    it('should log two messages', function() {
      messages.length.should.eql(2);
    });

    it('should log the custom "in" message', function() {
      messages[0].should.eql('IN: f1()');
    });

    it('should log the custom "out" message', function() {
      messages[1].should.eql('OUT: f1()');
    });
  });

  describe('synchronous operation', function() {
    var messages = [], mt = methodtracer.create({ log: function(m) { messages.push(m); } });

    function theTestFunction(param1) {
      var mt_ = mt.init('theTestFunction', param1);
      // do stuff
      return mt_.result('the result');
    }

    it('should return the result', function() {
      var result = theTestFunction('the parameter');
      result.should.eql('the result');
    });

    it('should log two messages', function() {
      messages.length.should.eql(2);
    });

    it('should log the entry message', function() {
      messages[0].should.eql('>>> theTestFunction("the parameter")');
    });

    it('should log the exit message', function() {
      messages[1].should.match(/<<< theTestFunction\("the parameter"\): result=\("the result"\) \([0-9]+ms\)/);
    });
  });    

});
