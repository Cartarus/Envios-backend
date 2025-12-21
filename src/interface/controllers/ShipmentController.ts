import { CreateShipment } from '../../use-cases/shipment/CreateShipment';
import { NextFunction, Request, Response } from "express";
import { ListUserShipments } from '../../use-cases/shipment/listUserShipments';
import { GetShipmentById } from '../../use-cases/shipment/GetShipmentById';
import { NotFoundError } from '../../shared/errors/AppError';
import { AddShipmentStatus } from '../../use-cases/shipmentStatus/AddShipmentStatus';
import { ShipmentStatus } from '../../domain/entities/ShimpentStatus';
import { Location } from '../../domain/entities/Location';

export class ShipmentController {
    constructor(
        private createShipment: CreateShipment,
        private listUserShipments: ListUserShipments,
        private getShipmentById: GetShipmentById,
        private addShipmentStatus: AddShipmentStatus
    ) {}

    async storeShipment(req: Request, res: Response, next: NextFunction){
        try {
            const { id: userId } = req.user!;
            const {
                originId,
                destinationId,
                weight,
                height,
                width,
                length,
                price
            } = req.body;

            const shipment = await this.createShipment.execute({
                userId,
                originId,
                destinationId,
                weight,
                height,
                width,
                length,
                price
            });

            // Crear estado inicial del envío
            await this.addShipmentStatus.execute(
                shipment.id,
                ShipmentStatus.PENDING,
                originId
            );

            return res.status(201).json({ success: true, shipment });
        } catch (error) {
            next(error);
        }
    }

    async getUserShipments(req: Request, res: Response, next: NextFunction) {
        try {
            const { id: userId } = req.user!;

            const shipments = await this.listUserShipments.execute(userId);
            return res.status(200).json({ success: true, shipments });
        } catch (error) {
            next(error);
        }
    }

    async getShipment(req: Request, res: Response, next: NextFunction) {
        try {
            const { shipmentId } = req.params;

            const shipment = await this.getShipmentById.execute(shipmentId);
            if (!shipment) {
                throw new NotFoundError("Envío no encontrado");
            }
            return res.status(200).json({ success: true, shipment });
        } catch (error) {
            next(error);
        }
    }
}
