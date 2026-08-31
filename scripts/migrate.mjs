import { fileURLToPath } from 'node:url';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL Umgebungsvariable ist nicht gesetzt');
  process.exit(1);
}

const migrationsFolder = fileURLToPath(
  new URL('../lib/db/migrations', import.meta.url),
);

const client = postgres(connectionString, { max: 1 });
const db = drizzle(client);

try {
  console.log('Starte Datenbank-Migrationen...');
  await migrate(db, { migrationsFolder });
  console.log('Migrationen erfolgreich abgeschlossen.');
  await client.end();
  process.exit(0);
} catch (err) {
  console.error('Migration fehlgeschlagen:', err);
  await client.end().catch(() => {});
  process.exit(1);
}
