const { Pool } = require("pg");
require("dotenv").config({ quiet: true });

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

pool
  .connect()
  .then((client) => {
    console.log("PostgreSQL conectado correctamente");
    client.release();
  })
  .catch((error) =>
    console.error("Error conectando a PostgreSQL:", error.message)
  );

module.exports = pool;
