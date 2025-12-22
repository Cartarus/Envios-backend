import { Rate } from "../entities/Rate"

export interface RateRepository {
  findRate(
    originCode: string,
    destinationCode: string,
    weight: number
  ): Promise<Rate | null>
}
