import express from "express";
import { registerAdmin, login } from "../controllers/userController.js";

const router = express.Router();

// Register Admin (only for first time use, otherwise block)
router.post("/register", registerAdmin);

// Login
router.post("/login", login);

export default router;
