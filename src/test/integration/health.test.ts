import { pool, seedData } from './../setup';

describe('Mi Test', () => {
  beforeEach(async () => {
    // Si necesitas datos de prueba, cárgalos
    await seedData(pool);
  });

  it('debe funcionar', async () => {
    const result = await pool.query('SELECT * FROM locations');
    expect(result.rows).toHaveLength(5);
  });
});