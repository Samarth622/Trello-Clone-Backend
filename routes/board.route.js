import express from "express";
import {
  createBoard,
  deleteBoard,
  getBoardById,
  getBoards,
  updateBoard,
} from "../controllers/board.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { checkBoardAccess } from "../middlewares/checkBoardAccess.js";

const router = express.Router();

router
  .post("/boards", authMiddleware, createBoard)
  .get("/boards", authMiddleware, getBoards);

router.get(
  "/boards/:id",
  authMiddleware,
  checkBoardAccess("member"),
  getBoardById
);

router.put(
  "/updateBoard/:id",
  authMiddleware,
  checkBoardAccess("owner"),
  updateBoard
);

router.delete(
  "/deleteBoard/:id",
  authMiddleware,
  checkBoardAccess("owner"),
  deleteBoard
);

export default router;
