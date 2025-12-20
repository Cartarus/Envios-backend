import { RateRepository } from "../../domain/interfaces/RateRepository"
import pool from "../config/database"


export class PostgresRateRepository implements RateRepository {
  async findRate(
    originCode: string,
    destinationCode: string,
    weight: number
  ) {
    const result = await pool.query(
      `
      SELECT r.*
      FROM rates r
      JOIN locations o ON o.id = r.origin_id
      JOIN locations d ON d.id = r.destination_id
      WHERE o.code = $1
        AND d.code = $2
        AND $3 BETWEEN r.min_weight AND r.max_weight
      LIMIT 1
      `,
      [originCode, destinationCode, weight]
    )

    return result.rows[0] || null
  }
}
