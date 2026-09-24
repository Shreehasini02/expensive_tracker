import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY,
});

if (!process.env.GOOGLE_API_KEY) {
  console.error(
    "GOOGLE_API_KEY is not set in the environment variables."
  );
}

// Remove markdown code blocks from Gemini JSON response
const stripMarkdown = (text) => {
  let cleaned = text.trim();

  if (cleaned.startsWith("```json")) {
    cleaned = cleaned
      .replace(/^```json\s*/, "")
      .replace(/```\s*$/, "");
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned
      .replace(/^```\s*/, "")
      .replace(/```\s*$/, "");
  }

  return cleaned.trim();
};

// Generate monthly financial insight
export const generateMonthlyInsight = async ({
  totalIncome,
  totalExpenses,
  savingsRate,
  expenseBreakdown,
  previousMonths,
  currency = "USD",
}) => {
  const breakdownText =
    expenseBreakdown.length > 0
      ? expenseBreakdown
          .map(
            (c) =>
              `${c.category}: ${currency} ${Number(c.amount).toFixed(2)}`
          )
          .join("\n")
      : "- No expenses recorded yet";

  const trendText =
    previousMonths.length > 0
      ? previousMonths
          .map(
            (m) =>
              `${m.month}: Income ${currency} ${Number(
                m.income
              ).toFixed(2)}, Expenses ${currency} ${Number(
                m.expenses
              ).toFixed(2)}`
          )
          .join("\n")
      : "- No previous month data available";

  const prompt = `Analyze this user's monthly financial data and generate actionable insights.

Currency: ${currency}

Total Income (this month): ${currency} ${Number(totalIncome).toFixed(2)}

Total Expenses (this month): ${currency} ${Number(totalExpenses).toFixed(2)}

Savings Rate: ${Number(savingsRate).toFixed(1)}%

Expense breakdown by category (this month):
${breakdownText}

Previous months trend:
${trendText}

Return ONLY valid JSON (no markdown, no commentary) in this exact structure:

{
  "summary": "2-3 sentence summary of the user's financial health this month",
  "highlights": [
    "Positive observation 1",
    "Positive observation 2"
  ],
  "concerns": [
    "Concern 1",
    "Concern 2"
  ],
  "recommendations": [
    {
      "title": "Short title",
      "detail": "Actionable suggestion (1-2 sentences)"
    }
  ],
  "topSpendingCategory": "Category name or null",
  "estimatedMonthlySavings": 0,
  "healthScore": 0
}

Constraints:
- healthScore must be an integer between 0 and 100.
- Provide exactly 3 recommendations.
- Reference actual numbers from the data.
- Do not invent data.
- Tone: friendly but honest.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const cleaned = stripMarkdown(response.text);

    return JSON.parse(cleaned);
  } catch (error) {
    console.error("Gemini API error (monthly insight):", error);

    throw new Error(
      "Failed to generate monthly insight. Please try again."
    );
  }
};

// Generate budget alert
export const generateBudgetAlert = async ({
  categoryName,
  budgetAmount,
  spentAmount,
  daysIntoPeriod,
  totalPeriodDays,
  currency = "USD",
}) => {
  const budget = Number(budgetAmount);
  const spent = Number(spentAmount);

  const percentUsed =
    budget > 0 ? ((spent / budget) * 100).toFixed(1) : "0.0";

  const daysLeft = totalPeriodDays - daysIntoPeriod;

  const prompt = `A user is tracking a budget. Generate a helpful alert.

Category: ${categoryName}

Budget: ${currency} ${budget.toFixed(2)}

Spent so far: ${currency} ${spent.toFixed(2)} (${percentUsed}% used)

Days into period: ${daysIntoPeriod} of ${totalPeriodDays}

Days remaining: ${daysLeft}

Return ONLY valid JSON (no markdown):

{
  "severity": "info|warning|critical",
  "title": "Short alert title",
  "message": "1-2 sentence empathetic message referencing actual numbers",
  "suggestions": [
    "Specific action 1",
    "Specific action 2",
    "Specific action 3"
  ]
}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const cleaned = stripMarkdown(response.text);

    return JSON.parse(cleaned);
  } catch (error) {
    console.error("Gemini API error (budget alert):", error);

    throw new Error(
      "Failed to generate budget alert. Please try again."
    );
  }
};

