import axios from "axios";
import TransactionModel, {
  TransactionTypeEnum,
} from "../models/transaction.model";
import { BadRequestException, NotFoundException } from "../utils/app-error";
import { calculateNextOccurrence } from "../utils/helper";
import {
  CreateTransactionType,
  UpdateTransactionType,
} from "../validators/transaction.validator";
import { genAI, genAIModel } from "../config/google-ai.config";
import { createPartFromBase64, createUserContent } from "@google/genai";
import { receiptPrompt } from "../utils/prompt";

const normalizeCategory = (category: string) => category.trim().toLowerCase();

const allowedExpenseReceiptCategories = new Set([
  "groceries",
  "dining",
  "transportation",
  "utilities",
  "entertainment",
  "shopping",
  "healthcare",
  "travel",
  "housing",
  "other",
]);

const allowedIncomeReceiptCategories = new Set([
  "income",
  "investments",
  "other",
]);

const expenseCategoryKeywords: Record<string, string[]> = {
  groceries: [
    "milk",
    "bread",
    "eggs",
    "rice",
    "flour",
    "sugar",
    "vegetable",
    "fruit",
    "supermarket",
    "grocery",
    "foodstuff",
  ],
  dining: [
    "restaurant",
    "cafe",
    "coffee",
    "latte",
    "burger",
    "pizza",
    "meal",
    "takeaway",
    "bar",
  ],
  transportation: [
    "fuel",
    "petrol",
    "diesel",
    "uber",
    "bolt",
    "taxi",
    "bus",
    "train",
    "fare",
    "parking",
  ],
  utilities: [
    "electricity",
    "water",
    "internet",
    "wifi",
    "airtime",
    "mobile bill",
    "utility",
    "token",
  ],
  entertainment: [
    "cinema",
    "movie",
    "netflix",
    "showmax",
    "spotify",
    "game",
    "event",
    "concert",
  ],
  shopping: [
    "clothes",
    "shirt",
    "shoes",
    "electronics",
    "phone",
    "accessory",
    "retail",
  ],
  healthcare: [
    "pharmacy",
    "clinic",
    "hospital",
    "medicine",
    "drug",
    "consultation",
    "lab",
  ],
  travel: ["hotel", "flight", "airline", "booking", "airbnb", "trip"],
  housing: ["rent", "landlord", "apartment", "house", "maintenance"],
};

const groceryEvidenceKeywords = [
  "milk",
  "bread",
  "eggs",
  "rice",
  "flour",
  "sugar",
  "tomato",
  "onion",
  "vegetable",
  "fruit",
  "banana",
  "apple",
  "meat",
  "chicken",
  "fish",
  "detergent",
  "soap",
  "toilet paper",
  "cooking oil",
  "grocery",
  "supermarket",
];

const hasGroceryEvidence = (title?: string, description?: string) => {
  const context = [title, description].filter(Boolean).join(" ").toLowerCase();
  if (!context) return false;

  const hits = groceryEvidenceKeywords.reduce(
    (acc, keyword) => (context.includes(keyword) ? acc + 1 : acc),
    0,
  );

  // Require at least one clear grocery signal before accepting groceries.
  return hits >= 1;
};

const inferExpenseCategoryFromContext = (
  title?: string,
  description?: string,
) => {
  const context = [title, description].filter(Boolean).join(" ").toLowerCase();
  if (!context) return undefined;

  let bestCategory: string | undefined;
  let bestScore = 0;

  Object.entries(expenseCategoryKeywords).forEach(([category, keywords]) => {
    const score = keywords.reduce(
      (acc, keyword) => (context.includes(keyword) ? acc + 1 : acc),
      0,
    );

    if (score > bestScore) {
      bestScore = score;
      bestCategory = category;
    }
  });

  return bestScore > 0 ? bestCategory : undefined;
};

