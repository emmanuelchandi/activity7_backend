// Creates one database connection pool that the whole app shares.
require("dotenv").config();
const { Pool } = require("pg");

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn("DATABASE_URL is not set. Add it to your .env file (or to the host's environment settings).");
}

// Hosted databases need SSL. A database on your own computer does not.
const isLocal = /@(localhost|127\.0\.0\.1)(:|\/|$)/.test(connectionString || "");
const useSsl = process.env.DATABASE_SSL
  ? process.env.DATABASE_SSL === "true"
  : !isLocal;

const pool = new Pool({
  connectionString,
  ssl: useSsl ? { rejectUnauthorized: false } : false
});

pool.on("error", (error) => {
  console.error("Unexpected database error:", error.message);
});

module.exports = pool;
