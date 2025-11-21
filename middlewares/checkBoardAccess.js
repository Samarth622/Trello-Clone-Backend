import mongoose from "mongoose";
import Board from "../models/board.model.js";

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

export const checkBoardAccess = (requiredRole = "member", paramName = "id") => {
  return async (req, res, next) => {
    const boardId = req.params[paramName];
    const userId = req.user?.id;

    if (!boardId || !isValidObjectId(boardId)) {
      return res.status(400).json({ message: "Invalid board ID" });
    }

    try {
      const board = await Board.findById(boardId).select("owner members title");

      if (!board) {
        return res.status(404).json({ message: "Board not found" });
      }

      const member = board.members.find((m) => m.user.toString() === userId);
      const isOwner = board.owner.toString() === userId;

      if (!isOwner && !member) {
        return res.status(403).json({ message: "Access denied" });
      }

      if (requiredRole === "owner" && !isOwner) {
        return res.status(403).json({ message: "Owner access required" });
      }

      req.board = board;
      next();
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Server Error", error: error.message });
    }
  };
};
