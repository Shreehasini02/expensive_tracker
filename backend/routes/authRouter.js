import express from "express";
import { register, login,getMe } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
// Public routes

router.post("/register", (req, res, next) => {
    console.log("REGISTER ROUTE HIT");
    next();
}, register);

router.post("/login", login);

// Protected route example
router.get('/me', protect,getMe);
export default router;