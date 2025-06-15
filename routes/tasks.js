const express = require("express");
const router = express.Router();
const Todo = require("../models/Todo");

// GET /tasks - Fetch all tasks
router.get("/", async (req, res) => {
  try {
    const tasks = await Todo.find().sort({ pinned: -1, createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

// POST /tasks - Create a new task
router.post("/", async (req, res) => {
  const { title } = req.body;
  const newTask = new Todo({ title });
  try {
    const savedTask = await newTask.save();
    res.status(201).json(savedTask);
  } catch (err) {
    res.status(500).json({ error: "Failed to add task" });
  }
});

// DELETE /tasks/:id - Delete a task
router.delete("/:id", async (req, res) => {
  try {
    await Todo.findByIdAndDelete(req.params.id);
    res.json({ message: "Task deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete task" });
  }
});

module.exports = router;
