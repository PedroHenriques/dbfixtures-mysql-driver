'use strict';
const chai = require('chai');
const assert = chai.assert;
const sinon = require('sinon');

describe('dbPromises', function () {
  const sandbox = sinon.createSandbox();
  let doubles;
  let dbPromises;

  beforeEach(function () {
    doubles = {
      connectionObj: {
        connect: sandbox.stub(),
        end: sandbox.stub(),
        query: sandbox.stub(),
      },
    };
    dbPromises = require('../../lib/dbPromises');
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe('connect()', function () {
    it('should call the "connect" property of the object provided to this function once', function () {
      const sutResult = dbPromises.connect(doubles.connectionObj);
      doubles.connectionObj.connect.args[0][0]();
      return(
        sutResult
        .then(function () {
          assert.isTrue(doubles.connectionObj.connect.calledOnce);
        })
      );
    });

    it('should call the "connect" property of the object provided to this function with 1 argument', function () {
      const sutResult = dbPromises.connect(doubles.connectionObj);
      doubles.connectionObj.connect.args[0][0]();
      return(
        sutResult
        .then(function () {
          assert.strictEqual(doubles.connectionObj.connect.args[0].length, 1);
        })
      );
    });

    it('should call the "connect" property of the object provided to this function with a callback function', function () {
      const sutResult = dbPromises.connect(doubles.connectionObj);
      doubles.connectionObj.connect.args[0][0]();
      return(
        sutResult
        .then(function () {
          assert.typeOf(doubles.connectionObj.connect.args[0][0], 'function');
        })
      );
    });

    describe('if the callback function provided as 1st argument is called with no arguments', function () {
      it('should return a promise that resolves with void', function () {
        const sutResult = dbPromises.connect(doubles.connectionObj);
        doubles.connectionObj.connect.args[0][0]();
        return(
          sutResult
          .then(function (result) {
            assert.isUndefined(result);
          })
        );
      });
    });

    describe('if the callback function provided as 1st argument is called with "null" as the 1st argument', function () {
      it('should return a promise that resolves with void', function () {
        const sutResult = dbPromises.connect(doubles.connectionObj);
        doubles.connectionObj.connect.args[0][0](null);
        return(
          sutResult
          .then(function (result) {
            assert.isUndefined(result);
          })
        );
      });
    });

    describe('if the callback function provided as 1st argument is called with an Error object as the 1st argument', function () {
      it('should return a promise that rejects with that Error object', function () {
        const sutResult = dbPromises.connect(doubles.connectionObj);
        const testError = new Error('connect() test error message');
        doubles.connectionObj.connect.args[0][0](testError);
        return(
          sutResult
          .then(function () {
            assert.fail();
          })
          .catch(function (error) {
            assert.strictEqual(error, testError);
          })
        );
      });
    });
  });

  describe('end()', function () {
    it('should call the "end" property of the object provided to this function once', function () {
      const sutResult = dbPromises.end(doubles.connectionObj);
      doubles.connectionObj.end.args[0][0]();
      return(
        sutResult
        .then(function () {
          assert.isTrue(doubles.connectionObj.end.calledOnce);
        })
      );
    });

    it('should call the "end" property of the object provided to this function with 1 argument', function () {
      const sutResult = dbPromises.end(doubles.connectionObj);
      doubles.connectionObj.end.args[0][0]();
      return(
        sutResult
        .then(function () {
          assert.strictEqual(doubles.connectionObj.end.args[0].length, 1);
        })
      );
    });

    it('should call the "end" property of the object provided to this function with a callback function', function () {
      const sutResult = dbPromises.end(doubles.connectionObj);
      doubles.connectionObj.end.args[0][0]();
      return(
        sutResult
        .then(function () {
          assert.typeOf(doubles.connectionObj.end.args[0][0], 'function');
        })
      );
    });

    describe('if the callback function is called with undefined', function () {
      it('it should return a promise that resolves with void', function () {
        const sutResult = dbPromises.end(doubles.connectionObj);
        doubles.connectionObj.end.args[0][0]();
        return(
          sutResult
          .then(function (result) {
            assert.isUndefined(result);
          })
        );
      });
    });
    
    describe('if the callback function is called with "null" as the 1st argument', function () {
      it('it should return a promise that resolves with void', function () {
        const sutResult = dbPromises.end(doubles.connectionObj);
        doubles.connectionObj.end.args[0][0](null);
        return(
          sutResult
          .then(function (result) {
            assert.isUndefined(result);
          })
        );
      });
    });

    describe('if the callback function is called with an error object as the 1st argument', function () {
      it('it should return a promise that rejects with that error object', function () {
        const sutResult = dbPromises.end(doubles.connectionObj);
        const testError = new Error('end() test error message');
        doubles.connectionObj.end.args[0][0](testError);
        return(
          sutResult
          .then(function () {
            assert.fail();
          })
          .catch(function (error) {
            assert.strictEqual(error, testError);
          })
        );
      });
    });
  });

  describe('queryFn()', function () {
    it('should return a function', function () {
      assert.typeOf(dbPromises.queryFn(), 'function');
    });

    describe('returned function', function () {
      let returnedFunction;
      beforeEach(function () {
        returnedFunction = dbPromises.queryFn(doubles.connectionObj);
      });

      it('should call the "query" property of the object provided to the queryFn() function once', function () {
        const returnedFunctionResult = returnedFunction();
        doubles.connectionObj.query.args[0][2]();
        return(
          returnedFunctionResult
          .then(function () {
            assert.isTrue(doubles.connectionObj.query.calledOnce);
          })
        );
      });

      it('should call the "query" property of the object provided to the queryFn() function with 3 arguments', function () {
        const returnedFunctionResult = returnedFunction();
        doubles.connectionObj.query.args[0][2]();
        return(
          returnedFunctionResult
          .then(function () {
            assert.strictEqual(doubles.connectionObj.query.args[0].length, 3);
          })
        );
      });

      describe('1st argument of the call to the "query" property of the object provided to the queryFn() function', function () {
        it('should be the object provided as 1st argument to this function', function () {
          const options = {};
          const returnedFunctionResult = returnedFunction(options);
          doubles.connectionObj.query.args[0][2]();
          return(
            returnedFunctionResult
            .then(function () {
              assert.strictEqual(doubles.connectionObj.query.args[0][0], options);
            })
          );
        });
      });

      describe('2nd argument of the call to the "query" property of the object provided to the queryFn() function', function () {
        it('should be the object provided as 2nd argument to this function', function () {
          const values = [];
          const returnedFunctionResult = returnedFunction({}, values);
          doubles.connectionObj.query.args[0][2]();
          return(
            returnedFunctionResult
            .then(function () {
              assert.strictEqual(doubles.connectionObj.query.args[0][1], values);
            })
          );
        });
      });

      describe('3rd argument of the call to the "query" property of the object provided to the queryFn() function', function () {
        it('should be a function', function () {
          const returnedFunctionResult = returnedFunction();
          doubles.connectionObj.query.args[0][2]();
          return(
            returnedFunctionResult
            .then(function () {
              assert.typeOf(doubles.connectionObj.query.args[0][2], 'function');
            })
          );
        });

        describe('if the callback function is called with no arguments', function () {
          it('should return a promise that resolves with void', function () {
            const returnedFunctionResult = returnedFunction();
            doubles.connectionObj.query.args[0][2]();
            return(
              returnedFunctionResult
              .then(function (result) {
                assert.isUndefined(result);
              })
            );
          });
        });

        describe('if the callback function is called with "null" as the 1st argument', function () {
          it('should return a promise that resolves with void', function () {
            const returnedFunctionResult = returnedFunction();
            doubles.connectionObj.query.args[0][2](null);
            return(
              returnedFunctionResult
              .then(function (result) {
                assert.isUndefined(result);
              })
            );
          });
        });

        describe('if the callback function is called with an Error object as the 1st argument', function () {
          it('should return a promise that rejects with that error object', function () {
            const returnedFunctionResult = returnedFunction();
            const testError = new Error('query() test error message');
            doubles.connectionObj.query.args[0][2](testError);
            return(
              returnedFunctionResult
              .then(function () {
                assert.fail();
              })
              .catch(function (error) {
                assert.strictEqual(error, testError);
              })
            );
          });
        });
      });
    });
  })
});