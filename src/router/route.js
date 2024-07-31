import express from 'express'
import AuthController from '../controller/auth.controller.js';
const router = express.Router();
// auth
router.get("/user/getAll", AuthController.getAll);
router.get("/user/getOne/:uuid", AuthController.getOne);
router.post("/user/register", AuthController.register);
router.post("/user/login", AuthController.login);




export default router