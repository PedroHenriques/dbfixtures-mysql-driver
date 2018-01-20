'use strict';
import { IDriver } from './interfaces';
import { ConnectionConfig, createConnection } from 'mysql';
import { connect } from './dbPromises';
import { truncate } from './truncate';
import { insertFixtures } from './insertFixtures';
import { close } from './close';

/**
 * Creates an instance of this Driver.
 */
export async function create(connectionOptions: string | ConnectionConfig): Promise<IDriver> {
  const connection = createConnection(connectionOptions);
  await connect(connection);
  return(Promise.resolve({
    truncate: truncate(connection),
    insertFixtures: insertFixtures(connection),
    close: close(connection),
  }));
}