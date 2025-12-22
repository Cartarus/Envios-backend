import { GetLocations } from "../../use-cases/location/GetLocations";
import { NotFoundError } from "../../shared/errors/AppError";
import { PostgresLocationRepository } from "../../infrastructure/repositories/PostgresLocationRepository";
import { pool } from "../setup";

describe("Location Use Cases", () => {
  let locationRepository: PostgresLocationRepository;

  beforeEach(() => {
    locationRepository = new PostgresLocationRepository(pool);
  });

  describe("GetLocations", () => {
    let getLocations: GetLocations;

    beforeEach(() => {
      getLocations = new GetLocations(locationRepository);
    });

    it("debería obtener todas las ubicaciones disponibles", async () => {
      // Insertar ubicaciones de prueba en la base de datos
      await pool.query(
        "INSERT INTO locations (id, code, name) VALUES ($1, $2, $3)",
        ["1", "MX-CDMX", "Ciudad de México"]
      );
      await pool.query(
        "INSERT INTO locations (id, code, name) VALUES ($1, $2, $3)",
        ["2", "MX-GDL", "Guadalajara"]
      );
      await pool.query(
        "INSERT INTO locations (id, code, name) VALUES ($1, $2, $3)",
        ["3", "MX-MTY", "Monterrey"]
      );

      const locations = await getLocations.execute();

      expect(locations).toBeDefined();
      expect(locations.length).toBe(3);
      expect(locations[0].code).toBe("MX-CDMX");
      expect(locations[1].code).toBe("MX-GDL");
      expect(locations[2].code).toBe("MX-MTY");
    });

    it("debería retornar todas las ubicaciones con sus propiedades correctas", async () => {
      await pool.query(
        "INSERT INTO locations (id, code, name) VALUES ($1, $2, $3)",
        ["loc-001", "MX-PUE", "Puebla"]
      );

      const locations = await getLocations.execute();

      expect(locations.length).toBe(1);
      expect(locations[0]).toHaveProperty("id");
      expect(locations[0]).toHaveProperty("code");
      expect(locations[0]).toHaveProperty("name");
      expect(locations[0].id).toBe("loc-001");
      expect(locations[0].code).toBe("MX-PUE");
      expect(locations[0].name).toBe("Puebla");
    });

    it("debería lanzar NotFoundError si no hay ubicaciones disponibles", async () => {
      // La tabla está vacía por el afterEach

      await expect(getLocations.execute()).rejects.toThrow(
        "No locations found"
      );

      try {
        await getLocations.execute();
        fail("Debería haber lanzado un error");
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundError);
        expect((error as NotFoundError).statusCode).toBe(404);
        expect((error as NotFoundError).message).toBe("No locations found");
      }
    });

    it("debería manejar múltiples ubicaciones correctamente", async () => {
      const multipleLocations = [
        { id: "1", code: "MX-TIJ", name: "Tijuana" },
        { id: "2", code: "MX-CUN", name: "Cancún" },
        { id: "3", code: "MX-QRO", name: "Querétaro" },
        { id: "4", code: "MX-MER", name: "Mérida" },
        { id: "5", code: "MX-AGS", name: "Aguascalientes" },
      ];

      for (const loc of multipleLocations) {
        await pool.query(
          "INSERT INTO locations (id, code, name) VALUES ($1, $2, $3)",
          [loc.id, loc.code, loc.name]
        );
      }

      const locations = await getLocations.execute();

      expect(locations.length).toBe(5);
      expect(locations.map(l => l.code)).toEqual(["MX-TIJ", "MX-CUN", "MX-QRO", "MX-MER", "MX-AGS"]);
    });

    it("debería retornar ubicaciones en el orden en que fueron almacenadas", async () => {
      await pool.query(
        "INSERT INTO locations (id, code, name) VALUES ($1, $2, $3)",
        ["1", "MX-OAX", "Oaxaca"]
      );
      await pool.query(
        "INSERT INTO locations (id, code, name) VALUES ($1, $2, $3)",
        ["2", "MX-VER", "Veracruz"]
      );
      await pool.query(
        "INSERT INTO locations (id, code, name) VALUES ($1, $2, $3)",
        ["3", "MX-CHI", "Chihuahua"]
      );

      const locations = await getLocations.execute();

      expect(locations[0].code).toBe("MX-OAX");
      expect(locations[1].code).toBe("MX-VER");
      expect(locations[2].code).toBe("MX-CHI");
    });

    it("debería manejar ubicaciones con diferentes formatos de código", async () => {
      const locationsWithDifferentCodes = [
        { id: "1", code: "US-NYC", name: "New York" },
        { id: "2", code: "CA-TOR", name: "Toronto" },
        { id: "3", code: "MX-CDMX", name: "Ciudad de México" },
        { id: "4", code: "ES-MAD", name: "Madrid" },
      ];

      for (const loc of locationsWithDifferentCodes) {
        await pool.query(
          "INSERT INTO locations (id, code, name) VALUES ($1, $2, $3)",
          [loc.id, loc.code, loc.name]
        );
      }

      const locations = await getLocations.execute();

      expect(locations.length).toBe(4);
      locations.forEach((location) => {
        expect(location.code).toMatch(/^[A-Z]{2}-[A-Z]{3,4}$/);
      });
    });

    it("debería permitir obtener ubicaciones después de limpiar la base de datos", async () => {
      // Primera carga de ubicaciones
      await pool.query(
        "INSERT INTO locations (id, code, name) VALUES ($1, $2, $3)",
        ["1", "MX-CDMX", "Ciudad de México"]
      );

      let locations = await getLocations.execute();
      expect(locations.length).toBe(1);

      // Limpiar la base de datos
      await pool.query("DELETE FROM locations");

      // Verificar que no hay ubicaciones
      await expect(getLocations.execute()).rejects.toThrow("No locations found");

      // Agregar nuevas ubicaciones
      await pool.query(
        "INSERT INTO locations (id, code, name) VALUES ($1, $2, $3)",
        ["2", "MX-GDL", "Guadalajara"]
      );

      locations = await getLocations.execute();
      expect(locations.length).toBe(1);
      expect(locations[0].code).toBe("MX-GDL");
    });

    it("debería validar que todas las ubicaciones tienen propiedades requeridas", async () => {
      await pool.query(
        "INSERT INTO locations (id, code, name) VALUES ($1, $2, $3)",
        ["1", "MX-MTY", "Monterrey"]
      );
      await pool.query(
        "INSERT INTO locations (id, code, name) VALUES ($1, $2, $3)",
        ["2", "MX-TIJ", "Tijuana"]
      );

      const locations = await getLocations.execute();

      locations.forEach((location) => {
        expect(location.id).toBeDefined();
        expect(location.code).toBeDefined();
        expect(location.name).toBeDefined();
        expect(typeof location.id).toBe("string");
        expect(typeof location.code).toBe("string");
        expect(typeof location.name).toBe("string");
        expect(location.id.length).toBeGreaterThan(0);
        expect(location.code.length).toBeGreaterThan(0);
        expect(location.name.length).toBeGreaterThan(0);
      });
    });
  });
});
