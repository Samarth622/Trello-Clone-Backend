import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { checkBoardAccess } from "../middlewares/checkBoardAccess.js";
import {
  createList,
  deleteList,
  getListsByBoard,
  updateList,
} from "../controllers/list.controller.js";

const router = express.Router();

router
  .post("/boards/:id/lists", authMiddleware, checkBoardAccess("member"), createList)
  .get(
    "/boards/:id/lists",
    authMiddleware,
    checkBoardAccess("member"),
    getListsByBoard
  );

router
  .put(
    "/:id/lists/:listId",
    authMiddleware,
    checkBoardAccess("member"),
    updateList
  )
  .delete(
    "/:id/lists/:listId",
    authMiddleware,
    checkBoardAccess("member"),
    deleteList
  );

export default router;
