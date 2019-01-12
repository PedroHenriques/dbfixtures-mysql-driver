'use strict';
const chai = require('chai');
const assert = chai.assert;
const sinon = require('sinon');
const proxyquire = require('proxyquire');

const dbPromises = require('../../lib/dbPromises.js');

describe('truncate', function () {
  const sandbox = sinon.createSandbox();
  let doubles;
  let proxyTruncate;

  beforeEach(function () {
    doubles = {
      dbPromisesStub: sandbox.stub(dbPromises),
    };
    proxyTruncate = proxyquire('../../lib/truncate', {
      './dbPromises': doubles.dbPromisesStub,
    });
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe('default export', function () {
    it('should return a function', function () {
      assert.typeOf(proxyTruncate.default(), 'function');
    });

    describe('returned function', function () {
      let connectionObj;
      let queryStub;
      let returnedFn;

      beforeEach(function () {
        connectionObj = {};
        queryStub = sandbox.stub();
        doubles.dbPromisesStub.queryFn.returns(queryStub);
        queryStub.returns(Promise.resolve());

        returnedFn = proxyTruncate.default(connectionObj);
      });

      it('should call the queryFn() export of the "dbPromises" module once', function () {
        return(
          returnedFn([''])
          .then(function () {
            assert.isTrue(doubles.dbPromisesStub.queryFn.calledOnce);
          })
        );
      });

      it('should call the queryFn() export of the "dbPromises" module with 1 argument', function () {
        return(
          returnedFn([''])
          .then(function () {
            assert.strictEqual(doubles.dbPromisesStub.queryFn.args[0].length, 1);
          })
        );
      });

      it('should call the queryFn() export of the "dbPromises" module with the 1st argument provided to the default export', function () {
        return(
          returnedFn([''])
          .then(function () {
            assert.strictEqual(doubles.dbPromisesStub.queryFn.args[0][0], connectionObj);
          })
        );
      });

      describe('if the array provided as 1st argument to this function is not empty', function () {
        describe('1st call to the result of the queryFn() export of the "dbPromises" module', function () {
          it('should receive 2 arguments', function () {
            return(
              returnedFn([''])
              .then(function () {
                assert.strictEqual(queryStub.args[0].length, 2);
              })
            );
          });
  
          describe('1st argument', function () {
            it('should be the parameterized query', function () {
              return(
                returnedFn([''])
                .then(function () {
                  assert.strictEqual(queryStub.args[0][0], 'set foreign_key_checks=?');
                })
              );
            });
          });
  
          describe('2nd argument', function () {
            it('should be an array with the parameter values', function () {
              return(
                returnedFn([''])
                .then(function () {
                  assert.deepEqual(queryStub.args[0][1], [ 0 ]);
                })
              );
            });
          });
        });

        describe('if the array has 1 item', function () {
          it('should call the result of the queryFn() export of the "dbPromises" module 3 times', function () {
            return(
              returnedFn([''])
              .then(function () {
                assert.strictEqual(queryStub.callCount, 3);
              })
            );
          });

          describe('2nd call to the result of the queryFn() export of the "dbPromises" module', function () {
            it('should receive 2 arguments', function () {
              return(
                returnedFn([''])
                .then(function () {
                  assert.strictEqual(queryStub.args[1].length, 2);
                })
              );
            });

            describe('1st argument', function () {
              it('should be the parameterized TRUNCATE statement', function () {
                return(
                  returnedFn([''])
                  .then(function () {
                    assert.strictEqual(queryStub.args[1][0], 'TRUNCATE TABLE ??');
                  })
                );
              });
            });

            describe('2nd argument', function () {
              it('should be an array with the parameter value, which is the only item in the provided array', function () {
                return(
                  returnedFn(['1st item'])
                  .then(function () {
                    assert.deepEqual(queryStub.args[1][1], [ '1st item' ]);
                  })
                );
              });
            });
          });

          describe('3rd call to the result of the queryFn() export of the "dbPromises" module', function () {
            it('should receive 2 arguments', function () {
              return(
                returnedFn([''])
                .then(function () {
                  assert.strictEqual(queryStub.args[2].length, 2);
                })
              );
            });

            describe('1st argument', function () {
              it('should be the parameterized statement', function () {
                return(
                  returnedFn([''])
                  .then(function () {
                    assert.strictEqual(queryStub.args[2][0], 'set foreign_key_checks=?');
                  })
                );
              });
            });

            describe('2nd argument', function () {
              it('should be an array with the parameter value', function () {
                return(
                  returnedFn(['1st item'])
                  .then(function () {
                    assert.deepEqual(queryStub.args[2][1], [ 1 ]);
                  })
                );
              });
            });
          });

          describe('if the 1st call to the result of the queryFn() export of the "dbPromises" module returns a promise that rejects with an Error object', function () {
            it('should return a promise that rejects with that Error object', function () {
              const testError = new Error('test error message');
              queryStub.onCall(0).returns(Promise.reject(testError));
              return(
                returnedFn([''])
                .then(function () {
                  assert.fail();
                })
                .catch(function (error) {
                  assert.strictEqual(error, testError);
                })
              );
            });

            it('should call the result of the queryFn() export only one more times', function () {
              const testError = new Error('test error message');
              queryStub.onCall(0).returns(Promise.reject(testError));
              return(
                returnedFn([''])
                .catch(function () {
                  assert.strictEqual(queryStub.callCount, 2);
                })
              );
            });

            describe('last call to the result of queryFn() export', function () {
              it('should receive 2 arguments', function () {
                const testError = new Error('test error message');
                queryStub.onCall(0).returns(Promise.reject(testError));
                return(
                  returnedFn([''])
                  .catch(function () {
                    assert.strictEqual(queryStub.args[1].length, 2);
                  })
                );
              });

              describe('1st argument', function () {
                it('should be the parameterized statement', function () {
                  const testError = new Error('test error message');
                  queryStub.onCall(0).returns(Promise.reject(testError));
                  return(
                    returnedFn([''])
                    .catch(function () {
                      assert.strictEqual(queryStub.args[1][0], 'set foreign_key_checks=?');
                    })
                  );
                });
              });

              describe('2nd argument', function () {
                it('should be an array with the parameter value', function () {
                  const testError = new Error('test error message');
                  queryStub.onCall(0).returns(Promise.reject(testError));
                  return(
                    returnedFn([''])
                    .catch(function () {
                      assert.deepEqual(queryStub.args[1][1], [ 1 ]);
                    })
                  );
                });
              });
            })
          });

          describe('if the 2nd call to the result of the queryFn() export of the "dbPromises" module returns a promise that rejects with an Error object', function () {
            it('should return a promise that rejects with that Error object', function () {
              const testError = new Error('test error message');
              queryStub.onCall(1).returns(Promise.reject(testError));
              return(
                returnedFn([''])
                .then(function () {
                  assert.fail();
                })
                .catch(function (error) {
                  assert.strictEqual(error, testError);
                })
              );
            });

            it('should call the result of the queryFn() export only one more times', function () {
              const testError = new Error('test error message');
              queryStub.onCall(1).returns(Promise.reject(testError));
              return(
                returnedFn([''])
                .catch(function () {
                  assert.strictEqual(queryStub.callCount, 3);
                })
              );
            });

            describe('last call to the result of queryFn() export', function () {
              it('should receive 2 arguments', function () {
                const testError = new Error('test error message');
                queryStub.onCall(1).returns(Promise.reject(testError));
                return(
                  returnedFn([''])
                  .catch(function () {
                    assert.strictEqual(queryStub.args[2].length, 2);
                  })
                );
              });

              describe('1st argument', function () {
                it('should be the parameterized statement', function () {
                  const testError = new Error('test error message');
                  queryStub.onCall(1).returns(Promise.reject(testError));
                  return(
                    returnedFn([''])
                    .catch(function () {
                      assert.strictEqual(queryStub.args[2][0], 'set foreign_key_checks=?');
                    })
                  );
                });
              });

              describe('2nd argument', function () {
                it('should be an array with the parameter value', function () {
                  const testError = new Error('test error message');
                  queryStub.onCall(1).returns(Promise.reject(testError));
                  return(
                    returnedFn([''])
                    .catch(function () {
                      assert.deepEqual(queryStub.args[2][1], [ 1 ]);
                    })
                  );
                });
              });
            })
          });

          describe('if the 3rd call to the result of the queryFn() export of the "dbPromises" module returns a promise that rejects with an Error object', function () {
            it('should return a promise that rejects with that Error object', function () {
              const testError = new Error('test error message');
              queryStub.onCall(2).returns(Promise.reject(testError));
              return(
                returnedFn([''])
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

        describe('if the array has 2 items', function () {
          it('should call the result of the queryFn() export of the "dbPromises" module 4 times', function () {
            return(
              returnedFn(['', ''])
              .then(function () {
                assert.strictEqual(queryStub.callCount, 4);
              })
            );
          });

          describe('2nd call to the result of the queryFn() export of the "dbPromises" module', function () {
            it('should receive 2 arguments', function () {
              return(
                returnedFn(['', ''])
                .then(function () {
                  assert.strictEqual(queryStub.args[1].length, 2);
                })
              );
            });

            describe('1st argument', function () {
              it('should be the parameterized TRUNCATE statement', function () {
                return(
                  returnedFn(['', ''])
                  .then(function () {
                    assert.strictEqual(queryStub.args[1][0], 'TRUNCATE TABLE ??');
                  })
                );
              });
            });

            describe('2nd argument', function () {
              it('should be an array with the parameter value, which is the only item in the provided array', function () {
                return(
                  returnedFn(['1st item', '2nd item'])
                  .then(function () {
                    assert.deepEqual(queryStub.args[1][1], [ '1st item' ]);
                  })
                );
              });
            });
          });

          describe('3rd call to the result of the queryFn() export of the "dbPromises" module', function () {
            it('should receive 2 arguments', function () {
              return(
                returnedFn(['', ''])
                .then(function () {
                  assert.strictEqual(queryStub.args[2].length, 2);
                })
              );
            });

            describe('1st argument', function () {
              it('should be the parameterized TRUNCATE statement', function () {
                return(
                  returnedFn(['', ''])
                  .then(function () {
                    assert.strictEqual(queryStub.args[2][0], 'TRUNCATE TABLE ??');
                  })
                );
              });
            });

            describe('2nd argument', function () {
              it('should be an array with the parameter value, which is the only item in the provided array', function () {
                return(
                  returnedFn(['item 1', 'item 2'])
                  .then(function () {
                    assert.deepEqual(queryStub.args[2][1], [ 'item 2' ]);
                  })
                );
              });
            });
          });

          describe('4th call to the result of the queryFn() export of the "dbPromises" module', function () {
            it('should receive 2 arguments', function () {
              return(
                returnedFn(['',''])
                .then(function () {
                  assert.strictEqual(queryStub.args[3].length, 2);
                })
              );
            });

            describe('1st argument', function () {
              it('should be the parameterized statement', function () {
                return(
                  returnedFn(['',''])
                  .then(function () {
                    assert.strictEqual(queryStub.args[3][0], 'set foreign_key_checks=?');
                  })
                );
              });
            });

            describe('2nd argument', function () {
              it('should be an array with the parameter value', function () {
                return(
                  returnedFn(['1st element', '2nd element'])
                  .then(function () {
                    assert.deepEqual(queryStub.args[3][1], [ 1 ]);
                  })
                );
              });
            });
          });

          describe('if the 1st call to the result of the queryFn() export of the "dbPromises" module returns a promise that rejects with an Error object', function () {
            it('should return a promise that rejects with that Error object', function () {
              const testError = new Error('test error message');
              queryStub.onCall(0).returns(Promise.reject(testError));
              return(
                returnedFn(['', ''])
                .then(function () {
                  assert.fail();
                })
                .catch(function (error) {
                  assert.strictEqual(error, testError);
                })
              );
            });

            it('should still call the result of the queryFn() export one more time', function () {
              const testError = new Error('test error message');
              queryStub.onCall(0).returns(Promise.reject(testError));
              return(
                returnedFn(['', ''])
                .catch(function () {
                  assert.strictEqual(queryStub.callCount, 2);
                })
              );
            });

            describe('last call to the result of queryFn() export', function () {
              it('should receive 2 arguments', function () {
                const testError = new Error('test error message');
                queryStub.onCall(0).returns(Promise.reject(testError));
                return(
                  returnedFn(['', ''])
                  .catch(function () {
                    assert.strictEqual(queryStub.args[1].length, 2);
                  })
                );
              });

              describe('1st argument', function () {
                it('should be the parameterized statement', function () {
                  const testError = new Error('test error message');
                  queryStub.onCall(0).returns(Promise.reject(testError));
                  return(
                    returnedFn(['', ''])
                    .catch(function () {
                      assert.strictEqual(queryStub.args[1][0], 'set foreign_key_checks=?');
                    })
                  );
                });
              });

              describe('2nd argument', function () {
                it('should be an array with the parameter value', function () {
                  const testError = new Error('test error message');
                  queryStub.onCall(0).returns(Promise.reject(testError));
                  return(
                    returnedFn(['', ''])
                    .catch(function () {
                      assert.deepEqual(queryStub.args[1][1], [ 1 ]);
                    })
                  );
                });
              });
            })
          });

          describe('if the 2nd call to the result of the queryFn() export of the "dbPromises" module returns a promise that rejects with an Error object', function () {
            it('should return a promise that rejects with that Error object', function () {
              const testError = new Error('test error message');
              queryStub.onCall(1).returns(Promise.reject(testError));
              return(
                returnedFn(['', ''])
                .then(function () {
                  assert.fail();
                })
                .catch(function (error) {
                  assert.strictEqual(error, testError);
                })
              );
            });

            it('should still call the result of the queryFn() export for all elements in the provided array and a final time for cleanup', function () {
              const testError = new Error('test error message');
              queryStub.onCall(1).returns(Promise.reject(testError));
              return(
                returnedFn(['', ''])
                .catch(function () {
                  assert.strictEqual(queryStub.callCount, 4);
                })
              );
            });

            describe('3rd call to the result of queryFn() export', function () {
              it('should receive 2 arguments', function () {
                const testError = new Error('test error message');
                queryStub.onCall(1).returns(Promise.reject(testError));
                return(
                  returnedFn(['', ''])
                  .catch(function () {
                    assert.strictEqual(queryStub.args[2].length, 2);
                  })
                );
              });

              describe('1st argument', function () {
                it('should be the parameterized TRUNCATE statement', function () {
                  const testError = new Error('test error message');
                  queryStub.onCall(1).returns(Promise.reject(testError));
                  return(
                    returnedFn(['', ''])
                    .catch(function () {
                      assert.strictEqual(queryStub.args[2][0], 'TRUNCATE TABLE ??');
                    })
                  );
                });
              });

              describe('2nd argument', function () {
                it('should be an array with the parameter value', function () {
                  const testError = new Error('test error message');
                  queryStub.onCall(1).returns(Promise.reject(testError));
                  return(
                    returnedFn(['array item 1', 'array item 2'])
                    .catch(function () {
                      assert.deepEqual(queryStub.args[2][1], [ 'array item 2' ]);
                    })
                  );
                });
              });
            })

            describe('4th call to the result of queryFn() export', function () {
              it('should receive 2 arguments', function () {
                const testError = new Error('test error message');
                queryStub.onCall(1).returns(Promise.reject(testError));
                return(
                  returnedFn(['', ''])
                  .catch(function () {
                    assert.strictEqual(queryStub.args[3].length, 2);
                  })
                );
              });

              describe('1st argument', function () {
                it('should be the parameterized statement', function () {
                  const testError = new Error('test error message');
                  queryStub.onCall(1).returns(Promise.reject(testError));
                  return(
                    returnedFn(['', ''])
                    .catch(function () {
                      assert.strictEqual(queryStub.args[3][0], 'set foreign_key_checks=?');
                    })
                  );
                });
              });

              describe('2nd argument', function () {
                it('should be an array with the parameter value', function () {
                  const testError = new Error('test error message');
                  queryStub.onCall(1).returns(Promise.reject(testError));
                  return(
                    returnedFn(['', ''])
                    .catch(function () {
                      assert.deepEqual(queryStub.args[3][1], [ 1 ]);
                    })
                  );
                });
              });
            })
          });

          describe('if the 3rd call to the result of the queryFn() export of the "dbPromises" module returns a promise that rejects with an Error object', function () {
            it('should return a promise that rejects with that Error object', function () {
              const testError = new Error('test error message');
              queryStub.onCall(2).returns(Promise.reject(testError));
              return(
                returnedFn(['', ''])
                .then(function () {
                  assert.fail();
                })
                .catch(function (error) {
                  assert.strictEqual(error, testError);
                })
              );
            });

            it('should still call the result of the queryFn() export one more time', function () {
              const testError = new Error('test error message');
              queryStub.onCall(2).returns(Promise.reject(testError));
              return(
                returnedFn(['', ''])
                .catch(function () {
                  assert.strictEqual(queryStub.callCount, 4);
                })
              );
            });

            describe('4th call to the result of queryFn() export', function () {
              it('should receive 2 arguments', function () {
                const testError = new Error('test error message');
                queryStub.onCall(2).returns(Promise.reject(testError));
                return(
                  returnedFn(['', ''])
                  .catch(function () {
                    assert.strictEqual(queryStub.args[3].length, 2);
                  })
                );
              });

              describe('1st argument', function () {
                it('should be the parameterized statement', function () {
                  const testError = new Error('test error message');
                  queryStub.onCall(2).returns(Promise.reject(testError));
                  return(
                    returnedFn(['', ''])
                    .catch(function () {
                      assert.strictEqual(queryStub.args[3][0], 'set foreign_key_checks=?');
                    })
                  );
                });
              });

              describe('2nd argument', function () {
                it('should be an array with the parameter value', function () {
                  const testError = new Error('test error message');
                  queryStub.onCall(2).returns(Promise.reject(testError));
                  return(
                    returnedFn(['', ''])
                    .catch(function () {
                      assert.deepEqual(queryStub.args[3][1], [ 1 ]);
                    })
                  );
                });
              });
            })
          });

          describe('if the 4th call to the result of the queryFn() export of the "dbPromises" module returns a promise that rejects with an Error object', function () {
            it('should return a promise that rejects with that Error object', function () {
              const testError = new Error('test error message');
              queryStub.onCall(3).returns(Promise.reject(testError));
              return(
                returnedFn(['', ''])
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

      describe('if the array provided as 1st argument to this function is empty', function () {
        it('should return a promise that resolves with void', function () {
          return(
            returnedFn([])
            .then(function (result) {
              assert.isUndefined(result);
            })
          );
        });

        it('should not call the queryFn() export of the "dbPromises" module', function () {
          return(
            returnedFn([])
            .then(function () {
              assert.isTrue(doubles.dbPromisesStub.queryFn.notCalled);
            })
          );
        });
      });
    });
  });
});