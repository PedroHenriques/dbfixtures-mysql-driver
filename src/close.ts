'use strict';
import { Connection } from 'mysql';
import { end } from './dbPromises';

export default function closeFactory(
  connection: Connection
): () => Promise<void> {
  return(() => end(connection));
}