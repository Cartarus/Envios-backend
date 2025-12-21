
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
        price
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
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
      ]
    )

    return result.rows[0]
  }

  async findByUser(userId: string) {
    const result = await pool.query(
      `
      SELECT
        s.id,
        s.price,
        s.created_at,
        o.code AS origin,
        d.code AS destination
      FROM shipments s
      JOIN locations o ON o.id = s.origin_id
      JOIN locations d ON d.id = s.destination_id
      WHERE s.user_id = $1
      ORDER BY s.created_at DESC
      `,
      [userId]
    )

    return result.rows
  }

  async findById(shipmentId: string) {
    const result = await pool.query(
      `
      SELECT
        s.id,
        s.price,
        s.created_at,
        o.code AS origin,
        d.code AS destination,
        s.weight,
        s.height,
        s.width,
        s.length
      FROM shipments s
      JOIN locations o ON o.id = s.origin_id
      JOIN locations d ON d.id = s.destination_id
      WHERE s.id = $1
      `,
      [shipmentId]
    )

    return result.rows[0]
  }
}
