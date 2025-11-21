import Board from "../models/board.model.js";
import { computeRecommendationsForBoard } from "../services/recs.service.js";

export const getBoardRecommendations = async (req, res) => {
  const boardId = req.params.boardId;

  try {
    const recs = await computeRecommendationsForBoard(boardId);

    return res.status(200).json({
      success: true,
      recommendations: recs,
    });
  } catch (err) {
    console.error("Recs error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
};
