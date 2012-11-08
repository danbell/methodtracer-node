var should = require('should'),
methodtracer = require('../lib/index');

function createMockMt() {
  var mt = methodtracer.create({ 
    log: function(message) {
      if (!mt.messages) {
        mt.messages = [];
      }
      mt.messages.push(message);
    } 
  });
  return mt;
}

describe('methodtracer.external', function() {
  describe('#getLastArg', function() {
    it('should return -1 if no args passed', function() {
      var args = [];
      methodtracer.external.getLastArg(false)(args).should.eql(-1);
      args.should.eql([]);
    });
    
    it('should return -1 if last arg is not a function', function() {
      var f = function(){},
      args = [ f, 1, 2, 3 ];
      methodtracer.external.getLastArg(false)(args).should.eql(-1);
      args.should.eql([ f, 1, 2, 3 ]);
    });

    it('should return the index of the last arg when it is a function', function() {
      var cb = function(){}, args = [ 1, 2, 3, cb ];
      methodtracer.external.getLastArg(false)(args).should.eql(3);
      args.should.eql([ 1, 2, 3, cb ]);
    });

    it('should create a new callback if last arg is not a function', function() {
      var args = [ 1, 2, 3 ];
      methodtracer.external.getLastArg(true)(args).should.eql(3);
      args.length.should.eql(4);
      args[3].should.be.an.instanceOf(Function);
      args.slice(0,3).should.eql([ 1, 2, 3 ]);
    });
  });

  describe('#getFirstArg', function() {
    it('should return -1 if no args passed', function() {
      var args = [];
      methodtracer.external.getFirstArg(false)(args).should.eql(-1);
      args.should.eql([]);
    });
    
    it('should return -1 if first arg is not a function', function() {
      var f = function(){},
      args = [ 1, 2, 3, f ];
      methodtracer.external.getFirstArg(false)(args).should.eql(-1);
      args.should.eql([ 1, 2, 3, f ]);
    });

    it('should return the zero when the first arg is a function', function() {
      var cb = function(){}, args = [ cb, 1, 2, 3 ];
      methodtracer.external.getFirstArg(false)(args).should.eql(0);
      args.should.eql([ cb, 1, 2, 3 ]);
    });

    it('should create a new callback when the first arg is not a function', function() {
      var args = [ 1, 2, 3 ];
      methodtracer.external.getFirstArg(true)(args).should.eql(0);
      args.length.should.eql(4);
      args[0].should.be.an.instanceOf(Function);
      args.slice(1,4).should.eql([ 1, 2, 3 ]);
    });
  });

  describe('#wrap', function() {
    describe('with anonymous synchronous function', function() {
      var mt = createMockMt(), result;
      before(function() {
        var f = methodtracer.external.wrap(mt, function(a,b) { return a + b; }, { sync: true });
        result = f(3, 4);
      });
      it('should provide the correct result', function() {
        result.should.eql(7);
      });      
      it('should log a function entry message', function() {
        mt.messages.length.should.eql(2);
        mt.messages[0].should.eql('>>> <anonymous func>(3, 4)');
      });
      it('should log a function exit message', function() {
        mt.messages[1].should.match(/<<< <anonymous func>\(3, 4\): result=\(7\) \([0-9]+ms\)/);
      });
    });

    describe('with named synchronous function', function() {
      var mt = createMockMt(), result;
      before(function() {
        var f;

        function sum(a, b) { return a + b; }
        
        f = methodtracer.external.wrap(mt, sum, { sync: true });
        result = f(3, 4);
      });
      it('should provide the correct result', function() {
        result.should.eql(7);
      });      
      it('should log a function entry message', function() {
        mt.messages.length.should.eql(2);
        mt.messages[0].should.eql('>>> sum(3, 4)');
      });
      it('should log a function exit message', function() {
        mt.messages[1].should.match(/<<< sum\(3, 4\): result=\(7\) \([0-9]+ms\)/);
      });
    });

    describe('with asynchronous function', function() {
      var mt = createMockMt(), result;
      before(function(done) {
        var f = methodtracer.external.wrap(mt, function(a, b, cb) { cb(null, a+b); }, { name: 'asyncsum' });
        f(3, 4, function(error, r) {
          result = r;
          done();
        });
      });
      it('should provide the correct result', function() {
        result.should.eql(7);
      });      
      it('should log a function entry message', function() {
        mt.messages.length.should.eql(2);
        mt.messages[0].should.eql('>>> asyncsum(3, 4, [Function])');
      });
      it('should log a function exit message', function() {
        mt.messages[1].should.match(/<<< asyncsum\(3, 4, \[Function\]\): result=\(7\) \([0-9]+ms\)/);
      });
    });

    describe('with asynchronous function that returns error', function() {
      var mt = createMockMt(), error;
      before(function(done) {
        var f = methodtracer.external.wrap(mt, function(a, b, cb) { cb('there was an error'); });
        f(3, 4, function(e) {
          error = e;
          done();
        });
      });
      it('should return the expected error', function() {
        error.should.eql('there was an error');
      });      
      it('should log a function entry message', function() {
        mt.messages.length.should.eql(2);
        mt.messages[0].should.eql('>>> <anonymous func>(3, 4, [Function])');
      });
      it('should log a function exit message', function() {
        mt.messages[1].should.match(/<<< <anonymous func>\(3, 4, \[Function\]\): error=\("there was an error"\) \([0-9]+ms\)/);
      });
    });
  });
});
