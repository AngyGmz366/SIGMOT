// lib/db.ts
import mysql from "mysql2/promise";

export const db = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME, // mydb
  waitForConnections: true,
  connectionLimit: 50,
  queueLimit: 0,
  dateStrings: true,
  timezone: "Z", // usa UTC interno, luego forzamos manualmente
});

// 👇 Ejecutar comando al crear conexión
db.on("connection", async (connection) => {
  try {
    await connection.query("SET time_zone = '-06:00';");
    console.log("🕓 Zona horaria de conexión establecida a Honduras (-06:00)");
  } catch (err) {
    console.error("⚠️ Error al establecer zona horaria:", err);
  }
});