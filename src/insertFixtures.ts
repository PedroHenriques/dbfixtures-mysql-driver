'use strict';
import { Connection } from 'mysql';
import { queryFn } from './dbPromises';

export function insertFixtures(
  connection: Connection
): (tableName: string, fixtures: [{}]) => Promise<void> {
  return(async (tableName: string, fixtures: [{}]): Promise<void> => {
    const query = queryFn(connection);

    const queries: Promise<void>[] = [];
    for (let i = 0; i < fixtures.length; i++) {
      queries.push(query('INSERT INTO ?? SET ?', [tableName, fixtures[i]]));
    }
    await Promise.all(queries);
  });
}