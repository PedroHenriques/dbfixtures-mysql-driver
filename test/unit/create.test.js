'use strict';
const proxyquire = require('proxyquire');
const assert = require('chai').assert;
const sinon = require('sinon');
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
    doubles = {};
    doubles.mysqlStub = sandbox.stub(mysql);
    doubles.connectionStub = {};
    doubles.dbPromisesStub = sandbox.stub(dbPromises);
    doubles.truncateStub = sandbox.stub(truncate);
    doubles.insertFixturesStub = sandbox.stub(insertFixtures);
    doubles.closeStub = sandbox.stub(close);
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

  describe('create()', function () {
    it('should create a connection to the MySql server and return a Promise that resolves to an object with truncate(), insertFixtures() and close()', function () {
      doubles.mysqlStub.createConnection.returns(doubles.connectionStub);
      doubles.dbPromisesStub.connect.returns(Promise.resolve());
      doubles.truncateStub.truncate.withArgs(doubles.connectionStub).returns('truncate ready function.');
      doubles.insertFixturesStub.insertFixtures.withArgs(doubles.connectionStub).returns('insertFixtures ready function.');
      doubles.closeStub.close.withArgs(doubles.connectionStub).returns('close ready function.');

      const options = {
        host: 'localhost',
        user: 'root',
        password: 'password',
        database: 'db_name',
      };
      const create = proxyCreate.create(options);

      assert.typeOf(create, 'Promise');
      return(
        create.then((returnValue) => {
          assert.deepEqual(returnValue, {
            truncate: 'truncate ready function.',
            insertFixtures: 'insertFixtures ready function.',
            close: 'close ready function.',
          });
          assert.isTrue(doubles.mysqlStub.createConnection.calledOnce);
          assert.deepEqual(doubles.mysqlStub.createConnection.args[0], [options]);
          assert.isTrue(doubles.dbPromisesStub.connect.calledOnce);
          assert.deepEqual(doubles.dbPromisesStub.connect.args[0], [doubles.connectionStub]);
          assert.isTrue(doubles.truncateStub.truncate.calledOnce);
          assert.isTrue(doubles.insertFixturesStub.insertFixtures.calledOnce);
          assert.isTrue(doubles.closeStub.close.calledOnce);
        }, () => {
          assert.fail();
        })
      );
    });

    describe('if the connection to the DB fails to be established', function () {
      it('should return a Promise that rejects with the Error thrown by the failed connection attempt', function () {
        doubles.mysqlStub.createConnection.returns(doubles.connectionStub);
        doubles.dbPromisesStub.connect.returns(Promise.reject('dbPromises.connect() error msg.'));
        
        const options = {
          host: 'localhost',
          user: 'root',
          password: 'password',
          database: 'db_name',
        };
        const create = proxyCreate.create(options);
  
        assert.typeOf(create, 'Promise');
        return(
          create.then(() => {
            assert.fail();
          }, (reason) => {
            assert.strictEqual(reason, 'dbPromises.connect() error msg.');
            assert.isTrue(doubles.mysqlStub.createConnection.calledOnce);
            assert.deepEqual(doubles.mysqlStub.createConnection.args[0], [options]);
            assert.isTrue(doubles.dbPromisesStub.connect.calledOnce);
            assert.deepEqual(doubles.dbPromisesStub.connect.args[0], [doubles.connectionStub]);
            assert.isTrue(doubles.truncateStub.truncate.notCalled);
            assert.isTrue(doubles.insertFixturesStub.insertFixtures.notCalled);
            assert.isTrue(doubles.closeStub.close.notCalled);
          })
        );
      });
    });
  });
});