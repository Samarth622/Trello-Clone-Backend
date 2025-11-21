import List from "../models/list.model.js";
import Card from "../models/card.model.js";

export const createCard = async (req, res) => {
  const listId = req.params.listId;
  const { title, description, dueDate, labels, priority } = req.body;

  try {
    if (!title || title.trim() === "") {
      return res.status(400).json({ message: "Card title is required" });
    }

    const list = await List.findById(listId);
    if (!list) {
      return res.status(404).json({ message: "List not found" });
    }

    if (list.board.toString() !== req.board._id.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    const lastCard = await Card.find({ list: listId })
      .sort({ position: -1 })
      .limit(1);

    const nextPosition = lastCard.length === 0 ? 1 : lastCard[0].position + 1;

    const card = await Card.create({
      title,
      description: description || "",
      board: list.board,
      list: listId,
      position: nextPosition,
      dueDate: dueDate || null,
      labels: labels || [],
      priority: priority || "medium",
      assignees: [],
    });

    return res.status(201).json({
      message: "Card created successfully",
      card,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server Error", error: error.message });
  }
};

export const getCardsByBoard = async (req, res) => {
  const board = req.board;

  try {
    const cards = await Card.find({ board: board._id }).sort({ list: 1, position: 1 });

    return res.status(200).json({ message: "Cards fetch successfully", cards });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const updateCard = async (req, res) => {
  const { cardId } = req.params;
  const { title, description, labels, priority, dueDate } = req.body;

  try {
    const card = await Card.findById(cardId);

    if (!card) {
      return res.status(404).json({ message: "Card not found" });
    }

    if (card.board.toString() !== req.board._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    if (title !== undefined) card.title = title;
    if (description !== undefined) card.description = description;
    if (labels !== undefined) card.labels = labels;
    if (priority !== undefined) card.priority = priority;
    if (dueDate !== undefined) card.dueDate = dueDate;

    await card.save();

    return res.status(200).json({
      message: "Card updated successfully",
      card,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const moveCard = async (req, res) => {
  const { cardId } = req.params;
  const { targetListId, newPosition } = req.body;

  try {

    if (newPosition === undefined || typeof newPosition !== "number") {
      return res.status(400).json({ message: "newPosition must be a number" });
    }

    const card = await Card.findById(cardId);

    if (!card) {
      return res.status(404).json({ message: "Card not found" });
    }

    if (card.board.toString() !== req.board._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const targetList = await List.findById(targetListId);

    if (!targetList) {
      return res.status(404).json({ message: "Target list not found" });
    }

    if (targetList.board.toString() !== req.board._id.toString()) {
      return res.status(403).json({ message: "You cannot move card to this list" });
    }

    await Card.updateMany(
      { list: targetListId, position: { $gte: newPosition } },
      { $inc: { position: 1 } }
    );

    card.list = targetListId;
    card.position = newPosition;
    await card.save();

    return res.status(200).json({
      message: "Card moved successfully",
      card,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const deleteCard = async (req, res) => {
  const { cardId } = req.params;

  try {
    const card = await Card.findById(cardId);

    if (!card) {
      return res.status(404).json({ message: "Card not found" });
    }

    if (card.board.toString() !== req.board._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await Card.findByIdAndDelete(cardId);

    return res.status(200).json({
      message: "Card deleted successfully",
      cardId,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};