const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../server");

const TEST_DB_NAME = "todos_test";

beforeAll(async () => {
  // Load environment variables
  require("dotenv").config();

  // Create test database URI from your Atlas connection string
  const atlasUri = process.env.MONGO_URI;
  const testUri = atlasUri.replace("/todos?", `/${TEST_DB_NAME}?`);

  await mongoose.connect(testUri);
});

afterAll(async () => {
  await mongoose.disconnect();
});

afterEach(async () => {
  // Clean up test data after each test
  if (mongoose.connection.readyState === 1 && mongoose.connection.db) {
    await mongoose.connection.db.dropDatabase();
  }
});

describe("POST /tasks", () => {
  it("should create a new task", async () => {
    const newTask = { title: "Test task creation" };
    const response = await request(app)
      .post("/tasks")
      .set("Content-Type", "application/json")
      .send(newTask)
      .expect(201);

    expect(response.body).toHaveProperty("title", "Test task creation");
    expect(response.body).toHaveProperty("_id");
  });
});

describe("DELETE /tasks/:id", () => {
  it("should delete the specified task", async () => {
    // First, create a task to delete
    const createRes = await request(app)
      .post("/tasks")
      .send({ title: "Task to delete" });

    const taskId = createRes.body._id;

    // Delete the task
    const deleteRes = await request(app).delete(`/tasks/${taskId}`).expect(200);

    expect(deleteRes.body.message || deleteRes.body).toMatch(/deleted/i);
  });
});
