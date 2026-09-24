import dotenv from "dotenv";
import pkg from "pg";

dotenv.config();

const { Pool, types } = pkg;

types.setTypeParser(1082, (val) => val);

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

pool.on("connect", () => {
    console.log("Connected to Postgres");
});

pool.on("error", (err) => {
    console.error("Unexpected Postgres error:", err);
});

export default pool;