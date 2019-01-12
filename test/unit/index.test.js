'use strict';
const chai = require('chai');
const assert = chai.assert;
const sinon = require('sinon');
const proxyquire = require('proxyquire');

const create = require('../../lib/create');

describe('entry point file', function () {
  const sandbox = sinon.createSandbox();
  let doubles;
  let proxyIndex;

  beforeEach(function () {
    doubles = {
      createStub: sandbox.stub(create),
    };
    proxyIndex = proxyquire('../../lib/index', {
      './create': doubles.createStub,
    });
  });

  afterEach(function () {
    sandbox.restore();
  });

  it('should export a "create" property pointing to the create() function of the "create" module', function () {
    assert.strictEqual(proxyIndex.create, doubles.createStub.default);
  });
});