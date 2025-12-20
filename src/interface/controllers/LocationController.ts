import { GetLocations } from '../../use-cases/location/GetLocations';
import { NextFunction, Request, Response } from "express";

export class LocationController  {
  constructor(private getLocations: GetLocations) {}

  async getAllLocations(req: Request, res: Response, next: NextFunction) {
    try {
      const locations = await this.getLocations.execute();
      res.status(200).json({ success: true, locations });
    } catch (error) {
      next(error);
    }
  }

};