import { GetRate, QuoteInput } from "../../use-cases/quote/GetRate";
import { NotFoundError } from "../../shared/errors/AppError";
import { PostgresRateRepository } from "../../infrastructure/repositories/PostgresRateRepository";
import { pool } from "../setup";

describe("Quote Use Cases", () => {
  let rateRepository: PostgresRateRepository;

  beforeEach(async () => {
    rateRepository = new PostgresRateRepository(pool);

    // Insertar ubicaciones de prueba
    await pool.query(
      "INSERT INTO locations (id, code, name) VALUES ($1, $2, $3)",
      ["loc-1", "MX-CDMX", "Ciudad de México"]
    );
    await pool.query(
      "INSERT INTO locations (id, code, name) VALUES ($1, $2, $3)",
      ["loc-2", "MX-GDL", "Guadalajara"]
    );
    await pool.query(
      "INSERT INTO locations (id, code, name) VALUES ($1, $2, $3)",
      ["loc-3", "MX-MTY", "Monterrey"]
    );
  });

  describe("GetRate", () => {
    let getRate: GetRate;

    beforeEach(() => {
      getRate = new GetRate(rateRepository);
    });

    it("debería calcular una cotización usando peso real cuando es mayor", async () => {
      // Insertar tarifa de prueba
      await pool.query(
        "INSERT INTO rates (id, origin_id, destination_id, min_weight, max_weight, price) VALUES ($1, $2, $3, $4, $5, $6)",
        ["rate-1", "loc-1", "loc-2", 0, 10, 150.00]
      );

      const quoteInput: QuoteInput = {
        origin: "MX-CDMX",
        destination: "MX-GDL",
        weight: 8, // Peso real
        height: 10,
        width: 10,
        length: 10, // Peso volumétrico = (10*10*10)/2500 = 4 kg
      };

      const quote = await getRate.execute(quoteInput);

      expect(quote).toBeDefined();
      expect(quote.origin).toBe("MX-CDMX");
      expect(quote.destination).toBe("MX-GDL");
      expect(quote.weightUsed).toBe(8); // Usa el peso real (mayor)
      expect(quote.price).toBe(150.00);
    });

    it("debería calcular una cotización usando peso volumétrico cuando es mayor", async () => {
      await pool.query(
        "INSERT INTO rates (id, origin_id, destination_id, min_weight, max_weight, price) VALUES ($1, $2, $3, $4, $5, $6)",
        ["rate-2", "loc-1", "loc-2", 0, 20, 250.00]
      );

      const quoteInput: QuoteInput = {
        origin: "MX-CDMX",
        destination: "MX-GDL",
        weight: 5, // Peso real
        height: 30,
        width: 30,
        length: 30, // Peso volumétrico = (30*30*30)/2500 = 10.8 -> ceil = 11 kg
      };

      const quote = await getRate.execute(quoteInput);

      expect(quote).toBeDefined();
      expect(quote.weightUsed).toBe(11); // Usa el peso volumétrico redondeado (mayor)
      expect(quote.price).toBe(250.00);
    });

    it("debería lanzar NotFoundError cuando no existe tarifa para la ruta", async () => {
      const quoteInput: QuoteInput = {
        origin: "MX-CDMX",
        destination: "MX-MTY",
        weight: 5,
        height: 10,
        width: 10,
        length: 10,
      };

      await expect(getRate.execute(quoteInput)).rejects.toThrow(
        "No existe tarifa para los datos enviados"
      );

      try {
        await getRate.execute(quoteInput);
        fail("Debería haber lanzado un error");
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundError);
        expect((error as NotFoundError).statusCode).toBe(404);
      }
    });

    it("debería lanzar NotFoundError cuando el peso está fuera del rango de la tarifa", async () => {
      await pool.query(
        "INSERT INTO rates (id, origin_id, destination_id, min_weight, max_weight, price) VALUES ($1, $2, $3, $4, $5, $6)",
        ["rate-3", "loc-1", "loc-2", 0, 10, 150.00]
      );

      const quoteInput: QuoteInput = {
        origin: "MX-CDMX",
        destination: "MX-GDL",
        weight: 15, // Peso fuera del rango (max es 10)
        height: 10,
        width: 10,
        length: 10,
      };

      await expect(getRate.execute(quoteInput)).rejects.toThrow(
        "No existe tarifa para los datos enviados"
      );
    });

    it("debería encontrar la tarifa correcta para diferentes rangos de peso", async () => {
      // Insertar múltiples tarifas con diferentes rangos
      await pool.query(
        "INSERT INTO rates (id, origin_id, destination_id, min_weight, max_weight, price) VALUES ($1, $2, $3, $4, $5, $6)",
        ["rate-4", "loc-1", "loc-2", 0, 5, 100.00]
      );
      await pool.query(
        "INSERT INTO rates (id, origin_id, destination_id, min_weight, max_weight, price) VALUES ($1, $2, $3, $4, $5, $6)",
        ["rate-5", "loc-1", "loc-2", 6, 10, 180.00]
      );
      await pool.query(
        "INSERT INTO rates (id, origin_id, destination_id, min_weight, max_weight, price) VALUES ($1, $2, $3, $4, $5, $6)",
        ["rate-6", "loc-1", "loc-2", 11, 20, 300.00]
      );

      // Probar con peso en el primer rango
      const quote1 = await getRate.execute({
        origin: "MX-CDMX",
        destination: "MX-GDL",
        weight: 3,
        height: 10,
        width: 10,
        length: 10,
      });
      expect(quote1.price).toBe(100.00);
      expect(quote1.weightUsed).toBe(3); // Usa peso real (mayor que volumétrico)

      // Probar con peso en el segundo rango
      const quote2 = await getRate.execute({
        origin: "MX-CDMX",
        destination: "MX-GDL",
        weight: 8,
        height: 10,
        width: 10,
        length: 10,
      });
      expect(quote2.price).toBe(180.00);
      expect(quote2.weightUsed).toBe(8);

      // Probar con peso en el tercer rango
      const quote3 = await getRate.execute({
        origin: "MX-CDMX",
        destination: "MX-GDL",
        weight: 15,
        height: 10,
        width: 10,
        length: 10,
      });
      expect(quote3.price).toBe(300.00);
      expect(quote3.weightUsed).toBe(15);
    });

    it("debería calcular correctamente el peso volumétrico con diferentes dimensiones", async () => {
      await pool.query(
        "INSERT INTO rates (id, origin_id, destination_id, min_weight, max_weight, price) VALUES ($1, $2, $3, $4, $5, $6)",
        ["rate-7", "loc-1", "loc-2", 0, 50, 500.00]
      );

      // Caso 1: Paquete grande y ligero
      const quote1 = await getRate.execute({
        origin: "MX-CDMX",
        destination: "MX-GDL",
        weight: 1,
        height: 50,
        width: 50,
        length: 50, // Peso volumétrico = (50*50*50)/2500 = 50 kg
      });
      expect(quote1.weightUsed).toBe(50);

      // Caso 2: Paquete pequeño y pesado
      const quote2 = await getRate.execute({
        origin: "MX-CDMX",
        destination: "MX-GDL",
        weight: 30,
        height: 10,
        width: 10,
        length: 10, // Peso volumétrico = (10*10*10)/2500 = 4 kg
      });
      expect(quote2.weightUsed).toBe(30);

      // Caso 3: Dimensiones medianas
      const quote3 = await getRate.execute({
        origin: "MX-CDMX",
        destination: "MX-GDL",
        weight: 10,
        height: 25,
        width: 25,
        length: 40, // Peso volumétrico = (25*25*40)/2500 = 10 kg
      });
      expect(quote3.weightUsed).toBe(10); // Ambos pesos iguales, usa el mayor
    });

    it("debería redondear el peso volumétrico hacia arriba", async () => {
      await pool.query(
        "INSERT INTO rates (id, origin_id, destination_id, min_weight, max_weight, price) VALUES ($1, $2, $3, $4, $5, $6)",
        ["rate-8", "loc-1", "loc-2", 0, 10, 200.00]
      );

      const quoteInput: QuoteInput = {
        origin: "MX-CDMX",
        destination: "MX-GDL",
        weight: 1,
        height: 20,
        width: 20,
        length: 17, // Peso volumétrico = (20*20*17)/2500 = 2.72 -> ceil = 3 kg
      };

      const quote = await getRate.execute(quoteInput);

      expect(quote.weightUsed).toBe(3); // Redondeado hacia arriba
    });

    it("debería manejar diferentes rutas origen-destino", async () => {
      // Insertar tarifas para diferentes rutas
      await pool.query(
        "INSERT INTO rates (id, origin_id, destination_id, min_weight, max_weight, price) VALUES ($1, $2, $3, $4, $5, $6)",
        ["rate-9", "loc-1", "loc-2", 0, 10, 150.00]
      );
      await pool.query(
        "INSERT INTO rates (id, origin_id, destination_id, min_weight, max_weight, price) VALUES ($1, $2, $3, $4, $5, $6)",
        ["rate-10", "loc-1", "loc-3", 0, 10, 200.00]
      );
      await pool.query(
        "INSERT INTO rates (id, origin_id, destination_id, min_weight, max_weight, price) VALUES ($1, $2, $3, $4, $5, $6)",
        ["rate-11", "loc-2", "loc-3", 0, 10, 180.00]
      );

      const baseInput = {
        weight: 5,
        height: 10,
        width: 10,
        length: 10,
      };

      // Ruta 1: CDMX -> GDL
      const quote1 = await getRate.execute({
        ...baseInput,
        origin: "MX-CDMX",
        destination: "MX-GDL",
      });
      expect(quote1.price).toBe(150.00);
      expect(quote1.origin).toBe("MX-CDMX");
      expect(quote1.destination).toBe("MX-GDL");

      // Ruta 2: CDMX -> MTY
      const quote2 = await getRate.execute({
        ...baseInput,
        origin: "MX-CDMX",
        destination: "MX-MTY",
      });
      expect(quote2.price).toBe(200.00);
      expect(quote2.origin).toBe("MX-CDMX");
      expect(quote2.destination).toBe("MX-MTY");

      // Ruta 3: GDL -> MTY
      const quote3 = await getRate.execute({
        ...baseInput,
        origin: "MX-GDL",
        destination: "MX-MTY",
      });
      expect(quote3.price).toBe(180.00);
      expect(quote3.origin).toBe("MX-GDL");
      expect(quote3.destination).toBe("MX-MTY");
    });

    it("debería retornar el objeto de cotización con todas las propiedades requeridas", async () => {
      await pool.query(
        "INSERT INTO rates (id, origin_id, destination_id, min_weight, max_weight, price) VALUES ($1, $2, $3, $4, $5, $6)",
        ["rate-12", "loc-1", "loc-2", 0, 10, 175.50]
      );

      const quoteInput: QuoteInput = {
        origin: "MX-CDMX",
        destination: "MX-GDL",
        weight: 7,
        height: 15,
        width: 15,
        length: 15,
      };

      const quote = await getRate.execute(quoteInput);

      expect(quote).toHaveProperty("origin");
      expect(quote).toHaveProperty("destination");
      expect(quote).toHaveProperty("weightUsed");
      expect(quote).toHaveProperty("price");
      expect(typeof quote.origin).toBe("string");
      expect(typeof quote.destination).toBe("string");
      expect(typeof quote.weightUsed).toBe("number");
      expect(typeof quote.price).toBe("number");
      expect(quote.weightUsed).toBeGreaterThan(0);
      expect(quote.price).toBeGreaterThan(0);
    });

    it("debería manejar peso mínimo (peso 0 kg con dimensiones mínimas)", async () => {
      await pool.query(
        "INSERT INTO rates (id, origin_id, destination_id, min_weight, max_weight, price) VALUES ($1, $2, $3, $4, $5, $6)",
        ["rate-13", "loc-1", "loc-2", 0, 5, 100.00]
      );

      const quoteInput: QuoteInput = {
        origin: "MX-CDMX",
        destination: "MX-GDL",
        weight: 0,
        height: 5,
        width: 5,
        length: 5, // Peso volumétrico = (5*5*5)/2500 = 0.05 -> ceil = 1 kg
      };

      const quote = await getRate.execute(quoteInput);

      expect(quote.weightUsed).toBe(1); // Peso volumétrico redondeado
      expect(quote.price).toBe(100.00);
    });

    it("debería usar el límite exacto del rango de peso", async () => {
      await pool.query(
        "INSERT INTO rates (id, origin_id, destination_id, min_weight, max_weight, price) VALUES ($1, $2, $3, $4, $5, $6)",
        ["rate-14", "loc-1", "loc-2", 5, 10, 150.00]
      );

      // Probar con peso exactamente en el mínimo
      const quote1 = await getRate.execute({
        origin: "MX-CDMX",
        destination: "MX-GDL",
        weight: 5,
        height: 10,
        width: 10,
        length: 10,
      });
      expect(quote1.price).toBe(150.00);

      // Probar con peso exactamente en el máximo
      const quote2 = await getRate.execute({
        origin: "MX-CDMX",
        destination: "MX-GDL",
        weight: 10,
        height: 10,
        width: 10,
        length: 10,
      });
      expect(quote2.price).toBe(150.00);
    });
  });
});
