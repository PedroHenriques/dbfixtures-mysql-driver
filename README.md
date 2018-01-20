[![Build Status](https://travis-ci.org/PedroHenriques/dbfixtures-mysql-driver.svg?branch=master)](https://travis-ci.org/PedroHenriques/dbfixtures-mysql-driver)

# Fixtures Manager MySQL Driver

An abstraction layer for the [mysql package](https://www.npmjs.com/package/mysql) to facilitate handling database fixtures for testing purposes, in a MySQL database.
This package is ment to be used in conjunction with the [dbfixtures package](https://www.npmjs.com/package/dbfixtures), but can also be used by itself.

## Installation

```sh
npm install dbfixtures-mysql-driver
```

## Usage

This package exposes the `create(connectionOptions: string | ConnectionConfig): Promise<IDriver>` function that returns a Promise that resolves with an instance of the driver.
**Note:** For detailed information about the `connectionOptions` argument, please consult these [connection options](https://www.npmjs.com/package/mysql#connection-options).

An instance of the driver exposes the following interface

```js
// truncates the tables with the supplied names, ignoring foreign key constraints
truncate: (tableNames: string[]) => Promise<void>

// inserts the supplied rows into the specified table, respecting foreign key constraints
insertFixtures: (tableName: string, fixtures: [{}]) => Promise<void>

// terminates the connection to the database
close: () => Promise<void>
```

### Example

This example uses [Mocha](https://mochajs.org/) as the potential test runner.

```js
const dbfixtures = require('dbfixtures');
const fixturesMysqlDriver = require('dbfixtures-mysql-driver');

const mysqlConnectionInfo = {
  host: 'localhost',
  port: '3306',
  user: 'root',
  password: '',
  database: 'fixtures_test',
};
const fixtures = {
  'roles': [
    { id: 1, name: 'role 1' },
    { id: 2, name: 'role 2' },
  ],
  'users': [
    { id: 1, email: 'myemail@test.net', role_id: 2 },
    { id: 2, email: 'test@gmail.com', role_id: 1 },
    { id: 3, email: 'another@email.org', role_id: 1 },
  ],
};

describe('fixtures example', function () {
  before(async function () {
    const mysqlDriver = await fixturesMysqlDriver.create(mysqlConnectionInfo);
    dbfixtures.setDrivers(mysqlDriver);
  });

  beforeEach(async function () {
    await dbfixtures.insertFixtures(fixtures);
  });

  it('should have the database seeded with the fixtures', function () {
    // ...
  });
});
```

## Testing This Package

* `cd` into the package's directory
* run `npm install`
* for unit tests run `npm test -- test\unit\**\*.test.js`

* for integration tests run `npm test -- test\integration\**\*.test.js`
**NOTE:** requires an active MySQL server and a database to be setup, using the following MySQL commands
```sh
CREATE DATABASE fixtures_test;
CREATE TABLE fixtures_test.roles (id INT AUTO_INCREMENT, name VARCHAR(100) NULL, PRIMARY KEY(id));
CREATE TABLE fixtures_test.users (id INT AUTO_INCREMENT, email VARCHAR(150) NOT NULL, role_id INT NOT NULL, PRIMARY KEY(id), FOREIGN KEY (role_id) REFERENCES fixtures_test.roles(id));
```