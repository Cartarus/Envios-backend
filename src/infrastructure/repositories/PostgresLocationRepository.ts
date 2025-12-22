import { LocationRepository } from "../../domain/interfaces/LocationRepository";
import { Pool } from "pg";
import pool from "../config/database";

export class PostgresLocationRepository implements LocationRepository {
  private pool: Pool;

  constructor(testPool?: Pool) {
    this.pool = testPool || pool;
  }

  async findAll() {
    const result = await this.pool.query(
      "SELECT id, code, name FROM locations"
    );
    return result.rows;
  }
}