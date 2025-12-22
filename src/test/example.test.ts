import { pool } from './setup';

describe('Database Setup', () => {
  it('should connect to pg-mem database', async () => {
    const result = await pool.query('SELECT 1 as value');
    expect(result.rows[0].value).toBe(1);
  });

  it('should have all tables created', async () => {
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    const tableNames = result.rows.map(row => row.table_name);
    
    expect(tableNames).toContain('users');
    expect(tableNames).toContain('locations');
    expect(tableNames).toContain('rates');
    expect(tableNames).toContain('shipments');
    expect(tableNames).toContain('shipment_status_history');
  });
});
