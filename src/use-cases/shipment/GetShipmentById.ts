import { ShipmentRepository } from "../../domain/interfaces/ShipmentRepository";

export class GetShipmentById {
  constructor(private shipmentRepository: ShipmentRepository) {}

  async execute(shipmentId: string) {
    return this.shipmentRepository.findById(shipmentId);
  }
}
