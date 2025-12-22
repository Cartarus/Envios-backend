import { ShipmentRepository } from "../../domain/interfaces/ShipmentRepository";

export class ListUserShipments {
  constructor(
    private shipmentRepository: ShipmentRepository
  ) {}

  async execute(userId: string) {
    return this.shipmentRepository.findByUser(userId)
  }
}
