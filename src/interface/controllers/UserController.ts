import { Request, Response, NextFunction } from "express";
import { RegisterUser } from "../../use-cases/user/RegisterUser";
export class UserController {
  constructor(private registerUser: RegisterUser) {}
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
}
