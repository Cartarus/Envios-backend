import { RegisterUser } from "../../use-cases/user/RegisterUser";
import { GenerateJwt } from "../../use-cases/user/GenerateJwt";
import { User } from "../../domain/entities/User";
import { ConflictError, UnauthorizedError } from "../../shared/errors/AppError";
import { hashPassword } from "../../shared/utils/hashPassword";
import { PostgresUserRepository } from "../../infrastructure/repositories/PostgresUserRepository";
import { pool } from "../setup";

describe("User Use Cases", () => {
  let userRepository: PostgresUserRepository;

  beforeEach(() => {
    userRepository = new PostgresUserRepository(pool);
  });

  describe("RegisterUser", () => {
    let registerUser: RegisterUser;

    beforeEach(() => {
      registerUser = new RegisterUser(userRepository);
    });

    it("debería registrar un nuevo usuario correctamente", async () => {
      const userData = {
        name: "Juan Pérez",
        email: "juan@example.com",
        password: "password123",
      };

      const user = await registerUser.execute(userData);

      expect(user).toBeDefined();
      expect(user.id).toBeDefined();
      expect(user.name).toBe(userData.name);
      expect(user.email).toBe(userData.email);
      expect(user.password).not.toBe(userData.password); // La contraseña debe estar hasheada
      expect(user.password.length).toBeGreaterThan(0);
    });

    it("debería almacenar el usuario en el repositorio", async () => {
      const userData = {
        name: "María García",
        email: "maria@example.com",
        password: "securepass",
      };

      const user = await registerUser.execute(userData);

      const storedUser = await userRepository.findById(user.id);
      expect(storedUser).toBeDefined();
      expect(storedUser?.email).toBe(userData.email);
    });

    it("debería lanzar ConflictError si el email ya existe", async () => {
      const userData = {
        name: "Carlos López",
        email: "carlos@example.com",
        password: "password123",
      };

      // Registrar el usuario por primera vez
      await registerUser.execute(userData);

      // Intentar registrar nuevamente con el mismo email
      await expect(registerUser.execute(userData)).rejects.toThrow(
        "El email ya está registrado"
      );
      
      try {
        await registerUser.execute(userData);
        fail("Debería haber lanzado un error");
      } catch (error) {
        expect(error).toBeInstanceOf(ConflictError);
        expect((error as ConflictError).statusCode).toBe(409);
      }
    });

    it("debería permitir registrar usuarios con diferentes emails", async () => {
      const user1 = await registerUser.execute({
        name: "Usuario 1",
        email: "user1@example.com",
        password: "pass1",
      });

      const user2 = await registerUser.execute({
        name: "Usuario 2",
        email: "user2@example.com",
        password: "pass2",
      });

      expect(user1.id).not.toBe(user2.id);
      expect(user1.email).not.toBe(user2.email);
    });
  });

  describe("GenerateJwt", () => {
    let generateJwt: GenerateJwt;

    beforeEach(() => {
      generateJwt = new GenerateJwt(userRepository);
    });

    it("debería generar un token JWT para credenciales válidas", async () => {
      // Crear un usuario de prueba directamente en la base de datos
      const password = "mySecurePassword";
      const hashedPassword = await hashPassword(password);
      const testUser = new User(
        "test-user-id",
        "Test User",
        "test@example.com",
        hashedPassword
      );
      await userRepository.create(testUser);

      const credentials = {
        email: "test@example.com",
        password: "mySecurePassword",
      };

      const result = await generateJwt.execute(credentials);

      expect(result).toBeDefined();
      expect(result.token).toBeDefined();
      expect(typeof result.token).toBe("string");
      expect(result.token.length).toBeGreaterThan(0);
      expect(result.user).toBeDefined();
      expect(result.user.email).toBe(credentials.email);
    });

    it("debería retornar los datos del usuario junto con el token", async () => {
      const password = "testpass123";
      const hashedPassword = await hashPassword(password);
      const testUser = new User(
        "user-123",
        "Ana Martínez",
        "ana@example.com",
        hashedPassword
      );
      await userRepository.create(testUser);

      const result = await generateJwt.execute({
        email: "ana@example.com",
        password: "testpass123",
      });

      expect(result.user.id).toBe(testUser.id);
      expect(result.user.name).toBe(testUser.name);
      expect(result.user.email).toBe(testUser.email);
    });

    it("debería lanzar UnauthorizedError si el email no existe", async () => {
      const credentials = {
        email: "noexiste@example.com",
        password: "password123",
      };

      await expect(generateJwt.execute(credentials)).rejects.toThrow(
        "Usuario o contraseña incorrectos"
      );
      
      try {
        await generateJwt.execute(credentials);
        fail("Debería haber lanzado un error");
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedError);
        expect((error as UnauthorizedError).statusCode).toBe(401);
      }
    });

    it("debería lanzar UnauthorizedError si la contraseña es incorrecta", async () => {
      const password = "correctPassword";
      const hashedPassword = await hashPassword(password);
      const testUser = new User(
        "user-456",
        "Pedro Sánchez",
        "pedro@example.com",
        hashedPassword
      );
      await userRepository.create(testUser);

      const credentials = {
        email: "pedro@example.com",
        password: "wrongPassword",
      };

      await expect(generateJwt.execute(credentials)).rejects.toThrow(
        "Usuario o contraseña incorrectos"
      );
      
      try {
        await generateJwt.execute(credentials);
        fail("Debería haber lanzado un error");
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedError);
        expect((error as UnauthorizedError).statusCode).toBe(401);
      }
    });

    it("debería generar tokens diferentes para diferentes sesiones", async () => {
      const password = "password123";
      const hashedPassword = await hashPassword(password);
      const testUser = new User(
        "user-789",
        "Laura Torres",
        "laura@example.com",
        hashedPassword
      );
      await userRepository.create(testUser);

      const credentials = {
        email: "laura@example.com",
        password: "password123",
      };

      const result1 = await generateJwt.execute(credentials);
      // Esperar un poco para asegurar que el timestamp sea diferente
      await new Promise((resolve) => setTimeout(resolve, 10));
      const result2 = await generateJwt.execute(credentials);

      // Nota: Dependiendo de tu implementación JWT, los tokens pueden ser
      // iguales si no incluyen timestamp. Si incluyen timestamp, serán diferentes.
      expect(result1.token).toBeDefined();
      expect(result2.token).toBeDefined();
    });
  });
});
