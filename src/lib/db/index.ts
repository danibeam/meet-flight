import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { config } from '@/lib/config';
import * as schema from './schema';

const client = createClient({
  url: config.database.url,
  authToken: config.database.token,
});

export const db = drizzle(client, { schema });
export { schema };
