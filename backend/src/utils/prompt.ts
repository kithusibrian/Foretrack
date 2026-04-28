import { PaymentMethodEnum } from "../models/transaction.model";

export const receiptPrompt = `
You are a finance data extraction assistant.
Your job is to read a purchase receipt image and return ONE valid JSON object only.

Classify the transaction from what was purchased (line items), not from the merchant name alone.

Return this exact JSON shape:
{
  "title": "string",
  "amount": number,
  "date": "YYYY-MM-DD",
  "description": "string",
  "category": "string",
  "type": "EXPENSE or INCOME",
  "paymentMethod": "string"
}

Rules:
1. Infer transaction type from receipt context:
  - Use "EXPENSE" for purchase receipts (default behavior)
  - Use "INCOME" only for receipts that clearly indicate money received (refund payout, cashback payout, reimbursement, salary/payment received)
  - If unclear, default to "EXPENSE"
2. Amount must be the final total paid (positive number). Prefer grand total over subtotal.
3. Date must be valid in YYYY-MM-DD.
4. paymentMethod must be one of: ${Object.values(PaymentMethodEnum).join(", ")}. Use "OTHER" if unknown.
5. category must be one of these lowercase values only:
  - For EXPENSE: groceries, dining, transportation, utilities, entertainment, shopping, healthcare, travel, housing, other
  - For INCOME: income, investments, other
6. For EXPENSE, infer category from line items using these guidelines:
   - groceries: supermarket food, household consumables
   - dining: restaurant, cafe, takeaway meals, bar
   - transportation: fuel, taxi, ride-hailing, bus/train fare, parking
   - utilities: electricity, water, gas, internet, phone bill
   - entertainment: cinema, games, streaming, events
   - shopping: clothing, electronics, general retail goods
   - healthcare: pharmacy, clinic, hospital, medical supplies
   - travel: hotels, flights, travel bookings
   - housing: rent, home maintenance services
   - other: when none clearly match
  - Use evidence-based categorization from line items and receipt context.
  - Prioritize item-level evidence over merchant name. Merchant name is only a weak tie-breaker.
  - Choose the category with the strongest item evidence and largest spend share.
  - Category cues:
    - groceries: supermarket staples/household consumables (milk, eggs, bread, rice, vegetables, detergent)
    - dining: restaurant/cafe/takeaway meals, menu items, table/food service bills
    - transportation: fuel, fare, taxi, ride-hailing, bus/train tickets, parking, tolls
    - healthcare: pharmacy medicines, clinic/hospital services, prescriptions, lab tests
    - shopping: clothing, electronics, personal/retail goods
    - utilities: electricity, water, gas, internet, phone bills
    - travel: hotel stays, flights, booking charges, travel agency items
    - housing: rent, home maintenance, home service charges
    - entertainment: cinema, games, events, subscriptions
  - Do not overuse "groceries". Only select it when grocery/household item evidence is explicit.
  - If evidence is mixed, choose the dominant spend category; if still ambiguous, return "other".
7. For INCOME:
  - income: salary, wages, freelance payment, reimbursement, refund payout
  - investments: dividends, interest, capital gains, investment proceeds
  - other: when none clearly match
8. If multiple item groups exist, choose the category with the highest spend.
8. description should briefly summarize key items (max 30 words).
9. If the image is not a receipt or key fields are unreadable, return {}.
10. Output JSON only. No markdown, no code fences, no extra text.

Example valid response:
{
  "title": "Carrefour",
  "amount": 58.43,
  "date": "2025-05-08",
  "description": "Milk, eggs, bread, fruit",
  "category": "groceries",
  "paymentMethod": "CARD",
  "type": "EXPENSE"
}
`;

export const reportInsightPrompt = ({
  totalIncome,
  totalExpenses,
  availableBalance,
  savingsRate,
  categories,
  periodLabel,
}: {
  totalIncome: number;
  totalExpenses: number;
  availableBalance: number;
  savingsRate: number;
  categories: Record<string, { amount: number; percentage: number }>;
  periodLabel: string;
}) => {
  const categoryList = Object.entries(categories)
    .map(
      ([name, { amount, percentage }]) =>
        `- ${name}:KES ${amount.toLocaleString()} (${percentage}%)`,
    )
    .join("\n");

  console.log(categoryList, "category list");

  return `
  You are a friendly and smart financial coach, not a robot.

Your job is to give **exactly 3 good short insights** to the user based on their data that feel like you're talking to them directly.

Each insight should reflect the actual data and sound like something a smart money coach would say based on the data — short, clear, and practical.

🧾 Report for: ${periodLabel}
- Total Income: KES $${totalIncome.toFixed(2)}
- Total Expenses: KES $${totalExpenses.toFixed(2)}
- Available Balance: KES $${availableBalance.toFixed(2)}
- Savings Rate: ${savingsRate}%

Top Expense Categories:
${categoryList}

📌 Guidelines:
- Keep each insight to one short, realistic, personalized, natural sentence
- Use conversational language, correct wordings & Avoid sounding robotic, or generic
- Include specific data when helpful and comma to amount
- Be encouraging if user spent less than they earned
- Format your response **exactly** like this:

["Insight 1", "Insight 2", "Insight 3"]

✅ Example:
[
   "Nice! You kept KES 7,458 after expenses — that’s solid breathing room.",
   "You spent the most on 'Meals' this period — 32%. Maybe worth keeping an eye on.",
   "You stayed under budget this time. That's a win — keep the momentum"
]

⚠️ Output only a **JSON array of 3 strings**. Do not include any explanation, markdown, or notes.
  
  `.trim();
};

