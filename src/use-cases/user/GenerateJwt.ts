import { User } from "../../domain/entities/User";
import { UserRepository } from "../../domain/interfaces/UserRepository";
import { UnauthorizedError } from "../../shared/errors/AppError";
import { comparePassword } from "../../shared/utils/comparePassword";
import { generateJwt } from "../../shared/utils/generateJwt";

export class GenerateJwt {
  constructor(private userRepository: UserRepository) {}

  async execute(credentials: {
    email: string;
    password: string;
  }): Promise<{ token: string; user: User }> {
    const user = await this.userRepository.findByEmail(credentials.email);
    if (!user) {
      throw new UnauthorizedError("Usuario o contraseña incorrectos");
    }

    const isPasswordValid = await comparePassword(
      credentials.password,
      user.password
    );

    if (!isPasswordValid) {
      throw new UnauthorizedError("Usuario o contraseña incorrectos");
    }

    const token = generateJwt({
      id: user.id,
      email: user.email,
    });

    return {
      token,
      user,
    };
  }
}
