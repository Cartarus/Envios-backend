import { Router } from "express";
import { PostgresUserRepository } from "../../infrastructure/repositories/PostgresUserRepository";
import { RegisterUser } from "../../use-cases/user/RegisterUser";
import { UserController } from "../controllers/UserController";
import { registerUserSchema } from "../../validators/userValidators";
import { validateSchema } from "../middlewares/validateSchema";
import { GenerateJwt } from "../../use-cases/user/GenerateJwt";

const router = Router();

const userRepository = new PostgresUserRepository();

const registerUser = new RegisterUser(userRepository);
const generateJwt = new GenerateJwt(userRepository);

const userController = new UserController(registerUser, generateJwt);

router.post("/register",validateSchema(registerUserSchema), async (req, res, next) => 
  userController.createUser(req, res, next)
);
  

router.post("/login", async (req, res, next) => 
  userController.loginUser(req, res, next)
);

export {router as userRoutes};