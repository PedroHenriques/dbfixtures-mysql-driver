'use strict';
const chai = require('chai');
const assert = chai.assert;
const sinon = require('sinon');
const proxyquire = require('proxyquire');

const dbPromises = require('../../lib/dbPromises');

describe('insertFixtures', function () {
  const sandbox = sinon.createSandbox();
  let doubles;
  let proxyInsertFixtures;

  beforeEach(function () {
    doubles = {
      dbPromisesStub: sandbox.stub(dbPromises),
    };
    proxyInsertFixtures = proxyquire('../../lib/insertFixtures', {
      './dbPromises': doubles.dbPromisesStub,
    });
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe('default export', function () {
    it('should be a function', function () {
      assert.typeOf(proxyInsertFixtures.default, 'function');
    });

    it('should return a function', function () {
      assert.typeOf(proxyInsertFixtures.default(), 'function');
    });

    describe('returned function', function () {
      let returnedFunction;
      let connectionObj;

      beforeEach(function () {
        connectionObj = {};
        returnedFunction = proxyInsertFixtures.default(connectionObj);
      });

      it('should call the queryFn() function of the dbPromises module once', function () {
        return(
          returnedFunction('', [])
          .then(function () {
            assert.isTrue(doubles.dbPromisesStub.queryFn.calledOnce);
          })
        );
      });

      it('should call the queryFn() function of the dbPromises module with 1 argument', function () {
        return(
          returnedFunction('', [])
          .then(function () {
            assert.strictEqual(doubles.dbPromisesStub.queryFn.args[0].length, 1);
          })
        );
      });

      it('should call the queryFn() function of the dbPromises module with the 1st argument provided to the default export', function () {
        return(
          returnedFunction('', [])
          .then(function () {
            assert.strictEqual(doubles.dbPromisesStub.queryFn.args[0][0], connectionObj);
          })
        );
      });

      describe('if the array passed as 2nd argument to this function has 1 element', function () {
        let queryStub;

        beforeEach(function () {
          queryStub = sandbox.stub();
          doubles.dbPromisesStub.queryFn.returns(queryStub);
          queryStub.returns(Promise.resolve());
        });

        it('should call the result from the call to queryFn() once', function () {
          return(
            returnedFunction('test table name', [ {} ])
            .then(function () {
              assert.isTrue(queryStub.calledOnce);
            })
          );
        });

        it('should call the result from the call to queryFn() with 2 arguments', function () {
          return(
            returnedFunction('test table name', [ {} ])
            .then(function () {
              assert.strictEqual(queryStub.args[0].length, 2);
            })
          );
        });

        describe('1st argument of the 1st call to the result of queryFn()', function () {
          it('should be the parameterized INSERT query', function () {
            return(
              returnedFunction('test table name', [ {} ])
              .then(function () {
                assert.strictEqual(queryStub.args[0][0], 'INSERT INTO ?? SET ?');
              })
            );
          });
        });

        describe('2nd argument of the 1st call to the result of queryFn()', function () {
          it('should have the 1st argument to this function and the 1st element of the 2nd argument to this function as elements', function () {
            const tableName = 'test table name';
            const elem1 = {};
            return(
              returnedFunction(tableName, [ elem1 ])
              .then(function () {
                assert.deepStrictEqual(queryStub.args[0][1], [ tableName, elem1 ]);
              })
            );
          });
        });

        it('should return a promise that resolves with void', function () {
          return(
            returnedFunction('test table name', [ {} ])
            .then(function (result) {
              assert.isUndefined(result);
            })
          );
        });

        describe('if the call to the result of queryFn() returns a promise that rejects with an Error object', function () {
          it('should return a promise that rejects with that Error object', function () {
            const testError = new Error('queryFn() test error message');
            queryStub.returns(Promise.reject(testError));
            return(
              returnedFunction('test table name', [ {} ])
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

      describe('if the array passed as 2nd argument to this function has 2 elements', function () {
        let queryStub;

        beforeEach(function () {
          queryStub = sandbox.stub();
          doubles.dbPromisesStub.queryFn.returns(queryStub);
          queryStub.returns(Promise.resolve());
        });

        it('should call the result from the call to queryFn() 2 times', function () {
          return(
            returnedFunction('test table name', [ {}, {} ])
            .then(function () {
              assert.strictEqual(queryStub.callCount, 2);
            })
          );
        });

        describe('1st call to the result of queryFn()', function () {
          it('should have received 2 arguments', function () {
            return(
              returnedFunction('test table name', [ {}, {} ])
              .then(function () {
                assert.strictEqual(queryStub.args[0].length, 2);
              })
            );
          });

          describe('1st argument', function () {
            it('should be the parameterized INSERT query', function () {
              return(
                returnedFunction('test table name', [ {}, {} ])
                .then(function () {
                  assert.strictEqual(queryStub.args[0][0], 'INSERT INTO ?? SET ?');
                })
              );
            });
          });

          describe('2nd argument', function () {
            it('should have the 1st argument to this function and the 1st element of the 2nd argument to this function as elements', function () {
              const tableName = 'another test table name';
              const elem1 = {};
              return(
                returnedFunction(tableName, [ elem1, {} ])
                .then(function () {
                  assert.deepStrictEqual(queryStub.args[0][1], [ tableName, elem1 ]);
                })
              );
            });
          });
        });

        describe('2nd call to the result of queryFn()', function () {
          it('should have received 2 arguments', function () {
            return(
              returnedFunction('table name', [ {}, {} ])
              .then(function () {
                assert.strictEqual(queryStub.args[1].length, 2);
              })
            );
          });

          describe('1st argument', function () {
            it('should be the parameterized INSERT query', function () {
              return(
                returnedFunction('table name', [ {}, {} ])
                .then(function () {
                  assert.strictEqual(queryStub.args[1][0], 'INSERT INTO ?? SET ?');
                })
              );
            });
          });

          describe('2nd argument', function () {
            it('should have the 1st argument to this function and the 1st element of the 2nd argument to this function as elements', function () {
              const tableName = 'another table name';
              const elem1 = {};
              return(
                returnedFunction(tableName, [ elem1, {} ])
                .then(function () {
                  assert.deepStrictEqual(queryStub.args[1][1], [ tableName, elem1 ]);
                })
              );
            });
          });
        });

        it('should return a promise that resolves with void', function () {
          return(
            returnedFunction('test table name', [ {}, {} ])
            .then(function (result) {
              assert.isUndefined(result);
            })
          );
        });

        describe('if the 1st call to the result of queryFn() returns a promise that rejects with an Error object', function () {
          it('should return a promise that rejects with that Error object', function () {
            const testError = new Error('1st call to result of queryFn() test error message');
            queryStub.onCall(0).returns(Promise.reject(testError));
            return(
              returnedFunction('yet another table name', [ {}, {} ])
              .then(function () {
                assert.fail();
              })
              .catch(function (error) {
                assert.strictEqual(error, testError);
              })
            );
          });

          it('should not call the result of queryFn() a second time', function () {
            const testError = new Error('1st call to result of queryFn() test error message');
            queryStub.onCall(0).returns(Promise.reject(testError));
            return(
              returnedFunction('yet another table name', [ {}, {} ])
              .catch(function () {
                assert.strictEqual(queryStub.callCount, 1);
              })
            );
          });
        });
        
        describe('if the 2nd call to the result of queryFn() returns a promise that rejects with an Error object', function () {
          it('should return a promise that rejects with that Error object', function () {
            const testError = new Error('2nd call to result of queryFn() test error message');
            queryStub.onCall(1).returns(Promise.reject(testError));
            return(
              returnedFunction('yet another table name', [ {}, {} ])
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