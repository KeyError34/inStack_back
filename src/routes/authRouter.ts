import AuthController from "../controllers/authController";
import { Router } from "express";
const router: Router = Router()
const authController = new AuthController()
router.post('/register', authController.register)

export default router