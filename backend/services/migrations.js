const fs = require("fs");
const path = require("path");
const { Client } = require("pg");
const { env } = require("../config/env");

async function runMigrations({ force = false } = {}) {
  if (!force && !env.supabase.autoRunMigrations) {
    return { skipped: true, message: "Database migrations skipped." };
  }

  if (!env.supabase.databaseUrl) {
    return { skipped: true, message: "SUPABASE_DB_URL is not configured." };
  }

  const client = new Client({
    connectionString: env.supabase.databaseUrl,
    ssl: env.supabase.ssl ? { rejectUnauthorized: false } : false
  });

  const schemaPath = path.join(__dirname, "..", "database", "schema.sql");
  const sql = fs.readFileSync(schemaPath, "utf8");

  await client.connect();
  try {
    await client.query(sql);
    return { skipped: false, message: "Supabase schema is ready." };
  } finally {
    await client.end();
  }
}

module.exports = { runMigrations };
