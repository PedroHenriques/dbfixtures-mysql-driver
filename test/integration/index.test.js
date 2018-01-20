'use strict';
const assert = require('chai').assert;
const mysql = require('mysql');
const index = require('../../lib/index.js');

const connectionOptions = {
  host: 'localhost',
  port: '3306',
  user: 'root',
  password: '',
  database: 'fixtures_test',
};

describe('index.create()', function () {
  let connection;
  let driver;
  const initialQueries = [
    'set foreign_key_checks=0',
    'TRUNCATE TABLE users',
    'TRUNCATE TABLE roles',
    'set foreign_key_checks=1',
    'INSERT INTO roles VALUES(null,"role_1"),(null,"role_2")',
    'INSERT INTO users VALUES(null,"p@p.com",2),(null,"t@t.net",1)',
  ];

  before(async function () {
    connection = mysql.createConnection(connectionOptions);
    await new Promise((resolve, reject) => {
      connection.connect((error) => {
        if (error) { reject(error.stack); }
        resolve();
      });
    });
  });

  after(async function () {
    await new Promise((resolve, reject) => {
      connection.end((error) => {
        if (error) { reject(error.stack); }
        resolve();
      });
    });
  });

  beforeEach(async function () {
    for (let i = 0; i < initialQueries.length; i++) {
      await new Promise((resolve, reject) => {
        connection.query(initialQueries[i], (error) => {
          if (error) { reject(error.stack); }
          resolve();
        });
      });
    }

    driver = await index.create(connectionOptions);
  });

  afterEach(async function () {
    await driver.close();
  });

  it('should return an object compatible with the IDriver interface', async function () {
    assert.hasAllKeys(driver, ['truncate', 'insertFixtures', 'close']);
    assert.typeOf(driver.truncate, 'function');
    assert.typeOf(driver.insertFixtures, 'function');
    assert.typeOf(driver.close, 'function');
  });

  describe('driver.truncate()', function () {
    it('should truncate all the provided tables', async function () {
      await driver.truncate(['users', 'roles']);

      const rolesNumRows = await new Promise((resolve, reject) => {
        connection.query('SELECT count(id) as count FROM roles', (error, results) => {
          if (error) { reject(error.stack); }
          resolve(results[0].count);
        });
      });
      const usersNumRows = await new Promise((resolve, reject) => {
        connection.query('SELECT count(id) as count FROM users', (error, results) => {
          if (error) { reject(error.stack); }
          resolve(results[0].count);
        });
      });
      assert.strictEqual(rolesNumRows, 0);
      assert.strictEqual(usersNumRows, 0);
    });
  });

  describe('driver.insertFixtures()', function () {
    it('should insert all the provided rows into the provided table', async function () {
      await driver.insertFixtures('users', [
        { email: 'test@test.com', role_id: 1 },
        { email: 'another_test@gmail.com', role_id: 2 },
        { email: 'my-name@mydomain.net', role_id: 1 },
      ]);

      const rolesResults = await new Promise((resolve, reject) => {
        connection.query('SELECT * FROM roles', (error, results) => {
          if (error) { reject(error.stack); }
          resolve(results);
        });
      });
      const usersResults = await new Promise((resolve, reject) => {
        connection.query('SELECT * FROM users', (error, results) => {
          if (error) { reject(error.stack); }
          resolve(results);
        });
      });
      assert.deepEqual(
        rolesResults,
        [
          { id: 1, name: 'role_1' },
          { id: 2, name: 'role_2' }
        ]
      );
      assert.deepEqual(
        usersResults,
        [
          { id: 1, email: 'p@p.com', role_id: 2 },
          { id: 2, email: 't@t.net', role_id: 1 },
          { id: 3, email: 'test@test.com', role_id: 1 },
          { id: 4, email: 'another_test@gmail.com', role_id: 2 },
          { id: 5, email: 'my-name@mydomain.net', role_id: 1 },
        ]
      );
    });
  });
});