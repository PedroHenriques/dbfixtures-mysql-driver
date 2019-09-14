'use strict';
const chai = require('chai');
const assert = chai.assert;

const dbFixtures = require('dbfixtures');
const sutModule = require('../../lib/index');
const mysql = require('mysql');

const connectionOptions = {
  host: 'localhost',
  port: '3306',
  user: 'root',
  password: '',
  database: 'fixtures_test',
};

describe('Entry point', function () {
  let connection;
  let mysqlDriver;
  const initialQueries = [
    'set foreign_key_checks=0',
    'TRUNCATE TABLE users',
    'TRUNCATE TABLE roles',
    'set foreign_key_checks=1',
  ];
  before(async function () {
    connection = mysql.createConnection(connectionOptions);
    const promises = [];

    promises.push(new Promise((resolve, reject) => {
      connection.connect((error) => {
        if (error) { reject(error); }
        resolve();
      });
    }));
    promises.push(
      sutModule.create(connectionOptions)
      .then(function (result) {
        mysqlDriver = result;
      })
    );

    await Promise.all(promises);

    dbFixtures.setDrivers(mysqlDriver);
  });

  after(function () {
    dbFixtures.closeDrivers();

    new Promise((resolve, reject) => {
      connection.end((error) => {
        if (error) { reject(error); }
        resolve();
      });
    });
  });

  beforeEach(async function () {
    for (let i = 0; i < initialQueries.length; i++) {
      await new Promise((resolve, reject) => {
        connection.query(initialQueries[i], (error) => {
          if (error) { reject(error); }
          resolve();
        });
      });
    }
  });

  it('should interact with the node driver correctly', async function () {
    const fixtures = {
      'roles': [
        { name: 'role 1' },
        { name: 'role 2' },
      ],
      'users': [
        { email: 'test@test.com', role_id: 1 },
        { email: 'another_test@gmail.com', role_id: 2 },
        { email: 'my-name@mydomain.net', role_id: 1 },
      ],
    };

    await Promise.all([
      new Promise((resolve, reject) => {
        connection.query('SELECT count(id) as count FROM roles', (error, results) => {
          if (error) { reject(error); }
          resolve(results[0].count);
        });
      }),
      new Promise((resolve, reject) => {
        connection.query('SELECT count(id) as count FROM users', (error, results) => {
          if (error) { reject(error); }
          resolve(results[0].count);
        });
      }),
    ])
    .then(function (results) {
      assert.strictEqual(results[0], 0);
      assert.strictEqual(results[1], 0);
    });

    await dbFixtures.insertFixtures(fixtures);

    await Promise.all([
      new Promise((resolve, reject) => {
        connection.query('SELECT count(id) as count FROM roles', (error, results) => {
          if (error) { reject(error); }
          resolve(results[0].count);
        });
      }),
      new Promise((resolve, reject) => {
        connection.query('SELECT count(id) as count FROM users', (error, results) => {
          if (error) { reject(error); }
          resolve(results[0].count);
        });
      }),
    ])
    .then(function (results) {
      assert.strictEqual(results[0], 2);
      assert.strictEqual(results[1], 3);
    });
  });
});