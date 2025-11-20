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
  .post("/list/:id", authMiddleware, checkBoardAccess("member"), createList)
  .get(
    "/lists/:id",
    authMiddleware,
    checkBoardAccess("member"),
    getListsByBoard
  );

router
  .put(
    "/list/:id/:listId",
    authMiddleware,
    checkBoardAccess("member"),
    updateList
  )
  .delete(
    "/list/:id/:listId",
    authMiddleware,
    checkBoardAccess("member"),
    deleteList
  );

export default router;
