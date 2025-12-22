import { User } from "../../domain/entities/User.js";
import { UserRepository } from "../../domain/interfaces/UserRepository.js";
import { generateId, hashPassword } from "../../shared/utils/index.js";
import { ConflictError } from "../../shared/errors/AppError";

export class RegisterUser {
  constructor(private userRepository: UserRepository) {}

  async execute(userData: {
    name: string;
    email: string;
    password: string;
  }): Promise<User> {
    // Validar que el email no exista
    const existingUser = await this.userRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new ConflictError("El email ya está registrado");
    }

    const user = new User(
      generateId(),
      userData.name,
      userData.email,
      await hashPassword(userData.password)
    );

    await this.userRepository.create(user);
    return user;
  }
}