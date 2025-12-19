import { Router } from "express";
import { PostgresUserRepository } from "../../infrastructure/repositories/PostgresUserRepository";
import { RegisterUser } from "../../use-cases/user/RegisterUser";
import { UserController } from "../controllers/UserController";
import { registerUserSchema } from "../../validators/userValidators";
import { validateSchema } from "../middlewares/validateSchema";

const router = Router();

const userRepository = new PostgresUserRepository();
const registerUser = new RegisterUser(userRepository);
const userController = new UserController(registerUser);

router.post("/users",validateSchema(registerUserSchema), async (req, res, next) => 
  userController.createUser(req, res, next)
);

export {router as userRoutes};