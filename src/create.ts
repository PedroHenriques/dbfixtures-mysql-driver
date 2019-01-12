'use strict';
import { ConnectionConfig, createConnection } from 'mysql';
import { connect } from './dbPromises';
import truncate from './truncate';
import insertFixtures from './insertFixtures';
import close from './close';
import { IDriver } from './interfaces';

/**
 * Creates an instance of this Driver.
 */
export default function create(
  connectionOptions: string | ConnectionConfig
): Promise<IDriver> {
  const connection = createConnection(connectionOptions);
  return(
    connect(connection)
    .then(() => {
      return({
        truncate: truncate(connection),
        insertFixtures: insertFixtures(connection),
        close: close(connection),
      });
    })
  );
}