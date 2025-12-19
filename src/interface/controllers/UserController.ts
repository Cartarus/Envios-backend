import { Request, Response, NextFunction } from "express";
import { RegisterUser } from "../../use-cases/user/RegisterUser";
import { GenerateJwt } from "../../use-cases/user/GenerateJwt";

export class UserController {
  constructor(private registerUser: RegisterUser, private generateJWT: GenerateJwt) {}
  async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const {name,email,password} = req.body;
      const user = await this.registerUser.execute({name,email,password});
      const userWithoutPassword = {
        id: user.id,
        name: user.name,
        email: user.email
      };
      res.status(201).json({ success: true, user: userWithoutPassword });
    } catch (error) {
      next(error);
    }
  }

  async loginUser(req: Request, res: Response, next: NextFunction) {
    try {
      const {email,password} = req.body;
      const jwtGenerated = await this.generateJWT.execute({email,password});
      const userWithoutPassword = {
        id: jwtGenerated.user.id,
        name: jwtGenerated.user.name,
        email: jwtGenerated.user.email
      };
      res.status(200).json({ success: true, user: userWithoutPassword, token: jwtGenerated.token });
    } catch (error) {
      next(error);
    }
  }
}
