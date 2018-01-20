'use strict';
const proxyquire = require('proxyquire');
const assert = require('chai').assert;
const sinon = require('sinon');
const dbPromises = require('../../lib/dbPromises.js');

describe('close', function () {
  const sandbox = sinon.createSandbox();
  let doubles;
  let proxyClose;

  beforeEach(function () {
    doubles = {};
    doubles.connectionStub = {};
    doubles.dbPromisesStub = sandbox.stub(dbPromises);
    proxyClose = proxyquire('../../lib/close.js', {
      './dbPromises': doubles.dbPromisesStub,
    });
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe('close()', function () {
    it('should call end() on the connection and return a Promise that resolves with void', function () {
      const closeFn = proxyClose.close(doubles.connectionStub);
      assert.typeOf(closeFn, 'function');

      doubles.dbPromisesStub.end.returns(Promise.resolve());

      const close = closeFn();
      assert.typeOf(close, 'Promise');
      return(
        close.then((data) => {
          assert.isUndefined(data);
          assert.isTrue(doubles.dbPromisesStub.end.calledOnce);
          assert.deepEqual(doubles.dbPromisesStub.end.args[0], [doubles.connectionStub]);
        }, () => {
          assert.fail();
        })
      );
    });

    describe('if the connection fails to gracefuly close', function () {
      it('should return a Promise that rejects with the failed connection closing attempt error message', function () {
        const closeFn = proxyClose.close(doubles.connectionStub);
        assert.typeOf(closeFn, 'function');

        doubles.dbPromisesStub.end.returns(Promise.reject('dbPromises.end() error message.'));
  
        const close = closeFn();
        assert.typeOf(close, 'Promise');
        return(
          close.then(() => {
            assert.fail();
          }, (reason) => {
            assert.strictEqual(reason, 'dbPromises.end() error message.');
            assert.isTrue(doubles.dbPromisesStub.end.calledOnce);
            assert.deepEqual(doubles.dbPromisesStub.end.args[0], [doubles.connectionStub]);
          })
        );
      });
    });
  });
});