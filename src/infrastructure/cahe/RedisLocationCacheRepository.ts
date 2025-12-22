import { redisClient } from "./redisClient";
import { Location } from "../../domain/entities/Location";
import { LocationCacheRepository } from "../../domain/interfaces/LocationCacheRepository";

const CACHE_KEY = "locations:all";
const TTL_SECONDS = 60 * 60; // 1 hora

export class RedisLocationCacheRepository
  implements LocationCacheRepository {

  async getAll(): Promise<Location[] | null> {
    const cached = await redisClient.get(CACHE_KEY);

    if (!cached) return null;

    return JSON.parse(cached);
  }

  async save(locations: Location[]): Promise<void> {
    await redisClient.set(
      CACHE_KEY,
      JSON.stringify(locations),
      { EX: TTL_SECONDS }
    );
  }
}
