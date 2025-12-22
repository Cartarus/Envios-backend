import { Shipment } from "../entities/Shipment"

export interface ShipmentRepository {
  create(data: Omit<Shipment, "id" | "createdAt">): Promise<Shipment>
  findByUser(userId: string): Promise<Shipment[]>
  findById(shipmentId: string): Promise<Shipment | null>
}
