import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { checkBoardAccess } from "../middlewares/checkBoardAccess.js";
import { getBoardRecommendations } from "../controllers/recs.controller.js";

const router = express.Router();

router.get(
  "/boards/:boardId/recommendations",
  authMiddleware,
  checkBoardAccess("member", "boardId"),
  getBoardRecommendations
);

export default router;
