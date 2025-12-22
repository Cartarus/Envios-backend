import { ShipmentStatusHistoryRepository } from "../../domain/interfaces/ShipmentStatusHistoryRepository";
import pool from "../config/database";
import { v4 as uuid } from "uuid"


export class PostgresShipmentStatusHistory
  implements ShipmentStatusHistoryRepository
{
  async add({ shipmentId, status, locationId }: { shipmentId: string; status: string; locationId: string; }) {
    const id = uuid()
    const result = await pool.query(
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
    const result = await pool.query(
      `
      SELECT
        ssh.status,
        ssh.created_at,
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
