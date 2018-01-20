'use strict';
import { Connection } from 'mysql';
import { queryFn } from './dbPromises';

export function truncate(connection: Connection): (tableNames: string[]) => Promise<void> {
  return(async (tableNames: string[]): Promise<void> => {
    const query = queryFn(connection);

    await query('set foreign_key_checks=?', [0]);

    try {
      const queries: Promise<void>[] = [];
      for (let i = 0; i < tableNames.length; i++) {
        queries.push(query('TRUNCATE TABLE ??', [tableNames[i]]));
      }
      await Promise.all(queries);
    } finally {
      await query('set foreign_key_checks=?', [1]);
    }
  });
}