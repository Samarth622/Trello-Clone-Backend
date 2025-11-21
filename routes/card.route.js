import express from "express";
import {
  createCard,
  deleteCard,
  getCardsByBoard,
  moveCard,
  updateCard,
} from "../controllers/card.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { checkBoardAccess } from "../middlewares/checkBoardAccess.js";

const router = express.Router();

router.post(
  "/:id/:listId/cards",
  authMiddleware,
  checkBoardAccess("member"),
  createCard
);

router.get(
  "/:id/cards",
  authMiddleware,
  checkBoardAccess("member"),
  getCardsByBoard
);

router.put(
  "/:id/cards/:cardId",
  authMiddleware,
  checkBoardAccess("member"),
  updateCard
);

router.post(
  "/:id/cards/:cardId/move",
  authMiddleware,
  checkBoardAccess("member"),
  moveCard
);

router.delete(
  "/:id/cards/:cardId",
  authMiddleware,
  checkBoardAccess("member"),
  deleteCard
);

export default router;
