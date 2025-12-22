import { ShipmentStatusHistoryRepository } from "../../domain/interfaces/ShipmentStatusHistoryRepository";
import pool from "../config/database";
import { v4 as uuid } from "uuid"
import { Pool } from "pg";


export class PostgresShipmentStatusHistory
  implements ShipmentStatusHistoryRepository
{
  private pool: Pool;

  constructor(testPool?: Pool) {
    this.pool = testPool || pool;
  }

  async add({ shipmentId, status, locationId }: { shipmentId: string; status: string; locationId: string; }) {
    const id = uuid()
    const result = await this.pool.query(
      `
      INSERT INTO shipment_status_history
      (id, shipment_id, status, location_id)
      VALUES ($1, $2, $3, $4)
      RETURNING id, shipment_id as "shipmentId", status, location_id as "locationId", created_at as "createdAt"
      `,
      [id, shipmentId, status, locationId]
    );
    
    return result.rows[0];
  }

  async findByShipmentId(shipmentId: string) {
    const result = await this.pool.query(
      `
      SELECT
        ssh.id,
        ssh.shipment_id AS "shipmentId",
        ssh.status,
        ssh.location_id AS "locationId",
        ssh.created_at AS "createdAt",
        l.name AS location
      FROM shipment_status_history ssh
      LEFT JOIN locations l ON l.id = ssh.location_id
      WHERE ssh.shipment_id = $1
      ORDER BY ssh.created_at ASC
      `,
      [shipmentId]
    );

    return result.rows;
  }
}
