[![Build Status](https://travis-ci.org/PedroHenriques/dbfixtures-mysql-driver.svg?branch=master)](https://travis-ci.org/PedroHenriques/dbfixtures-mysql-driver)

# Fixtures Manager MySQL Driver

An abstraction layer for the [mysql package](https://www.npmjs.com/package/mysql) to facilitate handling database fixtures for testing purposes, in a MySQL database.
This package is ment to be used in conjunction with the [dbfixtures package](https://www.npmjs.com/package/dbfixtures), but can also be used by itself.

## Installation

```sh
npm install --save-dev dbfixtures-mysql-driver
```

## NodeJS versions

- **Package version `>=1.1.*`** supports NodeJS `v8` or higher.  
  **NOTE:** For versions `8` and `9` the node flag `--harmony_promise_finally` is required

- **Package version `1.0.*`** supports NodeJS `v7` or higher.  

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

  after(async function () {
    await dbfixtures.closeDrivers();
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

* for unit tests run `npm test -- test\unit\`

* for integration tests run `npm test -- test\integration\`  
**NOTE:** requires an active MySQL server available through `localhost:3306` and with the expected setup (see below)

* for end-to-end tests run `npm test -- test\e2e\`  
**NOTE:** requires an active MySQL server available through `localhost:3306` and with the expected setup (see below)

### Required database setup

The `integration` and `end-to-end` tests the database server needs to have an initial setup that creates the database and tables used in the tests.  
A shell script is provided in the `test/db_setup/` directory with the commands that need to be executed in the database server to correctly set it up for the tests.

### Suggestion to setting up a MySQL server on your local machine

If you are using `Docker`, you can run the CLI command `docker run --name testmysql -p 127.0.0.1:3306:3306/tcp -e MYSQL_DATABASE=fixtures_test -e MYSQL_ALLOW_EMPTY_PASSWORD=yes -v absolute-path-to-project/test/db_setup/:/docker-entrypoint-initdb.d/ -d mariadb:10` to raise a container with the MariaDB v10.* image and make it available through `localhost:3306`.  

**NOTE:** Replace `absolute-path-to-project` with the absolute path to the root of the repository clone in your machine.