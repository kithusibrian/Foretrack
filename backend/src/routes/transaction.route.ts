import { Router } from "express";
import {
  bulkDeleteTransactionController,
  //bulkTransactionController,
  createTransactionController,
  getAllTransactionController,
  getTransactionByIdController,
  deleteTransactionController,
  duplicateTransactionController,
  //scanReceiptController,
  updateTransactionController,
} from "../controllers/transaction.controller";
// import { upload } from "../config/cloudinary.config";

const transactionRoutes = Router();

transactionRoutes.post("/create", createTransactionController);

transactionRoutes.get("/all", getAllTransactionController);

transactionRoutes.get("/:id", getTransactionByIdController);
transactionRoutes.put("/duplicate/:id", duplicateTransactionController);
transactionRoutes.put("/update/:id", updateTransactionController);
transactionRoutes.delete("/delete/:id", deleteTransactionController);
transactionRoutes.delete("/bulk-delete", bulkDeleteTransactionController);

//nimefika hapa so far

/*
transactionRoutes.post(
  "/scan-receipt",
  upload.single("receipt"),
  scanReceiptController
);

transactionRoutes.post("/bulk-transaction", bulkTransactionController);









*/

export default transactionRoutes;
