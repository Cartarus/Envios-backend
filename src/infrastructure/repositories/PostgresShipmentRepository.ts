
import { v4 as uuid } from "uuid"
import { ShipmentRepository } from "../../domain/interfaces/ShipmentRepository"
import pool from "../config/database"
import { Pool } from "pg";

export class PostgresShipmentRepository
  implements ShipmentRepository
{
  private pool: Pool;

  constructor(testPool?: Pool) {
    this.pool = testPool || pool;
  }

  async create(data: any) {
    const id = uuid()

    const result = await this.pool.query(
      `
      INSERT INTO shipments (
        id, user_id, origin_id, destination_id,
        weight, height, width, length,
        price
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING 
        id,
        user_id AS "userId",
        origin_id AS "originId",
        destination_id AS "destinationId",
        weight,
        height,
        width,
        length,
        price,
        created_at AS "createdAt"
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
    const result = await  this.pool.query(
      `
      SELECT
        s.id,
        s.price,
        s.created_at,
        o.code AS origin,
        d.code AS destination,
        latest_status.status AS "status",
        latest_status.created_at AS "statusUpdatedAt"
      FROM shipments s
      JOIN locations o ON o.id = s.origin_id
      JOIN locations d ON d.id = s.destination_id
      LEFT JOIN LATERAL (
        SELECT status, created_at
        FROM shipment_status_history
        WHERE shipment_id = s.id
        ORDER BY created_at DESC
        LIMIT 1
      ) latest_status ON true
      WHERE s.user_id = $1
      ORDER BY s.created_at DESC
      `,
      [userId]
    )

    return result.rows
  }

  async findById(shipmentId: string) {
    const result = await  this.pool.query(
      `
      SELECT
        s.id,
        s.user_id AS "userId",
        s.price,
        s.created_at AS "createdAt",
        s.origin_id AS "originId",
        s.destination_id AS "destinationId",
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
