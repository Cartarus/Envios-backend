import { Location } from "../../domain/entities/Location";
import { LocationRepository } from "../../domain/interfaces/LocationRepository";
import { NotFoundError } from "../../shared/errors/AppError";

export class GetLocations {
    constructor(private locationRepository: LocationRepository) {}

    async execute(): Promise<Location[]> {
        const locations = await this.locationRepository.findAll();
        if (!locations || locations.length === 0) {
            throw new NotFoundError("No locations found");
        }
        return locations;
    }
}