import { NextFunction, Request, Response } from "express";
import { GetRate } from "../../use-cases/quote/GetRate";

export class RateController {
  constructor(private getRate: GetRate) {}

  async getQuote(req: Request, res: Response, next: NextFunction) {

    try {
        const { origin, destination, weight, height, width, length } = req.body;   
        const quote = await this.getRate.execute({
            origin,
            destination,
            weight,
            height,
            width,
            length
        });
        res.status(200).json({ success: true, quote });
    } catch (error) {
      next(error);
    }
  }
}
