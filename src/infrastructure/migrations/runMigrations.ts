import pool from '../config/database.js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runMigrations() {
  try {
    console.log('🔄 Ejecutando migraciones...');
    
    // Leer el archivo SQL
    const migrationPath = join(__dirname, '001_create_users_table.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf-8');
    
    // Ejecutar la migración
    await pool.query(migrationSQL);
    
    console.log('✅ Migraciones ejecutadas correctamente');
    
    // Cerrar el pool
    await pool.end();
  } catch (error) {
    console.error('❌ Error al ejecutar migraciones:', error);
    process.exit(1);
  }
}

runMigrations();