const normalizeReceiptType = (data: {
  type?: string;
  title?: string;
  description?: string;
  category?: string;
}) => {
  const rawType = data.type?.trim().toUpperCase();

  const receiptContext = [data.title, data.description, data.category]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const expenseHints = [
    "receipt",
    "invoice",
    "tax invoice",
    "subtotal",
    "total",
    "vat",
    "item",
    "qty",
    "cashier",
    "grocery",
    "supermarket",
    "restaurant",
    "dining",
    "fuel",
    "transport",
    "pharmacy",
    "bill",
    "purchase",
  ];

  const incomeHints = [
    "refund payout",
    "refund received",
    "reimbursement",
    "reimbursement received",
    "salary",
    "wage",
    "payroll",
    "payment received",
    "deposit received",
    "commission",
    "dividend",
    "interest",
    "credit note",
    "credit memo",
  ];

  const hasExpenseSignals = expenseHints.some((hint) =>
    receiptContext.includes(hint),
  );
  const hasIncomeSignals = incomeHints.some((hint) =>
    receiptContext.includes(hint),
  );

  if (hasExpenseSignals && !hasIncomeSignals) {
    return TransactionTypeEnum.EXPENSE;
  }

  if (hasIncomeSignals && !hasExpenseSignals) {
    return TransactionTypeEnum.INCOME;
  }

  // If both appear, this is usually a purchase receipt with a refund/credit line item.
  if (hasIncomeSignals && hasExpenseSignals) {
    return TransactionTypeEnum.EXPENSE;
  }

  if (rawType === TransactionTypeEnum.EXPENSE) {
    return TransactionTypeEnum.EXPENSE;
  }

  // Never default to income on ambiguous receipts.
  if (rawType === TransactionTypeEnum.INCOME) {
    return TransactionTypeEnum.EXPENSE;
  }

  // Receipt scans default to expense when intent is ambiguous.
  return TransactionTypeEnum.EXPENSE;
};

const normalizeReceiptCategory = (
  category: string | undefined,
  type: TransactionTypeEnum,
) => {
  if (!category)
    return type === TransactionTypeEnum.INCOME ? "income" : "other";

  const normalized = normalizeCategory(category);

  const expenseAliasMap: Record<string, string> = {
    food: "dining",
    restaurant: "dining",
    restaurants: "dining",
    transport: "transportation",
    transit: "transportation",
    fuel: "transportation",
    bills: "utilities",
    medical: "healthcare",
    health: "healthcare",
    rent: "housing",
  };

  const incomeAliasMap: Record<string, string> = {
    salary: "income",
    wages: "income",
    payroll: "income",
    freelance: "income",
    commission: "income",
    reimbursement: "income",
    refund: "income",
    cashback: "income",
    dividend: "investments",
    interest: "investments",
    investments: "investments",
    investment: "investments",
  };

  const aliasMap =
    type === TransactionTypeEnum.INCOME ? incomeAliasMap : expenseAliasMap;

  const mappedCategory = aliasMap[normalized] || normalized;

  if (type === TransactionTypeEnum.INCOME) {
    return allowedIncomeReceiptCategories.has(mappedCategory)
      ? mappedCategory
      : "income";
  }

  return allowedExpenseReceiptCategories.has(mappedCategory)
    ? mappedCategory
    : "other";
};

export const createTransactionService = async (
  body: CreateTransactionType,
  userId: string,
) => {
  let nextRecurringDate: Date | undefined;
  const currentDate = new Date();

  if (body.isRecurring && body.recurringInterval) {
    const calulatedDate = calculateNextOccurrence(
      body.date,
      body.recurringInterval,
    );

    nextRecurringDate =
      calulatedDate < currentDate
        ? calculateNextOccurrence(currentDate, body.recurringInterval)
        : calulatedDate;
  }

  const transaction = await TransactionModel.create({
    ...body,
    userId,
    category: normalizeCategory(body.category),
    amount: Number(body.amount),
    isRecurring: body.isRecurring || false,
    recurringInterval: body.recurringInterval || null,
    nextRecurringDate,
    lastProcessed: null,
  });

  return transaction;
};

// nimefika hapa so far

