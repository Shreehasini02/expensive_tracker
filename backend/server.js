import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRouter from "./routes/authRouter.js";
import categoryRouter from "./routes/categoryRouter.js";
import transactionRouter from "./routes/transactionRouter.js";
import budgetRouter from "./routes/budgetRouter.js";
import dashboardRouter from "./routes/dashboardRouter.js";
import insightRouter from "./routes/insightRouter.js";


dotenv.config();

const app = express();

const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        message: "AI EXPENSE TRACKER API IS RUNNING"
    });
});
app.use("/api/auth",authRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/transactions",transactionRouter);
app.use("/api/budgets", budgetRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/insights", insightRouter);
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

