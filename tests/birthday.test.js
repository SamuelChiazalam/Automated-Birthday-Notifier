// Integration and model tests for the Birthday Reminder application

const request = require("supertest");
const app = require("../server");
const User = require("../models/User");
const mongoose = require("mongoose");

// Test fixtures
const testUser = {
  username: "Test User",
  email: "test" + Date.now() + "@test.com",
  dateOfBirth: "2000-06-15",
};
let createdUserId = null;

// Test setup/teardown
beforeAll(async () => {
  if (mongoose.connection.readyState === 0)
    await mongoose.connect(process.env.MONGODB_URI);
}, 30000);
afterAll(async () => {
  if (createdUserId) await User.findByIdAndDelete(createdUserId);
  await User.deleteMany({ email: { $regex: "test.*@test.com" } });
  await mongoose.connection.close();
}, 30000);

describe("Birthday Reminder App Tests", () => {
  test("Home page returns 200 and contains title", async () => {
    const response = await request(app).get("/").expect(200);
    expect(response.text).toContain("Birthday Reminder");
  });

  test("Add a new birthday", async () => {
    const response = await request(app)
      .post("/add-birthday")
      .send(testUser)
      .expect(200);
    expect(response.text).toContain("Birthday Saved!");
    expect(response.text).toContain(testUser.username);

    const user = await User.findOne({ email: testUser.email });
    expect(user).toBeTruthy();
    createdUserId = user._id;
  }, 10000);

  test("Prevent duplicate email registration", async () => {
    const response = await request(app)
      .post("/add-birthday")
      .send(testUser)
      .expect(200);
    expect(response.text).toContain("already registered");
  });

  test("Retrieve all birthdays via API", async () => {
    const response = await request(app).get("/api/birthdays").expect(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.birthdays)).toBe(true);
  });

  test("Retrieve today's birthdays via API", async () => {
    const response = await request(app).get("/api/birthdays/today").expect(200);
    expect(response.body.success).toBe(true);
    expect(typeof response.body.count).toBe("number");
  });
});

describe("User Model Tests", () => {
  test("isBirthdayToday returns true for matching date", () => {
    const today = new Date();
    const user = new User({
      username: "Birthday Person",
      email: "birthday@test.com",
      dateOfBirth: new Date(2000, today.getMonth(), today.getDate()),
    });
    expect(user.isBirthdayToday()).toBe(true);
  });

  test("getFormattedBirthday returns expected format", () => {
    const user = new User({
      username: "Test",
      email: "test@test.com",
      dateOfBirth: new Date(2000, 5, 15),
    });
    expect(user.getFormattedBirthday()).toBe("June 15");
  });
});
