import express from "express";

import {
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
} from "../controllers/budgetController.js";

import {protect} from "../middleware/authMiddleware.js";

const router = express.Router();
router.use(protect);

// Authentication middleware


// Get all budgets
router.get("/", getBudgets);

// Create budget
router.post("/", createBudget);

// Update budget
router.put("/:id", updateBudget);

// Delete budget
router.delete("/:id", deleteBudget);

export default router;