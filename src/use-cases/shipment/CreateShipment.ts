import { ShipmentStatus } from "../../domain/entities/ShimpentStatus"
import { ShipmentRepository } from "../../domain/interfaces/ShipmentRepository"
import { ValidationError } from "../../shared/errors/AppError"


interface CreateShipmentInput {
  userId: string
  originId: string
  destinationId: string
  weight: number
  height: number
  width: number
  length: number
  price: number
}

export class CreateShipment {
  constructor(
    private shipmentRepository: ShipmentRepository
  ) {}

  async execute(data: CreateShipmentInput) {
    if (data.price <= 0) {
      throw new ValidationError("Precio inválido para el envío")
    }

    return this.shipmentRepository.create({
      ...data,
    })
  }

}