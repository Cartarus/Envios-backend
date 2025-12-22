import 'dotenv/config';
import pool from '../config/database';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const migrations = [
  '001_create_users_table.sql',
  '002_create_locations_table.sql',
  '003_create_rates_table.sql',
  '004_create_shipments_table.sql',
  '005_create_shipment_status_history_table.sql'
];

async function runMigrations() {
  try {
    console.log('Limpiando base de datos...');
    await cleanDatabase();
    
    console.log('\nEjecutando migraciones...');
    
    // Ejecutar cada migración en orden
    for (const migration of migrations) {
      console.log(`  Ejecutando ${migration}...`);
      const migrationPath = join(__dirname, migration);
      const migrationSQL = readFileSync(migrationPath, 'utf-8');
      await pool.query(migrationSQL);
      console.log(`  ${migration} completada`);
    }
    
    console.log('\nPoblando base de datos con datos de prueba...');
    await seedData();
    
    console.log('\nMigraciones y datos de prueba completados');
    
    // Cerrar el pool
    await pool.end();
  } catch (error) {
    console.error('Error al ejecutar migraciones:', error);
    process.exit(1);
  }
}

async function cleanDatabase() {
  // Eliminar tablas en orden inverso por dependencias
  await pool.query(`
    DROP TABLE IF EXISTS shipment_status_history CASCADE;
    DROP TABLE IF EXISTS shipments CASCADE;
    DROP TABLE IF EXISTS rates CASCADE;
    DROP TABLE IF EXISTS locations CASCADE;
    DROP TABLE IF EXISTS users CASCADE;
  `);
  console.log('  Base de datos limpiada');
}

async function seedData() {
  // Insertar ubicaciones de prueba
  await pool.query(`
    INSERT INTO locations (id, code, name) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', 'BOG', 'Bogotá'),
    ('550e8400-e29b-41d4-a716-446655440002', 'MED', 'Medellín'),
    ('550e8400-e29b-41d4-a716-446655440003', 'CAL', 'Cali'),
    ('550e8400-e29b-41d4-a716-446655440004', 'BAQ', 'Barranquilla'),
    ('550e8400-e29b-41d4-a716-446655440005', 'CTG', 'Cartagena')
    ON CONFLICT (code) DO NOTHING;
  `);
  console.log('  Ubicaciones creadas');
  
  // Insertar tarifas de prueba
  await pool.query(`
    INSERT INTO rates (id, origin_id, destination_id, min_weight, max_weight, price) VALUES
    -- Bogotá a otras ciudades
    ('650e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 0, 5, 15000),
    ('650e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 6, 10, 25000),
    ('650e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', 0, 5, 18000),
    ('650e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', 6, 10, 28000),
    ('650e8400-e29b-41d4-a716-446655440025', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440004', 0, 5, 22000),
    ('650e8400-e29b-41d4-a716-446655440026', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440004', 6, 10, 32000),
    ('650e8400-e29b-41d4-a716-446655440027', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440005', 0, 5, 25000),
    ('650e8400-e29b-41d4-a716-446655440028', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440005', 6, 10, 35000),
    
    -- Medellín a otras ciudades
    ('650e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 0, 5, 15000),
    ('650e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 6, 10, 25000),
    ('650e8400-e29b-41d4-a716-446655440029', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003', 0, 5, 16000),
    ('650e8400-e29b-41d4-a716-446655440030', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003', 6, 10, 26000),
    ('650e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440004', 0, 5, 20000),
    ('650e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440004', 6, 10, 30000),
    ('650e8400-e29b-41d4-a716-446655440031', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440005', 0, 5, 23000),
    ('650e8400-e29b-41d4-a716-446655440032', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440005', 6, 10, 33000),
    
    -- Cali a otras ciudades
    ('650e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 0, 5, 18000),
    ('650e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 6, 10, 28000),
    ('650e8400-e29b-41d4-a716-446655440033', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', 0, 5, 16000),
    ('650e8400-e29b-41d4-a716-446655440034', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', 6, 10, 26000),
    ('650e8400-e29b-41d4-a716-446655440035', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440004', 0, 5, 14000),
    ('650e8400-e29b-41d4-a716-446655440036', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440004', 6, 10, 24000),
    ('650e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440005', 0, 5, 12000),
    ('650e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440005', 6, 10, 22000),
    
    -- Barranquilla a otras ciudades
    ('650e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001', 0, 5, 22000),
    ('650e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001', 6, 10, 32000),
    ('650e8400-e29b-41d4-a716-446655440015', '550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440002', 0, 5, 20000),
    ('650e8400-e29b-41d4-a716-446655440016', '550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440002', 6, 10, 30000),
    ('650e8400-e29b-41d4-a716-446655440017', '550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440005', 0, 5, 8000),
    ('650e8400-e29b-41d4-a716-446655440018', '550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440005', 6, 10, 15000),
    
    -- Cartagena a otras ciudades
    ('650e8400-e29b-41d4-a716-446655440019', '550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440001', 0, 5, 25000),
    ('650e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440001', 6, 10, 35000),
    ('650e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440003', 0, 5, 12000),
    ('650e8400-e29b-41d4-a716-446655440022', '550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440003', 6, 10, 22000),
    ('650e8400-e29b-41d4-a716-446655440023', '550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440004', 0, 5, 8000),
    ('650e8400-e29b-41d4-a716-446655440024', '550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440004', 6, 10, 15000)
    ON CONFLICT DO NOTHING;
  `);
  console.log('  Tarifas creadas');
}

runMigrations();
