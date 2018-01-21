'use strict';
import { Connection, QueryOptions } from 'mysql';

/**
 * Establishes a connection to the DB.
 */
export function connect(connection: Connection): Promise<void> {
  return(new Promise((resolve, reject) => {
    connection.connect((error) => {
      if (error !== null && error !== undefined) { reject(error.stack); }
      resolve();
    });
  }));
}

/**
 * Gracefully terminates the current connection to the DB.
 */
export function end(connection: Connection): Promise<void> {
  return(new Promise((resolve, reject) => {
    connection.end((error) => {
      if (error !== null && error !== undefined) { reject(error.stack); }
      resolve();
    });
  }));
}

/**
 * Returns a function that will run a query on the provided connection.
 */
export function queryFn(
  connection: Connection
): (options: string, values: any[]) => Promise<void> {
  return((options: string, values: any[]): Promise<void> => {
    return(new Promise((resolve, reject) => {
      connection.query(options, values, (error) => {
        if (error !== null && error !== undefined) { reject(error.stack); }
        resolve();
      });
    }));
  });
}