
import { v4 as uuid } from "uuid"
import { ShipmentRepository } from "../../domain/interfaces/ShipmentRepository"
import pool from "../config/database"

export class PostgresShipmentRepository
  implements ShipmentRepository
{
  async create(data: any) {
    const id = uuid()

    const result = await pool.query(
      `
      INSERT INTO shipments (
        id, user_id, origin_id, destination_id,
        weight, height, width, length,
        price, status
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      RETURNING *
      `,
      [
        id,
        data.userId,
        data.originId,
        data.destinationId,
        data.weight,
        data.height,
        data.width,
        data.length,
        data.price,
        data.status
      ]
    )

    return result.rows[0]
  }
}