export const coachPrompt = ({
  question,
  stats,
}: {
  question: string;
  stats: any;
}) => {
  const summary = `Summary for the period:\n- Total Income: KES ${Number(
    stats.totalIncome || 0,
  ).toFixed(2)}\n- Total Expenses: KES ${Number(
    stats.totalExpenses || 0,
  ).toFixed(
    2,
  )}\n- Available Balance: KES ${Number(stats.availableBalance || 0).toFixed(2)}\n- Savings Rate: ${Number(
    stats.savingsRate || 0,
  ).toFixed(
    2,
  )}%\n- Total Transactions: ${stats.transactionCount || 0}\n\nTop categories:\n${Object.entries(
    stats.categories || {},
  )
    .map(
      ([k, v]: any) =>
        `- ${k}: KES ${Number(v.amount || 0).toFixed(2)} (${v.percentage}%)`,
    )
    .join("\n")}`;

  // Build weekly summary for quick reference
  const weeklySummary = stats.transactionsByWeek
    ? Object.entries(stats.transactionsByWeek)
        .slice(0, 8) // Last 8 weeks max
        .map(([weekKey, txs]: [string, any]) => {
          const weekExpenses = (txs || [])
            .filter((t: any) => t.type === "EXPENSE")
            .reduce((sum: number, t: any) => sum + (t.amount || 0), 0);
          const weekIncome = (txs || [])
            .filter((t: any) => t.type === "INCOME")
            .reduce((sum: number, t: any) => sum + (t.amount || 0), 0);
          return `Week of ${weekKey}: ${txs.length} transactions, KES ${weekExpenses.toFixed(2)} expenses, KES ${weekIncome.toFixed(2)} income`;
        })
        .join("\n")
    : "";

  // Build daily summary for today/yesterday if available
  const dailySummary = stats.transactionsByDay
    ? Object.entries(stats.transactionsByDay)
        .slice(0, 7) // Last 7 days
        .map(([dayKey, txs]: [string, any]) => {
          const dayExpenses = (txs || [])
            .filter((t: any) => t.type === "EXPENSE")
            .reduce((sum: number, t: any) => sum + (t.amount || 0), 0);
          return `${dayKey}: KES ${dayExpenses.toFixed(2)} in ${txs.length} transaction(s)`;
        })
        .join("\n")
    : "";

  const budgetSummary = stats.budgetSummary || {};
  const budgetPeriod = stats.budgetPeriod || {};
  const budgets = Array.isArray(stats.budgets) ? stats.budgets : [];

  const budgetSection = `Budget context (monthly):\n- Month: ${budgetPeriod.month || "n/a"}\n- Year: ${budgetPeriod.year || "n/a"}\n- Total Budget Limit: KES ${Number(budgetSummary.totalLimit || 0).toFixed(2)}\n- Total Budget Spent: KES ${Number(budgetSummary.totalSpent || 0).toFixed(2)}\n- Total Budget Remaining: KES ${Number(budgetSummary.totalRemaining || 0).toFixed(2)}\n- Budget Usage: ${Number(budgetSummary.usagePercentage || 0).toFixed(2)}%\n- Over-limit Categories: ${Number(budgetSummary.overLimitCount || 0)}\n- Near-limit Categories: ${Number(budgetSummary.nearLimitCount || 0)}\n\nCategory budgets:\n${
    budgets
      .map(
        (item: any) =>
          `- ${item.category}: limit KES ${Number(item.limitAmount || 0).toFixed(2)}, spent KES ${Number(item.spentAmount || 0).toFixed(2)}, remaining KES ${Number(item.remainingAmount || 0).toFixed(2)}, usage ${Number(item.usedPercentage || 0).toFixed(2)}%, status ${item.alertStatus || "ON_TRACK"}`,
      )
      .join("\\n") || "- No budgets configured for this month."
  }`;

  const recentTransactions = Array.isArray(stats.recentTransactions)
    ? stats.recentTransactions
    : [];

  const transactionSection = `Recent transactions (latest ${recentTransactions.length}):\n${
    recentTransactions
      .map(
        (item: any) =>
          `- ${item.date ? new Date(item.date).toISOString().slice(0, 10) : "n/a"} | ${item.type || "n/a"} | ${item.category || "n/a"} | KES ${Number(item.amount || 0).toFixed(2)} | ${item.title || "Untitled"}${item.description ? ` | ${item.description}` : ""}`,
      )
      .join("\\n") || "- No transactions found for this period."
  }`;

  return `You are a helpful, plain-language financial coach named Foretrack Coach.
Answer the user's question directly and concisely. Use at most 3 short paragraphs.
Do not include marketing or product explanations. Use the data summary below to ground your answer. 

IMPORTANT CAPABILITIES:
- For time-period questions (this week, last week, this month, etc.), use the weekly and daily summaries to answer accurately. Extract and summarize expense/income for that specific period.
- For "Can I afford this?" questions: provide a simple yes/no and one sentence justification using available balance and recent spending patterns.
- For budget questions: use the budget context, mention specific categories, limits, and remaining amounts.
- For transaction questions (recent purchases, spending by category, anomalies): use the recent transactions and full transaction list to provide specific examples.
- When user asks to "summarize expenses for [time period]", break down by category and provide top 3-5 spending areas in that period.

User question: "${question}"

Data Context:
${summary}

Weekly Transaction Summary:
${weeklySummary || "- No weekly data available"}

Daily Transaction Summary (Last 7 days):
${dailySummary || "- No daily data available"}

${budgetSection}

${transactionSection}

Instructions for analysis:
- Use specific numbers and categories from the data.
- For time-period summaries, group transactions by week or day as needed.
- If asked about a specific period (e.g., "this week"), calculate totals for that exact period.
- Be concise but informative. Always include concrete figures.

Keep the answer friendly, practical, and short. If suggesting actions, give one clear next step.
Respond in plain text only; do not include JSON, code fences, or extra commentary.`;
};
