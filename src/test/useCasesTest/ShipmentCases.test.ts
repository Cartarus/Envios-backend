import { CreateShipment } from "../../use-cases/shipment/CreateShipment";
import { GetShipmentById } from "../../use-cases/shipment/GetShipmentById";
import { ListUserShipments } from "../../use-cases/shipment/listUserShipments";
import { ValidationError } from "../../shared/errors/AppError";
import { PostgresShipmentRepository } from "../../infrastructure/repositories/PostgresShipmentRepository";
import { PostgresUserRepository } from "../../infrastructure/repositories/PostgresUserRepository";
import { PostgresLocationRepository } from "../../infrastructure/repositories/PostgresLocationRepository";
import { RegisterUser } from "../../use-cases/user/RegisterUser";
import { pool, seedData } from "../setup";

describe("Shipment Use Cases", () => {
  let shipmentRepository: PostgresShipmentRepository;
  let userRepository: PostgresUserRepository;
  let locationRepository: PostgresLocationRepository;
  let registerUser: RegisterUser;

  let testUserId: string;
  let testOriginId: string;
  let testDestinationId: string;

  beforeEach(async () => {
    shipmentRepository = new PostgresShipmentRepository(pool);
    userRepository = new PostgresUserRepository(pool);
    locationRepository = new PostgresLocationRepository(pool);
    registerUser = new RegisterUser(userRepository);

    // Cargar datos seed (ubicaciones)
    await seedData(pool);

    // Crear un usuario de prueba
    const user = await registerUser.execute({
      name: "Test User",
      email: `test-shipment-${Date.now()}@example.com`,
      password: "password123",
    });
    testUserId = user.id;

    // Obtener ubicaciones de prueba
    const locations = await locationRepository.findAll();
    if (locations.length >= 2) {
      testOriginId = locations[0].id;
      testDestinationId = locations[1].id;
    }
  });

  describe("CreateShipment", () => {
    let createShipment: CreateShipment;

    beforeEach(() => {
      createShipment = new CreateShipment(shipmentRepository);
    });

    it("debería crear un nuevo envío correctamente", async () => {
      const shipmentData = {
        userId: testUserId,
        originId: testOriginId,
        destinationId: testDestinationId,
        weight: 5,
        height: 20,
        width: 30,
        length: 40,
        price: 150,
      };

      const shipment = await createShipment.execute(shipmentData);

      expect(shipment).toBeDefined();
      expect(shipment.id).toBeDefined();
      expect(shipment.userId).toBe(shipmentData.userId);
      expect(shipment.originId).toBe(shipmentData.originId);
      expect(shipment.destinationId).toBe(shipmentData.destinationId);
      expect(shipment.weight).toBe(shipmentData.weight);
      expect(shipment.height).toBe(shipmentData.height);
      expect(shipment.width).toBe(shipmentData.width);
      expect(shipment.length).toBe(shipmentData.length);
      expect(shipment.price).toBe(shipmentData.price);
      expect(shipment.createdAt).toBeDefined();
    });

    it("debería almacenar el envío en el repositorio", async () => {
      const shipmentData = {
        userId: testUserId,
        originId: testOriginId,
        destinationId: testDestinationId,
        weight: 3,
        height: 15,
        width: 25,
        length: 35,
        price: 100,
      };

      const shipment = await createShipment.execute(shipmentData);
      const storedShipment = await shipmentRepository.findById(shipment.id);
      expect(storedShipment).toBeDefined();
      expect(storedShipment?.userId).toBe(shipmentData.userId);
      expect(storedShipment?.price).toBe(shipmentData.price);
    });

    it("debería lanzar ValidationError si el precio es cero o negativo", async () => {
      const invalidShipmentData = {
        userId: testUserId,
        originId: testOriginId,
        destinationId: testDestinationId,
        weight: 5,
        height: 20,
        width: 30,
        length: 40,
        price: 0,
      };

      await expect(createShipment.execute(invalidShipmentData)).rejects.toThrow(
        "Precio inválido para el envío"
      );

      try {
        await createShipment.execute(invalidShipmentData);
        fail("Debería haber lanzado un error");
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).statusCode).toBe(400);
      }
    });

    it("debería lanzar ValidationError si el precio es negativo", async () => {
      const invalidShipmentData = {
        userId: testUserId,
        originId: testOriginId,
        destinationId: testDestinationId,
        weight: 5,
        height: 20,
        width: 30,
        length: 40,
        price: -50,
      };

      await expect(createShipment.execute(invalidShipmentData)).rejects.toThrow(
        "Precio inválido para el envío"
      );
    });

    it("debería crear múltiples envíos para el mismo usuario", async () => {
      const shipmentData1 = {
        userId: testUserId,
        originId: testOriginId,
        destinationId: testDestinationId,
        weight: 2,
        height: 10,
        width: 20,
        length: 30,
        price: 75,
      };

      const shipmentData2 = {
        userId: testUserId,
        originId: testOriginId,
        destinationId: testDestinationId,
        weight: 4,
        height: 15,
        width: 25,
        length: 35,
        price: 120,
      };

      const shipment1 = await createShipment.execute(shipmentData1);
      const shipment2 = await createShipment.execute(shipmentData2);

      expect(shipment1.id).not.toBe(shipment2.id);
      expect(shipment1.userId).toBe(shipment2.userId);
    });
    
  });

  describe("GetShipmentById", () => {
    let getShipmentById: GetShipmentById;
    let createShipment: CreateShipment;
    let testShipmentId: string;

    beforeEach(async () => {
      createShipment = new CreateShipment(shipmentRepository);
      getShipmentById = new GetShipmentById(shipmentRepository);

      // Crear un envío de prueba
      const shipment = await createShipment.execute({
        userId: testUserId,
        originId: testOriginId,
        destinationId: testDestinationId,
        weight: 5,
        height: 20,
        width: 30,
        length: 40,
        price: 150,
      });
      testShipmentId = shipment.id;
    });

    it("debería obtener un envío por su ID", async () => {
      const shipment = await getShipmentById.execute(testShipmentId);

      expect(shipment).toBeDefined();
      expect(shipment?.id).toBe(testShipmentId);
      expect(shipment?.userId).toBe(testUserId);
    });
    it("debería devolver null si el envío no existe", async () => {
      const nonExistentId = "99999999-9999-9999-9999-999999999999";
      const shipment = await getShipmentById.execute(nonExistentId);
      expect(shipment).toBeUndefined();
    });

    it("debería devolver un envío con todas sus propiedades", async () => {
      const shipment = await getShipmentById.execute(testShipmentId);

      expect(shipment).toBeDefined();
      expect(shipment?.id).toBeDefined();
      expect(shipment?.userId).toBeDefined();
      expect(shipment?.originId).toBeDefined();
      expect(shipment?.destinationId).toBeDefined();
      expect(shipment?.weight).toBeDefined();
      expect(shipment?.height).toBeDefined();
      expect(shipment?.width).toBeDefined();
      expect(shipment?.length).toBeDefined();
      expect(shipment?.price).toBeDefined();
      expect(shipment?.createdAt).toBeDefined();
    });
    
  });

});
