'use strict';
import { Connection } from 'mysql';
import { queryFn } from './dbPromises';

export default function truncateFactory(
  connection: Connection
): (tableNames: string[]) => Promise<void> {
  return(
    (tableNames: string[]): Promise<void> => {
      if (tableNames.length === 0) { return(Promise.resolve()); }

      const query = queryFn(connection);

      return(
        query('set foreign_key_checks=?', [ 0 ])
        .then(async (): Promise<void> => {
          const queryPromises: Promise<void>[] = [];
          for (let i = 0; i < tableNames.length; i++) {
            queryPromises.push(query('TRUNCATE TABLE ??', [ tableNames[i] ]));
          }
          await Promise.all(queryPromises);
        })
        .finally(async () => {
          await query('set foreign_key_checks=?', [ 1 ]);
        })
      );
    }
  );
}