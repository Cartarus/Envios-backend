import { newDb, IMemoryDb, DataType } from 'pg-mem';
import { Pool } from 'pg';
import { runMigrations, seedData } from './testMigrations.js';

// Configurar variables de entorno para las pruebas
process.env.JWT_SECRET = "test-secret-key-for-jwt-testing";

let db: IMemoryDb;
let pool: Pool;

// Configuración global de la base de datos en memoria para tests
beforeAll(async () => {
  // Crear una nueva instancia de base de datos en memoria
  db = newDb();
  
  // Registrar extensiones necesarias (si las usas)
  db.public.registerFunction({
    name: 'current_database',
    returns: DataType.text,
    implementation: () => 'test_db',
  });

  db.public.registerFunction({
    name: 'version',
    returns: DataType.text,
    implementation: () => 'PostgreSQL 14.0 (pg-mem)',
  });

  // Crear el adaptador de Pool de pg
  const { Pool: PgMemPool } = db.adapters.createPg();
  pool = new PgMemPool();

  // Ejecutar migraciones reales (lee los archivos .sql)
  // Nota: por defecto NO carga datos de prueba, para que cada test sea independiente
  await runMigrations(pool, true); // skipSeed = true
});

// Limpiar datos entre tests
afterEach(async () => {
  // Limpiar todas las tablas pero mantener la estructura
  await pool.query('DELETE FROM shipment_status_history');
  await pool.query('DELETE FROM shipments');
  await pool.query('DELETE FROM rates');
  await pool.query('DELETE FROM locations');
  await pool.query('DELETE FROM users');
});

// Cerrar conexiones después de todos los tests
afterAll(async () => {
  await pool.end();
});

// Exportar el pool y funciones útiles para los tests
export { pool, db, seedData };
