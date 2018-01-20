'use strict';
const proxyquire = require('proxyquire');
const assert = require('chai').assert;
const sinon = require('sinon');
const mysql = require('mysql');

describe('dbPromises', function () {
  const sandbox = sinon.createSandbox();
  let doubles;
  let proxyDbPromises;

  beforeEach(function () {
    doubles = {};
    doubles.mysqlStub = sandbox.stub(mysql);
    doubles.connectionStub = {
      connect: sandbox.stub(),
      end: sandbox.stub(),
      query: sandbox.stub(),
    };
    proxyDbPromises = proxyquire('../../lib/dbPromises.js', {
      'mysql': doubles.mysqlStub,
    });
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe('connect()', function () {
    it('should connect to the DB with the provided connection object and return a Promise that resolves with void', function () {
      const connect = proxyDbPromises.connect(doubles.connectionStub);
      assert.typeOf(connect, 'Promise');
      assert.isTrue(doubles.connectionStub.connect.calledOnce);
      doubles.connectionStub.connect.args[0][0]();
      return(
        connect.then((data) => {
          assert.isUndefined(data);
        }, () => {
          assert.fail();
        })
      );
    });

    describe('if the connection attempt fails', function () {
      it('should return a Promise that rejects with the failed attempt\'s error stack', function () {
        const connect = proxyDbPromises.connect(doubles.connectionStub);
        assert.typeOf(connect, 'Promise');
        assert.isTrue(doubles.connectionStub.connect.calledOnce);
        doubles.connectionStub.connect.args[0][0]({ stack: 'error stack string.' });
        return(
          connect.then(() => {
            assert.fail();
          }, (reason) => {
            assert.strictEqual(reason, 'error stack string.');
          })
        );
      });
    });
  });

  describe('end()', function () {
    it('should terminate the provided connection to the DB and return a Promise that resolves with void', function () {
      const end = proxyDbPromises.end(doubles.connectionStub);
      assert.typeOf(end, 'Promise');
      assert.isTrue(doubles.connectionStub.end.calledOnce);
      doubles.connectionStub.end.args[0][0]();
      return(
        end.then((data) => {
          assert.isUndefined(data);
        }, () => {
          assert.fail();
        })
      );
    });

    describe('if the attempt to terminate the connection fails', function () {
      it('should return a Promise that rejects with failed attempt\'s error stack', function () {
        const end = proxyDbPromises.end(doubles.connectionStub);
        assert.typeOf(end, 'Promise');
        assert.isTrue(doubles.connectionStub.end.calledOnce);
        doubles.connectionStub.end.args[0][0]({ stack: 'error stack string.' });
        return(
          end.then(() => {
            assert.fail();
          }, (reason) => {
            assert.strictEqual(reason, 'error stack string.');
          })
        );
      });
    });
  });

  describe('queryFn()', function () {
    it('should run the query and return a Promise that resolves with void', function () {
      const queryFn = proxyDbPromises.queryFn(doubles.connectionStub);
      assert.typeOf(queryFn, 'function');

      const query = queryFn('SQL query string', ['value 1', 'value 2']);
      assert.isTrue(doubles.connectionStub.query.calledOnce);
      doubles.connectionStub.query.args[0][2](null);
      return(
        query.then((data) => {
          assert.isUndefined(data);
          assert.deepEqual(doubles.connectionStub.query.args[0][0], 'SQL query string');
          assert.deepEqual(doubles.connectionStub.query.args[0][1], ['value 1', 'value 2']);
        }, () => {
          assert.fail();
        })
      );
    });

    describe('if the query fails', function () {
      it('should return a Promise that rejects with failed query\'s error stack', function () {
        const queryFn = proxyDbPromises.queryFn(doubles.connectionStub);
        assert.typeOf(queryFn, 'function');
  
        const query = queryFn('SQL query string', ['value 1', 'value 2']);
        assert.isTrue(doubles.connectionStub.query.calledOnce);
        doubles.connectionStub.query.args[0][2]({ stack: 'error stack.' });
        return(
          query.then(() => {
            assert.fail();
          }, (reason) => {
            assert.strictEqual(reason, 'error stack.');
            assert.deepEqual(doubles.connectionStub.query.args[0][0], 'SQL query string');
            assert.deepEqual(doubles.connectionStub.query.args[0][1], ['value 1', 'value 2']);
          })
        );
      });
    });
  });
});