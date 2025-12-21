import { ShipmentStatus } from "../../domain/entities/ShimpentStatus";
import { ValidationError } from "../../shared/errors/AppError";
import { AddShipmentStatus } from "../../use-cases/shipmentStatus/AddShipmentStatus";
import { GetShipmentTracking } from '../../use-cases/shipmentStatus/GetShipmentTracking';
import { NextFunction, Request, Response } from "express";


export class ShipmentStatusHistoryController {
    constructor(private addShipmentStatus:AddShipmentStatus,private getShipmentTracking:GetShipmentTracking ) {}

    async addStatus(req: Request, res: Response, next: NextFunction) {
        try {
            const { shipmentId, status, locationId } = req.body;

            if(ShipmentStatus[status as keyof typeof ShipmentStatus] === undefined){
                throw new ValidationError("Estado de envío inválido");
            }

            const shipmentStatus = await this.addShipmentStatus.execute(
                shipmentId,
                status,
                locationId
            );
            return res.status(201).json({ success: true, shipmentStatus });
        } catch (error) {
            next(error);
        }
    }

    async getTracking(req: Request, res: Response, next: NextFunction) {
        try {
            const { shipmentId } = req.params;
            const trackingHistory = await this.getShipmentTracking.execute(shipmentId);

            return res.status(200).json({ success: true, trackingHistory });
        } catch (error) {
            next(error);
        }
    }   
}