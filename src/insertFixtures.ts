'use strict';
import { Connection } from 'mysql';
import { queryFn } from './dbPromises';

export default function insertFixturesFactory(
  connection: Connection
): (tableName: string, fixtures: {}[]) => Promise<void> {
  return(async (tableName: string, fixtures: {}[]): Promise<void> => {
    const query = queryFn(connection);

    for (let i = 0; i < fixtures.length; i++) {
      await query('INSERT INTO ?? SET ?', [ tableName, fixtures[i] ]);
    }
  });
}