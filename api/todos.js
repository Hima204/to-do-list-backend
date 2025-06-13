const connectDB = require("../lib/db");
const Todo = require("../models/Todo");

module.exports = async (req, res) => {
  await connectDB();

  const { method, query, body } = req;

  try {
    if (method === "GET") {
      const todos = await Todo.find().sort({ pinned: -1, createdAt: -1 });
      return res.status(200).json(todos);
    }

    if (method === "POST") {
      const { title } = body;
      const newTodo = new Todo({ title });
      const savedTodo = await newTodo.save();
      return res.status(201).json(savedTodo);
    }

    if (method === "PUT") {
      const { id } = query;
      const updated = await Todo.findByIdAndUpdate(id, body, { new: true });
      return res.status(200).json(updated);
    }

    if (method === "DELETE") {
      const { id } = query;
      await Todo.findByIdAndDelete(id);
      return res.status(200).json({ message: "Todo deleted" });
    }

    return res.status(405).json({ error: "Method Not Allowed" });
  } catch (err) {
    console.error("API Error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
