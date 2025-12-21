import { CreateShipment } from '../../use-cases/shipment/CreateShipment';
import { NextFunction, Request, Response } from "express";

export class ShipmentController {
    constructor(private createShipment: CreateShipment) {}

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
            return res.status(201).json(shipment)
        } catch (error) {
            next(error);
        }
    }
}
