import { Router } from "express";
import { PostgresUserRepository } from "../../infrastructure/repositories/PostgresUserRepository";
import { RegisterUser } from "../../use-cases/user/RegisterUser";
import { UserController } from "../controllers/UserController";

const router = Router();

const userRepository = new PostgresUserRepository();
const registerUser = new RegisterUser(userRepository);
const userController = new UserController(registerUser);

router.post("/users", async (req, res) => userController.createUser(req, res));

export {router as userRoutes};