// Generate savings tips
export const generateSavingsTips = async ({
  topCategories,
  monthlyIncome,
  currency = "USD",
}) => {
  const categoryText =
    topCategories.length > 0
      ? topCategories
          .map(
            (c) =>
              `${c.category}: ${currency} ${Number(c.amount).toFixed(
                2
              )} across ${c.transactionCount} transactions`
          )
          .join("\n")
      : "- No spending data available";

  const prompt = `Generate personalized savings tips for a user.

Monthly Income (last 30 days):
${currency} ${Number(monthlyIncome).toFixed(2)}

Top spending categories (last 30 days):
${categoryText}

Return ONLY valid JSON (no markdown):

{
  "overallTip": "Top-level 1-sentence advice",
  "tips": [
    {
      "category": "Category this targets",
      "title": "Short tip title",
      "detail": "1-2 sentence actionable suggestion",
      "estimatedSavings": 0
    }
  ]
}

Constraints:
- Provide exactly 4 tips.
- Each tip must reference an actual category from the data.
- Do not invent spending categories.
- Include a realistic monthly savings estimate.
- Reference actual numbers when useful.
- Tone: friendly, practical, and encouraging.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const cleaned = stripMarkdown(response.text);

    return JSON.parse(cleaned);
  } catch (error) {
    console.error("Gemini API error (savings tips):", error);

    throw new Error(
      "Failed to generate savings tips. Please try again."
    );
  }
};

// Analyze transactions
export const analyzeTransactionList = async ({
  transactions,
  currency = "USD",
}) => {
  const formatDate = (date) => {
    if (!date) return "";

    if (date instanceof Date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");

      return `${year}-${month}-${day}`;
    }

    return String(date).split("T")[0];
  };

  const lines = transactions
    .slice(0, 50)
    .map((transaction) => {
      const date = formatDate(transaction.transaction_date);

      const amount = Number(transaction.amount).toFixed(2);

      const category =
        transaction.category_name || "uncategorized";

      const description =
        transaction.description ||
        `${transaction.type} ${currency} ${amount}`;

      return `${date}: ${transaction.type} ${currency} ${amount} | ${category} | ${description}`;
    })
    .join("\n");

  const prompt = `Analyze these ${transactions.length} transactions and provide a concise, helpful spending analysis.

Currency: ${currency}

Transactions:
${lines}

Return ONLY valid JSON (no markdown):

{
  "summary": "2-3 sentence summary of spending behavior",
  "highlights": [
    "Positive observation 1",
    "Positive observation 2"
  ],
  "concerns": [
    "Potential concern 1",
    "Potential concern 2"
  ],
  "recommendations": [
    "Actionable recommendation 1",
    "Actionable recommendation 2",
    "Actionable recommendation 3"
  ],
  "topSpendingCategory": "Category name or null",
  "totalIncome": 0,
  "totalExpenses": 0,
  "netAmount": 0
}

Constraints:
- Reference actual numbers from the transactions.
- Do not invent transactions or categories.
- totalIncome must be the total of income transactions.
- totalExpenses must be the total of expense transactions.
- netAmount must equal totalIncome - totalExpenses.
- Keep the analysis concise and practical.
- Tone: friendly but honest.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const cleaned = stripMarkdown(response.text);

    return JSON.parse(cleaned);
  } catch (error) {
    console.error(
      "Gemini API error (transaction analysis):",
      error
    );

    throw new Error(
      "Failed to analyze transactions. Please try again."
    );
  }
};

// Analyze budgets
export const analyzeBudgets = async ({
  budgets,
  currency = "USD",
}) => {
  const lines = budgets
    .map((budget) => {
      const spent = Number(budget.spent);
      const total = Number(budget.amount);

      const percentUsed =
        total > 0
          ? ((spent / total) * 100).toFixed(1)
          : "0.0";

      return `Budget ID ${budget.id}: Category: ${
        budget.category_name || "Uncategorized"
      } | Limit: ${currency} ${total.toFixed(
        2
      )} | Spent: ${currency} ${spent.toFixed(
        2
      )} | Used: ${percentUsed}%`;
    })
    .join("\n");

  const prompt = `You're a personal finance assistant. Analyze each budget below and provide a one-sentence assessment.

Today: ${new Date().toISOString().split("T")[0]}

Budgets:
${lines}

For each budget, return:
- status: "good" (well-paced, under target)
- status: "caution" (approaching limit or above 70%)
- status: "concerning" (over budget)
- message: A specific, friendly 1-sentence assessment with actual numbers

Return ONLY valid JSON (no markdown):

{
  "analyses": [
    {
      "budgetId": 0,
      "status": "good|caution|concerning",
      "message": "string"
    }
  ]
}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const cleaned = stripMarkdown(response.text);

    return JSON.parse(cleaned);
  } catch (error) {
    console.error(
      "Gemini API error (budget analysis):",
      error
    );

    throw new Error(
      "Failed to analyze budgets. Please try again."
    );
  }
};

// Default export
export default {
  generateMonthlyInsight,
  generateBudgetAlert,
  generateSavingsTips,
  analyzeTransactionList,
  analyzeBudgets,
};