export interface Rate {
  id: string
  originId: string
  destinationId: string
  minWeight: number
  maxWeight: number
  price: number
}
