import { RateRepository } from "../../domain/interfaces/RateRepository"
import { NotFoundError } from "../../shared/errors/AppError"

export interface ShipmentQuote {
  origin: string
  destination: string
  weightUsed: number
  price: number
}

export interface QuoteInput {
  origin: string
  destination: string
  weight: number
  height: number
  width: number
  length: number
}

export class GetRate {
  constructor(private rateRepository: RateRepository) {}

  async execute(data: QuoteInput): Promise<ShipmentQuote> {
    const volumetricWeight =
      (data.height * data.width * data.length) / 2500

    const finalWeight = Math.max(
      data.weight,
      Math.ceil(volumetricWeight)
    )

    console.log({finalWeight})

    const rate = await this.rateRepository.findRate(
      data.origin,
      data.destination,
      finalWeight
    )

    if (!rate) {
      throw new NotFoundError("No existe tarifa para los datos enviados")
    }

    return {
      origin: data.origin,
      destination: data.destination,
      weightUsed: finalWeight,
      price: rate.price
    }
  }
}
