'use strict';
const proxyquire = require('proxyquire');
const assert = require('chai').assert;
const sinon = require('sinon');
const dbPromises = require('../../lib/dbPromises.js');

describe('truncate', function () {
  const sandbox = sinon.createSandbox();
  let doubles;
  let proxyTruncate;

  beforeEach(function () {
    doubles = {};
    doubles.dbPromisesStub = sandbox.stub(dbPromises);
    doubles.queryStub = sandbox.stub();
    doubles.connectionStub = {};
    proxyTruncate = proxyquire('../../lib/truncate.js', {
      './dbPromises': doubles.dbPromisesStub,
    });
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe('truncate()', function () {
    it('should return a function that receives a string[] of table names, runs a truncate query for each one of them and returns a Promise that resolves with void', function () {
      const truncateFn = proxyTruncate.truncate(doubles.connectionStub);
      assert.typeOf(truncateFn, 'function');

      doubles.dbPromisesStub.queryFn.returns(doubles.queryStub);
      doubles.queryStub.returns(Promise.resolve());

      const truncate = truncateFn(['table1', 'table2']);
      assert.typeOf(truncate, 'Promise');
      return(
        truncate.then((data) => {
          assert.isUndefined(data);
          assert.isTrue(doubles.dbPromisesStub.queryFn.calledOnce);
          assert.deepEqual(doubles.dbPromisesStub.queryFn.args[0], [doubles.connectionStub]);
          assert.strictEqual(doubles.queryStub.callCount, 4);
          assert.deepEqual(
            doubles.queryStub.args,
            [
              ['set foreign_key_checks=?', [0]],
              ['TRUNCATE TABLE ??', ['table1']],
              ['TRUNCATE TABLE ??', ['table2']],
              ['set foreign_key_checks=?', [1]],
            ]
          );
        }, () => {
          assert.fail();
        })
      );
    });

    describe('if running a query fails', function () {
      it('should return a Promise that rejects with the failed query\'s error message', function () {
        const truncateFn = proxyTruncate.truncate(doubles.connectionStub);
        assert.typeOf(truncateFn, 'function');

        doubles.dbPromisesStub.queryFn.returns(doubles.queryStub);
        doubles.queryStub.onCall(1).returns(Promise.reject('query() #1 error message.'));
        doubles.queryStub.returns(Promise.resolve());
  
        const truncate = truncateFn(['table1', 'table2']);
        assert.typeOf(truncate, 'Promise');
        return(
          truncate.then(() => {
            assert.fail();
          }, (reason) => {
            assert.strictEqual(reason, 'query() #1 error message.');
            assert.isTrue(doubles.dbPromisesStub.queryFn.calledOnce);
            assert.deepEqual(doubles.dbPromisesStub.queryFn.args[0], [doubles.connectionStub]);
            assert.strictEqual(doubles.queryStub.callCount, 4);
            assert.deepEqual(
              doubles.queryStub.args,
              [
                ['set foreign_key_checks=?', [0]],
                ['TRUNCATE TABLE ??', ['table1']],
                ['TRUNCATE TABLE ??', ['table2']],
                ['set foreign_key_checks=?', [1]],
              ]
            );
          })
        );
      });
    });

    describe('if disabling the foreign key checks fails', function () {
      it('should not run any truncate queries and return a Promise that rejects with the failed query\'s error message', function () {
        const truncateFn = proxyTruncate.truncate(doubles.connectionStub);
        assert.typeOf(truncateFn, 'function');

        doubles.dbPromisesStub.queryFn.returns(doubles.queryStub);
        doubles.queryStub.withArgs('set foreign_key_checks=?', [0]).returns(Promise.reject('query() disable FK checks error message.'));
        doubles.queryStub.returns(Promise.resolve());
  
        const truncate = truncateFn(['table1', 'table2']);
        assert.typeOf(truncate, 'Promise');
        return(
          truncate.then(() => {
            assert.fail();
          }, (reason) => {
            assert.strictEqual(reason, 'query() disable FK checks error message.');
            assert.isTrue(doubles.dbPromisesStub.queryFn.calledOnce);
            assert.deepEqual(doubles.dbPromisesStub.queryFn.args[0], [doubles.connectionStub]);
            assert.strictEqual(doubles.queryStub.callCount, 1);
            assert.deepEqual(doubles.queryStub.args[0],['set foreign_key_checks=?', [0]]);
          })
        );
      });
    });
  });
});