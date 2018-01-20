'use strict';
import { Connection } from 'mysql';
import { end } from './dbPromises';

export function close(connection: Connection): () => Promise<void> {
  return(async (): Promise<void> => await end(connection));
}