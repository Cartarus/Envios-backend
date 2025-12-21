import { CreateShipment } from '../../use-cases/shipment/CreateShipment';
import { NextFunction, Request, Response } from "express";
import { ListUserShipments } from '../../use-cases/shipment/listUserShipments';

export class ShipmentController {
    constructor(private createShipment: CreateShipment, private listUserShipments: ListUserShipments) {}

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
}
