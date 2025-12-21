import { ShipmentStatusHistoryRepository } from "../../domain/interfaces/ShipmentStatusHistoryRepository";
import { NotFoundError } from "../../shared/errors/AppError";

export class GetShipmentTracking {
  constructor(
    private statusRepo: ShipmentStatusHistoryRepository
  ) {}

  async execute(shipmentId: string) {
    const trackingHistory = await this.statusRepo.findByShipmentId(shipmentId);
    if (trackingHistory.length === 0) {
      throw new NotFoundError("No se encontró historial de seguimiento para este envío");
    }
    return trackingHistory;
  }
}