export const getAllTransactionService = async (
  userId: string,
  filters: {
    keyword?: string;
    type?: keyof typeof TransactionTypeEnum;
    recurringStatus?: "RECURRING" | "NON_RECURRING";
  },
  pagination: {
    pageSize: number;
    pageNumber: number;
  },
) => {
  const { keyword, type, recurringStatus } = filters;

  const filterConditions: Record<string, any> = {
    userId,
  };

  if (keyword) {
    filterConditions.$or = [
      { title: { $regex: keyword, $options: "i" } },
      { category: { $regex: keyword, $options: "i" } },
    ];
  }

  if (type) {
    filterConditions.type = type;
  }

  if (recurringStatus) {
    if (recurringStatus === "RECURRING") {
      filterConditions.isRecurring = true;
    } else if (recurringStatus === "NON_RECURRING") {
      filterConditions.isRecurring = false;
    }
  }

  const { pageSize, pageNumber } = pagination;
  const skip = (pageNumber - 1) * pageSize;

  const [transactions, totalCount] = await Promise.all([
    TransactionModel.find(filterConditions)
      .skip(skip)
      .limit(pageSize)
      .sort({ date: -1, createdAt: -1 }),
    TransactionModel.countDocuments(filterConditions),
  ]);

  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    transactions,
    pagination: {
      pageSize,
      pageNumber,
      totalCount,
      totalPages,
      skip,
    },
  };
};

// second time nimefika hapa

//working from here
export const getTransactionByIdService = async (
  userId: string,
  transactionId: string,
) => {
  const transaction = await TransactionModel.findOne({
    _id: transactionId,
    userId,
  });
  if (!transaction) throw new NotFoundException("Transaction not found");

  return transaction;
};

export const duplicateTransactionService = async (
  userId: string,
  transactionId: string,
) => {
  const transaction = await TransactionModel.findOne({
    _id: transactionId,
    userId,
  });
  if (!transaction) throw new NotFoundException("Transaction not found");

  const duplicated = await TransactionModel.create({
    ...transaction.toObject(),
    _id: undefined,
    date: new Date(),
    title: `Duplicate - ${transaction.title}`,
    description: transaction.description
      ? `${transaction.description} (Duplicate)`
      : "Duplicated transaction",
    isRecurring: false,
    recurringInterval: undefined,
    nextRecurringDate: undefined,
    createdAt: undefined,
    updatedAt: undefined,
  });

  return duplicated;
};

export const updateTransactionService = async (
  userId: string,
  transactionId: string,
  body: UpdateTransactionType,
) => {
  const existingTransaction = await TransactionModel.findOne({
    _id: transactionId,
    userId,
  });
  if (!existingTransaction)
    throw new NotFoundException("Transaction not found");

  const now = new Date();
  const isRecurring = body.isRecurring ?? existingTransaction.isRecurring;

  const date =
    body.date !== undefined ? new Date(body.date) : existingTransaction.date;

  const recurringInterval =
    body.recurringInterval || existingTransaction.recurringInterval;

  let nextRecurringDate: Date | undefined;

  if (isRecurring && recurringInterval) {
    const calulatedDate = calculateNextOccurrence(date, recurringInterval);

    nextRecurringDate =
      calulatedDate < now
        ? calculateNextOccurrence(now, recurringInterval)
        : calulatedDate;
  }

  existingTransaction.set({
    ...(body.title && { title: body.title }),
    ...(body.description && { description: body.description }),
    ...(body.category && { category: normalizeCategory(body.category) }),
    ...(body.type && { type: body.type }),
    ...(body.paymentMethod && { paymentMethod: body.paymentMethod }),
    ...(body.amount !== undefined && { amount: Number(body.amount) }),
    date,
    isRecurring,
    recurringInterval,
    nextRecurringDate,
  });

  await existingTransaction.save();

  return;
};

export const deleteTransactionService = async (
  userId: string,
  transactionId: string,
) => {
  const deleted = await TransactionModel.findByIdAndDelete({
    _id: transactionId,
    userId,
  });
  if (!deleted) throw new NotFoundException("Transaction not found");

  return;
};

