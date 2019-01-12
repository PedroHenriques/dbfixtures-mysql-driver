'use strict';
const chai = require('chai');
const assert = chai.assert;
const sinon = require('sinon');
const proxyquire = require('proxyquire');

const dbPromises = require('../../lib/dbPromises');

describe('close', function () {
  const sandbox = sinon.createSandbox();
  let doubles;
  let proxyClose;

  beforeEach(function () {
    doubles = {
      dbPromisesStub: sandbox.stub(dbPromises),
    };
    proxyClose = proxyquire('../../lib/close', {
      './dbPromises': doubles.dbPromisesStub,
    });
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe('close()', function () {
    describe('default export', function () {
      it('should be a function', function () {
        assert.typeOf(proxyClose.default, 'function');
      });

      it('should return a function', function () {
        assert.typeOf(proxyClose.default(), 'function');
      });

      describe('returned function', function () {
        let returnedFunction;

        beforeEach(function () {
          doubles.dbPromisesStub.end.returns(Promise.resolve());

          returnedFunction = proxyClose.default();
        });

        it('should call the end() function of the "dbPromises" module once', function () {
          return(
            returnedFunction()
            .then(function () {
              assert.isTrue(doubles.dbPromisesStub.end.calledOnce);
            })
          );
        });

        it('should call the end() function of the "dbPromises" module with 1 argument', function () {
          return(
            returnedFunction()
            .then(function () {
              assert.strictEqual(doubles.dbPromisesStub.end.args[0].length, 1);
            })
          );
        });

        it('should call the end() function of the "dbPromises" module with the argument provided to the default export', function () {
          const connectionObj = {};
          return(
            proxyClose.default(connectionObj)()
            .then(function () {
              assert.strictEqual(doubles.dbPromisesStub.end.args[0][0], connectionObj);
            })
          );
        });

        it('should return a promise that resolves with void', function () {
          return(
            returnedFunction()
            .then(function (result) {
              assert.isUndefined(result);
            })
          );
        });

        describe('if the call to end() of the "dbPromises" module returns a promise that rejects', function () {
          it('should return a promise that rejects with that Error object', function () {
            const testError = new Error('end() test error message');
            doubles.dbPromisesStub.end.returns(Promise.reject(testError));
            return(
              returnedFunction()
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
  });
});