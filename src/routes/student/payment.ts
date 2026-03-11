import { Router } from "express";
import { errorHandler } from "../../error-handler";
import {
  createPayment,
  deletePayment,
  editPayment,
  getAllPayments,
} from "../../controllers/student/payment.cont";

const paymentRoutes: Router = Router();

paymentRoutes.post("/courses/:courseId", errorHandler(createPayment));
paymentRoutes.put("/:paymentId", errorHandler(editPayment));
paymentRoutes.delete("/:paymentId", errorHandler(deletePayment));
paymentRoutes.get("/", errorHandler(getAllPayments));

export default paymentRoutes;
