import { Location } from "../entities/Location";

export interface LocationCacheRepository {
  getAll(): Promise<Location[] | null>;
  save(locations: Location[]): Promise<void>;
}
