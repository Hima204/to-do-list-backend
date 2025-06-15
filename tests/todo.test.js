const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../server");

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri(), {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await mongoose.connection.db.dropDatabase();
});
describe("POST /api/todos", () => {
  it("should create a new todo with default values", async () => {
    const response = await request(app)
      .post("/api/todos")
      .send({ title: "Test backend POST" })
      .expect(201);

    expect(response.body).toMatchObject({
      title: "Test backend POST",
      completed: false,
      pinned: false,
    });
    expect(response.body).toHaveProperty("_id");
  });

  it("should reject empty title", async () => {
    await request(app).post("/api/todos").send({ title: "" }).expect(500);
  });
});

describe("DELETE /api/todos/:id", () => {
  it("should delete an existing todo", async () => {
    // Create a todo first
    const createRes = await request(app)
      .post("/api/todos")
      .send({ title: "Todo to delete" });

    const todoId = createRes.body._id;

    // Delete the todo
    const deleteRes = await request(app)
      .delete(`/api/todos/${todoId}`)
      .expect(200);

    expect(deleteRes.body).toEqual({ message: "Todo deleted" });

    // Verify deletion
    const todosRes = await request(app).get("/api/todos");
    expect(todosRes.body.find((t) => t._id === todoId)).toBeUndefined();
  });

  it("should handle invalid id format", async () => {
    await request(app).delete("/api/todos/invalid_id").expect(500);
  });
});
