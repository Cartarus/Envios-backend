import { User } from '../../domain/entities/User.js';
import { UserRepository } from '../../domain/interfaces/UserRepository.js';
import { Pool } from 'pg';
import pool from '../config/database.js';

export class PostgresUserRepository implements UserRepository {
  private pool: Pool;

  constructor(testPool?: Pool) {
    this.pool = testPool || pool;
  }

  async create(user: User): Promise<void> {
    const query = `
      INSERT INTO users (id, name, email, password)
      VALUES ($1, $2, $3, $4)
    `;
    
    const values = [user.id, user.name, user.email, user.password];
    
    try {
      await this.pool.query(query, values);
    } catch (error) {
      throw new Error(`Error al crear usuario: ${error}`);
    }
  }

  async findById(id: string): Promise<User | null> {
    const query = `
      SELECT id, name, email, password
      FROM users
      WHERE id = $1
    `;
    
    try {
      const result = await this.pool.query(query, [id]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      const row = result.rows[0];
      return new User(row.id, row.name, row.email, row.password);
    } catch (error) {
      throw new Error(`Error al buscar usuario por ID: ${error}`);
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    const query = `
      SELECT id, name, email, password
      FROM users
      WHERE email = $1
    `;
    
    try {
      const result = await this.pool.query(query, [email]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      const row = result.rows[0];
      return new User(row.id, row.name, row.email, row.password);
    } catch (error) {
      throw new Error(`Error al buscar usuario por email: ${error}`);
    }
  }
}
