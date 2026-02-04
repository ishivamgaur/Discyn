import express from "express";
import {
  getTodos,
  createTodo,
  updateTodo,
  deleteTodo,
  getStats,
  getHistory,
  sendMail,
} from "../controllers/todoController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/todos").get(protect, getTodos).post(protect, createTodo);
router.route("/todos/stats").get(protect, getStats);
router.route("/todos/history").get(protect, getHistory);
router.route("/todos/:id").put(protect, updateTodo).delete(protect, deleteTodo);
router.route("/send-mail").post(protect, sendMail);

export default router;
