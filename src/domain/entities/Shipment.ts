export interface Shipment {
  id: string
  userId: string
  originId: string
  destinationId: string
  weight: number
  height: number
  width: number
  length: number
  price: number
  status: string
  createdAt: Date
}
