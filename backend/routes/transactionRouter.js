import express from "express";

import {
  getTransactions,
  createTransaction,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  analyzeTransactions,
} from "../controllers/transactionController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Protect all transaction routes
router.use(protect);

// Get all transactions
router.get("/", getTransactions);

// Create transaction
router.post("/", createTransaction);

// Analyze transactions
router.post("/analyze", analyzeTransactions);

// Get transaction by ID
router.get("/:id", getTransactionById);

// Update transaction
router.put("/:id", updateTransaction);

// Delete transaction
router.delete("/:id", deleteTransaction);

export default router;