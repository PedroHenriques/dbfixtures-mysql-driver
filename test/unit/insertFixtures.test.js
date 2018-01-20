'use strict';
const proxyquire = require('proxyquire');
const assert = require('chai').assert;
const sinon = require('sinon');
const dbPromises = require('../../lib/dbPromises.js');

describe('insertFixtures', function () {
  const sandbox = sinon.createSandbox();
  let doubles;
  let proxyInsertFixtures;

  beforeEach(function () {
    doubles = {};
    doubles.dbPromisesStub = sandbox.stub(dbPromises);
    doubles.queryStub = sandbox.stub();
    doubles.connectionStub = {};
    proxyInsertFixtures = proxyquire('../../lib/insertFixtures.js', {
      './dbPromises': doubles.dbPromisesStub,
    });
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe('insertFixtures()', function () {
    it('should return a function that receives a table name and fixtures, inserts all the fixtures and returns a Promise that resolves to void', function () {
      const insertFixturesFn = proxyInsertFixtures.insertFixtures(doubles.connectionStub);
      assert.typeOf(insertFixturesFn, 'function');

      doubles.dbPromisesStub.queryFn.returns(doubles.queryStub);
      doubles.queryStub.returns(Promise.resolve());

      const fixtures = [
        { col1: 'value1', col2: 'value2' },
        { col1: 'value3', col3: 'value4' },
        { col1: 'value5', col2: 'value6' },
      ];
      const insertFixtures = insertFixturesFn('tableName', fixtures);

      assert.typeOf(insertFixtures, 'Promise');
      return(
        insertFixtures.then((data) => {
          assert.isUndefined(data);
          assert.isTrue(doubles.dbPromisesStub.queryFn.calledOnce);
          assert.deepEqual(doubles.dbPromisesStub.queryFn.args[0], [doubles.connectionStub]);
          assert.strictEqual(doubles.queryStub.callCount, 3);
          assert.deepEqual(
            doubles.queryStub.args,
            [
              ['INSERT INTO ?? SET ?', ['tableName', { col1: 'value1', col2: 'value2' }]],
              ['INSERT INTO ?? SET ?', ['tableName', { col1: 'value3', col3: 'value4' }]],
              ['INSERT INTO ?? SET ?', ['tableName', { col1: 'value5', col2: 'value6' }]],
            ]
          );
        }, () => {
          assert.fail();
        })
      );
    });

    describe('if 1 of the fixtures fails to be inserted', function () {
      it('should return a Promise that rejects with the failed query error message', function () {
        const insertFixturesFn = proxyInsertFixtures.insertFixtures(doubles.connectionStub);
        assert.typeOf(insertFixturesFn, 'function');
  
        doubles.dbPromisesStub.queryFn.returns(doubles.queryStub);
        doubles.queryStub.onCall(1).returns(Promise.reject('query() #2 error msg.'));
        doubles.queryStub.returns(Promise.resolve());

        const fixtures = [
          { col1: 'value1', col2: 'value2' },
          { col1: 'value3', col3: 'value4' },
          { col1: 'value5', col2: 'value6' },
        ];
        const insertFixtures = insertFixturesFn('tableName', fixtures);

        assert.typeOf(insertFixtures, 'Promise');
        return(
          insertFixtures.then((data) => {
            assert.fail();
          }, (reason) => {
            assert.strictEqual(reason, 'query() #2 error msg.');
            assert.isTrue(doubles.dbPromisesStub.queryFn.calledOnce);
            assert.deepEqual(doubles.dbPromisesStub.queryFn.args[0], [doubles.connectionStub]);
            assert.strictEqual(doubles.queryStub.callCount, 3);
            assert.deepEqual(
              doubles.queryStub.args,
              [
                ['INSERT INTO ?? SET ?', ['tableName', { col1: 'value1', col2: 'value2' }]],
                ['INSERT INTO ?? SET ?', ['tableName', { col1: 'value3', col3: 'value4' }]],
                ['INSERT INTO ?? SET ?', ['tableName', { col1: 'value5', col2: 'value6' }]],
              ]
            );
          })
        );
      });
    });
  });
});