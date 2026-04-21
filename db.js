const { Pool } = require('pg');

const pool = new Pool({
  connectionString: "postgresql://user:pass@host/dbnamepostgresql://neondb_owner:npg_AZmYb71kytDR@ep-morning-waterfall-aotsf7b7-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
  ssl: { rejectUnauthorized: false },
});

module.exports = pool;