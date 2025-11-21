import List from "../models/list.model.js";
import Card from "../models/card.model.js";

export const createList = async (req, res) => {
  const board = req.board;
  const { title } = req.body;

  try {
    if (!title || title.trim() === "") {
      return res.status(400).json({ message: "List title is required" });
    }

    const lastList = await List.find({ board: board._id })
      .sort({ position: -1 })
      .limit(1)
      .select("position");

    const nextPosition =
      lastList.length === 0 ? 1 : lastList[0].position + 1;

    const newList = await List.create({
      title,
      board: board._id,
      position: nextPosition,
    });

    return res.status(201).json({
      message: "List created successfully",
      list: newList,
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error });
  }
};

export const getListsByBoard = async (req, res) => {
  const board = req.board;

  try {
    const lists = await List.find({ board: board._id }).sort({ position: 1 });

    return res.status(200).json({
      message: "Lists fetched successfully",
      lists,
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error });
  }
};

export const updateList = async (req, res) => {
  const board = req.board;
  const listId = req.params.listId;
  const { title, position } = req.body;

  try {
    const list = await List.findById(listId);

    if (!list) {
      return res.status(404).json({ message: "List not found" });
    }

    if (list.board.toString() !== board._id.toString()) {
      return res.status(403).json({ message: "You cannot update this list" });
    }

    if (title !== undefined) {
      if (title.trim() === "") {
        return res.status(400).json({ message: "List title cannot be empty" });
      }
      list.title = title;
    }

    if (position !== undefined) {
      list.position = position;
    }

    await list.save();

    return res.status(200).json({
      message: "List updated successfully",
      list,
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error });
  }
};

export const deleteList = async (req, res) => {
  const board = req.board;
  const listId = req.params.listId;

  try {
    const list = await List.findById(listId);

    if (!list) {
      return res.status(404).json({ message: "List not found" });
    }

    if (list.board.toString() !== board._id.toString()) {
      return res.status(403).json({ message: "You cannot delete this list" });
    }

    await Card.deleteMany({ list: list._id });

    await List.findByIdAndDelete(list._id);

    return res.status(200).json({ message: "List deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error });
  }
};
