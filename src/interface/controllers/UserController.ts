import { Request, Response } from "express";
import { RegisterUser } from "../../use-cases/user/RegisterUser";
export class UserController {
  constructor(private registerUser: RegisterUser) {}
  async createUser(req: Request, res: Response) {
    const {name,email,password} = req.body;
    const user = await this.registerUser.execute({name,email,password});
    const userWithoutPassword = {
      id: user.id,
      name: user.name,
      email: user.email
    };
    res.json({ success: true, user: userWithoutPassword });
  }
}
