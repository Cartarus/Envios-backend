import { Location } from "../entities/Location";

export interface LocationRepository {
  findAll(): Promise<Location[]>
}