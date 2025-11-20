import Board from "../models/board.model.js";

export const createBoard = async (req, res) => {
  try {
    const { title, description, isPrivate } = req.body;
    const ownerId = req.user.id;

    const newBoard = await Board.create({
      title,
      description,
      isPrivate,
      owner: ownerId,
      members: [{ user: ownerId, role: "owner" }],
    });

    return res.status(201).json({
      message: "Board created successfully",
      board: newBoard,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server Error", error: error.message });
  }
};

export const getBoards = async (req, res) => {
  const userId = req.user.id;

  try {
    const boards = await Board.find({
      $or: [{ owner: userId }, { "members.user": userId }],
    })
      .select("title description owner members createdAt")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      boards,
      count: boards.length,
      message: "Boards fetched successfully",
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server Error", error: error.message });
  }
};

export const getBoardById = async (req, res) => {
  const boardId = req.params.id;
  const userId = req.user.id;

  try {
    const board = await Board.findOne({
      _id: boardId,
      $or: [{ owner: userId }, { "members.user": userId }],
    }).select("title description owner members createdAt");

    if (!board) {
      return res
        .status(404)
        .json({ message: "Board not found or access denied" });
    }

    return res.status(200).json({
      board,
      message: "Board fetched successfully",
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server Error", error: error.message });
  }
};

export const updateBoard = async (req, res) => {
  const boardId = req.params.id;
  const userId = req.user.id;
  const { title, description, isPrivate } = req.body;

  try {
    const board = await Board.findOneAndUpdate(
      { _id: boardId, owner: userId },
      { title, description, isPrivate },
      { new: true }
    ).select("title description owner members createdAt");

    if (!board) {
      return res
        .status(404)
        .json({ message: "Board not found or access denied" });
    }

    return res.status(200).json({
      board,
      message: "Board updated successfully",
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server Error", error: error.message });
  }
};

export const deleteBoard = async (req, res) => {
  const boardId = req.params.id;
  const userId = req.user.id;

  try {
    const board = await Board.findOneAndDelete({ _id: boardId, owner: userId });

    if (!board) {
      return res
        .status(404)
        .json({ message: "Board not found or access denied" });
    }

    return res.status(200).json({
      message: "Board deleted successfully",
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server Error", error: error.message });
  }
};
