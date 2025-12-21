import { ShipmentStatusHistory } from "../entities/ShipmentSatutsHistory";

export interface ShipmentStatusHistoryRepository {
    add(data: {
        shipmentId: string;
        status: string;
        locationId: string;
    }): Promise<ShipmentStatusHistory>;

    findByShipmentId(shipmentId: string): Promise<ShipmentStatusHistory[]>;
}