import { pool, seedData } from './setup';

describe('Test con datos de prueba (seed)', () => {
  beforeEach(async () => {
    // Cargar datos de prueba antes de cada test
    await seedData(pool);
  });

  it('debe tener 5 ubicaciones cargadas', async () => {
    const result = await pool.query('SELECT * FROM locations');
    expect(result.rows).toHaveLength(5);
  });

  it('debe tener tarifas de Bogotá a Medellín', async () => {
    // Primero, obtener los IDs de Bogotá y Medellín
    const bog = await pool.query(`SELECT id FROM locations WHERE code = 'BOG'`);
    const med = await pool.query(`SELECT id FROM locations WHERE code = 'MED'`);
    
    const result = await pool.query(`
      SELECT *
      FROM rates
      WHERE origin_id = $1 AND destination_id = $2
    `, [bog.rows[0].id, med.rows[0].id]);
    
    expect(result.rows.length).toBeGreaterThan(0);
    expect(result.rows[0].price).toBeGreaterThan(0);
  });

  it('debe poder consultar tarifas por peso', async () => {
    const weight = 3;
    
    // Obtener IDs de Bogotá y Medellín
    const bog = await pool.query(`SELECT id FROM locations WHERE code = 'BOG'`);
    const med = await pool.query(`SELECT id FROM locations WHERE code = 'MED'`);
    
    const result = await pool.query(`
      SELECT *
      FROM rates
      WHERE origin_id = $1 
      AND destination_id = $2
      AND min_weight <= $3 
      AND max_weight >= $3
    `, [bog.rows[0].id, med.rows[0].id, weight]);
    
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].price).toBe(15000);
  });
});
