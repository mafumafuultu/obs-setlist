import Surreal from 'surrealdb';
import { config } from '../config';

const db = new Surreal();

export async function connectDB() {
	const { host, port, namespace, database, user, pass } = config.database;
	try {
		// Connect to local SurrealDB instance
		await db.connect(`ws://${host}:${port}/rpc`, {
			namespace,
			database,
		});
		// Signin with the credentials from config
		await db.signin({ username: user, password: pass });
		console.log("Connected to SurrealDB");
		await initSchema();
		console.log("Schema initialized, returning true");
		return true;
	} catch (err) {
		console.error("Failed to connect to SurrealDB:", err);
		return false;
	}
}

export async function initSchema() {
	try {
		// Define tables (idempotent operations)
		// SCHEMALESS allows extra fields but enforces defined ones if ANY are defined.
		// For now we keep it simple but explicit.
		// Define tables and basic fields.
		// We use SCHEMALESS so we don't strictly need to define every field if it causes errors.
		await db.query(`
			DEFINE TABLE IF NOT EXISTS song SCHEMALESS;
			DEFINE FIELD IF NOT EXISTS title ON song TYPE string;
			DEFINE FIELD IF NOT EXISTS artist ON song TYPE string;

			DEFINE TABLE IF NOT EXISTS setlist SCHEMALESS;
			DEFINE FIELD IF NOT EXISTS title ON setlist TYPE string;
			DEFINE FIELD IF NOT EXISTS songs ON setlist TYPE array;

			DEFINE TABLE IF NOT EXISTS live_session SCHEMALESS;
		`);

		// Ensure initial live_session record exists
		await db.query(`
			INSERT INTO live_session {
				id: 'current',
				status: 'waiting',
				current_setlist_id: NONE,
				current_song_id: NONE,
				history: []
			} ON DUPLICATE KEY UPDATE id = id;
		`);

		console.log("Schema initialized (basic + live_session)");
		console.log("Schema initialized");
	} catch (err) {
		console.error("Failed to initialize schema:", err);
	}
}

export default db;
