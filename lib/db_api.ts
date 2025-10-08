import mysql, { Pool } from 'mysql2/promise';

declare global {
  // Evita múltiples pools en hot-reload
  // eslint-disable-next-line no-var
  var _dbPool: Pool | undefined;
}

/* 🔧 Crear nuevo pool de conexiones */
function createPool(): Pool {
  return mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,

    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,

    // ⚙️ Estabilidad y rendimiento
    connectTimeout: 5000,       // ⏱️ tiempo máximo de conexión 5s
    enableKeepAlive: false,     // ❌ desactivar keep-alive (Aiven maneja SSL)
    maxIdle: 5,                 // máximo de conexiones ociosas
    idleTimeout: 15000,         // ⏱️ liberar conexiones tras 15s inactivas

    // 🔐 SSL (si Aiven u otro proveedor lo requiere)
    ssl:
      process.env.DB_SSL?.toLowerCase() === 'true'
        ? {
            rejectUnauthorized: true,
            minVersion: 'TLSv1.2',
            // ca: process.env.DB_CA, // descomenta si usas certificado CA
          }
        : undefined,
  });
}

/* ✅ Usa el pool global si ya existe */
export const db: Pool = global._dbPool || createPool();
if (process.env.NODE_ENV !== 'production') global._dbPool = db;

/* 🧠 Verificador seguro antes de cada uso (evita ECONNRESET) */
export async function getSafeConnection() {
  try {
    const conn = await db.getConnection();
    await conn.ping(); // garantiza que esté viva
    return conn;
  } catch (err) {
    console.error('⚠️ Reconectando MySQL tras error:', err);
    // recrea el pool si se cerró
    (global as any)._dbPool = createPool();
    const newConn = await (global as any)._dbPool.getConnection();
    await newConn.ping();
    return newConn;
  }
}

/* 🔥 Calentar pool (solo una vez) */
(async () => {
  try {
    const conn = await db.getConnection();
    await conn.ping();
    conn.release();
    console.log('✅ MySQL pool inicializado correctamente');
  } catch (err) {
    console.error('⚠️ Error inicializando pool MySQL:', err);
  }
})();

/* 🧹 Cerrar conexiones en modo desarrollo al salir */
if (process.env.NODE_ENV !== 'production') {
  process.on('SIGINT', async () => {
    try {
      await db.end();
      console.log('🔒 Pool MySQL cerrado correctamente (SIGINT)');
    } catch (err) {
      console.error('❌ Error cerrando pool MySQL:', err);
    } finally {
      process.exit(0);
    }
  });
}
