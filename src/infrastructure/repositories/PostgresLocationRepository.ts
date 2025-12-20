import { LocationRepository } from "../../domain/interfaces/LocationRepository";
import pool from "../config/database";

export class PostgresLocationRepository implements LocationRepository {
    async findAll() {
    const result = await pool.query(
      "SELECT id, code, name FROM locations"
    )
    return result.rows
  }
}