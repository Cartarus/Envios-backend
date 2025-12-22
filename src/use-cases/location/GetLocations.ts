import { Location } from "../../domain/entities/Location";
import { LocationRepository } from "../../domain/interfaces/LocationRepository";
import { LocationCacheRepository } from "../../domain/interfaces/LocationCacheRepository";
import { NotFoundError } from "../../shared/errors/AppError";

export class GetLocations {
  constructor(
    private locationRepository: LocationRepository,
    private locationCacheRepository: LocationCacheRepository
  ) {}

  async execute(): Promise<Location[]> {
    const cachedLocations = await this.locationCacheRepository.getAll();
    if (cachedLocations && cachedLocations.length > 0) {
      console.log("Returning cached locations");
      return cachedLocations;
    }
    console.log("Returning Locations from DB")
    const locations = await this.locationRepository.findAll();
    if (!locations || locations.length === 0) {
      throw new NotFoundError("No locations found");
    }

    await this.locationCacheRepository.save(locations);

    return locations;
  }
}
