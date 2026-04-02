// lib/db.ts
import mysql from 'mysql2/promise';

export const db = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME, // mydb
    waitForConnections: true, // Espera si hay conexiones disponibles
    connectionLimit: 5, // Límite de conexiones concurrentes
    queueLimit: 0, // Sin límite de conexiones en espera
    dateStrings: true,
    timezone: 'Z'
});
