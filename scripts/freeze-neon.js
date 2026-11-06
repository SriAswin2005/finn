// Cutover fence: old deployments retain reads but cannot diverge from the new
// quota ledger. Keep this fence after migration; rollback needs reconciliation.
import { neon } from '@neondatabase/serverless';
const query = neon(process.env.DATABASE_URL);
const tables = ['finn_push_state', 'finn_push_documents', 'finn_research_cache', 'finn_source_snapshots'];
const operation = process.argv[2];
if (!['freeze', 'status'].includes(operation)) throw new Error('Usage: freeze-neon.js freeze|status');
if (operation === 'freeze') {
  await query.transaction([
    query.query("CREATE OR REPLACE FUNCTION finn_recovery_read_only() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'FINN storage migration: old backend is read-only'; RETURN NULL; END $$"),
    ...tables.map(table => query.query(`CREATE OR REPLACE TRIGGER finn_recovery_fence BEFORE INSERT OR UPDATE OR DELETE ON ${table} FOR EACH STATEMENT EXECUTE FUNCTION finn_recovery_read_only()`)),
  ]);
}
const rows = await query.query("SELECT c.relname AS table_name, t.tgenabled AS enabled FROM pg_trigger t JOIN pg_class c ON c.oid=t.tgrelid WHERE t.tgname='finn_recovery_fence' AND NOT t.tgisinternal");
const frozen = tables.every(table => rows.some(row => row.table_name === table && row.enabled === 'O'));
console.log(JSON.stringify({ frozen, fencedTables: rows.map(row => row.table_name), sourceDataDeleted: false }));
if (!frozen) process.exitCode = 1;
