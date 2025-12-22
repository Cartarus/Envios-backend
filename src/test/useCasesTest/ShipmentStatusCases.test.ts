import { AddShipmentStatus } from "../../use-cases/shipmentStatus/AddShipmentStatus";
import { GetShipmentTracking } from "../../use-cases/shipmentStatus/GetShipmentTracking";
import { ShipmentStatus } from "../../domain/entities/ShimpentStatus";
import { NotFoundError } from "../../shared/errors/AppError";
import { PostgresShipmentStatusHistory } from "../../infrastructure/repositories/PostgresShipmentStatusHistory";
import { PostgresShipmentRepository } from "../../infrastructure/repositories/PostgresShipmentRepository";
import { PostgresLocationRepository } from "../../infrastructure/repositories/PostgresLocationRepository";
import { PostgresUserRepository } from "../../infrastructure/repositories/PostgresUserRepository";
import { RegisterUser } from "../../use-cases/user/RegisterUser";
import { CreateShipment } from "../../use-cases/shipment/CreateShipment";
import { pool, seedData } from "../setup";
import { v4 as uuid } from "uuid";

describe("ShipmentStatus Use Cases", () => {
  let statusHistoryRepository: PostgresShipmentStatusHistory;
  let shipmentRepository: PostgresShipmentRepository;
  let locationRepository: PostgresLocationRepository;
  let userRepository: PostgresUserRepository;
  let registerUser: RegisterUser;
  let createShipment: CreateShipment;

  let testUserId: string;
  let testShipmentId: string;
  let testOriginId: string;
  let testDestinationId: string;

  beforeEach(async () => {
    statusHistoryRepository = new PostgresShipmentStatusHistory(pool);
    shipmentRepository = new PostgresShipmentRepository(pool);
    locationRepository = new PostgresLocationRepository(pool);
    userRepository = new PostgresUserRepository(pool);
    registerUser = new RegisterUser(userRepository);
    createShipment = new CreateShipment(shipmentRepository);

    // Cargar datos seed (ubicaciones)
    await seedData(pool);

    // Crear un usuario de prueba
    const user = await registerUser.execute({
      name: "Test User Status",
      email: `test-status-${Date.now()}@example.com`,
      password: "password123",
    });
    testUserId = user.id;

    // Obtener ubicaciones de prueba
    const locations = await locationRepository.findAll();
    if (locations.length >= 2) {
      testOriginId = locations[0].id;
      testDestinationId = locations[1].id;
    }

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

  describe("AddShipmentStatus", () => {
    let addShipmentStatus: AddShipmentStatus;

    beforeEach(() => {
      addShipmentStatus = new AddShipmentStatus(
        statusHistoryRepository,
        shipmentRepository,
        locationRepository
      );
    });

    it("debería agregar un estado PENDING correctamente", async () => {
      await addShipmentStatus.execute(
        testShipmentId,
        ShipmentStatus.PENDING,
        testOriginId
      );

      const tracking = await statusHistoryRepository.findByShipmentId(testShipmentId);
      expect(tracking).toBeDefined();
      expect(tracking.length).toBeGreaterThan(0);
      expect(tracking[0].status).toBe(ShipmentStatus.PENDING);
      expect(tracking[0].shipmentId).toBe(testShipmentId);
    });

    it("debería agregar un estado IN_TRANSIT correctamente", async () => {
      const locations = await locationRepository.findAll();
      const transitLocation = locations.length > 2 ? locations[2].id : testOriginId;

      await addShipmentStatus.execute(
        testShipmentId,
        ShipmentStatus.IN_TRANSIT,
        transitLocation
      );

      const tracking = await statusHistoryRepository.findByShipmentId(testShipmentId);
      expect(tracking).toBeDefined();
      expect(tracking.length).toBeGreaterThan(0);
      
      const lastStatus = tracking[tracking.length - 1];
      expect(lastStatus.status).toBe(ShipmentStatus.IN_TRANSIT);
      expect(lastStatus.locationId).toBe(transitLocation);
    });

    it("debería agregar un estado DELIVERED correctamente", async () => {
      await addShipmentStatus.execute(
        testShipmentId,
        ShipmentStatus.DELIVERED,
        testDestinationId
      );

      const tracking = await statusHistoryRepository.findByShipmentId(testShipmentId);
      expect(tracking).toBeDefined();
      expect(tracking.length).toBeGreaterThan(0);
      
      const lastStatus = tracking[tracking.length - 1];
      expect(lastStatus.status).toBe(ShipmentStatus.DELIVERED);
      expect(lastStatus.shipmentId).toBe(testShipmentId);
    });

    it("debería establecer locationId al origen cuando el estado es PENDING", async () => {
      await addShipmentStatus.execute(
        testShipmentId,
        ShipmentStatus.PENDING,
        "cualquier-id" // Este ID será ignorado
      );

      const tracking = await statusHistoryRepository.findByShipmentId(testShipmentId);
      const pendingStatus = tracking.find(t => t.status === ShipmentStatus.PENDING);
      
      expect(pendingStatus).toBeDefined();
      expect(pendingStatus?.locationId).toBe(testOriginId);
    });

    it("debería establecer locationId al destino cuando el estado es DELIVERED", async () => {
      await addShipmentStatus.execute(
        testShipmentId,
        ShipmentStatus.DELIVERED,
        "cualquier-id" // Este ID será ignorado
      );

      const tracking = await statusHistoryRepository.findByShipmentId(testShipmentId);
      const deliveredStatus = tracking.find(t => t.status === ShipmentStatus.DELIVERED);
      
      expect(deliveredStatus).toBeDefined();
      expect(deliveredStatus?.locationId).toBe(testDestinationId);
    });

    it("debería agregar múltiples estados para el mismo envío", async () => {
      const locations = await locationRepository.findAll();
      const transitLocation = locations.length > 2 ? locations[2].id : testOriginId;

      // Agregar estado PENDING
      await addShipmentStatus.execute(
        testShipmentId,
        ShipmentStatus.PENDING,
        testOriginId
      );

      // Agregar estado IN_TRANSIT
      await addShipmentStatus.execute(
        testShipmentId,
        ShipmentStatus.IN_TRANSIT,
        transitLocation
      );

      // Agregar estado DELIVERED
      await addShipmentStatus.execute(
        testShipmentId,
        ShipmentStatus.DELIVERED,
        testDestinationId
      );

      const tracking = await statusHistoryRepository.findByShipmentId(testShipmentId);
      expect(tracking.length).toBe(3);
      expect(tracking[0].status).toBe(ShipmentStatus.PENDING);
      expect(tracking[1].status).toBe(ShipmentStatus.IN_TRANSIT);
      expect(tracking[2].status).toBe(ShipmentStatus.DELIVERED);
    });

    it("debería lanzar NotFoundError si el envío no existe", async () => {
      const invalidShipmentId = uuid(); // UUID válido pero inexistente

      await expect(
        addShipmentStatus.execute(
          invalidShipmentId,
          ShipmentStatus.PENDING,
          testOriginId
        )
      ).rejects.toThrow(NotFoundError);

      await expect(
        addShipmentStatus.execute(
          invalidShipmentId,
          ShipmentStatus.PENDING,
          testOriginId
        )
      ).rejects.toThrow("Envío no encontrado");
    });

    it("debería tener createdAt definido en el historial de estado", async () => {
      await addShipmentStatus.execute(
        testShipmentId,
        ShipmentStatus.PENDING,
        testOriginId
      );

      const tracking = await statusHistoryRepository.findByShipmentId(testShipmentId);
      expect(tracking[0].createdAt).toBeDefined();
      expect(tracking[0].createdAt).toBeInstanceOf(Date);
    });
  });

  describe("GetShipmentTracking", () => {
    let getShipmentTracking: GetShipmentTracking;
    let addShipmentStatus: AddShipmentStatus;

    beforeEach(() => {
      getShipmentTracking = new GetShipmentTracking(statusHistoryRepository);
      addShipmentStatus = new AddShipmentStatus(
        statusHistoryRepository,
        shipmentRepository,
        locationRepository
      );
    });

    it("debería obtener el historial de seguimiento de un envío", async () => {
      // Agregar estados al envío
      await addShipmentStatus.execute(
        testShipmentId,
        ShipmentStatus.PENDING,
        testOriginId
      );

      const tracking = await getShipmentTracking.execute(testShipmentId);

      expect(tracking).toBeDefined();
      expect(Array.isArray(tracking)).toBe(true);
      expect(tracking.length).toBeGreaterThan(0);
      expect(tracking[0].shipmentId).toBe(testShipmentId);
    });

    it("debería obtener múltiples estados en orden cronológico", async () => {
      const locations = await locationRepository.findAll();
      const transitLocation = locations.length > 2 ? locations[2].id : testOriginId;

      // Agregar múltiples estados
      await addShipmentStatus.execute(
        testShipmentId,
        ShipmentStatus.PENDING,
        testOriginId
      );

      await addShipmentStatus.execute(
        testShipmentId,
        ShipmentStatus.IN_TRANSIT,
        transitLocation
      );

      await addShipmentStatus.execute(
        testShipmentId,
        ShipmentStatus.DELIVERED,
        testDestinationId
      );

      const tracking = await getShipmentTracking.execute(testShipmentId);

      expect(tracking.length).toBe(3);
      expect(tracking[0].status).toBe(ShipmentStatus.PENDING);
      expect(tracking[1].status).toBe(ShipmentStatus.IN_TRANSIT);
      expect(tracking[2].status).toBe(ShipmentStatus.DELIVERED);
      
      // Verificar que están ordenados cronológicamente
      expect(tracking[0].createdAt.getTime()).toBeLessThanOrEqual(
        tracking[1].createdAt.getTime()
      );
      expect(tracking[1].createdAt.getTime()).toBeLessThanOrEqual(
        tracking[2].createdAt.getTime()
      );
    });

    it("debería incluir toda la información del historial de estado", async () => {
      await addShipmentStatus.execute(
        testShipmentId,
        ShipmentStatus.PENDING,
        testOriginId
      );

      const tracking = await getShipmentTracking.execute(testShipmentId);

      expect(tracking[0]).toHaveProperty("id");
      expect(tracking[0]).toHaveProperty("shipmentId");
      expect(tracking[0]).toHaveProperty("status");
      expect(tracking[0]).toHaveProperty("locationId");
      expect(tracking[0]).toHaveProperty("createdAt");
    });

    it("debería lanzar NotFoundError si el envío no tiene historial", async () => {
      const shipmentWithoutHistory = await createShipment.execute({
        userId: testUserId,
        originId: testOriginId,
        destinationId: testDestinationId,
        weight: 3,
        height: 15,
        width: 25,
        length: 35,
        price: 100,
      });

      await expect(
        getShipmentTracking.execute(shipmentWithoutHistory.id)
      ).rejects.toThrow(NotFoundError);

      await expect(
        getShipmentTracking.execute(shipmentWithoutHistory.id)
      ).rejects.toThrow("No se encontró historial de seguimiento para este envío");
    });

    it("debería lanzar NotFoundError para un envío inexistente", async () => {
      const nonExistentShipmentId = uuid(); // UUID válido pero inexistente

      await expect(
        getShipmentTracking.execute(nonExistentShipmentId)
      ).rejects.toThrow(NotFoundError);
    });

    it("debería devolver el historial completo para envíos con múltiples actualizaciones", async () => {
      // Crear un segundo envío y agregar estados
      const shipment2 = await createShipment.execute({
        userId: testUserId,
        originId: testOriginId,
        destinationId: testDestinationId,
        weight: 2,
        height: 10,
        width: 20,
        length: 30,
        price: 80,
      });

      // Agregar estados al primer envío
      await addShipmentStatus.execute(
        testShipmentId,
        ShipmentStatus.PENDING,
        testOriginId
      );
      await addShipmentStatus.execute(
        testShipmentId,
        ShipmentStatus.DELIVERED,
        testDestinationId
      );

      // Agregar estados al segundo envío
      await addShipmentStatus.execute(
        shipment2.id,
        ShipmentStatus.PENDING,
        testOriginId
      );

      // Verificar que cada envío tiene su propio historial
      const tracking1 = await getShipmentTracking.execute(testShipmentId);
      const tracking2 = await getShipmentTracking.execute(shipment2.id);

      expect(tracking1.length).toBe(2);
      expect(tracking2.length).toBe(1);
      expect(tracking1.every(t => t.shipmentId === testShipmentId)).toBe(true);
      expect(tracking2.every(t => t.shipmentId === shipment2.id)).toBe(true);
    });
  });
});
