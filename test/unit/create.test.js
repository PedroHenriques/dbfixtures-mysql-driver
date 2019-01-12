'use strict';
const chai = require('chai');
const assert = chai.assert;
const sinon = require('sinon');
const proxyquire = require('proxyquire');

const mysql = require('mysql');
const dbPromises = require('../../lib/dbPromises.js');
const truncate = require('../../lib/truncate.js');
const insertFixtures = require('../../lib/insertFixtures.js');
const close = require('../../lib/close.js');

describe('create', function () {
  const sandbox = sinon.createSandbox();
  let doubles;
  let proxyCreate;

  beforeEach(function () {
    doubles = {
      mysqlStub: sandbox.stub(mysql),
      dbPromisesStub: sandbox.stub(dbPromises),
      truncateStub: sandbox.stub(truncate),
      insertFixturesStub: sandbox.stub(insertFixtures),
      closeStub: sandbox.stub(close),
    };
    proxyCreate = proxyquire('../../lib/create.js', {
      'mysql': doubles.mysqlStub,
      './dbPromises': doubles.dbPromisesStub,
      './truncate': doubles.truncateStub,
      './insertFixtures': doubles.insertFixturesStub,
      './close': doubles.closeStub,
    });
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe('default export', function () {
    beforeEach(function () {
      doubles.dbPromisesStub.connect.returns(Promise.resolve());
    });

    it('should be a function', function () {
      assert.typeOf(proxyCreate.default, 'function');
    });

    it('should call the createConnection() function, of the "mysql" module, once', function () {
      return(
        proxyCreate.default()
        .then(function () {
          assert.isTrue(doubles.mysqlStub.createConnection.calledOnce);
        })
      );
    });
    
    it('should call the createConnection() function, of the "mysql" module, with 1 argument', function () {
      return(
        proxyCreate.default()
        .then(function () {
          assert.strictEqual(doubles.mysqlStub.createConnection.args[0].length, 1);
        })
      );
    });
    
    it('should call the createConnection() function, of the "mysql" module, with the argument provided to this function', function () {
      const connectionConfig = {};
      return(
        proxyCreate.default(connectionConfig)
        .then(function () {
          assert.strictEqual(doubles.mysqlStub.createConnection.args[0][0], connectionConfig);
        })
      );
    });
    
    it('should call the connect() function, of the "dbPromises" module, once', function () {
      return(
        proxyCreate.default()
        .then(function () {
          assert.isTrue(doubles.dbPromisesStub.connect.calledOnce);
        })
      );
    });
    
    it('should call the connect() function, of the "dbPromises" module, with 1 argument', function () {
      return(
        proxyCreate.default()
        .then(function () {
          assert.strictEqual(doubles.dbPromisesStub.connect.args[0].length, 1);
        })
      );
    });
    
    it('should call the connect() function, of the "dbPromises" module, with the return value from the call to "mysql" module\'s createConnection()', function () {
      const connectionObj = {};
      doubles.mysqlStub.createConnection.returns(connectionObj);
      return(
        proxyCreate.default()
        .then(function () {
          assert.strictEqual(doubles.dbPromisesStub.connect.args[0][0], connectionObj);
        })
      );
    });

    it('should call the default export of the "truncate" module once', function () {
      return(
        proxyCreate.default()
        .then(function () {
          assert.isTrue(doubles.truncateStub.default.calledOnce);
        })
      );
    });

    it('should call the default export of the "truncate" module with 1 argument', function () {
      return(
        proxyCreate.default()
        .then(function () {
          assert.strictEqual(doubles.truncateStub.default.args[0].length, 1);
        })
      );
    });

    it('should call the default export of the "truncate" module with the return value from the call to "mysql" module\'s createConnection()', function () {
      const connectionObj = {};
      doubles.mysqlStub.createConnection.returns(connectionObj);
      return(
        proxyCreate.default()
        .then(function () {
          assert.strictEqual(doubles.truncateStub.default.args[0][0], connectionObj);
        })
      );
    });

    it('should call the default export of the "insertFixtures" module once', function () {
      return(
        proxyCreate.default()
        .then(function () {
          assert.isTrue(doubles.insertFixturesStub.default.calledOnce);
        })
      );
    });

    it('should call the default export of the "insertFixtures" module with 1 argument', function () {
      return(
        proxyCreate.default()
        .then(function () {
          assert.strictEqual(doubles.insertFixturesStub.default.args[0].length, 1);
        })
      );
    });

    it('should call the default export of the "insertFixtures" module with the return value from the call to "mysql" module\'s createConnection()', function () {
      const connectionObj = {};
      doubles.mysqlStub.createConnection.returns(connectionObj);
      return(
        proxyCreate.default()
        .then(function () {
          assert.strictEqual(doubles.insertFixturesStub.default.args[0][0], connectionObj);
        })
      );
    });

    it('should call the default export of the "close" module once', function () {
      return(
        proxyCreate.default()
        .then(function () {
          assert.isTrue(doubles.closeStub.default.calledOnce);
        })
      );
    });

    it('should call the default export of the "close" module with 1 argument', function () {
      return(
        proxyCreate.default()
        .then(function () {
          assert.strictEqual(doubles.closeStub.default.args[0].length, 1);
        })
      );
    });

    it('should call the default export of the "close" module with the return value from the call to "mysql" module\'s createConnection()', function () {
      const connectionObj = {};
      doubles.mysqlStub.createConnection.returns(connectionObj);
      return(
        proxyCreate.default()
        .then(function () {
          assert.strictEqual(doubles.closeStub.default.args[0][0], connectionObj);
        })
      );
    });
    
    it('should return an object with the IDriver properties', function () {
      return(
        proxyCreate.default()
        .then(function (result) {
          assert.deepEqual(Object.getOwnPropertyNames(result), [ 'truncate', 'insertFixtures', 'close' ]);
        })
      );
    });

    describe('returned object\'s "truncate" property', function () {
      it('should have the returned value from the call to the default export of the "truncate" module', function () {
        const truncateObj = {};
        doubles.truncateStub.default.returns(truncateObj);
        return(
          proxyCreate.default()
          .then(function (result) {
            assert.strictEqual(result.truncate, truncateObj);
          })
        );
      });
    });

    describe('returned object\'s "insertFixtures" property', function () {
      it('should have the returned value from the call to the default export of the "insertFixtures" module', function () {
        const insertFixturesObj = {};
        doubles.insertFixturesStub.default.returns(insertFixturesObj);
        return(
          proxyCreate.default()
          .then(function (result) {
            assert.strictEqual(result.insertFixtures, insertFixturesObj);
          })
        );
      });
    });

    describe('returned object\'s "close" property', function () {
      it('should have the returned value from the call to the default export of the "close" module', function () {
        const closeObj = {};
        doubles.closeStub.default.returns(closeObj);
        return(
          proxyCreate.default()
          .then(function (result) {
            assert.strictEqual(result.close, closeObj);
          })
        );
      });
    });

    describe('if the call to connect() of the "dbPromises" module returns a promise that rejects', function () {
      it('should return a promise that rejects with that Error object', function () {
        const testError = new Error('connect() test error message');
        doubles.dbPromisesStub.connect.returns(Promise.reject(testError));
        return(
          proxyCreate.default()
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