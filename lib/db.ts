// lib/db.ts
import mysql from 'mysql2/promise';

export const db = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME, // mydb
  waitForConnections: true,      // Espera si hay conexiones disponibles
  connectionLimit: 5,           // Límite de conexiones concurrentes
  queueLimit: 0,                 // Sin límite de conexiones en espera
  dateStrings: true,
  timezone: "Z",
});


// 👇 Ejecutar comando al crear conexión
db.on('connection', async (connection) => {
  try {
    // No es necesario usar .promise() si ya estás usando mysql2/promise
    await connection.query("SET time_zone = '-06:00';"); 
    console.log('🕓 Zona horaria de conexión establecida a Honduras (-06:00)');
  } catch (err) {
    console.error('⚠️ Error al establecer zona horaria:', err);
  }
});