export const bulkDeleteTransactionService = async (
  userId: string,
  transactionIds: string[],
) => {
  const result = await TransactionModel.deleteMany({
    _id: { $in: transactionIds },
    userId,
  });

  if (result.deletedCount === 0)
    throw new NotFoundException("No transations found");

  return {
    sucess: true,
    deletedCount: result.deletedCount,
  };
};

export const bulkTransactionService = async (
  userId: string,
  transactions: CreateTransactionType[],
) => {
  try {
    const bulkOps = transactions.map((tx) => ({
      insertOne: {
        document: {
          ...tx,
          userId,
          isRecurring: false,
          nextRecurringDate: null,
          recurringInterval: null,
          lastProcesses: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      },
    }));

    const result = await TransactionModel.bulkWrite(bulkOps, {
      ordered: true,
    });

    return {
      insertedCount: result.insertedCount,
      success: true,
    };
  } catch (error) {
    throw error;
  }
};
//implementing the scan receipt service using google gemini AI to extract data from receipt images. This will allow users to quickly add transactions by simply uploading a photo of their receipt. The AI will analyze the image and extract relevant information such as amount, date, merchant name, and category, making it easier for users to track their expenses without manual data entry.

export const scanReceiptService = async (
  file: Express.Multer.File | undefined,
) => {
  if (!file) throw new BadRequestException("No file uploaded");

  try {
    if (!file.path) throw new BadRequestException("failed to upload file");

    console.log(file.path);

    // Fetch the file
    const responseData = await axios.get(file.path, {
      responseType: "arraybuffer",
      timeout: 15000, // avoid hanging
    });
    const base64String = Buffer.from(responseData.data).toString("base64");

    if (!base64String) throw new BadRequestException("Could not process file");

    // Generate content with Gemini
    const result = await genAI.models.generateContent({
      model: genAIModel,
      contents: [
        createUserContent([
          receiptPrompt,
          createPartFromBase64(base64String, file.mimetype),
        ]),
      ],
      config: {
        temperature: 0,
        topP: 1,
        responseMimeType: "application/json",
      },
    });

    // Log Gemini response for debugging
    const response = result.text;
    console.log("RAW GEMINI RESPONSE:", response);

    // Clean response
    const cleanedText = response?.replace(/```(?:json)?\n?/g, "").trim();

    if (!cleanedText)
      return {
        error: "Could not read reciept  content",
      };

    // Parse JSON safely
    let data: any;
    try {
      data = JSON.parse(cleanedText);
    } catch (err) {
      console.error("JSON PARSE ERROR:", cleanedText);
      return { error: "Invalid AI response format" };
    }

    // Check required fields
    if (!data.amount || !data.date) {
      return { error: "Reciept missing required information" };
    }

    // Return structured receipt
    const normalizedType = normalizeReceiptType(data);
    let normalizedCategory = normalizeReceiptCategory(
      data.category,
      normalizedType,
    );

    if (normalizedType === TransactionTypeEnum.EXPENSE) {
      const inferredCategory = inferExpenseCategoryFromContext(
        data.title,
        data.description,
      );
      const groceryEvidence = hasGroceryEvidence(data.title, data.description);

      if (normalizedCategory === "groceries" && !groceryEvidence) {
        normalizedCategory = inferredCategory || "other";
      }

      // Prevent the model from defaulting to groceries when text points elsewhere.
      if (
        inferredCategory &&
        (normalizedCategory === "other" ||
          (normalizedCategory === "groceries" &&
            inferredCategory !== "groceries"))
      ) {
        normalizedCategory = inferredCategory;
      }
    }

    return {
      title: data.title || "Receipt",
      amount: data.amount,
      date: data.date,
      description: data.description,
      category: normalizedCategory,
      paymentMethod: data.paymentMethod,
      type: normalizedType,
      receiptUrl: file.path,
    };
  } catch (error: any) {
    console.error(
      "SCAN ERROR:",
      error?.response?.data || error?.message || error,
    );

    return { error: "Reciept scanning  service unavailable" };
  }
};
