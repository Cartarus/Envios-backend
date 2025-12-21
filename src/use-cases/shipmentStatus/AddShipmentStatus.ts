// domain/usecases/AddShipmentStatus.ts

import { ShipmentStatus } from "../../domain/entities/ShimpentStatus"
import { ShipmentRepository } from "../../domain/interfaces/ShipmentRepository"
import { ShipmentStatusHistoryRepository } from "../../domain/interfaces/ShipmentStatusHistoryRepository"
import { NotFoundError } from "../../shared/errors/AppError"


export class AddShipmentStatus {
  constructor(
    private statusRepo: ShipmentStatusHistoryRepository,
    private shipmentRepo: ShipmentRepository,
  ) {}

  async execute(
    shipmentId: string,
    status: ShipmentStatus,
    locationId: string
  ) {
    const shipment = await this.shipmentRepo.findById(shipmentId)

    if (!shipment) {
      throw new NotFoundError("Envío no encontrado")
    }


    if (status === ShipmentStatus.PENDING) {
      locationId = shipment.originId
    }

    if (status === ShipmentStatus.DELIVERED) {
      locationId = shipment.destinationId
    }

    await this.statusRepo.add({
      shipmentId,
      status,
      locationId
    })
  }
}
